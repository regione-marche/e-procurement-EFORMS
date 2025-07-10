import { inject, Injectable } from '@angular/core';
import { SdkLoggerService } from '@maggioli/sdk-commons';
import { IVisualModelElement } from '../models/app.model';
import { FormService } from '../services/form.service';

type CalculateCountFunction = (fieldId: string) => number;

@Injectable({ providedIn: 'root' })
export class ConditionLexer {
  // #region Variables

  private _formService: FormService = inject(FormService);

  private _sdkLoggerService: SdkLoggerService = inject(SdkLoggerService);

  // #endregion

  // #region Public

  /**
   * Metodo che valuta la condizione javascript generata da quella EFX
   * @param condition Condizione EFX
   * @param basicMetaDataFields Campi recuperati dal file "fields.json"
   * @param matchingElements Albero al quale applicate la condizione (tipo ricercare i valori dei campi delle condizioni)
   * @returns Risultato conditione
   */
  public evaluateCondition(
    condition: string,
    basicMetaDataFields: any,
    matchingElements: Array<IVisualModelElement>
  ): boolean {
    let result: boolean = false;

    let javascriptCondition: string = this.convertCondition(
      condition,
      basicMetaDataFields,
      matchingElements
    );

    if (javascriptCondition != null) {
      try {
        result = new Function('return ' + javascriptCondition)(); // NOSONAR
      } catch (e) {
        this._sdkLoggerService.error(
          `Errore durante la validazione della condizione ${condition}`,
          e
        );
      }
    }

    return result;
  }

  /**
   * Metodo che riceve una condizione EFX e la converte in una condizione valida javascript
   * NON sostituendo pero' il valore del/dei campo/i da valutare
   * @param condition Condizione EFX
   * @param basicMetaDataFields Campi recuperati dal file "fields.json"
   * @param matchingElements Albero al quale applicate la condizione (tipo ricercare i valori dei campi delle condizioni)
   * @returns Condizione javascript
   */
  public convertCondition(
    condition: string,
    basicMetaDataFields: any,
    matchingElements: Array<IVisualModelElement>
  ): string {
    let conditionConverted: string = condition;

    // Controllo casi

    // Caso mandatory senza condizioni
    conditionConverted = conditionConverted.replaceAll(
      '${true == TRUE}',
      'true'
    );

    // Caso TRUE
    conditionConverted = this.isTrueCond(conditionConverted);

    // Caso FALSE
    conditionConverted = this.isFalseCond(conditionConverted);

    // Caso isPresent
    conditionConverted = this.isPresentCond(conditionConverted);

    // Caso isNotPresent
    conditionConverted = this.isNotPresentCond(conditionConverted);

    // Caso or
    conditionConverted = this.orCond(conditionConverted);

    // Caso and
    conditionConverted = this.andCond(conditionConverted);

    // Caso not(<something> in <field with id scheme>)...
    conditionConverted = this.idSchemeCond(
      conditionConverted,
      basicMetaDataFields
    );

    // Caso count
    conditionConverted = this.countCond(
      conditionConverted,
      basicMetaDataFields
    );

    // Caso not
    conditionConverted = this.notCond(conditionConverted);

    // Caso not in
    conditionConverted = this.notInCond(conditionConverted);

    // Caso in
    conditionConverted = this.inCond(conditionConverted);

    // Recupero gli identificativi
    conditionConverted = this.replaceIdentifiers(
      conditionConverted,
      matchingElements
    );

    return conditionConverted;
  }

  public findMatchingElementById(
    elements: Array<IVisualModelElement>,
    contentId: string
  ): IVisualModelElement {
    for (const element of elements) {
      if (element.contentId === contentId) {
        return element;
      }
      if (element.children && element.children.length > 0) {
        const foundInChildren = this.findMatchingElementById(
          element.children,
          contentId
        );
        if (foundInChildren) {
          return foundInChildren;
        }
      }
    }
    return undefined;
  }

  // #endregion

  // #region Private

  private isTrueCond(condition: string): string {
    return condition.replaceAll('== TRUE', '== true');
  }

  private isFalseCond(condition: string): string {
    return condition.replaceAll('== FALSE', '== false');
  }

  private isPresentCond(condition: string): string {
    return condition.replaceAll('is present', '!= null');
  }

  private isNotPresentCond(condition: string): string {
    return condition.replaceAll('is not present', '== null');
  }

  private orCond(condition: string): string {
    return condition.replaceAll(' or ', ' || ');
  }

  private andCond(condition: string): string {
    return condition.replaceAll(' and ', ' && ');
  }

  private notCond(condition: string): string {
    let conditionConverted: string = condition;

    if (conditionConverted.includes('not(')) {
      // Regular expression to match 'not(' followed by any characters until the next ')'
      const notRegex = /not\((.*?)\)/g;

      // Replace all occurrences of 'not(...)' with '!(...)'
      conditionConverted = condition.replace(
        notRegex,
        (match, p1) => `!(${p1})`
      );
    }
    return conditionConverted;
  }

  private inCond(condition: string): string {
    let conditionConverted: string = condition;
    let conditionType: string = ' in ';

    if (conditionConverted.includes(conditionType)) {
      conditionConverted = this.inCondPart(conditionType, conditionConverted);
    }

    return conditionConverted;
  }

  private notInCond(condition: string): string {
    let conditionConverted: string = condition;
    let conditionType: string = ' not in ';

    if (conditionConverted.includes(conditionType)) {
      conditionConverted = this.inCondPart(conditionType, conditionConverted);

      conditionConverted = `!(${conditionConverted})`;
    }

    return conditionConverted;
  }

  private inCondPart(condType: string, cond: string): string {
    let conditionConverted: string = cond;

    if (conditionConverted.includes(condType)) {
      let inRegex: RegExp;
      if (condType == ' in ') {
        inRegex = /\s+in\s+\((.*?)\)/;
      } else if (condType == ' not in ') {
        inRegex = /\s+not\s+in\s+\((.*?)\)/i;
      }
      const match = conditionConverted.match(inRegex);
      if (match) {
        const identifier = conditionConverted
          .split(condType)[0]
          .replaceAll('!', '')
          .replaceAll('(', '')
          .replaceAll(')', '')
          .replaceAll('[', '')
          .replaceAll(']', '')
          .trim();
        const conditions = match[1];

        // Bypass condizioni non verificabili
        if (conditions == 'nuts-country') {
          return 'true';
        }

        // Extract the values from the parentheses
        const values = conditions
          .split(',')
          .map((v) => v.trim().replace(/'/g, ''));

        // Create the JavaScript condition
        const newCondition = `${identifier} == "${values.join(
          `" || ${identifier} == "`
        )}"`;

        // TODO: devo trovare un metodo migliore per aggiungere l'identifier all'inizio della regex
        if (condType == ' in ') {
          inRegex = new RegExp(`${identifier}\\s+in\\s+\\((.*?)\\)`);
        } else if (condType == ' not in ') {
          inRegex = new RegExp(`${identifier}\\s+not\\s+in\\s+\\((.*?)\\)`);
        }

        // Replace only the content inside the parentheses
        conditionConverted = conditionConverted.replace(
          inRegex,
          `(${newCondition})`
        );
      }
    }

    return conditionConverted;
  }

  private idSchemeCond(condition: string, basicMetaDataFields: any): string {
    const replaceIdSchemeCondition = (
      conditionString: string,
      replacementFn: (extracted: string) => string
    ): string => {
      const regex = /(?:not\()?(\S+-\d+-[\w-]+ in \S+-\d+-[\w-]+)(?:\))?/;

      return conditionString.replace(regex, (match, extracted) => {
        const replacement = replacementFn(extracted);
        if (match.startsWith('not(') && match.endsWith(')')) {
          return `not(${replacement})`;
        }
        return replacement;
      });
    };

    return replaceIdSchemeCondition(condition, (extracted: string) => {
      let conditionType: string = ' in ';
      const [identifier, conditions] = extracted.split(conditionType);
      let idSchemeValues: Array<string> = this.getIdSchemeValuesByFieldId(
        conditions,
        basicMetaDataFields
      );
      return `${identifier} == "${idSchemeValues.join(
        '" || ' + identifier + ' == "'
      )}"`;
    });
  }

  private countCond(condition: string, basicMetaDataFields: any): string {
    const calculateCount: CalculateCountFunction = (
      fieldId: string
    ): number => {
      let idSchemeValues: Array<string> = this.getIdSchemeValuesByFieldId(
        fieldId,
        basicMetaDataFields
      );
      return idSchemeValues ? idSchemeValues.length : 0;
    };

    const replaceCountCond = (
      condition: string,
      calculateCount: CalculateCountFunction
    ): string => {
      return condition.replace(/count\((.*?)\)/g, (match, p1) => {
        // p1 contains the content inside the parentheses
        const count = calculateCount(p1);
        return count.toString();
      });
    };

    return replaceCountCond(condition, calculateCount);
  }

  private replaceIdentifiers(
    condition: string,
    matchingElements: Array<IVisualModelElement>
  ): string {
    let conditionConverted: string = condition;

    // Fields regex
    const regex = /(BT-|OPT-|OPP-|OPA-)(\S*)/g;

    conditionConverted = conditionConverted.replace(
      regex,
      (match: string, _prefix: string, _rest: string) => {
        let elem: IVisualModelElement = this.findMatchingElementById(
          matchingElements,
          match
        );

        let value: any = match;

        if (elem != null) value = elem.value;

        if (value == '') value = null;

        if (value != null) value = `"${value}"`;

        return value;
      }
    );

    return conditionConverted;
  }

  // #endregion

  // #region Utils

  /**
   * Metodo che dato un id di un campo recupera il contenuto del metadata e per ogni id scheme associato
   * recupera tutti i valori creati e usati nella form
   * @param fieldId Id del campo
   * @returns Lista valori id scheme
   */
  private getIdSchemeValuesByFieldId(
    fieldId: string,
    basicMetaDataFields: any
  ): Array<string> {
    let sdkField = basicMetaDataFields[fieldId];
    let values: Array<string> = new Array();
    if (sdkField && sdkField.idSchemes && sdkField.idSchemes.length > 0) {
      values = sdkField.idSchemes.flatMap((idScheme: string) => {
        return this._formService.getIdField(idScheme);
      });
    }
    return values;
  }

  // #endregion
}
