import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgElement, WithProperties } from '@angular/elements';
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';
import { cloneDeep, each, get, has, isEmpty, isObject, reduce, values } from 'lodash-es';
import { of, Subject } from 'rxjs';

import { SdkFormBuilderConfiguration, SdkFormBuilderField, SdkFormBuilderInput } from '../../sdk-form-builder.domain';
import { TYPE_MAP } from '../../sdk-form-builder.elements';

/**
 * Componente per la creazione di un form builder
 */
@Component({
  selector: 'sdk-form-builder',
  templateUrl: './sdk-form-builder.component.html',
  styleUrls: ['./sdk-form-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkFormBuilderComponent extends SdkAbstractComponent<SdkFormBuilderConfiguration, SdkFormBuilderInput, SdkFormBuilderConfiguration> implements OnInit, AfterViewInit, OnDestroy {

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
  @ViewChild('formPanel') _formPanel: ElementRef;

  /**
   * @ignore
   */
  private initialized: boolean = false;

  /**
   * @ignore
   */
  public config: SdkFormBuilderConfiguration;

  /**
   * @ignore
   */
  private configMap: IDictionary<SdkFormBuilderField>;

  /**
   * @ignore
   */
  private subjMap: IDictionary<Subject<SdkFormBuilderInput>>;

  /**
   * @ignore
   */
  private allDataSubj: Subject<SdkFormBuilderInput> = new Subject();

  /**
   * @ignore
   */
  public inputFieldVisibleUpdate: Subject<SdkFormBuilderField> = new Subject();

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
  protected onAfterViewInit(): void {
    this.initialized = true;
    this.buildForm();
  }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onOutput(_data: SdkFormBuilderConfiguration): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkFormBuilderConfiguration): void {
    this.markForCheck(() => {
      this.config = config;
      if (this.initialized === true) {
        this.buildForm();
      }
    });
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
    if (isObject(this.config)) {
      if (isEmpty(this.config.fields)) {
        this.cleanTemplate();
      } else {
        this.cleanTemplate();
        this.buildConfigMap();
        each(this.config.fields, (field: SdkFormBuilderField) => {
          this.injectComponent(field);
        });
      }
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
    this.subjMap = {};
    this.subjMap = reduce(this.config.fields, (map: IDictionary<Subject<any>>, one: SdkFormBuilderField) => {
      map[one.code] = new Subject();
      return map;
    }, {});
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
  private injectComponent(field: SdkFormBuilderField): void {
    if (isObject(field)) {

      if (field.type === 'COMBOBOX' && field.itemsProviderSubject == null) {
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
        component.inputFieldVisibleUpdate$ = this.inputFieldVisibleUpdate;
        this.formPanel.appendChild(component);
        component.addEventListener('output', this.manageFieldOutput);
        component.addEventListener('outputClick', this.manageFieldOutputClick);
        component.addEventListener('outputFieldVisibleUpdate', this.manageFieldVisibleUpdate)
        component.addEventListener('outputField', this.manageSingleFieldOutput);
        component.addEventListener('addPanel', this.manageAddPanel);
        component.addEventListener('removePanel', this.manageRemovePanel);
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
    let result: SdkFormBuilderField = event.detail;
    if (isObject(result)) {
      if (get(result, 'type') === 'FORM-GROUP' || get(result, 'type') === 'FORM-SECTION') {
        this.configMap[get(result, 'code')] = result;
      } else {
        this.configMap[get(result, 'code')].file = get(result, 'file');
        this.configMap[get(result, 'code')].url = get(result, 'url');
        this.configMap[get(result, 'code')].checked = get(result, 'checked');
        this.configMap[get(result, 'code')].fileSwitch = get(result, 'fileSwitch');
        this.configMap[get(result, 'code')].data = get(result, 'data');
        this.configMap[get(result, 'code')].valid = get(result, 'valid');
        this.configMap[get(result, 'code')].title = get(result, 'title');
        this.configMap[get(result, 'code')].documents = get(result, 'documents');
        this.configMap[get(result, 'code')].rows = get(result, 'rows');
        this.configMap[get(result, 'code')].cellCode = get(result, 'cellCode');
        this.configMap[get(result, 'code')].rowCode = get(result, 'rowCode');
        this.configMap[get(result, 'code')].modalContent = get(result, 'modalContent');
        this.configMap[get(result, 'code')].clear = get(result, 'clear');
        this.configMap[get(result, 'code')].textModalContent = get(result, 'textModalContent');
        this.configMap[get(result, 'code')].dynamicField = get(result, 'dynamicField');
        this.configMap[get(result, 'code')].fileName = get(result, 'fileName');
        this.configMap[get(result, 'code')].dynamicFieldValues = get(result, 'dynamicFieldValues');
        this.configMap[get(result, 'code')].tipoFile = get(result, 'tipoFile');
        this.configMap[get(result, 'code')].collegato = get(result, 'collegato');
        this.configMap[get(result, 'code')].userInput = get(result, 'userInput');

        let field: SdkFormBuilderField = this.configMap[get(result, 'code')];
        this.outputField$.emit(field);
      }

      let arrFields: Array<SdkFormBuilderField> = [];
      arrFields = values(this.configMap);
      this.emitOutput({ fields: arrFields } as SdkFormBuilderConfiguration);
    }
  }

  /**
   * @ignore
   */
  private manageFieldOutputClick = (event: CustomEvent) => {
    let result: any = event.detail;
    if (isObject(result)) {
      this.outputClick$.emit(result);
    }
  }

  /**
   * @ignore
   */
  private manageFieldVisibleUpdate = (event: CustomEvent) => {
    let result: any = event.detail;
    this.inputFieldVisibleUpdate.next(result);
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
  private manageSingleFieldOutput = (event: CustomEvent): void => {
    let field: SdkFormBuilderField = event.detail;
    this.outputField$.emit(field);
  }

  /**
   * @ignore 
   */
  private manageAddPanel = (event: CustomEvent): void => {
    let add: string = event.detail;
    this.addPanel$.emit(add);
  }

  /**
   * @ignore 
   */
  private manageRemovePanel = (event: CustomEvent): void => {
    let remove: string = event.detail;
    this.removePanel$.emit(remove);
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

}
