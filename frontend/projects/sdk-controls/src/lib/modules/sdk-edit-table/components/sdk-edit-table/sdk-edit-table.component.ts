import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Injector } from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { isEmpty, join } from 'lodash-es';

import {
  SdkEditTableCellConfig,
  SdkEditTableConfig,
} from '../../sdk-edit-table.domain';

/**
 * Componente per la realizzazione di una tabella estesa (es. quadro economico)
 */
@Component({
  selector: 'sdk-edit-table',
  templateUrl: './sdk-edit-table.component.html',
  styleUrls: ['./sdk-edit-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkEditTableComponent extends SdkAbstractComponent<SdkEditTableConfig, void, void> {

  /**
   * @ignore
   */
  @HostBinding('class') classNames = `sdk-edit-table`;

  /**
   * @ignore
   */
  public config: SdkEditTableConfig;

  /**
   * @ignore
   */
  public sortField: string;

  /**
   * @ignore
   */
  public sortDirection: string;

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  // #region Hooks

  /**
   * @ignore
   */
  protected onInit(): void {
  }


  /**
   * @ignore
   */
  protected onAfterViewInit(): void {

  }

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
  protected onConfig(config: any): void {
    if (config != null) {
      this.config = {
        ...config
      };
      this.markForCheck();
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

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public getSum(mapping: string): string {
    let sum = 0;
    if (!isEmpty(this.config) && !isEmpty(this.config.data)) {
      for (let i = 0; i < this.config.data.length; i++) {
        if (this.config.data[i][mapping] != null && !isNaN(this.config.data[i][mapping])) {
          let num: number = Number(this.config.data[i][mapping]);
          sum += num;
        }
      }
    }

    return (Math.round(sum * 100) / 100).toFixed(2);
  }

  public getDiff(mapping: string): string {
    let diff = 0;
    if (!isEmpty(this.config) && !isEmpty(this.config.data)) {
      for (let i = 0; i < this.config.data.length; i++) {
        if (this.config.data[i][mapping] != null && !isNaN(this.config.data[i][mapping])) {
          let num: number = Number(this.config.data[i][mapping]);
          diff -= num;
        }
      }
    }

    return (Math.round(diff * 100) / 100).toFixed(2);
  }

  /**
   * @ignore
   */
  public getCellClasses(cell: SdkEditTableCellConfig): string {
    let classes: Array<string> = ['cell-value'];

    if (cell.cellClasses != null && cell.cellClasses.length > 0) {
      classes.push(...cell.cellClasses);
    }

    return join(classes, ' ');
  }

  /**
     * @ignore
     */
  public onClick(data: any, performer: string): void {
    this.emitOutput({ data: data, performer: performer } as any);
  }

  public save(): void {
    this.emitOutput({ data: this.config.data, performer: 'insert' } as any);
  }


  public addRow(): void {
    let newRow: any = {};
    this.config.data.push(newRow);
  }

  public deleteRow(index): void {
    this.config.data.splice(index, 1);
  }

  public changeValue(index: number, mapping: string, val1: number, val2: number): void {
    if(val1 != null && val2 != null){
      this.config.data[index][mapping] = val1 - val2;
    }
    
  }

  public changeValueSum(index: number, mapping: string, val1: number, val2: number): void {
    if(val1 != null && val2 != null){
      this.config.data[index][mapping] = val1 + val2;
    }
  }

  public sum(val1: number, val2: number) {
    return Number(Number(val1) + Number(val2));
  }

  // #endregion

  // #region Private

  // #endregion


}



