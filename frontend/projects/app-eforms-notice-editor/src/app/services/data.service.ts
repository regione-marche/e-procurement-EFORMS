import { Injectable } from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { get, has, set } from 'lodash-es';
import { I18N } from '../app.constants';
import { HomePageInfoDTO, INoticeTypeItemNode } from '../models/api.model';
import { IFieldCondition, IFieldSingleCondition } from '../models/app.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // #region Variables

  private _info: HomePageInfoDTO;
  private _selectedSdkVersion: string;
  private _noticeTypes: any;
  private _basicMetaData: any;
  private _basicMetaDataFields: any;
  private _codeLists: any;
  private _selectedNotice: string;
  private _selectedNoticeType: any;
  private _selectedNoticeSubType: any;
  private _translations: any;
  private _uploadedJsonContent: any;
  private _selectedLang: string;
  private _editorCountMap: IDictionary<number> = {};
  private _excludedMandatoryFields: Array<string> = [];
  private _standaloneRettifica: boolean = false;
  /*
    Prima chiave: Notice ID
    Seconda chiave: Field ID
    Ultimo valore: Oggetto contenente le condizioni del campo
  */
  private _fieldsConditions: IDictionary<IDictionary<IFieldCondition>>;

  private _basicMetadataXmlStructure: Array<any>;
  private _groupsLabels: IDictionary<string>;
  private _groupsNodeIdLabels: IDictionary<string>;
  private _fieldsLabels: IDictionary<string>;
  private _suggestedFieldsMap: IDictionary<Array<string>> = {};
  private _requiredFieldsList: Array<string> = [];
  private _suggestedAndObligatoryFieldsWithValues: IDictionary<Array<string>> =
    {};
  private _defaultCurrency: string;

  // #endregion

  constructor() {}

  // #region Getters/Setters

  public get info(): HomePageInfoDTO {
    return this._info;
  }
  public set info(value: HomePageInfoDTO) {
    this._info = value;
  }
  public get selectedSdkVersion(): string {
    return this._selectedSdkVersion;
  }
  public set selectedSdkVersion(value: string) {
    this._selectedSdkVersion = value;
  }

  public get noticeTypes(): any {
    return this._noticeTypes;
  }
  public set noticeTypes(value: any) {
    this._noticeTypes = value;
  }
  public get basicMetaData(): any {
    return this._basicMetaData;
  }
  public set basicMetaData(value: any) {
    this._basicMetaData = value;
    if (value != null) {
      this._basicMetaDataFields = Object.fromEntries(
        value.fieldsJson.fields.map((field: any) => [field.id, field])
      );
      this._codeLists = Object.fromEntries(
        value.codelistsJson.codelists.map((codelist: any) => [
          codelist.id,
          codelist
        ])
      );

      this._basicMetadataXmlStructure = this.buildHierarchyStrings(
        value.fieldsJson.xmlStructure
      );
    }
  }
  public get basicMetaDataFields(): any {
    return this._basicMetaDataFields;
  }
  public set basicMetaDataFields(value: any) {
    this._basicMetaDataFields = value;
  }
  public get codeLists(): any {
    return this._codeLists;
  }
  public set codeLists(value: any) {
    this._codeLists = value;
  }
  public get selectedNotice(): string {
    return this._selectedNotice;
  }
  public set selectedNotice(value: string) {
    this._selectedNotice = value;
  }
  public get selectedNoticeType(): any {
    return this._selectedNoticeType;
  }
  public set selectedNoticeType(value: any) {
    this._selectedNoticeType = value;

    // Indicizzo l'oggetto per ottenere tutte le labels e usarle in un secondo momento durante la validazione

    if (this.translations != null) {
      const { groups, groupsNodeId, fields } = this.loadNoticeLabels(
        this._selectedNoticeType.content
      );

      this.groupsLabels = groups;
      this.groupsNodeIdLabels = groupsNodeId;
      this.fieldsLabels = fields;
    }
  }
  public get selectedNoticeSubType(): any {
    return this._selectedNoticeSubType;
  }
  public set selectedNoticeSubType(value: any) {
    this._selectedNoticeSubType = value;
  }
  public get uploadedJsonContent(): any {
    return this._uploadedJsonContent;
  }
  public set uploadedJsonContent(value: any) {
    this._uploadedJsonContent = value;
  }
  public get translations(): any {
    return this._translations;
  }
  public set translations(value: any) {
    this._translations = value;
    // Load visNodeId
  }
  public get selectedLang(): string {
    return this._selectedLang;
  }
  public set selectedLang(value: string) {
    this._selectedLang = value;
  }

  public get fieldsConditions(): IDictionary<IDictionary<IFieldCondition>> {
    return this._fieldsConditions;
  }

  public get basicMetadataXmlStructure(): Array<any> {
    return this._basicMetadataXmlStructure;
  }

  public get groupsLabels(): IDictionary<string> {
    return this._groupsLabels;
  }
  public set groupsLabels(value: IDictionary<string>) {
    this._groupsLabels = value;
  }

  public get groupsNodeIdLabels(): IDictionary<string> {
    return this._groupsNodeIdLabels;
  }
  public set groupsNodeIdLabels(value: IDictionary<string>) {
    this._groupsNodeIdLabels = value;
  }

  public get fieldsLabels(): IDictionary<string> {
    return this._fieldsLabels;
  }
  public set fieldsLabels(value: IDictionary<string>) {
    this._fieldsLabels = value;
  }

  public get suggestedFieldsMap(): IDictionary<Array<string>> {
    return this._suggestedFieldsMap;
  }
  public set suggestedFieldsMap(value: IDictionary<Array<string>>) {
    this._suggestedFieldsMap = value;
  }

  public get requiredFieldsList(): Array<string> {
    return this._requiredFieldsList;
  }
  public set requiredFieldsList(value: Array<string>) {
    this._requiredFieldsList = value;
  }

  public get suggestedAndObligatoryFieldsWithValues(): IDictionary<
    Array<string>
  > {
    return this._suggestedAndObligatoryFieldsWithValues;
  }
  public set suggestedAndObligatoryFieldsWithValues(
    value: IDictionary<Array<string>>
  ) {
    this._suggestedAndObligatoryFieldsWithValues = value;
  }

  public get defaultCurrency(): string {
    return this._defaultCurrency;
  }
  public set defaultCurrency(value: string) {
    this._defaultCurrency = value;
  }

  public get standaloneRettifica(): boolean {
    return this._standaloneRettifica;
  }

  public set standaloneRettifica(value: boolean) {
    this._standaloneRettifica = value;
  }

  // #endregion

  // #region Public

  public addOrIncrementFieldEditorCount(id: string): number {
    let currentCount: number;
    if (has(this._editorCountMap, id)) {
      currentCount = get(this._editorCountMap, id);
      currentCount++;
      set(this._editorCountMap, id, currentCount);
    } else {
      set(this._editorCountMap, id, 1);
      currentCount = get(this._editorCountMap, id);
    }
    return currentCount;
  }

  public getLabel(labelId: string) {
    var applicationLabels = I18N.labels[this.selectedLang ?? 'it'];
    //Creo un dizionario delle label che non sono state tradotte in italiano e le inserisco manualmente
    let customLabels: IDictionary<string> = {};
    if (this.selectedLang == 'it' || this.selectedLang == null) {
      customLabels = {
        'group|name|ND-ProcedurePlacePerformance': 'Luogo di esecuzione',
        'group|name|ND-ExclusionGroundsSource':
          'Fonte dei motivi di esclusione (indicare dove sono specificati i motivi di esclusione)',
        'group|name|ND-SelectionCriteriaSource':
          'Fonte dei criteri di selezione (indicare dove sono specificati i criteri di selezione)',
        'group|name|GR-FSR-Measures':
          "Misure di regolamentazione delle sovvenzioni estere nelle gare d'appalto"
      };
    }
    return (
      customLabels[labelId] ??
      applicationLabels[labelId] ??
      this._translations[labelId] ??
      labelId
    );
  }

  public isMandatoryExcluded(fieldId: string): boolean {
    return this._excludedMandatoryFields.includes(fieldId);
  }

  public reset(): void {
    this._selectedSdkVersion = null;
    this._noticeTypes = null;
    this._basicMetaData = null;
    this._basicMetaDataFields = null;
    this._codeLists = null;
    this._selectedNotice = null;
    this._selectedNoticeType = null;
    this._selectedNoticeSubType = null;
    this._translations = null;
    this._selectedLang = null;
    this._editorCountMap = {};
    this._standaloneRettifica = false;
  }

  /**
   * Metodo che per un determinato nodo indicato dal targetId ritorna la gerarchia compresa da ancestorId o ND-Root
   * @param targetId Nodo da verificare (es. nodo della condizione ND-ProcedurePlacePerformance)
   * @param ancestorId Nodo genitore nel quale il targetId potrebbe essere incluso (es. ND-ProcedurePlacePerformanceAdditionalInformation)
   * @returns Il risultato dell'operazione
   */
  public getXmlStructureAncestor(
    targetId: string,
    ancestorId: string
  ): Array<string> {
    if (targetId == 'ND-Root') return ['ND-Root'];

    let filtered: Array<string> = this._basicMetadataXmlStructure.filter(
      (node: string) => {
        return (
          node.endsWith(`|${targetId}`) && node.includes(`|${ancestorId}|`)
        );
      }
    );
    return filtered;
  }

  /**
   * Metodo che carica in una mappa gruppo -> campo -> lista di condizioni le forbidden e mandatory constraints
   * che contengono conditions
   */
  public initializeConditions(): void {
    this._fieldsConditions = this.fillWithNotices();

    const fields = this._basicMetaData.fieldsJson.fields;
    if (!fields?.length) return;

    fields.forEach((field: any) => {
      this.processFieldConstraints(field, this._fieldsConditions, 'forbidden');
      this.processFieldConstraints(field, this._fieldsConditions, 'mandatory');
    });
  }

  /**
   * Metodo che carica la mappa { enotice-type -> lista di campi suggested }
   */
  public elaborateSuggestedFields(
    suggestedFieldsConfig: IDictionary<Array<string>>
  ): void {
    this.suggestedFieldsMap = suggestedFieldsConfig;
  }

  /**
   * Metodo che carica la lista di campi required da mostrare nella form con (*)
   */
  public elaborateRequiredFields(requiredFields: Array<string>): void {
    this.requiredFieldsList = requiredFields;
  }

  public elaborateSuggestedAndObligatoryFieldsWithValues(
    suggestedAndObligatoryFieldsWithValues: IDictionary<Array<string>>
  ): void {
    this._suggestedAndObligatoryFieldsWithValues =
      suggestedAndObligatoryFieldsWithValues;
  }

  // #endregion

  // #region Private

  private extractConditionParts(initialCondition: string): any {
    const groupRegex = /\{([^}]+)\}/;
    const conditionRegex = /\$\{([^}]+)\}/;

    const groupMatch = initialCondition.match(groupRegex);
    const conditionMatch = initialCondition.match(conditionRegex);

    const parentId = groupMatch ? groupMatch[1] : null;
    const realCondition = conditionMatch ? conditionMatch[1] : null;

    return { parentId, realCondition };
  }

  private fillWithNotices(): IDictionary<IDictionary<IFieldCondition>> {
    let noticeTypeMap: IDictionary<IDictionary<IFieldCondition>> = {};

    if (!this.noticeTypes?.noticeTypes) {
      return noticeTypeMap;
    }

    this.noticeTypes.noticeTypes.reduce((acc: any, noticeType: string) => {
      acc[noticeType] = {};
      return acc;
    }, noticeTypeMap);

    return noticeTypeMap;
  }

  private processFieldConstraints(
    field: any,
    conditions: IDictionary<IDictionary<IFieldCondition>>,
    constraintType: 'forbidden' | 'mandatory'
  ): void {
    if (!field[constraintType]?.constraints) return;

    field[constraintType].constraints.forEach((constraint: any) => {
      if (
        constraint.noticeTypes &&
        constraint.noticeTypes.includes(this.selectedNotice)
      ) {
        // carico solamente che hanno la notice type che ho selezionato

        let finalParentId: string;
        let finalCondition: string;

        if (!constraint.condition && constraintType == 'forbidden') {
          // altrimenti mi invento io una condizione mandatory per utilizzarla nel lexer poi
          finalParentId = field.parentNodeId;
          finalCondition = '${true == TRUE}';
        } else if (!constraint.condition && constraintType == 'mandatory') {
          finalParentId = field.parentNodeId;
          finalCondition = undefined;
        } else {
          const { parentId, realCondition } = this.extractConditionParts(
            constraint.condition
          );
          finalParentId = parentId;
          finalCondition = realCondition;
        }

        if (!conditions[this.selectedNotice][field.id]) {
          conditions[this.selectedNotice][field.id] = {
            forbidden: [],
            mandatory: []
          };
        }

        conditions[this.selectedNotice][field.id][constraintType].push({
          condition: finalCondition,
          parentId: finalParentId
        } as IFieldSingleCondition);

        // constraint.noticeTypes.forEach((noticeType: string) => {
        //   // Questo if previene l'aggiunta delle condizioni solo per il notice type selezionato
        //   if (
        //     constraint.noticeTypes == null ||
        //     constraint.noticeTypes.includes(noticeType)
        //   ) {
        //     if (!conditions[noticeType][field.id]) {
        //       conditions[noticeType][field.id] = {
        //         forbidden: [],
        //         mandatory: []
        //       };
        //     }

        //     conditions[noticeType][field.id][constraintType].push({
        //       condition: finalCondition,
        //       parentId: finalParentId
        //     } as IFieldSingleCondition);
        //   }
        // });
      }
    });
  }

  private buildHierarchyStrings(xmlStructure: Array<any>): Array<string> {
    const nodeMap = new Map();
    const roots = [];
    const result = [];

    // First pass: create a map of all nodes and identify roots
    xmlStructure.forEach((node: any) => {
      nodeMap.set(node.id, { ...node, children: [] });
      if (!node.parentId) {
        roots.push(node.id);
      }
    });

    // Second pass: build the tree structure
    xmlStructure.forEach((node: any) => {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children.push(node.id);
        }
      }
    });

    // Function to recursively build hierarchy strings
    function buildStrings(nodeId: String, parentString = '') {
      const node = nodeMap.get(nodeId);
      const currentString = parentString
        ? `${parentString}|${node.id}`
        : node.id;
      result.push(currentString);

      node.children.forEach((childId: string) => {
        buildStrings(childId, currentString);
      });
    }

    // Start building strings from the roots
    roots.forEach((rootId) => buildStrings(rootId));

    return result;
  }

  /**
   * Algoritmo che indicizza tutte le labels dei campi/gruppi per una notice type selezionata
   * @param nodes nodi radice
   * @returns tre mappe
   */
  private loadNoticeLabels(nodes: Array<INoticeTypeItemNode>): {
    groups: IDictionary<string>;
    groupsNodeId: IDictionary<string>;
    fields: IDictionary<string>;
  } {
    const groups: IDictionary<string> = {};
    const groupsNodeId: IDictionary<string> = {};
    const fields: IDictionary<string> = {};

    const traverse = (node: INoticeTypeItemNode) => {
      if (node.contentType === 'group') {
        set(groups, node.id, this.getLabel(node._label));
        if (node.nodeId)
          set(groupsNodeId, node.nodeId, this.getLabel(node._label));
      } else if (node.contentType === 'field') {
        set(fields, node.id, this.getLabel(node._label));
      }

      if (node.content && node.content.length > 0) {
        node.content.forEach(traverse);
      }
    };

    nodes.forEach(traverse);

    return { groups, groupsNodeId, fields };
  }

  // #endregion
}
