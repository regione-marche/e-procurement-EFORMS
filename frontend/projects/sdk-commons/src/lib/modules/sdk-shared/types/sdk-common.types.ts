import { Observable } from 'rxjs';

export type OnLoadCb = (ev: Event) => void;

export type OnErrorCb = (ev: Event | string) => void;

export interface ISdkPool<T> {
    acquire(): Observable<T>;
    release(res: T): Observable<void>;
    stats(): Observable<IDictionary<string>>;
    destroy(): Observable<void>;
}

export interface ISdkDictionaryProvider {
    dictionary(name: string, val?: IDictionary<any>): IDictionary<any>;
}

export interface SdkCacheItem<X = any> {
    meta: SdkCacheItemMeta;
    data: X;
}

export interface SdkCacheItemMeta {
    created: number;
}

export interface SdkCachOptions {
    maxAge?: number; /* Scadenza in ms */
    dummy?: boolean; /* Nessuna cache */
}

export interface IDictionary<T> {
    [k: string]: T;
}

export interface FilterObject<T> {
    filters: IDictionary<FilterItem>;
    filteredValue: Array<T>;
}

export interface FilterItem {
    value: any;
    matchMode: string;
}

export interface IBrowserInfo {
    browserName?: string;
    fullVersion?: string;
    majorVersion?: string;
    navigatorAppName?: string;
    navigatorUserAgent?: string;
}