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
  ViewChild,
} from '@angular/core';
import { NgElement, WithProperties } from '@angular/elements';
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';
import { cloneDeep, each, every, find, get, has, isEmpty, isObject, reduce, set, size, some, values } from 'lodash-es';
import { of, Subject } from 'rxjs';

import { SdkComboBoxItem } from '../../../sdk-form/sdk-form.domain';
import {
  SdkFormBuilderField,
  SdkFormBuilderInput,
  SdkFormBuilderVisibleCondition,
  SdkFormBuilderVisibleTypeCondition,
  SdkFormBuilderVisibleValue,
  SdkFormFieldGroupConfiguration,
  TSdkFormBuilderFieldType,
} from '../../sdk-form-builder.domain';
import { TYPE_MAP } from '../../sdk-form-builder.elements';

/**
 * Componente per renderizzare un singolo componente form group
 */
@Component({
  selector: 'sdk-form-group',
  templateUrl: './sdk-form-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkFormGroupComponent extends SdkAbstractComponent<SdkFormFieldGroupConfiguration, SdkFormBuilderInput, SdkFormFieldGroupConfiguration> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  @Input('dataAll') dataAll$: Subject<SdkFormBuilderInput>;

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
  @ViewChild('formPanel') _formPanel: ElementRef;

  /**
   * @ignore
   */
  public config: SdkFormFieldGroupConfiguration;

  /**
   * @ignore
   */
  private configMap: IDictionary<SdkFormBuilderField>;

  /**
   * @ignore
   */
  private subjMap: IDictionary<Subject<any>>;

  /**
   * @ignore
   */
  private visibleComponents: IDictionary<NgElement> = {};

  /**
   * @ignore
   */
  private indexMap: IDictionary<number>;

  /**
   * @ignore
   */
  private allDataSubj: Subject<SdkFormBuilderInput> = new Subject();

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
  protected onInit(): void { }

  /**
   * @ignore
   */
  protected onAfterViewInit(): void {
    this.buildSubjMap();
    this.buildForm();
    this.registerAllSubject();
  }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onOutput(_data: SdkFormFieldGroupConfiguration): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkFormFieldGroupConfiguration): void {
    this.config = config;
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
  private buildForm(): void {
    if (isObject(this.config) && !isEmpty(this.config.fields)) {
      this.cleanTemplate();
      this.buildConfigMap();
      this.buildIndexMap();
      this.loadComponents();
      each(this.config.fields, (field: SdkFormBuilderField) => {
        this.markForCheck(() => this.checkVisibleCondition(field));
      });
    }
  }

  /**
   * @ignore
   */
  private buildConfigMap(): void {
    this.configMap = {};
    this.configMap = reduce(this.config.fields, (map: IDictionary<SdkFormBuilderField>, one: SdkFormBuilderField) => {
      map[one.code] = one;
      return map;
    }, {});
  }

  /**
   * @ignore
   */
  private buildIndexMap(): void {
    this.indexMap = {};
    each(this.config.fields, (one: SdkFormBuilderField, index: number) => {
      set(this.indexMap, one.code, index);
    });
  }

  /**
   * @ignore
   */
  private cleanTemplate(): void {
    if (isObject(this.formPanel)) {
      while (this.formPanel.firstChild) {
        this.formPanel.removeChild(this.formPanel.firstChild);
      }
    }
  }

  /**
   * @ignore
   */
  private getSelectorFromType(type: string): string {
    return (!isEmpty(type) && has(TYPE_MAP, type)) ? get(TYPE_MAP, type) : undefined;
  }

  /**
   * @ignore
   */
  private loadComponents(): void {
    each(this.config.fields, (field: SdkFormBuilderField) => {
      this.injectComponent(field);
    });
  }

  /**
   * @ignore
   */
  private injectComponent(field: SdkFormBuilderField): void {
    if (isObject(field) && field.visible !== false && has(this.visibleComponents, field.code) === false) {

      let index: number = get(this.indexMap, field.code);

      if (field.type === 'COMBOBOX') {
        field.itemsProviderSubject = new Subject();
      }

      let selector: string = this.getSelectorFromType(field.type);

      if (!isEmpty(selector)) {
        let component = document.createElement(selector) as NgElement & WithProperties<any>;
        component.config$ = of(cloneDeep({
          ...field,
          itemsProviderSubject: field.itemsProviderSubject
        }));


        if (field.type === 'FORM-SECTION' || field.type === 'FORM-GROUP') {
          component.data$ = this.allDataSubj;
        } else {
          component.data$ = this.subjMap[field.code];
        }
        if (field.data != undefined) {
          setTimeout(() => component.data$.next(cloneDeep({ data: field.data })));
        }

        set(this.visibleComponents, field.code, component);

        this.insertChildAtIndex(component, index);

        component.addEventListener('output', this.manageFieldOutput);
        component.addEventListener('outputClick', this.manageOutputClick);
        component.addEventListener('outputInfoBox', this.manageInfoBox);
        component.addEventListener('outputAdvancedModalClose', this.manageOutputAdvancedModalClose);
        component.addEventListener('onBlur', this.manageOnBlur);
        component.addEventListener('onFocus', this.manageOnFocus);
      }
    }
  }

  /**
   * @ignore
   */
  private get formPanel(): HTMLElement {
    return this._formPanel.nativeElement;
  }

  /**
   * Ritorna un evento contenente un risultato che e' una superclasse di SdkFormFieldOutput in base alla tipologia di campo
   * @ignore
   */
  private manageFieldOutput = (event: CustomEvent) => {
    let result: any = event.detail;
    if (isObject(result)) {
      this.configMap[get<any, any>(result, 'code')].file = get(result, 'file');
      this.configMap[get<any, any>(result, 'code')].url = get(result, 'url');
      this.configMap[get<any, any>(result, 'code')].checked = get(result, 'checked');
      this.configMap[get<any, any>(result, 'code')].fileSwitch = get(result, 'fileSwitch');
      this.configMap[get<any, any>(result, 'code')].data = get(result, 'data');
      this.configMap[get<any, any>(result, 'code')].clicked = get(result, 'clicked');
      this.configMap[get<any, any>(result, 'code')].valid = get(result, 'valid');
      this.configMap[get<any, any>(result, 'code')].title = get(result, 'title');
      this.configMap[get<any, any>(result, 'code')].documents = get(result, 'documents');
      this.configMap[get<any, any>(result, 'code')].rows = get(result, 'rows');
      this.configMap[get<any, any>(result, 'code')].cellCode = get(result, 'cellCode');
      this.configMap[get<any, any>(result, 'code')].rowCode = get(result, 'rowCode');
      this.configMap[get<any, any>(result, 'code')].modalContent = get(result, 'modalContent');
      this.configMap[get<any, any>(result, 'code')].clear = get(result, 'clear');
      this.configMap[get<any, any>(result, 'code')].textModalContent = get(result, 'textModalContent');
      this.configMap[get<any, any>(result, 'code')].dynamicField = get(result, 'dynamicField');
      this.configMap[get<any, any>(result, 'code')].fieldGroups = get(result, 'fieldGroups');
      this.configMap[get<any, any>(result, 'code')].fieldSections = get(result, 'fieldSections');
      this.configMap[get<any, any>(result, 'code')].visible = get(result, 'visible');
      this.configMap[get<any, any>(result, 'code')].fileName = get(result, 'fileName');
      this.configMap[get<any, any>(result, 'code')].dynamicFieldValues = get(result, 'dynamicFieldValues');
      this.configMap[get<any, any>(result, 'code')].tipoFile = get(result, 'tipoFile');
      this.configMap[get<any, any>(result, 'code')].collegato = get(result, 'collegato');
      this.configMap[get<any, any>(result, 'code')].userInput = get(result, 'userInput');

      let field: SdkFormBuilderField = this.configMap[get<any, any>(result, 'code')];
      this.outputField$.emit(field);

      let arrFields: Array<SdkFormBuilderField> = [];
      arrFields = values(this.configMap);
      this.markForCheck(() => this.checkVisibleCondition(field));
      this.loadComponents();
      this.checkCampiDipendenti(field);
      this.emitOutput({ fields: arrFields, code: this.config.code } as SdkFormFieldGroupConfiguration);
    }
  }

  /**
   * @ignore
   */
  private checkCampiDipendenti(currentField: SdkFormBuilderField): void {
    each(this.config.fields, (one: SdkFormBuilderField) => {
      if (one.code !== currentField.code &&
        currentField.type === 'COMBOBOX' &&
        !isEmpty(one.campoDipendente) &&
        one.campoDipendente === currentField.code) {
        let data: SdkComboBoxItem = currentField.data;
        if (isObject(data)) {
          one.itemsProviderSubject.next(data.key);
        }
      }
    });
  }


  /**
   * @ignore
   */
  private buildSubjMap(): void {
    this.subjMap = {};
    this.subjMap = reduce(this.config.fields, (map: IDictionary<Subject<any>>, one: SdkFormBuilderField) => {
      map[one.code] = new Subject();
      return map;
    }, {});
  }

  /**
   * @ignore
   */
  private elaborateNewInput(data: SdkFormBuilderInput): void {
    if (isObject(data)) {
      if (has(this.subjMap, data.code)) {
        this.subjMap[data.code].next(data);
      } else {
        this.allDataSubj.next(data);
      }
    }
  }

  /**
   * @ignore
   */
  private manageOutputClick = (event: CustomEvent): void => {
    let result: any = event.detail;
    if (isObject(result)) {
      this.outputClick$.emit(result);
    }
  }

  /**
   * @ignore
   */
  private manageInfoBox = (event: CustomEvent): void => {
    let item: SdkFormBuilderField = event.detail;
    this.outputInfoBox$.emit(item);
  }

  /**
   * @ignore
   */
  private checkVisibleCondition(groupField: SdkFormBuilderField): void {
    let code: string = groupField.code;
    let data: any = groupField.data;

    if (groupField.type === 'COMBOBOX' && data == null) {
      data = {};
    }

    // controllo campi nella sezione
    each(this.config.fields, (one: SdkFormBuilderField, index: number) => {
      if (one.code !== code &&
        (groupField.type === 'COMBOBOX' || groupField.type === 'TEXTBOX' || groupField.type === 'NUMERIC-TEXTBOX' || groupField.type === 'HIDDEN') &&
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
            let dataTipo: string | number = isObject(data) ? get(data, 'key') : data;
            visible = this.verifyVisibleValueCondition(condition, dataTipo, groupField.type, 'and');
          }

          condition.visible = visible;
          set(one.visibleCondition.and, code, condition);
          condition = get(one.visibleCondition.and, code);

          let item: SdkFormBuilderVisibleCondition = find(one.visibleCondition.and, (cond: SdkFormBuilderVisibleCondition, key: string) => {
            return cond.visible === true && key !== code;
          });

          othersVisible = size(one.visibleCondition.and) === 1 || (size(one.visibleCondition.and) > 1 && isObject(item));

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
            let dataTipo: string | number = isObject(data) ? get(data, 'key') : data;
            visible = this.verifyVisibleValueCondition(condition, dataTipo, groupField.type, 'or');
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
        this.config.fields[index] = one;
      }
    });

    each(this.config.fields, (one: SdkFormBuilderField) => {
      if (one.visible === false) {
        try {
          if (has(this.visibleComponents, one.code)) {
            this.formPanel.removeChild(get(this.visibleComponents, one.code));
          }
          delete this.visibleComponents[one.code];
        } catch (err) { }
      }
    });
  }

  /**
   * @ignore
   */
  private verifyVisibleValueCondition(condition: SdkFormBuilderVisibleCondition, actualValue: string | number, type: TSdkFormBuilderFieldType, operationType: string): boolean {
    let visible: boolean = false;

    let valoriPossibili: Array<SdkFormBuilderVisibleValue> = condition.values;
    let visibili: Array<boolean> = new Array();
    each(valoriPossibili, (one: SdkFormBuilderVisibleValue) => {
      let operation: string = one.operation;
      operation = operation === '=' ? '==' : operation;
      let condizioneDaVerificare: string;
      if (type === 'COMBOBOX' || type === 'TEXTBOX' || type === 'HIDDEN') {
        if (one.value == null || actualValue == null) {
          if (one.value != null && actualValue == null) {
            condizioneDaVerificare = actualValue + operation + '"' + one.value + '"';
          } else if (one.value == null && actualValue != null) {
            condizioneDaVerificare = '"' + actualValue + '"' + operation + one.value;
          } else {
            condizioneDaVerificare = actualValue + operation + one.value;
          }
        } else {
          condizioneDaVerificare = '"' + actualValue + '"' + operation + '"' + one.value + '"';
        }
      } else if (type === 'TEXTBOX-MATRIX' || type === 'NUMERIC-TEXTBOX') {
        condizioneDaVerificare = actualValue + operation + one.value;
      }
      let verificata: boolean = (new Function('return ' + condizioneDaVerificare))(); // NOSONAR
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
  private insertChildAtIndex(child: NgElement, index: number): void {
    if (!index) index = 0
    if (index >= this.formPanel.children.length) {
      this.formPanel.appendChild(child)
    } else {
      this.formPanel.insertBefore(child, this.formPanel.children[index])
    }
  }

  /**
   * @ignore
   */
  private registerAllSubject(): void {
    this.addSubscription(this.dataAll$.subscribe((data: SdkFormBuilderInput) => {
      if (data != null) {
        this.allDataSubj.next(data);
      }
    }));
  }

  /**
   * @ignore
   */
  private manageOutputAdvancedModalClose = (event: CustomEvent) => {
    let item: SdkFormBuilderField = event.detail;
    this.outputAdvancedModalClose$.emit(item);
  }

  /**
   * @ignore
   */
  private manageOnBlur = (event: CustomEvent) => {
    let item: SdkFormBuilderField = event.detail;
    this.onBlur$.emit(item);
  }

  /**
   * @ignore
   */
  private manageOnFocus = (event: CustomEvent) => {
    let item: SdkFormBuilderField = event.detail;
    this.onFocus$.emit(item);
  }

  // #endregion

  // #region Public

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

  // #endregion

}