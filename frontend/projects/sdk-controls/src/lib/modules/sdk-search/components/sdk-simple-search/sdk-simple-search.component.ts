import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, isEmpty, isObject, join, trim } from 'lodash-es';
import { SelectItem } from 'primeng/api';
import { Observable, of } from 'rxjs';

import { SdkBasicButtonInput, SdkBasicButtonOutput } from '../../../sdk-button/sdk-button.domain';
import { SdkTextboxConfig, SdkTextboxInput, SdkTextboxOutput } from '../../../sdk-form/sdk-form.domain';
import {
  SdkSimpleSearchConfig,
  SdkSimpleSearchFilterItem,
  SdkSimpleSearchInput,
  SdkSimpleSearchOutput,
} from '../../sdk-search.domain';


/**
 * Componente per renderizzare un campo di ricerca semplice
 */
@Component({
  selector: 'sdk-simple-search',
  templateUrl: './sdk-simple-search.component.html',
  styleUrls: ['./sdk-simple-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkSimpleSearchComponent extends SdkAbstractComponent<SdkSimpleSearchConfig, SdkSimpleSearchInput, SdkSimpleSearchOutput> implements OnInit, OnDestroy {

  /**
   * @ignore
   */
  public config: SdkSimpleSearchConfig;

  /**
   * @ignore
   */
  public data: string = '';

  /**
   * @ignore
   */
  public sdkTextboxConfig: Observable<SdkTextboxConfig>;

  /**
   * @ignore
   */
  public sdkTextboxInput: Observable<SdkTextboxInput>;

  /**
   * @ignore
   */
  public sdkBasicButtonConfig: Observable<SdkBasicButtonInput>;

  /**
   * @ignore
   */
  public buttonTitle: string = 'BUTTONS.SEARCH';

  /**
   * @ignore
   */
  public selectedFilter: string;

  /**
   * @ignore
   */
  public filterList: Array<SelectItem>;

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
  protected onOutput(data: SdkSimpleSearchOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkSimpleSearchConfig): void {
    if (config != null) {
      this.config = { ...config };

      this.elaborateFilter();
      this.sdkTextboxConfig = of(
        {
          code: this.config.code,
          label: this.config.label,
          labelParams: this.config.labelParams,
          disabled: this.config.disabled,
          placeholder: this.config.placeholder == null ? '' : this.config.placeholder
        } as SdkTextboxConfig
      );
      this.sdkBasicButtonConfig = of(
        {
          code: 'search',
          disabled: this.config.disabled,
          icon: 'mgg-icons-data-search',
          look: 'flat',
          title: 'BUTTONS.SEARCH'
        } as SdkBasicButtonInput
      );
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(data: SdkSimpleSearchInput): void {
    if (isObject(data)) {
      this.data = data.data;
      this.sdkTextboxInput = of(
        {
          data: this.data
        } as SdkTextboxInput
      );
    }
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #region Public

  /**
   * @ignore
   */
  public onClick(_value: SdkBasicButtonOutput): void {
    this.emitOutput({ code: this.config.code, data: this.data } as SdkSimpleSearchOutput);
  }

  /**
   * @ignore
   */
  public manageSearchChange(searchItem: SdkTextboxOutput): void {
    if (isObject(searchItem)) {
      this.data = searchItem.data;
    }
  }

  /**
   * @ignore
   */
  public getClasses(initialLabel: string, config: SdkSimpleSearchConfig): string {
    let classes: Array<string> = [initialLabel];

    if (!isEmpty(config.label)) {
      classes = [...classes, 'with-label'];
    }

    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public manageInlineClick(_event: Event): void {
    if (!isEmpty(this.data)) {
      this.data = trim(this.data);
    }
    if (this.config.filtered === true) {
      this.emitOutput({ code: this.config.code, data: this.data, filterCode: this.selectedFilter != null ? this.selectedFilter : null } as SdkSimpleSearchOutput);
    } else {
      this.emitOutput({ code: this.config.code, data: this.data } as SdkSimpleSearchOutput);
    }
  }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private elaborateFilter(): void {
    this.filterList = new Array();
    delete this.selectedFilter;
    if (this.config != null && this.config.filtered === true) {
      each(this.config.filterList, (one: SdkSimpleSearchFilterItem) => {
        const selectItem: SelectItem = {
          value: one.value,
          label: this.translateService.instant(one.label)
        };
        this.filterList.push(selectItem);
        // imposto il default
        if (one.default === true) {
          this.selectedFilter = one.value;
        }
      });
    }
  }

  // #endregion

  // #region Getters

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion
}
