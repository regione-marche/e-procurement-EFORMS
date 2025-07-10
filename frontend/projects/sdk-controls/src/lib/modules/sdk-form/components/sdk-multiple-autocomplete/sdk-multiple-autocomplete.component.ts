import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
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
import { each, get, has, isEmpty, isFunction, isObject, join, keys, reduce, set } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SdkFormMessageItem } from '../../../sdk-form-message-box/sdk-form-message-box.domain';
import { SdkModalOutput } from '../../../sdk-modal/sdk-modal.domain';
import {
  SdkAutocompleteConfig,
  SdkAutocompleteItem,
  SdkMultipleAutocompleteConfig,
  SdkMultipleAutocompleteInput,
  SdkMultipleAutocompleteOutput,
} from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';
import { AutoCompleteUnselectEvent } from 'primeng/autocomplete';


/**
 * Componente per renderizzare un campo autocomplete
 */
@Component({
  selector: 'sdk-multiple-autocomplete',
  templateUrl: './sdk-multiple-autocomplete.component.html',
  styleUrls: ['./sdk-multiple-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkMultipleAutocompleteComponent extends SdkAbstractFormField<SdkAutocompleteConfig, SdkMultipleAutocompleteInput, SdkMultipleAutocompleteOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkMultipleAutocompleteConfig;
  /**
   * @ignore
   */
  public data: Array<SdkAutocompleteItem>;
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
  private notValids: Array<SdkValidatorOutput>;

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
  private itemsProviderSubscription: Subscription;
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
  private configMap: IDictionary<SdkAutocompleteItem> = {};

  /**
   * @ignore
   */
  public mandatory: boolean = false;

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
  protected onOutput(_data: SdkMultipleAutocompleteOutput): void { }

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
      let debTime: number = 350;
      this.addSubscription(this.debounce.pipe(
        debounceTime(debTime),
        distinctUntilChanged())
        .subscribe((value: any) => {
          this.refreshData(value);
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
  protected onData(data: SdkMultipleAutocompleteInput): void {
    this.markForCheck(() => {
      if (isObject(data) && isObject(data.data)) {
        this.data = data.data;
        each(data.data, (one: SdkAutocompleteItem) => {
          this.dataValue += one.text + ' ';
        });
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

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public manageSelect(value: SdkAutocompleteItem): void {
    let valid: boolean = undefined;
    if (this.config.inlineValidation === true) {
      valid = this.executeValidators(value.text);
      this.updateMessageMap();
    }
    let realItem: SdkAutocompleteItem = get(this.configMap, value.text);
    //this.markForCheck(() => this.selectedItem.push(realItem));
    if ((isEmpty(value.text) || (!isEmpty(value.text) && isObject(realItem)))) {
      this.emitOutput({ code: this.config.code, data: this.data, valid } as SdkMultipleAutocompleteOutput);
    }
  }

  /**
   * @ignore
   */
  public manageUnselect(out: AutoCompleteUnselectEvent): void {
    let value: SdkAutocompleteItem = out.value;

    let valid: boolean = true;
    if ((!isEmpty(value.text))) {
      this.emitOutput({ code: this.config.code, data: this.data, valid } as SdkMultipleAutocompleteOutput);
    }

  }

  /**
   * @ignore
   */
  public refreshData(value: any): void {
    if (isFunction(this.config.itemsProvider) && value && !isEmpty(value.query) && value.query.length >= this.minSearchCharacters) {
      this.unsubscribeItemsProvider();
      this.itemsProviderSubscription = this.config.itemsProvider(value.query).subscribe((result: Array<SdkAutocompleteItem>) => {
        this.markForCheck(() => {
          if (isEmpty(result)) {
            this.listItems = new Array();
          } else {
            this.listItems = [...result];
          }
          this.buildConfigMap();
        });
      });
    } else {
      this.markForCheck(() => {
        this.listItems = new Array();
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
  public manageModalOutput(item: SdkModalOutput<SdkAutocompleteItem>): void {
    if (isObject(item) && isObject(item.data)) {
      let data: SdkAutocompleteItem = item.data;
      // aggiorno la mappa dei real item con quello nuovo
      let value = data.text;
      set(this.configMap, value, data);
      let realItem: SdkAutocompleteItem = get(this.configMap, value);
      this.markForCheck(() => {
        each(this.data, (one: SdkAutocompleteItem) => {
          this.dataValue += one.text + ' ';
        });
      });
      this.emitOutput({ code: this.config.code, data: this.data, valid: undefined } as SdkMultipleAutocompleteOutput);
    }
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
  public clearAutocomplete(event: any): void {
    this.markForCheck(() => {
      delete this.dataValue;
    });
    this.emitOutput({ code: this.config.code, data: undefined, valid: undefined } as SdkMultipleAutocompleteOutput);
  }

  // #endregion
}
