import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { IDictionary, SdkAbstractComponent, SdkProviderService } from '@maggioli/sdk-commons';
import { SdkAutocompleteAdvancedBaseFilterItem, SdkComboBoxItem, SdkTextboxMatrixCellConfig, SdkTextboxMatrixRowConfig, SdkTextboxOutput } from '@maggioli/sdk-controls';
import {
  cloneDeep,
  each,
  every,
  find,
  get,
  has,
  includes,
  isArray,
  isEmpty,
  isNumber,
  isObject,
  join, reduce,
  set,
  size,
  some
} from 'lodash-es';
import { Observable, of, Subject } from 'rxjs';

import {
  SdkDynamicValue,
  SdkFormBuilderField,
  SdkFormBuilderInput,
  SdkFormBuilderVisibleCondition,
  SdkFormBuilderVisibleTypeCondition,
  SdkFormBuilderVisibleValue,
  TSdkFormBuilderFieldType
} from '../../sdk-form-builder.domain';

/**
 * Componente per renderizzare un form section
 */
@Component({
  selector: 'sdk-form-section-list',
  templateUrl: './sdk-form-section-list.component.html',
  styleUrls: ['./sdk-form-section-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkFormSectionListComponent extends SdkAbstractComponent<SdkFormBuilderField, SdkFormBuilderInput, SdkFormBuilderField> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  @ViewChild('sectionContent') public _sectionContent: ElementRef;

  /**
   * @ignore
   */
  @ViewChild('extraParamHtml') public extraParamHtml: ElementRef;

  /**
   * @ignore
   */
  @Output('outputClick') outputClick$: EventEmitter<any> = new EventEmitter();

  /**
   * @ignore
   */
  @Input('inputFieldVisibleUpdate') inputFieldVisibleUpdate$: Subject<SdkFormBuilderField>;

  /**
   * @ignore
   */
  @Output('outputFieldVisibleUpdate') outputFieldVisibleUpdate$: EventEmitter<SdkFormBuilderField> = new EventEmitter();

  /**
   * @ignore
   */
  @Output('outputField') outputField$: EventEmitter<SdkFormBuilderField> = new EventEmitter();

  /**
   * @ignore
   */
  @Output('addPanel') addPanel$: EventEmitter<string> = new EventEmitter();

  /**
   * @ignore
   */
  @Output('removePanel') removePanel$: EventEmitter<string> = new EventEmitter();

  /**
   * @ignore
   */
  @Output('outputInfoBox') outputInfoBox$: EventEmitter<SdkFormBuilderField> = new EventEmitter();

  /**
   * @ignore
   */
  @Output('outputAdvancedModalClose') public outputAdvancedModalClose$: EventEmitter<SdkFormBuilderField> = new EventEmitter();

  /**
   * @ignore
   */
  @Output('onBlur') public onBlur$: EventEmitter<SdkFormBuilderField> = new EventEmitter();

  /**
   * @ignore
   */
  @Output('onFocus') public onFocus$: EventEmitter<SdkFormBuilderField> = new EventEmitter();

  /**
   * @ignore
   */
  public collapsed: boolean = true;

  /**
   * @ignore
   */
  public config: SdkFormBuilderField;

  /**
   * @ignore
   */
  private subjMap: IDictionary<Subject<any>>;

  /**
   * @ignore
   */
  private baseFilterSubjMap: IDictionary<Subject<SdkAutocompleteAdvancedBaseFilterItem>>;

  /**
   * @ignore
   */
  private allDataSubj: Subject<SdkFormBuilderInput> = new Subject();

  /**
   * @ignore
   */
  public allFieldsHidden: boolean = false;

  /**
  * @ignore
  */
  public extraParam: boolean = false;

  /**
  * @ignore
  */
  public extraParamCollapsed: boolean = true;

  /**
  * @ignore
  */
  public extraParamText: string = '';


  // #endregion

  // #region Constructor

  /**
   * @ignore
   */
  constructor(inj: Injector, private cdr: ChangeDetectorRef) {
    super(inj, cdr);
  }

  // #endregion

  // #region Hooks

  /**
   * @ignore
   */
  protected onInit(): void {
    if (isObject(this.inputFieldVisibleUpdate$)) {
      this.addSubscription(this.inputFieldVisibleUpdate$.subscribe(this.manageSubjectUpdatedField));
    }
  }

  /**
   * @ignore
   */
  protected onAfterViewInit(): void {
    if(this.config.initialCollapse != null && this.config.initialCollapse === false){
      this.sectionContent.classList.add('hide');
    }
  }

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
    if(this.config.initialCollapse != null){
      this.collapsed = this.config.initialCollapse;     
    }
    this.buildSubjMap();
    this.checkAllHidden();
    this.extraParam = !isEmpty(config.extraParamsProvider);
  }

  /**
   * @ignore
   */
  protected onData(data: SdkFormBuilderInput): void {
    this.elaborateNewInput(data);
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
  private get sectionContent(): HTMLElement {
    return this._sectionContent.nativeElement;
  }

  /**
   * @ignore
   */
  private buildSubjMap(): void {
    this.subjMap = {};
    this.subjMap = reduce(this.config.fieldSections, (map: IDictionary<Subject<any>>, one: SdkFormBuilderField) => {
      map[one.code] = new Subject();
      return map;
    }, {});
    this.baseFilterSubjMap = {};
    each(this.config.fieldSections, (one: SdkFormBuilderField) => {
      if (one.type === 'AUTOCOMPLETE' && one.advanced === true) {
        this.baseFilterSubjMap[one.code] = new Subject();
      }
    });
  }

  /**
   * @ignore
   */
  private checkVisibleCondition(formSection: SdkFormBuilderField): void {
    // console.log('checkVisibleCondition >>>', formSection);
    let matrixValue: number = 0;
    let code: string = formSection.type === 'TEXTBOX-MATRIX' ? formSection.cellCode : formSection.code;
    if (formSection.type === 'TEXTBOX-MATRIX') {
      matrixValue = this.findMatrixValue(formSection);
    }
    let data: any = formSection.type === 'TEXTBOX-MATRIX' ? matrixValue : formSection.data;

    if (formSection.type === 'COMBOBOX' && data == null) {
      data = {};
    }

    if (formSection.type === 'DYNAMIC-FORM-SECTION') {
      data = [];
      each(formSection.dynamicFieldValues, (one: SdkDynamicValue) => {
        if (one.value === 1) {
          data.push(one.codice);
        }
      });
    }

    // controllo sezione
    if (this.config.code !== code &&
      (formSection.type === 'COMBOBOX' || formSection.type === 'TEXTBOX-MATRIX' || formSection.type === 'AUTOCOMPLETE' ||
        formSection.type === 'MULTIPLE-AUTOCOMPLETE' ||
        formSection.type === 'NUMERIC-TEXTBOX' || formSection.type === 'HIDDEN') &&
      isObject(this.config.visibleCondition) &&
      (has(this.config.visibleCondition.and, code) || has(this.config.visibleCondition.or, code))) {

      let conditionType: SdkFormBuilderVisibleTypeCondition = this.config.visibleCondition;

      if (isObject(conditionType.and)) {
        // caso and
        let type: IDictionary<SdkFormBuilderVisibleCondition> = conditionType.and;
        let condition: SdkFormBuilderVisibleCondition = get(type, code);

        let finalCond: boolean = false;
        let visible: boolean = false;
        let othersVisible: boolean = false;
        if (data) {
          let dataTipo: string | number = isObject(data) ? (formSection.type === 'COMBOBOX' ? get(data, 'key') : get(data, '_key')) : data;
          visible = this.verifyVisibleValueCondition(condition, dataTipo, formSection.type, 'and');
        }

        condition.visible = visible;
        this.config.visibleCondition.and
        set(this.config.visibleCondition.and, code, condition);
        condition = get(this.config.visibleCondition.and, code);

        let countOther: number = 0;
        each(this.config.visibleCondition.and, (cond: SdkFormBuilderVisibleCondition, key: string) => {
          if (cond.visible === true && key !== code) {
            countOther++;
          }
        });

        othersVisible = size(this.config.visibleCondition.and) === 1 || (countOther == size(this.config.visibleCondition.and) - 1);

        finalCond = visible === true && othersVisible === true;
        this.config.visible = finalCond;

        // pulizia campi se visible = false
        if (this.config.visible === false) {
          each(this.config.fieldSections, (one: SdkFormBuilderField) => {
            delete one.data;
            if (one.type === 'FORM-GROUP') {
              one.fieldGroups = [];
            }
            let subj: Subject<SdkFormBuilderInput> = this.getDataSubject(one);
            subj.next({
              code: one.code,
              data: undefined
            });
          });
        }

      } else if (isObject(conditionType.or)) {
        // caso or
        let type: IDictionary<SdkFormBuilderVisibleCondition> = conditionType.or;
        let condition: SdkFormBuilderVisibleCondition = get(type, code);
        let finalCond: boolean = false;
        let visible: boolean = false;
        let othersVisible: boolean = false;
        if (data) {
          let dataTipo: string | number = isObject(data) ? (formSection.type === 'COMBOBOX' ? get(data, 'key') : get(data, '_key')) : data;
          visible = this.verifyVisibleValueCondition(condition, dataTipo, formSection.type, 'or');
        }

        condition.visible = visible;
        this.config.visibleCondition.or
        set(this.config.visibleCondition.or, code, condition);
        condition = get(this.config.visibleCondition.or, code);

        let item: SdkFormBuilderVisibleCondition = find(this.config.visibleCondition.or, (cond: SdkFormBuilderVisibleCondition, key: string) => {
          return cond.visible === true && key !== code;
        });

        othersVisible = isObject(item);

        finalCond = visible === true || othersVisible === true;
        this.config.visible = finalCond;

        // pulizia campi se visible = false
        if (this.config.visible === false) {
          each(this.config.fieldSections, (one: SdkFormBuilderField) => {
            delete one.data;
            if (one.type === 'FORM-GROUP') {
              one.fieldGroups = [];
            }
            let subj: Subject<SdkFormBuilderInput> = this.getDataSubject(one);
            subj.next({
              code: one.code,
              data: undefined
            });
          });
        }
      }
    }

    // controllo campi nella sezione
    each(this.config.fieldSections, (one: SdkFormBuilderField, index: number) => {
      if (one.code !== code &&
        (formSection.type === 'COMBOBOX' || formSection.type === 'TEXTBOX-MATRIX' || formSection.type === 'AUTOCOMPLETE' ||
          formSection.type === 'TEXTBOX' || formSection.type === 'NUMERIC-TEXTBOX' || formSection.type === 'HIDDEN' || formSection.type === 'DYNAMIC-FORM-SECTION') &&
        isObject(one.visibleCondition) &&
        (has(one.visibleCondition.and, code) || has(one.visibleCondition.or, code))) {
        let conditionType: SdkFormBuilderVisibleTypeCondition = one.visibleCondition;

        if (isObject(conditionType.and)) {
          // caso and
          let type: IDictionary<SdkFormBuilderVisibleCondition> = conditionType.and;
          let condition: SdkFormBuilderVisibleCondition = get(type, code);
          let finalCond: boolean = false;
          let visible: boolean = false;
          let othersVisible: boolean = false;
          if (data) {
            let dataTipo: string | number | Array<any> = isObject(data) && !isArray(data) ? (formSection.type === 'COMBOBOX' ? get(data, 'key') : get(data, '_key')) : data;
            visible = this.verifyVisibleValueCondition(condition, dataTipo, formSection.type, 'and');
          }

          condition.visible = visible;
          set(one.visibleCondition.and, code, condition);
          condition = get(one.visibleCondition.and, code);

          let countOther: number = 0;
          each(one.visibleCondition.and, (cond: SdkFormBuilderVisibleCondition, key: string) => {
            if (cond.visible === true && key !== code) {
              countOther++;
            }
          });

          othersVisible = size(one.visibleCondition.and) === 1 || (countOther == size(one.visibleCondition.and) - 1);

          finalCond = visible === true && othersVisible === true;
          one.visible = finalCond;
          one = cloneDeep(one);

          // pulizia campo se visible = false
          if (one.visible === false) {
            delete one.data;
            let subj: Subject<SdkFormBuilderInput> = this.getDataSubject(one);
            subj.next({
              code: one.code,
              data: undefined
            });
          }

        } else if (isObject(conditionType.or)) {
          // caso or
          let type: IDictionary<SdkFormBuilderVisibleCondition> = conditionType.or;
          let condition: SdkFormBuilderVisibleCondition = get(type, code);
          let finalCond: boolean = false;
          let visible: boolean = false;
          let othersVisible: boolean = false;
          if (data) {
            let dataTipo: string | number | Array<any> = isObject(data) && !isArray(data) ? (formSection.type === 'COMBOBOX' ? get(data, 'key') : get(data, '_key')) : data;
            visible = this.verifyVisibleValueCondition(condition, dataTipo, formSection.type, 'or');
          }

          condition.visible = visible;
          set(one.visibleCondition.or, code, condition);
          condition = get(one.visibleCondition.or, code);

          let item: SdkFormBuilderVisibleCondition = find(one.visibleCondition.or, (cond: SdkFormBuilderVisibleCondition, key: string) => {
            return cond.visible === true && key !== code;
          });

          othersVisible = isObject(item);

          finalCond = visible === true || othersVisible === true;
          one.visible = finalCond;
          one = cloneDeep(one);

          // pulizia campo se visible = false
          if (one.visible === false) {
            delete one.data;
            let subj: Subject<SdkFormBuilderInput> = this.getDataSubject(one);
            subj.next({
              code: one.code,
              data: undefined
            });
          }
        }
      }
      this.config.fieldSections[index] = one;
    });

    this.checkAllHidden();
  }

  /**
   * @ignore
   */
  private findMatrixValue(field: SdkFormBuilderField): number {
    let value: number = 0;
    if (isObject(field) && !isEmpty(field.cellCode)) {
      if (!isEmpty(field.rowCode)) {
        let row: SdkTextboxMatrixRowConfig = find(field.rows, (row: SdkTextboxMatrixRowConfig) => row.code === field.rowCode);
        let cell: SdkTextboxMatrixCellConfig = find(row.cells, (cell: SdkTextboxMatrixCellConfig) => cell.code === field.cellCode);
        value = cell.value;
      } else {
        each(field.rows, (row: SdkTextboxMatrixRowConfig) => {
          let cell: SdkTextboxMatrixCellConfig = find(row.cells, (cell: SdkTextboxMatrixCellConfig) => cell.code === field.cellCode);
          if (isObject(cell)) {
            value = cell.value;
          }
        });
      }
    }
    return value;
  }

  /**
   * @ignore
   */
  private verifyVisibleValueCondition(condition: SdkFormBuilderVisibleCondition, actualValue: string | number | Array<any>, type: TSdkFormBuilderFieldType, operationType: string): boolean {
    let visible: boolean = false;

    let valoriPossibili: Array<SdkFormBuilderVisibleValue> = condition.values;
    let visibili: Array<boolean> = new Array();
    each(valoriPossibili, (one: SdkFormBuilderVisibleValue) => {
      let operation: string = one.operation;
      operation = operation === '=' ? '==' : operation;
      let condizioneDaVerificare: string;
      let verificata: boolean;
      if (type === 'COMBOBOX' || type === 'TEXTBOX' || type === 'HIDDEN' || type === 'AUTOCOMPLETE') {
        if (one.value == null || actualValue == null) {
          if (one.value != null && actualValue == null) {
            condizioneDaVerificare = actualValue + operation + '"' + one.value + '"';
          } else if (one.value == null && actualValue != null) {
            condizioneDaVerificare = '"' + actualValue + '"' + operation + one.value;
          } else {
            condizioneDaVerificare = actualValue + operation + one.value;
          }
        } else {
          if (isNumber(actualValue) && isNumber(one.value)) {
            condizioneDaVerificare = actualValue + operation + one.value;
          } else {
            condizioneDaVerificare = '"' + actualValue + '"' + operation + '"' + one.value + '"';
          }
        }
      } else if (type === 'TEXTBOX-MATRIX' || type === 'NUMERIC-TEXTBOX') {
        condizioneDaVerificare = actualValue + operation + one.value;
      } else if (type === 'DYNAMIC-FORM-SECTION') {
        if (one.value != null) {
          let singoloValue = find(<Array<any>>actualValue, (singolo: any) => {
            return singolo == one.value;
          });          
          if(operation == '!='){
            verificata = singoloValue == null;
          } else{
            verificata = singoloValue != null;
          }
          
        }
      }
      if (condizioneDaVerificare != null) {
        verificata = (new Function('return ' + condizioneDaVerificare))(); // NOSONAR
      }
      visibili.push(verificata);
    })

    const opType: string = condition.singleVisibleType != null ? condition.singleVisibleType : operationType;
    if (opType === 'and') {
      visible = every(visibili, (one: boolean) => one === true);
    } else if (opType === 'or') {
      visible = some(visibili, (one: boolean) => one === true);
    }

    return visible;
  }

  /**
   * @ignore
   */
  private checkCampiDipendenti(currentField: SdkFormBuilderField): void {
    // controllo sezione
    if (this.config.code !== currentField.code &&
      currentField.type === 'COMBOBOX' &&
      !isEmpty(this.config.campoDipendente) &&
      this.config.campoDipendente === currentField.code) {
      let data: SdkComboBoxItem = currentField.data;
      if (isObject(data)) {
        this.config.itemsProviderSubject.next(data.key);
      } else {
        this.config.itemsProviderSubject.next(null);
      }
    }

    // controllo campi nella sezione
    each(this.config.fieldSections, (one: SdkFormBuilderField) => {
      if (one.code !== currentField.code &&
        currentField.type === 'COMBOBOX' &&
        !isEmpty(one.campoDipendente) &&
        one.campoDipendente === currentField.code) {
        let data: SdkComboBoxItem = currentField.data;
        if (isObject(data)) {
          one.itemsProviderSubject.next(data.key);
        } else {
          one.itemsProviderSubject.next(null);
        }
      }
    });
  }

  /**
   * @ignore
   */
  private checkAdvancedAutocompleteCampiCollegati(currentField: SdkFormBuilderField): void {
    if (
      currentField.type === 'AUTOCOMPLETE' &&
      currentField.advanced === true &&
      currentField.advancedAutocompleteCampiCollegati != null &&
      currentField.advancedAutocompleteCampiCollegati.length > 0 &&
      currentField.collegato !== true // per evitare il loop di invio di dati per i campi collegati
    ) {
      // controllo campi nella sezione
      each(this.config.fieldSections, (one: SdkFormBuilderField) => {
        if (currentField.advancedAutocompleteCampiCollegati.includes(one.code) && one.type === 'AUTOCOMPLETE' && one.advanced === true) {
          let newFieldData = {
            ...currentField.data
          };
          newFieldData._key = newFieldData[one.advancedModalComponentConfig.entityKey];
          newFieldData.text = one.advancedModalComponentConfig.entityText(newFieldData);
          console.log('collegato >>>', one.code, newFieldData);
          let subj: Subject<SdkFormBuilderInput> = this.getDataSubject(one);
          subj.next({
            code: one.code,
            data: newFieldData,
            collegato: true
          });
        }
      });
    }
  }

  /**
   * @ignore
   */
  private manageSubjectUpdatedField = (updatedField: SdkFormBuilderField) => {
    if (isObject(updatedField)) {
      this.markForCheck(() => {
        this.checkVisibleCondition(updatedField);
        this.checkCampiDipendenti(updatedField);
      });
      this.emitOutput(this.config);
    }
  }

  /**
   * @ignore
   */
  private elaborateNewInput(data: SdkFormBuilderInput): void {
    if (has(this.subjMap, data.code)) {
      this.subjMap[data.code].next(data);
    } else {
      this.allDataSubj.next(data);
    }
  }

  /**
   * @ignore
   */
  private checkAllHidden(): void {
    this.markForCheck(() => {
      if (this.config.deleteIfEmpty === false) {
        this.allFieldsHidden = false;
      } else {
        this.allFieldsHidden = every(this.config.fieldSections, (one: SdkFormBuilderField) => {
          return one.visible === false ||
            one.type === 'HIDDEN' ||
            (one.type === 'DYNAMIC-FORM-SECTION' && one.dynamicReadonly === true && some(one.dynamicFieldValues, (dynOne: SdkDynamicValue) => dynOne.value == 1) === false) ||
            (one.type === 'FORM-GROUP' && (one.fieldGroups == null || one.fieldGroups.length == 0) && one.maxGroupsNumber == -1 && one.emptyGroupMessage == null);
        });
      }
    });
  }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public getFormSectionObs(item: SdkFormBuilderField): Observable<SdkFormBuilderField> {
    return of(item);
  }

  /**
   * @ignore
   */
  public manageFormSectionUpdate(formSection: SdkFormBuilderField, index: number): void {
    if (isObject(formSection)) {
      this.markForCheck(() => {
        this.config.fieldSections[index] = formSection;
        this.checkVisibleCondition(formSection);
        this.checkCampiDipendenti(formSection);
        this.checkAdvancedAutocompleteCampiCollegati(formSection);
        this.outputFieldVisibleUpdate$.emit(formSection);
        this.emitOutput(this.config);
      });
    }
  }

  /**
   * @ignore
   */
  public manageItemClick(field: any, index: number): void {
    if (isObject(field)) {
      this.outputClick$.emit({ ...field });
    }
  }

  /**
   * @ignore
   */
  public trackByCode(index: number, item: SdkFormBuilderField): string {
    return item.code + item.visible;
  }

  /**
   * @ignore
   */
  public getDataSubject(item: SdkFormBuilderField): Subject<SdkFormBuilderInput> {
    if (item.type === 'FORM-SECTION' || item.type == 'FORM-GROUP') {
      return this.allDataSubj;
    } else {
      return get(this.subjMap, item.code);
    }
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
  public manageAddPanel(event: string): void {
    this.addPanel$.emit(event);
  }

  /**
   * @ignore 
   */
  public manageRemovePanel(event: string): void {
    this.removePanel$.emit(event);
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
  public collapse() {
    this.collapsed = !this.collapsed;
    if (this.collapsed === false) {
      this.sectionContent.classList.add('hide');
    } else {
      this.sectionContent.classList.remove('hide');
    }
  }

  /**
   * @ignore
   */
  public getSectionClasses(config: SdkFormBuilderField): string {
    let classes: string = null;
    if (config.sectionClass != null) {
      classes = join(config.sectionClass, ' ');
      classes = classes.trim();
    }
    return classes;
  }

  public getClasses(config: SdkFormBuilderField): string {
    let classes: string = null;
    if (config.classes != null) {
      classes = join(config.classes, ' ');
      classes = classes.trim();
    }
    return classes;
  }

  /**
   * @ignore
   */
  public showExtraparams() {

    this.provider.run(this.config.extraParamsProvider, {
      data: {
        sectionConfig: this.config
      }
    }).subscribe((obj: string) => {
      this.extraParamCollapsed = false;
      if (!isEmpty(obj)) {
        this.extraParamText = obj;
      }
      this.cdr.markForCheck();
    });
  }

  /**
   * @ignore
   */
  public hideExtraparams() {
    this.extraParamCollapsed = true;
    this.extraParamText = '';
  }

  /**
   * @ignore
   */
  public manageOutputBaseFilter(item: SdkAutocompleteAdvancedBaseFilterItem | SdkTextboxOutput, index: number): void {
    if (item != null) {
      // ciclo tutti gli elementi della section e per quelli che hanno l'autocomplete corrente come campo collegato, invio il filtro di base
      each(this.config.fieldSections, (one: SdkFormBuilderField) => {
        if (one.type == 'AUTOCOMPLETE' &&
          one.advanced === true &&
          one.advancedAutocompleteCampiCollegati != null &&
          includes(one.advancedAutocompleteCampiCollegati, item.code) &&
          one.code != item.code
        ) {
          this.baseFilterSubjMap[one.code].next(item);
        }
      });
    }
  }

  /**
   * @ignore
   */
  public getInputBaseFilterSubject(item: SdkFormBuilderField): Subject<SdkFormBuilderInput> {
    if (item.type === 'AUTOCOMPLETE' && item.advanced === true) {
      return get(this.baseFilterSubjMap, item.code)
    }
    return null;
  }

  /**
   * @ignore
   */
  public manageOutputAdvancedModalClose(event: SdkFormBuilderField) {
    this.outputAdvancedModalClose$.emit(event);
  }

  /**
   * @ignore
   */
  public manageOnBlur(event: SdkFormBuilderField) {
    this.onBlur$.emit(event);
  }

  /**
   * @ignore
   */
  public manageOnFocus(event: SdkFormBuilderField) {
    this.onFocus$.emit(event);
  }

  // #endregion

  // #region Getters

  private get provider(): SdkProviderService { return this.injectable(SdkProviderService) }

  // #endregion

}