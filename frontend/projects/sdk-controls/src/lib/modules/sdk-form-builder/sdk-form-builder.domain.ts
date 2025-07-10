import { IDictionary } from '@maggioli/sdk-commons';
import { SdkDocumentItem, SdkTextboxMatrixRowConfig } from '@maggioli/sdk-controls';

// #region SdkFormBuilder

/**
 * Interfaccia di configurazione del form builder
 */
export interface SdkFormBuilderConfiguration {
    /**
     * Lista di campi della form
     */
    fields: Array<SdkFormBuilderField>;
}

/**
 * Interfaccia di configurazione di un singolo campo di form del form builder
 */
export interface SdkFormBuilderField extends IDictionary<any> {
    /**
     * Tipologia di campo della form
     */
    type: TSdkFormBuilderFieldType;
    /**
     * Campo corrispettivo al contratto della risorsa REST in ingresso
     */
    mappingInput?: string;
    /**
     * Campo corrispettivo al contratto della risorsa REST in uscita
     */
    mappingOutput?: string;
    /**
     * Lista di campi della form
     */
    fieldGroups?: Array<SdkFormFieldGroupConfiguration>;
    /**
     * Numero minimo di pannelli/gruppi di form in totale
     */
    minGroupsNumber?: number;
    /**
     * Numero massimo di pannelli/gruppi di form in totale
     */
    maxGroupsNumber?: number;
    /**
     * Lista di campi all'interno della section
     */
    fieldSections?: Array<SdkFormBuilderField>;
    /**
     * Booleano valorizzato dal singolo campo
     */
    valid?: boolean;
    /**
     * Mappa contenente codice campo: valore da verificare per rendere visibile il campo della form
     */
    visibleCondition?: SdkFormBuilderVisibleTypeCondition;
    /**
     * Booleano risultante dal controllo di visibleCondition
     */
    visible?: boolean;
    /**
     * Attributo contenente codice campo da passare poi al provider per recuperare le scelte disponibili
     * Esempio di utilizzo: {
     *  code: 'comune',
     *  campoDipendente: 'provincia'
     * }
     * Il campo comune passerà il valore di provincia al provider non appena il campo provincia verrà valorizzato
     */
    campoDipendente?: string;
    /**
     * Codice gruppo valorizzato in output nel caso il campo sia all'interno di un pannello multiplo
     */
    groupCode?: string;
    /**
     * Array di campi di default da utilizzare per creare un pannello multiplo
     */
    defaultFormGroupFields?: Array<SdkFormBuilderField>;
    /**
     * Campo di default da utilizzare per sezioni dinamiche (ad esempio lista di campi combo)
     */
    defaultFormSectionField?: SdkFormBuilderField;
    /**
     * Boolano per indicare se il campo e' dinamico (ad uso interno)
     */
    dynamicField?: boolean;
    /**
     * Eventuale descrizione da inserire in un pannello sopra i campi
     */
    description?: string;
    /**
     * Eventuale sotto-descrizione da inserire in un pannello sotto la descrizione
     */
    subDescription?: string;
    /**
     * Flag che determina se il pannello è collassabile o meno tramite click su icona dell'header
     */
    collapse?: boolean;
    /**
     * Flag che determina se il pannello viene inizializzato collassato o meno tramite click su icona dell'header
     */
    initialCollapse?: boolean;
    /**
     * Label che viene mostrata quando non ci sono pannelli multipli
     */
    emptyGroupMessage?: string;
    /**
     * Lista di tutti i campi rappresentabili
     */
    dynamicFieldValues?: Array<SdkDynamicValue>;
    /**
     * Booleano che rappresenta una sezione dinamica in readonly
     */
    dynamicReadonly?: boolean;
    /**
     * Classi css da applicare alla sezione
     */
    sectionClass?: Array<string>;
    /**
     * Classi css da applicare al gruppo
     */
    groupClass?: Array<string>;
    /**
     * Classi css da applicare alla sezione generica
     */
    classes?: Array<string>;
    /**
     * Provider gestione comportamenti extra sezione
     */    
    extraParamsProvider?: string;
    /**
     * Visualizza il primo pannello di default e ne permette la cancellazione 
     */
    showFirst?: boolean;
    /**
     * Label per il titolo del form group
     */
    label?: string;
    /**
     * Lista campi collegati autocomplete advanced (non si considerano form group)
     */
    advancedAutocompleteCampiCollegati?: Array<string>;
    /**
     * Booleano che se attivo invia i filtri dei campi collegati al filtro avanzato (search all'interno del modale)
     * Viene preso il primo campo che ha un valore
     */
    advancedAutocompleteCampiCollegatiToAdvancedFilter?: boolean;
}

/**
 * Interfaccia che identifica una singola combo dinamica
 */
export interface SdkDynamicValue {
    /**
     * Codice
     */
    codice?: number;
    /**
     * Label
     */
    descrizione?: string;
    /**
     * Valore
     */
    value?: number;
}

/**
 * Interfaccia di tipologia di visibilita'
 */
export interface SdkFormBuilderVisibleTypeCondition {
    /**
     * Condizione and
     */
    and?: IDictionary<SdkFormBuilderVisibleCondition>;
    /**
     * Condizione or
     */
    or?: IDictionary<SdkFormBuilderVisibleCondition>;
}

/**
 * Interfaccia di visibilita'
 */
export interface SdkFormBuilderVisibleCondition {
    /**
     * Valori per i quali verificare la visibilita'
     */
    values: Array<SdkFormBuilderVisibleValue>;
    /**
     * Stato attuale della visibilita'
     */
    visible: boolean;
    /**
     * Tipologia di controllo della singola condizione (se non specificato viene presa quella generica)
     */
    singleVisibleType?: string;
}

/**
 * Interfaccia di visibilita' valore
 */
export interface SdkFormBuilderVisibleValue {
    /**
     * Valore stringa
     */
    value: string | number;
    /**
     * Operazione di confronto da eseguire (valore attuale - operazione - value dell'interfaccia)
     */
    operation: '>' | '<' | '=' | '>=' | '<=';
}

/**
 * Tipologia di campi della form
 */
export type TSdkFormBuilderFieldType =
    'FORM-GROUP' |
    'FORM-SECTION' |
    'AUTOCOMPLETE' |
    'MULTIPLE-AUTOCOMPLETE'|
    'COMBOBOX' |
    'MASKED-TEXTBOX' |
    'MULTISELECT' |
    'NUMERIC-TEXTBOX' |
    'SLIDER' |
    'SWITCH' |
    'TEXTAREA' |
    'TEXTBOX' |
    'DATEPICKER' |
    'DOCUMENT' |
    'DOCUMENTS-LIST' |
    'TEXT' |
    'TEXTBOX-MATRIX' |
    'TEXTMODAL' |
    'HIDDEN' |
    'CHECKBOX' |
    'PASSWORD' |
    'DYNAMIC-FORM-SECTION' |
    'RADIOBUTTON';

// #endregion

// #region SdkFormFieldGroup

/**
 * Interfaccia per la rappresentazione di un form group
 */
export interface SdkFormFieldGroupConfiguration {
    /**
     * Codice univoco generato da utilizzare nel trackBy del ciclo
     */
    code?: string;
    /**
     * Lista di campi della form
     */
    fields: Array<SdkFormBuilderField>;
}

/**
 * Interfaccia di input del form builder
 */
export interface SdkFormBuilderInput {
    /**
     * Codice univoco campo
     */
    code: string;
    /**
     * Codice gruppo valorizzato nel caso si voglia aggiornare un campo di uno specifico pannello multiplo
     */
    groupCode?: string;
    /**
     * Valore di input del campo input url
     */
    url?: string;
    /**
     * Valore di input da impostare nel campo switch
     */
    checked?: boolean;
    /**
     * Valore di input del campo checkbox in sdk document
     * File = true, Url = false
     */
    fileSwitch?: boolean;
    /**
     * Valore da impostare nel campo
     */
    data?: any;
    /**
     * Valore del titolo in sdk document
     */
    title?: string;
    /**
     * Lista di documenti da mostrare
     */
    documents?: Array<SdkDocumentItem>;
    /**
     * Lista di righe della matrice
     */
    rows?: Array<SdkTextboxMatrixRowConfig>;
    /**
     * Codice che identifica univocamente una cella della matrice
     */
    cellCode?: string;
    /**
     * Campi da cambiare
     */
    dynamicFieldValues?: Array<SdkDynamicValue>;
    /**
     * Booleano utilizzato dall'advanced autocomplete per informare il form builder di non reinviare il check dei campi collegati
     * (altrimenti avremmo un loop)
     */
    collegato?: boolean;

    visible?: boolean;
}

// #endregion