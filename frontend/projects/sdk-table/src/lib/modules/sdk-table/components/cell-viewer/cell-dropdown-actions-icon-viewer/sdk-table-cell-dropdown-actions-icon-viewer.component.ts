import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Injector, NgZone } from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, filter, isArray, isBoolean, isEmpty as isEmptyArray, isFunction, isObject, isUndefined, map } from 'lodash-es';

import { MenuItem } from 'primeng/api';
import { SdkTableActionConfig, SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';


@Component({
  templateUrl: 'sdk-table-cell-dropdown-actions-icon-viewer.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTableCellDropdownActionsIconViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer, AfterViewInit {

  @HostBinding('class') styles = 'sdk-table-cell-dropdown-actions-icon-viewer';

  public actions: Array<SdkTableActionConfig> = [];

  public items: Array<MenuItem> = new Array();

  public appendRef: HTMLElement;

  constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void { super.ngOnInit() }

  public ngAfterViewInit(): void {
    this.appendRef = document.getElementById('table-dropdown-append');
  }

  public override ngOnDestroy(): void { super.ngOnDestroy() }

  // #endregion

  // #region Public

  public trackByActionCode(index: number, item: SdkTableActionConfig): string | number {
    return isObject(item) ? item.code : index;
  }

  public iconClass(icon: string): string {
    return `icon-font-weight ${icon}`;
  }

  // #endregion

  // #region Private

  private clickHandler(act: SdkTableActionConfig): void {
    try {
      if (act != null && act.disabled !== true && isFunction(act.performer)) {
        setTimeout(() => act.performer({ rowIndex: this.rowIndex, dataItem: this.dataItem }));
      }
    } catch (e) { }
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

        this.items = map(this.actions, (one: SdkTableActionConfig) => {
          let menuItem: MenuItem = {
            label: one.label,
            command: () => {
              this.clickHandler(one)
            },
            icon: one.icon,
            disabled: one.disabled
          };
          return menuItem;
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


