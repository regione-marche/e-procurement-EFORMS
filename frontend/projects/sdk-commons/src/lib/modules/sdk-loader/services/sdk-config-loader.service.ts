import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { SdkLoggerService } from '../../sdk-logger/sdk-logger.service';
import { SdkLoader, SdkRenderConfig } from '../../sdk-shared/types/sdk-loader.types';

@Injectable({ providedIn: 'root' })
export class SdkConfigLoader implements SdkLoader {

    constructor(private inj: Injector) { }

    // #region Public

    public load(url: string): Observable<SdkRenderConfig> { return this.get(url).pipe(tap(this.tap)) }

    // #endregion

    // #region Private

    private get(url: string): Observable<SdkRenderConfig> { this.logger.info('loader', url); return this.http.get<SdkRenderConfig>(url) }

    private tap = (data: SdkRenderConfig) => { /* this.logger.debug('SdkRenderConfig >>>', data) */ }

    // #endregion

    // #region Getters

    private get logger(): SdkLoggerService { return this.inj.get(SdkLoggerService) }

    private get http(): HttpClient { return this.inj.get(HttpClient) }

    // #endregion

}



