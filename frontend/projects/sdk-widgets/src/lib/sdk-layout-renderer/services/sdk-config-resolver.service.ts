import { Inject, Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {
    IDictionary,
    SDK_APP_CONFIG,
    SdkAppConfig,
    SdkAppEnvConfig,
    SdkConfigLoader,
    SdkContentConfig,
    SdkLayoutConfig,
    SdkRenderConfig,
    getUrlWithTimestamp,
} from '@maggioli/sdk-commons';
import { get, has, set } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SdkConfigResolverService {

    private pageCacheMap: IDictionary<SdkContentConfig>;
    private layoutCacheMap: IDictionary<SdkLayoutConfig>;
    private appCacheMap: IDictionary<SdkAppConfig>;

    constructor(private inj: Injector, @Inject(SDK_APP_CONFIG) public appConfig: SdkAppEnvConfig) {
        this.pageCacheMap = {};
        this.layoutCacheMap = {};
        this.appCacheMap = {};
    }

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        let pageConfig: SdkContentConfig;
        let layoutConfig: SdkLayoutConfig;
        let appConfig: SdkAppConfig;

        let slug = route.paramMap.get('slug');

        let pageObs: Observable<SdkRenderConfig>;

        if (has(this.pageCacheMap, slug)) {
            pageObs = of(get(this.pageCacheMap, slug));
        } else {
            pageObs = this.loader.load(getUrlWithTimestamp(this.pageUrl(slug)));
        }

        return pageObs.pipe(
            mergeMap((config: SdkContentConfig) => {

                pageConfig = config;

                if (pageConfig.appName === '<APP-NAME>') {
                    pageConfig.appName = this.appConfig.APP_NAME;
                }

                set(this.pageCacheMap, slug, pageConfig);

                if (has(this.layoutCacheMap, pageConfig.layout)) {
                    return of(get(this.layoutCacheMap, pageConfig.layout));
                } else {
                    return this.loader.load(getUrlWithTimestamp(this.layoutUrl(config.layout)))
                }
            }),
            mergeMap((config: SdkLayoutConfig) => {

                layoutConfig = config;
                set(this.layoutCacheMap, pageConfig.layout, layoutConfig);

                if (has(this.appCacheMap, pageConfig.appName)) {
                    return of(get(this.appCacheMap, pageConfig.appName));
                } else {
                    return this.loader.load(getUrlWithTimestamp(this.appUrl(pageConfig.appName)));
                }
            }),
            mergeMap((config: SdkAppConfig) => {

                appConfig = config;
                set(this.appCacheMap, pageConfig.appName, appConfig);

                return of({
                    page: pageConfig,
                    layout: layoutConfig,
                    app: appConfig
                });
            })
        );
    }

    private pageUrl = (slug: string) => `assets/cms/pages/${slug}.json`

    private layoutUrl = (name: string) => `assets/cms/layouts/${name}.json`

    private appUrl = (name: string) => `assets/cms/app/${name}.json`;

    private get loader(): SdkConfigLoader { return this.inj.get(SdkConfigLoader) }

}
