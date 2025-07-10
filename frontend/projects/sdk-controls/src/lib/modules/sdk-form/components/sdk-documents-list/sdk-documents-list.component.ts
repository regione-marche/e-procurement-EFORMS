import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { SdkBase64Helper } from '@maggioli/sdk-commons';
import { isEmpty, isFunction, isObject, join, remove, toString } from 'lodash-es';

import { SdkDialogConfig } from '@maggioli/sdk-controls';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  SdkDocumentItem,
  SdkDocumentsListConfig,
  SdkDocumentsListInput,
  SdkDocumentsListOutput,
} from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';
import { SdkDocumentUtils } from '../sdk-document/sdk-document.utils';

/**
 * Componente per renderizzare una lista di documents non editabili ma solo cancellabili
 */
@Component({
  selector: 'sdk-documents-list',
  templateUrl: './sdk-documents-list.component.html',
  styleUrls: ['./sdk-documents-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkDocumentsListComponent extends SdkAbstractFormField<SdkDocumentsListConfig, SdkDocumentsListInput, SdkDocumentsListOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkDocumentsListConfig;

  /**
   * @ignore
   */
  private documentToDelete: SdkDocumentItem;

  /**
   * @ignore
   */
  private dialogConfig: SdkDialogConfig;
  /**
   * @ignore
   */
  public dialogConfigObs: Subject<SdkDialogConfig> = new Subject<SdkDialogConfig>();

  /**
   * @ignore
   */
  private motivazioneDialogConfig: SdkDialogConfig;
  /**
   * @ignore
   */
  public motivazioneDialogConfigObs: BehaviorSubject<SdkDialogConfig> = new BehaviorSubject(null); 

  // #endregion

  // #region Constructor

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  // #endregion

  // #region Hooks

  /**
   * @ignore
   */
  protected onInit(): void { }

  /**
   * @ignore
   */
  protected onAfterViewInit(): void {
    this.initDialog();
  }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  // #endregion

  // #region Config

  /**
   * @ignore
   */
  protected onOutput(_data: SdkDocumentsListOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkDocumentsListConfig): void {
    this.markForCheck(() => {
      this.config = config;
      if (isObject(this.config.clearSubject)) {
        this.addSubscription(this.config.clearSubject.subscribe((data: boolean) => {
          if (data === true) {
            setTimeout(() => {
              this.markForCheck(() => {
                this.config.documents = new Array();
              });
            })
          }
        }));
      }
      this.isReady = true;
    });
  }

  /**
   * @ignore
   */
  protected onData(data: SdkDocumentsListInput): void {
    if (isObject(data) && isObject(data.item)) {
      setTimeout(() => this.markForCheck(() => this.config.documents.push(data.item)));
    }
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Getters

  private get sdkBase64Helper(): SdkBase64Helper { return this.injectable(SdkBase64Helper) }

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public trackByCode(index: number, item: SdkDocumentItem): string {
    return isObject(item) ? item.code : toString(index);
  }

  /**
   * @ignore
   */
  public manageDeleteDocument(item: SdkDocumentItem): void {
    this.documentToDelete = item;
    if (this.documentToDelete.deleteLogica) {
      this.openConfirmDialog();
    }
    else {
      this.deleteDocument();
    }
  }

  /**
   * @ignore
   * Apertura primo modale di conferma.
   */
  private openConfirmDialog(): void {

    
    let func: Function = this.openMotivationDialog();
    this.dialogConfig.open.next(func);
  }

  /**
   * @ignore
   */
  private initDialog(): any {
    this.dialogConfig = {
      dialogId: this.componentRandomId,
      header: this.translateService.instant("DIALOG.ANNULLA-PUBBLICAZIONE-ALLEGATO-HEADER"),
      message: this.translateService.instant("DIALOG.ANNULLA-PUBBLICAZIONE-ALLEGATO-MESSAGE"),
      acceptLabel: this.translateService.instant("DIALOG.CONFIRM-ACTION"),
      rejectLabel: this.translateService.instant("DIALOG.CANCEL-ACTION"),
      open: new Subject()
    };

    this.dialogConfigObs.next(this.dialogConfig);
  }

  /**
   * @ignore
   * Apertura modale con motivazione
   */
  private openMotivationDialog(): any {
    return () => {
      this.motivazioneDialogConfig = {
        dialogId: this.componentRandomId,
        header: this.translateService.instant("DIALOG.ANNULLA-PUBBLICAZIONE-ALLEGATO-MOTIVAZIONE-HEADER"),
        message: this.translateService.instant("DIALOG.ANNULLA-PUBBLICAZIONE-ALLEGATO-MOTIVAZIONE-MESSAGE"),
        acceptLabel: this.translateService.instant("DIALOG.CONFERMA-AZIONE"),
        rejectLabel: this.translateService.instant("DIALOG.ANNULLA-AZIONE"),
        motivazioneLabel: this.translateService.instant("DIALOG.CAMPO-MOTIVAZIONE-ANNULLAMENTO"),
        open: new Subject()
      };
      this.motivazioneDialogConfigObs.next(this.motivazioneDialogConfig);

      this.motivazioneDialogConfig.open.next((motivoCanc: string) => {
        if (motivoCanc) {
          this.documentToDelete.motivoCanc = motivoCanc;
          this.documentToDelete.dataCanc = new Date();
          this.documentToDelete.daAnnullare = true;

          this.emitOutput({ code: this.config.code, documents: this.config.documents });
        }
        this.documentToDelete = null;
      });
    }
  }

  /**
   * @ignore
   * Delete normale per ogni documento.
   */
  private deleteDocument(): void {
    if (isObject(this.config) && isObject(this.documentToDelete)) {
      this.markForCheck(() => {
        remove(this.config.documents, (one: SdkDocumentItem) => {
          return one.code === this.documentToDelete.code;
        });
        this.emitOutput({ code: this.config.code, documents: this.config.documents });
      });
    }
    this.documentToDelete = null;
  }

  /**
   * @ignore
   */
  public getClasses(initialLabel: string, additionalClasses: Array<string>, infoBox?: boolean): string {
    let classes: Array<string> = [initialLabel];
    if (!isEmpty(additionalClasses)) {
      classes = [...classes, ...additionalClasses];
    }
    if (infoBox === true) {
      classes.push('info-box-available');
    }
    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public getLinkClasses(initialClass: string, config: SdkDocumentsListConfig): string {
    let classes: Array<string> = [initialClass];
    if (config.clickable === true) {
      classes = [...classes, 'div-link', 'midblue-link'];
    }
    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public onDocumentClick(document: SdkDocumentItem): void {
    if (isObject(document) && this.config.clickable === true) {
      this.downloadFile(document)
    }
  }

  /**
   * @ignore
   */
  public handleInfoBoxDblClick(_event: Event): void {
    if (this.config.infoBox === true) {
      this.outputInfoBox$.emit(this.config);
    }
  }

  /**
   * @ignore
   */
  public formatTesto(titolo: string): string {
    return super.formatMultilineValue(titolo);
  }

  // #endregion

  // #region Private

  /**vai
   * @ignore
   */
  private downloadFile(jsondocument: SdkDocumentItem): void {

    if (jsondocument.url) {
      let link = document.createElement('a');
      document.body.appendChild(link);
      link.target = '_blank';
      link.href = jsondocument.url;
      link.click();
      link.remove();
    } else {
      const func = jsondocument.fileDownloadCallback;
      if (isFunction(func)) {
        func().subscribe((base64Document: string) => {
          const mimeType: string = SdkDocumentUtils.getMimeTypeFromExtension(jsondocument.tipoFile);
          let arrBuffer = this.sdkBase64Helper.base64ToArrayBuffer(base64Document);
          let newBlob = new Blob([arrBuffer], { type: mimeType });
          let data = window.URL.createObjectURL(newBlob);
          let link = document.createElement('a');
          document.body.appendChild(link);
          link.href = data;
          if (jsondocument.tipoFile != null && !jsondocument.titolo.includes(`.${jsondocument.tipoFile}`)) {
            link.download = `${jsondocument.titolo}.${jsondocument.tipoFile}`;
          } else {
            link.download = jsondocument.titolo;
          }
          link.click();
          window.URL.revokeObjectURL(data);
          link.remove();
        });
      }
    }
  };

  // #endregion

}
