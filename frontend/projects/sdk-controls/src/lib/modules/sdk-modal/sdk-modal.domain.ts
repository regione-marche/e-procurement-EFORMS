import { IDictionary } from '@maggioli/sdk-commons';
import { Subject } from 'rxjs';


// #region Modal

/**
 *  Interfaccia di configurazione del modal
 */
export interface SdkModalConfig<X, Y, Z> {
    /**
     * Codice univoco che identifica il modal
     */
    code: string;
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la label in lingua
     */
    title?: string;
    /**
     * Parametri da passare a ngx-translate per recuperare la label in lingua
     */
    titleParams?: IDictionary<string>;

    /**
     * Subject per l'apertura del modal
     */
    openSubject: Subject<boolean>;

    /**
     * Lista di classi css
     */
    classList?: Array<string>;

    /**
     * Larghezza del modal in percentuale
     */
    width?: number;

    /**
     * Selettore del web component caricato dinamicamente di tipologia SdkAbstractComponent
     */
    component?: string;

    /**
     * Configurazione del componente caricato dinamicamente
     */
    componentConfig?: X;

    /**
     * Input del componente caricato dinamicamente
     */
    componentInput?: Y;

    /**
     * Abilita focus (default=true)
     */
    focusContent?: boolean;
}

/**
 *  Interfaccia di output del modal
 */
export interface SdkModalOutput<Z> {
    /**
     * Codice univoco che identifica il modal
     */
    code: string;
    /**
     * Booleano per identificare la chiusura di un modale per click sulla X oppure sul backdrop
     */
    close?: boolean;
    /**
     * Valore di output
     */
    data?: Z;
}

// #endregion
