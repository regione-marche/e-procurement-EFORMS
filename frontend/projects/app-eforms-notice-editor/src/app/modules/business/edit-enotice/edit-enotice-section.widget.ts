import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  effect,
  HostBinding,
  Injector,
  OnDestroy,
  OnInit,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { IDictionary, SdkHttpLoaderType } from '@maggioli/sdk-commons';
import {
  SdkBreadcrumbItem,
  SdkButtonGroupInput,
  SdkButtonGroupOutput,
  SdkButtonGroupSingleInput,
  SdkDocumentUtils,
  SdkMessagePanelTranslate,
  SdkModalConfig,
  SdkSidebarConfig
} from '@maggioli/sdk-controls';
import { cloneDeep, get, has, isBoolean, isEmpty, isNumber, isObject, padStart, remove, set } from 'lodash-es';
import { TablePageEvent } from 'primeng/table';
import { BehaviorSubject, concatMap, mergeMap, Observable, of, Subject, tap } from 'rxjs';
import {
  CANCELED_NEW_APPALTO,
  CANCELED_NEW_LOT,
  CANCELED_NEW_OFFERTA,
  CANCELED_NEW_PARTE_OFFERENTE,
  CANCELED_NEW_RISULTATO_LOTTO,
  Constants,
  GR_LOT_ID,
  GR_RESULT_ID,
  LOTTI_LABEL,
  NEW_APPALTO,
  NEW_LOT,
  NEW_OFFERTA,
  NEW_PARTE_OFFERENTE,
  NEW_RISULTATO_LOTTO
} from '../../../app.constants';
import {
  CvsOutputDTO,
  IAppaltiBaseResponse,
  IAppaltiPersistenceRequest,
  NoticeSubtypesDetailDTO,
  ResponseResult
} from '../../../models/api.model';
import {
  AccordionItem,
  AccordionOutput,
  AppaltoItem,
  CustomChecks,
  ExtendedFormControl,
  InvalidField,
  IVisualModelElement,
  IVisualModelOutput,
  LottoItem,
  NoticeInfo,
  OffertaItem,
  OutputCvsValidationModalConfig,
  OutputRestModalConfig,
  ParteOfferenteItem,
  RisultatoDelLottoItem
} from '../../../models/app.model';
import { CryptoUtils } from '../../../utils/crypto-utils';
import { AbstractFormComponent } from '../abstract/abstract-form.component';

@Component({
  templateUrl: `edit-enotice-section.widget.html`,
  encapsulation: ViewEncapsulation.None
})
export class EditEnoticeSectionWidget extends AbstractFormComponent implements OnInit, OnDestroy {
  @HostBinding('class') classNames = `edit-enotice-section`;

  public config: any = {};

  private _sdkVersion: string;
  // Contenuto form sdk indicizzato per elementi di primo livello
  private _formContent: IDictionary<any> = {};
  // Contenuto form reactive indicizzato per elementi di primo livello
  private _formReactiveContent: IDictionary<FormGroup | IDictionary<FormGroup>> = {};
  // Contenuto form reactive indicizzato per elementi di primo livello originale (non modificato dall'utente)
  private _formReactiveContentOriginal: IDictionary<FormGroup | IDictionary<FormGroup>> = {};
  // Id Scheme della form selezionata se l'elemento di primo livello e' ripetibile
  private _currentSelectedId: string;

  private _currentSelectedLabelId: string;
  // Pulsantiera
  private _buttons: SdkButtonGroupInput;
  private _modalConfig: SdkModalConfig<OutputRestModalConfig, void, any>;
  private _modalConfigCvsValidation: SdkModalConfig<OutputCvsValidationModalConfig, void, any>;
  private _action: string;
  private _case: string = null; // informa su che operazione si sta facendo (es.: NEW-LOT)
  private _sidebarConfig: SdkSidebarConfig;
  private _lookupMap: Map<string, any>;
  private _selectedNoticeSubtype: IDictionary<any>;
  private _edit: boolean = false;

  private _copyOfSelectedNoticeTypeContent: any;

  public selectedLang: string = 'it';

  // Notice metadata
  public firstMetadata: any;
  // Notice data
  public firstElement: any;
  // Elemento parziale (di primo livello) selezionato e renderizzato nella form sd
  public firstElementPartial: any;
  // Codice notice selezionata
  public notice: string;
  // Booleano per il caricamento della form
  public formReady: boolean = false;
  // Elemento form reactive parziale (di primo livello) selezionato e renderizzato nella form
  public formGroup: FormGroup;
  // Elemento form reactive metadata selezionato e renderizzato nella form
  public metadataFormGroup: FormGroup;
  // Indice della form selezionata se l'elemento di primo livello e' ripetibile
  public currentGroupIndex: number;
  public formReactiveContentOriginalPassed: any;
  // Pulsantiera
  public buttonsSubj: BehaviorSubject<SdkButtonGroupInput>;
  public modalConfigObs: BehaviorSubject<SdkModalConfig<OutputRestModalConfig, void, any>> = new BehaviorSubject(null);
  public modalConfigCvsValidationObs: BehaviorSubject<SdkModalConfig<OutputCvsValidationModalConfig, void, any>> =
    new BehaviorSubject(null);
  public sidebarConfigObs: Subject<SdkSidebarConfig> = new Subject();
  public noticeInfo: NoticeInfo;
  public enoticesTranslations: IDictionary<string> = {};

  // Visualizzazione lotti sotto forma di tabella
  public buttonsLottiSubj: BehaviorSubject<SdkButtonGroupInput>;

  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
    this.listenForClickSignals();
  }

  // #region Hooks

  protected onInit(): void {
    this._action = this._activatedRoute.snapshot.queryParamMap.get('action');
    this._case = this._activatedRoute.snapshot.queryParamMap.get('case');

    if (isEmpty(this._action)) {
      this._sdkRouterService.navigateToPage('home-page');
    }

    this.locale = this._sdkLocaleService.locale;
    this.currency = this._sdkLocaleService.currency;

    // this.setUpdateState(true);

    this._sdkVersion = this._dataService.selectedSdkVersion;
    this.notice = this._dataService.selectedNotice;
    this.selectedLang = this._dataService.selectedLang;
    //this._formService.resetIdFieldMap();
    this.checkExternalIntegration();
    this.loadButtons();
    this.sendButtonsToHtml();
    this.checkFieldVisibilityButton();
    this.manageSidebar();
  }

  protected onAfterViewInit(): void {
    if (isEmpty(this.notice)) {
      this._sdkRouterService.navigateToPage('enotice-version-selector-page');
    } else {
      // Se si proviene dalla pagina di modifica della sezione...
      if (this._formDataService.changed) {
        // recupera tutte le modifiche dei dati della form
        this._formContent = cloneDeep(this._formDataService._formContentBackup);
        this._formReactiveContent = cloneDeep(this._formDataService._formReactiveContentBackup);
        this._formReactiveContentOriginal = cloneDeep(this._formDataService._formReactiveContentOriginalBackup);
        this._currentSelectedId = cloneDeep(this._formDataService._currentSelectedIdBackup);
        this._currentSelectedLabelId = cloneDeep(this._formDataService._currentSelectedLabelIdBackup);
        this.formGroup = cloneDeep(this._formDataService._formGroupBackup);
        this.currentGroupIndex = cloneDeep(this._formDataService._currentGroupIndexBackup);
        this.metadataFormGroup = cloneDeep(this._formDataService._metadataFormGroupBackup);
        this.noticeInfo = cloneDeep(this._formDataService.noticeInfo);

        this.createFormContent();
        this.loadOrganisationsNames();
        this.loadTouchpointsNames();
        this.loadLotsItems();
        this.loadResultsItems();

        // In caso si provenga da una rimozione di un lotto che si stava aggiungendo come nuovo...
        if (this._case == CANCELED_NEW_LOT) {
          // rimuove lotto dalla tabella
          this._lotsTableService.lotsItems = this._lotsTableService.lotsItems.filter(
            (lot) => lot.numero !== this.currentGroupIndex
          );

          // rimuove lotto dal form
          this.manageRemoveElementEvent({
            id: GR_LOT_ID,
            index: this._formService.generateCounter(this.currentGroupIndex)
          });

          // ripristina la visualizzazione della tabella di lotti
          this.manageFirstLevelItemToggle({
            id: GR_LOT_ID,
            label: LOTTI_LABEL
          });
        } else {
          this.preselectFirstElement();
        }

        this.disableAllForms();
        this._formService.setShouldShowAddandRemoveButtons(false);
        this.setDisableMenutabsState(false);

        if (this.isExternalIntegration) {
          // Save bozza
          let body: any = this.generateVisualModel(
            this.firstElement,
            this.firstMetadata,
            this._formReactiveContent,
            this.metadataFormGroup,
            false
          ).data;
          if (body != null) {
            body = JSON.stringify(body);

            let request: IAppaltiPersistenceRequest = {
              tipoTracciato: 'BOZZA',
              tracciato: body
            };

            this._externalIntegrationService.persistence(request).subscribe();
          }
        }
      }
      // Altrimenti... è il primo accesso alla pagina (senza aver modificato nulla)
      else {
        this._sdkHttpLoaderService.showLoader(SdkHttpLoaderType.Operation);
        this._formService.resetIdFieldMap();

        this.loadSingleNoticeType()
          .pipe(
            tap(this.elaborateSingleNoticeType),
            tap(() => this._dataService.initializeConditions()),
            mergeMap(this.loadTypesTranslations),
            tap(this.elaborateTypesTranslations),
            mergeMap(this.loadSubNoticeTypes),
            tap(this.elaborateSubNoticeTypes),
            tap(this.elaborateRequiredFields), // campi ritenuti obbligatori/required, mostrati con (*)
            tap(this.elaborateSuggestedFields), // campi ritenuti solo suggested (non necessari ai fini della validazione XSD)
            tap(this.createMapForFutureLookupOfValues),
            tap(this.createFormContent),
            tap(this.createAllFormGroupAndAllFormReactiveContent),
            tap(this.fillFormReactiveContentWithSavedValues),
            tap(this.elaborateFirstLevelGroups),
            tap(this.fillInfoReactive),
            tap(this.loadOrganisationsNames),
            tap(this.loadTouchpointsNames),
            tap(this.preselectFirstElement),
            concatMap(() => {
              this.loadLotsItems(); // carica i lotti per la visualizzazione sotto forma di tabella
              this.loadResultsItems();
              this.disableAllForms();
              this._formService.makeAllFormControlValid(this._formReactiveContent);
              this._formService.setShouldShowAddandRemoveButtons(false);
              this.setDisableMenutabsState(false);
              return of(null);
            })
          )
          .subscribe({
            error: () => this._sdkHttpLoaderService.hideLoader(),
            complete: () => this._sdkHttpLoaderService.hideLoader()
          });
      }
    }
  }

  protected onDestroy(): void {}

  protected onConfig(config: any): void {
    if (config != null) {
      this.config = { ...config };

      // output-rest-modal-widget
      this._modalConfig = {
        code: 'modal',
        title: '',
        openSubject: new Subject(),
        component: 'output-rest-modal-widget'
      };
      this.modalConfigObs.next(this._modalConfig);

      // output-csv-validation-modal-widget
      this._modalConfigCvsValidation = {
        code: 'modal',
        title: '',
        openSubject: new Subject(),
        component: 'output-csv-validation-modal-widget',
        width: 85,
        focusContent: false
      };
      this.modalConfigCvsValidationObs.next(this._modalConfigCvsValidation);

      // output-validation-internal-sidebar-widget
      if (isObject(get(this.config.body, 'sidebar'))) {
        this._sidebarConfig = get(this.config.body, 'sidebar');
        this._sidebarConfig.openSubject = new Subject();
        this.sidebarConfigObs.next(this._sidebarConfig);
      }

      this.initDialog();
      this.isReady = true;
    }
  }

  protected onUpdateState(_state: boolean): void {}

  // #endregion

  // #region Public

  /**
   * Esegue l'azione definita dal bottone
   * @param button Output di uno dei bottoni della pulsantiera
   */
  public async onButtonClick(button: SdkButtonGroupOutput) {
    if (button != null) {
      let executeValidation: boolean = false;

      if (button.code == 'back-to-lista-enotice') {
        this.initDialog();
        if (this._edit) {
          this.setDisableMenutabsState(false);
          this.buttonsSubj.next(this._buttons);
          this.disableAllForms();
          this._formService.setShouldShowAddandRemoveButtons(false);
          this._edit = false;
        } else {
          this._dialogConfig.open.next(() => {
            this.setUpdateState(false);
            this._formDataService.changed = false;
            this._sdkRouterService.navigateToPage('enotice-selector-page');
          });
        }
      } else if (button.code == 'modifica-pagina') {
        this.setUpdateState(false);

        // Salva in FormDataService tutta la form corrente
        this._formDataService._formContentBackup = cloneDeep(this._formContent);
        this._formDataService._formReactiveContentBackup = cloneDeep(this._formReactiveContent);
        this._formDataService._formReactiveContentOriginalBackup = cloneDeep(this._formReactiveContentOriginal);
        this._formDataService._currentSelectedIdBackup = cloneDeep(this._currentSelectedId);
        this._formDataService._currentSelectedLabelIdBackup = cloneDeep(this._currentSelectedLabelId);
        this._formDataService._formGroupBackup = cloneDeep(this.formGroup);
        this._formDataService._metadataFormGroupBackup = cloneDeep(this.metadataFormGroup);
        this._formDataService._currentGroupIndexBackup = cloneDeep(this.currentGroupIndex);
        this._formDataService.noticeInfo = cloneDeep(this.noticeInfo);

        if (this._currentSelectedLabelId == 'GR-NoticeResult-Section') {
          this._formDataService._resultsInnerKey = null;
        }

        //chiudo il menu a sinistra e prendo le coordinate y per scrollare su queste coordinate una volta caricata la pagina di edit-page
        let latestState: boolean;

        let sub = this.disableMenuTabsService$.subscribe((state) => {
          latestState = cloneDeep(state);
        });
        sub.unsubscribe();

        if (latestState == false) {
          this.setDisableMenutabsState(true);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const scrollContainer = document.querySelector(
          '.element-tabs-container.main-content.sdk-layout-content-section.with-tabs.ng-star-inserted'
        ) as HTMLElement;
        //this._scrollService.coordinateY = scrollContainer.scrollTop + scrollContainer.clientHeight / 2;
        this._scrollService.coordinateY = scrollContainer.scrollTop;

        let params: IDictionary<any> = {
          action: this._action,
          readOnly: false
        };
        this._sdkRouterService.navigateToPage('edit-page-enotice-page', params);
      } /*else if (button.code == 'save-pagina') {
        this.setDisableMenutabsState(false);
        this.buttonsSubj.next(this._buttonsDetail);
        this.disableAllForms();
        this._formService.setShouldShowAddandRemoveButtons(false);
        this._edit = false;

        if (this.isExternalIntegration) {
          // Save bozza
          this._sdkHttpLoaderService.showLoader(SdkHttpLoaderType.Operation);
          let body: any = this.generateVisualModel(
            this.firstElement,
            this.firstMetadata,
            this._formReactiveContent,
            this.metadataFormGroup,
            executeValidation
          ).data;
          if (body != null) {
            body = JSON.stringify(body);

            let request: IAppaltiPersistenceRequest = {
              tipoTracciato: 'BOZZA',
              tracciato: body
            };

            this._externalIntegrationService.persistence(request).subscribe({
              complete: () => {
                this._sdkHttpLoaderService.hideLoader();
              }
            });
          }
        }
      }*/ else if (button.code == 'toggle-visibility') {
        let visibility = this._formService.toggleVisibility();
        // cambia label al pulsante in base alla visibiliy

        if (visibility) {
          this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').label = 'BUTTONS.SHOW-OPTIONAL-FIELDS';
        } else {
          this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').label = 'BUTTONS.HIDE-OPTIONAL-FIELDS';
        }
      } else if (button.code == 'genera-json') {
        let body: any = this.generateVisualModel(
          this.firstElement,
          this.firstMetadata,
          this._formReactiveContent,
          this.metadataFormGroup,
          executeValidation
        ).data;

        if (body != null && !executeValidation) {
          body = JSON.stringify(body);

          let fileName: string =
            'Appalti&Contratti_M-eForms_' +
            this.metadataFormGroup.get(Constants.StandardIdentifiers.NOTICE_UUID_FIELD).value +
            '.json';
          this.downloadFile(body, SdkDocumentUtils.getMimeTypeFromExtension('json'), fileName);

          // let outputModalConfig: OutputRestModalConfig = {
          //   type: 'JSON',
          //   content: body
          // };

          // this.configureAndOpenModal(outputModalConfig);
        }
      } else if (button.code == 'validazione-interna') {
        executeValidation = true;
        let visualModelOutput: IVisualModelOutput = this.generateVisualModel(
          this.firstElement,
          this.firstMetadata,
          this._formReactiveContent,
          this.metadataFormGroup,
          executeValidation
        );

        // se sono presenti errori di validazioni...
        if (visualModelOutput.validation) {
          let messages: Array<string> = visualModelOutput.validation.map((err: string) => {
            return err;
          });
          // apri sidebar
          if (isObject(get(this.config.body, 'sidebar'))) {
            this._sidebarConfig.componentConfig = {
              ...this._sidebarConfig.componentConfig,
              validationErrors: messages
            };
            this.sidebarConfigObs.next(this._sidebarConfig);
            this._sidebarConfig.openSubject.next(true);
          }
        } else {
          this._sdkMessagePanelService.showInfoBox(this.messagesPanel, {
            message: 'CHECK-VISUAL-MODEL.VALIDATION-SUCCESS'
          });
        }
      } else if (button.code == 'genera-xml') {
        executeValidation = true;

        let body: any = this.generateVisualModel(
          this.firstElement,
          this.firstMetadata,
          this._formReactiveContent,
          this.metadataFormGroup,
          executeValidation
        ).data;
        if (body != null) {
          this._apiService.xmlGeneration(body).subscribe((response: ResponseResult<any>) => {
            console.log('response >>>', response);
            body = JSON.stringify(body);

            let fileName: string =
              'Appalti&Contratti_M-eForms_' +
              this.metadataFormGroup.get(Constants.StandardIdentifiers.NOTICE_UUID_FIELD).value +
              '.xml';
            this.downloadFile(response.data.xml, SdkDocumentUtils.getMimeTypeFromExtension('xml'), fileName);

            // let outputModalConfig: OutputRestModalConfig = {
            //   type: 'XML',
            //   content: response.data.xml
            // };

            // this.configureAndOpenModal(outputModalConfig);
          });
        }
        /*} else if (button.code == 'validazione-xsd') {
          let outputModalConfig: OutputRestModalConfig = {
            type: 'XSD-VALIDATION',
            content: null
          };
  
          let body: any = this.generateVisualModel(
          this.firstElement,
          this.firstMetadata,
          this._formReactiveContent,
          this.metadataFormGroup,
          executeValidation
        );
          if (body != null && !executeValidation) {
            this._apiService.xsdValidation(body).subscribe({
              next: (response: ResponseResult<any>) => {
                console.log('response >>>', response);
                outputModalConfig.content = JSON.stringify(
                  response.data,
                  null,
                  4
                );
                this.configureAndOpenModal(outputModalConfig);
              },
              error: (response: HttpErrorResponse) => {
                let error: any = response.error;
                console.log('error >>>', error);
                outputModalConfig.content = error.message;
                this.configureAndOpenModal(outputModalConfig);
              }
            });
          }*/
      } else if (button.code == 'validazione-cvs') {
        this._scrollService.reset();
        this._checkService.reset();
        this._checkService.loadData(this.config.dataForCustomCheckService);
        const passedCustomChecks: CustomChecks = this._checkService.findErrors(this._formReactiveContent);
        let outputModalConfig: OutputCvsValidationModalConfig = {
          type: 'CVS-VALIDATION',
          content: null,
          idTracciatura: null
        };
        if (passedCustomChecks.passedChecks == false && passedCustomChecks.cvsOutputDTO != null) {
          //Vedi EFORMS-72
          //Se non passa la validazione "custom", allora mostro all'utente una tabella con gli errori trovati.
          this._sdkHttpLoaderService.showLoader(SdkHttpLoaderType.Operation);
          outputModalConfig.content = {
            cvsResult: passedCustomChecks.cvsOutputDTO
          };
          this._sdkHttpLoaderService.hideLoader();
          this.configureAndOpenCvsValidationModal(outputModalConfig);
        } else {
          let body: any = this.generateVisualModel(
            this.firstElement,
            this.firstMetadata,
            this._formReactiveContent,
            this.metadataFormGroup,
            executeValidation
          ).data;
          if (body != null && !executeValidation) {
            this._sdkHttpLoaderService.showLoader(SdkHttpLoaderType.Operation);
            this._apiService
              .cvsValidation(body, this._dataService.selectedSdkVersion, this._dataService.selectedLang)
              .subscribe({
                next: (response: ResponseResult<CvsOutputDTO>) => {
                  console.log('response >>>', response);
                  this.invalidateErrorFields(response.data);
                  this._sdkHttpLoaderService.hideLoader();
                  outputModalConfig.content = {
                    cvsResult: response.data,
                    visualModel: body
                  };
                  this.configureAndOpenCvsValidationModal(outputModalConfig);
                },
                error: (response: HttpErrorResponse) => {
                  this._sdkHttpLoaderService.hideLoader();
                  let error: any = response.error;
                  console.log('error >>>', error);

                  let panelMessage: string;
                  try {
                    // Errore dal servizio di TED
                    let parsedMessage = JSON.parse(error.message);
                    panelMessage =
                      this._translateService.instant('ERRORS.ERRORE-GENERICO-TED') +
                      parsedMessage.errorCode +
                      ' - ' +
                      parsedMessage.message +
                      ' (ID tracciatura: ' +
                      error.traceId +
                      ')';
                  } catch (e) {
                    // Errore di validazione XSD
                    panelMessage =
                      this._translateService.instant('ERRORS.ERRORE-VALIDAZIONE-XSD') +
                      ' (ID tracciatura: ' +
                      error.traceId +
                      ')';
                  }

                  let messages: Array<SdkMessagePanelTranslate> = [
                    {
                      message: panelMessage
                    }
                  ];
                  this._sdkMessagePanelService.showError(this.messagesPanel, messages);
                }
              });
          }
        }
      } else if (button.code == 'preview-pdf') {
        this._sdkHttpLoaderService.showLoader(SdkHttpLoaderType.Operation);
        let body: any = this.generateVisualModel(
          this.firstElement,
          this.firstMetadata,
          this._formReactiveContent,
          this.metadataFormGroup,
          false
        ).data;

        if (body != null) {
          // Validazione XSD prima del download dell'anteprima PDF
          this._apiService.xsdValidation(body).subscribe({
            next: (response: ResponseResult<any>) => {
              console.log('response >>>', response);

              // Download dell'anteprima PDF (se validazione XSD andata a buon fine)
              this._apiService.pdfPreview(body).subscribe({
                next: (response: Observable<any>) => {
                  this._sdkHttpLoaderService.hideLoader();
                  console.log('response >>>', response);
                  // download del file
                  let fileName: string =
                    'Appalti&Contratti_M-eForms_' +
                    this.metadataFormGroup.get(Constants.StandardIdentifiers.NOTICE_UUID_FIELD).value +
                    '.pdf';
                  this.downloadFile(response, SdkDocumentUtils.getMimeTypeFromExtension('pdf'), fileName);
                },
                error: (response: HttpErrorResponse) => {
                  this._sdkHttpLoaderService.hideLoader();
                  let error: any = response.error;
                  console.log('error >>>', error);

                  let messages: Array<SdkMessagePanelTranslate> = [
                    {
                      message: this._translateService.instant('ERRORS.ERRORE-GENERICO-ANTEPRIMA-PDF')
                    }
                  ];
                  this._sdkMessagePanelService.showError(this.messagesPanel, messages);
                }
              });
            },
            error: (response: HttpErrorResponse) => {
              this._sdkHttpLoaderService.hideLoader();
              let error: any = response.error;
              console.log('error >>>', error);

              let messages: Array<SdkMessagePanelTranslate> = [
                {
                  message:
                    this._translateService.instant('ERRORS.ERRORE-VALIDAZIONE-XSD') +
                    ' (ID tracciatura: ' +
                    error.traceId +
                    ')'
                }
              ];
              this._sdkMessagePanelService.showError(this.messagesPanel, messages);
            }
          });
        }
      } else if (button.code == 'save-bozza') {
        this.initBozzaDialog();

        this._dialogConfig.open.next(() => {
          this._sdkHttpLoaderService.showLoader(SdkHttpLoaderType.Operation);
          let body: any = this.generateVisualModel(
            this.firstElement,
            this.firstMetadata,
            this._formReactiveContent,
            this.metadataFormGroup,
            executeValidation
          ).data;
          if (body != null) {
            body = JSON.stringify(body);

            let request: IAppaltiPersistenceRequest = {
              tipoTracciato: 'BOZZA',
              tracciato: body
            };

            this._sdkMessagePanelService.clear(this.messagesPanel);
            this._externalIntegrationService.persistence(request).subscribe({
              next: (response: IAppaltiBaseResponse) => {
                this._sdkHttpLoaderService.hideLoader();
                console.log(response);
                this._sdkMessagePanelService.showSuccess(this.messagesPanel, [
                  {
                    message: 'BOZZA-JSON-XML.SAVE-BOZZA-SUCCESS'
                  }
                ]);
              },
              error: (err) => {
                this._sdkHttpLoaderService.hideLoader();
                console.error(err);
                this._sdkMessagePanelService.showSuccess(this.messagesPanel, [
                  {
                    message: 'BOZZA-JSON-XML.SAVE-BOZZA-FAILURE'
                  }
                ]);
              }
            });
          }
        });
      } else if (button.code == 'add-new-lot') {
        // aggiunge nuovo elemento alla form
        this.manageAddElementEvent(GR_LOT_ID);

        this.setUpdateState(false);

        // Salva in FormDataService tutta la form corrente
        this._formDataService._formContentBackup = cloneDeep(this._formContent);
        this._formDataService._formReactiveContentBackup = cloneDeep(this._formReactiveContent);
        this._formDataService._formReactiveContentOriginalBackup = cloneDeep(this._formReactiveContentOriginal);
        this._formDataService._currentSelectedIdBackup = cloneDeep(this._currentSelectedId);
        this._formDataService._currentSelectedLabelIdBackup = cloneDeep(this._currentSelectedLabelId);
        this._formDataService._formGroupBackup = cloneDeep(
          this._formReactiveContent[GR_LOT_ID][this._currentSelectedLabelId]
        );
        this._formDataService._metadataFormGroupBackup = cloneDeep(this.metadataFormGroup);
        this._formDataService._currentGroupIndexBackup = cloneDeep(this.currentGroupIndex);
        this._formDataService.noticeInfo = cloneDeep(this.noticeInfo);

        let params: IDictionary<any> = {
          action: this._action,
          readOnly: false,
          case: NEW_LOT
        };
        this._sdkRouterService.navigateToPage('edit-page-enotice-page', params);
      } else if (button.code == 'add-new-results-parte-offerente') {
        // aggiunge nuovo elemento alla form
        this.manageAddElementEvent(GR_RESULT_ID);

        this.setUpdateState(false);

        // Salva in FormDataService tutta la form corrente
        this._formDataService._formContentBackup = cloneDeep(this._formContent);
        this._formDataService._formReactiveContentBackup = cloneDeep(this._formReactiveContent);
        this._formDataService._formReactiveContentOriginalBackup = cloneDeep(this._formReactiveContentOriginal);
        this._formDataService._currentSelectedIdBackup = cloneDeep(this._currentSelectedId);
        this._formDataService._currentSelectedLabelIdBackup = cloneDeep(this._currentSelectedLabelId);
        this._formDataService._metadataFormGroupBackup = cloneDeep(this.metadataFormGroup);
        this._formDataService._currentGroupIndexBackup = cloneDeep(this.currentGroupIndex);
        this._formDataService.noticeInfo = cloneDeep(this.noticeInfo);

        let params: IDictionary<any> = {
          action: this._action,
          readOnly: false,
          case: NEW_PARTE_OFFERENTE
        };
        this._sdkRouterService.navigateToPage('edit-page-enotice-page', params);
      } else if (button.code == 'add-new-results-appalto') {
        // aggiunge nuovo elemento alla form
        this.manageAddElementEvent(GR_RESULT_ID);

        this.setUpdateState(false);

        // Salva in FormDataService tutta la form corrente
        this._formDataService._formContentBackup = cloneDeep(this._formContent);
        this._formDataService._formReactiveContentBackup = cloneDeep(this._formReactiveContent);
        this._formDataService._formReactiveContentOriginalBackup = cloneDeep(this._formReactiveContentOriginal);
        this._formDataService._currentSelectedIdBackup = cloneDeep(this._currentSelectedId);
        this._formDataService._currentSelectedLabelIdBackup = cloneDeep(this._currentSelectedLabelId);
        this._formDataService._metadataFormGroupBackup = cloneDeep(this.metadataFormGroup);
        this._formDataService._currentGroupIndexBackup = cloneDeep(this.currentGroupIndex);
        this._formDataService.noticeInfo = cloneDeep(this.noticeInfo);

        let params: IDictionary<any> = {
          action: this._action,
          readOnly: false,
          case: NEW_APPALTO
        };
        this._sdkRouterService.navigateToPage('edit-page-enotice-page', params);
      } else if (button.code == 'add-new-results-offerta') {
        // aggiunge nuovo elemento alla form
        this.manageAddElementEvent(GR_RESULT_ID);

        this.setUpdateState(false);

        // Salva in FormDataService tutta la form corrente
        this._formDataService._formContentBackup = cloneDeep(this._formContent);
        this._formDataService._formReactiveContentBackup = cloneDeep(this._formReactiveContent);
        this._formDataService._formReactiveContentOriginalBackup = cloneDeep(this._formReactiveContentOriginal);
        this._formDataService._currentSelectedIdBackup = cloneDeep(this._currentSelectedId);
        this._formDataService._currentSelectedLabelIdBackup = cloneDeep(this._currentSelectedLabelId);
        this._formDataService._metadataFormGroupBackup = cloneDeep(this.metadataFormGroup);
        this._formDataService._currentGroupIndexBackup = cloneDeep(this.currentGroupIndex);
        this._formDataService.noticeInfo = cloneDeep(this.noticeInfo);

        let params: IDictionary<any> = {
          action: this._action,
          readOnly: false,
          case: NEW_OFFERTA
        };
        this._sdkRouterService.navigateToPage('edit-page-enotice-page', params);
      } else if (button.code == 'add-new-results-risultato-lotto') {
        // aggiunge nuovo elemento alla form
        this.manageAddElementEvent(GR_RESULT_ID);

        this.setUpdateState(false);

        // Salva in FormDataService tutta la form corrente
        this._formDataService._formContentBackup = cloneDeep(this._formContent);
        this._formDataService._formReactiveContentBackup = cloneDeep(this._formReactiveContent);
        this._formDataService._formReactiveContentOriginalBackup = cloneDeep(this._formReactiveContentOriginal);
        this._formDataService._currentSelectedIdBackup = cloneDeep(this._currentSelectedId);
        this._formDataService._currentSelectedLabelIdBackup = cloneDeep(this._currentSelectedLabelId);
        this._formDataService._metadataFormGroupBackup = cloneDeep(this.metadataFormGroup);
        this._formDataService._currentGroupIndexBackup = cloneDeep(this.currentGroupIndex);
        this._formDataService.noticeInfo = cloneDeep(this.noticeInfo);

        let params: IDictionary<any> = {
          action: this._action,
          readOnly: false,
          case: NEW_RISULTATO_LOTTO
        };
        this._sdkRouterService.navigateToPage('edit-page-enotice-page', params);
      }
    }
  }

  // Gestione del cambio pagina nella tabella di lotti
  public onPageChangeLot(event: TablePageEvent) {
    this._lotsTableService.first = event.first;
    this._lotsTableService.rows = event.rows;
  }

  public onPageChangeAppalti(event: TablePageEvent) {
    this._resultsTableService.firstAppalti = event.first;
    this._resultsTableService.rowsAppalti = event.rows;
  }

  public onPageChangeOfferte(event: TablePageEvent) {
    this._resultsTableService.firstOfferte = event.first;
    this._resultsTableService.rowsOfferte = event.rows;
  }

  public onPageChangePartiOfferenti(event: TablePageEvent) {
    this._resultsTableService.firstPartiOfferenti = event.first;
    this._resultsTableService.rowsPartiOfferenti = event.rows;
  }

  public onPageChangeRisultatiLotti(event: TablePageEvent) {
    this._resultsTableService.firstRisultatiDeiLotti = event.first;
    this._resultsTableService.rowsRisultatiDeiLotti = event.rows;
  }

  private downloadFile(data: any, type: string, filename: string) {
    const url = window.URL.createObjectURL(new Blob([data], { type: type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  // #endregion

  // #region Private

  // Metodo che recupera la lista dei campi suggeriti e crea una mappa con chiave enotice-type
  private elaborateSuggestedFields = () => {
    this.parseSuggestedFields(this.config);
  };

  // Metodo che recupera la lista dei campi required, mostrati nella form con (*)
  private elaborateRequiredFields = () => {
    if (isObject(get(this.config, 'requiredFields'))) {
      this._dataService.elaborateRequiredFields(get(this.config, 'requiredFields'));
    }
  };

  private loadTypesTranslations = () => {
    let id: string = 'OPP-070-notice';

    let field = this._dataService.basicMetaDataFields[id];

    let codeListId: string = field.codeList.value.id;

    return this._apiService.loadCodeLists(this._sdkVersion, this._dataService.selectedLang, codeListId);
  };

  private elaborateTypesTranslations = (response: ResponseResult<IDictionary<any>>) => {
    let data: IDictionary<any> = response.data;
    data?.codes.forEach((one: any) => {
      this.enoticesTranslations[one.codeValue] = one[this._dataService.selectedLang];
    });
  };

  /**
   * Carica in api service la singola notice
   * @returns la singola notice
   */
  private loadSingleNoticeType = () => {
    return this._apiService.loadSingleNoticeType(this._sdkVersion, this.notice);
  };

  /**
   * Crea una copia dei dati originali ed inserisce i dati nel dataservice
   * @param response la singola notice in input
   */
  private elaborateSingleNoticeType = (response: ResponseResult<IDictionary<any>>) => {
    let data: IDictionary<any> = response.data;
    this._copyOfSelectedNoticeTypeContent = cloneDeep(data);
    this._dataService.selectedNoticeType = data;
  };

  private loadSubNoticeTypes = () => {
    return this._apiService.loadNoticeSubTypes(this._sdkVersion);
  };

  private elaborateSubNoticeTypes = (response: ResponseResult<NoticeSubtypesDetailDTO>) => {
    this._selectedNoticeSubtype = response.data.noticeSubTypes.find((one: IDictionary<any>) => {
      return one.subTypeId == this.notice;
    });
    this._dataService.selectedNoticeSubType = this._selectedNoticeSubtype;
  };

  /**
   * Crea 1 mappa.
   */
  private createMapForFutureLookupOfValues = () => {
    this._lookupMap = new Map<string, any>();

    //creo mappe dal json in upload
    this.createLookupMap(this._dataService.uploadedJsonContent);

    // Check se c'e' la rettifica
    if (this._dataService.uploadedJsonContent?.children[1]?.children != null) {
      let rettifica: boolean =
        (this._dataService.uploadedJsonContent?.children[1]?.children as Array<IVisualModelElement>).findIndex(
          (c: IVisualModelElement) => c.contentId == Constants.StandardIdentifiers.RETTIFICA_GROUP
        ) > -1;
      this._dataService.standaloneRettifica = rettifica;
    }
  };

  private findLabelIdArrayFromJsonByNoticeId(c, position?): any {
    let result: Array<string> = [];
    this._dataService.uploadedJsonContent.children[1].children.forEach((child) => {
      if (child.contentId == c.id) {
        result.push(cloneDeep(child.labelId));
      }
    });
    return result;
  }

  /**
   * Crea il FormContent per ogni elemento che viene mostrato nell'accordion a sinistra
   *
   * Popola firstMetadata e firstElement.
   */
  private createFormContent = () => {
    let content = [...this._dataService.selectedNoticeType.content];
    if (!this.isRettifica) {
      // Rimuovo la sezione di rettifica se non sono in rettifica
      content = content.filter((c: any) => c.id != Constants.StandardIdentifiers.RETTIFICA_GROUP);
    }
    content = content.map((c: any) => {
      // if (c.id != 'GR-LotsGroup') {
      //   c = this._formService.elaborateIdFields(c);
      // }
      if (!this._formDataService.changed) {
        c = this._formService.checkFieldAttributes(c);
      }

      this._formContent[c.id] = c;

      if (c._repeatable) {
        this._formContent[c.id].firstLevel = true;
      }

      return c;
    });

    this.firstMetadata = {
      id: 'notice-metadata',
      contentType: Constants.ContentType.METADATA_CONTAINER,
      content: this._dataService.selectedNoticeType.metadata,
      _label: 'editor.the.metadata'
    };
    this.firstElement = {
      id: 'notice-data',
      contentType: Constants.ContentType.DATA_CONTAINER,
      content,
      _label: 'editor.the.root'
    };
  };

  /**
   * Crea la lookup map dei valori con cui popoleremo il form
   */
  private createLookupMap(jsonContent: any, parentPath: string = '') {
    if (!jsonContent) return;

    let currentPath;
    if (parentPath && jsonContent.labelId) {
      currentPath = `${parentPath}/${jsonContent.contentId}#${jsonContent.labelId}*${jsonContent.contentCount}`;
    } else if (parentPath) {
      currentPath = `${parentPath}/${jsonContent.contentId}*${jsonContent.contentCount}`;
    } else {
      currentPath = `${jsonContent.contentId}*${jsonContent.contentCount}`;
    }

    this._lookupMap.set(currentPath, cloneDeep(jsonContent));

    if (jsonContent.children && Array.isArray(jsonContent.children)) {
      jsonContent.children.forEach((child: any) => {
        this.createLookupMap(child, currentPath);
      });
    }
  }

  /**
   * Cerca di trovare una chiave valida nella mappa partendo da una stringa completa.
   * Il metodo utilizza diverse strategie di ricerca in ordine di precisione:
   *
   * 1. Cerca una corrispondenza esatta nella mappa
   * 2. Cerca percorsi che:
   *    - Terminano con l'ultima parte della stringa input
   *    - Contengono tutte le parti della stringa input in sequenza
   * 3. Se trova più corrispondenze, seleziona quella più specifica (più lunga)
   * 4. Come ultima risorsa, cerca di costruire un percorso parziale valido
   *
   * Esempio:
   * Input: 'notice-root*1/notice-data*1/GR-GroupFramework*1'
   * Possibile chiave nella mappa: 'notice-root*1/notice-data*1/GR-Result*1/GR-GroupFramework*1'
   * -> Trova la corrispondenza corretta anche se nell'input mancano parti intermedie
   *
   * @param fullString La stringa completa del percorso da cercare
   * @returns La chiave valida trovata nella mappa
   */
  private findWorkingKey(fullString: string): string {
    const parts = fullString.split('/');
    const targetEndPart = parts[parts.length - 1];

    // Convert map keys to array for easier filtering
    const mapKeys = Array.from(this._lookupMap.keys());

    // First try: exact match
    if (this._lookupMap.has(fullString)) {
      return fullString;
    }

    // Second try: find paths that end with the target and contain all parts in sequence
    const potentialMatches = mapKeys.filter((mapKey) => {
      const mapParts = mapKey.split('/');

      // Check if the key ends with the target part
      if (!mapKey.endsWith(targetEndPart)) {
        return false;
      }

      // Check if all parts from the input string exist in sequence in the map key
      let mapIndex = 0;
      for (const part of parts) {
        // Find the next occurrence of the current part
        while (mapIndex < mapParts.length) {
          if (mapParts[mapIndex].includes(part)) {
            break;
          }
          mapIndex++;
        }

        // If we reached the end without finding the part, this key is not a match
        if (mapIndex >= mapParts.length) {
          return false;
        }

        mapIndex++; // Move to next position for next part
      }

      return true;
    });

    // If we found exactly one match, return it
    if (potentialMatches.length === 1) {
      return potentialMatches[0];
    }

    // If we found multiple matches, try to find the most specific one
    if (potentialMatches.length > 1) {
      console.warn('Could be a bug, multiple possible matches found');
      // Sort by length (longer paths are likely more specific)
      const sorted = potentialMatches.sort((a, b) => b.length - a.length);
      return sorted[0];
    }

    // Fallback: try to find the closest partial match
    let tempPath = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const nextPath = `${tempPath}/${parts[i]}`;
      if (this._lookupMap.has(nextPath)) {
        tempPath = nextPath;
      } else if (this._lookupMap.has(nextPath + '1')) {
        tempPath = nextPath + '1';
      }
    }

    return tempPath;
  }

  /**
   * Calcola il numero di elementi ripetibili presenti nella mappa per un determinato contentId.
   * Il metodo conta quanti elementi successivi esistono nella mappa (es: element1, element2, element3, ...).
   *
   * Il processo di conteggio funziona nel seguente modo:
   * 1. Costruisce il path base usando contentId e keyLevel (se presente)
   * 2. Trova il path di lavoro corretto usando findWorkingKey
   * 3. Conta incrementalmente finché trova elementi nella mappa
   *
   * @param contentId - Identificatore del contenuto (es: 'GR-Part')
   * @param parentPath - Percorso padre completo dove cercare gli elementi
   * @param keyLevel - [Opzionale] Livello della chiave per gestire istanze multiple
   *                  dello stesso form (es: PAR-0001, PAR-0002)
   *
   * @returns Il numero totale di elementi ripetibili trovati
   *
   * @example
   * // Senza keyLevel
   * getNumberOfRepeatableElements('GR-Part', 'root/data')
   * // Cerca: root/data/GR-Part*1, GR-Part*2, ...
   *
   * // Con keyLevel
   * getNumberOfRepeatableElements('GR-Part', 'root/data', 'PAR-0001')
   * // Cerca: root/data/GR-Part#PAR-0001*1, GR-Part#PAR-0001*2, ...
   *
   */
  private getNumberOfRepeatableElements(contentId: string, parentPath: string, keyLevel?: string): number {
    // Costruisce il path base in base alla presenza del keyLevel
    const basePath = keyLevel ? `${parentPath}/${contentId}#${keyLevel}*1` : `${parentPath}/${contentId}*1`;

    // Trova il path di lavoro corretto e rimuove l'ultimo caratterere
    const workingPath = this.findWorkingKey(basePath).slice(0, -1);

    // Conta gli elementi ripetibili
    let count = 0;
    let index = 1;

    while (this._lookupMap.has(workingPath + index)) {
      count++;
      index++;
    }

    // Verifica che sia stato trovato almeno un elemento
    if (count === 0) {
      console.error(`Nessun elemento ripetibile trovato per il path: ${workingPath}`);
    }

    return count;
  }

  private listenForClickSignals() {
    effect(
      () => {
        const navigationState = this._scrollService.clickFirstLevelItem();
        if (navigationState.navigate && navigationState.target) {
          //Mi assicuro che anche i campi facoltativi siano visibili.
          if (this._formService.checkVisibility() == true) {
            let button: SdkButtonGroupOutput = {
              code: 'toggle-visibility'
            };
            this.onButtonClick(button);

            //forzo la change detection
            let currentValue = this.buttonsSubj.getValue();
            this.buttonsSubj.next(currentValue);
          }
          if (navigationState.target.id == GR_LOT_ID) {
            this.dettaglioLotto(null, navigationState.target);
          } else if (navigationState.target.id == GR_RESULT_ID) {
            switch (navigationState.target.key) {
              // Parti offerenti
              case 'GR-TenderingParty-Section':
                this.dettaglioParteOfferente(null, navigationState.target);
                break;
              // Appalti
              case 'GR-SettledContract-Section':
                this.dettaglioAppalto(null, navigationState.target);
                break;
              // Offerte
              case 'GR-LotTender-Section':
                this.dettaglioOfferta(null, navigationState.target);
                break;
              // Risultati dei lotti
              case 'GR-LotResult-Section':
                this.dettaglioRisultatoDelLotto(null, navigationState.target);
                break;
              default:
                this.manageFirstLevelItemToggle(navigationState.target);
                break;
            }
          } else {
            this.manageFirstLevelItemToggle(navigationState.target);
          }

          this._scrollService.resetNavigation();
        }
      },
      { allowSignalWrites: true }
    );
  }

  private invalidateErrorFields(data: any): void {
    //Resetto le mappe
    this._scrollService.reset();

    let failedAsserts = data.items.filter((element) => {
      return element.index.startsWith('KO') && element.role === 'ERROR';
    });

    this._scrollService.failedAsserts = failedAsserts;

    this.checkFormControlValues(this._formReactiveContent, []);
  }

  private checkFormControlValues(form: any, keys: number[], indexRep?: number, pathReactive?: string): void {
    if (form instanceof FormControl) {
      const parentFormGroup = form?.parent;
      const extendedForm = form as ExtendedFormControl<InvalidField>;

      // Check if customProperties is undefined or not initialized
      if (!extendedForm.customProperties) {
        extendedForm.customProperties = {
          invalid: signal(false)
        } as InvalidField;
      } else if (!extendedForm.customProperties.invalid) {
        extendedForm.customProperties.invalid = signal(false);
      }

      extendedForm.customProperties.invalid.set(false);

      // Find the key of this FormControl within its parent
      let controlKey = '';
      if (parentFormGroup) {
        Object.keys(parentFormGroup.controls).forEach((key) => {
          if (parentFormGroup.controls[key] === form) {
            controlKey = key;
          }
        });
      }

      // Check if this control matches any failed assertion
      this._scrollService.failedAsserts.forEach((failed) => {
        const idToFind = failed.see;
        const indici: number[] = failed.indiciSezioni || [];
        if (controlKey == idToFind && this.arraysEqual(keys, indici, indexRep)) {
          //Capisco su quale firstLevelItem devo cliccare se l'utente preme il bottone per scoprire dov'è l'errore
          const parts = pathReactive.split('#');
          let finalTarget: AccordionOutput = {
            id: parts[0]
          };
          let itemToClick = cloneDeep(
            this._formService.firstLevelItems.find((item) => {
              return item.id === parts[0];
            })
          );
          let indexTarget;
          if (itemToClick.items != null && itemToClick.items.length > 0) {
            indexTarget = itemToClick.items.find((item) => {
              return item.labelId === parts[1];
            });
          }

          if (finalTarget.id == GR_RESULT_ID) {
            switch (parts[1]) {
              // Parti offerenti
              case 'GR-TenderingParty-Section':
                let tenderingParty =
                  this._formReactiveContent[GR_RESULT_ID].controls['GR-TenderingParty-Section'].controls[
                    'GR-TenderingParty'
                  ].controls[parts[3]].controls['OPT-210-Tenderer'].value;

                finalTarget.index = tenderingParty.split('-')[1];
                finalTarget.label = indexTarget.label;
                finalTarget.key = indexTarget.key;
                break;

              // Appalti
              case 'GR-SettledContract-Section':
                let settledContract =
                  this._formReactiveContent[GR_RESULT_ID].controls['GR-SettledContract-Section'].controls[
                    'GR-SettledContract'
                  ].controls[parts[3]].controls['GR-SettledContract-1'].controls['OPT-316-Contract'].value;

                finalTarget.index = settledContract.split('-')[1];
                finalTarget.label = indexTarget.label;
                finalTarget.key = indexTarget.key;
                break;

              // Offerte
              case 'GR-LotTender-Section':
                let lotTender =
                  this._formReactiveContent[GR_RESULT_ID].controls['GR-LotTender-Section'].controls['GR-LotTender']
                    .controls[parts[3]].controls['GR-Tender'].controls['OPT-321-Tender'].value;

                finalTarget.index = lotTender.split('-')[1];
                finalTarget.label = indexTarget.label;
                finalTarget.key = indexTarget.key;
                break;

              // Risultati dei lotti
              case 'GR-LotResult-Section':
                let lotResult =
                  this._formReactiveContent[GR_RESULT_ID].controls['GR-LotResult-Section'].controls['GR-LotResult']
                    .controls[parts[3]].controls['OPT-322-LotResult'].value;

                finalTarget.index = lotResult.split('-')[1];
                finalTarget.label = indexTarget.label;
                finalTarget.key = indexTarget.key;
                break;

              default:
                finalTarget.index = parts[0];
                finalTarget.label = indexTarget?.label;
                finalTarget.key = indexTarget?.key;
                break;
            }
          } else {
            if (indexTarget != null) {
              finalTarget.index = parts[1].split('-')[1];
              finalTarget.label = indexTarget.label;
            } else {
              finalTarget.label = itemToClick.label;
            }
          }

          // invalido il formcontent esteso
          extendedForm.customProperties.invalid.set(true);

          // utilizzo un uuid per matchare il formcontrol originale a quello dell'item nel modale cvs
          const keyOfMaps = CryptoUtils.generateUuid();
          this._scrollService.errorFormControl.set(keyOfMaps, extendedForm);
          failed.formControl = keyOfMaps;

          // questo è il firstlevelitem su cui devo cliccare se l'utente preme il bottone per scovare dov'è l'errore
          failed.finalTarget = finalTarget;
        }
      });
    } else if (form instanceof FormGroup) {
      Object.entries(form.controls).forEach(([key, control]) => {
        this.checkFormControlValues(
          control,
          keys,
          indexRep,
          pathReactive ? pathReactive + '#' + key.toString() : key.toString()
        );
      });
    } else if (form instanceof FormArray) {
      form.controls.forEach((control: any, index: number) => {
        this.checkFormControlValues(
          control,
          [...keys, index],
          indexRep,
          pathReactive ? pathReactive + '#' + index.toString() : index.toString()
        );
      });
    } else if (form instanceof Object) {
      Object.keys(form).forEach((key, index) => {
        this.checkFormControlValues(form[key], keys, index, pathReactive ? pathReactive + '#' + key : key);
      });
    }
  }

  /**
   * Checks if all elements of array `b` are present in order within array `a`.
   * @param {number[]} a - The array to check within.
   * @param {number[]} b - The array to check for.
   * @returns {boolean} - Returns true if all elements of `b` are present in order within `a`, otherwise false.
   */
  private arraysEqual(a: number[], b: number[], index?: number): boolean {
    if (a.length == 0 && b.length == 0) {
      return true;
    }
    if (a.length < b.length && index != null) {
      //index è la index di lotto, gr-lot o part in cui siamo
      if (b[0] == index) {
        return true;
      }
    }
    let bIndex = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] === b[bIndex]) {
        bIndex++;
      }
      if (bIndex === b.length) {
        return true;
      }
    }
    return false;
  }

  /**
   * Vedi issue EFORMS-70. Carico il nome di tutti touchpoint
   */
  private loadTouchpointsNames = () => {
    // Verifico se all'interno di GR-Organisations-Section c'e' GR-Organisations-Subsection oppure direttamente GR-Organisations
    // dovrebbe essere FormArray ma se lo indico typescript si arrabbia perche' dice che non c'e' controls all'interno
    try {
      let grOrganizations: any = this._formReactiveContent['GR-Organisations-Section']?.controls['GR-Organisations']
        ? this._formReactiveContent['GR-Organisations-Section']?.controls['GR-Organisations']?.controls
        : this._formReactiveContent['GR-Organisations-Section']?.controls['GR-Organisations-Subsection'].controls[
            'GR-Organisations'
          ]?.controls;

      if (grOrganizations != null) {
        grOrganizations.forEach((control) => {
          if (control && control.controls['GR-Touch-Point']) {
            let touchpoints = control.controls['GR-Touch-Point'].controls;

            touchpoints.forEach((control) => {
              let tpo = control.controls['OPT-201-Organization-TouchPoint'].value;
              this._formService.dictionaryOfMultipleTposFormControl[tpo] =
                control.controls['BT-500-Organization-TouchPoint'];
            });
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Metodo che elabora gli elementi di primo livello da impostare nell'accordion
   */
  private elaborateFirstLevelGroups = (): void => {
    this._formService.firstLevelItems = this.firstElement.content.map((elem: any) => {
      let item: AccordionItem = {
        id: elem.id,
        label: this._dataService.getLabel(elem._label)
      };

      if (elem._repeatable) {
        if (this._formReactiveContentOriginal[elem.id] != null) {
          if (elem.id == 'GR-LotsGroup') {
            item.items = new Array<AccordionItem>();
          }
          if (this._formService.isIDictionaryOfFormGroup(this._formReactiveContent[elem.id])) {
            item.items = new Array<AccordionItem>();

            // per ogni chiave creo un elemento nel menu'
            try {
              Object.keys(this._formReactiveContent[elem.id]).forEach((key: string) => {
                let labelId = key;
                let progressivo: string = labelId?.split('-')[1] ?? null;
                let it: AccordionItem = {
                  id: elem.id,
                  label: `${this._dataService.getLabel(elem._label)} (${progressivo})`,
                  lastLevel: false,
                  index: progressivo,
                  labelId
                };
                item.items.push(it);
              });
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          console.warn('Struttura figlia che non corrisponde ad alcun form group');
        }

        // Cambia la label per accordion e breadcrumb
        if (elem.id == GR_LOT_ID) {
          item.label = LOTTI_LABEL;
        }
      }

      // Gestione custom per accordion dei "Risultati"
      if (elem.id == GR_RESULT_ID) {
        // per ogni chiave creo un elemento nel menu'
        item.items = new Array<AccordionItem>();

        try {
          let progressivo: number = 1;
          elem.content.forEach((subElem: any) => {
            let labelId = subElem.id;
            let it: AccordionItem = {
              id: elem.id,
              label: `${this._dataService.getLabel(subElem._label)}`,
              lastLevel: false,
              index: this._formService.generateCounter(progressivo),
              labelId,
              key: subElem.id
            };
            item.items.push(it);
            progressivo++;
          });
        } catch (e) {
          console.error(e);
        }
      }

      return item;
    });

    this._layoutMenuTabsMessageService.emit(this._formService.firstLevelItems);
  };

  /**
   * This method populates every value field in the form's reactive content
   * with the corresponding value from the JSON uploaded by the user.
   * It traverses through the form content and the form's reactive content,
   * then inserts values into each form control accordingly.
   */
  private fillFormReactiveContentWithSavedValues = () => {
    Object.keys(this._formContent).forEach((keyContent) => {
      Object.keys(this._formReactiveContent).forEach((keyControl) => {
        if (keyContent == keyControl && !this._formContent[keyContent]._repeatable) {
          this.insertValueIntoEachForm((this._formReactiveContent[keyControl] as any).controls);
        } else if (keyContent == keyControl && this._formContent[keyContent]._repeatable == true) {
          Object.keys(this._formReactiveContent[keyControl]).forEach((key) => {
            this.insertValueIntoEachForm((this._formReactiveContent[keyControl][key] as any).controls, key, keyControl);
          });
        }
      });
    });
  };

  /**
   * Il metodo inizializza il processamento dei form per immettere i valori,
   * infatti viene chiamato solamente dentro 'fillFormReactiveContentWithSavedValues()'
   */
  private insertValueIntoEachForm = (
    formReactiveContent: FormArray | FormGroup,
    keyLevel?: string,
    keyControl?: string
  ) => {
    Object.keys(formReactiveContent).forEach((key) => {
      if (formReactiveContent[key] instanceof FormArray) {
        if (keyLevel == null && keyControl == null) {
          this.processFormArray(formReactiveContent[key], key, 'notice-root*1/notice-data*1');
        } else {
          this.processFormArray(
            formReactiveContent[key],
            key,
            'notice-root*1/notice-data*1/' + keyControl + '#' + keyLevel + '*1',
            keyLevel
          );
        }
      } else if (formReactiveContent[key] instanceof FormGroup) {
        if (keyLevel == null && keyControl == null) {
          this.processFormGroup(formReactiveContent[key], key, 'notice-root*1/notice-data*1');
        } else {
          this.processFormGroup(
            formReactiveContent[key],
            key,
            'notice-root*1/notice-data*1/' + keyControl + '#' + keyLevel + '*1',
            keyLevel
          );
        }
      } else if (formReactiveContent[key] instanceof FormControl) {
        if (keyLevel == null && keyControl == null) {
          this.processFormControl(formReactiveContent[key], key, 'notice-root*1/notice-data*1');
        } else {
          this.processFormControl(
            formReactiveContent[key],
            key,
            'notice-root*1/notice-data*1/' + keyControl + '#' + keyLevel + '*1',
            keyLevel
          );
        }
      }
    });

    return formReactiveContent;
  };

  /**
   * Verifica la validità di un percorso confrontandolo con una mappa di riferimento.
   * Il metodo esegue i seguenti controlli in ordine:
   * 1. Verifica se il percorso esiste esattamente nella mappa
   * 2. Cerca se il percorso è contenuto come sottopercorso in una delle chiavi della mappa
   * 3. Se non trova corrispondenze, utilizza findWorkingKey per trovare il percorso più vicino possibile
   *
   * @param parentPath Il percorso da verificare
   * @returns Il percorso validato o corretto
   *
   * Esempi:
   * - Se parentPath esiste nella mappa → ritorna parentPath
   * - Se parentPath è contenuto in una chiave della mappa → ritorna parentPath
   * - Se parentPath non è trovato → cerca un percorso valido usando findWorkingKey
   */
  private checkIfPathIsValid(parentPath: string): string {
    if (this._lookupMap.has(parentPath)) {
      return parentPath;
    }

    // Verifica se il percorso è contenuto in una delle chiavi
    const isPartialMatch = Array.from(this._lookupMap.keys()).some((mapKey) => mapKey.includes(parentPath));

    // Se non troviamo corrispondenze parziali, cerchiamo un percorso alternativo
    if (!isPartialMatch) {
      return this.findWorkingKey(parentPath);
    }

    return parentPath;
  }

  /**
   * Il metodo va a creare un numero di FormArray o FormGroup pari a quanti devono esserci per popolare il form corrente.
   * Successivamente gestisce il caso in cui trova un FormArray, un FormGroup o un FormControl
   */
  private processFormArray(formArray: FormArray, contentId: string, parentPath: string, keyLevel?: any) {
    parentPath = this.checkIfPathIsValid(parentPath);
    const count = this.getNumberOfRepeatableElements(contentId, parentPath, keyLevel);
    if (count === 0) {
      console.error('Number of Repeatable elements is 0, impossible case');
      return;
    }
    const template = formArray.controls[0];
    const newControls: any[] = [];

    for (let i = 1; i <= count; i++) {
      const copy = cloneDeep(template);
      let currentPath;
      if (keyLevel == null) {
        currentPath = `${parentPath}/${contentId}*${i}`;
      } else {
        currentPath = `${parentPath}/${contentId}#${keyLevel}*${i}`;
      }

      currentPath = this.checkIfPathIsValid(currentPath);

      if (copy instanceof FormGroup || copy instanceof FormArray) {
        Object.keys(copy.controls).forEach((key) => {
          const control = copy.get(key);
          if (control instanceof FormArray) {
            this.processFormArray(control, key, currentPath, keyLevel);
          } else if (control instanceof FormGroup) {
            this.processFormGroup(control, key, currentPath, keyLevel);
          } else if (control instanceof FormControl) {
            this.processFormControl(control, key, currentPath, keyLevel);
          }
        });
      } else {
        console.error('not a controlled instance of formGroup or formArray');
      }

      newControls.push(copy);
    }

    formArray.clear();
    newControls.forEach((control) => formArray.push(control));
  }

  /**
   * Gestisco il caso in cui ci sia un FormControl per popolarlo.
   * Questo metodo contiene un algoritmo per scovare la chiave giusta basandosi sul fullPath.
   * Questo serve perchè in alcuni casi il fullPath può essere più complesso della struttura della mappa.
   *
   * Per esempio:
   *   Se fullPath è:
   *      notice-root*1/notice-data*1/GR-Part#PAR-0001*1/GR-Part-Purpose#PAR-0001*1/BT-137-Part#PAR-0001*1
   *
   *   La key giusta per prendere il valore dalla mappa in realtà è:
   *      notice-root*1/notice-data*1/GR-Part#PAR-0001*1/BT-137-Part#PAR-0001*1
   */
  private processFormControl(formControl: FormControl, key: any, parentPath: string, keyLevel?: any) {
    let fullPath;
    if (keyLevel == null) {
      fullPath = `${parentPath}/${key}*1`;
    } else {
      fullPath = `${parentPath}/${key}#${keyLevel}*1`;
    }

    let valueFromMap = this._lookupMap.get(fullPath);

    if (valueFromMap == null) {
      const correctPath = this.findWorkingKey(fullPath);
      valueFromMap = this._lookupMap.get(correctPath);

      // let parts = fullPath.split('/');
      // // const copy = cloneDeep(parts);

      // let i = 1;
      // let a = 1;
      // let tempPath = parts[0];

      // while (i < parts.length) {
      //   tempPath += `/${parts[i]}`;
      //   let partFound = false;

      //   this._lookupMap.forEach((value, mapKey) => {
      //     if (mapKey.includes(tempPath)) {
      //       if (this._lookupMap.has(tempPath)) {
      //         if (value.contentId == key) {
      //           valueFromMap = cloneDeep(value);
      //         }
      //       }
      //       partFound = true;
      //       return;
      //     }
      //   });

      //   if (!partFound) {
      //     let p1 = cloneDeep(tempPath);
      //     let p2 = p1.split('/');
      //     tempPath = p2.slice(0, a).join('/');
      //     a--;
      //   }

      //   i++;
      //   a++;
      // }
    }

    if (valueFromMap?.value !== null && valueFromMap?.value !== undefined) {
      // Salvo gli id nella mappa degli id scheme
      if (this._dataService.basicMetaDataFields[key] && this._dataService.basicMetaDataFields[key].idScheme) {
        let valueIdScheme: string = valueFromMap.value.split('-')[0];
        if (valueIdScheme == this._dataService.basicMetaDataFields[key].idScheme) {
          let progressivo: number = parseInt(valueFromMap.value.split('-')[1], 10);
          let val: string = this._formService.requestNewIdField(valueIdScheme, progressivo);
          formControl.setValue(val);
        }
      } else {
        if (isBoolean(valueFromMap.value) || isNumber(valueFromMap.value)) {
          formControl.setValue(`${valueFromMap.value}`);
        } else {
          formControl.setValue(valueFromMap.value);
        }
      }
    }
  }

  /**
   * Gestisco il caso in cui ci sia un FormGroup per mandare avanti la ricorsione.
   * In questo caso non devo fare nulla di particolare in quanto i dati vengono popolati nel processFormControl
   * Successivamente gestisce il caso in cui trova un FormArray, un FormGroup o un FormControl
   */
  private processFormGroup(formGroup: FormGroup, groupId: string, parentPath: string, keyLevel?: any) {
    parentPath = this.checkIfPathIsValid(parentPath);

    if (!formGroup || !formGroup.controls) {
      console.error('formGroup or formGroup.controls empty');
      return;
    }

    let currentPath;
    if (keyLevel == null) {
      currentPath = `${parentPath}/${groupId}*1`;
    } else {
      currentPath = `${parentPath}/${groupId}#${keyLevel}*1`;
    }

    currentPath = this.checkIfPathIsValid(currentPath);

    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormArray) {
        this.processFormArray(control, key, currentPath, keyLevel);
      } else if (control instanceof FormGroup) {
        this.processFormGroup(control, key, currentPath, keyLevel);
      } else if (control instanceof FormControl) {
        this.processFormControl(control, key, currentPath, keyLevel);
      }
    });
  }

  /**
   * Metodo che crea tutti i formGroup, assegnando i formControl in base al formContent rispettivo.
   * In seguito assegna ogni formGroup al corretto formReactiveContent.
   */
  private createAllFormGroupAndAllFormReactiveContent = () => {
    Object.keys(this._formContent).forEach((chiave: string) => {
      let selectedFormContent: any = this._formContent[chiave];

      let formGroup: FormGroup | Array<FormGroup>;

      //uso una deep Copy dello stesso formgroup per popolare il formReactive di quelli repeatable
      formGroup = this._formService.createFormGroupForSelectedFormContent(this.notice, selectedFormContent);

      if (selectedFormContent._repeatable) {
        //il metodo trova un'array di labelId, in caso di necessità futura.
        //per ora viene usato per trovare la lunghezza.
        const labelIdArray: Array<string> = this.findLabelIdArrayFromJsonByNoticeId(selectedFormContent);

        this._formReactiveContent[chiave] = {};

        for (let i = 0; i < labelIdArray.length; i++) {
          this._formReactiveContent[chiave][labelIdArray[i]] = cloneDeep(formGroup);
        }
      } else {
        this._formReactiveContent[chiave] = formGroup;
      }

      this._formReactiveContentOriginal[chiave] = cloneDeep(formGroup);
    });

    this.metadataFormGroup = this._formService.createFormGroupForSelectedFormContent(this.notice, this.firstMetadata);
  };

  //private loadAllFormReactiveContent

  private fillInfoReactive = (): void => {
    //set all the metadata from the json inside the metadataFormGroup controls
    Object.entries(this.metadataFormGroup.controls).forEach(([key, element]) => {
      const metadata = this._dataService.uploadedJsonContent.children[0].children.find((jsonMetadata: any) => {
        return jsonMetadata.contentId === key;
      });

      element.patchValue(metadata.value);
    });

    // Dates
    const currentDate = new Date();
    const isoString = currentDate.toISOString();
    this.metadataFormGroup.controls['BT-05(a)-notice']?.patchValue(isoString);
    this.metadataFormGroup.controls['BT-05(b)-notice']?.patchValue(isoString);

    // Set the BT-01-notice (for enotice X01 and X02)
    this.metadataFormGroup.controls[Constants.StandardIdentifiers.LEGAL_BASIS_TYPE_FIELD]?.patchValue(
      this._dataService.selectedNoticeSubType['legalBasis']
    );

    // Set the value of the notice Information to be displayed in the view
    this.noticeInfo = {
      description: this.enoticesTranslations[this._selectedNoticeSubtype.subTypeId],
      sdkVersion: this._dataService.selectedSdkVersion,
      subTypeId: this._dataService.uploadedJsonContent.noticeSubType,
      uuid: this._dataService.uploadedJsonContent.noticeUuid,
      noticeVersion: this.metadataFormGroup.controls[Constants.StandardIdentifiers.NOTICE_VERSION_FIELD].value
    };

    // Set the notice id.
    if (this.isRettifica) {
      let uuid: string = null;

      if (this.isExternalIntegration) {
        // se sono in un integrazione "external" prendo il nuovo uuid e lo sostituisco al precedente
        uuid = this._uuidNotice;
        // e prendo il precedente e lo patcho nella sezione della rettifica (aggiungendo il suffisso -01)
        (
          this._formReactiveContent[Constants.StandardIdentifiers.RETTIFICA_GROUP]?.controls[
            Constants.StandardIdentifiers.RETTIFICA_OLD_UUID
          ] as FormControl
        )?.patchValue(`${this._uuidRettifica}-01`);
      } else {
        uuid = CryptoUtils.generateUuid();
      }

      // Aggiorno la configurazione della tabella in testata
      this.noticeInfo.uuid = uuid;

      this.metadataFormGroup.controls[Constants.StandardIdentifiers.NOTICE_UUID_FIELD].patchValue(uuid);
    }
  };

  /**
   * Disabilita tutti i form
   */
  private disableAllForms() {
    Object.values(this._formReactiveContent).forEach((item) => {
      if (item instanceof AbstractControl) {
        item.disable();
      } else {
        Object.values(item).forEach((nestedForm) => {
          if (nestedForm instanceof AbstractControl) {
            nestedForm.disable();
          }
        });
      }
    });
  }

  /**
   * Vedi issue EFORMS-11. Carico il nome di ciascuna organizzazione e lo salvo nel formService,
   * Facendo così posso popolare con il nome ciascuna organizzazione.
   * Per esempio, in alcune combobox come in sezione 'Lotto' con id = 'OPT-301-Lot-FiscalLegis',
   * ci sarà 'ORG-0003, Comune di ZZZ' invece di 'ORG-0003'
   */
  private loadOrganisationsNames = () => {
    // Verifico se all'interno di GR-Organisations-Section c'e' GR-Organisations-Subsection oppure direttamente GR-Organisations
    let controlsArray = this._formReactiveContent['GR-Organisations-Section']?.controls['GR-Organisations']
      ? this._formReactiveContent['GR-Organisations-Section']?.controls['GR-Organisations'].controls
      : this._formReactiveContent['GR-Organisations-Section']?.controls['GR-Organisations-Subsection'].controls[
          'GR-Organisations'
        ].controls;

    if (controlsArray != null) {
      controlsArray?.forEach((control, index) => {
        const orgId = 'ORG-' + padStart(index + 1, 4, '0');

        this._formService.dictionaryOfMultipleOrgsFormControl[orgId] =
          control?.controls['GR-Company']?.controls['BT-500-Organization-Company'];
      });
    }
  };

  /**
   * Metodo che preseleziona il primo elemento dell'accordion di elementi di primo livello
   */
  private preselectFirstElement = (): void => {
    if (this._currentSelectedId == GR_RESULT_ID) {
      switch (this._case) {
        case CANCELED_NEW_APPALTO:
          const settledContract =
            this._formReactiveContent[GR_RESULT_ID].controls['GR-SettledContract-Section'].controls[
              'GR-SettledContract'
            ];
          settledContract.controls.forEach((form, index) => {
            if (
              form.controls['GR-SettledContract-1'].controls['OPT-316-Contract'].value == this._currentSelectedLabelId
            ) {
              settledContract.removeAt(index);
            }
          });
          this._resultsTableService.appaltiItems = this._resultsTableService.appaltiItems.filter(
            (it) => it.id !== this._currentSelectedLabelId
          );
          this._formService.removeIdField(this._currentSelectedLabelId.split('-')[0], this._currentSelectedLabelId);
          break;

        case CANCELED_NEW_OFFERTA:
          const lotTender =
            this._formReactiveContent[GR_RESULT_ID].controls['GR-LotTender-Section'].controls['GR-LotTender'];
          lotTender.controls.forEach((form, index) => {
            if (form.controls['GR-Tender'].controls['OPT-321-Tender'].value == this._currentSelectedLabelId) {
              lotTender.removeAt(index);
            }
          });
          this._resultsTableService.offerteItems = this._resultsTableService.offerteItems.filter(
            (it) => it.id !== this._currentSelectedLabelId
          );
          this._formService.removeIdField(this._currentSelectedLabelId.split('-')[0], this._currentSelectedLabelId);
          break;

        case CANCELED_NEW_PARTE_OFFERENTE:
          const tenderingParty =
            this._formReactiveContent[GR_RESULT_ID].controls['GR-TenderingParty-Section'].controls['GR-TenderingParty'];
          tenderingParty.controls.forEach((form, index) => {
            if (form.controls['OPT-210-Tenderer'].value == this._currentSelectedLabelId) {
              tenderingParty.removeAt(index);
            }
          });
          this._resultsTableService.partiOfferentiItems = this._resultsTableService.partiOfferentiItems.filter(
            (it) => it.id !== this._currentSelectedLabelId
          );
          this._formService.removeIdField(this._currentSelectedLabelId.split('-')[0], this._currentSelectedLabelId);
          break;

        case CANCELED_NEW_RISULTATO_LOTTO:
          const lotResult =
            this._formReactiveContent[GR_RESULT_ID].controls['GR-LotResult-Section'].controls['GR-LotResult'];
          lotResult.controls.forEach((form, index) => {
            if (form.controls['OPT-322-LotResult'].value == this._currentSelectedLabelId) {
              lotResult.removeAt(index);
            }
          });
          this._resultsTableService.risultatiDeiLottiItems = this._resultsTableService.risultatiDeiLottiItems.filter(
            (it) => it.id !== this._currentSelectedLabelId
          );
          this._formService.removeIdField(this._currentSelectedLabelId.split('-')[0], this._currentSelectedLabelId);
          break;
      }
      const arrayIndex = this._formService.firstLevelItems.findIndex((item) => item.id === GR_RESULT_ID);

      let selectedItem = this._formService.firstLevelItems[arrayIndex].items.filter((item) => {
        return item.key == this._formDataService._resultsInnerKey;
      });

      if (selectedItem[0]) {
        this.manageFirstLevelItemToggle(selectedItem[0]);
      } else {
        this._formDataService._resultsInnerKey = 'GR-NoticeResult-Section';
        let result = this._formService.firstLevelItems[arrayIndex].items.filter((item) => {
          return item.key == this._formDataService._resultsInnerKey;
        });
        this.manageFirstLevelItemToggle(result[0]);
      }
    } else {
      let sectionIndex = this._formService.firstLevelItems.findIndex((item) => item.id == this._currentSelectedId);
      if (sectionIndex == -1) {
        sectionIndex = 0;
        this.currentGroupIndex = -1;
      }
      if (this._formService.firstLevelItems && this._formService.firstLevelItems[sectionIndex]) {
        // recupera indice della sezione selezionata da modificare

        if (this.currentGroupIndex != -1) {
          // recupera indice della lista di elementi della sezione (lotti, parti, gruppi di lotti)
          const arrayIndex = this._formService.firstLevelItems[sectionIndex].items.findIndex(
            (item) => +item.index === this.currentGroupIndex
          );
          this.manageFirstLevelItemToggle(this._formService.firstLevelItems[sectionIndex].items[arrayIndex]);
        } else {
          this.manageFirstLevelItemToggle(this._formService.firstLevelItems[sectionIndex]);
        }
      }
    }
  };

  private loadButtons(): void {
    this._buttons = {
      buttons: cloneDeep(this.config.body.buttons)
    };

    if (this.isExternalIntegration) {
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) =>
        ['back-to-lista-enotice', 'genera-json'].includes(one.code)
      );
    } else {
      // EFORMS-82: lo tengo comunque nel caso si volesse reintrodurre il pulsante
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code == 'save-bozza');
    }
  }

  private sendButtonsToHtml(): void {
    this.buttonsSubj = new BehaviorSubject(this._buttons);
  }

  private checkFieldVisibilityButton(): void {
    if (this._formService.checkVisibility() == true) {
      this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').label = 'BUTTONS.SHOW-OPTIONAL-FIELDS';
    } else {
      this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').label = 'BUTTONS.HIDE-OPTIONAL-FIELDS';
    }
  }

  // Metodo che carica la lista dei lotti sotto forma di tabella
  private loadLotsItems(): void {
    if (this._lotsTableService.lotsTableView) {
      // carica in cache i valori della combobox "contract-nature" per la tipologia di appalto
      this.loadComboContractNature();

      let items = new Array<LottoItem>();

      if (this._formReactiveContent[GR_LOT_ID]) {
        // itera tutti i lotti e crea un array di LottoItem
        Object.entries(this._formReactiveContent[GR_LOT_ID]).forEach(([key, fg]) => {
          let oggettoLotto = fg.value['GR-Lot-Purpose']['GR-Lot-Description']['BT-21-Lot'] ?? '';
          let tipologiaAppalto = fg.value['GR-Lot-Purpose']['GR-Lot-Description']['BT-23-Lot'] ?? '';
          let importoComplessivoAppalto = fg.value['GR-Lot-Purpose']['GR-Lot-Scope']['BT-27-Lot'] ?? '';

          let numeroLotto: number = Number(key?.split('-')[1]) ?? null;

          let it: LottoItem = {
            numero: numeroLotto,
            label: this.formatNumeroLotto(numeroLotto),
            oggetto: oggettoLotto,
            tipologiaAppalto: tipologiaAppalto,
            importoComplessivo:
              isNaN(Number(importoComplessivoAppalto)) || importoComplessivoAppalto == null
                ? null
                : Number(importoComplessivoAppalto)
          };

          items.push(it);
        });
      }

      this._lotsTableService.lotsItems = items;
    }
  }

  // Metodo che carica la lista dei risultati sotto forma di tabella
  private loadResultsItems(): void {
    if (this._formReactiveContent[GR_RESULT_ID]) {
      Object.entries(this._formReactiveContent[GR_RESULT_ID].controls).forEach(([key, fg]) => {
        switch (key) {
          // Parti offerenti
          case 'GR-TenderingParty-Section':
            let itemsPartiOfferenti = new Array<ParteOfferenteItem>();
            Object.values(fg.controls['GR-TenderingParty'].controls).forEach((item: any) => {
              let id = item.controls['OPT-210-Tenderer'].value ?? '';
              let nome = item.controls['OPT-211-Tenderer'].value ?? '';
              let numero: number = Number(id?.split('-')[1]) ?? null;

              itemsPartiOfferenti.push({
                numero,
                id,
                nome
              });
            });
            this._resultsTableService.partiOfferentiItems = itemsPartiOfferenti;
            break;
          // Appalti
          case 'GR-SettledContract-Section':
            let itemsAppalti = new Array<AppaltoItem>();

            Object.values(fg.controls['GR-SettledContract'].controls).forEach((item: any) => {
              let id = item.controls['GR-SettledContract-1'].controls['OPT-316-Contract'].value ?? '';
              let identificativo = item.controls['GR-SettledContract-1'].controls['BT-150-Contract'].value ?? '';
              let titolo = item.controls['GR-SettledContract-1'].controls['BT-721-Contract'].value ?? '';
              let numero: number = Number(id?.split('-')[1]) ?? null;

              itemsAppalti.push({
                numero,
                id,
                identificativo,
                titolo
              });
            });
            this._resultsTableService.appaltiItems = itemsAppalti;
            break;
          // Offerte
          case 'GR-LotTender-Section':
            let itemsOfferte = new Array<OffertaItem>();
            Object.values(fg.controls['GR-LotTender'].controls).forEach((item: any) => {
              let id = item.controls['GR-Tender'].controls['OPT-321-Tender'].value ?? '';
              let identificativo = item.controls['GR-Tender'].controls['BT-3201-Tender'].value ?? '';
              let valore = item.controls['GR-Tender'].controls['BT-720-Tender'].value;
              let numero: number = Number(id?.split('-')[1]) ?? null;

              itemsOfferte.push({
                numero,
                id,
                identificativo,
                valore: isNaN(Number(valore)) || valore == null ? null : Number(valore)
              });
            });
            this._resultsTableService.offerteItems = itemsOfferte;
            break;
          // Risultati dei lotti
          case 'GR-LotResult-Section':
            let itemsRisultatiDeiLotti = new Array<RisultatoDelLottoItem>();
            Object.values(fg.controls['GR-LotResult'].controls).forEach((item: any) => {
              let id = item.controls['OPT-322-LotResult'].value ?? '';
              let identificativo = item.controls['GR-LotResult-1'].controls['BT-13713-LotResult'].value ?? '';
              let numero: number = Number(id?.split('-')[1]) ?? null;

              itemsRisultatiDeiLotti.push({
                numero,
                id,
                identificativo
              });
            });
            this._resultsTableService.risultatiDeiLottiItems = itemsRisultatiDeiLotti;
            break;
          default:
            break;
        }
      });
    }
  }
  /**
   * Metodo di utilita' per configurare e aprire il modale
   * @param config configurazione del modale
   */
  private configureAndOpenModal(config: OutputRestModalConfig): void {
    this._modalConfig.componentConfig = config;
    this.modalConfigObs.next(this._modalConfig);
    this._modalConfig.openSubject.next(true);
  }

  private configureAndOpenCvsValidationModal(config: OutputCvsValidationModalConfig): void {
    this._modalConfigCvsValidation.componentConfig = config;
    this.modalConfigCvsValidationObs.next(this._modalConfigCvsValidation);
    this._modalConfigCvsValidation.openSubject.next(true);
  }

  override manageFirstLevelItemToggle(output: AccordionOutput): void {
    if (!output?.id || !output?.label) {
      console.error('output managefirstlevelitemtoggle is wrong', output);
    }
    // Notify breadcrumbs
    let breadcrumbs: Array<SdkBreadcrumbItem> = [
      {
        code: 'current',
        label: output.label
      }
    ];

    this._breadcrumbsService.emit(breadcrumbs);

    this.loadButtons();

    // verifica la visibilità delle form
    this.checkFieldVisibilityButton();

    // Siamo in 'GR-Lot'
    if (output.id == GR_LOT_ID) {
      // disabilita il pulsante "toggle-visibility"
      this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').disabled = true;
      // rimuovi il pulsante "modifica-pagina"
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code == 'modifica-pagina');
      // rimuovi tutti i pulsanti "add-new-results*"
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code.startsWith('add-new-results'));
      // aggiungi il pulsante per un nuovo lotto come penultimo elemento (se non già inserito)
      const existsAddNewLotButton = this._buttons.buttons.some((one) => one.code === 'add-new-lot');
      if (!existsAddNewLotButton) {
        const index = Math.max(this._buttons.buttons.length - 1, 0);
        this._buttons.buttons.splice(index, 0, {
          code: 'add-new-lot',
          label: 'BUTTONS.ADD-NEW-LOT',
          icon: 'mgg-icons-crud-create'
        });
      }
      this.buttonsSubj.next(this._buttons);
    }
    // Siamo in 'GR-Result'
    else if (output.id == GR_RESULT_ID) {
      if (this._formService.checkVisibility() == true) {
        let button: SdkButtonGroupOutput = {
          code: 'toggle-visibility'
        };
        this.onButtonClick(button);

        //forzo la change detection
        let currentValue = this.buttonsSubj.getValue();
        this.buttonsSubj.next(currentValue);
      }
      // disabilita il pulsante "toggle-visibility"
      this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').disabled = true;
      // rimuovi il pulsante "modifica-pagina"
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code == 'modifica-pagina');
      // rimuovi il pulsante "add-new-lot"
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code == 'add-new-lot');
      // rimuovi tutti i pulsanti "add-new-results*"
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code.startsWith('add-new-results'));

      switch (output.key) {
        // Risultati
        case 'GR-NoticeResult-Section':
          // abilita il pulsante "toggle-visibility"
          this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').disabled = false;
          // aggiungi il pulsante "modifica-pagina"
          var exists = this._buttons.buttons.some((one) => one.code === 'modifica-pagina');
          if (!exists) {
            const index = Math.max(this._buttons.buttons.length - 1, 0);
            this._buttons.buttons.splice(index, 0, {
              code: 'modifica-pagina',
              label: 'BUTTONS.MODIFICA-PAGINA',
              icon: 'mgg-icons-crud-edit'
            });
          }
          break;
        // Parti offerenti
        case 'GR-TenderingParty-Section':
          // aggiungi il pulsante "add-new-results-parte-offerente"
          var exists = this._buttons.buttons.some((one) => one.code === 'add-new-results-parte-offerente');
          if (!exists) {
            const index = Math.max(this._buttons.buttons.length - 1, 0);
            this._buttons.buttons.splice(index, 0, {
              code: 'add-new-results-parte-offerente',
              label: 'BUTTONS.ADD-NEW-PARTE-OFFERENTE',
              icon: 'mgg-icons-crud-create'
            });
          }
          break;
        // Appalti
        case 'GR-SettledContract-Section':
          // aggiungi il pulsante "add-new-results-appalto"
          var exists = this._buttons.buttons.some((one) => one.code === 'add-new-results-appalto');
          if (!exists) {
            const index = Math.max(this._buttons.buttons.length - 1, 0);
            this._buttons.buttons.splice(index, 0, {
              code: 'add-new-results-appalto',
              label: 'BUTTONS.ADD-NEW-APPALTO',
              icon: 'mgg-icons-crud-create'
            });
          }
          break;
        // Offerte
        case 'GR-LotTender-Section':
          // aggiungi il pulsante "add-new-results-offerta"
          var exists = this._buttons.buttons.some((one) => one.code === 'add-new-results-offerta');
          if (!exists) {
            const index = Math.max(this._buttons.buttons.length - 1, 0);
            this._buttons.buttons.splice(index, 0, {
              code: 'add-new-results-offerta',
              label: 'BUTTONS.ADD-NEW-OFFERTA',
              icon: 'mgg-icons-crud-create'
            });
          }
          break;
        // Risultati dei lotti
        case 'GR-LotResult-Section':
          // aggiungi il pulsante "add-new-results-risultato-lotto"
          var exists = this._buttons.buttons.some((one) => one.code === 'add-new-results-risultato-lotto');
          if (!exists) {
            const index = Math.max(this._buttons.buttons.length - 1, 0);
            this._buttons.buttons.splice(index, 0, {
              code: 'add-new-results-risultato-lotto',
              label: 'BUTTONS.ADD-NEW-RISULTATO-LOTTO',
              icon: 'mgg-icons-crud-create'
            });
          }
          break;
        default:
          console.error('Sezione non trovata');
          break;
      }
      this.buttonsSubj.next(this._buttons);

      // // aggiungi il pulsante per un nuovo record dei risultati come penultimo elemento (se non già inserito)
      // const existsAddNewLotButton = this._buttons.buttons.some((one) => one.code === 'add-new-lot');
      // if (!existsAddNewLotButton) {
      //   const index = Math.max(this._buttons.buttons.length - 1, 0);
      //   this._buttons.buttons.splice(index, 0, {
      //     code: 'add-new-lot',
      //     label: 'BUTTONS.ADD-NEW-LOT',
      //     icon: 'mgg-icons-crud-create'
      //   });
      // }
    }
    // Per tutte le altre sezioni
    else {
      // abilita il pulsante "toggle-visibility"
      this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').disabled = false;
      // rimuovi il pulsante "add-new-lot"
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code == 'add-new-lot');
      // rimuovi tutti i pulsanti "add-new-results*"
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code.startsWith('add-new-results'));
      // aggiungi il pulsante "modifica-pagina" come penultimo elemento (se non già inserito)
      const exists = this._buttons.buttons.some((one) => one.code === 'modifica-pagina');
      if (!exists) {
        const index = Math.max(this._buttons.buttons.length - 1, 0);
        this._buttons.buttons.splice(index, 0, {
          code: 'modifica-pagina',
          label: 'BUTTONS.MODIFICA-PAGINA',
          icon: 'mgg-icons-crud-edit'
        });
      }

      this.buttonsSubj.next(this._buttons);
    }

    // Salvo la vecchia form nella mappa

    this.formReady = false;
    this.isLoading = true;
    setTimeout(() => {
      // salvo lo storico

      if (!isEmpty(this._currentSelectedId) && this._formReactiveContent[this._currentSelectedId] != null) {
        if (!(this._currentSelectedId == GR_RESULT_ID)) {
          if (this.currentGroupIndex == -1) {
            this._formReactiveContent[this._currentSelectedId] = this.formGroup;
          } else {
            (this._formReactiveContent[this._currentSelectedId] as IDictionary<FormGroup>)[
              this._currentSelectedLabelId
            ] = this.formGroup;
          }
        }
      }
      let id: string = output.id;
      this._currentSelectedId = id;
      this._currentSelectedLabelId = null;
      this.currentGroupIndex = this._formService.manageGroupIndex(output.index);

      // Salva l'item di primo livello
      this._formDataService.accordionOutput = cloneDeep(output);

      //this.firstElementPartial = this._formContent[id];

      if (id == GR_RESULT_ID) {
        this.firstElementPartial = this._formContent[id].content.filter((item) => {
          return item.id == output.key;
        })[0];
      } else {
        this.firstElementPartial = this._formContent[id];
      }

      if (has(this._formReactiveContent, id)) {
        if (this.currentGroupIndex == -1) {
          this.formGroup = this._formReactiveContent[id] as FormGroup;
        } else {
          if (id == GR_RESULT_ID) {
            Object.entries(this._formReactiveContent[id].controls).forEach(([key, control]) => {
              if (key.includes(output.key)) {
                this.formGroup = control as FormGroup;
                this._currentSelectedLabelId = key;
              }
            });
          } else {
            Object.keys(this._formReactiveContent[id]).forEach((key) => {
              if (key.includes(output.index)) {
                this.formGroup = this._formReactiveContent[id][key];
                this._currentSelectedLabelId = key;
              }
            });
          }
        }
      } else {
        this.formGroup = this._formService.createFormGroupForSelectedFormContent(this.notice, this.firstElementPartial);
        this._formReactiveContent[id] = this.formGroup;
      }
      this.isLoading = false;
      this.formReady = true;
    });
  }

  private addItemToItems(id, largestIndexValue) {
    this._formService.firstLevelItems.forEach((item) => {
      if (item.id == id) {
        this._formContent[id];
        let labelTemp;
        let isLastLevel: boolean = false;
        if (item.items.length > 0) {
          labelTemp = cloneDeep(item.items[0].label);
          isLastLevel = true;
        } else {
          labelTemp = this._dataService.getLabel(this._formContent[id]._label);
          if (id == 'GR-LotsGroup') {
            isLastLevel = true;
          }
        }

        item.items.push({
          id: id,
          label: `${labelTemp.split('(')[0]} (${largestIndexValue.split('-')[1]})`,
          index: largestIndexValue.split('-')[1],
          lastLevel: isLastLevel,
          labelId: largestIndexValue
        });
      }
    });
    this._layoutMenuTabsMessageService.emit(this._formService.firstLevelItems);
  }

  /**
   * Aggiunge un nuovo elemento di primo livello
   * @param id id dell'elemento
   */
  override manageAddElementEvent(id: string): void {
    let selectedFormContent: any = cloneDeep(this._formContent[id]);

    // Verifica se l'elemento di primo livello esiste
    if (selectedFormContent) {
      // se siamo nei risultati
      if (id == GR_RESULT_ID) {
        // recupera la sezione dei risultati corretta
        selectedFormContent = selectedFormContent.content.find((u) => u.id == this._currentSelectedLabelId);
        // elabora eventuali nuovi id fields
        selectedFormContent = this._formService.elaborateIdFields(selectedFormContent.content[0]);
        // Trova l'ultimo valore dell'indice per l'id fornito
        let largestIndexValue = this._formService.getLatestValueByIdField(selectedFormContent._idScheme);
        // Salva l'indice del nuovo elemento
        this.currentGroupIndex = parseInt(largestIndexValue);

        // Carica il form reattivo per l'elemento di primo livello clonato
        let formGroup: FormGroup = this._formService.createFormGroupForSelectedFormContent(
          this.notice,
          selectedFormContent
        );

        this._formReactiveContent[GR_RESULT_ID].controls[selectedFormContent.id + '-Section'].controls[
          selectedFormContent.id
        ].controls.push(formGroup);

        this._formDataService._resultsInnerKey = this._currentSelectedLabelId;
        this._currentSelectedLabelId = largestIndexValue;
        this._formDataService._formGroupBackup = cloneDeep(formGroup);
      }
      // per tutte le altre sezioni
      else {
        selectedFormContent = this._formService.elaborateIdFields(selectedFormContent);
        // Trova l'ultimo valore dell'indice per l'id fornito
        let largestIndexValue = this._formService.getLatestValueByIdField(selectedFormContent._idScheme);

        if (id == GR_LOT_ID) {
          // Salva la label del nuovo elemento
          this._currentSelectedLabelId = largestIndexValue;
          // Salva l'indice del nuovo elemento
          this.currentGroupIndex = parseInt(this._currentSelectedLabelId.split('-')[1], 10);
        }

        // Carica il form reattivo per l'elemento di primo livello clonato
        let formGroup: FormGroup = this._formService.createFormGroupForSelectedFormContent(
          this.notice,
          selectedFormContent
        );

        // Verifica se esiste già un form reattivo per l'ID dell'elemento di primo livello clonato
        if (has(this._formReactiveContentOriginal, selectedFormContent.id)) {
          if (!this._formReactiveContent[selectedFormContent.id]) {
            this._formReactiveContent[selectedFormContent.id] = {};
          }
          this._formReactiveContent[selectedFormContent.id][largestIndexValue] = formGroup;
        } else {
          console.error('FormReactiveContent Not Found');
          // Imposta l'array o il singolo FormGroup se non ripetibile
          set(
            this._formReactiveContent,
            selectedFormContent.id,
            selectedFormContent._repeatable ? [formGroup] : formGroup
          );
        }

        this.addItemToItems(id, largestIndexValue);

        console.log('Items after adding', cloneDeep(this._formService.firstLevelItems));
        console.log('field map after adding', cloneDeep(this._formService.idFieldMap));
      }
    } else {
      console.error('First level element not found');
    }

    console.warn(this._formReactiveContent);
  }

  private removeItemFromItems(obj, shouldDeselect: boolean) {
    this._formService.firstLevelItems.forEach((item) => {
      if (item.id == obj.id) {
        const indexToRemove = item.items.findIndex((nested) => {
          return nested.index == obj.index;
        });

        if (indexToRemove !== -1) {
          item.items.splice(indexToRemove, 1);
        } else {
          console.error('item not found');
        }
      }
    });
    this._layoutMenuTabsMessageService.emit(this._formService.firstLevelItems);

    if (shouldDeselect) {
      // Notify breadcrumbs
      let breadcrumbs: Array<SdkBreadcrumbItem> = [
        {
          code: 'current',
          label: null
        }
      ];

      this._breadcrumbsService.emit(breadcrumbs);
    }
  }

  /**
   * Rimuove un elemento di primo livello.
   * @param obj Output dell'accordion.
   */
  override manageRemoveElementEvent(obj: AccordionOutput): void {
    /*
    Sono nella situazione in cui ho selezionato un elemento di primo livello ripetibile,
    quindi verifico se l'elemento da rimuovere corrisponde esattamente con la form renderizzata
    perché ciò mi impone di deselezionare la form.
  */
    let isRepeatableElementSelected: boolean = !isEmpty(this._currentSelectedId) && this.currentGroupIndex > -1;
    let isRepeatableElementSelectedToBeRemoved: boolean =
      this._currentSelectedId == obj.id && this.currentGroupIndex == +obj.index;
    let shouldDeselect: boolean = isRepeatableElementSelected && isRepeatableElementSelectedToBeRemoved;

    if (shouldDeselect) {
      this.formReady = false;
      delete this.firstElementPartial;
      delete this.formGroup;
      delete this._currentSelectedId;
      delete this._currentSelectedLabelId;
      this.currentGroupIndex = this._formService.manageGroupIndex(null);
    }

    if (
      has(this._formContent, obj.id) &&
      has(this._formReactiveContent, obj.id) &&
      this._formService.isIDictionaryOfFormGroup(this._formReactiveContent[obj.id])
    ) {
      Object.keys(this._formReactiveContent[obj.id]).forEach((key) => {
        if (key.includes(obj.index)) {
          delete this._formReactiveContent[obj.id][key];
          this._formService.removeIdField(this._formContent[obj.id]._idScheme, key);
        }
      });
      this.removeItemFromItems(obj, shouldDeselect);
      console.log('Items after deleting', cloneDeep(this._formService.firstLevelItems));
      console.log('field map after deleting', cloneDeep(this._formService.idFieldMap));
    } else {
      console.error('Form group not found');
    }
  }

  public saveVariables(): void {
    this._formDataService._formContentBackup = cloneDeep(this._formContent);
    this._formDataService._formReactiveContentBackup = cloneDeep(this._formReactiveContent);
    this._formDataService._formReactiveContentOriginalBackup = cloneDeep(this._formReactiveContentOriginal);
    this._formDataService._currentSelectedIdBackup = cloneDeep(this._currentSelectedId);
    this._formDataService._currentSelectedLabelIdBackup = cloneDeep(this._currentSelectedLabelId);
    this._formDataService._metadataFormGroupBackup = cloneDeep(this.metadataFormGroup);
    this._formDataService.noticeInfo = cloneDeep(this.noticeInfo);

    let params: IDictionary<any> = {
      action: this._action,
      readOnly: true
    };
    this._sdkRouterService.navigateToPage('edit-page-enotice-page', params);
  }

  // Metodo che elimina un lotto dalla tabella e dal form dei lotti
  public deleteLotto(item: LottoItem): void {
    this.initEliminaElementoDialog();

    this._dialogConfig.open.next(() => {
      // rimuove lotto dal form
      this.manageRemoveElementEvent({ id: GR_LOT_ID, index: this._formService.generateCounter(item.numero) });
      // rimuove lotto dalla tabella
      this._lotsTableService.lotsItems = this._lotsTableService.lotsItems.filter((lot) => lot.numero !== item.numero);
      // ripristina la visualizzazione della tabella di lotti
      this.manageFirstLevelItemToggle({
        id: GR_LOT_ID,
        label: LOTTI_LABEL
      });
    });
  }

  // Metodo che apre la pagina di dettaglio di un lotto (dalla tabella dei lotti)
  public dettaglioLotto(item: LottoItem, clickForScroll?: AccordionOutput): void {
    if (clickForScroll) {
      this.manageFirstLevelItemToggle(clickForScroll);
      this._currentSelectedLabelId = this._formService.generateIdField('LOT', +clickForScroll.index);
      this._formDataService._currentGroupIndexBackup = cloneDeep(+clickForScroll.index);
      //FormGroupBackup non può essere cloneDeep qui perche perderei la reference al formcontrol originale e non funzionerebbe lo scroll
      this._formDataService._formGroupBackup = this._formReactiveContent[GR_LOT_ID][this._currentSelectedLabelId];
    } else {
      this.manageFirstLevelItemToggle({
        id: GR_LOT_ID,
        label: item.label,
        index: this._formService.generateCounter(item.numero)
      });
      this._currentSelectedLabelId = this._formService.generateIdField('LOT', item.numero);
      this._formDataService._currentGroupIndexBackup = cloneDeep(item.numero);
      this._formDataService._formGroupBackup = cloneDeep(
        this._formReactiveContent[GR_LOT_ID][this._currentSelectedLabelId]
      );
    }

    this._currentSelectedId = GR_LOT_ID;
    this.setUpdateState(false);
    this.saveVariables();
  }

  // Metodo che elimina una parte offerente dalla tabella e dal form
  public deleteParteOfferente(item: ParteOfferenteItem): void {
    this.initEliminaElementoDialog();

    this._dialogConfig.open.next(() => {
      const tenderingParty =
        this._formReactiveContent[GR_RESULT_ID].controls['GR-TenderingParty-Section'].controls['GR-TenderingParty'];
      tenderingParty.controls.forEach((form, index) => {
        if (form.controls['OPT-210-Tenderer'].value == item.id) {
          tenderingParty.removeAt(index);
        }
      });

      this._formService.removeIdField(item.id.split('-')[0], item.id);

      // rimuove elemento dalla tabella
      this._resultsTableService.partiOfferentiItems = this._resultsTableService.partiOfferentiItems.filter(
        (it) => it.numero !== item.numero
      );
      // ripristina la visualizzazione della tabella di risultati
      this.manageFirstLevelItemToggle({
        id: GR_RESULT_ID,
        label: item.id,
        index: this._formService.generateCounter(item.numero),
        key: 'GR-TenderingParty-Section'
      });
    });
  }

  // Metodo che apre la pagina di dettaglio di una parte offerente
  public dettaglioParteOfferente(item: ParteOfferenteItem, clickForScroll?: AccordionOutput): void {
    if (this._formService.checkVisibility() == true) {
      let button: SdkButtonGroupOutput = {
        code: 'toggle-visibility'
      };
      this.onButtonClick(button);

      //forzo la change detection
      let currentValue = this.buttonsSubj.getValue();
      this.buttonsSubj.next(currentValue);
    }
    if (clickForScroll) {
      this.manageFirstLevelItemToggle(clickForScroll);
      this._currentSelectedLabelId = this._formService.generateIdField('TPA', +clickForScroll.index);
      this._formDataService._currentGroupIndexBackup = cloneDeep(+clickForScroll.index);
      //FormGroupBackup non può essere cloneDeep qui perche perderei la reference al formcontrol originale e non funzionerebbe lo scroll
      let targetIndex = this._formReactiveContent[GR_RESULT_ID].controls['GR-TenderingParty-Section'].controls[
        'GR-TenderingParty'
      ].controls.findIndex((form) => {
        return form.controls['OPT-210-Tenderer'].value == this._currentSelectedLabelId;
      });

      this._formDataService._formGroupBackup =
        this._formReactiveContent[GR_RESULT_ID].controls['GR-TenderingParty-Section'].controls[
          'GR-TenderingParty'
        ].controls[targetIndex !== -1 ? targetIndex : 0];
    } else {
      this.manageFirstLevelItemToggle({
        id: GR_RESULT_ID,
        label: item.id,
        index: this._formService.generateCounter(item.numero),
        key: 'GR-TenderingParty-Section'
      });

      this._currentSelectedLabelId = this._formService.generateIdField('TPA', item.numero);
      this._formDataService._currentGroupIndexBackup = cloneDeep(item.numero);
      let targetForm = this._formReactiveContent[GR_RESULT_ID].controls['GR-TenderingParty-Section'].controls[
        'GR-TenderingParty'
      ].controls.filter((form) => {
        return form.controls['OPT-210-Tenderer'].value == this._currentSelectedLabelId;
      });
      this._formDataService._formGroupBackup = cloneDeep(targetForm[0]);
    }

    this._formDataService._resultsInnerKey = 'GR-TenderingParty-Section';
    this._currentSelectedId = GR_RESULT_ID;
    this.setUpdateState(false);
    this.saveVariables();
  }

  // Metodo che elimina un appalto dalla tabella e dal form
  public deleteAppalto(item: AppaltoItem): void {
    this.initEliminaElementoDialog();

    this._dialogConfig.open.next(() => {
      // rimuove elemento dal form
      const settledContract =
        this._formReactiveContent[GR_RESULT_ID].controls['GR-SettledContract-Section'].controls['GR-SettledContract'];
      settledContract.controls.forEach((form, index) => {
        if (form.controls['GR-SettledContract-1'].controls['OPT-316-Contract'].value == item.id) {
          settledContract.removeAt(index);
        }
      });

      this._formService.removeIdField(item.id.split('-')[0], item.id);

      // rimuove elemento dalla tabella
      this._resultsTableService.appaltiItems = this._resultsTableService.appaltiItems.filter(
        (it) => it.numero !== item.numero
      );
      // ripristina la visualizzazione della tabella di risultati
      this.manageFirstLevelItemToggle({
        id: GR_RESULT_ID,
        label: item.id,
        index: this._formService.generateCounter(item.numero),
        key: 'GR-SettledContract-Section'
      });
    });
  }

  // Metodo che apre la pagina di dettaglio di un appalto
  public dettaglioAppalto(item: AppaltoItem, clickForScroll?: AccordionOutput): void {
    if (this._formService.checkVisibility() == true) {
      let button: SdkButtonGroupOutput = {
        code: 'toggle-visibility'
      };
      this.onButtonClick(button);

      //forzo la change detection
      let currentValue = this.buttonsSubj.getValue();
      this.buttonsSubj.next(currentValue);
    }
    if (clickForScroll) {
      this.manageFirstLevelItemToggle(clickForScroll);
      this._currentSelectedLabelId = this._formService.generateIdField('CON', +clickForScroll.index);
      this._formDataService._currentGroupIndexBackup = cloneDeep(+clickForScroll.index);
      //FormGroupBackup non può essere cloneDeep qui perche perderei la reference al formcontrol originale e non funzionerebbe lo scroll
      let targetIndex = this._formReactiveContent[GR_RESULT_ID].controls['GR-SettledContract-Section'].controls[
        'GR-SettledContract'
      ].controls.findIndex((form) => {
        return form.controls['GR-SettledContract-1'].controls['OPT-316-Contract'].value == this._currentSelectedLabelId;
      });
      this._formDataService._formGroupBackup =
        this._formReactiveContent[GR_RESULT_ID].controls['GR-SettledContract-Section'].controls[
          'GR-SettledContract'
        ].controls[targetIndex !== -1 ? targetIndex : 0];
    } else {
      this.manageFirstLevelItemToggle({
        id: GR_RESULT_ID,
        label: item.id,
        index: this._formService.generateCounter(item.numero),
        key: 'GR-SettledContract-Section'
      });
      this._currentSelectedLabelId = this._formService.generateIdField('CON', item.numero);
      this._formDataService._currentGroupIndexBackup = cloneDeep(item.numero);
      let targetForm = this._formReactiveContent[GR_RESULT_ID].controls['GR-SettledContract-Section'].controls[
        'GR-SettledContract'
      ].controls.filter((form) => {
        return form.controls['GR-SettledContract-1'].controls['OPT-316-Contract'].value == this._currentSelectedLabelId;
      });
      this._formDataService._formGroupBackup = cloneDeep(targetForm[0]);
    }

    this._formDataService._resultsInnerKey = 'GR-SettledContract-Section';
    this._currentSelectedId = GR_RESULT_ID;
    this.setUpdateState(false);
    this.saveVariables();
  }

  // Metodo che elimina una offerta dalla tabella e dal form
  public deleteOfferta(item: OffertaItem): void {
    this.initEliminaElementoDialog();

    this._dialogConfig.open.next(() => {
      // rimuove elemento dal form
      const lotTender =
        this._formReactiveContent[GR_RESULT_ID].controls['GR-LotTender-Section'].controls['GR-LotTender'];
      lotTender.controls.forEach((form, index) => {
        if (form.controls['GR-Tender'].controls['OPT-321-Tender'].value == item.id) {
          lotTender.removeAt(index);
        }
      });

      this._formService.removeIdField(item.id.split('-')[0], item.id);

      // rimuove elemento dalla tabella
      this._resultsTableService.offerteItems = this._resultsTableService.offerteItems.filter(
        (it) => it.numero !== item.numero
      );
      // ripristina la visualizzazione della tabella di risultati
      this.manageFirstLevelItemToggle({
        id: GR_RESULT_ID,
        label: item.id,
        index: this._formService.generateCounter(item.numero),
        key: 'GR-LotTender-Section'
      });
    });
  }

  // Metodo che apre la pagina di dettaglio di una offerta
  public dettaglioOfferta(item: OffertaItem, clickForScroll?: AccordionOutput): void {
    if (this._formService.checkVisibility() == true) {
      let button: SdkButtonGroupOutput = {
        code: 'toggle-visibility'
      };
      this.onButtonClick(button);

      //forzo la change detection
      let currentValue = this.buttonsSubj.getValue();
      this.buttonsSubj.next(currentValue);
    }
    if (clickForScroll) {
      this.manageFirstLevelItemToggle(clickForScroll);
      this._currentSelectedLabelId = this._formService.generateIdField('TEN', +clickForScroll.index);
      this._formDataService._currentGroupIndexBackup = cloneDeep(+clickForScroll.index);
      //FormGroupBackup non può essere cloneDeep qui perche perderei la reference al formcontrol originale e non funzionerebbe lo scroll
      let targetIndex = this._formReactiveContent[GR_RESULT_ID].controls['GR-LotTender-Section'].controls[
        'GR-LotTender'
      ].controls.findIndex((form) => {
        return form.controls['GR-Tender'].controls['OPT-321-Tender'].value == this._currentSelectedLabelId;
      });
      this._formDataService._formGroupBackup =
        this._formReactiveContent[GR_RESULT_ID].controls['GR-LotTender-Section'].controls['GR-LotTender'].controls[
          targetIndex !== -1 ? targetIndex : 0
        ];
    } else {
      this.manageFirstLevelItemToggle({
        id: GR_RESULT_ID,
        label: item.id,
        index: this._formService.generateCounter(item.numero),
        key: 'GR-LotTender-Section'
      });
      this._currentSelectedLabelId = this._formService.generateIdField('TEN', item.numero);
      this._formDataService._currentGroupIndexBackup = cloneDeep(item.numero);
      let targetForm = this._formReactiveContent[GR_RESULT_ID].controls['GR-LotTender-Section'].controls[
        'GR-LotTender'
      ].controls.filter((form) => {
        return form.controls['GR-Tender'].controls['OPT-321-Tender'].value == this._currentSelectedLabelId;
      });
      this._formDataService._formGroupBackup = cloneDeep(targetForm[0]);
    }

    this._formDataService._resultsInnerKey = 'GR-LotTender-Section';
    this._currentSelectedId = GR_RESULT_ID;
    this.setUpdateState(false);
    this.saveVariables();
  }

  // Metodo che elimina un risultato del lotto dalla tabella e dal form
  public deleteRisultatoDelLotto(item: RisultatoDelLottoItem): void {
    this.initEliminaElementoDialog();

    this._dialogConfig.open.next(() => {
      // rimuove elemento dal form
      const lotResult =
        this._formReactiveContent[GR_RESULT_ID].controls['GR-LotResult-Section'].controls['GR-LotResult'];
      lotResult.controls.forEach((form, index) => {
        if (form.controls['OPT-322-LotResult'].value == item.id) {
          lotResult.removeAt(index);
        }
      });

      this._formService.removeIdField(item.id.split('-')[0], item.id);

      // rimuove elemento dalla tabella
      this._resultsTableService.risultatiDeiLottiItems = this._resultsTableService.risultatiDeiLottiItems.filter(
        (it) => it.numero !== item.numero
      );
      // ripristina la visualizzazione della tabella di risultati
      this.manageFirstLevelItemToggle({
        id: GR_RESULT_ID,
        label: item.id,
        index: this._formService.generateCounter(item.numero),
        key: 'GR-LotResult-Section'
      });
    });
  }

  // Metodo che apre la pagina di dettaglio di un risultato del lotto
  public dettaglioRisultatoDelLotto(item: RisultatoDelLottoItem, clickForScroll?: AccordionOutput): void {
    if (this._formService.checkVisibility() == true) {
      let button: SdkButtonGroupOutput = {
        code: 'toggle-visibility'
      };
      this.onButtonClick(button);

      //forzo la change detection
      let currentValue = this.buttonsSubj.getValue();
      this.buttonsSubj.next(currentValue);
    }
    if (clickForScroll) {
      this.manageFirstLevelItemToggle(clickForScroll);
      this._currentSelectedLabelId = this._formService.generateIdField('RES', +clickForScroll.index);
      this._formDataService._currentGroupIndexBackup = cloneDeep(+clickForScroll.index);
      //FormGroupBackup non può essere cloneDeep qui perche perderei la reference al formcontrol originale e non funzionerebbe lo scroll
      let targetIndex = this._formReactiveContent[GR_RESULT_ID].controls['GR-LotResult-Section'].controls[
        'GR-LotResult'
      ].controls.findIndex((form) => {
        return form.controls['OPT-322-LotResult'].value == this._currentSelectedLabelId;
      });

      this._formDataService._formGroupBackup =
        this._formReactiveContent[GR_RESULT_ID].controls['GR-LotResult-Section'].controls['GR-LotResult'].controls[
          targetIndex !== -1 ? targetIndex : 0
        ];
    } else {
      this.manageFirstLevelItemToggle({
        id: GR_RESULT_ID,
        label: item.id,
        index: this._formService.generateCounter(item.numero),
        key: 'GR-LotResult-Section'
      });
      this._currentSelectedLabelId = this._formService.generateIdField('RES', item.numero);
      this._formDataService._currentGroupIndexBackup = cloneDeep(item.numero);
      let targetForm = this._formReactiveContent[GR_RESULT_ID].controls['GR-LotResult-Section'].controls[
        'GR-LotResult'
      ].controls.filter((form) => {
        return form.controls['OPT-322-LotResult'].value == this._currentSelectedLabelId;
      });
      this._formDataService._formGroupBackup = cloneDeep(targetForm[0]);
    }

    this._formDataService._resultsInnerKey = 'GR-LotResult-Section';
    this._currentSelectedId = GR_RESULT_ID;
    this.setUpdateState(false);
    this.saveVariables();
  }

  // #endregion
}
