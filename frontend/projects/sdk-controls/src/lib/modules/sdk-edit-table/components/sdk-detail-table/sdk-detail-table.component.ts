import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Injector, Input } from '@angular/core';
import { SdkAbstractComponent, SdkDateHelper, SdkLocaleService, SdkNumberFormatService } from '@maggioli/sdk-commons';
import { isEmpty, join } from 'lodash-es';

import {
  SdkEditTableCellConfig,
  SdkEditTableConfig
} from '../../sdk-edit-table.domain';
/**
 * Componente per la realizzazione di una tabella estesa (es. quadro economico)
 */
@Component({
  selector: 'sdk-detail-table',
  templateUrl: './sdk-detail-table.component.html',
  styleUrls: ['./sdk-detail-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkDetailTableComponent extends SdkAbstractComponent<SdkEditTableConfig, void, void> {

  /**
   * @ignore
   */
  @HostBinding('class') classNames = `sdk-detail-table`;

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
    if(this.config!= null && this.config.sort != undefined){
      this.sortField = this.config.sort.field;
      this.sortDirection = this.config.sort.dir;
    }    
    //this.isReady = true;
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
  public getSum(mapping: string) : string {
    let sum = 0;
    let somma = '';
    if(!isEmpty(this.config) && !isEmpty(this.config.data)){
      for(let i = 0; i < this.config.data.length; i++) {
        if(this.config.data[i][mapping]!= null){    
          let numStr = this.config.data[i][mapping];              
          numStr = numStr.replace(/\./g, "");
          numStr = numStr.replace(',', '.');
          let num: number =Number(numStr);
          sum += num;
        }      
      }
    }
    somma = (Math.round(sum * 100) / 100).toFixed(2).replace('.', ',').replace(/\d(?=(?:(?:\d{3})+),)/g, match => `${ match }.`); // NOSONAR
    return somma;
  }

  public getDiff(mapping: string) : string {
    let diff = 0;
    let differenza = '';
    if(!isEmpty(this.config) && !isEmpty(this.config.data)){
      for(let i = 0; i < this.config.data.length; i++) {
        if(this.config.data[i][mapping]!= null){
          let numStr = this.config.data[i][mapping];              
          numStr = numStr.replace(/\./g, "");
          numStr = numStr.replace(',', '.');
          let num: number =Number(numStr);
          diff -= num;
        }
      }
    }
    
    differenza = (Math.round(diff * 100) / 100).toFixed(2).replace('.', ',').replace(/\d(?=(?:(?:\d{3})+),)/g, match => `${ match }.`); // NOSONAR
    return differenza;
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
    this.emitOutput({data:data,performer: performer} as any);
  }

  /**
     * @ignore
     */
  public sort(data: any, performer: string): void {
    if(data.mappingInput === this.sortField){
      if(this.sortDirection === 'asc'){
        this.sortDirection = 'desc'
      } else if(this.sortDirection === 'desc'){
        this.sortDirection = 'asc'
      }
      data={...data,...{sortDirection:this.sortDirection}};
    } else{
      this.sortField = data.mappingInput;
      data={...data,...{sortDirection:'asc'}};
    }
    this.emitOutput({data:data,performer: performer} as any);
  }

  public getDependOperation(row: any){
    let value = 0;
    if (!isEmpty(this.config) && !isEmpty(this.config.data)) {
      for (let i = 0; i < this.config.data.length; i++) {       
        if (this.config.data[i][row.mappingInput] != null && this.config.data[i][row.dependField] !== row.dependValue) {
          let numStr = this.config.data[i][row.mappingInput];              
          numStr = numStr.replace(/\./g, "");
          numStr = numStr.replace(',', '.');
          let num: number =Number(numStr);
          value += num;
        }
        if (this.config.data[i][row.mappingInput] != null && this.config.data[i][row.dependField] === row.dependValue) {          
          let numStr = this.config.data[i][row.mappingInput];              
          numStr = numStr.replace(/\./g, "");
          numStr = numStr.replace(',', '.');
          let num: number =Number(numStr);
          value -= num;
        }
      }
    }
    return (Math.round(value * 100) / 100).toFixed(2);
  }

  // #endregion

  // #region Private
  
  // #endregion


}



