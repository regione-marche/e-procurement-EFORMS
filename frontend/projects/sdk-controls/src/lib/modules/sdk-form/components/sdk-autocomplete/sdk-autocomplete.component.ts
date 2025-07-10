import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  IDictionary,
  SdkValidationMessage,
  SdkValidator,
  SdkValidatorConfig,
  SdkValidatorInput,
  SdkValidatorOutput,
} from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, get, has, isEmpty, isFunction, isObject, isString, join, keys, reduce, set } from 'lodash-es';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SdkBasicButtonInput, SdkBasicButtonOutput } from '../../../sdk-button/sdk-button.domain';
import { SdkFormMessageItem } from '../../../sdk-form-message-box/sdk-form-message-box.domain';
import { SdkModalConfig, SdkModalOutput } from '../../../sdk-modal/sdk-modal.domain';
import {
  SdkAutocompleteAdvancedBaseFilterItem,
  SdkAutocompleteAdvancedModalComponentConfig,
  SdkAutocompleteConfig,
  SdkAutocompleteInput,
  SdkAutocompleteItem,
  SdkAutocompleteOutput,
} from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';


/**
 * Componente per renderizzare un campo autocomplete
 */
@Component({
  selector: 'sdk-autocomplete',
  templateUrl: './sdk-autocomplete.component.html',
  styleUrls: ['./sdk-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkAutocompleteComponent extends SdkAbstractFormField<SdkAutocompleteConfig, SdkAutocompleteInput, SdkAutocompleteOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  @Input('inputBaseFilter') public inputBaseFilter$: Observable<SdkAutocompleteAdvancedBaseFilterItem>;

  /**
   * @ignore
   */
  @Output('outputBaseFilter') public outputBaseFilter$: EventEmitter<SdkAutocompleteAdvancedBaseFilterItem> = new EventEmitter();

  /**
   * @ignore
   */
  @Output('outputAdvancedModalClose') public outputAdvancedModalClose$: EventEmitter<SdkAutocompleteOutput> = new EventEmitter();

  /**
   * @ignore
   */
  public config: SdkAutocompleteConfig;
  /**
   * @ignore
   */
  public data: SdkAutocompleteItem;
  /**
   * @ignore
   */
  public dataValue: string;

  /**
   * @ignore
   */
  public listItems: Array<SdkAutocompleteItem> = [];

  /**
   * @ignore
   */
  public messagesMap: IDictionary<Array<SdkFormMessageItem>>;

  /**
   * @ignore
   */
  public messagesLevels: Array<string>;

  /**
   * @ignore
   */
  public minSearchCharacters: number = 3;

  /**
   * @ignore
   */
  public debounce: Subject<any> = new Subject<any>();

  /**
   * @ignore
   */
  public debounceAdvanced: Subject<any> = new Subject<any>();

  /**
   * @ignore
   */
  public selectedItem: SdkAutocompleteItem;

  /**
   * @ignore
   */
  public newItemButtonObs: Observable<SdkBasicButtonInput>;

  /**
   * @ignore
   */
  public editItemButtonObs: Observable<SdkBasicButtonInput>;

  /**
   * @ignore
   */
  public advancedButtonObs: Observable<SdkBasicButtonInput>;

  /**
   * @ignore
   */
  public newEditAvailable: boolean = false;

  /**
   * @ignore
   */
  public mandatory: boolean = false;

  /**
   * @ignore
   */
  public modalConfigObs: Subject<SdkModalConfig<any, void, any>> = new Subject();

  /**
   * @ignore
   */
  public advancedModalConfigObs: BehaviorSubject<SdkModalConfig<any, void, any>> = new BehaviorSubject(null);

  /**
   * @ignore
   */
  public showNew: boolean = false;

  /**
   * @ignore
   */
  public permitCustomElement: boolean = false;

  /**
   * @ignore
   */
  public advancedAvailable: boolean = false;

  /**
   * @ignore
   */
  private notValids: Array<SdkValidatorOutput>;
  /**
   * @ignore
   */
  private configMap: IDictionary<SdkAutocompleteItem> = {};
  /**
   * @ignore
   */
  private itemsProviderSubscription: Subscription;
  /**
   * @ignore
   */
  private modalConfig: SdkModalConfig<any, void, any>;
  /**
   * @ignore
   */
  private advancedModalConfig: SdkModalConfig<any, void, any>;
  /**
   * @ignore
   */
  private baseFiltersCampiCollegati: IDictionary<string> = {};

  // #endregion

  // #region Constructor

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);

  }

  // #endregion

  // #region Hooks

  /**
   * @ignore
   */
  protected onInit(): void { }

  /**
   * @ignore
   */
  protected onAfterViewInit(): void { }

  /**
   * @ignore
   */
  protected onDestroy(): void {
    this.unsubscribeItemsProvider();
  }

  /**
   * @ignore
   */
  protected onOutput(_data: SdkAutocompleteOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkAutocompleteConfig): void {
    this.config = config;
    if (isObject(this.config)) {

      this.setAlignByConfig(this.config);

      each(this.config.validators, (one: SdkValidator<any>) => {
        let valCfg: SdkValidatorConfig = one.config;
        if (isObject(valCfg) && get(valCfg, 'required') === true) {
          this.mandatory = true;
          return false;
        }
      });
      this.minSearchCharacters = this.config.minSearchCharacters ? this.config.minSearchCharacters : 3;
      this.newItemButtonObs = of(this.config.newItemButton);
      this.editItemButtonObs = of(this.config.editItemButton);
      this.newEditAvailable = this.config.newEditAvailable === true;
      this.permitCustomElement = this.config.permitCustomElement === true;
      this.advancedAvailable = this.config.advanced === true;

      this.modalConfig = {
        code: 'modal',
        title: 'titolo modale',
        openSubject: new Subject(),
        component: this.config.modalComponent,
        componentConfig: this.config.modalComponentConfig,
        width: 70
      };
      this.modalConfigObs.next(this.modalConfig);

      this.advancedModalConfig = {
        code: 'modal',
        title: 'titolo modale',
        component: 'sdk-autocomplete-advanced-modal',
        openSubject: new Subject(),
        width: 70
      };
      this.advancedModalConfigObs.next(this.advancedModalConfig);

      this.advancedButtonObs = of({
        code: 'search',
        label: 'search',
        look: 'icon',
        icon: 'mgg-icons-data-search'
      });

      if (this.inputBaseFilter$ != null) {
        this.addSubscription(this.inputBaseFilter$.subscribe((item: SdkAutocompleteAdvancedBaseFilterItem) => {
          if (item != null) {
            this.baseFiltersCampiCollegati[item.code] = item.data;
          }
        }));
      }

      let debTime: number = this.permitCustomElement === true ? 10 : 350;
      this.addSubscription(this.debounce.pipe(
        debounceTime(debTime),
        distinctUntilChanged())
        .subscribe((value: any) => {
          this.refreshData(value);
        }));

      this.addSubscription(this.debounceAdvanced.pipe(
        debounceTime(350),
        distinctUntilChanged())
        .subscribe((_value: any) => {
          this.emitBaseFilterOutput();
        }));

      if (isObject(this.config.clearSubject)) {
        this.addSubscription(this.config.clearSubject.subscribe((data: boolean) => {
          if (data === true) {
            setTimeout(() => {
              this.markForCheck(() => {
                delete this.dataValue;
                delete this.data;
                this.listItems = new Array();
              });
            })
          }
        }));
      }
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(data: SdkAutocompleteInput): void {
    this.markForCheck(() => {
      if (isObject(data) && isObject(data.data)) {

        let value: SdkAutocompleteItem = data.data;
        if (data.data._key == null && data.data.text == null) {
          value = undefined;
        }

        let collegato: boolean = !!data.collegato;
        this.data = this.selectedItem = value;
        this.dataValue = value?.text ?? undefined;
        if (collegato == true) {
          this.emitOutput({ code: this.config.code, data: this.data, valid: undefined, collegato } as SdkAutocompleteOutput);
        }
        this.emitBaseFilterOutput(false);
      } else {
        this.markForCheck(() => {
          delete this.dataValue;
          delete this.data
          delete this.selectedItem;
        });
        this.emitOutput({ code: this.config.code, data: undefined, valid: undefined } as SdkAutocompleteOutput);
      }
    });
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Getters

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private unsubscribeItemsProvider(): void {
    if (isObject(this.itemsProviderSubscription)) {
      this.itemsProviderSubscription.unsubscribe();
    }
  }

  /**
   * @ignore
   */
  private buildConfigMap(): void {
    this.configMap = {};
    this.configMap = reduce(this.listItems, (map: IDictionary<SdkAutocompleteItem>, one: SdkAutocompleteItem) => {
      map[one.text] = one;
      return map;
    }, {});
  }

  /**
   * @ignore
   */
  private executeValidators(value: string): boolean {

    this.notValids = new Array();

    each(this.config.validators, (one: SdkValidator<string>) => {

      let validatorInput: SdkValidatorInput<string> = {
        config: one.config,
        data: value
      }

      let out: SdkValidatorOutput = one.validator(validatorInput);

      if (out.valid === false) {
        this.notValids.push(out);
      }

    });

    return isEmpty(this.notValids);
  }

  /**
   * @ignore
   */
  private updateMessageMap(): void {
    this.messagesMap = {};
    each(this.notValids, (one: SdkValidatorOutput) => {
      each(one.messages, (mess: SdkValidationMessage) => {
        if (!has(this.messagesMap, mess.level)) {
          set(this.messagesMap, mess.level, new Array());
        }
        this.messagesMap[mess.level].push({
          text: mess.text,
          params: mess.params
        });
      });
    });
    this.messagesLevels = keys(this.messagesMap);
  }

  /**
   * @ignore
   */
  private emitBaseFilterOutput(emitWhole: boolean = true): void {
    let data: string = isEmpty(this.dataValue) ? null : this.dataValue;
    this.outputBaseFilter$.emit({ code: this.config.code, data });
    if (emitWhole) {
      let realItem: SdkAutocompleteItem = get(this.configMap, data);
      if (realItem == null && data != null) {
        realItem = {
          _key: data,
          text: data
        }
      } else {
        realItem = {
          _key: undefined,
          text: undefined
        }
      }
      this.emitOutput({ code: this.config.code, data: realItem, valid: undefined, userInput: true } as SdkAutocompleteOutput);
    }
  }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public manageModelChange(value: SdkAutocompleteItem): void {
    let valid: boolean = undefined;
    if (this.config.inlineValidation === true) {
      valid = this.executeValidators(value.text);
      this.updateMessageMap();
    }
    let realItem: SdkAutocompleteItem = get(this.configMap, value.text);
    this.markForCheck(() => this.selectedItem = realItem);
    if ((isEmpty(value.text) || (!isEmpty(value.text) && isObject(realItem)))) {
      this.emitOutput({ code: this.config.code, data: realItem, valid } as SdkAutocompleteOutput);
    }
  }

  /**
   * @ignore
   */
  public refreshData(value: any): void {
    if (isFunction(this.config.itemsProvider) && value && !isEmpty(value.query) && value.query.length >= this.minSearchCharacters) {
      this.unsubscribeItemsProvider();
      this.itemsProviderSubscription = this.config.itemsProvider(value.query, this.config.listCode).subscribe((result: Array<SdkAutocompleteItem>) => {
        this.markForCheck(() => {
          if (isEmpty(result)) {
            this.listItems = new Array();
            this.showNew = true;
          } else {
            this.listItems = [...result];
            this.showNew = false;
          }
          if (this.permitCustomElement === true) {
            const customElement: SdkAutocompleteItem = {
              text: value.query,
              _key: value.query
            };
            this.data = this.selectedItem = customElement;
            this.dataValue = customElement.text;
            this.emitOutput({ code: this.config.code, data: customElement, valid: undefined } as SdkAutocompleteOutput);
          }
          this.buildConfigMap();
        });
      });
    } else {
      this.markForCheck(() => {
        this.listItems = new Array();
        this.showNew = true;
      });
    }
  }

  /**
   * @ignore
   */
  public getClasses(label: boolean, initialClass: string, additionalClasses: Array<string>, infoBox?: boolean): string {
    let classes: Array<string> = [initialClass];
    if (!isEmpty(additionalClasses)) {
      classes = [...classes, ...additionalClasses];
    }
    if (infoBox === true) {
      classes.push('info-box-available');
    }

    if (!label) {
      if (this.config.align === 'DX') {
        classes.push(this.DEFAULT_ALIGN_RIGHT_CLASS);
      }
    }

    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public manageNewEditButtonClick(_button: SdkBasicButtonOutput): void {
    let componentConfig = {
      ...this.config.modalComponentConfig
    }
    if (isObject(this.selectedItem)) {
      componentConfig.selectedItem = this.selectedItem;
    }
    this.modalConfig = {
      ...this.modalConfig,
      componentConfig,
    };
    this.modalConfigObs.next(this.modalConfig);
    this.modalConfig.openSubject.next(true);
  }

  /**
   * @ignore
   */
  public manageModalOutput(item: SdkModalOutput<SdkAutocompleteItem>, userInput?: boolean): void {
    if (isObject(item) && isObject(item.data)) {
      let data: SdkAutocompleteItem = item.data;
      // aggiorno la mappa dei real item con quello nuovo
      let value = data.text;
      set(this.configMap, value, data);
      let realItem: SdkAutocompleteItem = get(this.configMap, value);
      this.markForCheck(() => {
        this.selectedItem = realItem;
        this.data = realItem;
        this.dataValue = realItem.text;
      });
      this.emitOutput({ code: this.config.code, data: realItem, valid: undefined, userInput } as SdkAutocompleteOutput);
    }
  }

  /**
   * @ignore
   */
  public manageAdvancedModalOutput(item: SdkModalOutput<SdkAutocompleteItem>): void {
    // emit evento di chiusura
    if (item.close === true) {
      this.outputAdvancedModalClose$.emit({ code: this.config.code });
    }
    this.manageModalOutput(item, false);
  }

  /**
   * @ignore
   */
  public handleInfoBoxDblClick(_event: Event): void {
    if (this.config.infoBox === true) {
      this.outputInfoBox$.emit(this.config);
    }
  }

  /**
   * @ignore
   */
  public getNoDataLabel(value: string): string {
    if (!isEmpty(value)) {
      return this.translateService.instant(value);
    }
    return 'No Data Found';
  }

  /**
   * @ignore
   */
  public clearAutocomplete(_event: any): void {
    this.markForCheck(() => {
      delete this.dataValue;
      delete this.selectedItem;
    });
    this.emitOutput({ code: this.config.code, data: undefined, valid: undefined } as SdkAutocompleteOutput);
  }

  /**
   * @ignore
   */
  public getFieldData(value: any): any {
    if (isString(value)) {
      let val = `${value}`;

      super.formatMultilineValue(val);

      return val;
    }
    return value;
  }

  /**
   * @ignore
   */
  public manageAdvancedButtonClick(): void {

    let advancedAutocompleteCampiCollegatiToAdvancedFilter: boolean = get(this.config, 'advancedAutocompleteCampiCollegatiToAdvancedFilter');

    let componentConfig: SdkAutocompleteAdvancedModalComponentConfig = {
      ...this.config.advancedModalComponentConfig,
      searchData: this.dataValue,
      code: this.config.code,
      baseFiltersCampiCollegati: this.baseFiltersCampiCollegati,
      advancedAutocompleteCampiCollegatiToAdvancedFilter: advancedAutocompleteCampiCollegatiToAdvancedFilter != null ? advancedAutocompleteCampiCollegatiToAdvancedFilter : true
    }
    this.advancedModalConfig = {
      ...this.advancedModalConfig,
      componentConfig,
    };
    this.advancedModalConfigObs.next(this.advancedModalConfig);
    this.advancedModalConfig.openSubject.next(true);
  }

  /**
   * @ignore
   */
  public onBlur(_event: any): void {
    if (this.dataValue != null && !isEmpty(this.dataValue)) {
      this.manageAdvancedButtonClick();
    }
  }

  // #endregion
}
