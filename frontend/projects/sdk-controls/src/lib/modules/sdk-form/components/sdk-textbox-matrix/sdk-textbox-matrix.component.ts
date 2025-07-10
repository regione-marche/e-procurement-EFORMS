import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { IDictionary, SdkLocaleService, SdkNumberFormatService } from '@maggioli/sdk-commons';
import {
  each,
  find,
  findIndex,
  isEmpty,
  isNumber,
  isObject,
  join,
  replace,
  set,
  startsWith,
  toNumber,
  toString,
} from 'lodash-es';
import { Observable, Subject, of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import {
  SdkNumericTextboxConfig,
  SdkNumericTextboxInput,
  SdkNumericTextboxOutput,
  SdkTextboxMatrixCellConfig,
  SdkTextboxMatrixConfig,
  SdkTextboxMatrixInput,
  SdkTextboxMatrixOutput,
  SdkTextboxMatrixRowConfig,
} from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';


/**
 * Componente per renderizzare un campo textbox matrix
 */
@Component({
  selector: 'sdk-textbox-matrix',
  templateUrl: './sdk-textbox-matrix.component.html',
  styleUrls: ['./sdk-textbox-matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTextboxMatrixComponent extends SdkAbstractFormField<SdkTextboxMatrixConfig, SdkTextboxMatrixInput, SdkTextboxMatrixOutput> implements OnInit, AfterViewInit, OnDestroy {

  /**
   * @ignore
   */
  public config: SdkTextboxMatrixConfig;

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
  public debounce: Subject<any> = new Subject<any>();

  /**
   * @ignore
   */
  private isDisabled: boolean = false;

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
    this.addSubscription(this.debounce.pipe(
      // debounceTime(350),
      distinctUntilChanged())
      .subscribe(({ rowCode, cellCode, value }) => {
        this.numericChange(rowCode, cellCode, value);
      }));
  }

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
  protected onOutput(_data: SdkTextboxMatrixOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkTextboxMatrixConfig): void {
    this.config = { ...config };
    this.elaborateCodes();
    this.checkDisabled();
    setTimeout(() => this.initEmitters());
  }

  /**
   * @ignore
   */
  protected onData(data: SdkTextboxMatrixInput): void {
    this.markForCheck(() => this.updateExternalValue(data));
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #region Public

  /**
   * @ignore
   */
  public getClasses(initialLabel: string, additionalClasses: Array<string>): string {
    let classes: Array<string> = [initialLabel];
    if (!isEmpty(additionalClasses)) {
      classes = [...classes, ...additionalClasses];
    }
    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public textboxChange(rowCode: string, cellCode: string, value: number): void {
    if (rowCode && cellCode) {
      let rowIndex: number = findIndex(this.config.rows, (one: SdkTextboxMatrixRowConfig) => one.code === rowCode);
      if (rowIndex > -1) {
        let cellIndex: number = findIndex(this.config.rows[rowIndex].cells, (one: SdkTextboxMatrixCellConfig) => one.code === cellCode);
        if (cellIndex > -1) {
          this.config.rows[rowIndex].cells[cellIndex].value = value;
          this.config.rows[rowIndex].cells[cellIndex].valueChange.next(value);
          this.emitOutput({ code: this.config.code, header: this.config.header, rows: this.config.rows, cellCode, rowCode, valid: undefined });
        }
      }
    }
  }

  /**
   * @ignore
   */
  public trackByHeaderCode(index: number, item: SdkTextboxMatrixCellConfig): string {
    return isObject(item) ? item.code : toString(index);
  }

  /**
   * @ignore
   */
  public getConfig(cell: SdkTextboxMatrixCellConfig): Observable<SdkNumericTextboxConfig> {

    let config: SdkNumericTextboxConfig = {
      code: cell.code,
      disabled: cell.disabled,
      decimals: cell.decimals ? cell.decimals : 2,
      currency: true
    };

    return of(config);
  }

  /**
   * @ignore
   */
  public getValue(cell: SdkTextboxMatrixCellConfig): Observable<SdkNumericTextboxInput> {

    let config: SdkNumericTextboxInput = {
      data: cell.value ? cell.value : undefined
    };

    return of(config);
  }


  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private findCell(cellCode: string): SdkTextboxMatrixCellConfig {
    let cellFound: SdkTextboxMatrixCellConfig;
    each(this.config.rows, (row: SdkTextboxMatrixRowConfig) => {
      let item: SdkTextboxMatrixCellConfig = find(row.cells, (cell: SdkTextboxMatrixCellConfig) => cell.code === cellCode);
      if (isObject(item)) {
        cellFound = item;
        return false;
      }
    });
    return cellFound;
  }

  /**
   * @ignore
   */
  private initEmitters(): void {
    let depMap: IDictionary<SdkTextboxMatrixCellConfig> = {};
    each(this.config.rows, (row: SdkTextboxMatrixRowConfig) => {
      each(row.cells, (cell: SdkTextboxMatrixCellConfig) => {
        // inizializzo il subject
        cell.valueChange = new Subject();
        // se e' presente una condizione di dipendenza la "parcheggio" in una mappa
        if (!isEmpty(cell.operation) && !isEmpty(cell.operationParams)) {
          set(depMap, cell.code, cell);
        }
      });
    });

    each(depMap, (cellDep: SdkTextboxMatrixCellConfig, key: string) => {
      each(cellDep.operationParams, (one: string) => {
        let cell: SdkTextboxMatrixCellConfig = this.findCell(one);
        // mi sottoscrivo a tutti gli emitter dei campi dipendenti
        if(cell != null){
          this.addSubscription(cell.valueChange.subscribe(this.gestisciSubscription(cellDep, key)));
        }        
      });
    });

    this.markForCheck(() => this.isReady = true);

    // aggiorno i subject con il valore iniziale
    each(this.config.rows, (row: SdkTextboxMatrixRowConfig) => {
      each(row.cells, (cell: SdkTextboxMatrixCellConfig) => {
        if (isNumber(cell.value)) {
          cell.valueChange.next(cell.value);
        }
      });
    });
  }

  /**
   * @ignore
   */
  private gestisciSubscription = (cellDep: SdkTextboxMatrixCellConfig, key: string): (arg0: number) => void => {
    return (_value: number) => {
      this.markForCheck(() => {

        let oParams = [...cellDep.operationParams];
        let values: Array<number> = new Array();
        each(oParams, (singleCellCode: string) => {
          let cellFound: SdkTextboxMatrixCellConfig = this.findCell(singleCellCode);
          if (isObject(cellFound) && isNumber(cellFound.value)) {
            values.push(cellFound.value);
          } else {
            values.push(0);
          }
        });

        let operation: string = cellDep.operation;
        let finalValue: number = this.executeOperation(operation, values, cellDep.decimals);
        let isValueChanged: boolean = this.updateValue(key, finalValue);
        // aggiorno il subject se il valore e' cambiato
        if (isValueChanged === true) {
          let calculatedOne: SdkTextboxMatrixCellConfig = this.findCell(key);
          if(calculatedOne != null){
            calculatedOne.valueChange.next(finalValue);
          }          
          this.emitOutput({ code: this.config.code, header: this.config.header, rows: this.config.rows, cellCode: cellDep.code, valid: undefined });
        }
      });
    };
  }

  /**
   * @ignore
   */
  private updateValue(cellCode: string, value: number): boolean {
    let isValueChanged: boolean = false;
    each(this.config.rows, (row: SdkTextboxMatrixRowConfig) => {
      let cellIndex: number = findIndex(row.cells, (one: SdkTextboxMatrixCellConfig) => one.code === cellCode);
      if (cellIndex > -1) {
        if (row.cells[cellIndex].value !== value) {
          row.cells[cellIndex].value = value;
          isValueChanged = true;
        }
        return false;
      }
    });
    return isValueChanged;
  }

  /**
   * @ignore
   */
  private executeOperation(operation: string, params: Array<number>, precision: number): number {
    if (operation) {
      let realOperation: string = startsWith(operation, 'return ') ? operation : 'return ' + operation;
      let formattedOperation = this.messageFormat(realOperation, params);
      let value: number = (new Function(formattedOperation))(); // NOSONAR
      let realPrecision: number = isNumber(precision) ? precision : 2;
      value = toNumber(value.toFixed(realPrecision));
      return value;
    }
    return undefined;
  }

  /**
   * @ignore
   */
  private messageFormat(label: string, args: Array<any>): string {
    return replace(label, /{(\d+)}/g, (match: any, index: number) => {
      return args[index];
    });
  }

  /**
   * @ignore
   */
  private updateExternalValue(data: SdkTextboxMatrixInput): void {
    let isValueChanged: boolean = this.updateValue(data.cellCode, data.data);
    // aggiorno il subject se il valore e' cambiato
    if (isValueChanged === true) {
      let calculatedOne: SdkTextboxMatrixCellConfig = this.findCell(data.cellCode);
      if(calculatedOne != null){
        calculatedOne.valueChange.next(data.data);
      }      
      this.emitOutput({ code: this.config.code, header: this.config.header, rows: this.config.rows, cellCode: data.cellCode, valid: undefined });
    }
  }

  /**
   * @ignore
   */
  private numericChange(rowCode: string, cellCode: string, valueOutput: SdkNumericTextboxOutput): void {
    let value: number = valueOutput.data;
    this.textboxChange(rowCode, cellCode, value);
  }

  /**
   * @ignore
   */
  private elaborateCodes(): void {
    if (this.config != null) {

      if (this.config.header != null && this.config.header.length > 0) {
        each(this.config.header, (row: SdkTextboxMatrixRowConfig) => {
          if (row.code == null || isEmpty(row.code)) {
            row.code = super.generateUniqueCode();
          }
          each(row.cells, (cell: SdkTextboxMatrixCellConfig) => {
            if (cell.code == null || isEmpty(cell.code)) {
              cell.code = super.generateUniqueCode();
            }
          });
        });
      }

      if (this.config.rows != null && this.config.rows.length > 0) {
        each(this.config.rows, (row: SdkTextboxMatrixRowConfig) => {
          if (row.code == null || isEmpty(row.code)) {
            row.code = super.generateUniqueCode();
          }
          each(row.cells, (cell: SdkTextboxMatrixCellConfig) => {
            if (cell.code == null || isEmpty(cell.code)) {
              cell.code = super.generateUniqueCode();
            }
          });
        });
      }
    }
  }

  /**
   * @ignore
   */
  private checkDisabled(): void {
    this.isDisabled = this.config != null && this.config.disabled === true;
    if (this.isDisabled) {
      each(this.config.rows, (row: SdkTextboxMatrixRowConfig) => {
        each(row.cells, (cell: SdkTextboxMatrixCellConfig) => {
          cell.type = 'TEXT';
        });
      });
    }
  }

  // #endregion

  // #region Getters

  private get sdkLocaleService(): SdkLocaleService { return this.injectable(SdkLocaleService) }

  public get sdkNumberFormatService(): SdkNumberFormatService { return this.injectable(SdkNumberFormatService) }

  // #endregion
}
