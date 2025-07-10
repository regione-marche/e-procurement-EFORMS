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
import { each, findIndex, get, has, isEmpty, isObject, join, keys, set, toString } from 'lodash-es';

import { SdkFormMessageItem } from '../../../sdk-form-message-box/sdk-form-message-box.domain';
import { SdkRadioConfig, SdkRadioInput, SdkRadioItem, SdkRadioOutput } from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';


/**
 * Componente per renderizzare un campo radio
 */
@Component({
  selector: 'sdk-radio',
  templateUrl: './sdk-radio.component.html',
  styleUrls: ['./sdk-radio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkRadioComponent extends SdkAbstractFormField<SdkRadioConfig, SdkRadioInput, SdkRadioOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkRadioConfig;
  /**
   * @ignore
   */
  public data: SdkRadioItem;

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
  public generatedName: string;

  // #endregion

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  // #region Hooks

  /**
   * @ignore
   */
  protected onInit(): void {
    this.generatedName = this.generateUniqueCode();
  }

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
  protected onOutput(_data: SdkRadioOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkRadioConfig): void {
    this.markForCheck(() => {
      this.config = config;
      this.data = { code: '', label: '' }
      if (isObject(this.config)) {
        each(this.config.choices, (one: SdkRadioItem) => {
          if (one.checked === true) {
            this.data = { ...one };
          }
        });
        each(this.config.validators, (one: SdkValidator<any>) => {
          let valCfg: SdkValidatorConfig = one.config;
          if (isObject(valCfg) && get(valCfg, 'required') === true) {
            this.mandatory = true;
            return false;
          }
        });
      }
      this.isReady = true;
    });
  }

  /**
   * @ignore
   */
  protected onData(data: SdkRadioInput): void {
    this.markForCheck(() => {
      this.data = data.data;
      this.updateChecked(this.data);
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

  // #region Public

  /**
   * @ignore
   */
  public manageModelChange(_event: any, item: SdkRadioItem): void {
    this.updateChecked(item);
    let valid: boolean = undefined;
    if (this.config.inlineValidation === true) {
      valid = this.executeValidators();
      this.updateMessageMap();
    }
    this.emitOutput({ code: this.config.code, data: this.data, valid } as SdkRadioOutput);
  }

  /**
   * @ignore
   */
  public getClasses(initialLabel: string, additionalClasses: Array<string>, infoBox?: boolean): string {
    let classes: Array<string> = [initialLabel];
    if (!isEmpty(additionalClasses)) {
      classes = [...classes, ...additionalClasses];
    }
    if (infoBox === true) {
      classes.push('info-box-available');
    }
    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public getLabel(item: SdkRadioItem): string {
    if (isObject(item)) {
      return this.translateService.instant(item.label);
    }
    return undefined;
  }

  /**
   * @ignore
   */
  public trackByCode(index: number, item: SdkRadioItem): string {
    return isObject(item) ? item.code + (item.checked === true) : toString(index);
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
  private executeValidators(): boolean {

    this.notValids = new Array();

    each(this.config.validators, (one: SdkValidator<string>) => {

      let validatorInput: SdkValidatorInput<string> = {
        config: one.config,
        data: this.data.code
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
  private updateChecked(item: SdkRadioItem): void {
    if (isObject(this.config) && !isEmpty(this.config.choices)) {
      let idx: number = findIndex(this.config.choices, (one: SdkRadioItem) => one.code === item.code);
      if (idx > -1) {
        each(this.config.choices, (one: SdkRadioItem) => {
          one.checked = false;
          if (one.code === item.code) {
            one.checked = true;
          }
        });
      }
    }
  }

  // #endregion

}
