import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';
import { clone, cloneDeep, each, every, filter, findIndex, get, has, isEmpty, reduce, some, toString } from 'lodash-es';
import { SelectItem } from 'primeng/api';

import { SdkDynamicValue, SdkFormBuilderField, SdkFormBuilderInput } from '../../sdk-form-builder.domain';

/**
 * Componente per renderizzare una form section dinamica
 */
@Component({
  selector: 'sdk-form-dynamic-section',
  templateUrl: './sdk-form-dynamic-section.component.html',
  styleUrls: ['./sdk-form-dynamic-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkFormDynamicSectionComponent extends SdkAbstractComponent<SdkFormBuilderField, SdkFormBuilderInput, SdkFormBuilderField> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  @Output('outputClick') outputClick$: EventEmitter<any> = new EventEmitter();

  /**
   * @ignore
   */
  @Output('outputField') outputField$: EventEmitter<SdkFormBuilderField> = new EventEmitter();

  /**
   * @ignore
   */
  @Output('outputInfoBox') outputInfoBox$: EventEmitter<SdkFormBuilderField> = new EventEmitter();

  /**
   * @ignore
   */
  public config: SdkFormBuilderField;

  /**
   * @ignore
   */
  public availableItems: Array<SelectItem>;

  /**
   * @ignore
   */
  public combosList: Array<any>;

  /**
   * @ignore
   */
  public DEFAULT_SI: number = 1;
  /**
   * @ignore
   */
  public DEFAULT_NO: number = 2;

  // #endregion

  // #region Constructor

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
  }

  // #endregion

  // #region Hooks

  /**
   * @ignore
   */
  protected onInit(): void { }

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
  protected onOutput(_data: SdkFormBuilderField): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkFormBuilderField): void {
    this.config = config;
    this.markForCheck(() => this.buildForm());
  }

  /**
   * @ignore
   */
  protected onData(data: SdkFormBuilderInput): void {
    if (data != null && data.dynamicFieldValues != null) {
      this.updateValues(data);
    }
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private buildForm(): void {
    if (this.config != null) {
      this.initAvailableItems();
      this.initCombosList();
    }
  }

  /**
   * @ignore
   */
  private initAvailableItems(): void {
    if (this.availableItems == null) {
      this.availableItems = new Array();
    }
    each(this.config.dynamicFieldValues, (one: SdkDynamicValue) => {
      const itemConfig: SelectItem = this.buildSingleItemConfig(one);
      this.availableItems.push(itemConfig);
    });
  }

  /**
   * @ignore
   */
  private buildSingleItemConfig(one: SdkDynamicValue): SelectItem {
    if (one != null) {
      const itemConfig: SelectItem = {
        value: toString(one.codice),
        label: one.descrizione,
        disabled: one.value == this.DEFAULT_SI
      };
      return itemConfig;
    }
    return null;
  }

  /**
   * @ignore
   */
  private initCombosList(): void {
    if (this.combosList == null) {
      this.combosList = new Array();
    }
    each(this.config.dynamicFieldValues, (one: SdkDynamicValue) => {
      if (one.value === 1) {
        // se value si allora renderizzo la combo
        const comboConfig: any = this.buildSingleComboConfig(one);
        this.combosList.push(comboConfig);
      }
    });
    // aggiungo una combo vuota (viene inserita solamente questa se non ci sono valori a "SI" salvati su DB)
    this.generateEmptyCombo();
  }

  /**
   * @ignore
   */
  private buildSingleComboConfig(one?: SdkDynamicValue): any {
    const code: string = this.generateUniqueCode();
    const comboConfig: any = {
      code,
      oldData: one != null ? toString(one.codice) : null,
      data: one != null ? toString(one.codice) : null
    };
    return comboConfig;
  }

  /**
   * @ignore
   */
  private generateEmptyCombo(): void {
    const canAdd: boolean = this.checkCanAddCombo();
    const limit = this.config.limit != null ? this.config.limit : false;
    if (canAdd && (!limit || (limit && this.combosList.length == 0))) {
      const comboConfig: any = this.buildSingleComboConfig();
      this.combosList.push(comboConfig);
    }
  }

  /**
   * @ignore
   */
  private checkCanAddCombo(): boolean {
    const allDisabled: boolean = every(this.availableItems, (one: SelectItem) => one.disabled === true);
    return allDisabled === false;
  }

  /**
   * @ignore
   */
  private checkEmptyCombo(): boolean {
    const hasEmptyCombo: boolean = some(this.combosList, (one: any) => {
      return one.oldData == null && one.data == null;
    });
    return hasEmptyCombo === true;
  }

  /**
   * @ignore
   */
  private elaborateNewValue(currentCombo: any, newValue: string): void {
    const index: number = findIndex(this.combosList, (one: any) => one.code === currentCombo.code);
    const limit = this.config.limit != null ? this.config.limit : false;
    if (index > -1) {
      const currentKey: string = this.combosList[index].oldData;
      let newData: SelectItem;
      // abilito il vecchio valore, disabilito il nuovo corrente e recupero l'oggetto del nuovo valore
      // nel caso il nuovo valore sia null (cancellazione del valore) riabilito solamente il vecchio valore
      // se limit (limito la selezione solo di 1 valore nella combo) è true disabilito tutto tranne il nuovo valore 
      if(limit){
        each(this.availableItems, (one: SelectItem) => {
          if (one.value === newValue) {
            one.disabled = true;
            newData = clone(one.value);
          } else {
            one.disabled = false;
          }
        });
      } else{
        each(this.availableItems, (one: SelectItem) => {
          if (one.value === currentKey) {
            one.disabled = false;
          } else if (one.value === newValue) {
            one.disabled = true;
            newData = clone(one.value);
          }
        });
      }
      

      // console.log('this.combosList >>>', this.combosList);

      // se il vecchio valore e' null e ora e' cambiato, aggiungo una combo vuota alla fine
      const isOldDataNull: boolean = this.combosList[index].oldData == null;
      this.combosList[index].oldData = this.combosList[index].data;
      this.combosList[index].data = newData;
      if (isOldDataNull === true) {
        this.combosList[index].oldData = newData;
        this.generateEmptyCombo();
      }

      if (newValue == null || isEmpty(newValue)) {
        // se il nuovo valore e' null rimuovo la combo
        this.combosList.splice(index, 1);
        // verifico se ho una combo vuota altrimenti la genero
        if (this.checkEmptyCombo() === false) {
          this.generateEmptyCombo();
        }
      }

      // se l'ultimo valore e' stato cancellato e quindi l'if sopra ha rimosso la combo, inserisco una combo vuota in coda
      if (isEmpty(this.combosList)) {
        this.generateEmptyCombo();
      }

      // azzero tutti i valori originali
      each(this.config.dynamicFieldValues, (one: SdkDynamicValue) => {
        one.value = this.DEFAULT_NO;
      });
      // e li aggiorno con quelli selezionati
      each(this.combosList, (one: any) => {
        if (one.data != null) {
          each(this.config.dynamicFieldValues, (orig: SdkDynamicValue) => {
            if (one.data === toString(orig.codice)) {
              orig.value = this.DEFAULT_SI;
            }
          });
        }
      });
      // console.log('this.config.dynamicFieldValues >>>', this.config.dynamicFieldValues);
    }
  }

  /**
   * @ignore
   */
  private updateValues(data: SdkFormBuilderInput): void {
    this.markForCheck(() => {
      // recupero dei valori impostati dall'utente
      const mappa: IDictionary<number> = this.getCurrentValues(this.config.dynamicFieldValues);
      // set nuova configurazione
      this.config.dynamicFieldValues = [...data.dynamicFieldValues];
      // applico i valori dell'utente sui campi rimasti
      each(this.config.dynamicFieldValues, (one: SdkDynamicValue) => {
        // reset dei valori. non imposto valori di default successivi perche' questo metodo viene eseguito alla modifica dei valori della form
        one.value = this.DEFAULT_NO;
        if (has(mappa, one.codice)) {
          one.value = get(mappa, one.codice);
        }
      });
      // inizializzo tutte le configurazioni
      delete this.availableItems;
      this.initAvailableItems();
      delete this.combosList;
      this.initCombosList();
      this.emitOutput({ ...this.config });
    });
  }

  /**
   * @ignore
   */
  private getCurrentValues(values: Array<SdkDynamicValue>): IDictionary<number> {
    const mappa: IDictionary<number> = reduce(cloneDeep(values), (map: IDictionary<any>, one: SdkDynamicValue) => {
      map[one.codice] = one.value;
      return map;
    }, {});

    return mappa;
  }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public trackByComboId(index: number, item: any): string {
    return item.code;
  }

  /**
   * @ignore 
   */
  public manageOutputField(field: SdkFormBuilderField, index: number): void {
    this.outputField$.emit(field);
  }

  /**
   * @ignore
   */
  public manageOutputInfoBox(event: SdkFormBuilderField): void {
    this.outputInfoBox$.emit(event);
  }

  /**
   * @ignore
   */
  public manageModelChange(currentCombo: any, event: any): void {
    let newValue: string = event.target.value ?? null;
    this.markForCheck(() => this.elaborateNewValue(currentCombo, newValue));
    this.emitOutput({ ...this.config });
  }

  /**
   * @ignore
   */
  public checkReadonlyCombo(): boolean {
    const readonly: boolean = this.config.dynamicReadonly === true;
    const empty: boolean = every(this.config.dynamicFieldValues, (one: SdkDynamicValue) => one.value === this.DEFAULT_NO);
    return readonly && empty;
  }

  /**
   * @ignore
   */
  public getReadonlyValues(): Array<any> {
    return filter(this.config.dynamicFieldValues, (one: SdkDynamicValue) => one.value === this.DEFAULT_SI);
  }

  // #endregion

}