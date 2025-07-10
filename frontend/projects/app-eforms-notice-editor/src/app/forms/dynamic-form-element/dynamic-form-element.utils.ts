import { inject, Injectable } from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { TreeNode } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { ResponseResult } from '../../models/api.model';
import { ExtendedFormControl, IComboboxOption, InvalidField } from '../../models/app.model';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';
import { FormService } from '../../services/form.service';

@Injectable({ providedIn: 'root' })
export class DynamicFormElementUtils {
  private _dataService: DataService = inject(DataService);
  private _apiService: ApiService = inject(ApiService);

  private _formService: FormService = inject(FormService);

  // #region Public

  /**
   * Metodo per gestire l'input dell'importo.
   * @param inputElem - Elemento HTML dell'input.
   * @param form - FormControl.
   * @param presetValue - Valore predefinito (opzionale).
   */
  public amountInput(inputElem: HTMLElement, form: ExtendedFormControl<InvalidField>) {
    this.numberInput(inputElem, form); // Richiama il metodo numberInput per impostare l'input numerico.
  }

  public dropdownInput(
    inputElem: HTMLElement,
    content: any,
    field: any,
    form: ExtendedFormControl<InvalidField>
  ): Observable<Array<string>> {
    let language: string = this._dataService.selectedLang; // Lingua selezionata.
    let codeListId: string = field.codeList.value.id; // ID della lista dei codici.
    let sdkVersion = this._dataService.selectedSdkVersion; // Versione SDK selezionata.

    return this._apiService.loadCodeLists(sdkVersion, language, codeListId).pipe(
      map((response: ResponseResult<IDictionary<any>>) => {
        // Mappa la risposta dell'API.
        let data: IDictionary<any> = response.data; // Dati della risposta.

        return data.codes.map((code: any) => {
          let obj: IComboboxOption = {
            key: code.codeValue,
            label: code[language]
          };
          return obj;
        });
      })
    );
  }

  // RIMOSSO IN EFORMS-88
  // /**
  //  * Metodo per gestire l'input del codice.
  //  * @param inputElem - Elemento HTML dell'input.
  //  * @param content - Contenuto da popolare.
  //  * @param field - Campo del codice.
  //  * @param form - FormControl.
  //  * @returns Observable di un array di codici.
  //  */
  // public codeInput(
  //   inputElem: HTMLElement,
  //   content: any,
  //   field: any,
  //   form: ExtendedFormControl<InvalidField>
  // ): Observable<Array<IComboboxOption>> {
  //   let language: string = this._dataService.selectedLang; // Lingua selezionata.
  //   let codeListId: string = field.codeList.value.id; // ID della lista dei codici.
  //   let sdkVersion = this._dataService.selectedSdkVersion; // Versione SDK selezionata.

  //   return this._apiService.loadCodeLists(sdkVersion, language, codeListId).pipe(
  //     map((response: ResponseResult<IDictionary<any>>) => {
  //       // Mappa la risposta dell'API.
  //       let data: IDictionary<any> = response.data; // Dati della risposta.
  //       this.populateCombo(
  //         inputElem,
  //         content,
  //         data.codes.map((code: any) => {
  //           let obj: IComboboxOption = {
  //             key: code.codeValue,
  //             label: code[language]
  //           };
  //           return obj;
  //         }), // Popola i codici nella combo.
  //         form,
  //         true
  //       );

  //       return data.codes.map((code: any) => {
  //         let obj: IComboboxOption = {
  //           key: code.codeValue,
  //           label: code[language]
  //         };
  //         return obj;
  //       });
  //     })
  //   );
  // }

  /**
   * Metodo per gestire l'input del codice per la selezione ad albero.
   * @param content - Contenuto da popolare.
   * @param field - Campo del codice.
   * @param form - FormControl.
   * @returns Observable di un array di nodi dell'albero.
   */
  public codeInputForTreeSelect(
    content: any,
    field: any,
    form: ExtendedFormControl<InvalidField>
  ): Observable<TreeNode<any>[]> {
    let language: string = this._dataService.selectedLang; // Lingua selezionata.
    let codeListId: string = field.codeList.value.id; // ID della lista dei codici.
    let sdkVersion = this._dataService.selectedSdkVersion; // Versione SDK selezionata.
    return this._apiService.loadCodeLists(sdkVersion, language, codeListId).pipe(
      map((response: ResponseResult<IDictionary<any>>) => {
        // Mappa la risposta dell'API.
        let data: IDictionary<any> = response.data; // Dati della risposta.
        const nodes = this.populateComboForTree(
          content,
          data.codes.map((code: any) => [code.codeValue, code[language], code.parentCode]),
          form
        );

        return nodes;
      })
    );
  }

  /**
   * Metodo per gestire l'input della data.
   * @param inputElem - Elemento HTML dell'input.
   * @param form - FormControl.
   * @param presetValue - Valore predefinito (opzionale).
   */
  public dateInput(inputElem: HTMLElement, form: ExtendedFormControl<InvalidField>) {
    const inputElement = inputElem as HTMLInputElement;
    inputElement.setAttribute('type', 'date'); // Imposta il tipo dell'input come data.
    if (form.value != null) {
      console.log(form.value);
      form.patchValue(form.value); // Applica il valore del form se esiste.
    }
  }

  /**
   * Metodo per gestire l'input dell'email.
   * @param inputElem - Elemento HTML dell'input.
   * @param field - Campo dell'email.
   * @param form - FormControl.
   * @param presetValue - Valore predefinito (opzionale).
   */
  public emailInput(inputElem: HTMLElement, field: any, form: ExtendedFormControl<InvalidField>) {
    const inputElement = inputElem as HTMLInputElement;
    this.textInput(inputElem, field, form); // Utilizza textInput per gestire l'input di testo.
    if (form.value != null) {
      form.patchValue(form.value); // Applica il valore del form se esiste.
    }
  }

  /**
   * Metodo per gestire l'input dell'ID.
   * @param inputElem - Elemento HTML dell'input.
   * @param content - Contenuto.
   * @param form - FormControl.
   * @returns Valore dell'ID.
   */
  public idInput(inputElem: HTMLElement, content: any, form: ExtendedFormControl<InvalidField>): string {
    if (form.value != null) {
      form.patchValue(form.value); // Applica il valore del form se esiste.
    }

    if (content._idScheme) {
      inputElem.setAttribute('data-id-scheme', content._idScheme); // Imposta l'attributo dello schema ID.
      const value = form.value ?? this._formService.requestNewIdField(content._idScheme);

      if (form.value === null) {
        form.patchValue(value); // Applica un nuovo valore ID se non esiste.
      }

      return value;
    }
    return null;
  }

  // TOLTO IN EFORMS-88
  // /**
  //  * Metodo per gestire il nuovo input di riferimento dell'ID.
  //  * @param inputElem - Elemento HTML dell'input.
  //  * @param content - Contenuto.
  //  * @param elements - Array di elementi di riferimento.
  //  * @param form - FormControl.
  //  */
  // public idRefInput(
  //   inputElem: HTMLElement,
  //   content: any,
  //   elements: Array<IComboboxOption>,
  //   form: ExtendedFormControl<InvalidField>
  // ) {
  //   const idSchemes: Array<any> = content._idSchemes;
  //   if (idSchemes && idSchemes.length > 0) {
  //     inputElem.setAttribute('data-editor-id-reference', JSON.stringify(idSchemes));
  //     for (const idScheme of idSchemes) {
  //       inputElem.setAttribute(`data-editor-id-ref-${idScheme}`, 'true'); // Imposta gli attributi di riferimento ID.
  //     }
  //   }
  //   inputElem.classList.add('id-ref-input-field'); // Aggiunge una classe CSS specifica.

  //   if (idSchemes) {
  //     let idSchemesAttribute = idSchemes.join(',');
  //     inputElem.setAttribute(Constants.Attributes.ID_SCHEMES_ATTRIBUTE, idSchemesAttribute);

  //     if (idSchemes?.length < 1) {
  //       return;
  //     }

  //     this.populateCombo(inputElem, content, elements, form, true);
  //   }
  // }

  /**
   * Metodo per gestire l'input dell'indicatore.
   * @param inputElem - Elemento HTML dell'input.
   * @param content - Contenuto.
   * @param uniqueIdentifier - Identificatore univoco.
   */
  public indicatorInput(inputElem: HTMLElement, content: any, uniqueIdentifier: string) {
    const whenTrue = this._dataService.getLabel(`indicator|when-true`); // Etichetta per il valore vero.
    const whenFalse = this._dataService.getLabel(`indicator|when-false`); // Etichetta per il valore falso.
    this.populateRadio(
      inputElem,
      content,
      uniqueIdentifier,
      new Map([
        ['true', whenTrue],
        ['false', whenFalse]
      ])
    );
  }

  /**
   * Metodo per gestire l'input di un numero intero.
   * @param inputElem - Elemento HTML dell'input.
   * @param form - FormControl.
   * @param presetValue - Valore predefinito (opzionale).
   */
  public integerInput(inputElem: HTMLElement, form: ExtendedFormControl<InvalidField>): void {
    this.numberInput(inputElem, form); // Richiama il metodo numberInput per impostare l'input numerico.
    inputElem.setAttribute('step', '1'); // Imposta l'attributo step per incrementare di 1.
  }

  /**
   * Metodo vuoto per gestire l'input delle misure.
   */
  public measureInput() {}

  /**
   * Metodo per gestire l'input di un numero.
   * @param inputElem - Elemento HTML dell'input.
   * @param form - FormControl.
   * @param presetValue - Valore predefinito (opzionale).
   */
  public numberInput(inputElem: HTMLElement, form: ExtendedFormControl<InvalidField>): void {
    const inputElement = inputElem as HTMLInputElement;
    inputElement.type = 'number'; // Imposta il tipo dell'input come numerico.
    inputElement.step = 'any'; // Permette qualsiasi valore numerico, inclusi i decimali.

    if (form.value != null) {
      form.patchValue(form.value); // Applica il valore del form se esiste.
    }
  }

  /**
   * Metodo per gestire l'input del numero di telefono.
   * @param inputElem - Elemento HTML dell'input.
   * @param field - Campo del numero di telefono.
   * @param form - FormControl.
   * @param presetValue - Valore predefinito (opzionale).
   */
  public phoneInput(inputElem: HTMLElement, field: any, form: ExtendedFormControl<InvalidField>) {
    this.textInput(inputElem, field, form); // Utilizza textInput per gestire l'input di testo.
  }

  /**
   * Metodo per gestire l'input di testo.
   * @param inputElem - Elemento HTML dell'input.
   * @param field - Campo di testo.
   * @param form - FormControl.
   * @param presetValue - Valore predefinito (opzionale).
   */
  public textInput(inputElem: HTMLElement, field: any, form: ExtendedFormControl<InvalidField>) {
    const inputElement = inputElem as HTMLInputElement;
    inputElement.setAttribute('lang', this._dataService.selectedLang); // Imposta la lingua dell'input.
    if (form.value != null) {
      form.patchValue(form.value); // Applica il valore del form se esiste.
    }
    if (field.maxLength) {
      inputElement.setAttribute('maxlength', field.maxLength); // Imposta la lunghezza massima dell'input se esiste.
    }
  }

  /**
   * Metodo per gestire l'input di testo multilingue.
   * @param inputElem - Elemento HTML dell'input.
   * @param field - Campo di testo.
   * @param form - FormControl.
   * @param presetValue - Valore predefinito (opzionale).
   */
  public textMultilingualInput(inputElem: HTMLElement, field: any, form: ExtendedFormControl<InvalidField>) {
    this.textInput(inputElem, field, form); // Utilizza textInput per gestire l'input di testo.
  }

  /**
   * Metodo per gestire l'input dell'ora.
   * @param inputElem - Elemento HTML dell'input.
   * @param form - FormControl.
   * @param presetValue - Valore predefinito (opzionale).
   */
  public timeInput(inputElem: HTMLElement, form: ExtendedFormControl<InvalidField>) {
    const inputElement = inputElem as HTMLInputElement;
    inputElement.setAttribute('type', 'time'); // Imposta il tipo dell'input come orario.

    if (form.value != null) {
      form.patchValue(form.value); // Applica il valore del form se esiste.
    }
  }

  /**
   * Metodo per gestire l'input dell'URL.
   * @param inputElem - Elemento HTML dell'input.
   * @param field - Campo dell'URL.
   * @param form - FormControl.
   * @param presetValue - Valore predefinito (opzionale).
   */
  public urlInput(inputElem: HTMLElement, field: any, form: ExtendedFormControl<InvalidField>) {
    this.textInput(inputElem, field, form); // Utilizza textInput per gestire l'input di testo.
  }

  // #endregion

  // #region Private

  // RIMOSSO IN EFORMS-88
  // /**
  //  * Metodo per popolare una combo box.
  //  * @param inputElem - Elemento HTML dell'input.
  //  * @param content - Contenuto.
  //  * @param map - Mappa di coppie chiave/valore per popolare le opzioni.
  //  * @param form - FormControl.
  //  * @param addEmptyOption - Aggiungi un'opzione vuota (opzionale).
  //  */
  // public populateCombo(
  //   inputElem: HTMLElement,
  //   content: any,
  //   options: Array<IComboboxOption>,
  //   form: ExtendedFormControl<InvalidField>,
  //   addEmptyOption = false
  // ) {
  //   // this._formService.dictionaryOfAllSuggestedCombobox[content.id] = map[0][0];
  //   // if (form.value) {
  //   //   console.log(content.id, form.value);
  //   // }

  //   if (addEmptyOption) {
  //     inputElem.appendChild(this.createOption('', '')); // Aggiunge un'opzione vuota se richiesto.
  //   }

  //   // Inserisce il resto delle opzioni nell'elemento, esclusa quella precedentemente caricata.
  //   options.forEach((opt: IComboboxOption) => {
  //     inputElem.appendChild(this.createOption(opt.key, opt.label));
  //   });
  //   // for (const item of options) {
  //   //   if (item[0] != null) {
  //   //     inputElem.appendChild(this.createOption(item[0], item[1]));
  //   //   }
  //   // }
  //   // Default values
  //   // BT-01-notice
  //   if (content.id == Constants.StandardIdentifiers.LEGAL_BASIS_TYPE_FIELD) {
  //     form.patchValue(this._dataService.selectedNoticeSubType['legalBasis']);
  //     (inputElem as any).disabled = true;
  //   }
  //   // BT-26(m)-Procedure and BT-26(m)-Lot
  //   else if (
  //     content.id == Constants.StandardIdentifiers.CPV_PROCEDURE_FIELD ||
  //     content.id == Constants.StandardIdentifiers.CPV_LOT_FIELD
  //   ) {
  //     form.patchValue('cpv');
  //     (inputElem as any).disabled = true;
  //   }
  //   //popola con italiano la le combobox relative alla lingua e le mette readonly
  //   else if (content.id.endsWith('-Language')) {
  //     const selectedLangIso6393 = I18N.Iso6391ToIso6393Map[this._dataService.selectedLang];
  //     form.patchValue(selectedLangIso6393);
  //     (inputElem as any).disabled = true;
  //   }
  //   //popola con currency euro la le combobox relative alla valuta e le mette readonly
  //   else if (content.id.endsWith('-Currency')) {
  //     form.patchValue(this._dataService.defaultCurrency);
  //     (inputElem as any).disabled = true;
  //   } else if (form.value != null) {
  //     let presetValue = form.value ?? content.presetValue;

  //     if (presetValue != null) {
  //       // options.some((item: IComboboxOption) => {
  //       //   if (presetValue.startsWith(item.label.split(',')[0])) {
  //       //     presetValue = item[0];
  //       //   }
  //       // });

  //       form.patchValue(presetValue); // Aggiorna il valore del form se non nullo.
  //     }
  //   }
  // }

  /**
   * Metodo per popolare una combo box in una struttura ad albero.
   * @param content - Contenuto da popolare.
   * @param map - Mappa di coppie chiave/valore per popolare i nodi.
   * @param form - FormControl.
   * @returns Array di nodi dell'albero.
   */
  private populateComboForTree(content: any, map: any, form: ExtendedFormControl<InvalidField>): TreeNode[] {
    const nodes: TreeNode[] = [];
    const nodeMap: { [key: string]: TreeNode } = {};

    console.log(form.value, content.presetValue);

    for (const item of map) {
      const displayed = item[1] + ' - [' + item[0] + ']';
      const node = this.createNodeForTree(item[0], displayed);

      // Se il nodo corrente ha un padre (item[2]), trovo il padre e rendo il nodo corrente un figlio del nodo padre.
      if (item[2]) {
        const parentNode = nodeMap[item[2]]; // Trovo il nodo padre tramite la mappa.
        if (parentNode) {
          parentNode.children.push(node); // Rendo il nodo corrente un figlio del nodo padre.
        }
      } else {
        // Se non ha un padre è un nodo root.
        nodes.push(node);
      }

      // Salvo la chiave del nodo corrente per utilizzo futuro.
      nodeMap[item[0]] = node;
    }

    const presetValue = form.value ?? content.presetValue;
    if (presetValue != null) {
      form.patchValue(presetValue); // Aggiorna il valore del form se non nullo.
    }

    return nodes;
  }

  /**
   * Metodo per creare un nodo per la struttura ad albero.
   * @param key - Chiave del nodo.
   * @param label - Etichetta del nodo.
   * @param children - Array di nodi figli (opzionale).
   * @returns Nodo dell'albero.
   */
  private createNodeForTree(key: any, label: string, children: TreeNode[] = []): TreeNode {
    return {
      key: key,
      label: label,
      children: children
    };
  }

  /**
   * Metodo per creare una option HTML.
   * @param key - Valore option.
   * @param label - Etichetta option.
   * @returns Elemento option.
   */
  private createOption(key: any, label: string) {
    const option = document.createElement('option');
    option.setAttribute('value', key);
    option.textContent = label;
    return option;
  }

  /**
   * Metodo per ottenere la lista dei codici.
   * @param codeListId - ID della lista dei codici.
   * @returns Lista dei codici.
   */
  private getCodelist(codeListId: string) {
    return this._dataService.codeLists[codeListId];
  }

  /**
   * Metodo per popolare i pulsanti radio.
   * @param inputElem - Elemento HTML dell'input.
   * @param content - Contenuto.
   * @param uniqueIdentifier - Identificatore univoco.
   * @param map - Mappa di coppie chiave/valore per popolare i pulsanti radio.
   */
  private populateRadio(inputElem: HTMLElement, content: any, uniqueIdentifier: any, map: any) {
    for (const item of map) {
      inputElem.appendChild(this.createRadioButton(content, uniqueIdentifier, item[0], item[1]));
    }
  }

  private createRadioButton(content: any, uniqueIdentifier: string, key: any, label: string) {
    const radioButtonElement = document.createElement('input');
    radioButtonElement.setAttribute('type', 'radio');
    radioButtonElement.setAttribute('value', key);
    radioButtonElement.setAttribute('name', content?.id);
    radioButtonElement.setAttribute('id', `${uniqueIdentifier}-${key}`);

    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    labelElement.appendChild(radioButtonElement);

    const presetValue = content.presetValue;
    if (presetValue && presetValue === key) {
      radioButtonElement.setAttribute('checked', 'checked');
    }

    return labelElement;
  }

  // #endregion
}
