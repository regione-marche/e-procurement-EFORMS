import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { IDictionary } from '@maggioli/sdk-commons';
import {
  SdkBreadcrumbItem,
  SdkButtonGroupInput,
  SdkButtonGroupOutput,
  SdkButtonGroupSingleInput
} from '@maggioli/sdk-controls';
import { cloneDeep, has, isEmpty, remove, set } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import {
  CANCELED_NEW_APPALTO,
  CANCELED_NEW_LOT,
  CANCELED_NEW_OFFERTA,
  CANCELED_NEW_PARTE_OFFERENTE,
  CANCELED_NEW_RISULTATO_LOTTO,
  Constants,
  GR_LOT_ID,
  GR_RESULT_ID,
  NEW_APPALTO,
  NEW_LOT,
  NEW_OFFERTA,
  NEW_PARTE_OFFERENTE,
  NEW_RISULTATO_LOTTO
} from '../../../app.constants';
import { AccordionOutput, NoticeInfo } from '../../../models/app.model';
import { AbstractFormComponent } from '../abstract/abstract-form.component';

@Component({
  templateUrl: `edit-page-enotice-section.widget.html`,
  encapsulation: ViewEncapsulation.None
})
export class EditPageEnoticeSectionWidget extends AbstractFormComponent implements OnInit, OnDestroy {
  @HostBinding('class') classNames = `edit-page-enotice-section`;

  public config: any = {};

  private _action: string; // permette di ritornare alla new-page o alla edit-page
  private _readOnly: boolean; // informa se la pagina è in sola lettura oppure si può modificare il form
  private _case: string; // informa su che operazione si sta facendo (es.: NEW-LOT)

  // Contenuto form sdk indicizzato per elementi di primo livello
  private _formContent: IDictionary<any> = {};
  // Contenuto form reactive indicizzato per elementi di primo livello
  private _formReactiveContent: IDictionary<FormGroup | IDictionary<FormGroup>> = {};
  // Contenuto form reactive indicizzato per elementi di primo livello originale (non modificato dall'utente)
  private _formReactiveContentOriginal: IDictionary<FormGroup | IDictionary<FormGroup>> = {};
  // Id Scheme della form selezionata se l'elemento di primo livello e' ripetibile
  private _currentSelectedId: string;
  // Elemento form reactive parziale (di primo livello) selezionato e renderizzato nella form
  public formGroup: FormGroup;
  // Elemento form reactive metadata selezionato e renderizzato nella form
  public metadataFormGroup: FormGroup;
  // Indice della form selezionata se l'elemento di primo livello e' ripetibile
  public currentGroupIndex: number;

  public deepCopyOfFormGroup: FormGroup;

  public formReactiveContentOriginalPassed: any;

  // Notice data
  public firstElement: any;

  // Elemento parziale (di primo livello) selezionato e renderizzato nella form sd
  public firstElementPartial: any;

  // Booleano per il caircamento della form
  public formReady: boolean = false;

  private _currentSelectedLabelId: string;

  // Pulsantiera
  private _buttons: SdkButtonGroupInput;
  public buttonsSubj: BehaviorSubject<SdkButtonGroupInput>;

  // Codice notice selezionata
  public notice: string;

  public noticeInfo: NoticeInfo;

  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
  }

  // #region Hooks

  protected onInit(): void {
    this._action = this._activatedRoute.snapshot.queryParamMap.get('action');
    if (isEmpty(this._action)) {
      this._sdkRouterService.navigateToPage('home-page');
    }

    this._readOnly = this._activatedRoute.snapshot.queryParamMap.get('readOnly') === 'true';
    this._case = this._activatedRoute.snapshot.queryParamMap.get('case') ?? null;

    this.setUpdateState(true);
    this.setDisableMenutabsState(true);
    this.notice = this._dataService.selectedNotice;
    this.loadButtons();
    this.checkFieldVisibilityButton();
  }

  protected onAfterViewInit(): void {
    if (isEmpty(this.notice)) {
      let params: IDictionary<any> = {
        action: this._action
      };
      this._sdkRouterService.navigateToPage('enotice-version-selector-page', params);
    } else {
      setTimeout(() => {
        this.loadForm(); // carica la form da FormDataService
        this.loadOrganisationsNames();
        this.loadTouchpointsNames();
        this.preselectFirstElement();

        if (
          this._currentSelectedId == GR_LOT_ID ||
          (this._currentSelectedId == GR_RESULT_ID && this._currentSelectedLabelId != 'GR-NoticeResult-Section')
        ) {
          this._formService.setShouldShowAddandRemoveButtons(false);
        } else {
          this._formService.setShouldShowAddandRemoveButtons(true);
        }

        if (this._readOnly) {
          this.disableAllForms();
        } else {
          this.enableAllForms();
          this.scrollToPreviousCoordinates();
        }
      });
    }
  }

  protected onDestroy(): void {}

  protected onConfig(config: any): void {
    if (config != null) {
      this.config = { ...config };
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
      // Annulla modifiche
      if (button.code == 'cancel-pagina') {
        this._dialogConfig.open.next(() => {
          this.setUpdateState(false);

          this._formDataService._formGroupBackup = cloneDeep(this.deepCopyOfFormGroup);

          // torna alla pagina precedente
          let params: IDictionary<any> = {
            action: this._action
          };

          // se si stava aggiungendo un nuovo lotto ma si preme il tasto "Annulla", gestire la rimozione del lotto
          switch (this._case) {
            case NEW_LOT:
              params = { ...params, case: CANCELED_NEW_LOT };
              break;
            case NEW_APPALTO:
              params = { ...params, case: CANCELED_NEW_APPALTO };
              break;
            case NEW_OFFERTA:
              params = { ...params, case: CANCELED_NEW_OFFERTA };
              break;
            case NEW_PARTE_OFFERENTE:
              params = { ...params, case: CANCELED_NEW_PARTE_OFFERENTE };
              break;
            case NEW_RISULTATO_LOTTO:
              params = { ...params, case: CANCELED_NEW_RISULTATO_LOTTO };
              break;
          }

          if (this._action === 'NEW') {
            this._sdkRouterService.navigateToPage('new-enotice-page', params);
          } else {
            this._sdkRouterService.navigateToPage('edit-enotice-page', params);
          }
        });
      }
      // Abilita la form per la modifica
      else if (button.code == 'modifica-pagina') {
        this._formService.setShouldShowAddandRemoveButtons(true);

        this._readOnly = false;

        this._buttons = {
          buttons: cloneDeep(this.config.body.buttons)
        };
        // rimuove pulsante "modifica-pagina"
        remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code == 'modifica-pagina');
        // aggiungi pulsante "save-pagina"
        const exists = this._buttons.buttons.some((one) => one.code === 'save-pagina');
        if (!exists) {
          this._buttons.buttons.push({
            code: 'save-pagina',
            label: 'BUTTONS.SAVE-PAGINA',
            icon: 'mgg-icons-crud-save'
          });
        }
        this.buttonsSubj.next(this._buttons);

        this.checkFieldVisibilityButton();
        this.enableAllForms();
      }
      // Salva modifiche
      else if (button.code == 'save-pagina') {
        // Salva lo stato corrente del form prima di passare a un nuovo form
        if (!isEmpty(this._currentSelectedId) && this._formReactiveContent[this._currentSelectedId] != null) {
          // Se currentGroupIndex è -1, assegna l'intero formGroup
          if (this.currentGroupIndex == -1) {
            this._formReactiveContent[this._currentSelectedId] = this.formGroup;
          } else {
            if (this._currentSelectedId == GR_RESULT_ID) {
              let targetIndex;
              switch (this._formDataService._resultsInnerKey) {
                case 'GR-TenderingParty-Section':
                  targetIndex = this._formReactiveContent[GR_RESULT_ID].controls['GR-TenderingParty-Section'].controls[
                    'GR-TenderingParty'
                  ].controls.findIndex((form) => {
                    return form.controls['OPT-210-Tenderer'].value == this._currentSelectedLabelId;
                  });

                  this._formReactiveContent[GR_RESULT_ID].controls['GR-TenderingParty-Section'].controls[
                    'GR-TenderingParty'
                  ].controls[targetIndex] = this.formGroup;
                  break;

                case 'GR-SettledContract-Section':
                  targetIndex = this._formReactiveContent[GR_RESULT_ID].controls['GR-SettledContract-Section'].controls[
                    'GR-SettledContract'
                  ].controls.findIndex((form) => {
                    return (
                      form.controls['GR-SettledContract-1'].controls['OPT-316-Contract'].value ==
                      this._currentSelectedLabelId
                    );
                  });
                  this._formReactiveContent[GR_RESULT_ID].controls['GR-SettledContract-Section'].controls[
                    'GR-SettledContract'
                  ].controls[targetIndex] = this.formGroup;
                  break;

                case 'GR-LotTender-Section':
                  targetIndex = this._formReactiveContent[GR_RESULT_ID].controls['GR-LotTender-Section'].controls[
                    'GR-LotTender'
                  ].controls.findIndex((form) => {
                    return form.controls['GR-Tender'].controls['OPT-321-Tender'].value == this._currentSelectedLabelId;
                  });
                  this._formReactiveContent[GR_RESULT_ID].controls['GR-LotTender-Section'].controls[
                    'GR-LotTender'
                  ].controls[targetIndex] = this.formGroup;
                  break;

                case 'GR-LotResult-Section':
                  targetIndex = this._formReactiveContent[GR_RESULT_ID].controls['GR-LotResult-Section'].controls[
                    'GR-LotResult'
                  ].controls.findIndex((form) => {
                    return form.controls['OPT-322-LotResult'].value == this._currentSelectedLabelId;
                  });
                  this._formReactiveContent[GR_RESULT_ID].controls['GR-LotResult-Section'].controls[
                    'GR-LotResult'
                  ].controls[targetIndex] = this.formGroup;
                  break;

                case 'GR-NoticeResult-Section':
                  this._formReactiveContent[GR_RESULT_ID].controls[this._formDataService._resultsInnerKey] =
                    this.formGroup;
                  break;
              }
            } else {
              // Altrimenti, aggiorna il FormGroup corrispondente all'indice corrente
              (this._formReactiveContent[this._currentSelectedId] as IDictionary<FormGroup>)[
                this._currentSelectedLabelId
              ] = this.formGroup;
            }
          }
        }

        // Salva le modifiche del form in FormDataService
        this._formDataService._formContentBackup = cloneDeep(this._formContent);
        this._formDataService._formReactiveContentBackup = cloneDeep(this._formReactiveContent);
        this._formDataService._formReactiveContentOriginalBackup = cloneDeep(this._formReactiveContentOriginal);
        this._formDataService._currentSelectedIdBackup = cloneDeep(this._currentSelectedId);
        this._formDataService._currentSelectedLabelIdBackup = cloneDeep(this._currentSelectedLabelId);
        this._formDataService._formGroupBackup = cloneDeep(this.formGroup);
        this._formDataService._metadataFormGroupBackup = cloneDeep(this.metadataFormGroup);
        this._formDataService._currentGroupIndexBackup = cloneDeep(this.currentGroupIndex);
        this._formDataService.noticeInfo = cloneDeep(this.noticeInfo);

        this.setUpdateState(false);

        let lastPageIndex;
        switch (this._case) {
          case NEW_LOT:
            // se si stava aggiungendo un nuovo lotto, aggiorna l'indice per la paginazione
            const totalLots = this._lotsTableService.lotsItems.length;
            lastPageIndex = Math.floor(totalLots / this._lotsTableService.rows) * this._lotsTableService.rows;
            this._lotsTableService.first = lastPageIndex;
            break;
          case NEW_APPALTO:
            const appalti = this._resultsTableService.appaltiItems.length;
            lastPageIndex =
              Math.floor(appalti / this._resultsTableService.rowsAppalti) * this._resultsTableService.rowsAppalti;
            this._resultsTableService.firstAppalti = lastPageIndex;
            break;
          case NEW_OFFERTA:
            const offerte = this._resultsTableService.offerteItems.length;
            lastPageIndex =
              Math.floor(offerte / this._resultsTableService.rowsOfferte) * this._resultsTableService.rowsOfferte;
            this._resultsTableService.firstOfferte = lastPageIndex;
            break;
          case NEW_PARTE_OFFERENTE:
            const parteOfferente = this._resultsTableService.partiOfferentiItems.length;
            lastPageIndex =
              Math.floor(parteOfferente / this._resultsTableService.rowsPartiOfferenti) *
              this._resultsTableService.rowsPartiOfferenti;
            this._resultsTableService.firstPartiOfferenti = lastPageIndex;
            break;
          case NEW_RISULTATO_LOTTO:
            const risultatoLotto = this._resultsTableService.risultatiDeiLottiItems.length;
            lastPageIndex =
              Math.floor(risultatoLotto / this._resultsTableService.rowsRisultatiDeiLotti) *
              this._resultsTableService.rowsRisultatiDeiLotti;
            this._resultsTableService.firstRisultatiDeiLotti = lastPageIndex;
            break;
        }

        // torna alla pagina precedente
        let params: IDictionary<any> = {
          action: this._action
        };

        if (this._action === 'NEW') {
          this._sdkRouterService.navigateToPage('new-enotice-page', params);
        } else {
          this._sdkRouterService.navigateToPage('edit-enotice-page', params);
        }
      }
      // Mostra/Nascondi campi obbligatori
      else if (button.code == 'toggle-visibility') {
        let visibility = this._formService.toggleVisibility();

        if (visibility) {
          this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').label = 'BUTTONS.SHOW-OPTIONAL-FIELDS';
        } else {
          this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').label = 'BUTTONS.HIDE-OPTIONAL-FIELDS';
        }
      }
    }
  }

  // #endregion

  // #region Private

  private async scrollToPreviousCoordinates() {
    while (this.formReady == false) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await new Promise((resolve) => setTimeout(resolve, 200));

    const scrollContainer = document.querySelector(
      '.element-tabs-container.main-content.sdk-layout-content-section.with-tabs.ng-star-inserted'
    ) as HTMLElement;
    this._scrollService.scrollToY(scrollContainer);
  }

  // Precarica tutta la sezione della form da modificare da FormDataService
  private loadForm(): void {
    this._formContent = cloneDeep(this._formDataService._formContentBackup);
    this._formReactiveContent = cloneDeep(this._formDataService._formReactiveContentBackup);
    this._formReactiveContentOriginal = cloneDeep(this._formDataService._formReactiveContentOriginalBackup);
    this._currentSelectedId = cloneDeep(this._formDataService._currentSelectedIdBackup);
    this._currentSelectedLabelId = cloneDeep(this._formDataService._currentSelectedLabelIdBackup);
    //FormGroup non può essere cloneDeep qui perche perderei la reference al formcontrol originale e non funzionerebbe lo scroll
    this.formGroup = this._formDataService._formGroupBackup;
    this.deepCopyOfFormGroup = cloneDeep(this._formDataService._formGroupBackup);
    this.currentGroupIndex = cloneDeep(this._formDataService._currentGroupIndexBackup);
    this.metadataFormGroup = cloneDeep(this._formDataService._metadataFormGroupBackup);
    this.noticeInfo = cloneDeep(this._formDataService.noticeInfo);

    this._formDataService.changed = true;
  }

  private loadButtons(): void {
    this._buttons = {
      buttons: cloneDeep(this.config.body.buttons)
    };

    if (this._readOnly) {
      // rimuove pulsante "save-pagina"
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code == 'save-pagina');
      // aggiungi pulsante "modifica-pagina"
      const exists = this._buttons.buttons.some((one) => one.code === 'modifica-pagina');
      if (!exists) {
        this._buttons.buttons.push({
          code: 'modifica-pagina',
          label: 'BUTTONS.MODIFICA-PAGINA',
          icon: 'mgg-icons-crud-edit'
        });
      }
    } else {
      // rimuove pulsante "modifica-pagina"
      remove(this._buttons.buttons, (one: SdkButtonGroupSingleInput) => one.code == 'modifica-pagina');
      // aggiungi pulsante "save-pagina"
      const exists = this._buttons.buttons.some((one) => one.code === 'save-pagina');
      if (!exists) {
        this._buttons.buttons.push({
          code: 'save-pagina',
          label: 'BUTTONS.SAVE-PAGINA',
          icon: 'mgg-icons-crud-save'
        });
      }
    }

    this.buttonsSubj = new BehaviorSubject(this._buttons);
  }

  private checkFieldVisibilityButton(): void {
    if (this._formService.checkVisibility() == true) {
      this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').label = 'BUTTONS.SHOW-OPTIONAL-FIELDS';
    } else {
      this._buttons.buttons.find((btn) => btn.code == 'toggle-visibility').label = 'BUTTONS.HIDE-OPTIONAL-FIELDS';
    }
  }

  /**
   * Abilita tutti i forms, ma tiene disabilitati i campi che dovrebbero essere disabilitati, come i "-Language".
   */
  private async enableAllForms() {
    while (this.formReady == false) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    this._formService.setShouldShowAddandRemoveButtons(true);
    this._readOnly = false;

    Object.values(this._formReactiveContent).forEach((item) => {
      if (item instanceof AbstractControl) {
        item.enable();
      } else {
        Object.values(item).forEach((nestedForm) => {
          if (nestedForm instanceof AbstractControl) {
            nestedForm.enable();
          }
        });
      }
    });

    this.formGroup.enable();

    const fieldsToKeepDisabled = [
      Constants.StandardIdentifiers.LEGAL_BASIS_TYPE_FIELD,
      Constants.StandardIdentifiers.CPV_PROCEDURE_FIELD,
      Constants.StandardIdentifiers.CPV_LOT_FIELD,
      '-Language',
      '-Currency'
    ];

    const shouldBeDisabled = (controlName: string): boolean => {
      return fieldsToKeepDisabled.some(
        (field) => controlName === field || (field.startsWith('-') ? controlName.endsWith(field) : false)
      );
    };

    const processControl = (control: AbstractControl, controlName: string = '') => {
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach((key) => {
          processControl(control.get(key)!, key);
        });
      } else if (control instanceof FormArray) {
        control.controls.forEach((ctrl, index) => {
          processControl(ctrl, `${controlName}[${index}]`);
        });
      } else if (control instanceof FormControl) {
        if (shouldBeDisabled(controlName)) {
          control.disable({ emitEvent: false, onlySelf: true });
        } else {
          control.enable({ emitEvent: false, onlySelf: true });
        }
      }
    };

    Object.entries(this._formReactiveContent).forEach(([key, item]) => {
      if (item instanceof AbstractControl) {
        processControl(item, key);
      } else {
        Object.entries(item).forEach(([nestedKey, nestedForm]) => {
          if (nestedForm instanceof AbstractControl) {
            processControl(nestedForm, `${key}.${nestedKey}`);
          }
        });
      }
    });

    Object.keys(this.formGroup.controls).forEach((key) => {
      processControl(this.formGroup.get(key)!, key);
    });
  }

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
   * Vedi issue EFORMS-11. Carico il nome di tutte le organizzazioni (caso di caricamento tracciato da applicativo esterno)
   * e le salvo nel formService,
   * Facendo così posso popolare con il nome dell'organizzazione organizzazione.
   * Per esempio, in alcune combobox come in sezione 'Lotto' con id = 'OPT-301-Lot-FiscalLegis',
   * ci sarà 'ORG-0001, Comune di ZZZ' invece di 'ORG-0001'
   */
  private loadOrganisationsNames = () => {
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
          if (control && control.controls['OPT-200-Organization-Company']) {
            let orgId: string = control.controls['OPT-200-Organization-Company'].value;
            this._formService.dictionaryOfMultipleOrgsFormControl[orgId] =
              control.controls['GR-Company'].controls['BT-500-Organization-Company'];
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

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
   * Metodo che preseleziona l'elemento dell'accordion di elementi di primo livello
   */
  private preselectFirstElement = (): void => {
    if (this._currentSelectedId == GR_RESULT_ID) {
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
      const sectionIndex = this._formService.firstLevelItems.findIndex((item) => item.id == this._currentSelectedId);
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

  /**
   * Metodo asincrono che gestisce il toggle degli elementi di primo livello nell'accordion.
   * @param output - L'output dell'elemento dell'accordion selezionato.
   * @returns Una Promise che risolve una volta completata l'operazione.
   */
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

    // Imposta formReady a false per indicare che il form non è pronto
    this.formReady = false;
    this.isLoading = true;

    // Esegue il codice dopo un breve timeout per permettere al browser di eseguire altri compiti
    setTimeout(() => {
      let id: string = output.id;

      // Salva lo stato corrente del form prima di passare a un nuovo form
      if (!isEmpty(this._currentSelectedId) && this._formReactiveContent[this._currentSelectedId] != null) {
        // Se currentGroupIndex è -1, assegna l'intero formGroup
        if (!(this._currentSelectedId == GR_RESULT_ID)) {
          if (this.currentGroupIndex == -1) {
            this._formReactiveContent[this._currentSelectedId] = this.formGroup;
          } else {
            // Altrimenti, aggiorna il FormGroup corrispondente all'indice corrente
            (this._formReactiveContent[this._currentSelectedId] as IDictionary<FormGroup>)[
              this._currentSelectedLabelId
            ] = this.formGroup;
          }
        }
      }

      // Imposta l'ID corrente selezionato e l'indice del gruppo corrente
      this._currentSelectedId = id;
      //this._currentSelectedLabelId = null;
      this.currentGroupIndex = this._formService.manageGroupIndex(output.index);

      if (id == GR_RESULT_ID) {
        let indexResult = this._formContent[id].content.findIndex((item) => {
          return item.id == this._formDataService._resultsInnerKey;
        });
        if (this._formDataService._resultsInnerKey == 'GR-NoticeResult-Section') {
          this.firstElementPartial = this._formContent[id].content[indexResult];
        } else {
          this.firstElementPartial = this._formContent[id].content[indexResult].content[0];
        }
      } else {
        this.firstElementPartial = this._formContent[id];
      }
      this.formReactiveContentOriginalPassed = this._formReactiveContentOriginal[id];
      // Controlla se esiste un formReactiveContent per l'ID corrente
      if (has(this._formReactiveContent, id)) {
        if (id == GR_RESULT_ID) {
          // let targetForm = this._formReactiveContent[GR_RESULT_ID].controls[this._formDataService._resultsInnerKey];
          // switch (this._formDataService._resultsInnerKey) {
          //   case 'GR-TenderingParty-Section':
          //     targetForm = targetForm.controls['GR-TenderingParty'].controls.filter((form) => {
          //       return form.controls['OPT-210-Tenderer'].value == this._currentSelectedLabelId;
          //     });
          //     this.formGroup = targetForm[0];
          //     break;
          //   case 'GR-SettledContract-Section':
          //     targetForm = targetForm.controls['GR-SettledContract'].controls.filter((form) => {
          //       return (
          //         form.controls['GR-SettledContract-1'].controls['OPT-316-Contract'].value ==
          //         this._currentSelectedLabelId
          //       );
          //     });
          //     this.formGroup = targetForm[0];
          //     break;
          //   case 'GR-LotTender-Section':
          //     targetForm = targetForm.controls['GR-LotTender'].controls.filter((form) => {
          //       return form.controls['GR-Tender'].controls['OPT-321-Tender'].value == this._currentSelectedLabelId;
          //     });
          //     this.formGroup = targetForm[0];
          //     break;
          //   case 'GR-LotResult-Section':
          //     targetForm = targetForm.controls['GR-LotResult'].controls.filter((form) => {
          //       return form.controls['OPT-322-LotResult'].value == this._currentSelectedLabelId;
          //     });
          //     this.formGroup = targetForm[0];
          //     break;
          // }
        } else if (this.currentGroupIndex == -1) {
          (this.formGroup as any) = this._formReactiveContent[id];
        } else {
          Object.keys(this._formReactiveContent[id]).forEach((key) => {
            if (key.includes(output.index)) {
              this.formGroup = this._formReactiveContent[id][key];
              this._currentSelectedLabelId = key;
            }
          });
        }
      } else {
        console.error('BUG! FormReactiveContent Not Present!');
      }

      // Imposta formReady a true per indicare che il form è pronto
      console.log(this.formGroup, this.firstElementPartial);
      this.formReady = true;
    }, 0);
  }

  /**
   * Aggiunge un nuovo elemento di primo livello
   * @param id id dell'elemento
   */
  override manageAddElementEvent(id: string): void {
    let selectedFormContent: any = cloneDeep(this._formContent[id]);

    // Verifica se l'elemento di primo livello esiste
    if (selectedFormContent) {
      selectedFormContent = this._formService.elaborateIdFields(selectedFormContent);
      // Trova l'ultimo valore dell'indice per l'id fornito
      let largestIndexValue = this._formService.getLatestValueByIdField(selectedFormContent._idScheme);

      // Carica il form reattivo per l'elemento di primo livello clonato
      let formGroup: FormGroup = this._formService.createFormGroupForSelectedFormContent(
        this.notice,
        selectedFormContent
      );

      // Verifica se esiste già un form reattivo per l'ID dell'elemento di primo livello clonato
      if (has(this._formReactiveContent, selectedFormContent.id)) {
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
    } else {
      console.error('First level element not found');
    }
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

  private removeItemFromItems(obj) {
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
      this.removeItemFromItems(obj);
      console.log('Items after deleting', cloneDeep(this._formService.firstLevelItems));
      console.log('field map after deleting', cloneDeep(this._formService.idFieldMap));
    } else {
      console.error('Form group not found');
    }
  }

  // #endregion
}
