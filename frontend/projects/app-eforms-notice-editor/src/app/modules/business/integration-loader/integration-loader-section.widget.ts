import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  IDictionary,
  SdkBusinessAbstractWidget,
  SdkHttpLoaderService,
  SdkHttpLoaderType,
  SdkLocaleService,
  SdkRouterService,
  SdkSessionStorageService
} from '@maggioli/sdk-commons';
import { SdkMessagePanelService } from '@maggioli/sdk-controls';
import { mergeMap, tap } from 'rxjs';
import { Constants } from '../../../app.constants';
import {
  IAppaltiLoadInitialData,
  NoticeTypesDTO,
  ResponseResult,
  TAppaltiTracciatoInitType
} from '../../../models/api.model';
import { ApiService } from '../../../services/api.service';
import { DataService } from '../../../services/data.service';
import { ExternalIntegrationService } from '../../../services/external-integration.service';
import { KeepAliveNotificationService } from '../../../services/keep-alive-notification.service';
import { CryptoUtils } from '../../../utils/crypto-utils';

@Component({
  templateUrl: `integration-loader-section.widget.html`,
  encapsulation: ViewEncapsulation.None
})
export class IntegrationLoaderSectionWidget extends SdkBusinessAbstractWidget<void> implements OnInit, OnDestroy {
  @HostBinding('class') classNames = `integration-loader-section`;

  @ViewChild('messages') _messagesPanel: ElementRef;

  public config: any = {};

  private _dataService: DataService = inject(DataService);
  private _apiService: ApiService = inject(ApiService);
  private _sdkLocaleService: SdkLocaleService = inject(SdkLocaleService);
  private _sdkHttpLoaderService: SdkHttpLoaderService = inject(SdkHttpLoaderService);
  private _sdkSessionStorageService: SdkSessionStorageService = inject(SdkSessionStorageService);
  private _externalIntegrationService: ExternalIntegrationService = inject(ExternalIntegrationService);
  private _keepAliveNotificationService: KeepAliveNotificationService = inject(KeepAliveNotificationService);
  private _sdkMessagePanelService: SdkMessagePanelService = inject(SdkMessagePanelService);
  private _sdkRouterService: SdkRouterService = inject(SdkRouterService);

  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
  }

  // #region Hooks

  protected onInit(): void {}

  protected onAfterViewInit(): void {
    // Load del token
    let token: string = this._sdkSessionStorageService.getItem(Constants.TOKEN_SESSION_KEY);
    if (token == null) {
      this.logger.error('Errore, nessun token trovato');
      this._sdkRouterService.navigateToPage('home-page');
    }

    let claims: IDictionary<any> = CryptoUtils.getJwtTokenClaims(token);
    this._dataService.reset();
    this._dataService.selectedSdkVersion = this._dataService.info.sdkVersions[0];
    this._dataService.selectedNotice = claims?.data?.noticeSubType;

    let tipoTracciato: TAppaltiTracciatoInitType;

    // Chiamata ad applicativo esterno
    this._sdkMessagePanelService.clear(this.messagesPanel);
    this._sdkHttpLoaderService.showLoader(SdkHttpLoaderType.Operation);
    this._externalIntegrationService
      .loadInitialData()
      .pipe(
        tap((response: IAppaltiLoadInitialData) => {
          tipoTracciato = response.tipoTracciato;

          // Save Token
          this._sdkSessionStorageService.setItem(Constants.TOKEN_SESSION_KEY, response.newToken);
          token = response.newToken;

          if (tipoTracciato == 'INIZIALIZZAZIONE' || tipoTracciato == 'INIZIALIZZAZIONE_RETTIFICA') {
            this._sdkSessionStorageService.setItem(Constants.TRACCIATO_SESSION_KEY, response.tracciato);
          } else if (tipoTracciato == 'BOZZA' || tipoTracciato == 'BOZZA_RETTIFICA') {
            try {
              this._dataService.uploadedJsonContent = JSON.parse(response.tracciato as string);
            } catch (e) {
              console.error(e);
            }
          }
        }),
        // of(TRACCIATO_JSON).pipe(
        //   tap((tracciato: string) => {
        //     tipoTracciato = 'INIZIALIZZAZIONE';
        //     let tracciatoObj: IDictionary<any> = JSON.parse(tracciato);
        //     this._sdkSessionStorageService.setItem(Constants.TRACCIATO_SESSION_KEY, tracciatoObj);
        //   }),
        tap(this.startKeepAlive),
        // Api calls
        mergeMap(this.loadNoticeTypes),
        tap(this.elaborateNoticeTypes),
        mergeMap(this.loadBasicMetadata),
        tap(this.elaborateBasicMetadata),
        mergeMap(this.loadTranslations),
        tap(this.elaborateTranslations)
      )
      .subscribe({
        next: () => {
          if (tipoTracciato == 'INIZIALIZZAZIONE' || tipoTracciato == 'INIZIALIZZAZIONE_RETTIFICA') {
            let params: IDictionary<string> = {
              action: 'NEW'
            };

            if (tipoTracciato == 'INIZIALIZZAZIONE_RETTIFICA') {
              this._dataService.standaloneRettifica = true;
            }

            this._sdkRouterService.navigateToPage('new-enotice-page', params);
          } else if (tipoTracciato == 'BOZZA' || tipoTracciato == 'BOZZA_RETTIFICA') {
            let params: IDictionary<string> = {
              action: 'EDIT'
            };
            this._sdkRouterService.navigateToPage('edit-enotice-page', params);
          }
        },
        error: (err) => {
          console.error(err);
          this._sdkHttpLoaderService.hideLoader();
          this._sdkMessagePanelService.showError(this.messagesPanel, [
            {
              message: 'ERRORS.ERRORE-DATA-GET'
            }
          ]);
        },
        complete: () => this._sdkHttpLoaderService.hideLoader()
      });
  }

  protected onDestroy(): void {}

  protected onConfig(config: any): void {
    if (config != null) {
      this.config = { ...config };
      this.isReady = true;
    }
  }

  protected onUpdateState(state: boolean): void {}

  // #endregion

  // #region Public

  // #endregion

  // #region Getters

  // #endregion

  // #region Private

  private get messagesPanel(): HTMLElement {
    return this._messagesPanel != null ? this._messagesPanel.nativeElement : undefined;
  }

  private startKeepAlive = () => {
    this._keepAliveNotificationService.emit(true);
  };

  private loadNoticeTypes = () => {
    return this._apiService.loadNoticeTypes(this._dataService.selectedSdkVersion);
  };

  private elaborateNoticeTypes = (response: ResponseResult<NoticeTypesDTO>) => {
    let data: NoticeTypesDTO = response.data;
    this._dataService.noticeTypes = data;
  };

  private loadBasicMetadata = () => {
    return this._apiService.loadBasicMetadata(this._dataService.selectedSdkVersion);
  };

  private elaborateBasicMetadata = (response: ResponseResult<IDictionary<any>>) => {
    let data: IDictionary<any> = response.data;
    this._dataService.basicMetaData = data;
  };

  private loadTranslations = () => {
    this._dataService.selectedLang = this._sdkLocaleService.locale;
    return this._apiService.loadTranslations(this._dataService.selectedSdkVersion, this._dataService.selectedLang);
  };

  private elaborateTranslations = (response: ResponseResult<IDictionary<any>>) => {
    let data: IDictionary<any> = response.data;
    this._dataService.translations = data;
  };

  // #endregion
}
