import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import { isString } from 'lodash-es';

import { SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';

@Component({
  templateUrl: 'sdk-table-cell-string-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SdkTableCellStringViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

  @HostBinding('class') styles = 'sdk-table-cell-string-viewer';

  public value: string;

  constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void { super.ngOnInit(); this.initValue(); }

  public override ngOnDestroy(): void { super.ngOnDestroy() }

  // #endregion

  // #region Protected

  protected onColumnConfigChange(): void { }

  protected onDataItemChange(): void { this.initValue(); }

  // #endregion

  // #region Private

  private initValue(): void {
    if (isString(this.fieldValue)) {
      this.value = super.formatMultilineValue(this.fieldValue);
    } else {
      this.value = this.fieldValue;
    }
  }

  // #endregion

}
