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
import { NgElement, WithProperties } from '@angular/elements';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { cloneDeep, get, has, isEmpty, isObject, isUndefined } from 'lodash-es';
import { Observable, of, Subject } from 'rxjs';
import { SdkAutocompleteAdvancedBaseFilterItem, SdkTextboxOutput } from '../../../sdk-form/sdk-form.domain';

import { SdkFormBuilderField, SdkFormBuilderInput } from '../../sdk-form-builder.domain';
import { TYPE_MAP } from '../../sdk-form-builder.elements';

/**
 * Componente per renderizzare un singolo componente form section
 */
@Component({
  selector: 'sdk-form-section',
  templateUrl: './sdk-form-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkFormSectionComponent extends SdkAbstractComponent<SdkFormBuilderField, SdkFormBuilderInput, SdkFormBuilderField> implements OnInit, AfterViewInit, OnDestroy {


  // #region Variables

  /**
   * @ignore
   */
  @Input('inputBaseFilter') public inputBaseFilter$: Observable<SdkAutocompleteAdvancedBaseFilterItem>;

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
  @Output('outputBaseFilter') public outputBaseFilter$: EventEmitter<SdkAutocompleteAdvancedBaseFilterItem | SdkTextboxOutput> = new EventEmitter();

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
  public config: SdkFormBuilderField;

  /**
   * @ignore
   */
  private dataSubj: Subject<any> = new Subject();

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
    this.buildForm();
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
  }

  /**
   * @ignore
   */
  protected onData(data: SdkFormBuilderInput): void {
    this.dataSubj.next(data);
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
      this.cleanTemplate();
      this.injectComponent(this.config);
    }
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

      if (field.type === 'COMBOBOX' && isUndefined(field.itemsProviderSubject)) {
        field.itemsProviderSubject = new Subject();
      }

      let selector: string = this.getSelectorFromType(field.type);

      if (!isEmpty(selector)) {
        let component = document.createElement(selector) as NgElement & WithProperties<any>;
        component.config$ = of({
          ...field,
          itemsProviderSubject: field.itemsProviderSubject
        });
        component.data$ = this.dataSubj;
        if (field.data != undefined) {
          setTimeout(() => component.data$.next(cloneDeep({ data: field.data })));
        }

        if (field.type === 'AUTOCOMPLETE' && field.advanced === true) {
          component.inputBaseFilter$ = this.inputBaseFilter$;
        }

        this.formPanel.appendChild(component);
        component.addEventListener('output', this.manageFieldOutput);
        component.addEventListener('outputClick', this.manageFieldOutputClick);
        component.addEventListener('outputField', this.manageSingleFieldOutput);
        component.addEventListener('addPanel', this.manageAddPanel);
        component.addEventListener('removePanel', this.manageRemovePanel);
        component.addEventListener('outputInfoBox', this.manageInfoBox);
        component.addEventListener('outputBaseFilter', this.manageOutputBaseFilter);
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
      this.config.file = get(result, 'file');
      this.config.url = get(result, 'url');
      this.config.checked = get(result, 'checked');
      this.config.fileSwitch = get(result, 'fileSwitch');
      this.config.data = get(result, 'data');
      this.config.clicked = get(result, 'clicked');
      this.config.valid = get(result, 'valid');
      this.config.title = get(result, 'title');
      this.config.documents = get(result, 'documents');
      this.config.rows = get(result, 'rows');
      this.config.cellCode = get(result, 'cellCode');
      this.config.rowCode = get(result, 'rowCode');
      this.config.modalContent = get(result, 'modalContent');
      this.config.clear = get(result, 'clear');
      this.config.textModalContent = get(result, 'textModalContent');
      this.config.dynamicField = get(result, 'dynamicField');
      this.config.fileName = get(result, 'fileName');
      this.config.dynamicFieldValues = get(result, 'dynamicFieldValues');
      this.config.tipoFile = get(result, 'tipoFile');
      this.config.collegato = get(result, 'collegato');
      this.config.userInput = get(result, 'userInput');

      if (this.config.type !== 'FORM-GROUP' && this.config.type !== 'FORM-SECTION') {
        this.outputField$.emit({ ...this.config });
      }

      if (this.config.type === 'FORM-GROUP') {
        this.config = cloneDeep(result as SdkFormBuilderField);
        this.emitOutput({ ...this.config } as SdkFormBuilderField);
      } else {
        this.emitOutput({ ...this.config } as SdkFormBuilderField);
      }
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
  private manageOutputBaseFilter = (event: CustomEvent): void => {
    let item: SdkAutocompleteAdvancedBaseFilterItem | SdkTextboxOutput = event.detail;
    this.outputBaseFilter$.emit(item);
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