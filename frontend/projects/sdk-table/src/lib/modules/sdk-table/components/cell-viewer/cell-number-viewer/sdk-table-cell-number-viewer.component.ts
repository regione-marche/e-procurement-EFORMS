import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import { SdkNumberFormatService, SdkLocaleService } from '@maggioli/sdk-commons';
import { join } from 'lodash-es';

import { SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';

@Component({
  // to avoid NG0912: Component ID generation collision detected with sdk-table-cell-currency-viewer (do not use this selector!)
  selector: 'sdk-table-cell-number-viewer-local',
  templateUrl: 'sdk-table-cell-number-viewer.component.html',
  styleUrls: ['sdk-table-cell-number-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SdkTableCellNumberViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

  public locale: string;

  @HostBinding('class') styles = 'sdk-table-cell-number-viewer';

  constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void {
    super.ngOnInit();
    this.locale = this.sdkLocaleService.locale;
  }

  public override ngOnDestroy(): void { super.ngOnDestroy() }

  // #endregion

  // #region Protected

  protected onColumnConfigChange(): void { }

  protected onDataItemChange(): void { }

  // #endregion

  // #region Public

  public getClasses(): string {
    let classes: Array<string> = [];

    if (this.columnConfig.align != null && this.columnConfig.align == 'DX') {
      classes.push('align-right');
    }

    return join(classes, ' ');
  }

  // #endregion

  // #region Getters

  private get sdkLocaleService(): SdkLocaleService { return this.inj.get(SdkLocaleService) }

  public get sdkNumberFormatService(): SdkNumberFormatService { return this.inj.get(SdkNumberFormatService) }

  // #endregion
}
