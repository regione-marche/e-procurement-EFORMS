export class CommonUtils {
  /**
   * Verifica se il campo sdk passato ha un vincolo "forbidden" con severity = error con una condizione valida
   * @param noticeType tipologia di notifica
   * @param metadataField il campo di metadata
   * @returns il risultato
   */
  public static checkForbiddenFieldOnCondition(
    noticeType: string,
    metadataField: any
  ): boolean {
    if (!metadataField) return false;

    let hasForbiddenProperty: boolean =
      metadataField.forbidden && metadataField.forbidden.severity === 'ERROR';

    if (!hasForbiddenProperty) return false;

    // dato che devo rimuovere le condizioni di obbligatorieta' se ho una forbidden property con condizione
    // e demandare al backend la verifica effettiva dopo la generazione del modello visuale, non verifico
    // la severita' ad error altrimenti se ce ne fosse una solo a warn non andrei a rimuovere il vincolo
    // di obbligatorieta'
    let result: Array<any> = metadataField.forbidden.constraints.filter(
      (c: any) => c.condition && c.noticeTypes.includes(noticeType)
    );
    return result && result.length > 0;
  }
}
