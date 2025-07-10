import { IDictionary } from '@maggioli/sdk-commons';

import { SdkBasicButtonInput } from '../sdk-button/sdk-button.domain';

// #region Panelbar

/**
 *  Interfaccia di configurazione di una Panelbar
 */
export interface SdkPanelbarConfig {
    /**
     * Lista di voci di primo livello
     */
    items: Array<SdkPanelbarItem>;
    /**
     * Indica se disabilitare tutta la panelbar
     */
    disabled?: boolean;
    /**
     * Booleano per abilitare/disabilitare l'animazione
     */
    animate?: boolean;
    /**
     * Altezza della Panelbar considerata se expandMode e' full
     */
    height?: number;
    /**
     * Configurazione per il pulsante "Nuovo"
     */
    nuovoButton?: SdkBasicButtonInput;
    /**
     * Configurazione per il pulsante "Elimina"
     */
    eliminaButton?: SdkBasicButtonInput;
}

/**
 * Interfaccia che identifica una voce della Panelbar
 */
export interface SdkPanelbarItem {
    /**
     * Codice univoco della voce della Panelbar
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
     * Label della voce della Panelbar
     */
    text?: string;
    /**
     * Voci di livello inferiore
     */
    children?: Array<SdkPanelbarItem>;
    /**
     * Specifica la classe CSS da applicare all'elemento
     */
    cssClass?: string;
    /**
     * Indica se l'elemento e' disabilitata
     */
    disabled?: boolean;
    /**
     * Icona da applicare alla testata
     */
    icon?: string;
    /**
     * Booleano per selezionare l'elemento
     */
    selected?: boolean;
    /**
     * Booleano per mostrare il pulsante elimina
     */
    showElimina?: boolean;
    /**
     * Booleano per mostrare il pulsante nuovo
     */
    showNuovo?: boolean;
    /**
     * Immagine da mostrare in testata
     */
    testataImageUrl?: string;
    /**
     * Tooltip ngx-translate da agganciare all'immagine
     */
    testataImageTooltip?: string;
    /**
     * Tooltip ngx-translate da agganciare all'icona
     */
    iconTooltip?: string;
}

/**
 *  Interfaccia di output di una Panelbar
 */
export interface SdkPanelbarOutput {
    /**
     * Voce cliccata
     */
    item: SdkPanelbarItem;
    /**
     * Tipologia di azione in output
     */
    action: SdkPanelbarOutputAction;
}

/**
 * Tipologia di azione in output
 */
export type SdkPanelbarOutputAction = 'OPEN' | 'NEW' | 'DELETE';

// #endregion
