import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  Input,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { isEmpty } from 'lodash-es';

import { SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';

@Component({
  templateUrl: 'sdk-table-cell-boolean-viewer.component.html',
  styleUrls: ['sdk-table-cell-boolean-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SdkTableCellBooleanViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

  @HostBinding('class') styles = 'sdk-table-cell-boolean-viewer';

  private icon: string;

  private annullatoLogic: boolean = false;

  constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void { super.ngOnInit() }

  public override ngOnDestroy(): void { super.ngOnDestroy() }

  // #endregion

  // #region Public

  public iconClass(value: any): string {

    if (this.icon != null) {
      return (value) && (value != '0') && (value != 0) ? this.icon : '';
    } else {
      return (value) && (value != '0') && (value != 0)  ? `mgg-icons-crud-save` : `mgg-icons-crud-cancel`;
    }
  }

  // #endregion

  // #region Protected

  protected onColumnConfigChange(): void {
    try {
      let icon: string = ((this.columnConfig.viewer.params) as IDictionary<any>).icon;

      if (!isEmpty(icon)) {
        this.icon = icon;
      }
    } catch (e) { }
  }

  protected onDataItemChange(): void { }

  // #endregion

}


