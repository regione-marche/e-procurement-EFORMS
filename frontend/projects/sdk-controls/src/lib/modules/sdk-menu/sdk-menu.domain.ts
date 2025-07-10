import { IDictionary } from '@maggioli/sdk-commons';

// #region Menu

/**
 *  Interfaccia di configurazione di un menu'
 */
export interface SdkMenuConfig {
    /**
     * Titolo menu'
     */
    menuTitle: string;
    /**
     * Lista di voci di primo livello
     */
    items: Array<SdkMenuItem>;
    /**
     * Indica se il menu' deve essere renderizzato in verticale
     */
    vertical?: boolean;
    /**
     * Booleano per indicase se renderizzare il menu' come tabs
     */
    tabs?: boolean;
    /**
     * Indica se disabilitare tutto il menu'
     */
    disabled?: boolean;
}

/**
 * Interfaccia che identifica una voce di menu'
 */
export interface SdkMenuItem {
    /**
     * Codice univoco della voce di menu'
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
     * Label della voce di menu'
     */
    text?: string;
    /**
     * Voci di menu' di livello inferiore
     */
    items?: Array<SdkMenuItem>;
    /**
     * Specifica la classe CSS da applicare alla voce di menu'
     */
    cssClass?: string;
    /**
     * Indica se la voce di menu' e' disabilitata
     */
    disabled?: boolean;
    /**
     * Indica il nome dell'icona che viene renderizzata assieme alla voce di menu'
     */
    icon?: string;
    /**
     * Indica lo slug di pagina sul quale navigare
     */
    slug?: string;
    /**
     * Booleano per indicare se lo stato della voce di menu' e' attivo (applica uno stile css differente)
     */
    active?: boolean;
    /**
     * Parametri aggiuntivi da appendere in query string
     */
    additionalParams?: IDictionary<any>;
    /**
     * Link esterno all'applicazione
     */
    externalLink?: string;
    /**
     * Codice di protezione da verificare con i premessi dell'utente
     */
    oggettoProtezione?: string;
    /**
     * Modale da aprire al click
     */
    modalComponent?: string;
    /**
     * Label del contenuto del modale
     */
    modalComponentConfig?: string;
    /**
     * Nome del provider da eseguire prima della navigazione per eseguire funzioni aggiuntive
     * Nel caso di widget menu' viene usato il risulato del provider come link esterno
     * e quindi deve tornare una stringa
     */
    additionalProvider?: string;
    /**
     * Codice del provider per mostrare/nascondere il menu item
     */
    visibleProvider?: string;
}

/**
 *  Interfaccia di output di un menu'
 */
export interface SdkMenuOutput {
    /**
     * Voce di menu' cliccata
     */
    item: SdkMenuItem;
}

// #endregion

// #region MenuTabs

/**
 *  Interfaccia di configurazione del menu tabs
 */
export interface SdkMenuTabsConfig {
    /**
     * Lista dei tabs
     */
    tabs: Array<SdkMenuTab>;
    /**
     * Posizione dei tabs
     */
    tabPosition?: ESdkMenuTabPosition;
    /**
     * Allineamento dei tabs
     */
    tabAlignment?: ESdkMenuTabAlignment;
}

/**
 * Lista di possibili posizioni
 */
export type ESdkMenuTabPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * Lista di possibili allineamenti
 */
export type ESdkMenuTabAlignment = 'start' | 'end' | 'center' | 'justify';

/**
 *  Interfaccia che identifica il tab
 */
export interface SdkMenuTab {
    /**
     * Codice univoco che identifica il tab
     */
    code: string;
    /**
     * Titolo del tab
     */
    title?: string;
    /**
     * Parametri da passare a ngx-translate per recuperare la label in lingua
     */
    titleParams?: IDictionary<any>;
    /**
     * Valore booleano per disabilitare il tab
     */
    disabled?: boolean;
    /**
     * Valore booleano per pre-selezionare il tab
     */
    active?: boolean;
    /**
     * Indica lo slug di pagina sul quale navigare
     */
    slug?: string;
    /**
     * Parametri aggiuntivi da appendere in query string
     */
    additionalParams?: IDictionary<any>;
    /**
     * Codice del provider da eseguire che ritorna se il tab e' visibile
     */
    visible?: string;
    /**
     * Oggetto per la generazione della chiave univoca della protezione
     */
    oggettoProtezione?: string;
    /**
     * Tab figli
     */
    children?: Array<SdkMenuTab>;
      /**
     * Nome del provider da eseguire prima della navigazione per eseguire funzioni aggiuntive
     */
    additionalProvider?: string;
}

/**
 *  Interfaccia di output del menu tabs
 */
export interface SdkMenuTabsOutput {
    /**
     * Tab selezionato
     */
    item: SdkMenuTab;
}

// #endregion