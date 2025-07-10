import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Injector, NgZone } from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, filter, isArray, isBoolean, isEmpty as isEmptyArray, isFunction, isObject, isUndefined } from 'lodash-es';

import { SdkTableActionConfig, SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';


@Component({
  templateUrl: 'sdk-table-cell-actions-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTableCellActionsViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

  @HostBinding('class') styles = 'sdk-table-cell-actions-viewer';

  public actions: Array<SdkTableActionConfig> = [];

  constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void { super.ngOnInit() }

  public override ngOnDestroy(): void { super.ngOnDestroy() }

  // #endregion

  // #region Public

  public trackByActionCode(index: number, item: SdkTableActionConfig): string | number {
    return isObject(item) ? item.code : index;
  }

  public clickHandler(_event: MouseEvent, act: SdkTableActionConfig): void {
    try {
      if (isObject(act) && isFunction(act.performer)) {
        setTimeout(() => act.performer({ rowIndex: this.rowIndex, dataItem: this.dataItem }));
      }
    } catch (e) { }
  }

  public iconClass(icon: string): string {
    return icon;
  }

  // #endregion

  // #region Protected

  protected onColumnConfigChange(): void {
    try {
      let actions = ((this.columnConfig.viewer.params) as IDictionary<any>).actions;

      if (isArray(actions) && isEmptyArray(actions) === false) {
        this.actions = [...actions];
        this.actions = filter(this.actions, (one: SdkTableActionConfig) => {
          if (isUndefined(one.hidden)) {
            return true;
          }

          if (isBoolean(one.hidden)) {
            return one.hidden === false;
          }

          let callback = isFunction(one.hidden) ? one.hidden : undefined;

          if (isFunction(callback)) {
            let result: boolean = callback({ rowIndex: this.rowIndex, dataItem: this.dataItem });
            return result === false;
          }

          return true;
        });
        each(this.actions, (one: SdkTableActionConfig) => {
          one.label = this.translateService.instant(one.label);
        });
      }
    } catch (e) { }
  }

  protected onDataItemChange(): void { }

  // #endregion

  // #region Getters

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

}


