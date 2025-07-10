import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  IDictionary,
  SdkAbstractComponent,
  SdkLocaleService,
  SdkValidationMessage,
  SdkValidator,
  SdkValidatorConfig,
  SdkValidatorInput,
  SdkValidatorOutput
} from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, get, has, isEmpty, isObject, join, keys, set } from 'lodash-es';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SdkFormMessageItem } from '../../../sdk-form-message-box/sdk-form-message-box.domain';
import { SdkDatepickerConfig, SdkDatepickerInput, SdkDatepickerOutput } from '../../sdk-date.domain';
import { locales } from '../../sdk-datepicker-locales';

/**
 * Componente per renderizzare un campo datepicker
 */
@Component({
  selector: 'sdk-datepicker',
  templateUrl: './sdk-datepicker.component.html',
  styleUrls: ['./sdk-datepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkDatepickerComponent extends SdkAbstractComponent<SdkDatepickerConfig, SdkDatepickerInput, SdkDatepickerOutput> implements OnInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  @Output('outputInfoBox') outputInfoBox$: EventEmitter<SdkDatepickerConfig> = new EventEmitter();

  /**
   * @ignore
   */
  public config: SdkDatepickerConfig;
  /**
   * @ignore
   */
  public data: Date;
  /**
   * @ignore
   */
  public format: string = 'dd/mm/yy';

  /**
   * @ignore
   */
  public userFormat: string = 'gg/mm/aaaa';
  /**
   * @ignore
   */
  private locale: string = 'en-gb';
  /**
   * @ignore
   */
  public localeObj: any;

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
  public debounce: Subject<InputEvent> = new Subject<InputEvent>();

  /**
   * @ignore
   */
  public showTime: boolean = false;

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
    this.addSubscription(this.debounce.pipe(
      debounceTime(350),
      distinctUntilChanged())
      .subscribe((value: InputEvent) => {
        this.onManualInput(value);
      }));
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
  protected onOutput(_data: SdkDatepickerOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkDatepickerConfig): void {
    this.markForCheck(() => {
      this.config = { ...config };
      if (this.config.showTime != null) {
        this.showTime = !!this.config.showTime;
      }
      delete this.data;
      if (isObject(this.config)) {
        each(this.config.validators, (one: SdkValidator<any>) => {
          let valCfg: SdkValidatorConfig = one.config;
          if (isObject(valCfg) && get(valCfg, 'required') === true) {
            this.mandatory = true;
            return false;
          }
        });
      }
      this.loadLocales();
      this.isReady = true;
    });
  }

  /**
   * @ignore
   */
  protected onData(data: SdkDatepickerInput): void {
    this.markForCheck(() => {
      this.data = data.data;
      if (data.label) {
        this.config.label = data.label;
      }
      this.emitOutput({ code: this.config.code, data: this.data, valid: undefined });
    });
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Getters

  private get sdkLocaleService(): SdkLocaleService { return this.injectable(SdkLocaleService) }

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

  // #region Public

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
  public clear(): void {
    this.emitOutput({ code: this.config.code, data: null, valid: undefined });
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
  public handleInfoBoxDblClick(_event: Event): void {
    if (this.config.infoBox === true) {
      this.outputInfoBox$.emit(this.config);
    }
  }

  /**
   * @ignore
   */
  public onManualInput(_event: InputEvent): void {
    this.manageModelChange(this.data);
  }

  /**
   * @ignore
   */
  public manageShow(): void {
    if (document.getElementsByClassName('p-datepicker-prev')[0] != null) {
      document.getElementsByClassName('p-datepicker-prev')[0].ariaLabel = this.translateService.instant('primeng.before');
    }

    if (document.getElementsByClassName('p-datepicker-next')[0] != null) {
      document.getElementsByClassName('p-datepicker-next')[0].ariaLabel = this.translateService.instant('primeng.after');
    }

    if (document.getElementsByClassName('p-calendar-today-button')[0] != null) {
      document.getElementsByClassName('p-calendar-today-button')[0].ariaLabel = this.translateService.instant('primeng.today');
    }

    if (document.getElementsByClassName('p-calendar-clear-button')[0] != null) {
      document.getElementsByClassName('p-calendar-clear-button')[0].ariaLabel = this.translateService.instant('primeng.clear');
    }
  }

  // #endregion

  // #region Private

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

  /**
   * @ignore
   */
  private loadLocales(): void {
    if (!isEmpty(this.sdkLocaleService.locale)) {
      this.locale = this.sdkLocaleService.locale;
    }

    this.localeObj = get(locales, this.locale);
    if (this.localeObj) {
      this.format = this.localeObj.dateFormat;
      this.userFormat = this.localeObj.userDateFormat;
    }
  }

  // #endregion
}
