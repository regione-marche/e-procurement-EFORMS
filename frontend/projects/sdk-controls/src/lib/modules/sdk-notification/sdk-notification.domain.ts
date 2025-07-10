// #region Notification

/**
 * Interfaccia di configurazione di una notifica
 */
export interface SdkNotificationConfig {
    /**
     * Contenuto della notifica
     */
    content: string;
    /**
     * Titolo della notifica
     */
    title?: string;
    /**
     * Configurazione della tipologia della notifica
     */
    severity: TSdkNotificationTypeStyle;
}

/**
 * Stile della notifica
 */
export type TSdkNotificationTypeStyle = 'success' | 'error' | 'warning' | 'info';

// #endregion