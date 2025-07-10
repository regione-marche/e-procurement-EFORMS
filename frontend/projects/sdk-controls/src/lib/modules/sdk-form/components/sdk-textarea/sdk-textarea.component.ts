import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
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
import { each, get, has, isEmpty, isObject, join, keys, set } from 'lodash-es';

import { SdkFormMessageItem } from '../../../sdk-form-message-box/sdk-form-message-box.domain';
import { SdkTextareaConfig, SdkTextareaInput, SdkTextareaOutput } from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';


/**
 * Componente per renderizzare un campo textarea
 */
@Component({
  selector: 'sdk-textarea',
  templateUrl: './sdk-textarea.component.html',
  styleUrls: ['./sdk-textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTextareaComponent extends SdkAbstractFormField<SdkTextareaConfig, SdkTextareaInput, SdkTextareaOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  @Output('outputBaseFilter') public outputBaseFilter$: EventEmitter<SdkTextareaOutput> = new EventEmitter();

  /**
   * @ignore
   */
  public config: SdkTextareaConfig;
  /**
   * @ignore
   */
  public data: string;

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
  protected onAfterViewInit(): void { }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onOutput(data: SdkTextareaOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkTextareaConfig): void {
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
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(data: SdkTextareaInput): void {
    this.markForCheck(() => this.data = data.data);
    this.emitOutput({ code: this.config.code, data: this.data, valid: undefined, dynamicField: this.config.dynamicField });
    this.emitBaseFilterOutput();
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

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
        data: this.data
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
  private emitBaseFilterOutput(): void {
    let data: string = isEmpty(this.data) ? null : this.data;
    this.outputBaseFilter$.emit({ code: this.config.code, data });
  }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public manageModelChange(_value: string): void {
    let valid: boolean = undefined;
    if (this.config.inlineValidation === true) {
      valid = this.executeValidators();
      this.updateMessageMap();
    }
    this.emitOutput({ code: this.config.code, data: this.data, valid });
    this.emitBaseFilterOutput();
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
}
