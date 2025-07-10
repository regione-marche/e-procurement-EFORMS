import { IDictionary } from '@maggioli/sdk-commons';
import { Subject } from 'rxjs';


// #region Sidebar

/**
 *  Interfaccia di configurazione della sidebar
 */
export interface SdkSidebarConfig {
    /**
     * Codice univoco che identifica la sidebar
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
     * Subject per l'apertura della sidebar
     */
    openSubject: Subject<boolean>;

    /**
     * Lista di classi css
     */
    classList?: Array<string>;

    /**
     * Posizione della sidebar (valori possibili: left o right)
     */
    position?: 'left' | 'right';

    /**
     * Larghezza della sidebar
     */
    width?: number;

    /**
     * Immagine di testata
     */
    headerImage?: string;

    /**
     * Selettore html del componente da iniettare
     */
    component?: string;
    /**
     * Configurazione del componente renderizzato dinamicamente
     */
    componentConfig?: any;
    /**
     * Input del componente renderizzato dinamicamente
     */
    componentInput?: any;
    /**
     * Abilita focus (default=true)
     */
    focusContent?: boolean;
}

/**
 *  Interfaccia di output della sidebar
 */
export interface SdkSidebarOutput {
    /**
     * Codice univoco che identifica la sidebar
     */
    code: string;
    /**
     * Valore di output
     */
    data?: any;
}

// #endregion
