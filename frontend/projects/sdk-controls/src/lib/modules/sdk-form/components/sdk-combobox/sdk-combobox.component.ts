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
import { each, find, get, has, isArray, isEmpty, isFunction, isObject, join, keys, map, set, toString } from 'lodash-es';
import { SelectItem } from 'primeng/api';

import { SdkFormMessageItem } from '../../../sdk-form-message-box/sdk-form-message-box.domain';
import { SdkComboboxConfig, SdkComboboxInput, SdkComboBoxItem, SdkComboboxOutput } from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';

/**
 * Componente per renderizzare un campo combobox
 */
@Component({
  selector: 'sdk-combobox',
  templateUrl: './sdk-combobox.component.html',
  styleUrls: ['./sdk-combobox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkComboboxComponent extends SdkAbstractFormField<SdkComboboxConfig, SdkComboboxInput, SdkComboboxOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkComboboxConfig;
  /**
   * @ignore
   */
  public data: string;
  /**
   * @ignore
   */
  public listItems: Array<SelectItem> = [];

  /**
   * @ignore
   */
  public originalListItems: Array<SdkComboBoxItem> = [];

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
  public mandatory: boolean = false;

  /**
   * @ignore
   */
  public currentDescription: string = null;

  /**
   * @ignore
   */
  public showClear: boolean = true;

  // #endregion

  // #region Constructor

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

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
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onOutput(data: SdkComboboxOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkComboboxConfig): void {
    this.config = config;
    if (isObject(this.config)) {

      this.setAlignByConfig(this.config);

      if (this.config.showClear === false) {
        this.showClear = false;
      }

      each(this.config.validators, (one: SdkValidator<any>) => {
        let valCfg: SdkValidatorConfig = one.config;
        if (isObject(valCfg) && get(valCfg, 'required') === true) {
          this.mandatory = true;
          return false;
        }
      });
      if (isFunction(this.config.itemsProvider)) {
        this.addSubscription(this.config.itemsProvider({ listCode: this.config.listCode }).subscribe((result: Array<SdkComboBoxItem>) => {
          this.markForCheck(() => {
            if (isArray(result)) {
              // delete this.data;
              this.originalListItems = result;
              this.listItems = map(result, (one: SdkComboBoxItem) => {
                const item: SelectItem = {
                  value: one.key,
                  disabled: one.disabled,
                  label: !!this.config.showKeyInDescription === true ? `${one.key} - ${one.value}` : one.value,
                  title: one.title
                };
                return item;
              });
              if (this.data && !this.listItems.find(element => element.value === this.data)) {
                delete this.data;
              }
            }
          });
        }));
      }
      if (isObject(this.config.itemsProviderSubject)) {
        this.addSubscription(this.config.itemsProviderSubject.subscribe((data: string) => {
          this.config.itemsProvider({ listCode: this.config.listCode, data }).subscribe((result: Array<SdkComboBoxItem>) => {
            this.markForCheck(() => {
              if (isArray(result)) {

                if (result.length == 0) {
                  delete this.data;
                  delete this.currentDescription;
                  this.emitOutput({ code: this.config.code, data: undefined, valid: undefined, dynamicField: this.config.dynamicField } as SdkComboboxOutput);
                }

                // delete this.data;
                this.originalListItems = result;
                this.listItems = map(result, (one: SdkComboBoxItem) => {
                  const item: SelectItem = {
                    value: one.key,
                    disabled: one.disabled,
                    label: !!this.config.showKeyInDescription === true ? `${one.key} - ${one.value}` : one.value,
                    title: one.title
                  };
                  return item;
                });
                if (this.data && !this.listItems.find(element => element.value === this.data)) {
                  delete this.data;
                }
              }
            });
          });
        }));
      }
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(data: SdkComboboxInput): void {
    if (isObject(data)) {
      if (isObject(data.data)) {
        this.markForCheck(() => {
          this.data = data.data.key != null ? toString(data.data.key) : undefined;
          let item: SdkComboBoxItem = find(this.originalListItems, (one: SdkComboBoxItem) => one.key === this.data);
          this.currentDescription = item != null ? item.description : null;
        });
        this.emitOutput({
          code: this.config.code,
          data: {
            key: this.data
          },
          valid: undefined,
          dynamicField: this.config.dynamicField
        } as SdkComboboxOutput);
        setTimeout(() => {
          this.setClearTitle();
        });
      } else {
        this.markForCheck(() => {
          this.data = undefined;
          delete this.currentDescription;
        });
        this.emitOutput({ code: this.config.code, data: undefined, valid: undefined, dynamicField: this.config.dynamicField } as SdkComboboxOutput);
      }
    }
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public itemDisabled(itemArgs: { dataItem: SdkComboBoxItem, index: number }) {
    return itemArgs.dataItem.disabled === true;
  }

  /**
   * @ignore
   */
  public manageModelChange(event: any): void {
    let value: string = event.value;
    let item: SdkComboBoxItem = find(this.originalListItems, (one: SdkComboBoxItem) => one.key === value);
    let realItem: SdkComboBoxItem = {
      ...item
    };
    // this.data = value;
    let valid: boolean = undefined;
    if (this.config.inlineValidation === true) {
      valid = this.executeValidators(realItem);
      this.updateMessageMap();
    }
    delete this.currentDescription;
    if (item != null && item.description != null) {
      this.currentDescription = item.description;
    }
    this.emitOutput({ code: this.config.code, data: realItem, valid, dynamicField: this.config.dynamicField } as SdkComboboxOutput);
    setTimeout(() => {
      this.setClearTitle();
    });
  }

  /**
   * @ignore
   */
  public getClasses(label: boolean, initialLabel: string, additionalClasses: Array<string>, infoBox?: boolean): string {
    let classes: Array<string> = [initialLabel];
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
  public handleInfoBoxDblClick(_event: Event): void {
    if (this.config.infoBox === true) {
      this.outputInfoBox$.emit(this.config);
    }
  }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private executeValidators(value: SdkComboBoxItem): boolean {

    this.notValids = new Array();

    each(this.config.validators, (one: SdkValidator<SdkComboBoxItem>) => {

      let validatorInput: SdkValidatorInput<SdkComboBoxItem> = {
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
  private setClearTitle(): void {
    let selector = document.getElementsByClassName('p-dropdown-clear-icon');

    if (selector != null && selector.length > 0) {
      for (let i = 0; i < selector.length; i++) {
        let item: HTMLElement = selector[i] as HTMLElement;
        if (isEmpty(item.title)) {
          item.title = this.translateService.instant('BUTTONS.CLEAN');
        }
      }
    }
  }

  // #endregion

  // #region Getters

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

}
