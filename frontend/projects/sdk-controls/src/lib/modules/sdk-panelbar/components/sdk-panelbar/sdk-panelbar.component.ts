import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, isEmpty, isObject } from 'lodash-es';
import { Observable, of } from 'rxjs';

import { SdkPanelbarConfig, SdkPanelbarItem, SdkPanelbarOutput } from '../../sdk-panelbar.domain';

/**
 * Componente per renderizzare un accordion
 */
@Component({
  selector: 'sdk-panelbar',
  templateUrl: './sdk-panelbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkPanelbarComponent extends SdkAbstractComponent<SdkPanelbarConfig, void, SdkPanelbarOutput> implements OnInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkPanelbarConfig;

  /**
   * @ignore
   */
  @Output() public onClose: EventEmitter<any> = new EventEmitter();

  /**
   * @ignore
   */
  @Output() public onOpen: EventEmitter<any> = new EventEmitter();

  // #endregion

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef, private translate: TranslateService) { super(inj, cdr) }

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
  protected onOutput(data: SdkPanelbarOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkPanelbarConfig): void {
    setTimeout(() => {
      this.markForCheck(() => {
        if (isObject(config)) {
          this.config = this.build(config);
          this.isReady = true;
        }
      });
    });
  }

  /**
   * @ignore
   */
  protected onData(_data: any): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private build(config: SdkPanelbarConfig): SdkPanelbarConfig {
    each(config.items, (one: SdkPanelbarItem) => {
      one.disabled = config.disabled === true;
      one = this.buildLabelsItem(one);
    });
    return config;
  }

  /**
   * @ignore
   */
  private buildLabelsItem(item: SdkPanelbarItem): SdkPanelbarItem {

    if (isObject(item) && !isEmpty(item.label)) {
      item.text = this.translate.instant(item.label, item.labelParams);
    }
    if (!isEmpty(item.children)) {
      each(item.children, (one: SdkPanelbarItem) => {
        one = this.buildLabelsItem(one);
      });
    }
    return item;
  }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public manageAccordionChildClick(obj: SdkPanelbarOutput): void {
    this.emitOutput(obj);
  }

  /**
   * @ignore
   */
  public getConfigObs(item: SdkPanelbarItem): Observable<SdkPanelbarItem> {
    return of(item);
  }

  /**
   * @ignore
   */
  public manageOnOpen(obj: any): void {
    this.onOpen.emit(obj);
  }

  /**
   * @ignore
   */
  public manageOnClose(obj: any): void {
    this.onClose.emit(obj);
  }

  // #endregion

}
