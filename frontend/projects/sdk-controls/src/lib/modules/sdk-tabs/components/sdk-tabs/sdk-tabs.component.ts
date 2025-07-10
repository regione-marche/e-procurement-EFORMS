import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, isEmpty, isObject } from 'lodash-es';
import { Observable, of } from 'rxjs';

import { SdkTab, SdkTabsConfig, SdkTabsOutput } from '../../sdk-tabs.domain';


/**
 * Componente per renderizzare i tabs
 */
@Component({
  selector: 'sdk-tabs',
  templateUrl: './sdk-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTabsComponent extends SdkAbstractComponent<SdkTabsConfig, void, SdkTabsOutput> implements OnInit, OnDestroy {

  /**
   * @ignore
   */
  public config: SdkTabsConfig;

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
  protected onConfig(config: SdkTabsConfig): void {
    this.markForCheck(() => {
      this.config = config;
      each(this.config.tabs, (tab: SdkTab) => {
        if (!isEmpty(tab.title)) {
          tab.title = this.translate.instant(tab.title);
        }
      });
    });
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(_data: void): void { }

  /**
   * @ignore
   */
  protected onOutput(data: SdkTabsOutput): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  /**
   * @ignore
   */
  public onTabSelect(event: any): void {
    if (event) {
      let index: number = event.index;
      let elem: SdkTab = this.config.tabs[index];
      let obj: SdkTabsOutput = { item: elem };
      this.emitOutput(obj);
    }
  }

  /**
   * @ignore
   */
  public trackByCode(index: number, tab: SdkTab): string | number {
    return isObject(tab) ? tab.code : index;
  }

  /**
   * @ignore
   */
  public getItemObs(tab: SdkTab): Observable<SdkTab> { return of(tab) }

  /**
   * @ignore
   */
  private get translate(): TranslateService { return this.injectable(TranslateService) }
}
