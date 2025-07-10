import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import {
  IDictionary,
  SdkAbstractComponent,
  SdkValidationMessage,
  SdkValidator,
  SdkValidatorConfig,
  SdkValidatorInput,
  SdkValidatorOutput,
} from '@maggioli/sdk-commons';
import { each, get, has, isEmpty, isObject, keys, set } from 'lodash-es';
import { SdkFormMessageItem } from '../../../sdk-form-message-box/sdk-form-message-box.domain';

import { SdkTimepickerConfig, SdkTimepickerInput, SdkTimepickerOutput } from '../../sdk-date.domain';


/**
 * Componente per renderizzare un campo timepicker
 */
@Component({
  selector: 'sdk-timepicker',
  templateUrl: './sdk-timepicker.component.html',
  styleUrls: ['./sdk-timepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTimepickerComponent extends SdkAbstractComponent<SdkTimepickerConfig, SdkTimepickerInput, SdkTimepickerOutput> implements OnInit, OnDestroy {

  /**
   * @ignore
   */
  public config: SdkTimepickerConfig;
  /**
   * @ignore
   */
  public data: Date;
  /**
   * @ignore
   */
  public format: string = 't';

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
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

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
  protected onOutput(_data: SdkTimepickerOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkTimepickerConfig): void {
    this.config = config;
    if (isObject(this.config)) {
      if (this.config.format) {
        this.format = this.config.format;
      }
      each(this.config.validators, (one: SdkValidator<any>) => {
        let valCfg: SdkValidatorConfig = one.config;
        if (isObject(valCfg) && get(valCfg, 'required') === true) {
          this.mandatory = true;
          return false;
        }
      });
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(data: SdkTimepickerInput): void {
    this.data = data.data;
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  /**
   * @ignore
   */
  public manageModelChange(value: Date): void {
    let valid: boolean = undefined;
    if (this.config.inlineValidation === true) {
      valid = this.executeValidators(value);
      this.updateMessageMap();
    }
    this.emitOutput({ code: this.config.code, data: value, valid });
  }

  /**
   * @ignore
   */
  private executeValidators(value: Date): boolean {

    this.notValids = new Array();

    each(this.config.validators, (one: SdkValidator<Date>) => {

      let validatorInput: SdkValidatorInput<Date> = {
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

}
