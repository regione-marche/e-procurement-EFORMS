import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Injector, NgZone } from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { find, isArray, isEmpty as isEmptyArray, join } from 'lodash-es';

import { SdkTableCellViewer, SdkTableIconConfig } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';


@Component({
  templateUrl: 'sdk-table-cell-icon-viewer.component.html',
  styleUrls: ['sdk-table-cell-icon-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTableCellIconViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

  @HostBinding('class') styles = 'sdk-table-cell-icon-viewer';

  private icons: Array<SdkTableIconConfig> = [];

  public selectedIcon: SdkTableIconConfig;

  constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void { super.ngOnInit() }

  public override ngOnDestroy(): void { super.ngOnDestroy() }

  // #endregion

  // #region Public

  public iconClass(icon: string, configClasses: Array<string>): string {
    let classes: Array<string> = ['icon-font-weight', icon];
    if (configClasses != null) {
      classes = [...classes, ...configClasses];
    }
    return join(classes, ' ');
  }

  // #endregion

  // #region Protected

  protected onColumnConfigChange(): void {
    try {
      let icons = ((this.columnConfig.viewer.params) as IDictionary<any>).icons;

      if (isArray(icons) && isEmptyArray(icons) === false) {
        this.icons = [...icons];
        this.selectedIcon = find(this.icons, (one: SdkTableIconConfig) => {
          if( one.activationValue === 'NOT-NULL'){
            return  this.fieldValue != undefined && this.fieldValue != null;
          }

          return one.activationValue == this.fieldValue;
        });
        if (this.selectedIcon != null) {
          this.selectedIcon.label = this.translateService.instant(this.selectedIcon.label);

        }
      }
    } catch (e) { }
  }

  protected onDataItemChange(): void { }

  // #endregion

  // #region Getters

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

}


