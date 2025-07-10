import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ControlContainer, FormArray, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IDictionary } from '@maggioli/sdk-commons';
import { cloneDeep, isObject } from 'lodash-es';
import { TreeNode } from 'primeng/api';
import { TreeNodeSelectEvent } from 'primeng/tree';
import { Subscription } from 'rxjs';
import { Constants, I18N, idFromFieldIdAndInstanceNumber } from '../../app.constants';
import { AbstractNoticeComponent } from '../../components/abstract-notice.component';
import { ExtendedFormControl, IComboboxOption, InvalidField } from '../../models/app.model';
import { ApiService } from '../../services/api.service';
import { CacheService } from '../../services/cache.service';
import { DataService } from '../../services/data.service';
import { FormService } from '../../services/form.service';
import { DynamicFormElementUtils } from './dynamic-form-element.utils';

@Component({
  selector: 'app-dynamic-form-element',
  templateUrl: './dynamic-form-element.component.html',
  styleUrl: './dynamic-form-element.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DynamicFormElementUtils]
})
export class DynamicFormElementComponent extends AbstractNoticeComponent implements OnInit, AfterViewInit, OnDestroy {
  private _cacheService: CacheService = inject(CacheService);
  private _dataService: DataService = inject(DataService);
  private _apiService: ApiService = inject(ApiService);
  private _dynamicFormElementUtils: DynamicFormElementUtils = inject(DynamicFormElementUtils);

  @ViewChild('inputElem') public inputElemRef: ElementRef;
  // EFORMS-80
  //@HostBinding('class.style-hidden') public styleHidden: boolean = false;
  @HostBinding('class.input-field') public inputField: boolean = false;

  @Input() content!: any;
  @Input() form!: FormGroup | ExtendedFormControl<InvalidField>;
  @Input() originalFormReactiveContent: any;
  // indice per gruppi ripetibili
  @Input('editorCount') public editorCountIndex: number = 0;
  // Livello di profondita' della form
  @Input('level') public editorLevel: number;
  // Mostra solo campi required and suggested
  @Input('showRequiredOrSuggestedOnly')
  public showRequiredOrSuggestedOnly: boolean = true;

  @Output('addElement') public addElement$: EventEmitter<FormGroup | ExtendedFormControl<InvalidField>> =
    new EventEmitter();
  @Output('removeElement') public removeElement$: EventEmitter<number> = new EventEmitter();
  @Output('visibilityChange') public visibilityChange$: EventEmitter<boolean> = new EventEmitter();

  private _id: string;
  private _formOriginal: FormGroup | ExtendedFormControl<InvalidField>;
  private _formService: FormService = inject(FormService);
  private _idRefSubscription: Subscription;
  private _showRequiredOrSuggestedOnlySubscription: Subscription;
  // Riferimento all'idSchema generato in caso di campo id
  private _idFieldScheme: string;
  private _searchResult: any = null;
  private _action: any;
  private _activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  public classes: string;
  public field: any;
  public mandatory: boolean = false;
  public shouldShowAddandRemoveButtons: boolean = true;

  public _isVisible: boolean = true; // visibilità del componente attuale
  // stato di visibilità dei componenti figli (chiave è il child.id)
  public childrenVisibilityMap: Map<string, boolean | boolean[]> = new Map();

  //TreeSelect Node
  public nodes: TreeNode<any>[];

  public dropdownOptions: Array<any> = [];

  // #region Hooks

  override ngOnInit(): void {
    super.ngOnInit();
    if (this.content != null) {
      if (this._formService.shouldShow == false) {
        this.form.disable();
      }
      this._action = this._activatedRoute.snapshot.queryParamMap.get('action');
      this.id = this.content?.id;

      this.content.editorCount = this.editorCount;

      this.loadField();
      this.loadCssClasses();

      if (this.isField) {
        this.mandatory = this.field.mandatory;
        this.inputField = true;
      }

      if (this.isRepeatable) {
        // se l'elemento e' ripetibile mi salvo una copia del FormGroup intonsa per l'eventuale aggiunta futura
        this._formOriginal = cloneDeep(this.form);
      }

      // EFORMS-92
      if (this.isIdSchemeGeneratorField) {
        this.content.displayType = 'READONLY-TEXT';
      }

      this._formService.shouldShowAddandRemoveButtons$.subscribe((value) => {
        this.shouldShowAddandRemoveButtons = value;
      });

      // Inizializza lo stato di visibilità dei figli: all'inizio tutti visibili
      if (this.content.content != null) {
        this.content.content.forEach((child) => {
          // figli ripetibili
          if (child._repeatable) {
            this.childrenVisibilityMap.set(child.id, new Array(this.getDynamicFormArray(child.id).length).fill(true));
          }
          // figli non ripetibili
          else {
            this.childrenVisibilityMap.set(child.id, true);
          }
        });
      }

      this.updateVisibility();
    }
  }

  public ngAfterViewInit(): void {
    if (this.isField) {
      this.elaborateType();
      this._idRefSubscription = this._formService.idFieldMap$.subscribe((idFieldMap: IDictionary<Array<string>>) => {
        this.elaborateIdSchemesRef(idFieldMap);
      });

      // Pattern (non lo inserisco se il campo e' date o time dato che l'input html contiene gia' una maschera per l'inserimento del dato)
      if (this.inputElem != null && this.field?.pattern && this.field?.type != 'date' && this.field?.type != 'time') {
        this.inputElem.setAttribute('pattern', this.field?.pattern.value);
      }
      if (this.inputElem.id == '' || this.inputElem.id == null) {
        this.inputElem.id = this.componentRandomId;
      }
    }

    // Sottoscrizione al toggle per la visibilità dei campi
    this._showRequiredOrSuggestedOnlySubscription = this._formService.showRequiredOrSuggestedOnly$.subscribe(
      (toggleValue: boolean) => {
        this.showRequiredOrSuggestedOnly = toggleValue;
        setTimeout(() => {
          this.updateVisibility();
        });
      }
    );
  }

  public ngOnDestroy(): void {
    if (this._idRefSubscription) this._idRefSubscription.unsubscribe();
    if (this._showRequiredOrSuggestedOnlySubscription) this._showRequiredOrSuggestedOnlySubscription.unsubscribe();
  }

  // #endregion

  // #region Private

  private updateVisibility(): void {
    // Valutazione della visibilità "locale" del campo
    let ownVisibility = true;
    if (this.showRequiredOrSuggestedOnly) {
      ownVisibility = this.isRequiredOrSuggested;
    }

    // Conta quanti componenti figli sono visibili
    const visibleChildrenCount = this.countVisibleChildren();

    // il componente è visibile se:
    // - è required or suggested OPPURE
    // - ha dei figli e almeno uno di essi è visibile
    this.isVisible = ownVisibility || visibleChildrenCount > 0;

    // Emette l'evento di visibilità al componente padre
    this.visibilityChange$.emit(this.isVisible);
  }

  private countVisibleChildren(): number {
    return Array.from(this.childrenVisibilityMap.values()).reduce(
      (acc, value) => acc + (typeof value === 'boolean' ? (value ? 1 : 0) : value.filter((v) => v).length),
      0
    );
  }

  private loadCssClasses(): void {
    let classes: Array<string> = [
      'notice-element-container',
      'container-fluid',
      'justify-content-between',
      'align-items-center',
      'pt-1',
      'pb-1'
    ];

    // EFORMS-92
    if (this.content.hidden && !this.isIdSchemeGeneratorField) {
      classes.push('notice-content-hidden');
    }

    if (this.content.readOnly) {
      classes.push('read-only');
    }

    if (!this.isField) {
      classes.push('p-3');
    }

    this.classes = classes.join(' ');
  }

  private loadField(): void {
    this.field = this._dataService.basicMetaDataFields[this.id];
  }

  /**
   * Carica il valore JSON per l'albero e lo imposta nel form
   */
  private loadJsonValueForTree() {
    // Cerca il nodo nell'albero utilizzando il valore JSON
    this._searchResult = this.searchNode(this.nodes, this.form.value);

    // Imposta il valore trovato nel form
    this.form.patchValue(this._searchResult);
  }

  /**
   * Ricerca un nodo nell'albero dato un termine di ricerca
   * @param nodes Lista dei nodi dell'albero
   * @param searchTerm Termine di ricerca
   * @returns Il nodo trovato, o null se non trovato
   */
  private searchNode(nodes: TreeNode[], searchTerm: string): TreeNode {
    // Itera su ciascun nodo nell'elenco dei nodi
    for (let node of nodes) {
      // Se il nodo corrisponde al termine di ricerca, restituisce il nodo
      if (node.key === searchTerm) {
        return node;
        // Altrimenti, se il nodo ha figli, cerca ricorsivamente nei figli
      } else if (node.children) {
        const found = this.searchNode(node.children, searchTerm);
        if (found) {
          return found;
        }
      }
    }
    // Restituisce null se il nodo non viene trovato
    return null;
  }

  /**
   * Carica i nodi per l'albero, utilizzando i dati dalla cache se disponibili
   * @param cacheKey Chiave della cache
   */
  private loadNodes(cacheKey: any): void {
    // Recupera i nodi dalla cache
    const cachedNodes = this._cacheService.getItem<Array<TreeNode>>(
      cacheKey,
      this._dataService.selectedLang,
      this._dataService.selectedSdkVersion
    );

    if (cachedNodes) {
      // Imposta i nodi recuperati
      this.nodes = cachedNodes;
      this.nodePreselect();
    } else {
      // Altrimenti, carica i nodi dinamicamente
      this._dynamicFormElementUtils
        .codeInputForTreeSelect(this.content, this.field, this.form as ExtendedFormControl<InvalidField>)
        .subscribe((nodes: TreeNode[]) => {
          this.nodes = nodes;

          this._cacheService.setItem<Array<TreeNode>>(
            cacheKey,
            this._dataService.selectedLang,
            nodes,
            this._dataService.selectedSdkVersion
          );
          this.nodePreselect();
        });
    }
  }

  private nodePreselect(): void {
    if (this.form.value != null && !isObject(this.form.value)) {
      this.loadJsonValueForTree();
    }
  }

  /**
   * EFORMS-88
   */
  private loadCombo(): void {
    this._dynamicFormElementUtils
      .dropdownInput(this.inputElem, this.content, this.field, this.form as ExtendedFormControl<InvalidField>)
      .subscribe((dropdownOptions) => {
        if (dropdownOptions != null) {
          this.dropdownOptions = dropdownOptions;
        }
        // Default values
        // BT-01-notice
        if (this.content.id == Constants.StandardIdentifiers.LEGAL_BASIS_TYPE_FIELD) {
          this.form.patchValue(this._dataService.selectedNoticeSubType['legalBasis']);
          this.form.disable();
        }
        // BT-26(m)-Procedure and BT-26(m)-Lot
        else if (
          this.content.id == Constants.StandardIdentifiers.CPV_PROCEDURE_FIELD ||
          this.content.id == Constants.StandardIdentifiers.CPV_LOT_FIELD
        ) {
          this.form.patchValue('cpv');
          this.form.disable();
        }
        //popola con italiano la le combobox relative alla lingua e le mette readonly
        else if (this.content.id.endsWith('-Language')) {
          const selectedLangIso6393 = I18N.Iso6391ToIso6393Map[this._dataService.selectedLang];
          this.form.patchValue(selectedLangIso6393);
          this.form.disable();
        }
        //popola con currency euro la le combobox relative alla valuta e le mette readonly
        else if (this.content.id.endsWith('-Currency')) {
          this.form.patchValue(this._dataService.defaultCurrency);
          this.form.disable();
        } else if (this.form.value != null) {
          this._searchResult = this.searchDropdownOptions(this.form.value);
          this.form.patchValue(this._searchResult.key);
        }
      });
  }

  private searchDropdownOptions(value: string) {
    return this.dropdownOptions.find((option) => {
      return option.key == value;
    });
  }

  /**
   * Elabora il tipo di input e chiama il metodo appropriato per gestirlo
   */
  private elaborateType(): void {
    // Verifica il tipo di campo
    switch (this.field?.type) {
      case 'amount': {
        this._dynamicFormElementUtils.amountInput(this.inputElem, this.form as ExtendedFormControl<InvalidField>);
        break;
      }
      case 'code': {
        if (this.field.codeList.value.type == 'hierarchical') {
          this.loadNodes(this.field.codeList.value.id);
        } else {
          this.loadCombo();
        }
        break;
      }
      case 'date': {
        this._dynamicFormElementUtils.dateInput(this.inputElem, this.form as ExtendedFormControl<InvalidField>);
        break;
      }
      case 'email': {
        this._dynamicFormElementUtils.emailInput(
          this.inputElem,
          this.field,
          this.form as ExtendedFormControl<InvalidField>
        );
        break;
      }
      case 'id': {
        this._idFieldScheme = this._dynamicFormElementUtils.idInput(
          this.inputElem,
          this.content,
          this.form as unknown as ExtendedFormControl<InvalidField>
        );
        break;
      }
      case 'integer': {
        this._dynamicFormElementUtils.integerInput(this.inputElem, this.form as ExtendedFormControl<InvalidField>);
        break;
      }
      case 'measure': {
        this._dynamicFormElementUtils.measureInput();
        break;
      }
      case 'number': {
        this._dynamicFormElementUtils.numberInput(this.inputElem, this.form as ExtendedFormControl<InvalidField>);
        break;
      }
      case 'phone': {
        this._dynamicFormElementUtils.phoneInput(
          this.inputElem,
          this.field,
          this.form as ExtendedFormControl<InvalidField>
        );
        break;
      }
      case 'text': {
        this._dynamicFormElementUtils.textInput(
          this.inputElem,
          this.field,
          this.form as ExtendedFormControl<InvalidField>
        );
        break;
      }
      case 'text-multilingual': {
        this._dynamicFormElementUtils.textMultilingualInput(
          this.inputElem,
          this.field,
          this.form as ExtendedFormControl<InvalidField>
        );
        break;
      }
      case 'time': {
        this._dynamicFormElementUtils.timeInput(this.inputElem, this.form as ExtendedFormControl<InvalidField>);
        break;
      }
      case 'url': {
        this._dynamicFormElementUtils.urlInput(
          this.inputElem,
          this.field,
          this.form as ExtendedFormControl<InvalidField>
        );
        break;
      }
      case 'indicator': {
        if (this.form.value != null) {
          this.form.patchValue(this.form.value);
        }
        break;
      }
      default:
        break;
    }
  }

  private elaborateIdSchemesRef(idFieldMap: IDictionary<Array<string>>): void {
    if (idFieldMap && this.content._idSchemes) {
      const idSchemes: Array<string> = this.content._idSchemes;
      let values: Array<string> = idSchemes
        .filter((idScheme) => idScheme != null && idFieldMap[idScheme] != null)
        .flatMap((idScheme) => idFieldMap[idScheme]);

      let comboValues: Array<IComboboxOption> = [];

      (this.content._idSchemes as Array<string>).forEach((idScheme: string) => {
        if (idScheme == 'ORG') {
          // Vado ad aggiungere ulteriori informazioni ai valori mostrati nella combobox,
          // vedi issue EFORMS-11
          Object.keys(this._formService.dictionaryOfMultipleOrgsFormControl).forEach((key) => {
            values.forEach((value, index) => {
              if (key == value) {
                let name = '';
                if (
                  this._formService.dictionaryOfMultipleOrgsFormControl[key].value != '' &&
                  this._formService.dictionaryOfMultipleOrgsFormControl[key].value != null
                ) {
                  name = ', ' + this._formService.dictionaryOfMultipleOrgsFormControl[key].value;
                }

                comboValues[index] = {
                  key: value,
                  label: value + name
                };
              }
            });
          });
        } else if (idScheme == 'TPO') {
          // Vado ad aggiungere ulteriori informazioni ai valori mostrati nella combobox,
          // vedi issue EFORMS-70
          Object.keys(this._formService.dictionaryOfMultipleTposFormControl).forEach((key) => {
            values.forEach((value, index) => {
              if (key == value) {
                let name = '';
                if (
                  this._formService.dictionaryOfMultipleTposFormControl[key].value != '' &&
                  this._formService.dictionaryOfMultipleTposFormControl[key].value != null
                ) {
                  name = ', ' + this._formService.dictionaryOfMultipleTposFormControl[key].value;
                }

                comboValues[index] = {
                  key: value,
                  label: value + name
                };
              }
            });
          });
        } else {
          comboValues.push(
            ...values
              .filter((elem: string) => !(elem.startsWith('ORG') || elem.startsWith('TPO')))
              .map((elem: string) => {
                return {
                  key: elem,
                  label: elem
                };
              })
          );
        }
      });

      //EFORMS-88
      if (comboValues.length > 0) {
        this.dropdownOptions = cloneDeep(comboValues);
        if (this.form.value != null && !isObject(this.form.value)) {
          this._searchResult = this.searchDropdownOptions(this.form.value);
          this.form.patchValue(this._searchResult.key);
        }
      }

      // Reset combo
      // if (this.inputElem != null && (this.inputElem as HTMLSelectElement).options != null) {
      //   while ((this.inputElem as HTMLSelectElement).options.length) (this.inputElem as HTMLSelectElement).remove(0);
      // }
      // this._dynamicFormElementUtils.idRefInput(
      //   this.inputElem,
      //   this.content,
      //   comboValues,
      //   this.form as ExtendedFormControl<InvalidField>
      // );
    }
  }

  private removeIdFieldSchemas(formGroup: FormGroup | FormArray): void {
    // Itera su tutti i controlli del FormGroup o FormArray
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      // Verifica se il controllo è un FormGroup o FormArray
      if (control instanceof FormGroup || control instanceof FormArray) {
        // Se sì, applica ricorsivamente la funzione per gestire i controlli annidati
        this.removeIdFieldSchemas(control);
      } else if (control instanceof FormControl) {
        // Se il controllo è un FormControl e ha un valore
        if (control.value != null) {
          // Ottiene i metadati del campo dal servizio _dataService
          let field: any = this._dataService.basicMetaDataFields[key];

          // Verifica se il campo esiste ed è di tipo 'id'
          if (field && field.type == 'id') {
            // Rimuove il campo ID utilizzando il servizio _enoticesFormService
            this._formService.removeIdField(field.idScheme, control.value);
          }
        }
      }
    });
  }

  private generateFieldDescriptionTranslationKey(): string {
    return 'field|description|' + this.id;
  }

  // #endregion

  // #region Public

  public getOriginalFormReactiveContent(id: string) {
    if (this._action == 'NEW') {
      return;
    }
    let x;
    if (
      this.originalFormReactiveContent instanceof FormArray ||
      this.originalFormReactiveContent instanceof FormGroup
    ) {
      x = this.originalFormReactiveContent.get(id);
    } else if (this.originalFormReactiveContent instanceof FormControl) {
      x = this.originalFormReactiveContent;
    }

    if (x instanceof FormControl || x instanceof FormGroup) {
      return x;
    }
    if (x instanceof FormArray) {
      //questo mi permette di tenere solo una copia degli elementi ripetibili, cosi quando aggiungo un elemento posso utilizzare questo
      return x.controls[0];
    }
  }

  public getDynamicFormArray(id: string): FormArray {
    return this.form.get(id) as FormArray;
  }

  public addElement(_event: any): void {
    // if (this._action == 'NEW') {
    //   this.addElement$.emit(this._formOriginal);
    // } else if (this._action == 'EDIT') {
    //   this.addElement$.emit(this.originalFormReactiveContent);
    // }

    this.addElement$.emit(this._formOriginal);

    if ((this.form as any)?.controls['GR-Company']?.controls['BT-500-Organization-Company']) {
      this._formService.addFormORG(
        (this.form as any)._parent?.controls[(this.form as any)._parent?.controls.length - 1]?.controls['GR-Company']
          ?.controls['BT-500-Organization-Company'],

        (this.content as any)._idScheme
      );
      //quando aggiungo una org si aggiunge un tpo
      this._formService.addFormTPO(
        (this.form as any)._parent?.controls[(this.form as any)._parent?.controls.length - 1]?.controls[
          'GR-Touch-Point'
        ].controls[0].controls['BT-500-Organization-TouchPoint'],
        'TPO'
      );
    } else if ((this.form as any)?.controls['BT-500-Organization-TouchPoint']) {
      this._formService.addFormTPO(
        (this.form as any)._parent?.controls[(this.form as any)._parent?.controls.length - 1]?.controls[
          'BT-500-Organization-TouchPoint'
        ],

        (this.content as any)._idScheme
      );
    }
  }

  public removeElement(_event: any): void {
    this.removeElement$.emit(this.editorCountIndex);

    if ((this.form as any)?.controls['GR-Company']?.controls['BT-500-Organization-Company']) {
      this._formService.removeFormORG(this.editorCountIndex, (this.content as any)._idScheme);

      //devo rimuovere tutti i tpo sotto a questa org
      (this.form as any)?.controls['GR-Touch-Point'].controls.forEach((tpo) => {
        const value = tpo.controls['BT-500-Organization-TouchPoint'].value;
        this._formService.removeFormTPO(value, 'TPO');
      });
    } else if ((this.form as any)?.controls['BT-500-Organization-TouchPoint']) {
      this._formService.removeFormTPO(
        (this.form as any)?.controls['BT-500-Organization-TouchPoint'].value,
        (this.content as any)._idScheme
      );
    }
  }

  public manageAddElement(formGroupToAdd: any, child: any, _index: number): void {
    // Ottiene l'array di form dinamico associato al childId fornito
    const formArray = this.getDynamicFormArray(child.id);

    // Crea una copia del formGroup da aggiungere
    // Questo assicura che stiamo aggiungendo una nuova istanza, non un riferimento all'originale
    let newFormGroup: any;
    if (formGroupToAdd instanceof FormArray) {
      newFormGroup = cloneDeep(formGroupToAdd.controls[0]);
    } else if (formGroupToAdd instanceof FormGroup) {
      newFormGroup = cloneDeep(formGroupToAdd);
    } else {
      console.error('error');
    }
    newFormGroup.reset();

    this._formService.makeAllFormControlValid(newFormGroup);
    // Aggiunge il nuovo form group alla fine dell'array di form
    formArray.push(newFormGroup);

    // Aggiunge l'elemento alla mappa di visibilità dei componenti figli
    const value = this.childrenVisibilityMap.get(child.id);
    if (Array.isArray(value)) {
      value.push(true);
      this.childrenVisibilityMap.set(child.id, value);
    }
  }

  public manageRemoveElement(indexToRemove: number, childId: string): void {
    // Ottiene l'array di form dinamico associato al childId fornito
    const formArray = this.getDynamicFormArray(childId);

    // Verifico la presenza di campi di tipo ID e rimuovo il relativo valore dall'array degli idFieldSchemes
    let formGroup: FormGroup = formArray.at(indexToRemove) as FormGroup;
    this.removeIdFieldSchemas(formGroup);

    // Rimuove il form group all'indice selezionato
    if (indexToRemove != null) formArray.removeAt(indexToRemove);

    // Rimuove l'elemento dalla mappa di visibilità dei componenti figli
    const value = this.childrenVisibilityMap.get(childId);
    if (Array.isArray(value)) {
      value.splice(indexToRemove, 1);
      this.childrenVisibilityMap.set(childId, value);
    }
  }

  // Metodo chiamato dai componenti figli quando cambia la loro visibilità
  public onChildVisibilityChange(isVisible: boolean, childId: string, childRepeatableIndex: number): void {
    if (childRepeatableIndex == -1) {
      this.childrenVisibilityMap.set(childId, isVisible);
    } else {
      let value = this.childrenVisibilityMap.get(childId);
      value[childRepeatableIndex] = isVisible;
      this.childrenVisibilityMap.set(childId, value);
    }

    this.updateVisibility();
  }

  // Metodo chiamato dal componente stesso per recuperare la descrizione del campo dal file delle traduzioni
  public retrieveFieldDescription(): string {
    // Escludo i campi lingua e currency (posso ricercarli tramite attributeName)
    if (!['languageID', 'currencyID'].includes(this.field?.attributeName)) {
      let description: string = this._dataService.translations[this.generateFieldDescriptionTranslationKey()];
      return description != null ? description : '';
    }
    return '';
  }

  /**
   * Gestisce la selezione di un nodo nell'albero
   * @param event Evento di selezione del nodo
   */
  public onTreeNodeSelect(event: TreeNodeSelectEvent): void {
    if (this._action == 'EDIT') {
      this.form.patchValue(event.node);
    }
  }

  // #endregion

  // #region Getters/Setters

  public get id(): string {
    return this._id;
  }

  public set id(value: string) {
    this._id = value;
  }

  public get isVisible(): boolean {
    return this._isVisible;
  }

  public set isVisible(value: boolean) {
    this._isVisible = value;
    //this.styleHidden = this.content.hidden || !this._isVisible;
  }

  public get isValid() {
    return this.form?.valid ?? true;
  }

  public get isRequired(): boolean {
    return this.isField && this.form != null && this.form.hasValidator(Validators.required);
  }

  public get isRequiredOrSuggested(): boolean {
    // controlla se il campo è suggerito recuperando l'informazione dalla lista di campi suggeriti per notice-type
    let isSuggested = this._dataService.suggestedFieldsMap[this._dataService.selectedNotice]?.includes(this.id);

    //per test, aggiungo l'id dei suggested ad un array in un service
    if (this.isField && this.form instanceof FormControl) {
      this._formService.arrayOfSuggested.push(this.id);
      if (this.form.value == null && !this.id.endsWith('-Language')) {
        this._formService.dictionaryOfAllSuggestedFormControls[this.id] = this.form;
        this._formService.dictionaryOfAllSuggestedTypes[this.id] = this.field;
      }
    }

    return this.isRequired || isSuggested;
  }

  public get uniqueIdentifier() {
    return idFromFieldIdAndInstanceNumber(this.id, this.isRepeatable ? this.editorCount : -1);
  }

  public get isRepeatable() {
    return this.content?._repeatable ?? false;
  }

  public get isField() {
    return this.content?.contentType == 'field';
  }

  public get editorCount(): number {
    return this.isRepeatable || this.isField ? (this.editorCountIndex ?? 0) + 1 : 1;
  }

  private get inputElem(): HTMLElement {
    if (!this.inputElemRef.nativeElement) {
      return (this.inputElemRef as any).el.nativeElement;
    }
    return this.inputElemRef.nativeElement;
  }

  public get isFirstLevel(): boolean {
    return this.content?.firstLevel ?? false;
  }

  public get isIdSchemeGeneratorField(): boolean {
    return this.isField && this.field.type == 'id' && this.content._idScheme != null;
  }

  public get inputAriaLabel(): string {
    let label: string = this._dataService.getLabel(this.content._label);

    if (this.content && this.content.id) {
      label = `${label} [${this.content.id}]`;
    }
    return label;
  }

  // #endregion
}
