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
import { SdkLocaleService, SdkNumberFormatService } from '@maggioli/sdk-commons';
import { isEmpty, isObject, join, toNumber, toString } from 'lodash-es';

import { SdkTextConfig, SdkTextInput, SdkTextOutput } from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';

/**
 * Componente per renderizzare un testo semplice
 */
@Component({
  selector: 'sdk-text',
  templateUrl: './sdk-text.component.html',
  styleUrls: ['./sdk-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTextComponent extends SdkAbstractFormField<SdkTextConfig, SdkTextInput, SdkTextOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  @Output('outputClick') outputClick$: EventEmitter<any> = new EventEmitter();

  /**
   * @ignore
   */
  public config: SdkTextConfig;
  /**
   * @ignore
   */
  public data: string;

  /**
   * @ignore
   */
  public truncateData: string;

  /**
   * @ignore
   */
  public numberData: number;

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
  public customSymbol: string;

  /**
   * @ignore
   */
  public expand: boolean;

  /**
   * @ignore
   */
  public truncate: boolean = true;

  /**
   * @ignore
   */
  public decimals: number = 2;

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
    this.locale = this.sdkLocaleService.locale;
    this.currency = this.sdkLocaleService.currency;
    this.customSymbol = this.config.customSymbol;
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
  protected onOutput(_data: SdkTextOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkTextConfig): void {
    this.config = config;
    if (isObject(this.config)) {

      if (this.config.decimals != null) {
        this.decimals = this.config.decimals;
      }

      this.setAlignByConfig(this.config);
      this.expand = this.config.expand;
      this.data = this.config.data;

      if (this.expand === true) {
        this.truncateData = this.changeTruncateData(this.data);
      }
      if (this.data && (this.config.currency === true || this.config.number === true)) {
        this.numberData = toNumber(this.data);
      }
      // disabilito la currency se seleziono anche il numero
      if (this.config.number === true && this.config.currency === true) {
        this.config.currency = false;
      }
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(data: SdkTextInput): void {
    this.markForCheck(() => {
      if (data) {
        this.data = toString(data.data);
      }
      if (data.label) {
        this.config.label = data.label;
      }
      if (!isEmpty(this.data) && (this.config.currency === true || this.config.number === true)) {
        this.numberData = toNumber(this.data);
      }
      this.emitOutput(
        {
          code: this.config.code,
          mnemonico: this.config.mnemonico,
          oggettoProtezione: this.config.oggettoProtezione,
          data: this.data,
          clicked: false,
          modalComponent: this.config.modalComponent,
          modalComponentConfig: this.config.modalComponentConfig
        } as SdkTextOutput
      );
    });
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Getters

  public get sdkNumberFormatService(): SdkNumberFormatService { return this.injectable(SdkNumberFormatService) }

  private get sdkLocaleService(): SdkLocaleService { return this.injectable(SdkLocaleService) }

  // #endregion

  // #region Public

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
  public getValueClasses(initialLabel: string, config: SdkTextConfig): string {
    let classes: Array<string> = [initialLabel];
    if (isObject(config)) {
      if (config.link === true) {
        classes = [...classes, 'clickable'];
      }
      if (!isEmpty(config.fieldClasses)) {
        classes = [...classes, ...config.fieldClasses];
      }

      if (config.align === 'DX') {
        classes.push(this.DEFAULT_ALIGN_RIGHT_CLASS);
      }

      if (config.currency === true || config.number === true) {
        classes.push('text-value-number');
      }
    }
    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public manageClick(_event: Event): void {
    if (isObject(this.config) && this.config.link === true) {
      this.outputClick$.next(
        {
          code: this.config.code,
          mnemonico: this.config.mnemonico,
          oggettoProtezione: this.config.oggettoProtezione,
          data: this.data,
          clicked: true,
          modalComponent: this.config.modalComponent,
          modalComponentConfig: this.config.modalComponentConfig,
          textModalContent: this.config.textModalContent
        } as SdkTextOutput
      );
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
  public formatValue(value: any, config: SdkTextConfig): string {
    let val = `${value}`;
    if (config.decimals != null) {
      try {
        // viene invocato due volte, la seconda il valore numerico è una stringa
        const parsedValue: number = toNumber(value);
        val = this.sdkNumberFormatService.formatNumber(parsedValue, this.locale, config.decimals);
      } catch (e) { }
    } else {
      // controlli se non e' un valore numerico
      val = super.formatMultilineValue(val);
    }

    if (this.customSymbol != null) {
      val = `${val} ${this.customSymbol}`
    }

    return val;
  }

  /**
   * @ignore
   */
  public changeTruncateVisible(): void {
    this.truncate = !this.truncate;
  }

  /**
   * @ignore
   */
  public changeTruncateData(value: any): string {
    let val = `${value}`;
    let splitted = val.split(" ");
    if (splitted.length < 5) {
      this.expand = false;
    } else {
      splitted = val.split(" ", 5);
      val = splitted.join(" ");
    }
    return val;
  }

  // #endregion
}
