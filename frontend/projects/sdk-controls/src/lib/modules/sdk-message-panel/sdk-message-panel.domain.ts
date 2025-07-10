import { IDictionary } from '@maggioli/sdk-commons';

// #region Message Panel

/**
 * Interfaccia di configurazione per un message panel
 */
export interface SdkMessagePanelConfig {
    /**
     * Messaggi da tradurre e mostrare all'interno del pannello
     */
    messages?: Array<SdkMessagePanelTranslate>;
    /**
     * Tipologia di pannello
     */
    type: TSdkMEssagePanelType;
    /**
     * Booleano per indicare se renderizzare i messaggi come una lista non ordinata
     */
    list?: boolean;
}

/**
 * da tradurre e mostrare all'interno del pannello
 */
export interface SdkMessagePanelTranslate {
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la label in lingua
     */
    message?: string;
    /**
     * Parametri da passare a ngx-translate per recuperare la label in lingua
     */
    messageParams?: IDictionary<string>;
}

/**
 * Tipologia di pannello
 */
export type TSdkMEssagePanelType = 'success' | 'warning' | 'info' | 'error';

// #endregion