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

import { SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';

@Component({
  templateUrl: 'sdk-table-cell-button-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SdkTableCellButtonViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

  @HostBinding('class') styles = 'sdk-table-cell-button-viewer';

  public actions;

  constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void {
    super.ngOnInit();
    this.actions = (this.params as IDictionary<any>).actions; //oggetto del tipo button,action
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
  }


  // #endregion


  // #region Protected

  protected onColumnConfigChange(): void { }

  protected onDataItemChange(): void { }

  // #endregion

}
