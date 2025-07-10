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
import { each, findIndex, get, has, isEmpty, isObject, join, keys, map, set } from 'lodash-es';

import { SdkFormMessageItem } from '../../../sdk-form-message-box/sdk-form-message-box.domain';
import { SdkCheckboxConfig, SdkCheckboxInput, SdkCheckboxItem, SdkCheckboxOutput } from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';


/**
 * Componente per renderizzare un campo checkbox
 */
@Component({
  selector: 'sdk-checkbox',
  templateUrl: './sdk-checkbox.component.html',
  styleUrls: ['./sdk-checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkCheckboxComponent extends SdkAbstractFormField<SdkCheckboxConfig, SdkCheckboxInput, SdkCheckboxOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkCheckboxConfig;

  /**
   * @ignore
   */
  public data: Array<SdkCheckboxItem>;

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
  protected onOutput(data: SdkCheckboxOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkCheckboxConfig): void {
    this.config = config;
    if (isObject(this.config)) {

      this.setAlignByConfig(this.config);

      if (this.config.items != null) {
        this.data = [...this.config.items];
      }
      each(this.config.validators, (one: SdkValidator<any>) => {
        let valCfg: SdkValidatorConfig = one.config;
        if (isObject(valCfg) && get(valCfg, 'required') === true) {
          this.mandatory = true;
          return false;
        }
      });
      this.emitOutput({ code: this.config.code, data: this.data, valid: undefined } as SdkCheckboxOutput);
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(data: SdkCheckboxInput): void {
    if (data != null) {
      this.markForCheck(() => {
        this.resetChecked();
        each(data.items, one => this.updateChecked(one.code, one.checked));
        this.emitOutput({ code: this.config.code, data: this.data, valid: undefined } as SdkCheckboxOutput);
      });
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
  public manageModelChange(code: string, value: any): void {
    let checked: boolean = value.target.checked;
    this.updateChecked(code, checked);
    let valid: boolean = undefined;
    if (this.config.inlineValidation === true) {
      valid = this.executeValidators();
      this.updateMessageMap();
    }
    this.emitOutput({ code: this.config.code, data: this.data, valid } as SdkCheckboxOutput);
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
  private executeValidators(): boolean {

    this.notValids = new Array();

    each(this.config.validators, (one: SdkValidator<Array<string>>) => {

      let validatorInput: SdkValidatorInput<Array<string>> = {
        config: one.config,
        data: map(this.data, one => one.code)
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
  private updateChecked(code: string, checked: boolean): void {
    const index: number = findIndex(this.data, one => one.code === code);
    if (index > -1) {
      this.data[index].checked = checked;
    }
  }

  /**
   * @ignore
   */
  private resetChecked(): void {
    each(this.data, one => one.checked = false);
  }

  // #endregion
}
