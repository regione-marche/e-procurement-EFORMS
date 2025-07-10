import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import { SdkLocaleService, SdkNumberFormatService } from '@maggioli/sdk-commons';
import { join } from 'lodash-es';

import { SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';

@Component({
  templateUrl: 'sdk-table-cell-currency-viewer.component.html',
  styleUrls: ['sdk-table-cell-currency-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SdkTableCellCurrencyViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

  @HostBinding('class') styles = 'sdk-table-cell-currency-viewer';

  public locale: string;
  public currency: string;

  constructor(cdr: ChangeDetectorRef, zone: NgZone, protected override inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void {
    super.ngOnInit();
    this.locale = this.sdkLocaleService.locale;
    this.currency = this.sdkLocaleService.currency;
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
