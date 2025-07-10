import { IDictionary } from '@maggioli/sdk-commons';

// #region Basic Button

/**
 *  Interfaccia di configurazione di un basic button
 */
export interface SdkBasicButtonInput {
    /**
     * Codice univoco che identifica il pulsante
     */
    code: string;
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la label in lingua
     */
    label: string;
    /**
     * Parametri da passare a ngx-translate per recuperare la label in lingua
     */
    labelParams?: IDictionary<string>;
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la label in lingua da mettere sull'attributo title
     * Se non specificato prendera' il valore dell'attributo label
     */
    title?: string;
    /**
     * Identifica l'icona associata al pulsante.
     * L'icona deve essere di Font Awesome
     */
    icon?: string;
    /**
     * Definisce un selettore di classe CSS (per classi multiple: stringa separata da spazi) applicata al pulsante in un elemento span per utilizzare delle icone personalizzate.
     */
    iconClass?: string;
    /**
     * URL dell'immagine da renderizzare all'interno del pulsante
     */
    imageUrl?: string;
    /**
     * Definisce lo stile del pulsante
     */
    look?: ESdkButtonLook;
    /**
     * Valore booleano per disabilitare il pulsante
     */
    disabled?: boolean;
    /**
     * Indica il nome del servizio angular che eseguirà l'operazione a seguito del click
     */
    provider?: string;
    /**
     * Oggetto per la generazione della chiave univoca della protezione
     */
    oggettoProtezione?: string;
    /**
     * Classe(i) css per il pulsante
     */
    buttonClasses?: Array<string>;
    /**
     * Tipo di pulsante
     */
    type?: ESdkButtonType;
}

/**
 *  Interfaccia di output di un basic button
 */
export interface SdkBasicButtonOutput {
    /**
     * Codice univoco che identifica il pulsante
     */
    code: string;
    /**
     * Indica il nome del servizio angular che eseguirà l'operazione a seguito del click
     */
    provider?: string;
}

/**
 * Tipo che identifica i possibili stili del pulsante
 */
export type ESdkButtonLook = 'flat' | 'outline' | 'icon';

/**
 * Tipo che identifica i possibili tipi di pulsante
 */
export type ESdkButtonType = 'primary' | 'save' | 'clear' | 'delete' | 'confirm' | 'cancel' | 'search' | 'history' | 'functions' | 'functions-dropdown';

// #endregion

// #region Button Group

/**
 * Interfaccia di configurazione di un button group
 */
export interface SdkButtonGroupInput {
    /**
     * Lista di pulsanti basic button
     */
    buttons: Array<SdkButtonGroupSingleInput>;
}

/**
 * Interfaccia di output di un button group
 */
export interface SdkButtonGroupOutput extends SdkBasicButtonOutput { }

/**
 * Interfaccia di input del pulsante di gruppo singolo
 */
export interface SdkButtonGroupSingleInput extends SdkDropdownButtonInput, SdkBasicButtonInput {
    /**
     * Flag che indica se il pulsante e' un dropdown
     */
    dropdown?: boolean;
}

// #endregion

// #region Dropdown Button

/**
 *  Interfaccia di configurazione di un dropdown button
 */
export interface SdkDropdownButtonInput extends SdkBasicButtonInput {
    /**
     * Posizione dell'icona del pulsante (left o right)
     */
    iconPos?: string;
    /**
     * Lista di pulsanti presenti all'interno del dropdown button
     */
    dropdownData?: Array<SdkDropdownButtonData>;
    /**
     * Label applicata al pulsante di apertura tendina
     */
    expandAriaLabel?: string;
}

/**
 *  Interfaccia di configurazione di un item del dropdown button
 */
export interface SdkDropdownButtonData extends SdkBasicButtonInput {
    /**
     * Funzione collegata al click del pulsante (ad uso interno)
     */
    command?: Function;
    /**
     * Provider da chiamare per mostrare o meno il pulsante
     */
    visible?: string;
    /**
     * Codice per raggruppare piu' pulsanti (tipo radio buttons)
     * Questo parametro NON cambiera' l'ordine dei pulsanti contenenti lo stesso codice
     */
    buttonGroupId?: string;
    /**
     * Ad uso interno, non usare
     */
    lastItemOfGroup?: boolean;
    /**
     * Ad uso interno, non usare
     */
    titleTradotto?: string;
    /**
     * Ad uso interno, non usare
     */
    labelTradotta?: string;
}

/**
 *  Interfaccia di output di un dropdown button
 */
export interface SdkDropdownButtonOutput extends SdkDropdownButtonData { }

// #endregion

// #region Toolbar

/**
 *  Interfaccia di configurazione di una toolbar
 */
export interface SdkToolbarButton extends SdkBasicButtonInput, SdkDropdownButtonInput {
    /**
     * Tipo di pulsante da renderizzare
     */
    widgetCode: ESdkToolbarButtonType;
}

/**
 *  Interfaccia di output di un pulsante della toolbar
 */
export interface SdkToolbarButtonOutput extends SdkBasicButtonOutput, SdkDropdownButtonOutput { }

/**
 * Tipo di pulsante renderizzabile
 */
export type ESdkToolbarButtonType = 'BUTTON' | 'DROPDOWN';

/**
 *  Interfaccia di configurazione di una toolbar
 */
export interface SdkToolbarInput {
    /**
     * Lista di toolbar button
     */
    buttons: Array<SdkToolbarButton>;
}

/**
 *  Interfaccia di output della toolbar
 */
export interface SdkToolbarOutput extends SdkToolbarButtonOutput { }

// #endregion