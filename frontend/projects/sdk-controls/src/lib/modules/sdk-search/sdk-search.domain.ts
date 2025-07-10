import { IDictionary } from '@maggioli/sdk-commons';
import { SelectItem } from 'primeng/api';
import { Observable } from 'rxjs';

// #region Simple Search

/**
 *  Interfaccia di configurazione di un campo di ricerca semplice
 */
export interface SdkSimpleSearchConfig {
    /**
     * Codice univoco che identifica il campo di ricerca
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
     * Valore booleano per disabilitare il campo di ricerca
     */
    disabled?: boolean;
    /**
     * Booleano per abilitare la visualizzazione del campo di ricerca in linea
     */
    inline?: boolean;
    /**
     * Booleano per abilitare la combo di filtro
     */
    filtered?: boolean;
    /**
     * Lista di opzioni di filtro
     */
    filterList?: Array<SdkSimpleSearchFilterItem>;
    /**
     * Placeholder
     */
    placeholder?: string;
}

/**
 *  Interfaccia di input di un campo di ricerca semplice
 */
export interface SdkSimpleSearchInput {
    /**
     * Valore di input da impostare nel campo di ricerca semplice
     */
    data?: string;
}

/**
 *  Interfaccia di output di un campo di ricerca semplice
 */
export interface SdkSimpleSearchOutput {
    /**
     * Codice univoco che identifica il campo di ricerca
     */
    code: string;
    /**
     * Valore di output recuperato dal campo di ricerca semplice
     */
    data?: string;
    /**
     * L'eventuale campo di filtro selezionato
     */
    filterCode?: string;
}
/**
 * Interfaccia che indica il singolo elemento della combo
 */
export interface SdkSimpleSearchFilterItem extends SelectItem {
    /**
     * Booleano di pre-selezione dell'elemento
     */
    default?: boolean;
}

// #endregion

// #region Advanced Search

/**
 *  Interfaccia di configurazione di un campo di ricerca avanzato
 */
export interface SdkAdvancedSearchConfig {
    /**
     * Codice univoco che identifica il campo di ricerca
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
     * Valore booleano per disabilitare il campo di ricerca
     */
    disabled?: boolean;
    /**
     * Categorie di ricerca (vengono mostrate come tabs)
     */
    categories: Array<SdkAdvancedSearchCategoryConfig>;
    /**
     * Numero minimo di caratteri per attivare la ricerca
     */
    minCharacterSearch?: number;
}

/**
 *  Interfaccia di input di un campo di ricerca avanzato
 */
export interface SdkAdvancedSearchInput {
    /**
     * Valore di input da impostare nel campo di ricerca avanzato
     */
    data?: string;
}

/**
 *  Interfaccia di output di un campo di ricerca avanzato
 */
export interface SdkAdvancedSearchOutput {
    /**
     * Codice univoco che identifica il campo di ricerca
     */
    code: string;
    /**
     * Valore di output recuperato dal campo di ricerca semplice
     */
    data?: string;
    /**
     * L'eventuale campo di filtro selezionato
     */
    filterCode?: string;
}

/**
 * Categoria
 */
export interface SdkAdvancedSearchCategoryConfig {
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la label in lingua
     */
    label?: string;
    /**
     * Parametri da passare a ngx-translate per recuperare la label in lingua
     */
    labelParams?: IDictionary<string>;
    /**
     * Booleano per indicare se la categoria e' selezionata
     */
    selected?: boolean;
    /**
     * Funzione di ricerca della categoria
     */
    searchFunction?: SdkAdvancedSearchCategorySearchFunction;
    /**
     * Provider da indicare nel descrittore che si traduce in funzione "searchFunction"
     */
    searchFunctionProvider?: string;
    /**
     * Funzione di selezione di un oggetto ricercato
     */
    selectItemFunction?: SdkAdvancedSearchCategorySelectItemFunction;
    /**
     * Provider da indicare nel descrittore che si traduce in funzione "selectItemFunction"
     */
    selectItemFunctionProvider?: string;
    /**
     * Codice di protezione da verificare con i premessi dell'utente
     */
    oggettoProtezione?: string;
}

/**
 * Funzione di ricerca della categoria
 */
export type SdkAdvancedSearchCategorySearchFunction = (searchTerm: string) => Observable<Array<SdkAdvancedSearchItemResult>>;

/**
 * Funzione di selezione di un oggetto ricercato
 */
export type SdkAdvancedSearchCategorySelectItemFunction = (selectedItem: SdkAdvancedSearchItemResult) => void;

/**
 * Interfaccia dell'oggetto ricercato
 */
export interface SdkAdvancedSearchItemResult {
    /**
     * Label
     */
    label?: string;
    /**
     * Original
     */
    original: any;
}

// #endregion


// #region Simple Search

/**
 *  Interfaccia di configurazione di un campo di ricerca mixed
 */
export interface SdkMixedSearchConfig {
    /**
     * Codice univoco che identifica il campo di ricerca
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
     * Valore booleano per disabilitare il campo di ricerca
     */
    disabled?: boolean;
    /**
     * Lista di opzioni di filtro
     */
    filterList?: Array<SdkMixedSearchFilterItem>;
    /**
     * Aria label da assegnare al pulsante freccetta
     */
    opzioniLabel?: string;
}

/**
 *  Interfaccia di input di un campo di ricerca mixed
 */
export interface SdkMixedSearchInput {
    /**
     * Valore di input da impostare nel campo di ricerca mixed
     */
    data?: string;
}

/**
 *  Interfaccia di output di un campo di ricerca mixed
 */
export interface SdkMixedSearchOutput {
    /**
     * Codice univoco che identifica il campo di ricerca
     */
    code: string;
    /**
     * Valore di output recuperato dal campo di ricerca mixed
     */
    data?: string;
    /**
     * L'eventuale campo di filtro selezionato
     */
    filterCode?: string;
}

/**
 * Interfaccia che indica il singolo elemento della combo
 */
export interface SdkMixedSearchFilterItem extends SelectItem {
    /**
     * Booleano di pre-selezione dell'elemento
     */
    default?: boolean;
}

// #endregion