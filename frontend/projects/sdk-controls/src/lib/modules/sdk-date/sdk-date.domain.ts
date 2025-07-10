import { IDictionary, SdkValidator } from '@maggioli/sdk-commons';

// #region Common

/**
 *  Interfaccia comune a tutti i componenti Date
 */
export interface SdkDateCommon<X> {
    /**
     * Codice univoco che identifica il campo
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
     * Lista di validatori da applicare al campo
     */
    validators?: Array<SdkValidator<X>>;
    /**
     * Booleano che identifica se eseguire la validazione realtime
     */
    inlineValidation?: boolean;
    /**
     * Valore booleano per disabilitare il campo
     */
    disabled?: boolean;
    /**
     * Booleano per abilitare la visualizzazione del box informativo del campo
     */
    infoBox?: boolean;
    /**
     * Classe(i) css per la label
     */
    labelClasses?: Array<string>;
    /**
     * Classe(i) css per il campo
     */
    fieldClasses?: Array<string>;
    /**
     * Label per il pulsante di apertura datepicker
     */
    iconAriaLabel?: string;
}

/**
 * Interfaccia comune che indentifica l'output del campo Date
 */
export interface SdkDateOutput {
    /**
     * Codice univoco che identifica il campo
     */
    code: string;
    /**
     * Booleano che si valorizza a seguito dell'esecuzione di validatori
     */
    valid?: boolean;
}

// #endregion

// #region Datepicker

/**
 *  Interfaccia di configurazione di un campo datepicker
 */
export interface SdkDatepickerConfig extends SdkDateCommon<Date> {
    /**
     * Indica una data da evidenziare all'interno del datepicker
     */
    focusedDate?: Date;
    /**
     * Identifica la data minima visualizzata e selezionabile all'interno del datepicker
     */
    min?: Date;
    /**
     * Identifica la data massima visualizzata e selezionabile all'interno del datepicker
     */
    max?: Date;
    /**
     * Formato della data
     */
    format?: string;
    /**
     * Placeholder
     */
    placeholder?: string;
    /**
     * Range di anni da mostrare nel menu a tendina <anno inferiore>:<anno superiore> (es. 1900:2100)
     */
    yearRange?: string;
    /**
     * Booleano per mostrare la scelta del tempo
     */
    showTime?: boolean;
}

/**
 *  Interfaccia di input di un campo datepicker
 */
export interface SdkDatepickerInput {
    /**
     * Valore di input da impostare nel campo datepicker
     */
    data?: Date;
    /**
     * Label aggiornata
     */
    label?: string;
}

/**
 *  Interfaccia di output di un campo datepicker
 */
export interface SdkDatepickerOutput extends SdkDateOutput {
    /**
     * Valore di output recuperato dal campo datepicker
     */
    data?: Date;
}

// #endregion

// #region Timepicker

/**
 *  Interfaccia di configurazione di un campo timepicker
 */
export interface SdkTimepickerConfig extends SdkDateCommon<Date> {
    /**
     * Identifica l'ora minima visualizzata e selezionabile all'interno del datepicker
     */
    min?: Date;
    /**
     * Identifica l'ora massima visualizzata e selezionabile all'interno del datepicker
     */
    max?: Date;
    /**
     * Formato dell'ora
     */
    format?: string;
    /**
     * Placeholder
     */
    placeholder?: string;
}

/**
 *  Interfaccia di input di un campo timepicker
 */
export interface SdkTimepickerInput {
    /**
     * Valore di input da impostare nel campo timepicker
     */
    data?: Date;
}

/**
 *  Interfaccia di output di un campo timepicker
 */
export interface SdkTimepickerOutput extends SdkDateOutput {
    /**
     * Valore di output recuperato dal campo timepicker
     */
    data?: Date;
}

// #endregion