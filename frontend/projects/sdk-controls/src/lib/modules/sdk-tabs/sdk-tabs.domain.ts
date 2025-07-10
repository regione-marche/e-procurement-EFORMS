import { Observable } from 'rxjs';

// #region Tabs

/**
 *  Interfaccia di configurazione dei tabs
 */
export interface SdkTabsConfig {
    /**
     * Lista dei tabs
     */
    tabs: Array<SdkTab>;
}

/**
 *  Interfaccia che identifica il tab
 */
export interface SdkTab {
    /**
     * Codice univoco che identifica il tab
     */
    code: string;
    /**
     * Titolo del tab
     */
    title?: string;
    /**
     * Valore booleano per disabilitare il tab
     */
    disabled?: boolean;
    /**
     * Valore booleano per pre-selezionare il tab
     */
    selected?: boolean;
    /**
     * Selettore html del componente da iniettare
     */
    content?: string;
    /**
     * Configurazione del componente renderizzato dinamicamente
     */
    contentConfig?: any;
    /**
     * Input del componente renderizzato dinamicamente
     */
    contentInput?: any;
    /**
     * Output del componente renderizzato dinamicamente
     */
    contentOutput?: Function;
}

/**
 *  Interfaccia di output dei tabs
 */
export interface SdkTabsOutput {
    /**
     * Tab selezionato
     */
    item: SdkTab;
}

// #endregion