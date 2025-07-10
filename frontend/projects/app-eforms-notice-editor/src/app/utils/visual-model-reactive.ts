import { inject, Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { IDictionary } from '@maggioli/sdk-commons';
import { cloneDeep, has } from 'lodash-es';
import { Constants } from '../app.constants';
import {
  IFieldCondition,
  IFieldSingleCondition,
  IVisualModelElement,
  IVisualModelOutput,
  TForbiddenCheck
} from '../models/app.model';
import { DataService } from '../services/data.service';
import { FormService } from '../services/form.service';
import { ConditionLexer } from './condition-lexer';

@Injectable({ providedIn: 'root' })
export class VisualModelService {
  private _formData: any;
  private _metadata: any;
  private _formGroupData: IDictionary<FormGroup | IDictionary<FormGroup>>;
  private _formGroupMetadata: FormGroup;
  private _formGroupMetadataRaw: IDictionary<any>;
  private _suppMapContentId: IDictionary<any>;
  private _suppMap: IDictionary<any>;
  private _formService: FormService = inject(FormService);
  private _dataService: DataService = inject(DataService);
  private _conditionLexer: ConditionLexer = inject(ConditionLexer);

  // #region Public

  /**
   * Costruisce un modello visivo basato sui dati del form e sui metadati.
   *
   * @param formData Dati del form.
   * @param metadata Metadati relativi al form.
   * @param formGroupData Dati del gruppo di form, può essere un dizionario di FormGroup o di Array di FormGroup.
   * @param formGroupMetadata Metadati del gruppo di form.
   * @returns Un modello visivo rappresentato come un oggetto.
   */
  public buildVisualModel(
    formData: any,
    metadata: any,
    formGroupData: IDictionary<FormGroup | IDictionary<FormGroup>>,
    formGroupMetadata: FormGroup,
    executeValidation: boolean = false
  ): IVisualModelOutput {
    this._formData = formData;
    this._metadata = metadata;
    this._formGroupData = formGroupData;
    this._formGroupMetadata = formGroupMetadata;

    let formInvalids: Array<string>;

    if (executeValidation) {
      let invalids: Array<any> = this.checkFormValidity(this._formGroupData);

      if (invalids && invalids.length > 0) {
        formInvalids = invalids.map((err: any) => {
          let key: string = err.key;
          if (err.value) {
            if (err.value.includes('VALIDATORS.MANDATORY')) {
              return `Il campo ${this.parseGroupString(key)} e' obbligatorio.`;
            } else if (err.value.includes('VALIDATORS.PATTERN')) {
              return `Il campo ${this.parseGroupString(key)} non rispetta il pattern richiesto.`;
            }
          }
        });
      }
    }

    this._formGroupMetadataRaw = this._formGroupMetadata.getRawValue();

    // Prepara l'elemento root della visualizzazione, inizializzato con i valori di base
    let noticeRoot: IVisualModelElement = {
      contentId: 'notice-root',
      contentType: null,
      contentCount: '1',
      visType: Constants.VIS_TYPE_NON_FIELD,
      visNodeId: Constants.StandardIdentifiers.ND_ROOT,
      sdkVersion: this._formGroupMetadataRaw[Constants.StandardIdentifiers.SDK_VERSION_FIELD],
      noticeSubType: this._formGroupMetadataRaw[Constants.StandardIdentifiers.NOTICE_SUBTYPE_FIELD],
      noticeUuid: this._formGroupMetadataRaw[Constants.StandardIdentifiers.NOTICE_UUID_FIELD],
      children: []
    };

    // Elabora i metadati e li aggiunge come figli dell'elemento root
    let noticeMetadata: IVisualModelElement = this.elaborateMetadata();
    noticeRoot.children.push(noticeMetadata);

    // Elabora i dati del form e li modifica se necessario
    let noticeData: IVisualModelElement = this.elaborateData();

    // Inserisce un ID etichetta nei dati del form
    noticeData = this.insertLabelId(noticeData);

    // Processa il JSON degli elementi figli del form
    const processedJson = this.processJsonTree(noticeData);

    // Notice data viene ritornato come array da 1 elemento contenente notice data stesso
    noticeData = { ...processedJson[0] };

    let forbiddenConditions: Array<string>;
    let mandatoryConditions: Array<string>;

    if (executeValidation) {
      // Check forbidden and mandatory fields with condition
      forbiddenConditions = this.checkForbiddenMandatoryFieldsWithCondition(noticeData);
    }

    noticeRoot.children.push(noticeData);

    let output: IVisualModelOutput = {};

    if (
      executeValidation &&
      (formInvalids ||
        (forbiddenConditions && forbiddenConditions.length > 0) ||
        (mandatoryConditions && mandatoryConditions.length > 0))
    ) {
      const validationErrors = [
        ...(formInvalids?.length > 0 ? formInvalids : []),
        ...(forbiddenConditions?.length > 0 ? forbiddenConditions : []),
        ...(mandatoryConditions?.length > 0 ? mandatoryConditions : [])
      ];
      output.validation = validationErrors;
    }

    output.data = noticeRoot;

    return output;
  }

  public checkFormValidity(formGroupData: IDictionary<FormGroup | IDictionary<FormGroup>>): Array<any> {
    let invalids: Array<Array<string>> = Object.keys(formGroupData).map((key: string) => {
      let value: FormGroup | IDictionary<FormGroup> = formGroupData[key];
      if (this._formService.isIDictionaryOfFormGroup(value)) {
        return Object.keys(value)
          .map((repeatableKey: string) => {
            let v: FormGroup = value[repeatableKey];
            return this.listInvalidControls(v).map((el: any) => {
              return {
                key: `${key}[${repeatableKey}].${el.key}`,
                value: el.value
              } as any;
            });
          })
          .flat();
      } else {
        return this.listInvalidControls(value as FormGroup).map((el: any) => {
          return {
            key: `${key}.${el.key}`,
            value: el.value
          };
        });
      }
    });

    return invalids.flat();
  }

  // #endregion

  // #region Private

  /**
   * Elabora i metadati e li converte in un oggetto IVisualModelElement.
   *
   * @returns Un elemento del modello visivo che rappresenta i metadati, o null se i metadati non esistono.
   */
  private elaborateMetadata(): IVisualModelElement {
    if (this._metadata != null) {
      // Crea un oggetto IVisualModelElement per contenere i metadati
      let nodiceMetadata: IVisualModelElement = {
        contentId: this._metadata.id,
        contentType: this._metadata.contentType,
        contentCount: '1',
        visType: Constants.VIS_TYPE_NON_FIELD
      };

      // Se i metadati contengono contenuti, elabora ogni contenuto
      if (this._metadata.content) {
        let formRaw: IDictionary<any> = this._formGroupMetadata.getRawValue();
        nodiceMetadata.children = this._metadata.content.map((m: any) => {
          return this.elaborateMetadataChild(m, formRaw);
        });
      }

      return nodiceMetadata;
    }
    // Restituisce null se i metadati non sono presenti
    return null;
  }

  /**
   * Elabora un singolo elemento figlio dei metadati.
   *
   * @param child Il contenuto figlio dei metadati.
   * @param formRaw I valori grezzi del gruppo di form.
   * @returns Un elemento del modello visivo che rappresenta il contenuto figlio.
   */
  private elaborateMetadataChild(child: any, formRaw: IDictionary<any>): IVisualModelElement {
    // Crea un oggetto IVisualModelElement per contenere il contenuto figlio dei metadati
    let elem: IVisualModelElement = {
      contentId: child.id,
      contentType: child.contentType,
      contentCount: '1',
      visType: Constants.VIS_TYPE_FIELD,
      value: formRaw[child.id] ?? null
    };

    // Elabora ricorsivamente i figli del contenuto, se presenti
    if (child.content) {
      elem.children = child.content.map((c: any) => {
        return this.elaborateMetadataChild(c, formRaw);
      });
    }

    return elem;
  }

  /**
   * Verifica i dati del gruppo di form e li salva in un dizionario.
   *
   * @returns Un dizionario contenente i dati verificati del gruppo di form.
   */
  private checkFormGroupData(): IDictionary<any> {
    const result: IDictionary<any> = {};

    for (const key in this._formGroupData) {
      const formGroupOrArray = this._formGroupData[key];
      if (formGroupOrArray instanceof FormGroup) {
        this.checkFormGroup(formGroupOrArray, result);
      } else if (this._formService.isIDictionaryOfFormGroup(formGroupOrArray)) {
        Object.keys(formGroupOrArray).forEach((keyForm) => {
          if (formGroupOrArray[keyForm] instanceof FormGroup) {
            this.checkFormGroup(formGroupOrArray[keyForm], result, keyForm);
          }
        });
      }
    }

    return result;
  }

  /**
   *
   *
   * @param formGroup Il gruppo di form da verificare.
   * @param result Il dizionario che conterrà i risultati della verifica.
   */
  private checkFormGroup(formGroup: FormGroup, result: IDictionary<any>, keyForm?) {
    for (const controlName in formGroup.controls) {
      const control = formGroup.controls[controlName];

      if (control instanceof FormGroup) {
        this.checkFormGroup(control, result, keyForm);
      } else if (control instanceof FormControl) {
        if (keyForm != null) {
          if (result[keyForm] != null) {
            return;
          } else {
            result[keyForm] = controlName;
          }
        }
      }
    }
  }

  /**
   * Aggiunge l'ID dell'etichetta ai dati di notifica.
   *
   * @param noticeData I dati di notifica da aggiornare.
   * @param mapContentId Mappa degli ID di contenuto.
   */
  private addLabelId(noticeData: IVisualModelElement, mapContentId: IDictionary<any[]>): void {
    if (mapContentId[noticeData.contentId]) {
      const correspondingMapIds = mapContentId[noticeData.contentId];

      let finished = false;
      if (!finished) {
        for (const key in this._suppMap) {
          if (this._suppMap[key] && !finished) {
            for (const key2 in correspondingMapIds) {
              if (correspondingMapIds[key2] == this._suppMap[key] && key.includes('-')) {
                if (!noticeData.labelId) {
                  noticeData.labelId = key;
                }

                this.addLabelIdToAll(noticeData);
                delete this._suppMap[key];
                finished = true;
                break;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Aggiunge l'ID dell'etichetta a tutti i figli dei dati di notifica.
   *
   * @param noticeData I dati di notifica da aggiornare.
   */
  private addLabelIdToAll(noticeData: IVisualModelElement): void {
    if (noticeData.children && noticeData.children.length > 0) {
      for (const child of noticeData.children) {
        child.labelId = noticeData.labelId;

        this.addLabelIdToAll(child);
      }
    }
  }

  /**
   * Riempie una mappa con gli ID di contenuto.
   *
   * @returns Una mappa con gli ID di contenuto.
   */
  private fillContentIdMap(): IDictionary<any[]> {
    let resultMap: IDictionary<any[]> = {};

    this._formData.content.forEach((item) => {
      const itemIdSubstring = item.id.split('-').pop(); // Estraggo testo dopo l'ultimo "-"

      for (const key in this._suppMap) {
        if (this._suppMap.hasOwnProperty(key)) {
          const mapItemValue = this._suppMap[key];
          const mapItemSubstring = mapItemValue.split('-').pop(); // Estraggo testo dopo l'ultimo "-", "BT-137-LotsGroup" diventa "LotsGroup"

          if (itemIdSubstring === mapItemSubstring) {
            if (!resultMap[item.id]) {
              resultMap[item.id] = [];
            }
            if (!resultMap[item.id].includes(mapItemValue)) {
              resultMap[item.id].push(mapItemValue);
            }
          }
        }
      }
    });
    return resultMap;
  }

  /**
   * Elabora i dati del form e li converte in un oggetto IVisualModelElement.
   *
   * @returns Un elemento del modello visivo che rappresenta i dati del form, o null se i dati del form non esistono.
   */
  private elaborateData(): IVisualModelElement {
    if (this._formData != null) {
      console.log(this._formData.id);
      let noticeData: IVisualModelElement = {
        contentId: this._formData.id,
        contentType: this._formData.contentType,
        contentCount: '1',
        visType: Constants.VIS_TYPE_NON_FIELD
      };

      if (this._formData.content) {
        noticeData.children = this._formData.content.map((m: any) => {
          console.log('m >>>', m.id);
          if (this._formService.isIDictionaryOfFormGroup(this._formGroupData[m.id]) || m.id == 'GR-LotsGroup') {
            let suppFormGroup: FormGroup[] = [];

            if (has(this._formGroupData, m.id)) {
              Object.keys(this._formGroupData[m.id]).forEach((key) => {
                suppFormGroup.push(this._formGroupData[m.id][key]);
              });
            }

            // Map each FormGroup to its raw value, then elaborate the data
            const elaboratedData = suppFormGroup.map((f: FormGroup) => {
              return this.elaborateDataChild(m, f.getRawValue());
            });

            // Flatten the array and return it
            return elaboratedData.flat();
          } else {
            return this.elaborateDataChild(m, (this._formGroupData[m.id] as FormGroup).getRawValue());
          }
        });
      }

      return noticeData;
    }
    return null;
  }

  /**
   * Inserisce l'ID dell'etichetta nei dati di notifica.
   *
   * @param noticeData I dati di notifica da aggiornare.
   * @returns I dati di notifica aggiornati con l'ID dell'etichetta.
   */
  private insertLabelId(noticeData): IVisualModelElement {
    // _suppMap contiene per esempio: "GLO-0001: BT-137-LotsGroup" e "GLO-0002: BT-137-LotsGroup"
    this._suppMap = this.checkFormGroupData();

    // _suppMapContentId contiene per esempio: "GR-LotsGroup: BT-137-LotsGroup"
    this._suppMapContentId = this.fillContentIdMap();

    // In questo caso il codice sarà "GLO-0001", che aggiungerò ad ogni figlio con id = GR-LotsGroup
    noticeData.children.forEach((notice) => {
      if (!notice.contentId) {
        notice.forEach((n) => {
          for (const key in this._suppMapContentId) {
            if (n.contentId === key) {
              this.addLabelId(n, this._suppMapContentId);
            }
          }
        });
      }
    });

    return noticeData;
  }

  /**
   * Elabora un singolo elemento figlio dei dati del form.
   *
   * @param child Il contenuto figlio dei dati del form.
   * @param formRaw I valori grezzi del gruppo di form.
   * @param contentCount Il conteggio del contenuto, predefinito a '1'.
   * @returns Un elemento del modello visivo che rappresenta il contenuto figlio.
   */
  private elaborateDataChild(child: any, formRaw: IDictionary<any>, contentCount: string = '1'): IVisualModelElement {
    let elem: IVisualModelElement = {
      contentId: child.id,
      contentType: child.contentType,
      contentCount,
      visType: child.contentType == 'field' ? Constants.VIS_TYPE_FIELD : Constants.VIS_TYPE_NON_FIELD
    };

    if (child.nodeId) elem.visNodeId = child.nodeId;

    let localFormRaw: IDictionary<any> = formRaw;

    if (child.contentType == 'field') {
      // Imposta valori di default
      if (child.id == Constants.StandardIdentifiers.LEGAL_BASIS_TYPE_FIELD) {
        elem.value = this._dataService.selectedNoticeSubType['legalBasis'];
      } else {
        // Imposta il valore
        let l = localFormRaw as any;
        elem.value = l?.key ?? l;
      }
    } else {
      if (child.content != null) {
        const processContent = (content: any[]): IVisualModelElement[] => {
          return content.flatMap((e: any) => {
            if (e._repeatable) {
              return localFormRaw[e.id].map((form: IDictionary<any>, index: number) =>
                this.elaborateDataChild(cloneDeep(e), form, `${index + 1}`)
              );
            } else {
              return this.elaborateDataChild(e, localFormRaw[e.id]);
            }
          });
        };

        elem.children = processContent(child.content);
      }
    }

    return elem;
  }

  /**
   * Processa l'albero JSON per i nodi e i relativi figli.
   *
   * @param node Il nodo da processare.
   * @returns Un array contenente i nodi processati.
   */
  private processJsonTree(node: any) {
    if (Array.isArray(node)) {
      return node.reduce((acc, child) => {
        const processedChild = this.processJsonTree(child);
        return acc.concat(processedChild);
      }, []);
    } else if (typeof node === 'object' && node !== null) {
      //if ('visNodeId' in node || node.visType === 'field') {
      // Se il nodo ha visNodeId, processa i suoi figli
      const newNode = { ...node };
      if (node.children) {
        newNode.children = this.processJsonTree(node.children);
      }
      return [newNode];
      /*} else {
        // Se il nodo non ha visNodeId, processa e restituisci i suoi figli
        return node.children ? this.processJsonTree(node.children) : [];
      }*/
    }
    // Se non è un oggetto o un array, restituiscilo così com'è
    return [node];
  }

  private listInvalidControls(formGroup: FormGroup | FormArray): Array<any> {
    let invalidControls: Array<any> = new Array();

    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);

      if (control instanceof FormControl) {
        if (control.invalid) {
          invalidControls.push({
            key,
            value: this.mapValidationErrors(control)
          });
        }
      }

      if (control instanceof FormGroup) {
        invalidControls = invalidControls.concat(
          this.listInvalidControls(control).map((err) => {
            return {
              key: `${key}.${err.key}`,
              value: err.value
            };
          })
        );
      }

      if (control instanceof FormArray) {
        control.controls.forEach((arrayControl, index) => {
          if (arrayControl instanceof FormGroup) {
            invalidControls = invalidControls.concat(
              this.listInvalidControls(arrayControl).map((err) => {
                return {
                  key: `${key}[${index + 1}].${err.key}`,
                  value: err.value
                };
              })
            );
          } else if (arrayControl instanceof FormControl && arrayControl.invalid) {
            invalidControls.push({
              key: `${key}[${index + 1}]`,
              value: this.mapValidationErrors(arrayControl)
            });
          }
        });
      }
    });

    return invalidControls;
  }

  private mapValidationErrors(formControl: FormControl): Array<string> {
    return Object.keys(formControl.errors).map((k: string) => {
      switch (k) {
        case 'required':
          return 'VALIDATORS.MANDATORY';
        case 'patternValid':
          return 'VALIDATORS.PATTERN';
      }
    });
  }

  /**
   * Per verificare tutte le forbidden e le mandatory conditions collegate:
   * 1) Recupero i campi contenenti condizioni per la notice selezionata
   * 2) Per ogni campo recupero la condizione di forbidden
   * 3) Per ogni condizione, per il parentId, trovo l'antenato più prossimo
   * 4) Da questo punto converto la condizione in una comprensibile a javascript ed eseguo il controllo
   * 5) Se il campo non e' forbidden allora procedo con i punti 2-3-4 ma per la condizione mandatory
   * @param noticeData
   */
  private checkForbiddenMandatoryFieldsWithCondition(noticeData: IVisualModelElement): Array<string> {
    let origConditions: IDictionary<IFieldCondition> =
      this._dataService.fieldsConditions[this._dataService.selectedNotice];

    let conditions: Array<string> = new Array();

    Object.entries(origConditions).forEach(([fieldKey, fieldConditions]) => {
      let isForbidden: TForbiddenCheck = TForbiddenCheck.NOT_CHECKED;

      fieldConditions.forbidden.forEach((fc: IFieldSingleCondition) => {
        const me: { hierarchy: Array<string>; parent: Array<any> } = this.findParentId(noticeData, fc.parentId, []);

        const hierarchy: string = me.hierarchy
          .map((elem: string) => this._dataService.groupsNodeIdLabels[elem])
          .join(' -> ');
        const matchingElements: Array<any> = me.parent;

        let matchingField: IVisualModelElement = this._conditionLexer.findMatchingElementById(
          matchingElements,
          fieldKey
        );

        let conditionResult: boolean = this._conditionLexer.evaluateCondition(
          fc.condition,
          this._dataService.basicMetaDataFields,
          matchingElements
        );
        if (conditionResult) {
          if (matchingField && matchingField.value != null && matchingField.value != '') {
            let msg: string = `Il campo ${hierarchy} -> ${fieldKey} non e' ammesso.`;
            conditions.push(msg);
            isForbidden = TForbiddenCheck.FORBIDDEN;
            // Casi in cui ho verificato la condizione forbidden, essa e' risultata vera
            // e il valore del campo e' presente
          } else {
            // Casi in cui ho verificato la condizione forbidden, essa e' risultata vera
            // ma il valore del campo e' null
            isForbidden = TForbiddenCheck.NOT_FORBIDDEN;
          }
        } else {
          // Casi in cui ho verificato la condizione forbidden ma essa e' risultata falsa
          isForbidden = TForbiddenCheck.NOT_FORBIDDEN;
        }
      });

      // Mandatory
      if ((isForbidden as TForbiddenCheck) == TForbiddenCheck.NOT_FORBIDDEN) {
        fieldConditions.mandatory.forEach((fc: IFieldSingleCondition) => {
          const me: { hierarchy: Array<string>; parent: Array<any> } = this.findParentId(noticeData, fc.parentId, []);

          const hierarchy: string = me.hierarchy
            .map((elem: string) => this._dataService.groupsNodeIdLabels[elem])
            .join(' -> ');
          const matchingElements: Array<any> = me.parent;

          let matchingField: IVisualModelElement = this._conditionLexer.findMatchingElementById(
            matchingElements,
            fieldKey
          );

          if (fc.condition) {
            let conditionResult: boolean = this._conditionLexer.evaluateCondition(
              fc.condition,
              this._dataService.basicMetaDataFields,
              matchingElements
            );
            if (conditionResult) {
              if (matchingField && (matchingField.value == null || matchingField.value == '')) {
                let msg: string = `Il campo ${hierarchy} -> ${fieldKey} e' obbligatorio.`;
                conditions.push(msg);
              }
            }
          } else {
            if (matchingField && (matchingField.value == null || matchingField.value == '')) {
              let msg: string = `Il campo ${hierarchy} -> ${fieldKey} e' obbligatorio.`;
              conditions.push(msg);
            }
          }
        });
      }
    });
    return conditions;
  }

  /**
   * Metodo che cerca l'elemento contenente il parentId presente nella condizione ricercata (forbidden, mandatory)
   * Devo inoltre considerare che alcune condizioni fanno riferimento a parentId non necessariamente direttamente collegati ai campi,
   * pertanto oltre a verificare l'uguaglianza tra parentId e visNodeId si rende necessario cercare i nodi genitori di parentId
   * finche' non si trova l'id equivalente a visNodeId. Nel caso non ci sia match, si ignora il controllo.
   * @param element elemento da cercare (si cercheranno anche i figli)
   * @param parentId visNodeId da cercare
   * @returns un array di elementi che matchano il visNodeId con parentId (perche' potrebbero esserci gruppi ripetibili)
   */
  private findParentId(
    element: any,
    parentId: string,
    hierarchy: Array<string>
  ): { hierarchy: Array<string>; parent: Array<any> } {
    let isVisNodeParentId: boolean = element.visNodeId == parentId;
    if (isVisNodeParentId) {
      hierarchy.push(element.visNodeId);
      return {
        hierarchy,
        parent: [element]
      };
    }

    let xmlStructure: Array<string> = this._dataService.getXmlStructureAncestor(parentId, element.visNodeId);
    if (xmlStructure != null && xmlStructure.length > 0) {
      hierarchy.push(element.visNodeId);
      return {
        hierarchy,
        parent: [element]
      };
    }

    if (element.children) {
      let found: Array<any> = [];
      element.children.forEach((child: any) => {
        let res: { hierarchy: Array<string>; parent: Array<any> } = this.findParentId(child, parentId, hierarchy);
        if (res != null && res.parent != null) found.push(...res.parent);
      });
      return {
        hierarchy,
        parent: found
      };
    }
  }

  private parseGroupString(input: string): string {
    let parts: Array<string> = input.split('.');
    parts = parts.map((one: string, index: number) => {
      if (index == parts.length - 1) {
        // something
        return one;
      } else {
        // converto il codice in stringa tradotta, faccio attenzione ai casi di pannelli multipli
        // che saranno mostrati con le parentesi quadre per indicare la posizione (es. GR-ContractingAuthority[1])
        let decoded = this.splitGroupString(one);
        let toBeTranslated: string = this._dataService.groupsLabels[decoded.key];
        // let translated: string = this._dataService.getLabel(toBeTranslated);
        if (decoded.index) {
          toBeTranslated += `[${decoded.index}]`;
        }
        return toBeTranslated;
      }
    });

    return parts.join('->');
  }

  private splitGroupString(input: string): any {
    if (input.length >= 10 && input.includes(']') && input.charAt(input.length - 10) == '[') {
      // Questi split producono la key uguale alla chiave (es. GR-Lot) mentre il repeatable uguale al progressivo senza id scheme (0001)
      // es. GR-Lot[0001]
      let key: string = input.substring(0, input.indexOf('['));
      let repeatable: string = input.substring(input.indexOf('[') + 5, input.length - 1);
      return {
        key: key,
        index: repeatable
      };
    } else {
      const regex: RegExp = /^(.*?)(?:\[(\d+)\])?$/;
      const match = input.match(regex);

      if (match) {
        const [, key, index] = match;
        return {
          key: key,
          index: index ? parseInt(index, 10) : undefined
        };
      }
    }

    return {
      key: input,
      index: undefined
    };
  }

  // #endregion
}
