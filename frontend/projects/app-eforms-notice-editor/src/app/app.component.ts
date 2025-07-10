import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  getUrlWithTimestamp,
  SdkAbstractView,
  SdkAppConfig,
  SdkConfigLoader,
  SdkLocaleService,
  SdkSessionStorageService,
  SdkStateMap,
  SdkStoreService
} from '@maggioli/sdk-commons';
import { SdkStyleLoader } from '@maggioli/sdk-widgets';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import {
  map,
  mergeMap,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
  timer
} from 'rxjs';
import { Constants } from './app.constants';
import {
  HomePageInfoDTO,
  IAppaltiKeepAlive,
  ResponseResult
} from './models/api.model';
import { ApiService } from './services/api.service';
import { DataService } from './services/data.service';
import { ExternalIntegrationService } from './services/external-integration.service';
import { KeepAliveNotificationService } from './services/keep-alive-notification.service';

@Component({
  selector: 'app-root',
  template: `@if(isReady) { <sdk-layout-blocco></sdk-layout-blocco
    ><router-outlet></router-outlet><sdk-loader></sdk-loader> }`
})
export class AppWidget extends SdkAbstractView implements OnInit, OnDestroy {
  private _keepAliveSubscription: Subscription;

  // #region Hooks

  protected onInit(): void {
    this.initConfig()
      .pipe(
        mergeMap(this.initLang),
        mergeMap(this.loadLang),
        mergeMap(this.initState),
        mergeMap(this.initStyles),
        mergeMap(this.loadInfo),
        tap(this.elaborateInfo),
        tap(this.subscribeKeepAliveNotification)
      )
      .subscribe({
        next: this.onLoad,
        error: this.onError
      });
  }
  protected onDestroy(): void {
    this.unsubscribeKeepAlive();
  }
  protected onAfterViewInit(): void {}
  protected onUpdateState(_state: boolean): void {}

  // #endregion

  private initConfig = (): Observable<SdkAppConfig> => {
    return this.loader.load(
      getUrlWithTimestamp(this.configUrl(Constants.APP_NAME))
    );
  };

  private initLang = (config: SdkAppConfig): Observable<SdkAppConfig> => {
    this.translate.setDefaultLang(config.settings.locale.langCode);
    this.translate.use(config.settings.locale.langCode);

    // set locale in base a descrittore
    let locale: string = config.settings.locale.langCode;
    this.sdkLocaleService.locale = locale;
    let currency: string = config.settings.locale.currencyCode;
    this.sdkLocaleService.currency = currency;
    this.dataService.defaultCurrency = currency;

    return of(config);
  };

  private loadLang = (config: SdkAppConfig): Observable<SdkAppConfig> => {
    return this.translate.get('primeng').pipe(
      map((res) => {
        this.primeNGConfig.setTranslation(res);
        return config;
      })
    );
  };

  private initStyles = (config: SdkAppConfig): Observable<SdkAppConfig> => {
    return this.style.load(config.styleUrls).pipe(map(() => config));
  };

  private initState = (config: SdkAppConfig): Observable<SdkAppConfig> => {
    this.store.init(new SdkStateMap(config), {});

    return of(config);
  };

  private configUrl = (name: string) => `assets/cms/app/${name}.json`;

  private onLoad = (_config: any) => {
    this.isReady = true;
  };

  private onError = (err: Error) =>
    this.logger.error('AppWidget::initConfig', err);

  private loadInfo = () => {
    return this.apiService.loadInfo();
  };

  private elaborateInfo = (response: ResponseResult<HomePageInfoDTO>) => {
    let data: HomePageInfoDTO = response.data;
    this.dataService.info = data;
  };

  private subscribeKeepAliveNotification = () => {
    this.addSubscription(
      this._keepAliveNotificationService.on((startKeepAlive: boolean) => {
        this.unsubscribeKeepAlive();
        if (startKeepAlive) {
          let minutes: number = 4;
          let minutesInMillis: number = minutes * 60 * 1000;
          this._keepAliveSubscription = timer(0, minutesInMillis)
            .pipe(
              switchMap(() => {
                return this._externalIntegrationService.keepAlive();
              }),
              tap((response: IAppaltiKeepAlive) => {
                if (response && response.newToken) {
                  this._sdkSessionStorageService.setItem(
                    Constants.TOKEN_SESSION_KEY,
                    response.newToken
                  );
                }
              })
            )
            .subscribe();
        }
      })
    );
  };

  private unsubscribeKeepAlive(): void {
    if (this._keepAliveSubscription) {
      this._keepAliveSubscription.unsubscribe();
    }
  }

  // #region Getters

  private get translate(): TranslateService {
    return this.injectable(TranslateService);
  }

  private get loader(): SdkConfigLoader {
    return this.injectable(SdkConfigLoader);
  }

  private get style(): SdkStyleLoader {
    return this.injectable(SdkStyleLoader);
  }

  private get store(): SdkStoreService {
    return this.injectable(SdkStoreService);
  }

  private get sdkLocaleService(): SdkLocaleService {
    return this.injectable(SdkLocaleService);
  }

  private get primeNGConfig(): PrimeNGConfig {
    return this.injectable(PrimeNGConfig);
  }

  private get dataService(): DataService {
    return this.injectable(DataService);
  }

  private get apiService(): ApiService {
    return this.injectable(ApiService);
  }

  private _keepAliveNotificationService: KeepAliveNotificationService = inject(
    KeepAliveNotificationService
  );
  private _externalIntegrationService: ExternalIntegrationService = inject(
    ExternalIntegrationService
  );
  private _sdkSessionStorageService: SdkSessionStorageService = inject(
    SdkSessionStorageService
  );

  // #endregion
}
