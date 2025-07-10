import { Injectable, Injector } from '@angular/core';
import { cloneDeep, isObject } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { SdkHashHelperService } from '../sdk-helper/hash/sdk-hash-helper.service';
import { SdkLoggerService } from '../sdk-logger/sdk-logger.service';
import { IDictionary, SdkCacheItem, SdkCachOptions } from '../sdk-shared/types/sdk-common.types';
import { SdkCacheProvider } from './sdk-cache.provider';

@Injectable({ providedIn: 'root' })
export class SdkCacheService {

    private cacheProvider: SdkCacheProvider = new SdkCacheProvider();

    constructor(private inj: Injector) { this.cacheStore = {} }

    public cacheSync<X, Y>(keyObj: IDictionary<any>, fn: (arg?: X) => Y, arg?: X, opt?: SdkCachOptions): Y {

        try {

            /* Creazione hash key per la cache */
            let key = this.cacheKey(keyObj);

            /* Recupero l'oggetto dalla cache se presente */
            let cached = this.retrieveItem<Y>(key);

            /* Verifico la validità dell'oggetto in cache */
            if (this.isValid(cached, opt)) { return cached.data }

            /* Pulisco la cache dall'oggetto non valido */
            delete this.cacheStore[key];

            /* Effettuo la chiamata alla funzione */
            let res = fn(arg);

            /* Salvo in cache il risultato */
            this.storeItem(key, res, opt);

            return res;

        } catch (err) {
            this.logger.error(err ? err.message : '', err);
        }

    }

    public cacheObservable<X, Y>(keyObj: IDictionary<any>, fn: (arg?: X) => Observable<Y>, arg?: X, opt?: SdkCachOptions): Observable<Y> {

        try {

            /* Creazione hash key per la cache */
            let key = this.cacheKey(keyObj);

            /* Recupero l'oggetto dalla cache se presente */
            let cached = this.retrieveItem<Y>(key);

            /* Verifico la validità dell'oggetto in cache */
            if (this.isValid(cached, opt)) { return of(cached.data) }

            /* Pulisco la cache dall'oggetto non valido */
            delete this.cacheStore[key];

            /* Effettuo la chiamata alla funzione e salvo in cache il risultato */
            return fn(arg).pipe(tap((res: Y) => this.storeItem(key, res, opt)));

        } catch (err) {
            this.logger.error(err ? err.message : '', err);
        }

    }

    private cacheKey(keyObj: IDictionary<any>): string {

        /* Creazione hash key per loggetto args pulito */
        let key = this.hashHelper.hash(keyObj);

        return key;

    }

    private isValid<Y>(cached: SdkCacheItem<Y>, opt?: SdkCachOptions): boolean {

        if (isObject(cached)) {

            if (isObject(opt)) {

                return opt.maxAge + cached.meta.created > this.now;
            }

            return true;
        }

        return false;

    }

    private storeItem<X>(key: string, res: X, opt: SdkCachOptions): void {

        if (isObject(opt) && opt.dummy === true) { return }

        this.cacheStore[key] = this.createItem(res);

    }

    private retrieveItem<X>(key: string): SdkCacheItem<X> {

        return this.cacheStore[key] as SdkCacheItem<X>;

    }

    private createItem<X>(data: X): SdkCacheItem<X> { return { meta: { created: this.now }, data: cloneDeep(data) } }

    // #region Getters

    private get cacheStore(): IDictionary<any> { return this.cacheProvider.dictionary(this.KEY) }

    private get hashHelper(): SdkHashHelperService { return this.inj.get(SdkHashHelperService) }

    private get logger(): SdkLoggerService { return this.inj.get(SdkLoggerService) }

    private get now(): number { return (new Date()).getTime() }

    private get KEY(): string { return 'cache' }

    // #endregion

    // #region Setters

    private set cacheStore(val: IDictionary<any>) { this.cacheProvider.dictionary(this.KEY, val) }

    // #endregion

}