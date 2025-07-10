import { SdkBasicButtonInput } from '../sdk-button/sdk-button.domain';

// #region Overlay Panel

/**
 *  Interfaccia di configurazione del'Overlay Panel
 */
export interface SdkOverlayPanelConfig {
    /**
     * Codice univoco che identifica l'Overlay Panel
     */
    code: string;

    /**
     * Configurazione del pulsante di apertura
     */
    openButton: SdkBasicButtonInput;
    /**
     * Selettore del web component caricato dinamicamente di tipologia SdkAbstractComponent
     */
    component?: string;
    /**
     * status
     */
    status?: boolean;
    /**
     * statusValue
     */
    statusValue?: string;
    /**
     * Lunghezza dell'overlay panel (es. 450px)
     */
    width?: string;
}

// #endregion
