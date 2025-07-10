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
import { SdkTextboxConfig, SdkTextboxInput, SdkTextboxOutput } from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';
import { TranslateService } from '@ngx-translate/core';


/**
 * Componente per renderizzare un campo di testo semplice
 */
@Component({
  selector: 'sdk-textbox',
  templateUrl: './sdk-textbox.component.html',
  styleUrls: ['./sdk-textbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTextboxComponent extends SdkAbstractFormField<SdkTextboxConfig, SdkTextboxInput, SdkTextboxOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  @Output('outputBaseFilter') public outputBaseFilter$: EventEmitter<SdkTextboxOutput> = new EventEmitter();

  /**
   * @ignore
   */
  public config: SdkTextboxConfig;
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
  protected onOutput(data: SdkTextboxOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkTextboxConfig): void {
    this.markForCheck(() => {
      if (isObject(config)) {
        this.config = config;

        this.setAlignByConfig(this.config);

        each(this.config.validators, (one: SdkValidator<any>) => {
          let valCfg: SdkValidatorConfig = one.config;
          if (isObject(valCfg) && get(valCfg, 'required') === true) {
            this.mandatory = true;
            return false;
          }
        });
        this.isReady = true;
      }
    });
  }

  /**
   * @ignore
   */
  protected onData(data: SdkTextboxInput): void {
    this.markForCheck(() => this.data = data.data);
    this.emitOutput({ code: this.config.code, data: this.data, valid: undefined, dynamicField: this.config.dynamicField });
    setTimeout(() => this.emitBaseFilterOutput());
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
    if (this.data === '') {
      this.data = null;
    }


    if (this.config.inlineValidation === true) {
      valid = this.executeValidators();
      this.updateMessageMap();
    }
    this.emitOutput({ code: this.config.code, data: this.data, valid, dynamicField: this.config.dynamicField });
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

  /**
   * @ignore
   */
  public confirmUnlock(event: PointerEvent): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translateService.instant('LOCK-FIELD-MESSAGE'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //confirm action
        this.config.disabled = false;
      },
      reject: () => {
        //reject action
        // Do nothing
      },
      acceptLabel: this.translateService.instant('BUTTONS.YES'),
      rejectLabel: this.translateService.instant('BUTTONS.NO')
    });
  }

  // #endregion

  // #region Getters

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

}
