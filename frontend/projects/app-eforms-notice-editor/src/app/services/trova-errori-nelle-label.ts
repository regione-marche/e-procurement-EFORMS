import { inject, Injectable } from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { forkJoin, mergeMap, tap } from 'rxjs';
import { NoticeTypesDTO, ResponseResult } from '../models/api.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class trovaErroriNelleLabel {
  private traduzioni: Array<string>;
  private everyNotice: Array<string>;
  private everyBuggedNotice: Array<string>;
  private sdkVersion: string;
  private language: string;

  private _apiService: ApiService = inject(ApiService);

  caricaTraduzioni(sdkVersion, selectedLang) {
    return this._apiService.loadTranslations(sdkVersion, selectedLang);
  }

  elaboraTraduzioni = (response: ResponseResult<IDictionary<any>>) => {
    let data: IDictionary<any> = response.data;
    this.traduzioni = Array.from(Object.keys(data));
  };

  prendiTutteLeNotice(sdkVersion) {
    return this._apiService.loadNoticeTypes(sdkVersion);
  }

  elaboraNotice = (response: ResponseResult<NoticeTypesDTO>) => {
    this.everyNotice = response.data.noticeTypes;
  };

  prendiTutteLeSingoleNotice(sdkVersion) {
    return forkJoin(
      this.everyNotice.map((noticeCode) =>
        this._apiService.loadSingleNoticeType(sdkVersion, noticeCode)
      )
    );
  }

  elaboraTutteLeSingoleNotice = (response: any) => {
    this.everyNotice = [];

    const extractLabels = (node) => {
      if (node && typeof node === 'object') {
        if (node._label) {
          this.everyNotice.push(node._label);
        }

        Object.keys(node).forEach((key) => {
          extractLabels(node[key]);
        });
      }
    };

    response.forEach((value) => {
      extractLabels(value.data.content);
      extractLabels(value.data.metadata);
    });
    this.trovaLeNonCorrispondenze();
    this.rimuoviDoppioni();
  };

  trovaLeNonCorrispondenze() {
    this.everyBuggedNotice = this.everyNotice.filter((value) => {
      return !this.getLabel(value);
    });
  }

  getLabel(labelId: string): boolean {
    // var applicationLabels = I18N.labels[this.language];

    // if (applicationLabels[labelId]) {
    //   return applicationLabels[labelId].includes('|');
    // }

    for (let i = 0; i < this.traduzioni.length; i++) {
      if (this.traduzioni[i] == labelId) {
        return true;
      }
    }
  }

  rimuoviDoppioni() {
    this.everyBuggedNotice = Array.from(new Set(this.everyBuggedNotice));
    console.warn(
      'tutte le label senza traduzione, per tutte le diverse notice, per la versione di sdk: ' +
        this.sdkVersion +
        ' e in lingua: ' +
        this.language +
        ' sono ' +
        this.everyBuggedNotice.length +
        ', ovvero ' +
        this.everyBuggedNotice
    );
  }

  findAllBuggedTitles(sdkVersion: string, language: string) {
    this.sdkVersion = sdkVersion;
    this.language = language;
    this.caricaTraduzioni(this.sdkVersion, this.language)
      .pipe(
        tap(this.elaboraTraduzioni),
        mergeMap(() => this.prendiTutteLeNotice(this.sdkVersion)),
        tap(this.elaboraNotice),
        mergeMap(() => this.prendiTutteLeSingoleNotice(this.sdkVersion)),
        tap(this.elaboraTutteLeSingoleNotice)
      )
      .subscribe();
  }
}
