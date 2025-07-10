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
import { find, isFunction, isObject } from 'lodash-es';

import { SdkTableActionConfig, SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';

@Component({
  templateUrl: 'sdk-table-cell-hierarchical-link-viewer.component.html',
  styleUrls: ['sdk-table-cell-hierarchical-link-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SdkTableCellHierarchicalLinkViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

  @HostBinding('class') styles = 'sdk-table-cell-hierarchical-link-viewer';

  public action: SdkTableActionConfig;

  constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void { super.ngOnInit() }

  public override ngOnDestroy(): void { super.ngOnDestroy() }

  // #endregion

  // #region Public

  public trackByActionCode(index: number, item: SdkTableActionConfig): string | number {
    return isObject(item) ? item.code : index;
  }

  public clickHandler(_event: MouseEvent, act: SdkTableActionConfig, childKey?: any): void {
    try {
      if (isObject(act) && isFunction(act.performer)) {
        let dataItem = this.dataItem;
        if (childKey != null) {
          const found: any = find(this.fieldValue.children, (one: any) => {
            return one._key == childKey;
          });
          dataItem = found;
        }
        setTimeout(() => act.performer({ rowIndex: this.rowIndex, dataItem }));
      }
    } catch (e) { }
  }

  // #endregion

  // #region Protected

  protected onColumnConfigChange(): void {
    try {
      let action: SdkTableActionConfig = ((this.columnConfig.viewer.params) as IDictionary<any>).action;
      if (isObject(action)) {
        this.action = action;
      }
    } catch (e) { }
  }

  protected onDataItemChange(): void { }

  // #endregion

}
