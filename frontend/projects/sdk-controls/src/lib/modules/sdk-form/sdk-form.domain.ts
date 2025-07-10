import { IDictionary, SdkValidator } from '@maggioli/sdk-commons';
import { Observable, Subject } from 'rxjs';

import { SdkBasicButtonInput } from '../sdk-button/sdk-button.domain';

// #region Common

/**
 *  Interfaccia comune a tutti i componenti Form
 */
export interface SdkFormFieldCommon<X> {
    /**
     * Codice univoco che identifica il campo della form
     */
    code: string;
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la label in lingua
     */
    label?: string;
    /**
     * Parametri da passare a ngx-translate per recuperare la label in lingua
     */
    labelParams?: IDictionary<string>;
    /**
     * Lista di validatori da applicare al campo della form
     */
    validators?: Array<SdkValidator<X>>;
    /**
     * Booleano che identifica se eseguire la validazione realtime
     */
    inlineValidation?: boolean;
    /**
     * Valore booleano per disabilitare il campo della form
     */
    disabled?: boolean;
    /**
     * Codice mnemonico ritornato dal backend
     */
    mnemonico?: string;
    /**
     * Oggetto per la generazione della chiave univoca della protezione
     */
    oggettoProtezione?: string;
    /**
     * Classe(i) css per la label
     */
    labelClasses?: Array<string>;
    /**
     * Classe(i) css per il campo
     */
    fieldClasses?: Array<string>;
    /**
     * Numero massimo di caratteri inseribili ammessi
     */
    maxLength?: number;
    /**
     * Booleano per abilitare la visualizzazione del box informativo del campo
     */
    infoBox?: boolean;
    /**
     * Boolano per indicare se il campo e' dinamico (ad uso interno)
     */
    dynamicField?: boolean;
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la descrizione in lingua
     */
    description?: string;
    /**
     * Boolano per indicare se è prevista l'icona di help
     */
    showHelp?: boolean;
    /**
     * Stringa da mostare nel tooltip dell'icona di help
     */
    helpDescription?: string;
    /**
     * Stringa da mostare come placeholder
     */
    placeholder?: string;
    /**
     * Allineamento valore campo (default: SX)
     */
    align?: TSdkFormFieldAlign;
    /**
     * Booleano per "sbloccare" il campo nel caso sia disabilitato.
     * Verra' mostrata una confirm per rendere consapevole l'utente
     * di quello che andra' a fare
     */
    unlockable?: boolean;

    helpLabelDescription?: string;

    showLabelHelp?: boolean;
}

export type TSdkFormFieldAlign = 'SX' | 'DX';

/**
 * Interfaccia comune che indentifica l'output del campo della form
 */
export interface SdkFormFieldOutput {
    /**
     * Codice univoco che identifica il campo
     */
    code: string;
    /**
     * Codice mnemonico ritornato dal backend
     */
    mnemonico?: string;
    /**
     * Booleano che si valorizza a seguito dell'esecuzione di validatori
     */
    valid?: boolean;
    /**
     * Boolano per indicare se il campo e' dinamico (ad uso interno)
     */
    dynamicField?: boolean;
}

// #endregion

// #region Textbox

/**
 *  Interfaccia di configurazione di un campo di testo semplice
 */
export interface SdkTextboxConfig extends SdkFormFieldCommon<string> { }

/**
 *  Interfaccia di input di un campo di testo semplice
 */
export interface SdkTextboxInput {
    /**
     * Valore di input da impostare nel campo di testo semplice
     */
    data?: string;
}

/**
 *  Interfaccia di output di un campo di testo semplice
 */
export interface SdkTextboxOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dal campo di testo semplice
     */
    data?: string;
}

// #endregion

// #region Textarea

/**
 *  Interfaccia di configurazione di una textarea
 */
export interface SdkTextareaConfig extends SdkFormFieldCommon<string> {
    /**
     * Valore booleano che specifica se la textarea ridimensiona l'altezza in modo automatico all'inserimento di un valore
     */
    autosize?: boolean;


    /**
     * Valore numerico che specifica il numero di righe della textarea
     */
    rows?: number;

}

/**
 *  Interfaccia di input di una textarea
 */
export interface SdkTextareaInput {
    /**
     * Valore di input da impostare nella textarea
     */
    data?: string;
}

/**
 *  Interfaccia di output di un campo della textarea
 */
export interface SdkTextareaOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dalla textarea
     */
    data?: string;
}

// #endregion

// #region NumericTextbox

/**
 *  Interfaccia di configurazione di un campo di testo numerico
 */
export interface SdkNumericTextboxConfig extends SdkFormFieldCommon<number> {
    /**
     * Valore che specifica il numero di decimali consentiti in fase di inserimento del valore
     */
    decimals?: number;
    /**
     * Booleano che indica se il valore nel numeric-textbox va considerato come importo
     */
    currency?: boolean;
    /**
     * Simbolo Custom da aggiungere come suffisso simile al simbolo della currency
     * se c'e' solo customSymbol valorizzato allora esso viene stampato
     * se invece e' abilitata anche la currency, viene stampato ad esempio €/<customSymbol>
     */
    customSymbol?: string;
    /**
     * Booleano che indica se il valore numerico va formattato secondo il locale corrente
     */
    format?: boolean;
    /**
    * Booleano che indica se il valore numerico può essere minore di 0
    */
    relativeNum?: boolean;
    /**
     * Booleano che indica se il valore e' una percentuale e quindi soggetto a formattazione di decimali senza mostrare il simbolo della valuta
     */
    percentuale?: boolean;
    /**
     * Booleano che indica se il valore e' una coordinata geografica (longitudine e latitudine)
     */
    coordinates?: boolean;
    /**
     * Booleano che indica se il valore e' un anno
     */
    year?: boolean;
}

/**
 *  Interfaccia di input di un campo di testo numerico
 */
export interface SdkNumericTextboxInput {
    /**
     * Valore di input da impostare nel campo di testo numerico
     */
    data?: number;
}

/**
 *  Interfaccia di output di un campo di testo numerico
 */
export interface SdkNumericTextboxOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dal campo di testo numerico
     */
    data?: number;
}

// #endregion

// #region Switch

/**
 *  Interfaccia di configurazione di un campo switch
 */
export interface SdkSwitchConfig extends SdkFormFieldCommon<boolean> {
    /**
     * Label che viene mostrata quando il pulsante e' attivato (se non valorizzato e' "ON")
     */
    onLabel?: string;
    /**
     * Label che viene mostrata quando il pulsante e' disattivato (se non valorizzato e' "OFF")
     */
    offLabel?: string;
}

/**
 *  Interfaccia di input di un campo switch
 */
export interface SdkSwitchInput {
    /**
     * Valore di input da impostare nel campo switch
     */
    checked?: boolean;
}

/**
 *  Interfaccia di output di un campo switch
 */
export interface SdkSwitchOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dal campo switch
     */
    checked?: boolean;
}

// #endregion

// #region Slider

/**
 *  Interfaccia di configurazione di un campo slider
 */
export interface SdkSliderConfig extends SdkFormFieldCommon<number> {
    /**
     * Valore minimo dello slider
     */
    min: number;
    /**
     * Valore massimo dello slider
     */
    max: number;
    /**
     * Il valore di step dello slider. Sono ammessi solo valori positivi.
     */
    step: number;
    /**
     * Valore booleano per indicare se renderizzare lo slider in verticale
     */
    vertical?: boolean;
}

/**
 *  Interfaccia di input di un campo slider
 */
export interface SdkSliderInput {
    /**
     * Valore di input da impostare nel campo slider
     */
    data?: number;
}

/**
 *  Interfaccia di output di un campo slider
 */
export interface SdkSliderOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dal campo slider
     */
    data?: number;
}

// #endregion

// #region MaskedTextbox

/**
 *  Interfaccia di configurazione di un campo di testo masked
 */
export interface SdkMaskedTextboxConfig extends SdkFormFieldCommon<string> {
    /**
     * Maschera da applicare al campo.
     * Per le linee guida vedere il seguente link {@link https://primefaces.org/primeng/#/inputmask}
     */
    mask: string;
}

/**
 *  Interfaccia di input di un campo di testo masked
 */
export interface SdkMaskedTextboxInput {
    /**
     * Valore di input da impostare nel campo di testo masked
     */
    data?: string;
}

/**
 *  Interfaccia di output di un campo di testo masked
 */
export interface SdkMaskedTextboxOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dal campo di testo masked
     */
    data?: string;
}
// #endregion

// #region Combobox

/**
 *  Interfaccia di configurazione di un campo combobox
 */
export interface SdkComboboxConfig extends SdkFormFieldCommon<SdkComboBoxItem> {
    /**
     * Provider per recuperare i valori del campo combobox
     */
    itemsProvider: SdkComboboxValuesProvider;
    /**
     * Placeholder
     */
    placeholder?: string;
    /**
     * Codice del provider che verrà utilizzato per creare la funzione itemsProvider
     */
    itemsProviderCode?: string;
    /**
     * Codice tabellato da passare al provider
     */
    listCode?: string;
    /**
     * Subject contenente un parametro da passare al provider di items
     */
    itemsProviderSubject?: Subject<string>;
    /**
     * Booleano per indicare se mostrare o meno il pulsante di cancellazione dell'elemento selezionato
     */
    showClear?: boolean;
    /**
     * Concatena la chiave nella descrizione del tabellato
     */
    showKeyInDescription?: boolean;
    /**
     * Abilita/disabilita il virtualscroll per combobox con tanti elementi (default: false)
     */
    virtualScroll?: boolean;
    /**
     * Numero di elementi che vengono caricati in pagina quando e' attivo il virtual scroll (default: 50)
     */
    virtualScrollItemSize?: number;
    /**
     * Attiva/disattiva il filtro sugli items nelle combobox (default: true)
     */
    comboboxFilter?: boolean;
}

/**
 * Interfaccia che rappresenta il singolo item di un campo combobox
 */
export interface SdkComboBoxItem {
    /**
     * Chiave dell'opzione
     */
    key: string;
    /**
     * Etichetta dell'opzione
     */
    value: string;
    /**
     * Indica se l'opzione e' disabilitata
     */
    disabled?: boolean;
    /**
     * Descrizione da tradurre con ngx-translate mostrata sotto la combobox nel caso l'item venga selezionato
     */
    description?: string;
    /**
    * Etichetta da mostrare come tooltip nel caso sia diversa dal value
    */
    title?: string;
}

/**
 * Provider per recuperare i valori del campo combobox.
 * Ritorna un observable contenente una lista di opzioni.
 */
export type SdkComboboxValuesProvider = (args?: IDictionary<any>) => Observable<Array<SdkComboBoxItem>>;

/**
 *  Interfaccia di input di un campo combobox
 */
export interface SdkComboboxInput {
    /**
     * Valore di input da impostare nel campo combobox
     */
    data?: SdkComboBoxItem;
}

/**
 *  Interfaccia di output di un campo combobox
 */
export interface SdkComboboxOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dal campo combobox
     */
    data?: SdkComboBoxItem;
}

// #endregion

// #region Multiselect

/**
 *  Interfaccia di configurazione di un campo multiselect
 */
export interface SdkMultiselectConfig extends SdkFormFieldCommon<Array<SdkMultiselectItem>> {
    /**
     * Provider per recuperare i valori del campo multiselect
     */
    itemsProvider: SdkMultiselectValuesProvider;
    /**
     * Placeholder
     */
    placeholder?: string;
    /**
     * Indica se il campo multiselect durante l'inserimento deve completare il valore con il primo risultato coerente
     */
    suggest?: boolean;
    /**
     * Show max records
     */
    showMaxRecords?: number;
}

/**
 * Interfaccia che rappresenta il singolo item di un campo multiselect
 */
export interface SdkMultiselectItem {
    /**
     * Chiave dell'opzione
     */
    key: string;
    /**
     * Etichetta dell'opzione
     */
    value: string;
    /**
     * Indica se l'opzione e' disabilitata
     */
    disabled?: boolean;
}

/**
 * Provider per recuperare i valori del campo multiselect.
 * Ritorna un observable contenente una lista di opzioni.
 */
export type SdkMultiselectValuesProvider = () => Observable<Array<SdkMultiselectItem>>;

/**
 *  Interfaccia di input di un campo multiselect
 */
export interface SdkMultiselectInput {
    /**
     * Valori di input da impostare nel campo multiselect
     */
    data?: Array<SdkMultiselectItem>;
}

/**
 *  Interfaccia di output di un campo multiselect
 */
export interface SdkMultiselectOutput extends SdkFormFieldOutput {
    /**
     * Valori di output recuperato dal campo multiselect
     */
    data?: Array<SdkMultiselectItem>;
}

// #endregion

// #region Autocomplete

/**
 *  Interfaccia di configurazione di un campo autocomplete
 */
export interface SdkAutocompleteConfig extends SdkFormFieldCommon<string> {
    /**
     * Provider per recuperare i valori del campo autocomplete
     */
    itemsProvider: SdkAutocompleteValuesProvider;
    /**
     * Placeholder
     */
    placeholder?: string;
    /**
     * Numero minimo di caratteri da digitare per far scatenare la ricerca (default = 3)
     */
    minSearchCharacters?: number;
    /**
     * Codice del provider che verrà utilizzato per creare la funzione itemsProvider
     */
    itemsProviderCode?: string;
    /**
     * Booleano per visualizzare i pulsanti di nuovo e edit item
     */
    newEditAvailable?: boolean;
    /**
     * Pulsante nuovo item visibile quando non e' stato selezionato alcun valore
     */
    newItemButton?: SdkBasicButtonInput;
    /**
     * Pulsante modifica item visibile quando e' stato selezionato un valore
     */
    editItemButton?: SdkBasicButtonInput;
    /**
     * Selettore del componente web component da renderizzare all'interno del modale
     */
    modalComponent?: string
    /**
     * Configurazione del componente da renderizzare all'interno del modale
     */
    modalComponentConfig?: any;
    /**
     * Label che compare dentro il popup quando non ci sono dati
     */
    noDataLabel?: string;
    /**
     * Subject per pulire il campo
     */
    clearSubject?: Subject<boolean>;
    /**
     * Booleano che permette la ricerca custom di un elemento (ad es. se eseguo una ricerca
     * ed essa non produce risultati, emetto il valore ricercato)
     */
    permitCustomElement?: boolean;
    /**
     * Booleano per attivare la modalita' avanzata
     * con la gestione di una ricerca tabellare
     */
    advanced?: boolean;
    /**
     * Configurazione del modale di ricerca avanzata
     */
    advancedModalComponentConfig?: SdkAutocompleteAdvancedModalComponentConfig;
    /**
     * Booleano per attivare l'apertura del modale tramite il blur
     */
    advancedBlurEnabled?: boolean;
    /**
     * Codice aggiuntivo da passare al provider per la ricerca
     */
    listCode?: string;
}

/**
 * Interfaccia di definizione del modale di ricerca avanzata
 */
export interface SdkAutocompleteAdvancedModalComponentConfig {
    /**
     * Ad uso interno (e' uguale al codice dell'autocomplete)
     * serve per il base filter
     */
    code?: string;
    /**
     * Lista di colonne
     */
    columns: Array<SdkAutocompleteAdvancedModalComponentColumn>;
    /**
     * Chiave di mappatura dell'entita' collegata (archivio -> entityKey -> autocomplete config.mappingOutput._key)
     */
    entityKey: string;
    /**
     * Funzione per stampare il testo all'interno dell'autocomplete (es. `${data.nominativo} (${data.cf})`)
     */
    entityText: (data: any) => string;
    /**
     * Label da tradurre per la colonna Azioni
     */
    actionsLabel?: string;
    /**
     * Label da tradurre per il campo di ricerca textbox
     */
    searchLabel?: string;
    /**
     * Provider per recuperare i valori del modale di ricerca avanzato di un autocomplete
     */
    itemsProvider?: SdkAutocompleteAdvancedModalComponentProvider;
    /**
     * Stringa di ricerca inserita in apertura modale
     */
    searchData?: string;
    /**
     * Booleano per abilitare/disabilitare la paginazione (attiva di default)
     */
    paginationEnabled?: boolean;
    /**
     * Dizionario filtri base dei campi collegati (viene valorizzato internamente, non usare)
     */
    baseFiltersCampiCollegati?: IDictionary<any>;
    /**
     * Booleano che se attivo invia i filtri dei campi collegati al filtro avanzato (search all'interno del modale)
     * Viene preso il primo campo che ha un valore.
     * Campo passato da sdk-autocomplete
     */
    advancedAutocompleteCampiCollegatiToAdvancedFilter?: boolean;
    /**
     * Campo di ordinamento di default
     */
    defaultSortField?: string;
    /**
     * Ordine di default (asc, desc)
     */
    defaultSortDirection?: SdkAutocompleteAdvancedModalSortOrder;
}

export type SdkAutocompleteAdvancedModalSortOrder = 'asc' | 'desc';

/**
 * Interfaccia di gestione filtri tabella
 */
export interface SdkAutocompleteAdvancedModalPageSortFilter {
    /**
     * Skip
     */
    skip?: number;
    /**
     * Take
     */
    take?: number;
    /**
     * Sort Field
     */
    sortField?: string;
    /**
     * Sort direction (asc, desc)
     */
    sortDirection?: SdkAutocompleteAdvancedModalSortOrder;
}

/**
 * Interfaccia di definizione di una singola colonna
 */
export interface SdkAutocompleteAdvancedModalComponentColumn {
    /**
     * Codice della colonna
     */
    code: string;
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la label in lingua
     */
    label?: string;
    /**
     * Parametri da passare a ngx-translate per recuperare la label in lingua
     */
    labelParams?: IDictionary<string>;
    /**
     * Campo corrispettivo al contratto della risorsa REST in uscita
     */
    mappingInput?: string;
    /**
     * Classe css per l'icona (verra' renderizzata nelle righe non nella testata)
     */
    icon?: string;
}

/**
 * Provider per recuperare i valori del modale di ricerca avanzato di un autocomplete.
 * Ritorna un observable contenente una lista di campi
 */
export type SdkAutocompleteAdvancedModalComponentProvider = (baseFilters?: IDictionary<any>, detailFilter?: string, tablePageSortFilter?: SdkAutocompleteAdvancedModalPageSortFilter, messagesPanel?: HTMLElement) => Observable<SdkAutocompleteAdvancedModalAPIResponse<any>>;

/**
 * Risposta REST dell'API di ricerca
 */
export interface SdkAutocompleteAdvancedModalAPIResponse<T> {
    /**
     * Array di risultati
     */
    response?: Array<T>;
    /**
     * Numero totale di record
     */
    totalCount?: number;
}

/**
 * Interfaccia di output del filtro di base di un autocomplete advanced
 */
export interface SdkAutocompleteAdvancedBaseFilterItem {
    /**
     * Codice autocomplete
     */
    code: string;
    /**
     * Valore stringa immesso dall'utente o dal modale
     */
    data?: string;
}

/**
 * Configurazione di autocomplete multiplo
 */
export interface SdkMultipleAutocompleteConfig extends SdkFormFieldCommon<string> {
    /**
     * Provider per recuperare i valori del campo autocomplete
     */
    itemsProvider: SdkAutocompleteValuesProvider;
    /**
     * Placeholder
     */
    placeholder?: string;
    /**
     * Numero minimo di caratteri da digitare per far scatenare la ricerca (default = 3)
     */
    minSearchCharacters?: number;
    /**
     * Codice del provider che verrà utilizzato per creare la funzione itemsProvider
     */
    itemsProviderCode?: string;
    /**
     * Label che compare dentro il popup quando non ci sono dati
     */
    noDataLabel?: string;
    /**
     * Subject per pulire il campo
     */
    clearSubject?: Subject<boolean>;
}

/**
 * Provider per recuperare i valori del campo autocomplete.
 * Ritorna un observable contenente una lista stringhe.
 */
export type SdkAutocompleteValuesProvider = (data?: string, listCode?: string) => Observable<Array<SdkAutocompleteItem>>;

/**
 * Interfaccia di un singolo item di suggestion dell'sdk autocomplete
 */
export interface SdkAutocompleteItem extends IDictionary<any> {
    /**
     * Testo da visualizzare
     */
    text: string;
    /**
     * Chiave dell'oggetto selezionato (valorizzata tramite la proprieta' "attributeKey")
     */
    _key: string;
}

/**
 *  Interfaccia di input di un campo autocomplete
 */
export interface SdkAutocompleteInput {
    /**
     * Valore di input da impostare nel campo autocomplete
     */
    data?: SdkAutocompleteItem;
    /**
     * Booleano utilizzato dall'advanced autocomplete per informare il form builder di non reinviare il check dei campi collegati
     * (altrimenti avremmo un loop)
     */
    collegato?: boolean;
}

/**
 *  Interfaccia di output di un campo autocomplete
 */
export interface SdkAutocompleteOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dal campo autocomplete
     */
    data?: SdkAutocompleteItem;
    /**
     * Booleano utilizzato dall'advanced autocomplete per informare il form builder di non reinviare il check dei campi collegati
     * (altrimenti avremmo un loop)
     */
    collegato?: boolean;
    /**
     * Booleano per indicare se il dato emesso e' stato inserito dall'utente oppure e' stato selezionato dal modale
     * (valorizzato solo se e' un autocomplete advanced)
     */
    userInput?: boolean;
}

/**
 *  Interfaccia di input di un campo autocomplete
 */
export interface SdkMultipleAutocompleteInput {
    /**
     * Valore di input da impostare nel campo multiple-autocomplete
     */
    data?: Array<SdkAutocompleteItem>;
}

/**
 *  Interfaccia di output di un campo autocomplete
 */
export interface SdkMultipleAutocompleteOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dal campo multiple-autocomplete
     */
    data?: Array<SdkAutocompleteItem>;
}

// #endregion

// #region Document

/**
 * Interfaccia di configurazione di un componente sdk-document
 */
export interface SdkDocumentConfig extends SdkFormFieldCommon<string> {
    /**
    * Label che viene mostrata per la selezione del campo di file input
    */
    switchFileLabel?: string;
    /**
     * Label che viene mostrata per la selezione del campo di input url
     */
    switchUrlLabel?: string;
    /**
     * Codice label del campo input url da utilizzare su ngx-translate per recuperare la label in lingua
     */
    urlLabel?: string;
    /**
     * Parametri del campo input url da passare a ngx-translate per recuperare la label in lingua
     */
    urlLabelParams?: IDictionary<string>;
    /**
     * Codice label del campo file input da utilizzare su ngx-translate per recuperare la label in lingua
     */
    fileInputLabel?: string;
    /**
     * Parametri del campo file input da passare a ngx-translate per recuperare la label in lingua
     */
    fileInputLabelParams?: IDictionary<string>;
    /**
     * Dimensione massima del file da caricare nel formato X Y dove X = numero intero e Y = B | KB | MB | GB (es. 5 MB = 5 MegaByte)
     */
    maxFileSize?: string;
    /**
     * Codice label per l'errore di dimensione massima di file da utilizzare su ngx-translate per recuperare la label in lingua
     */
    maxFileSizeLabel?: string;
    /**
     * Codice label del campo input url da utilizzare su ngx-translate per recuperare la label in lingua
     */
    titleInputLabel?: string;
    /**
     * Parametri del campo input url da passare a ngx-translate per recuperare la label in lingua
     */
    titleInputLabelParams?: IDictionary<string>;
    /**
     * Booleano per indicare se questo campo e' obbligatorio
     */
    mandatory?: boolean;
    /**
     * Codice label del messaggio di errore obbligatorio da utilizzare su ngx-translate per recuperare la label in lingua
     */
    mandatoryLabel?: string;
    /**
     * Booleano per indicare se mostrare solo il file picker
     */
    onlyFile?: boolean;
    /**
     * Booleano per indicare se mostrare solo l'URL inseribile per l'upload di un allegato.
     */
    onlyUrl?: boolean;
    /**
     * Estesioni dei file accettate scritte nella modalita' W3C
     * https://www.w3schools.com/tags/att_input_accept.asp
     */
    accept?: string;
    /**
     * Label di estensione file errata
     */
    wrongExtensionLabel?: string;
    /**
     * Lunghezza massima di caratteri ammessa per il titolo
     */
    maxTitleLength?: number;
    /**
     * Indica se mostrare o meno il titolo di una sezione (default = true)
     */
    withTitle?: boolean;
}

/**
 *  Interfaccia di input di un componente sdk-document
 */
export interface SdkDocumentInput {
    /**
     * Valore di input per attivare il checkbox,
     * File = true, Url = false
     */
    fileSwitch?: boolean;
    /**
     * Valore di input per il campo input url
     */
    url?: string;
    /**
     * Valore del titolo
     */
    title?: string;
}

/**
 *  Interfaccia di output di un componente sdk-document
 */
export interface SdkDocumentOutput extends SdkFormFieldOutput {
    /**
     * Valore di output del campo checkbox
     * File = true, Url = false
     */
    fileSwitch?: boolean;
    /**
     * Valore di output del campo input url
     */
    url?: string;
    /**
     * Base64 del file da caricare
     */
    file?: string;
    /**
     * Valore del titolo
     */
    title?: string;
    /**
     * Nome del file da caricare
     */
    fileName?: string;
    /**
     * Estensione del file da caricare
     */
    tipoFile?: string;
}

// #endregion

// #region Text

/**
 * Interfaccia di configurazione di un componente sdk text
 */
export interface SdkTextConfig extends SdkFormFieldCommon<string> {
    /**
     * Il testo da mostrare
     */
    data: string;
    /**
     * Booleano che indica se il testo e' cliccabile
     */
    link?: boolean;
    /**
     * Selettore del componente web component da renderizzare all'interno del modale
     */
    modalComponent?: string
    /**
     * Configurazione del componente da renderizzare all'interno del modale
     */
    modalComponentConfig?: any;
    /**
     * Booleano per indicare se trattare il valore come una currency
     */
    currency?: boolean;
    /**
     * Simbolo Custom da aggiungere come suffisso simile al simbolo della currency
     * se c'e' solo customSymbol valorizzato allora esso viene stampato
     * se invece e' abilitata anche la currency, viene stampato ad esempio €/<customSymbol>
     */
    customSymbol?: string;
    /**
     * Oggetto rest del modale da utilizzare all'interno di un form group
     */
    textModalContent?: any;
    /**
     * Numero di decimali da visualizzare
     */
    decimals?: number;
    /**
     * Variabile per definire se un campo e' numerico, analogamente alla currency e che serve per ridimensionare il campo al 15%
     */
    number?: boolean;
    /**
     * Variabile per definire il troncamento del campo e la visualizzazione di un'icona per espandere e comprimere la lista dei valori
     */
    expand?: boolean;
}

export type SdkTextFormatFunction = (data: any) => any;

/**
 * Interfaccia di input di un componente sdk text
 */
export interface SdkTextInput {
    /**
     * Il testo da aggiornare
     */
    data?: string;
    /**
     * Label aggiornata
     */
    label?: string;
}

/**
 * Interfaccia di output di un componente sdk text
 */
export interface SdkTextOutput extends SdkFormFieldOutput {
    /**
     * Il testo cliccato
     */
    data: string;
    /**
     * Booleano per indicare se l'elemento e' stato cliccato
     */
    clicked: boolean;
    /**
     * Selettore del componente web component da renderizzare all'interno del modale
     */
    modalComponent?: string
    /**
     * Configurazione del componente da renderizzare all'interno del modale
     */
    modalComponentConfig?: any;
    /**
     * Oggetto rest del modale da utilizzare all'interno di un form group
     */
    textModalContent?: any;
}

// #endregion

// #region DocumentsList

/**
 * Interfaccia di configurazione di un componente sdk-documents-list
 */
export interface SdkDocumentsListConfig extends SdkFormFieldCommon<void> {
    /**
     * Lista di documenti da mostrare
     */
    documents?: Array<SdkDocumentItem>;
    /**
     * Booleano per abilitare il click degli item
     */
    clickable?: boolean;
    /**
     * Subject per pulire il campo
     */
    clearSubject?: Subject<boolean>;
    /**
     * Booleano per disabilitare le azioni di cancellazione
     */
    actionsDisabled?: boolean;
    /**
     * Booleano per indicare se inserire o meno l'header con il suo titolo
     */
    hideHeaderTitle?: boolean;
}

/**
 * Interfaccia che rappresenta un singolo documento
 */
export interface SdkDocumentItem extends IDictionary<any> {
    /**
     * Codice del documento
     */
    code: string;
    /**
     * Titolo
     */
    titolo?: string;
    /**
    * Descrizione (Opzionale)
    */
    descrizione?: string;
    /**
     * Binario del documento
     */
    binary?: string;
    /**
     * URL del documento
     */
    url?: string;
    /**
     * Estensione del file
     */
    tipoFile?: string;
    /**
     * Motivazione eliminazione logica del documento allegato
     */
    motivoCanc?: string;
    /**
     * Data annullamento allegato
     */
    dataCanc?: Date;
    /**
     * Booleano per indicare una cancellazione logica
     */
    deleteLogica?: boolean;
    /**
     * Booleano per indicare se effettuare un nuovo annullamento
     */
    daAnnullare?: boolean;
    /**
     * Callback valorizzata nel caso di sdk-documents-list e file
     */
    fileDownloadCallback?: () => Observable<any>;
}

/**
 * Interfaccia di input di un componente sdk-documents-list
 */
export interface SdkDocumentsListInput {
    /**
     * Elemento da aggiungere
     */
    item: SdkDocumentItem;
}

/**
 *  Interfaccia di output di un componente sdk-documents-list
 */
export interface SdkDocumentsListOutput extends SdkFormFieldOutput {
    /**
     * Lista di documenti editati
     */
    documents?: Array<SdkDocumentItem>;
}

// #endregion

// #region Radio

/**
 *  Interfaccia di configurazione di un campo radio
 */
export interface SdkRadioConfig extends SdkFormFieldCommon<string> {
    /**
     * Lista delle scelte radio
     */
    choices: Array<SdkRadioItem>;
}

/**
 * Interfaccia di un singolo item radio
 */
export interface SdkRadioItem {
    /**
     * Codice
     */
    code: string;
    /**
     * Label
     */
    label: string;
    /**
     * Booleano per indicare se l'item e' selezionato
     */
    checked?: boolean;
}

/**
 *  Interfaccia di input di un campo radio
 */
export interface SdkRadioInput {
    /**
     * Valore di input da impostare nel campo radio
     */
    data?: SdkRadioItem;
}

/**
 *  Interfaccia di output di un campo radio
 */
export interface SdkRadioOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dal campo radio
     */
    data?: SdkRadioItem;
}

// #endregion

// #region TextboxMatrix

/**
 *  Interfaccia di configurazione di un campo di testo matrice
 */
export interface SdkTextboxMatrixConfig extends SdkFormFieldCommon<string> {
    /**
     * Lista di celle di testata
     */
    header: Array<SdkTextboxMatrixRowConfig>;
    /**
     * Lista di righe
     */
    rows: Array<SdkTextboxMatrixRowConfig>;
}

/**
 * Interfaccia di una cella di un campo di testo matrice
 */
export interface SdkTextboxMatrixCellConfig {
    /**
     * Codice univoco che identifica una cella
     */
    code: string;
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la label in lingua
     */
    label?: string;
    /**
     * Parametri da passare a ngx-translate per recuperare la label in lingua
     */
    labelParams?: IDictionary<string>;
    /**
     * Tipologia del campo (testo o input)
     */
    type: 'TEXT' | 'TEXTBOX';
    /**
     * Valore assunto dal campo
     */
    value?: number;
    /**
     * Campo corrispettivo al contratto della risorsa REST in ingresso
     */
    mappingInput?: string;
    /**
     * Campo corrispettivo al contratto della risorsa REST in uscita
     */
    mappingOutput?: string;
    /**
     * Valore booleano per disabilitare il campo della form
     */
    disabled?: boolean;
    /**
     * Valore che specifica il numero di decimali consentiti in fase di inserimento del valore
     */SdkTextboxMatrixRowConfig
    decimals?: number;
    /**
     * Stringa contenente l'operazione da eseguire (esempio: {0}+{1}-{2})
     */
    operation?: string;
    /**
     * Lista di campi corrispondenti ai placeholder di operation (esempio: [\'campo1\', \'campo2\', \'campo3\']).
     * Verranno poi recuperati i valori per ogni campo e passati ad una factory che eseguira' l'operazione indicata in operation
     */
    operationParams?: Array<string>;
    /**
     * Emitter di cambio valore
     */
    valueChange?: Subject<number>;
    /**
     * Oggetto per la generazione della chiave univoca della protezione
     */
    oggettoProtezione?: string;
    /**
     * Codice mnemonico ritornato dal backend
     */
    mnemonico?: string;
    /**
     * Colspan
     */
    colspan?: number;
    /**
     * Rowspan
     */
    rowspan?: number;
}

/**
 * Interfaccia di una riga di un campo di testo matrice
 */
export interface SdkTextboxMatrixRowConfig {
    /**
     * Codice univoco che identifica la riga
     */
    code: string;
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la label in lingua
     */
    label?: string;
    /**
     * Parametri da passare a ngx-translate per recuperare la label in lingua
     */
    labelParams?: IDictionary<string>;
    /**
     * Lista di celle della riga
     */
    cells: Array<SdkTextboxMatrixCellConfig>;
    /**
     * Campo corrispettivo al contratto della risorsa REST in ingresso
     */
    mappingInput?: string;
    /**
     * Campo corrispettivo al contratto della risorsa REST in uscita
     */
    mappingOutput?: string;
    /**
     * Booleano per nascondere il campo
     */
    hidden?: boolean;
}

/**
 *  Interfaccia di input di un campo di testo matrice
 */
export interface SdkTextboxMatrixInput {
    /**
     * Codice univoco che identifica una cella
     */
    cellCode: string;
    /**
     * Valore da aggiornare
     */
    data: number;
}

/**
 *  Interfaccia di output di un campo di testo matrice
 */
export interface SdkTextboxMatrixOutput extends SdkFormFieldOutput {
    /**
     * Testata
     */
    header: Array<SdkTextboxMatrixRowConfig>;
    /**
     * Lista di righe
     */
    rows: Array<SdkTextboxMatrixRowConfig>;
    /**
     * Codice univoco che identifica una cella
     */
    cellCode: string;
    /**
     * Codice univoco che identifica una riga
     */
    rowCode?: string;
}

// #endregion

// #region Tree

/**
 * Interfaccia di configurazione di un tree
 */
export interface SdkTreeConfig extends SdkFormFieldCommon<string> {
    /**
     * Lista di nodi
     */
    items: Array<SdkTreeItem>;

    /**
    * Valore con cui inizializzare l'albero
    */
    selectedValue?: any

}

/**
 * Interfaccia di un nodo
 */
export interface SdkTreeItem extends IDictionary<any> {
    /**
     * Stringa visualizzata
     */
    text: string;
    /**
     * Nodi figli
     */
    items?: Array<SdkTreeItem>;
}

/**
 * Interfaccia di output di un tree
 */
export interface SdkTreeOutput extends SdkFormFieldOutput {
    /**
     * Il nodo cliccato
     */
    item: SdkTreeItem;
    /**
     * Il path per arrivare al nodo cliccato
     */
    path: string;
}

// #endregion

// #region Textmodal

/**
 * Interfaccia di configurazione di un textmodal
 */
export interface SdkTextModalConfig extends SdkFormFieldCommon<string> {
    /**
     * Il testo da mostrare
     */
    data: string;
    /**
     * Booleano che indica se il testo e' cliccabile
     */
    modalComponent?: string
    /**
     * Configurazione del componente da renderizzare all'interno del modale
     */
    modalComponentConfig?: any;
    /**
     * Configurazione del bottone di apertura del modale
     */
    modalButtonConfigObs?: Observable<SdkBasicButtonInput>;
}

/**
 *  Interfaccia di output di un campo textmodal
 */
export interface SdkTextModalOutput extends SdkFormFieldOutput {
    /**
     * Il testo cliccato
     */
    data: string;
    /**
     * Booleano per indicare se l'elemento e' stato cliccato
     */
    clicked: boolean;
    /**
     * Selettore del componente web component da renderizzare all'interno del modale
     */
    modalComponent?: string
    /**
     * Configurazione del componente da renderizzare all'interno del modale
     */
    modalComponentConfig?: any;
    /**
     * Contenuto dell'oggetto ritornato dal modale
     */
    modalContent?: any;
    /**
     * Booleano valorizzato a true quando l'utente clicca sul pulsante di "Pulisci"
     */
    clear?: boolean;
}

// #endregion

// #region Checkbox

/**
 *  Interfaccia di configurazione di un campo checkbox
 */
export interface SdkCheckboxConfig extends SdkFormFieldCommon<Array<string>> {
    /**
     * Alternativa alla label per l'attributo title (ad es. per non renderizzare html)
     */
    title?: string;
    /**
     * Lista di scelte
     */
    items: Array<SdkCheckboxItem>;
}

/**
 *  Interfaccia di input di un campo checkbox
 */
export interface SdkCheckboxInput {
    /**
     * Lista di item da selezionare/deselezionare
     */
    items: Array<SdkCheckboxItem>;
}

/**
 * Interfaccia che rappresenta una singola checkbox
 */
export interface SdkCheckboxItem {
    /**
     * codice univoco all'interno del gruppo di checkbox
     */
    code: string;
    /**
     * Descrizione del checkbox
     */
    label?: string;
    /**
     * Booleano che indica se il checkbox e' selezionato/deselezionato
     */
    checked?: boolean;
}

/**
 *  Interfaccia di output di un campo checkbox
 */
export interface SdkCheckboxOutput extends SdkFormFieldOutput {
    /**
     * Lista di item selezionati
     */
    data: Array<SdkCheckboxItem>;
}

// #endregion

// #region Password

/**
 *  Interfaccia di configurazione di un campo password
 */
export interface SdkPasswordConfig extends SdkFormFieldCommon<string> {
    /**
     * Label "Inserisci la password (default in inglese)"
     */
    promptLabel?: string;
    /**
     * Label "Debole (default in inglese)"
     */
    weakLabel?: string;
    /**
     * Label "Media (default in inglese)"
     */
    mediumLabel?: string;
    /**
     * Label "Forte (default in inglese)"
     */
    strongLabel?: string;
    /**
     * Booleano per mostrare la tendina di verifica password
     */
    feedback?: boolean;
}

/**
 *  Interfaccia di input di un campo password
 */
export interface SdkPasswordInput {
    /**
     * Valore di input da impostare nel campo password
     */
    data?: string;
}

/**
 *  Interfaccia di output di un campo password
 */
export interface SdkPasswordOutput extends SdkFormFieldOutput {
    /**
     * Valore di output recuperato dal campo password
     */
    data?: string;
}

// #endregion
