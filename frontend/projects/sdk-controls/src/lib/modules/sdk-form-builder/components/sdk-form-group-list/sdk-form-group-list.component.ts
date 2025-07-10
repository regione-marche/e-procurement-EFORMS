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
import { SdkFormBuilderField, SdkFormBuilderInput, SdkFormFieldGroupConfiguration } from '@maggioli/sdk-controls';
import { cloneDeep, find, isEmpty, isObject, isUndefined, join, reduce, size } from 'lodash-es';
import { Observable, of, Subject } from 'rxjs';

/**
 * Componente per renderizzare un form group
 */
@Component({
  selector: 'sdk-form-group-list',
  templateUrl: './sdk-form-group-list.component.html',
  styleUrls: ['./sdk-form-group-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkFormGroupListComponent extends SdkAbstractComponent<SdkFormBuilderField, SdkFormBuilderInput, SdkFormBuilderField> implements OnInit, AfterViewInit, OnDestroy {

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
  public config: SdkFormBuilderField;

  /**
   * @ignore
   */
  public subjMap: IDictionary<Subject<any>> = {};

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
    if (isObject(config)) {
      this.markForCheck(() => {
        this.config = config;
        if (isUndefined(this.config.fieldGroups)) {
          this.config.fieldGroups = new Array();
        }
        if (isUndefined(this.config.minGroupsNumber)) {
          this.config.minGroupsNumber = 1;
        }

        this.buildSubjMap();

        setTimeout(() => {
          this.markForCheck(() => {
            let allowEmptyPanel: boolean = true;
            if (this.config.addEmptyPanel != undefined && this.config.fieldGroups.length > 0) {
              allowEmptyPanel = this.config.addEmptyPanel;
            }
            if (this.config.minGroupsNumber > 0 && allowEmptyPanel) {
              for (let i = 0; i < this.config.minGroupsNumber; i++) {
                const uniqueCode: string = this.addSinglePanel();
                this.addPanel$.emit(uniqueCode);
              }
            }
            if (this.config.showFirst && isEmpty(this.config.fieldGroups)) {
              const uniqueCode: string = this.addSinglePanel();
              this.addPanel$.emit(uniqueCode);
            }

            this.emitOutput(this.config);
            this.isReady = true;
          })
        });
      });
    }
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
  private elaborateNewInput(data: SdkFormBuilderInput): void {
    if (isObject(data)) {
      let groupCode: string = data.groupCode;
      if (!isEmpty(groupCode)) {
        let formGroup: SdkFormFieldGroupConfiguration = find(this.config.fieldGroups, (one: SdkFormFieldGroupConfiguration) => one.code === groupCode);
        if (isObject(formGroup)) {
          this.subjMap[formGroup.code].next(data);
        } else {
          this.subjMap['all'].next(data);
        }
      }
    }
  }

  /**
   * @ignore
   */
  private addSinglePanel(): string {
    let fields: Array<SdkFormBuilderField> = cloneDeep(this.config.defaultFormGroupFields);
    const uniqueCode: string = this.generateUniqueCode();
    let config: SdkFormFieldGroupConfiguration = {
      code: uniqueCode,
      fields
    };
    this.subjMap[config.code] = new Subject();
    this.config.fieldGroups.push(config);
    return uniqueCode;
  }

  /**
   * @ignore
   */
  private buildSubjMap(): void {
    this.subjMap = reduce(this.config.fieldGroups, (map: IDictionary<Subject<any>>, one: SdkFormFieldGroupConfiguration) => {
      map[one.code] = new Subject();
      return map;
    }, {});
    this.subjMap['all'] = new Subject();
  }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public getFormGroupObs(item: SdkFormFieldGroupConfiguration): Observable<SdkFormFieldGroupConfiguration> {
    return of(item);
  }

  /**
   * @ignore
   */
  public manageFormGroupUpdate(formGroup: SdkFormFieldGroupConfiguration, index: number): void {
    if (isObject(formGroup)) {
      this.config.fieldGroups[index] = formGroup;
      this.emitOutput(this.config);
    }
  }

  /**
   * @ignore
   */
  public manageFormGroupItemClick(field: any, index: number): void {
    if (isObject(field)) {
      this.outputClick$.emit({ ...field });
    }
  }

  /**
   * @ignore
   */
  public addPanel(): void {
    this.markForCheck(() => {
      const uniqueCode: string = this.addSinglePanel();
      this.emitOutput(this.config);
      this.addPanel$.emit(uniqueCode);
    });
  }

  /**
   * @ignore
   */
  public removePanel(index: number): void {
    this.markForCheck(() => {
      if ((this.config.maxGroupsNumber > -1 && size(this.config.fieldGroups) > this.config.minGroupsNumber && isObject(this.config.fieldGroups[index]))
        || this.config.showFirst) {

        let group: SdkFormFieldGroupConfiguration = this.config.fieldGroups[index];
        const groupCode: string = group.code;
        this.subjMap[groupCode].complete();
        delete this.subjMap[groupCode];

        this.config.fieldGroups.splice(index, 1);
        this.emitOutput(this.config);
        this.removePanel$.emit(groupCode);
      }
    });
  }

  /**
   * @ignore
   */
  public trackByCode(index: number, item: SdkFormBuilderField): string {
    return item.code;
  }

  /**
   * @ignore 
   */
  public manageOutputField(field: SdkFormBuilderField, index: number): void {
    let groupCode: string = this.config.fieldGroups[index].code;
    this.outputField$.emit({
      ...field,
      groupCode
    });
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
  public getGroupClasses(config: SdkFormBuilderField, empty: boolean = false): string {
    let classes: Array<string> = ['sdk-form-group-list'];

    if (empty === true) {
      classes.push('empty');
    }

    if (config.groupClass != null) {
      classes = [...classes, ...config.groupClass];
    }
    let stringClasses = join(classes, ' ');
    stringClasses = stringClasses.trim();
    return stringClasses;
  }

  /**
   * @ignore
   */
  public manageOutputAdvancedModalClose(event: SdkFormBuilderField, index: number) {
    let groupCode: string = this.config.fieldGroups[index].code;
    this.outputAdvancedModalClose$.emit({
      ...event,
      groupCode
    });
  }

  /**
   * @ignore
   */
  public manageOnBlur(event: SdkFormBuilderField, index: number) {
    let groupCode: string = this.config.fieldGroups[index].code;
    this.onBlur$.emit({
      ...event,
      groupCode
    });
  }

  /**
   * @ignore
   */
  public manageOnFocus(event: SdkFormBuilderField, index: number) {
    let groupCode: string = this.config.fieldGroups[index].code;
    this.onFocus$.emit({
      ...event,
      groupCode
    });
  }

  // #endregion

}