import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { isBoolean, isFunction, isObject, isString, isUndefined } from 'lodash-es';

import { SdkTableActionConfig, SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';

@Component({
  templateUrl: 'sdk-table-cell-link-viewer.component.html',
  styleUrls: ['sdk-table-cell-link-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SdkTableCellLinkViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

  @HostBinding('class') styles = 'sdk-table-cell-link-viewer';

  public action: SdkTableActionConfig;
  public linkClass: string = 'link-clickable';

  public value: string;

  constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void { super.ngOnInit(); this.initValue(); }

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

  // #endregion

  // #region Protected

  protected onColumnConfigChange(): void {
    try {

      let action: SdkTableActionConfig = ((this.columnConfig.viewer.params) as IDictionary<any>).action;
      if (isObject(action)) {

        //Check hidden status
        if (!isUndefined(action.hidden)) {
          if (isBoolean(action.hidden)) {
            if (action.hidden === true) {
              //Action is hidden, clear class and don't set the action
              this.linkClass = '';
              return;
            }
          }
          let callback = isFunction(action.hidden) ? action.hidden : undefined;
          if (isFunction(callback)) {
            let result: boolean = callback({ rowIndex: this.rowIndex, dataItem: this.dataItem });
            if (result === true) {
              //Action is hidden, clear class and don't set the action
              this.linkClass = '';
              return;
            }
          }
        }

        this.action = action;
      }
    } catch (e) { }
  }

  protected onDataItemChange(): void { this.initValue(); }

  // #endregion

  private initValue(): void {
    if (isString(this.fieldValue)) {
      this.value = super.formatMultilineValue(this.fieldValue);
    } else {
      this.value = this.fieldValue;
    }
  }

}
