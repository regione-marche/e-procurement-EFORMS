import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Injector } from '@angular/core';
import { SdkAbstractComponent, SdkLocaleService, SdkNumberFormatService } from '@maggioli/sdk-commons';
import { each, join, toString } from 'lodash-es';

import {
  SdkExtendedTableCellConfig,
  SdkExtendedTableConfig,
  SdkExtendedTableRowConfig,
} from '../../sdk-extended-table.domain';

/**
 * Componente per la realizzazione di una tabella estesa (es. quadro economico)
 */
@Component({
  selector: 'sdk-extended-table',
  templateUrl: './sdk-extended-table.component.html',
  styleUrls: ['./sdk-extended-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkExtendedTableComponent extends SdkAbstractComponent<SdkExtendedTableConfig, void, void> {

  /**
   * @ignore
   */
  @HostBinding('class') classNames = `sdk-extended-table`;

  /**
   * @ignore
   */
  public config: SdkExtendedTableConfig;

  /**
   * @ignore
   */
  public locale: string;

  /**
   * @ignore
   */
  public currency: string;

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  // #region Hooks

  /**
   * @ignore
   */
  protected onInit(): void {
    this.locale = this.sdkLocaleService.locale;
    this.currency = this.sdkLocaleService.currency;
  }

  /**
   * @ignore
   */
  protected onAfterViewInit(): void { }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onOutput(_data: void): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkExtendedTableConfig): void {
    if (config != null) {
      this.config = {
        ...config
      };
      each(this.config.rows, (one: SdkExtendedTableRowConfig) => {
        one = this.elaborateChildren(one);
      });
      this.isReady = true;
    }
  }

  /**
   * @ignore
   */
  protected onData(_data: void): void { }

  /**
   * @ignore
   */
  protected onUpdateState(_state: boolean): void { }

  // #endregion

  // #region Getters

  private get sdkLocaleService(): SdkLocaleService { return this.injectable(SdkLocaleService) }

  public get sdkNumberFormatService(): SdkNumberFormatService { return this.injectable(SdkNumberFormatService) }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public trackByHeaderCode(index: number, item: SdkExtendedTableCellConfig): string {
    return item != null ? item.code : toString(index);
  }

  /**
   * @ignore
   */
  public trackByRowCode(index: number, item: SdkExtendedTableRowConfig): string {
    return item != null ? item.code : toString(index);
  }

  /**
   * @ignore
   */
  public getRowClasses(row: SdkExtendedTableRowConfig): string {
    let classes: Array<string> = [];

    if (row.rowClasses != null && row.rowClasses.length > 0) {
      classes.push(...row.rowClasses);
    }

    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public getCellClasses(cell: SdkExtendedTableCellConfig): string {
    let classes: Array<string> = ['cell-value'];

    if (cell.cellClasses != null && cell.cellClasses.length > 0) {
      classes.push(...cell.cellClasses);
    }

    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public toggleChildren(row: SdkExtendedTableRowConfig): void {
    if (row != null && row.children != null && row.children.length > 0) {
      row.rowExpanded = !row.rowExpanded;
    }
  }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private elaborateChildren(row: SdkExtendedTableRowConfig): SdkExtendedTableRowConfig {

    if (row.children != null && row.children.length > 0) {
      if (row.rowExpanded == null) {
        // inizializzo la riga non espansa quando non mi e' stato istruito di espanderla dall'esterno
        row.rowExpanded = false;
      }

      each(row.children, (one: SdkExtendedTableRowConfig) => {
        one = this.elaborateChildren(one);
      });
    }

    return row;
  }

  // #endregion

}
