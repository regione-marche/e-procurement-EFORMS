import { IDictionary } from '@maggioli/sdk-commons';

// #region Breadcrumb

/**
 *  Interfaccia di configurazione di una breadcrumb
 */
export interface SdkBreadcrumbConfig {
    /**
     * Lista di item della breadcrumb
     */
    items: Array<SdkBreadcrumbItem>;
    /**
     * Indica se la breadcrumbs e' disabilitata
     */
    disabled?: boolean;
}

/**
 *  Interfaccia che identifica il singolo item della breadcrumb
 */
export interface SdkBreadcrumbItem {
    /**
     * Codice univoco che identifica l'item
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
     * Slug di navigazione al click
     */
    slug?: string;
    /**
     * Mappa di parametri aggiuntivi
     */
    additionalParams?: IDictionary<any>;
    /**
     * Codice provider da eseguire per nascondere la breadcrumb (se non valorizzato l'item e' sempre visibile)
     */
    visible?: string;
    /**
     * Provider da eseguire per recuperare una stringa (di business) da passare al translate service come parametro.
     * Se presente anche "labelParams" gli oggetti verrano uniti assieme e il risultato del provider prendera' chiave "value"
     * Es.
     * {
     *    "value": "" // label ritornata dal provider
     *    ... // altre chiavi di labelParams
     * }
     */
    labelProvider?: string;
}

/**
 *  Interfaccia di output di una breadcrumb
 */
export interface SdkBreadcrumbOutput {
    /**
     * Item di output della breadcrumb
     */
    item: SdkBreadcrumbItem;
}

// #endregion