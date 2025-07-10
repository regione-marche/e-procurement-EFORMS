import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import {
  SdkButtonGroupInput,
  SdkButtonGroupOutput,
  SdkFormBuilderConfiguration,
  SdkFormBuilderField,
  SdkFormBuilderInput,
} from '@maggioli/sdk-controls';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, each, isObject } from 'lodash-es';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

import { SdkTableFilterConfig, SdkTableMessages } from '../../domains/sdk-table.config.domain';
import { SdkTableFilterFormService } from '../../services/sdk-table-filter-form.service';

@Component({
  selector: 'sdk-table-filter',
  templateUrl: 'sdk-table-filter.component.html',
  styleUrls: ['sdk-table-filter.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTableFilterComponent implements OnInit, OnDestroy {

  @HostBinding('class') styles = 'sdk-table-filter-element';

  @Input('config') config$: Observable<SdkTableFilterConfig>;

  @Input('messages') _messages: SdkTableMessages;

  @Output('output') _output: EventEmitter<IDictionary<any>> = new EventEmitter();

  // Lista di sottoscrizioni
  private _subs: Array<Subscription> = new Array();

  // Oggetto configurazione griglia
  private _config: SdkTableFilterConfig;

  public formBuilderConfigObs: BehaviorSubject<SdkFormBuilderConfiguration> = new BehaviorSubject(null);
  private defaultFormBuilderConfig: SdkFormBuilderConfiguration;
  private formBuilderConfig: SdkFormBuilderConfiguration;
  public formBuilderDataSubject: Subject<SdkFormBuilderInput> = new Subject();

  private filterButtons: SdkButtonGroupInput;
  public filterButtonsObs: BehaviorSubject<SdkButtonGroupInput> = new BehaviorSubject(null);

  public activeFilters: Array<SdkFormBuilderField>;

  public isReady: boolean = false;

  constructor(private cdr: ChangeDetectorRef, private inj: Injector) { }

  // #region Hooks

  public ngOnInit(): void {
    this.initTableFilterConfig();
  }

  public ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  // #endregion

  // #region Public

  public getFilterLabel(config: SdkTableFilterConfig): string {
    if (config && config.filterLabel) {
      return this.translateService.instant(config.filterLabel);
    }
    return '';
  }

  public manageFormOutput(formConfig: SdkFormBuilderConfiguration): void {
    this.formBuilderConfig = formConfig;
  }

  public onButtonClick(button: SdkButtonGroupOutput): void {

    if (isObject(button)) {
      if (button.code === 'clear-all') {
        this.formBuilderConfig = cloneDeep(this.defaultFormBuilderConfig);
        this.formBuilderConfigObs.next(this.formBuilderConfig);
        this.setFilters();
      } else if (button.code === 'apply-filter') {
        this.setFilters();
      }
    }
  }

  public removeFilter(filter: SdkFormBuilderField): void {
    if (filter) {
      this.formBuilderDataSubject.next({
        code: filter.code,
        data: null
      });
      this.setFilters();
    }
  }

  // #endregion

  // #region Private

  private unsubscribeAll(): void {
    this.zone.runOutsideAngular(() => {
      each(this._subs, one => {
        try { one.unsubscribe() } catch (e) { }
      });
    })
  }

  private initTableFilterConfig(): void {
    if (isObject(this.config$)) {
      this._subs.push(this.config$
        .subscribe(this.manageFilterConfig))
    }
  }

  private manageFilterConfig = (config: SdkTableFilterConfig): void => {
    this.config = undefined;

    if (isObject(config)) {
      this.config = { ...config };
      this.loadForm();
      this.loadButtons();
      this.isReady = true;
    }

    this.cdr.markForCheck();
  }

  private loadForm(): void {
    if (isObject(this.config)) {
      let fields: Array<SdkFormBuilderField> = this.config.fields;

      let formConfig: SdkFormBuilderConfiguration = {
        fields
      };

      this.defaultFormBuilderConfig = cloneDeep(formConfig);
      this.formBuilderConfig = formConfig;

      this.formBuilderConfigObs.next(formConfig);
    }
  }

  private loadButtons(): void {
    this.filterButtons = {
      buttons: [
        {
          code: 'clear-all',
          label: this.translateService.instant(this.messages.clearFilters)
        },
        {
          code: 'apply-filter',
          label: this.translateService.instant(this.messages.applyFilters)
        }
      ]
    };
    this.filterButtonsObs.next(this.filterButtons);
  }

  private setFilters(): void {
    this.activeFilters = this.buildActiveFilters(this.formBuilderConfig);
    let model = this.retrieveFilterModel(this.formBuilderConfig);
    this.emitEvent(model);
  }

  private retrieveFilterModel(formBuilderConfig: SdkFormBuilderConfiguration): IDictionary<any> {
    let model: IDictionary<any> = this.sdkTableFilterFormService.getFilterModel(formBuilderConfig);
    return model;
  }

  private emitEvent(output: IDictionary<any>): void {
    this._output.emit(output);
  }

  private buildActiveFilters(formBuilderConfig: SdkFormBuilderConfiguration): Array<SdkFormBuilderField> {
    const activeFilters = this.sdkTableFilterFormService.getActiveFilters(formBuilderConfig);
    return activeFilters;
  }

  // #endregion

  // #region Getters

  public get config(): SdkTableFilterConfig { return this._config }

  private get zone(): NgZone { return this.inj.get(NgZone) }

  private get translateService(): TranslateService { return this.inj.get(TranslateService) }

  private get messages(): SdkTableMessages { return this._messages; }

  private get sdkTableFilterFormService(): SdkTableFilterFormService { return this.inj.get(SdkTableFilterFormService) }

  // #endregion

  // #region Setters

  public set config(value: SdkTableFilterConfig) { this._config = value; this.cdr.markForCheck() }

  // #endregion
}
