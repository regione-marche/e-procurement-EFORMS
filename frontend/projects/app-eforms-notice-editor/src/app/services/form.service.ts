import { inject, Injectable, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { IDictionary } from '@maggioli/sdk-commons';
import { get, has, isArray, isBoolean, isDate, isEmpty, isNumber, isObject, isString, padStart, set } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { Constants, I18N } from '../app.constants';
import { AccordionItem, ExtendedFormControl, InvalidField, ItemExpanded } from '../models/app.model';
import { CommonUtils } from '../utils/common.utils';
import { customPatternValidator } from '../validators/custom-pattern.validator';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class FormService {
  private _dataService: DataService = inject(DataService);
  private _idFieldMap: IDictionary<Array<string>> = {};
  private _idFieldMapSubj$: BehaviorSubject<IDictionary<Array<string>>> = new BehaviorSubject<
    IDictionary<Array<string>>
  >(this._idFieldMap);
  public shouldShow: boolean = true;
  private _shouldShowAddandRemoveButtonsSubj$ = new BehaviorSubject<boolean>(this.shouldShow);

  // stato iniziale: mostra solo i campi required or suggested
  private _showRequiredOrSuggestedOnlySubj$ = new BehaviorSubject<boolean>(true);

  public arrayOfSuggested: Array<any> = [];
  public itemsExpandedForSideMenu: Array<ItemExpanded> = [];
  public dictionaryOfAllSuggestedFormControls: IDictionary<FormControl> = {};
  public dictionaryOfAllSuggestedTypes: IDictionary<any> = {};
  public dictionaryOfAllSuggestedCombobox: IDictionary<any> = {};
  public dictionaryOfMultipleOrgsFormControl: IDictionary<FormControl> = {};
  public dictionaryOfMultipleTposFormControl: IDictionary<FormControl> = {};
  public idFieldMap$: Observable<IDictionary<Array<string>>>;
  public shouldShowAddandRemoveButtons$: Observable<boolean>;

  public firstLevelItems: Array<AccordionItem> = new Array();
  public showRequiredOrSuggestedOnly$: Observable<boolean>;

  constructor() {
    this.idFieldMap$ = this._idFieldMapSubj$.asObservable();
    this.shouldShowAddandRemoveButtons$ = this._shouldShowAddandRemoveButtonsSubj$.asObservable();
    this.showRequiredOrSuggestedOnly$ = this._showRequiredOrSuggestedOnlySubj$.asObservable();
  }

  // #region Public

  public toggleVisibility(): boolean {
    const currentVisibility = this._showRequiredOrSuggestedOnlySubj$.getValue();
    this._showRequiredOrSuggestedOnlySubj$.next(!currentVisibility); // inverte il valore attuale
    return !currentVisibility; // ritorna il nuovo valore per modificare la label del pulsante
  }

  public checkVisibility(): boolean {
    const currentVisibility = this._showRequiredOrSuggestedOnlySubj$.getValue();
    return currentVisibility;
  }

  /**
   * Aggiunge al dizionario con i FormControl una nuova entry ORG
   */
  public addFormORG(orgForm: FormControl, idScheme: string) {
    let biggestOrg: number = 0;
    Object.keys(this.dictionaryOfMultipleOrgsFormControl).forEach((key) => {
      if (key.includes(idScheme)) {
        if (biggestOrg < parseInt(key.split('-')[1], 10)) {
          biggestOrg = parseInt(key.split('-')[1], 10);
        }
      }
    });
    const key = idScheme + '-' + padStart((biggestOrg + 1).toString(), 4, '0');
    this.dictionaryOfMultipleOrgsFormControl[key] = orgForm;
  }

  /**
   * Aggiunge al dizionario con i FormControl una nuova entry TPO
   */
  public addFormTPO(orgForm: FormControl, idScheme: string) {
    let biggestTpo: number = 0;
    Object.keys(this.dictionaryOfMultipleTposFormControl).forEach((key) => {
      if (key.includes(idScheme)) {
        if (biggestTpo < parseInt(key.split('-')[1], 10)) {
          biggestTpo = parseInt(key.split('-')[1], 10);
        }
      }
    });
    const key = idScheme + '-' + padStart((biggestTpo + 1).toString(), 4, '0');
    this.dictionaryOfMultipleTposFormControl[key] = orgForm;
  }

  /**
   * Rimuove dal dizionario con i FormControl una entry ORG
   */
  public removeFormORG(editorCount: number, idScheme: string) {
    const key = idScheme + '-' + padStart((editorCount + 1).toString(), 4, '0');
    delete this.dictionaryOfMultipleOrgsFormControl[key];
    //riordino le chiavi
    //this.reorderKeysORG(idScheme);
    // this.reorderKeysTPO('TPO');
    //riordino le chiavi nell'idFieldMap
    // this.reorderIdFieldMap();
  }

  /**
   * Rimuove dal dizionario con i FormControl una entry TPO
   */
  public removeFormTPO(value: string, idScheme: string) {
    const keyToDelete = Object.keys(this.dictionaryOfMultipleTposFormControl).find(
      (key) => this.dictionaryOfMultipleTposFormControl[key].value == value
    );

    if (keyToDelete) {
      delete this.dictionaryOfMultipleTposFormControl[keyToDelete];
    }

    //riordino le chiavi
    //this.reorderKeysTPO(idScheme);
    //riordino le chiavi nell'idFieldMap
    // this.reorderIdFieldMap();
  }

  setShouldShowAddandRemoveButtons(value: boolean) {
    this.shouldShow = value;
    this._shouldShowAddandRemoveButtonsSubj$.next(this.shouldShow);
  }

  /**
   * Riordina le chiavi del dizionario ORG
   */
  private reorderKeysORG(idScheme: string) {
    const newDictionaryOfMultipleOrgsFormControl = {};
    let index = 1;

    Object.keys(this.dictionaryOfMultipleOrgsFormControl).forEach((key) => {
      if (key.startsWith(idScheme + '-')) {
        const newKey = idScheme + '-' + padStart(index.toString(), 4, '0');

        newDictionaryOfMultipleOrgsFormControl[newKey] = this.dictionaryOfMultipleOrgsFormControl[key];
        index++;
      } else {
        newDictionaryOfMultipleOrgsFormControl[key] = this.dictionaryOfMultipleOrgsFormControl[key];
      }
    });

    this.dictionaryOfMultipleOrgsFormControl = newDictionaryOfMultipleOrgsFormControl;
  }

  /**
   * Riordina le chiavi del dizionario TPO
   */
  private reorderKeysTPO(idScheme: string) {
    const newDictionaryOfMultipleTposFormControl = {};
    let index = 1;

    Object.keys(this.dictionaryOfMultipleTposFormControl).forEach((key) => {
      if (key.startsWith(idScheme + '-')) {
        const newKey = idScheme + '-' + padStart(index.toString(), 4, '0');

        newDictionaryOfMultipleTposFormControl[newKey] = this.dictionaryOfMultipleTposFormControl[key];
        index++;
      } else {
        newDictionaryOfMultipleTposFormControl[key] = this.dictionaryOfMultipleTposFormControl[key];
      }
    });

    this.dictionaryOfMultipleTposFormControl = newDictionaryOfMultipleTposFormControl;
  }

  /**
   * Se ho 3 organizzazioni e cancello la seconda, devo riordinare i valori a 0001 e 0002. vale anche per i TPO
   */
  public reorderValues(values: Array<string>): Array<string> {
    // Create a map to group values by their prefixes
    const prefixMap: Map<string, Array<string>> = new Map();

    // Group values by their prefixes
    values.forEach((value) => {
      const prefix = value.slice(0, 3); // Extract the prefix
      if (!prefixMap.has(prefix)) {
        prefixMap.set(prefix, []);
      }
      prefixMap.get(prefix)?.push(value);
    });

    // Sort values within each group and assign new sequential numbers
    let newValues: Array<string> = [];
    prefixMap.forEach((group, prefix) => {
      group.sort(); // Sort the group alphabetically
      group.forEach((_, index) => {
        const newValue = `${prefix}-${(index + 1).toString().padStart(4, '0')}`;
        newValues.push(newValue);
      });
    });

    return newValues;
  }

  /**
   * Reorders the entries in the idFieldMap only if the idScheme does not have an items array inside firstLevelItems.
   */
  public reorderIdFieldMap(): void {
    Object.keys(this.idFieldMap).forEach((idScheme) => {
      const hasItemsArray = this.firstLevelItems.some((item) =>
        item?.items?.some((i) => {
          const schemePart = i.labelId.split('-')[0].trim();
          const idSchemeTrimmed = idScheme.trim();
          return schemePart === idSchemeTrimmed;
        })
      );

      if (!hasItemsArray) {
        const values = this.idFieldMap[idScheme];
        const reorderedValues = values.map((value, index) => idScheme + '-' + padStart((index + 1).toString(), 4, '0'));

        // Update idFieldMap with reordered values
        this.idFieldMap[idScheme] = reorderedValues;
      }
    });
  }

  public findControlByName(form: AbstractControl, name: string): AbstractControl | null {
    if (name == null) return null;
    if (form instanceof FormGroup) {
      const control = form.get(name);
      if (control) return control;

      for (const controlName in form.controls) {
        const found = this.findControlByName(form.get(controlName) as AbstractControl, name);
        if (found) return found;
      }
    }

    if (form instanceof FormArray) {
      for (let i = 0; i < form.length; i++) {
        const found = this.findControlByName(form.at(i), name);
        if (found) return found;
      }
    }

    return null;
  }

  /*
  public findFieldIdScheme(node: any): any {
    // Verifico se il nodo corrente e' un campo di tipo field e contiente l'attributo _idScheme
    if (node.contentType == 'field' && node._idScheme) {
      return node;
    }

    // Se e' un gruppo, verifico i suoi figli
    if (node.contentType == 'group' && node.content) {
      for (let child of node.content) {
        const result = this.findFieldIdScheme(child);
        if (result) {
          return result;
        }
      }
    }

    // se non c'e' corrispondenza, ritorno null
    return null;
  }*/

  public manageGroupIndex(index: string): number {
    return index ? +index : -1;
  }

  /**
   * Verifico la necessita' di aggiungere campi attributo
   * @param fg
   * @returns
   */
  public checkFieldAttributes(fg: any): any {
    if (fg.contentType == 'group' && fg.content != null && fg.content.length > 0) {
      let fieldsToAdd: IDictionary<Array<any>> = {};
      fg.content.forEach((child: any, index: number) => {
        if (child.contentType == 'field') {
          let field = this._dataService.basicMetaDataFields[child?.id];
          if (field.attributes != null && field.type !== 'id-ref') {
            let fieldAttrs = this.createFieldsAttributes(field.attributes);
            if (fieldAttrs != null && fieldAttrs.length > 0) {
              set(fieldsToAdd, index, fieldAttrs);
            }
          }
        } else {
          child = this.checkFieldAttributes(child);
        }
      });
      if (!isEmpty(fieldsToAdd)) {
        for (let j = fg.content.length; j > 0; j--) {
          if (get(fieldsToAdd, j - 1) != null) {
            fg.content.splice(j - 1, 0, ...get(fieldsToAdd, j - 1));
          }
        }
      }
    }

    return fg;
  }

  /**
   * Restituisce un array che contiene tutti i formcontent ripetibili per tipo di notice
   * @param notice notice selezionata
   * @param formContent this._formContent[chiave] in input
   * @returns un formArray contentente i formContent ripetibili
   */
  public loadRepeatableReactiveForm(notice: string, formContent: any): Array<FormGroup> {
    let formArray = new Array();

    this._dataService.uploadedJsonContent.children[1].children.forEach((child) => {
      if (child.contentId == formContent.id) {
        let tempFormGroup = this.createFormGroupForSelectedFormContent(notice, formContent);
        (tempFormGroup as any).labelId = child.labelId;
        formArray.push(tempFormGroup);
      }
    });

    return formArray;
  }

  /**
   * Metodo che crea il formGroup per il formContent in input, aggiundengo i formControl
   */
  public createFormGroupForSelectedFormContent(
    noticeType: string,
    formContent: any,
    initialPartial?: IDictionary<any>
  ): FormGroup {
    let formGroup = new FormGroup({});

    formContent.content.forEach((c: any) => {
      let partial: IDictionary<any> = this.getInitialExternalJsonPartial(initialPartial, c.id, c._repeatable);
      if (c.contentType === 'group') {
        this.addGroupControl(noticeType, formGroup, c, partial);
      } else if (c.contentType === 'field') {
        this.addFieldControl(noticeType, formGroup, c, partial);
      }
    });

    return formGroup;
  }

  public checkForbiddenFields(noticeType: string, element: any): any {
    if (!element?.content) {
      return element;
    }

    let fieldsToRemove: Array<string> = new Array();

    element.content = element.content.map((contentItem: any) => {
      if (contentItem.contentType == 'field') {
        // Se e' un campo verifico le condizioni forbidden
        this.processForbiddenField(contentItem, noticeType, fieldsToRemove);
      } else {
        // Se e' un gruppo controllo i figli
        contentItem = this.checkForbiddenFields(noticeType, contentItem);
      }
      return contentItem;
    });

    // remove
    if (fieldsToRemove.length > 0) {
      element.content = element.content.filter((item: any) => !fieldsToRemove.includes(item.id));
    }

    return element;
  }

  public elaborateTempLabelIndex(idScheme, lastIndexValue): string {
    return idScheme + '-' + lastIndexValue;
  }

  /**
   * Per ogni elemento che contiene un idScheme vado a generare e salvare un id progressivo da assegnare al campo
   * (es. LOT-0001, GLO-0001)
   * @param field campo
   * @returns campo
   */
  public elaborateIdFields(
    field: any
    // tempLabelIndex?: boolean,
    // lastIndexValue?: any
  ): any {
    if (field.contentType == 'field' && field._idScheme != null) {
      let value = this.requestNewIdField(field._idScheme);
      // if (tempLabelIndex) {
      //   value = this.elaborateTempLabelIndex(field._idScheme, lastIndexValue);
      // }

      field._presetValue = value;
    } else if (field.contentType == 'group' && field.content != null && field.content.length > 0) {
      field.content.forEach((child: any) => {
        // child = this.elaborateIdFields(child, tempLabelIndex, lastIndexValue);
        child = this.elaborateIdFields(child);
      });
    }

    return field;
  }

  /**
   * Metodo che verifica se l'elemento passato (es di primo livello) e' un dizionario di form groups
   * rappresentante gli elementi di primo livello ripetibili
   * @param value Dizionario con chiave (es. LOT-0001, GLO-0001...) e valore FormGroup
   * @return Risultato della condizione
   */
  public isIDictionaryOfFormGroup(value: FormGroup | IDictionary<FormGroup>): value is IDictionary<FormGroup> {
    return typeof value === 'object' && value !== null && Object.values(value).every((v) => v instanceof FormGroup);
  }

  /**
   * Aggiunge un nuovo idscheme con progressivo alla mappa, se l'idcheme non e' presente esso viene creato.
   * @param fieldIdScheme Id Scheme
   * @param fieldIdComboContent Counter da aggiungere (Es. ORG-0001)
   */
  public addIdField(fieldIdScheme: string, fieldIdComboContent: string): void {
    if (!this._idFieldMap[fieldIdScheme]) {
      this._idFieldMap[fieldIdScheme] = [];
    }
    if (this._idFieldMap[fieldIdScheme].indexOf(fieldIdComboContent) === -1) {
      this._idFieldMap[fieldIdScheme].push(fieldIdComboContent);
    }
    this.sortIdFieldsMap();
    this._idFieldMapSubj$.next(this._idFieldMap);
  }

  /**
   * Metodo che genera un nuovo progressivo a partire da un id scheme
   * @param fieldIdScheme Id Scheme
   * @param progressivo Eventuale progressivo da generare (facoltativo). Se non e' passato si incrementa l'ultimo indice di 1 unita'
   * @returns Il nuovo Id
   */
  public requestNewIdField(fieldIdScheme: string, progressivo?: number): string {
    if (!this._idFieldMap[fieldIdScheme]) {
      this._idFieldMap[fieldIdScheme] = [];
    }
    let content: Array<string> = this._idFieldMap[fieldIdScheme]!;
    let value: string = null;

    if (progressivo) {
      if (content.length > 0) {
        content = this.sortIdFieldsArray(content);
        value = this.generateIdField(fieldIdScheme, progressivo);
        if (!content.includes(value)) content.push(value);
      } else {
        value = this.generateIdField(fieldIdScheme, progressivo);
        if (!content.includes(value)) content.push(value);
      }
    } else {
      if (content.length == 0) {
        let counter: number = 1;
        value = this.generateIdField(fieldIdScheme, counter);
        if (!content.includes(value)) content.push(value);
      } else if (content.length > 0) {
        content = this.sortIdFieldsArray(content);
        let last: string = content[content.length - 1];
        let counter: number = parseInt(last.substring(last.lastIndexOf('-') + 1), 10);
        counter++;
        value = this.generateIdField(fieldIdScheme, counter);
        if (!content.includes(value)) content.push(value);
      }
    }

    this._idFieldMap[fieldIdScheme] = content;

    this.sortIdFieldsMap();
    this._idFieldMapSubj$.next(this._idFieldMap);
    return value;
  }

  /**
   * Metodo che rimuove un progressivo specifico per id scheme
   * @param fieldIdScheme Id Scheme
   * @param fieldIdComboContent Progressivo (es. ORG-0001)
   */
  public removeIdField(fieldIdScheme: string, fieldIdComboContent: string): void {
    if (this._idFieldMap[fieldIdScheme]) {
      const index = this._idFieldMap[fieldIdScheme].indexOf(fieldIdComboContent);
      if (index > -1) {
        this._idFieldMap[fieldIdScheme].splice(index, 1);
        this._idFieldMapSubj$.next(this._idFieldMap);
      }
    }
  }

  /**
   * Metodo che ritorna la lista dei progressivi per id scheme
   * @param fieldIdScheme Id Scheme
   * @returns La lista
   */
  public getIdField(fieldIdScheme: string): Array<string> {
    return this._idFieldMap[fieldIdScheme] ?? [];
  }

  /**
   * Metodo che ritorna l'ultimo progressivo generato per id scheme
   * @param fieldIdScheme Id Scheme
   * @returns Il progressivo
   */
  public getLatestValueByIdField(fieldIdScheme: string): string {
    if (!this._idFieldMap[fieldIdScheme]) {
      return null;
    }

    const values = this._idFieldMap[fieldIdScheme];
    return values.length > 0 ? values[values.length - 1] : null;
  }

  /**
   * Metodo che ritorna l'indice progressivo generato per id scheme
   * @param fieldIdScheme Id Scheme
   * @returns Indice progressivo
   */
  public getLatestIndexByIdField(fieldIdScheme: string): number {
    if (!this._idFieldMap[fieldIdScheme]) {
      return null;
    }

    const values = this._idFieldMap[fieldIdScheme];
    return values.length > 0 ? values.length : null;
  }

  /**
   * Metodo che resetta la mappa di Id scheme fields
   */
  public resetIdFieldMap(): void {
    delete this._idFieldMap;
    this._idFieldMap = {};
    this._idFieldMapSubj$.next(this._idFieldMap);
  }

  /**
   * Metodo che dato un oggetto json ed un path ritorna il contenuto a quel path.
   * Se per il path cercato il campo/gruppo non e' ripetibile ma nel tracciato iniziale l'attributo e' un array
   * allora si prende l'oggetto ad indice 0 dell'array
   * @param initialJson tracciato json
   * @param path path di ricerca
   * @param isRepeatable se il campo da ricercare e' ripetibile
   * @returns l'oggetto al path desiderato
   */
  public getInitialExternalJsonPartial(
    initialJson: IDictionary<any>,
    path: string,
    isRepeatable: boolean
  ): IDictionary<any> | Array<IDictionary<any>> {
    let initialPartial: IDictionary<any> = initialJson;

    // console.warn('tracciato iniziale >>>', initialPartial);

    // Verifico se per il path selezionato ci sia una mappatura alternativa
    let pathFinal: string = path;
    if (has(Constants.ExternalIntegrationFieldsMap, path)) {
      pathFinal = get(Constants.ExternalIntegrationFieldsMap, path) as string;
    }

    // Verifico se ho elementi di primo livello nel tracciato
    if (initialJson && has(initialJson, pathFinal)) {
      let partial: IDictionary<any> = get(initialJson, pathFinal);
      // console.warn('pathFinal >>>', pathFinal);
      initialPartial = isArray(partial) && !isRepeatable ? partial[0] : partial;
      // console.warn('tracciato parziale >>>', initialPartial);
      return initialPartial;
    }

    // console.warn('Disallineamento tra sdk e tracciato iniziale per path >>>', path);

    return null;
  }

  // #endregion

  // #region Getters

  public get idFieldMap() {
    return this._idFieldMap;
  }

  // #endregion

  // #region Private

  /**
   * Metodo che crea i campi attributi (es. lingua per il singolo campo)
   * @param attributes
   * @returns
   */
  private createFieldsAttributes(attributes: Array<any>): Array<any> {
    let attFields: Array<any> = [];

    for (const att of attributes) {
      let sdkAttr: any = this._dataService.basicMetaDataFields[att];

      if (sdkAttr['xpathAbsolute'].endsWith('/@listName')) {
        continue;
      }

      if (sdkAttr.presetValue) {
        // Skip if there is a presetValue, this attribute field can be handled later in the back-end.
        // Assuming the associated field has a value, the attribute preset value could be set automatically.
        continue;
      }

      const contentAttr: any = {};
      contentAttr['id'] = sdkAttr.id;
      contentAttr['description'] = sdkAttr.name;
      contentAttr['contentType'] = Constants.ContentType.FIELD;
      contentAttr['displayType'] =
        sdkAttr.type === 'code' ? Constants.DisplayType.COMBOBOX : Constants.DisplayType.TEXTBOX;
      contentAttr['readOnly'] = false;
      contentAttr['hidden'] = false;

      if (sdkAttr.repeatable) {
        contentAttr['_repeatable'] = sdkAttr.repeatable.value;
      }
      contentAttr['_label'] = 'field|name|' + sdkAttr.id; // Label id.

      if (sdkAttr.id.endsWith('-Language')) {
        const selectedLangIso6393 = I18N.Iso6391ToIso6393Map[this._dataService.selectedLang];
        contentAttr['_presetValue'] = selectedLangIso6393;
        contentAttr['_label'] = 'field-language';
      } else if (sdkAttr.id.endsWith('-Currency')) {
        contentAttr['_presetValue'] = this._dataService.defaultCurrency;
        contentAttr['_label'] = 'field-currency';
      }

      attFields.push(contentAttr);
    }

    return attFields;
  }

  /**
   * Metodo che aggiunge un groupControl al formGroup in input
   * @param noticeType Tipologia di notifica per la quale gestire la form
   * @param formGroup form group
   * @param group elemento sdk di gruppo
   */
  private addGroupControl(
    noticeType: string,
    formGroup: FormGroup,
    group: any,
    partialJson?: IDictionary<any> | Array<IDictionary<any>>
  ): void {
    if (group._repeatable) {
      // Mi aspetto che il partialJson sia un'array
      const formArray = new FormArray([]);

      if (partialJson != null) {
        if (!isArray(partialJson)) {
          console.warn(
            `Non e' presente un array del partialJson per il gruppo [${group.id}], creo un array da 1 elemento`
          );
          partialJson = [partialJson];
        }
        partialJson.forEach((p: IDictionary<any>) => {
          let fg: FormGroup = this.elaborateFormGroups(noticeType, group, p);
          formArray.push(fg);
        });
      } else {
        formArray.push(this.elaborateFormGroups(noticeType, group));
      }
      formGroup.addControl(group.id, formArray);
    } else {
      formGroup.addControl(group.id, this.elaborateFormGroups(noticeType, group, partialJson));
    }
  }

  /**
   * Metodo che aggiunge un formControl al formGroup in input
   * @param noticeType Tipologia di notifica per la quale gestire la form
   * @param formGroup form group nel quale aggiungere il campo
   * @param field campo sdk
   * @param initialValue valore iniziale recuperato dal tracciato json (es. Appalti)
   */
  private addFieldControl(noticeType: string, formGroup: FormGroup, field: any, initialValue?: any): void {
    // Set valore da SDK
    let value = field._presetValue ?? null;

    // Controllo della tipologia di valore (se e' un oggetto allora non devo settarlo nel campo)
    let isComplexObject: boolean = isObject(initialValue) && !isDate(initialValue);

    // Set valore dal tracciato iniziale
    if (!isComplexObject) {
      // Converto il booleano in stringa per la gestione a combobox/radiobutton
      if (initialValue != null && (isBoolean(initialValue) || isNumber(initialValue))) {
        value = `${initialValue}`;
      } else {
        // EFORMS-98 Check field type e maxlength nel caso ci sia il dato da un applicativo esterno
        if (
          initialValue &&
          isString(initialValue) &&
          field &&
          (field.displayType == 'TEXTBOX' || field.displayType == 'TEXTAREA')
        ) {
          let maxLength: number = this._dataService.basicMetaDataFields[field.id].maxLength;
          let shortenedValue: string = initialValue;
          if (maxLength != null && shortenedValue.length > maxLength) {
            // Tronco il dato di appalti
            shortenedValue = shortenedValue.substring(0, maxLength);
          }
          value = shortenedValue ?? value;
        } else {
          value = initialValue ?? value;
        }
      }

      let fieldMetadata: any = this._dataService.basicMetaDataFields[field.id];
      if (fieldMetadata && fieldMetadata.type == 'id' && fieldMetadata.idScheme) {
        if (value) {
          if (value.startsWith(fieldMetadata.idScheme)) {
            // Valore che rispetta il pattern con id scheme
            try {
              // Check se non e' presente il valore da aggiungere (es. ORG-0001)
              if (
                this._idFieldMap[fieldMetadata.idScheme] == null ||
                !this._idFieldMap[fieldMetadata.idScheme].includes(value)
              ) {
                let progressivo: number = parseInt(value.split('-')[1], 10);
                let val: string = this.requestNewIdField(fieldMetadata.idScheme, progressivo);
                value = val;
              }
            } catch (e) {}
          } else {
            // Richiedo un nuovo id scheme se il valore non è valido
            let val: string = this.requestNewIdField(fieldMetadata.idScheme);
            value = val;
          }
        } else if (field.id != 'BT-137-LotsGroup') {
          // Richiedo un nuovo id scheme (escludendo lots group)
          let val: string = this.requestNewIdField(fieldMetadata.idScheme);
          console.warn(`Creo id scheme [ ${fieldMetadata.idScheme} ] per campo [ ${field.id} ] con valore [ ${val} ]`);
          value = val;
        }
      }
    }

    const validators: Array<ValidatorFn> = this.getFieldValidators(noticeType, field);

    //Aggiungo sempre un ExtendedFormControl invece di un FormControl
    const form = new FormControl(value, validators);

    //Cast the form to ExtendedFormControl
    const extendedForm = form as ExtendedFormControl<InvalidField>;

    // Check if customProperties is undefined or not initialized
    if (!extendedForm.customProperties) {
      extendedForm.customProperties = {
        invalid: signal(false)
      } as InvalidField;
    } else if (!extendedForm.customProperties.invalid) {
      extendedForm.customProperties.invalid = signal(false);
    }

    extendedForm.customProperties.invalid.set(false);

    formGroup.addControl(field.id, extendedForm);
  }

  /**
   * Aggiunta validatori al singolo campo
   * @param noticeType Tipologia di notifica per la quale gestire la form
   * @param field campo
   * @returns Lista di validatori
   */
  private getFieldValidators(noticeType: string, field: any): Array<ValidatorFn> {
    const validators: Array<ValidatorFn> = [];
    const metadataField = this._dataService.basicMetaDataFields[field.id];

    if (metadataField) {
      let isForbiddenOnCondition: boolean = CommonUtils.checkForbiddenFieldOnCondition(noticeType, metadataField);

      // Controlla se il campo è contenuto nella lista dei campi da mostrare come required nella form
      if (this._dataService.requiredFieldsList.includes(field.id)) {
        validators.push(Validators.required);
      }
      // Mandatory
      else if (!isForbiddenOnCondition && metadataField.mandatory && !this._dataService.isMandatoryExcluded(field.id)) {
        // Check constraints
        let mandatory: boolean = false;
        if (metadataField.mandatory.constraints) {
          metadataField.mandatory.constraints.forEach((co: any) => {
            if (co.severity === 'ERROR' && co.value && co.noticeTypes.includes(noticeType)) {
              mandatory = co.condition == null;
            }
            // TODO check constraint with condition
          });
        }
        if (mandatory) validators.push(Validators.required);
      }

      // Pattern (non lo inserisco se il campo e' date o time dato che l'input html contiene gia' una maschera per l'inserimento del dato)
      if (metadataField.pattern && metadataField?.type != 'date' && metadataField?.type != 'time')
        validators.push(customPatternValidator(metadataField));
    }

    return validators;
  }

  /**
   * Metodo che crea i formGroup per gli elementi nested
   * @param noticeType Tipologia di notifica per la quale gestire la form
   * @param child elemento sdk
   * @returns form group
   */
  private elaborateFormGroups(noticeType: string, child: any, partialJson?: IDictionary<any>): FormGroup {
    let formGroup = new FormGroup({});
    child.content.forEach((c: any) => {
      let partial: IDictionary<any> = this.getInitialExternalJsonPartial(partialJson, c.id, c._repeatable);
      if (c.contentType === 'group') {
        this.addGroupControl(noticeType, formGroup, c, partial);
      } else if (c.contentType === 'field') {
        this.addFieldControl(noticeType, formGroup, c, partial);
      }
    });
    return formGroup;
  }

  /**
   * Cicla la formReactive e mette tutti i formcontrol a form.customProperties.invalid a false, quindi la ngclass non si applica.
   * @param formReactiveContent
   */
  public makeAllFormControlValid(
    formReactiveContent: IDictionary<FormGroup<any> | IDictionary<FormGroup<any>>> | FormArray | FormGroup | FormControl
  ) {
    if (formReactiveContent instanceof FormControl) {
      formReactiveContent = formReactiveContent as ExtendedFormControl<InvalidField>;

      // Check if customProperties is undefined or not initialized
      if (!(formReactiveContent as ExtendedFormControl<InvalidField>).customProperties) {
        (formReactiveContent as ExtendedFormControl<InvalidField>).customProperties = {
          invalid: signal(false)
        } as InvalidField;
      } else if (!(formReactiveContent as ExtendedFormControl<InvalidField>).customProperties.invalid) {
        (formReactiveContent as ExtendedFormControl<InvalidField>).customProperties.invalid = signal(false);
      }

      (formReactiveContent as ExtendedFormControl<InvalidField>).customProperties.invalid.set(false);
    } else if (formReactiveContent instanceof FormArray || formReactiveContent instanceof FormGroup) {
      Object.keys(formReactiveContent.controls).forEach((key) => {
        if ((formReactiveContent as any).controls[key] != null) {
          this.makeAllFormControlValid((formReactiveContent as any).controls[key]);
        }
      });
    } else if (formReactiveContent instanceof Object) {
      Object.keys(formReactiveContent).forEach((key) => {
        if (formReactiveContent[key] != null) {
          this.makeAllFormControlValid(formReactiveContent[key]);
        }
      });
    }
  }

  private processForbiddenField(field: any, noticeType: string, fieldsToRemove: Array<string>): void {
    const metadataField = this._dataService.basicMetaDataFields[field.id];

    if (field?.forbidden?.severity !== 'ERROR') {
      return;
    }

    /*
      Esempio:

      "forbidden" : {
        "value" : false,
        "severity" : "ERROR",
        "constraints" : [ {
          "noticeTypes" : [ "1", "2", "3", "4", "5", "6", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "T01", "T02", "X01", "X02" ],
          "value" : true,
          "severity" : "ERROR"
        }, {
          "noticeTypes" : [ "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "CEI" ],
          "condition" : "{ND-LotProcurementDocument} ${not(BT-14-Lot == 'restricted-document')}",
          "value" : true,
          "severity" : "ERROR"
        } ]
      }
    */
    metadataField.forbidden.constraints.forEach((constraint: any) => {
      if (constraint && constraint.noticeTypes.includes(noticeType) && constraint.severity === 'ERROR') {
        // le verifico entrambe anche se non so se posso avere due forbidden constraints
        // che si bloccano a vicenda
        if (constraint.condition == null) {
          // Se non c'e' condizione allora rimuovo il campo
          // Facendo cio' rimuovo anche la sua eventuale condizione di obbligatorieta'
          fieldsToRemove.push(field.id);
        } else {
          // Se c'e' una condizione allora ripristino il campo se precedentemente rimosso
          // oppure non eseguo alcuna azione
          let idx: number = fieldsToRemove.indexOf(field.id);
          if (idx > -1) fieldsToRemove.splice(idx, 1);
        }
      }
    });
  }

  /**
   * Metodo che genera il progressivo a partire dall'id scheme
   * @param fieldId Id Scheme
   * @param counter Progressivo
   * @returns Il risultato
   */
  public generateIdField(fieldId: string, counter: number): string {
    return this.concatenateFieldAndCounter(fieldId, this.generateCounter(counter));
  }

  /**
   * Metodo che formatta il progressivo da number a stringa paddata con zeri a sinistra
   * @param counter Progressivo
   * @returns Il risultato
   */
  public generateCounter(counter: number): string {
    return counter.toString().padStart(4, '0');
  }

  /**
   * Metodo che concatena l'id scheme al progressivo paddato
   * @param fieldId Id Scheme
   * @param counter Progressivo paddato
   * @returns Il risultato
   */
  private concatenateFieldAndCounter(fieldId: string, counter: string): string {
    return `${fieldId}-${counter}`;
  }

  /**
   * Metodo che ordina l'array dei progressivi per ogni id scheme
   */
  private sortIdFieldsMap(): void {
    Object.keys(this._idFieldMap).forEach((key) => {
      let value: Array<string> = this._idFieldMap[key];
      if (value != null && value.length > 0) {
        value = this.sortIdFieldsArray(value);
      }
    });
  }

  /**
   * Metodo che ordina l'array dei progressivi
   * @param arr Array dei progressivi
   * @returns Il risultato
   */
  private sortIdFieldsArray(arr: Array<string>): Array<string> {
    arr.sort((a: string, b: string) => {
      const numA = parseInt(a.split('-')[1], 10); // Estrai e converte la parte numerica di 'a'
      const numB = parseInt(b.split('-')[1], 10); // Estrai e converte la parte numerica di 'b'
      return numA - numB; // Confronto numerico per ordinare
    });
    return arr;
  }

  // #endregion
}
