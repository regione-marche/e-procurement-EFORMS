import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  IDictionary,
  SdkLocaleService,
  SdkNumberFormatService,
  SdkValidationMessage,
  SdkValidator,
  SdkValidatorConfig,
  SdkValidatorInput,
  SdkValidatorOutput,
} from '@maggioli/sdk-commons';
import {
  clone,
  each,
  get,
  has,
  isEmpty,
  isNil,
  isNull,
  isNumber,
  isObject,
  isUndefined,
  join,
  keys,
  replace,
  set,
  size,
  toNumber,
} from 'lodash-es';
import { fromEvent } from 'rxjs';

import { SdkFormMessageItem } from '../../../sdk-form-message-box/sdk-form-message-box.domain';
import { SdkNumericTextboxConfig, SdkNumericTextboxInput, SdkNumericTextboxOutput } from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';


/**
 * Componente per renderizzare un campo di testo numerico
 */
@Component({
  selector: 'sdk-numeric-textbox',
  templateUrl: './sdk-numeric-textbox.component.html',
  styleUrls: ['./sdk-numeric-textbox.component.scss']
})
export class SdkNumericTextboxComponent extends SdkAbstractFormField<SdkNumericTextboxConfig, SdkNumericTextboxInput, SdkNumericTextboxOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  @ViewChild('elem') _elem: ElementRef<HTMLInputElement>;

  /**
   * @ignore
   */
  public config: SdkNumericTextboxConfig;
  /**
   * @ignore
   */
  public decimals: number = 2;
  /**
   * @ignore
   */
  public data: string = '';

  /**
   * @ignore
   */
  public numberData: number;

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
  public locale: string;

  /**
   * @ignore
   */
  public currency: string;

  /**
   * @ignore
   */
  private numericRegex: RegExp;
  /**
   * @ignore
   */
  private decimalSeparator: string = '.';

  /**
   * @ignore
   */
  private focused: boolean;

  /**
   * @ignore
   */
  public currencyEnabled: boolean = false;

  /**
   * @ignore
   */
  public customSymbol: string;

  /**
   * @ignore
   */
  private percentuale: boolean = false;

  /**
   * @ignore
   */
  private year: boolean = false;

  /**
   * @ignore
   */
  private coordinates: boolean = false;

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
    this.setupScrollEvent();
    this.addSubscription(fromEvent(this.elem, 'focus').subscribe(this.focus));
    this.addSubscription(fromEvent(this.elem, 'blur').subscribe(this.blur));
    this.addSubscription(fromEvent(this.elem, 'input').subscribe(this.input));

  }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onOutput(data: SdkNumericTextboxOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkNumericTextboxConfig): void {

    this.locale = this.sdkLocaleService.locale;
    this.currency = this.sdkLocaleService.currency;

    if (isObject(config)) {

      this.config = {
        ...config,
        format: isNil(config.format) ? true : config.format
      };

      this.setAlignByConfig(this.config);

      if (this.config.decimals >= 0) {
        this.decimals = this.config.decimals;
      }
      this.coordinates = this.config.coordinates === true;
      this.currencyEnabled = this.config.currency === true;
      this.customSymbol = this.config.customSymbol;
      this.percentuale = this.config.percentuale === true;
      this.year = this.config.year === true;
      if (this.year) {
        this.decimalSeparator = "";
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
  protected onData(data: SdkNumericTextboxInput): void {
    this.markForCheck(() => {
      if (data != null) {
        let content = data.data;
        if (isNull(content)) {
          content = undefined;
        }
        if (isUndefined(content) || isNumber(content)) {
          this.numberData = content;
          if (this.year) {
            this.data = this.numberData.toString();
          } else {
            this.data = isUndefined(content) ? '' : this.config.format ? this.sdkNumberFormatService.formatNumber(this.numberData, this.locale, this.formatCurrency) : `${this.numberData}`;
          }
          this.emitOutput({ code: this.config.code, data: this.numberData != undefined ? this.numberData : undefined });
        }
      }
    });
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Getters

  private get sdkLocaleService(): SdkLocaleService { return this.injectable(SdkLocaleService) }

  public get sdkNumberFormatService(): SdkNumberFormatService { return this.injectable(SdkNumberFormatService) }

  // #endregion

  // #region Public

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
  private get elem(): HTMLInputElement {
    return this._elem.nativeElement;
  }

  /**
   * @ignore
   */
  private executeValidators(): boolean {

    this.notValids = new Array();

    each(this.config.validators, (one: SdkValidator<number>) => {

      let validatorInput: SdkValidatorInput<number> = {
        config: one.config,
        data: this.numberData
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
  private setupScrollEvent(): void {
    if (isObject(this.elem)) {
      this.elem.addEventListener('mousewheel', function () {
        this.blur();
      })
    }
  }

  /**
   * @ignore
   */
  private focus = (event: Event): void => {
    this.emitOnFocus(this.config);
    this.focused = true;
    this.markForCheck(() => {
      if (isNumber(this.numberData)) {
        //ADSA Changed -- use this method instead of toString, to avoid scientific notations (e.g. 0.0000001 becomes 1e-6)
        this.data = this.numberData.toLocaleString('fullwide', { useGrouping: false, maximumSignificantDigits: 20 });
        //this.data = toString(this.numberData);
      }
    });
    setTimeout(() => this.setSelection(0, this.elem.value.length));
  }

  /**
   * @ignore
   */
  private blur = (event: Event): void => {
    this.emitOnBlur(this.config);
    this.focused = false;
    this.markForCheck(() => {
      if (isUndefined(this.numberData)) {
        this.data = '';
      } else if (this.year) {
        this.data = this.numberData.toString();
      } else {
        this.data = this.config.format ? this.sdkNumberFormatService.formatNumber(this.numberData, this.locale, this.formatCurrency) : `${this.numberData}`;
      }
    });
  }

  /**
   * @ignore
   */
  private input = (): void => {
    let input = this.elem;
    let selectionStart = this.elem.selectionStart;
    let selectionEnd = this.elem.selectionEnd;
    let inputValue = this.elem.value;

    if (!this.isValid(inputValue)) {
      input.value = this.data;

      this.setSelection(selectionStart - 1, selectionEnd - 1);
      return;
    }

    this.data = inputValue;
    if (isEmpty(this.data) || '-' === this.data) {
      this.numberData = undefined;
    } else {
      this.numberData = toNumber(inputValue);
    }
    this.manageModelChange();
  }

  /**
   * @ignore
   */
  private isValid(value: string): boolean {
    if (!this.numericRegex) {
      this.numericRegex = this.getNumericRegex(this.config.decimals, this.decimalSeparator);
    }
    let regexPass: boolean = this.numericRegex.test(value);
    let maxLengthPass: boolean = this.config.maxLength != null ? size(replace(clone(value), this.decimalSeparator, '')) <= this.config.maxLength : true;
    return regexPass && maxLengthPass;
  }

  /**
   * @ignore
   */
  private getNumericRegex(decimals: number = 2, separator: string = '.'): RegExp {

    if (separator === '.') {
      separator = '\\' + separator;
    }

    let pattern: string;
    if (decimals === 0) {
      pattern = '\\d*';
    } else {
      pattern = `(?:(?:\\d+(${separator})?(\\d){0,${decimals}}))?`;
    }

    if (this.config.relativeNum === true) {
      pattern = "-?" + pattern;
    }

    return new RegExp(`^${pattern}$`);
  }

  /**
   * @ignore
   */
  private setSelection(start: number, end: number): void {
    if (this.focused) {
      this.elem.setSelectionRange.apply(this.elem, [start, end]);
    }
  }

  /**
   * @ignore
   */
  private manageModelChange(): void {
    let valid: boolean = undefined;
    if (this.config.inlineValidation === true) {
      valid = this.executeValidators();
      this.updateMessageMap();
    }
    this.emitOutput({ code: this.config.code, data: this.numberData != undefined ? this.numberData : undefined, valid });
  }

  /**
   * @ignore
   */
  private get formatCurrency(): number {
    return this.currencyEnabled === true || this.percentuale === true || this.coordinates ? this.decimals : 0;
  }

  // #endregion
}
