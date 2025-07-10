import { Injectable, Injector } from '@angular/core';
import { IDictionary, SdkBaseService, SdkHashHelperService, getUrlWithTimestamp } from '@maggioli/sdk-commons';
import { isEmpty, isObject, map as mapArray } from 'lodash-es';
import { forkJoin, Observable, Observer, of } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class SdkStyleLoader extends SdkBaseService {

    constructor(inj: Injector) { super(inj) }

    public load(urls: Array<string>): Observable<unknown[]> {

        if (isEmpty(urls)) { return of(null); }

        return forkJoin([...mapArray(urls, url => this.loadOne(url, this.cache))]);

    }

    public unload(urls: Array<string>): Observable<unknown[]> {

        if (isEmpty(urls)) { return of(null); }

        return forkJoin([...mapArray(urls, url => this.unloadOne(url, this.cache))]);

    }

    private unloadOne(url: string, cache: IDictionary<boolean>) {

        let link = document.getElementById(this.hashHelper.hash(url));

        if (isObject(link)) {
            link.parentNode.removeChild(link);
            delete cache[url];
        }

        return new Observable<void>((ob: Observer<void>) => {
            ob.next(null);
            ob.complete();
        });

    }

    private loadOne(url: string, cache: IDictionary<boolean>): Observable<void> {

        if (cache[url] === true) { return of(null); }

        return new Observable<void>((ob: Observer<void>) => {

            const onload = (ev: Event) => {
                cache[url] = true;

                ob.next(null);
                ob.complete();
            };

            const onerror = (ev: Event | string, src?: string, row?: number, col?: number, err?: Error) => {
                delete cache[url];
                ob.error(err);
            };

            const style = this.build(url, onload, onerror);

            if (style != null) {
                document.body.appendChild(style);
            }

        });
    }

    private build(url: string, onload: any, onerror: any): HTMLLinkElement {

        const id: string = this.hashHelper.hash(url);

        const styleFound: HTMLElement = document.getElementById(id);
        let link = null;

        if (!styleFound) {
            link = document.createElement('link');

            link.id = id;
            link.href = getUrlWithTimestamp(url);
            link.crossOrigin = 'anonymous';
            link.rel = 'stylesheet';
            link.type = 'text/css';

            link.onload = onload;
            link.onerror = onerror;

        } else {
            link = styleFound;
            link.onload = onload;
            link.onerror = onerror;
        }
        return link;
    }

    // #region Getters

    private get cache(): IDictionary<boolean> { return window['styles'] = window['styles'] || {} }

    private get hashHelper(): SdkHashHelperService { return this.injectable(SdkHashHelperService) }

    // #endregion

}
