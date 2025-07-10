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
import { SdkBasicButtonInput } from '@maggioli/sdk-controls';
import { each, get, has, isEmpty, isFunction, isObject, join, keys, map, set } from 'lodash-es';
import { SelectItem } from 'primeng/api';
import { Subject } from 'rxjs';

import { SdkFormMessageItem } from '../../../sdk-form-message-box/sdk-form-message-box.domain';
import { SdkMultiselectConfig, SdkMultiselectInput, SdkMultiselectItem, SdkMultiselectOutput } from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';


/**
 * Componente per renderizzare un campo multiselect
 */
@Component({
  selector: 'sdk-multiselect',
  templateUrl: './sdk-multiselect.component.html',
  styleUrls: ['./sdk-multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkMultiselectComponent extends SdkAbstractFormField<SdkMultiselectConfig, SdkMultiselectInput, SdkMultiselectOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public selectedData: string = '';
  /**
   * @ignore
   */
  public config: SdkMultiselectConfig;
  /**
   * @ignore
   */
  public data: Array<string>;
  /**
   * @ignore
   */
  public listItems: Array<SelectItem>;

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
  public hasRecords: boolean = false;

  /**
   * @ignore
   */
  public showOnlyNRecords: boolean = false;

  /**
   * @ignore
   */
  public showExpandMessage: boolean = false;

  /**
   * @ignore
   */
  public allData: string = '';

  /**
   * @ignore
   */
  public partialData: string = '';

  /**
   * @ignore
   */
  public buttonDivConfig: Subject<SdkBasicButtonInput> = new Subject();

  /**
   * @ignore
   */
  public showDiv: boolean = false;


  // #endregion

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  // #region Hooks

  /**
   * @ignore
   */
  protected onInit(): void { }

  /**
   * @ignore
   */
  protected onAfterViewInit(): void {
  }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onOutput(data: SdkMultiselectOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkMultiselectConfig): void {
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
      if (isFunction(this.config.itemsProvider)) {
        this.addSubscription(this.config.itemsProvider().subscribe((result: Array<SdkMultiselectItem>) => {
          if (!isEmpty(result)) {
            this.listItems = map(result, (one: SdkMultiselectItem) => {
              let item: SelectItem = {
                value: one.key,
                disabled: one.disabled,
                label: one.value
              };
              return item;
            });
          }
          this.isReady = true;
        }));
      }
    }
  }

  /**
   * @ignore
   */
  protected onData(data: SdkMultiselectInput): void {
    this.markForCheck(() => {
      this.data = map(data.data, (one: SdkMultiselectItem) => {
        return one.key;
      })
    });
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
  public itemDisabled(itemArgs: { dataItem: SdkMultiselectItem, index: number }) {
    return itemArgs.dataItem.disabled === true;
  }

  /**
   * @ignore
   */
  public handleDiv() {
    this.markForCheck(() => {
      this.showDiv = !this.showDiv;
      this.manageModelChange({ 'value': this.data });
      if (!this.hasRecords) {
        this.selectedData = 'MULTISELECT.NO-RECORD-SELECTED';
      }
    });
  }

  /**
   * @ignore
   */
  public getButtonClass() {
    if (this.showDiv === true) {
      return "multiselect-button fas fa-minus";
    }
    else {
      if (this.hasRecords === true) {
        return "multiselect-button fas fa-align-justify";
      } else {
        return "disabled multiselect-button fas fa-align-justify";
      }
    }
  }

  /**
   * @ignore
   */
  public manageModelChange(_value: any): void {
    if (isObject(_value) && isObject(get(_value, 'value'))) {

      let keysArray = [];
      let valueArray = get(_value, 'value');
      each(valueArray, (value) => {
        each(this.listItems, (item) => {
          if (item.value === value) {
            keysArray.push(item.label);
          }
        });
      });
      this.selectedData = keysArray.join(", ");
      this.allData = this.selectedData
      this.showOnlyNRecords = false;
      this.showExpandMessage = false;
      if (get<any, any>(_value, 'value').length === this.listItems.length) {
        this.markForCheck(() => {
          this.hasRecords = true;
          this.selectedData = 'MULTISELECT.ALL-RECORD-SELECTED';
        });
      } else if (get<any, any>(_value, 'value').length > 0 && this.config.showMaxRecords == null) {
        this.markForCheck(() => {
          this.hasRecords = true;
        });

      } else if (get<any, any>(_value, 'value').length > 0 && this.config.showMaxRecords != null && get<any, any>(_value, 'value').length > this.config.showMaxRecords) {

        let data = keysArray.filter((element, idx) => idx < this.config.showMaxRecords).join(", ")
        data = data + ' ...';
        this.partialData = data;
        this.markForCheck(() => {
          this.hasRecords = true;
          this.selectedData = data;
          this.showOnlyNRecords = true;
        });
      } else if (get<any, any>(_value, 'value').length > 0 && this.config.showMaxRecords != null && get<any, any>(_value, 'value').length <= this.config.showMaxRecords) {
        this.markForCheck(() => {
          this.hasRecords = true;
        });
      } else {
        this.markForCheck(() => {
          this.hasRecords = false;
          this.selectedData = 'MULTISELECT.NO-RECORD-SELECTED';
        });
      }
    }
    let valid: boolean = undefined;
    if (this.config.inlineValidation === true) {
      valid = this.executeValidators();
      this.updateMessageMap();
    }
    let finalData: Array<SdkMultiselectItem> = map(this.data, (one: string) => {
      let item: SdkMultiselectItem = {
        key: one,
        value: undefined
      };
      return item;
    });
    this.emitOutput({ code: this.config.code, data: finalData, valid } as SdkMultiselectOutput);
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

  /**
   * @ignore
   */
  public expand(): void {
    this.showOnlyNRecords = false;
    this.showExpandMessage = true;
    this.selectedData = this.allData;
  }

  /**
   * @ignore
   */
  public reduce(): void {
    this.showOnlyNRecords = true;
    this.showExpandMessage = false;
    this.selectedData = this.partialData;
  }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private executeValidators(): boolean {

    this.notValids = new Array();

    each(this.config.validators, (one: SdkValidator<Array<SdkMultiselectItem>>) => {
      let finalData: Array<SdkMultiselectItem> = map(this.data, (one: string) => {
        let item: SdkMultiselectItem = {
          key: one,
          value: undefined
        };
        return item;
      });
      let validatorInput: SdkValidatorInput<Array<SdkMultiselectItem>> = {
        config: one.config,
        data: finalData
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

}
