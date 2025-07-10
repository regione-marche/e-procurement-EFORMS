import { Directive, ElementRef, inject, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IDictionary,
  SdkBreadcrumbsMessageService,
  SdkBusinessAbstractWidget,
  SdkHttpLoaderService,
  SdkLocaleService,
  SdkNumberFormatService,
  SdkRouterService,
  SdkSessionStorageService
} from '@maggioli/sdk-commons';
import { SdkDialogConfig, SdkMessagePanelService, SdkMessagePanelTranslate } from '@maggioli/sdk-controls';
import { SdkLayoutBreadcrumbsCollapseService } from '@maggioli/sdk-widgets';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, get } from 'lodash-es';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { Constants, CONTRACT_NATURE } from '../../../app.constants';
import { ResponseResult } from '../../../models/api.model';
import { AccordionEvent, AccordionOutput, IComboboxOption, IVisualModelOutput } from '../../../models/app.model';
import { ApiService } from '../../../services/api.service';
import { CacheService } from '../../../services/cache.service';
import { CheckService } from '../../../services/custom-checks.service';
import { DataService } from '../../../services/data.service';
import { ExternalIntegrationService } from '../../../services/external-integration.service';
import { FormDataService } from '../../../services/form-data.service';
import { FormService } from '../../../services/form.service';
import { ScrollService } from '../../../services/formcontrol-scroll.service';
import { LayoutMenuTabsEventsService } from '../../../services/layout-menu-tabs-events.service';
import { LayoutMenuTabsMessageService } from '../../../services/layout-menu-tabs-message.service';
import { LotsTableService } from '../../../services/lots-table.service';
import { ResultsTableService } from '../../../services/results-table.service';
import { CryptoUtils } from '../../../utils/crypto-utils';
import { VisualModelService } from '../../../utils/visual-model-reactive';

@Directive()
export abstract class AbstractFormComponent extends SdkBusinessAbstractWidget<void> {
  // #region Variables

  @ViewChild('messages') public _messagesPanel: ElementRef;

  private _isExternalIntegration: boolean = false;

  protected _dialogConfig: SdkDialogConfig;
  protected _uuidRettifica: string = null;
  protected _uuidNotice: string = null;

  public dialogConfigObs: BehaviorSubject<SdkDialogConfig> = new BehaviorSubject(null);
  public isLoading: boolean = false;

  public locale: string;
  public currency: string;

  // #endregion

  // #region Inject

  protected _dataService: DataService = inject(DataService);
  protected _apiService: ApiService = inject(ApiService);
  protected _formService: FormService = inject(FormService);
  protected _formDataService: FormDataService = inject(FormDataService);
  protected _lotsTableService: LotsTableService = inject(LotsTableService);
  protected _resultsTableService: ResultsTableService = inject(ResultsTableService);
  protected _scrollService: ScrollService = inject(ScrollService);
  protected _checkService: CheckService = inject(CheckService);
  protected _sdkRouterService: SdkRouterService = inject(SdkRouterService);
  protected _layoutMenuTabsMessageService: LayoutMenuTabsMessageService = inject(LayoutMenuTabsMessageService);
  protected _layoutMenuTabsEventsService: LayoutMenuTabsEventsService = inject(LayoutMenuTabsEventsService);
  protected _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  protected _sdkMessagePanelService: SdkMessagePanelService = inject(SdkMessagePanelService);
  protected _sdkHttpLoaderService: SdkHttpLoaderService = inject(SdkHttpLoaderService);
  protected _breadcrumbsCollapseService: SdkLayoutBreadcrumbsCollapseService = inject(
    SdkLayoutBreadcrumbsCollapseService
  );
  protected _visualModelService: VisualModelService = inject(VisualModelService);
  protected _translateService: TranslateService = inject(TranslateService);
  protected _sdkSessionStorageService: SdkSessionStorageService = inject(SdkSessionStorageService);
  protected _externalIntegrationService: ExternalIntegrationService = inject(ExternalIntegrationService);
  protected _breadcrumbsService: SdkBreadcrumbsMessageService = inject(SdkBreadcrumbsMessageService);
  protected _sdkNumberFormatService: SdkNumberFormatService = inject(SdkNumberFormatService);
  protected _sdkLocaleService: SdkLocaleService = inject(SdkLocaleService);
  protected _cacheService: CacheService = inject(CacheService);

  // #endregion

  // #region Abstract

  // #endregion

  /**
   * Metodo che carica parte la parte della form selezionata
   * @param output Output dell'accordion
   */
  protected abstract manageFirstLevelItemToggle(output: AccordionOutput): void;

  /**
   * Aggiunge un nuovo elemento di primo livello
   * @param id id dell'elemento
   */
  protected abstract manageAddElementEvent(id: string): void;

  /**
   * Rimuove un'elemento di primo livello
   * @param obj Output dell'accordion
   */
  protected abstract manageRemoveElementEvent(obj: AccordionOutput): void;

  // #region Protected

  protected get messagesPanel(): HTMLElement {
    return this._messagesPanel != null ? this._messagesPanel.nativeElement : undefined;
  }

  protected initDialog(): void {
    this._dialogConfig = {
      header: this._translateService.instant('DIALOG.BACK-HEADER'),
      message: this._translateService.instant('DIALOG.BACK-MESSAGE'),
      open: new Subject<Function>(),
      acceptLabel: this._translateService.instant('DIALOG.ACCEPT-LABEL'),
      rejectLabel: this._translateService.instant('DIALOG.REJECT-LABEL'),
      dialogId: 'edit-section-dialog'
    };

    this.dialogConfigObs.next(this._dialogConfig);
  }

  protected initBozzaDialog(): void {
    this._dialogConfig = {
      header: this._translateService.instant('DIALOG.BOZZA-HEADER'),
      message: this._translateService.instant('DIALOG.BOZZA-MESSAGE'),
      open: new Subject<Function>(),
      acceptLabel: this._translateService.instant('DIALOG.ACCEPT-LABEL'),
      rejectLabel: this._translateService.instant('DIALOG.REJECT-LABEL'),
      dialogId: 'edit-section-dialog'
    };

    this.dialogConfigObs.next(this._dialogConfig);
  }

  protected initEliminaElementoDialog(): void {
    this._dialogConfig = {
      header: this._translateService.instant('DIALOG.DELETE-HEADER'),
      message: this._translateService.instant('DIALOG.DELETE-MESSAGE'),
      open: new Subject<Function>(),
      acceptLabel: this._translateService.instant('DIALOG.ACCEPT-LABEL'),
      rejectLabel: this._translateService.instant('DIALOG.REJECT-LABEL'),
      dialogId: 'edit-section-dialog'
    };

    this.dialogConfigObs.next(this._dialogConfig);
  }

  protected generateVisualModel(
    firstElement: any,
    firstMetadata: any,
    formReactiveContent: IDictionary<FormGroup | IDictionary<FormGroup>>,
    metadataFormGroup: FormGroup,
    executeValidation: boolean = true
  ): IVisualModelOutput {
    this._sdkMessagePanelService.clear(this.messagesPanel);

    let visualModelOutput: IVisualModelOutput = this._visualModelService.buildVisualModel(
      firstElement,
      firstMetadata,
      formReactiveContent,
      metadataFormGroup
    );
    // Mostra solamente un messaggio di errore generico
    if (visualModelOutput.validation) {
      let messages: Array<SdkMessagePanelTranslate> = [{ message: 'CHECK-VISUAL-MODEL.GENERIC-VALIDATION-ERROR' }];
      this._sdkMessagePanelService.showError(this.messagesPanel, messages);
    } else {
      this._sdkMessagePanelService.clear(this.messagesPanel);
    }
    return visualModelOutput;
  }

  /**
   * Metodo che gestisce l'output della sidebar e nello specifico l'accordion contenuto in essa
   */
  protected manageSidebar(): void {
    this.addSubscription(
      this._layoutMenuTabsEventsService.on((event: AccordionEvent) => {
        if (event) {
          switch (event.event) {
            case 'TOGGLE':
              this.manageFirstLevelItemToggle(event.value as AccordionOutput);
              break;
            case 'ADD':
              this.manageAddElementEvent(event.value as string);
              break;
            case 'REMOVE':
              this.manageRemoveElementEvent(event.value as AccordionOutput);
              break;
            default:
              break;
          }
        }
      })
    );
  }

  protected checkExternalIntegration(): void {
    let hasDataGetUrl: boolean = this._sdkSessionStorageService.getItem(Constants.EXTERNAL_DATA_GET_INVOKING_URL);
    let hasKeepAliveUrl: boolean = this._sdkSessionStorageService.getItem(Constants.EXTERNAL_KEEP_ALIVE_INVOKING_URL);
    let hasPersistenceUrl: boolean = !!this._sdkSessionStorageService.getItem(
      Constants.EXTERNAL_PERSISTENCE_INVOKING_URL
    );

    this._isExternalIntegration = hasDataGetUrl && hasKeepAliveUrl && hasPersistenceUrl;

    // Check Rettifica
    let token: string = this._sdkSessionStorageService.getItem(Constants.TOKEN_SESSION_KEY);

    if (token != null) {
      let claims: IDictionary<any> = CryptoUtils.getJwtTokenClaims(token);
      this._uuidNotice = claims?.data?.noticeUUID;
      this._uuidRettifica = claims?.data?.noticeChangedUUID;
      // FIXME: Da correggere su Appalti
      if (this._uuidRettifica == 'null') {
        this._uuidRettifica = null;
      }
    }
  }

  /**
   * Nel caso di external integration considero l'uuid di rettifica nel caso di edit
   * oppure il campo standaloneRettifica nel caso di new
   *
   * altrimenti solo standaloneRettifica
   */
  protected get isRettifica(): boolean {
    let cond: boolean = this.isExternalIntegration
      ? this._uuidRettifica != null || this._dataService.standaloneRettifica
      : this._dataService.standaloneRettifica;
    return cond;
  }

  protected get isExternalIntegration(): boolean {
    return this._isExternalIntegration;
  }

  protected parseSuggestedFields(config: IDictionary<any>): void {
    if (get(config, 'suggestedFields') != null) {
      let generalSuggestedFields: Array<string> = get(config, 'generalSuggestedFields') ?? [];

      let suggestedFields: IDictionary<Array<string>> = cloneDeep(get(config, 'suggestedFields'));

      Object.keys(suggestedFields).forEach((key: string) => {
        suggestedFields[key] = [...generalSuggestedFields, ...suggestedFields[key]];
      });

      this._dataService.elaborateSuggestedFields(suggestedFields);
    }
  }

  protected formatTipologiaAppalto(tipologiaAppalto: string): string {
    const cached = this._cacheService.getItem<Array<IComboboxOption>>(
      CONTRACT_NATURE,
      this._dataService.selectedLang,
      this._dataService.selectedSdkVersion
    );

    return cached.find((item) => item.key === tipologiaAppalto)?.label ?? '';
  }

  protected formatCurrency(importoComplessivo: number): string {
    return this._sdkNumberFormatService.formatCurrencyString(importoComplessivo, this.locale, this.currency);
  }

  protected formatNumeroLotto(numeroLotto: number): string {
    if (numeroLotto) return 'Lotto (' + this._formService.generateCounter(numeroLotto) + ')';
    else return '';
  }

  protected loadComboContractNature(): void {
    let language: string = this._dataService.selectedLang;
    let codeListId: string = CONTRACT_NATURE;
    let sdkVersion = this._dataService.selectedSdkVersion;

    this._apiService
      .loadCodeLists(sdkVersion, language, codeListId)
      .pipe(
        map((response: ResponseResult<IDictionary<any>>) => {
          // mappa la risposta dell'API
          let data: IDictionary<any> = response.data;

          return data.codes.map((code: any) => {
            let obj: IComboboxOption = {
              key: code.codeValue,
              label: code[language]
            };
            return obj;
          });
        })
      )
      .subscribe((data: Array<IComboboxOption>) => {
        // memorizza i dati nella cache
        this._cacheService.setItem<Array<IComboboxOption>>(
          CONTRACT_NATURE,
          this._dataService.selectedLang,
          data,
          this._dataService.selectedSdkVersion
        );
      });
  }

  // #endregion
}
