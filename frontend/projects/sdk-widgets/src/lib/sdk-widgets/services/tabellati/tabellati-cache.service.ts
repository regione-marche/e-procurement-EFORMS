import { Inject, Injectable, Injector } from '@angular/core';
import { IDictionary, SDK_APP_CONFIG, SdkAppEnvConfig, SdkBaseService, SdkLocalStorageService } from '@maggioli/sdk-commons';
import { cloneDeep, each, isEmpty, isObject, set } from 'lodash-es';
import { Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operators';

import { TabellatoInfo, ValoreTabellato } from '../../model/lib.model';
import { SdkWidgetsConstants } from '../../sdk-widgets.constants';
import { TabellatiService } from './tabellati.service';

@Injectable()
export class TabellatiCacheService extends SdkBaseService {

    constructor(
        inj: Injector,
        @Inject(SDK_APP_CONFIG) private appConfig: SdkAppEnvConfig,
        @Inject('localStoragePrefix') private _localStoragePrefix: string
    ) { super(inj); }

    // #region Public

    public getValoriTabellato(codice: string): Observable<Array<ValoreTabellato>> {
        let storedValues: TabellatoInfo = this.sdkLocalStorageService.getItem(codice, this.getLocalStoragePrefix());
        if (isObject(storedValues) && new Date(storedValues.expiration).getTime() >= new Date().getTime()) {
            return new Observable((observer: Observer<Array<ValoreTabellato>>) => {
                let cloned = cloneDeep(storedValues.data);
                observer.next(cloned);
                observer.complete();
            });
        }
        return this.getListaValoriTabellatoFactory(codice);
    }

    public getValoriTabellati(codici: Array<string>): Observable<IDictionary<Array<ValoreTabellato>>> {
        let codesToBeRetrieved: Array<string> = new Array();
        let finalValues: IDictionary<Array<ValoreTabellato>> = {};
        each(codici, (codice: string) => {
            let storedValues: TabellatoInfo = this.sdkLocalStorageService.getItem(codice, this.getLocalStoragePrefix());
            if (isObject(storedValues) && new Date(storedValues.expiration).getTime() >= new Date().getTime()) {
                set(finalValues, codice, storedValues.data);
            } else {
                codesToBeRetrieved.push(codice);
            }
        });
        if (isEmpty(codesToBeRetrieved)) {
            return new Observable((ob: Observer<IDictionary<Array<ValoreTabellato>>>) => {
                ob.next(finalValues);
                ob.complete();
            });
        }
        return this.getListaValoriTabellatiFactory(codesToBeRetrieved).pipe(map((result: IDictionary<Array<ValoreTabellato>>) => {
            return {
                ...finalValues,
                ...result
            };
        }));
    }

    // #endregion

    // #region Private

    private getListaValoriTabellatoFactory(codice: string): Observable<any> {
        return this.tabellatiService.listaValori(this.appConfig.environment.GESTIONE_TABELLATI_BASE_URL, codice).pipe(map((result: Array<ValoreTabellato>) => {
            let list: Array<ValoreTabellato> = cloneDeep(result);
            let expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 1);
            let resultToStore: TabellatoInfo = {
                data: list,
                expiration: expirationDate
            };
            this.sdkLocalStorageService.setItem(codice, resultToStore, this.getLocalStoragePrefix());
            return resultToStore.data;
        }));
    }

    private getListaValoriTabellatiFactory(codici: Array<string>): Observable<IDictionary<Array<ValoreTabellato>>> {
        return this.tabellatiService.getMultipleListaValori(this.appConfig.environment.GESTIONE_TABELLATI_BASE_URL, codici).pipe(map((result: IDictionary<Array<ValoreTabellato>>) => {
            let mappaTabellati: IDictionary<Array<ValoreTabellato>> = cloneDeep(result);
            let expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 1);
            each(mappaTabellati, (value: Array<ValoreTabellato>, key: string) => {
                let resultToStore: TabellatoInfo = {
                    data: value,
                    expiration: expirationDate
                };
                this.sdkLocalStorageService.setItem(key, resultToStore, this.getLocalStoragePrefix());
            });
            return mappaTabellati;
        }));
    }

    private getLocalStoragePrefix() {
        if (!isEmpty(this._localStoragePrefix))
            return this._localStoragePrefix;
        return SdkWidgetsConstants.LOCAL_STORAGE_PREFIX;
    }

    // #endregion

    // #region Getters

    private get tabellatiService(): TabellatiService { return this.injectable(TabellatiService); };

    private get sdkLocalStorageService(): SdkLocalStorageService { return this.injectable(SdkLocalStorageService) }

    // #endregion
}