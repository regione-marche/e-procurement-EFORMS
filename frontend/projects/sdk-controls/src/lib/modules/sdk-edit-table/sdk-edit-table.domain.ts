// #region Extended Table
import { IDictionary } from '@maggioli/sdk-commons';


/**
 * Interfaccia di configurazione di una tabella estesa (es. quadro economico)
 */
export interface SdkEditTableConfig {
    /**
     * Lista di celle di testata
     */
    columns?: Array<SdkEditTableCellConfig>;
        
    data?: Array<any>;

    operation?: boolean;

    action?: Array<any>;

    sort?: any

    comboList?: Map<string,Array<comboListConfig>>;
}

/**
 * Interfaccia che rappresenta la riga/testata della tabella
 */
export interface SdkEditTableCellConfig {
    /**
     * Codice univoco che identifica una cella
     */
    code: string;
    /**
     * Codice label da utilizzare su ngx-translate per recuperare la label in lingua
     */
    label?: string;    
    /**
     * Campo corrispettivo al contratto della risorsa REST in ingresso
     */
    mappingInput?: string;   
    /**
     * Classe(i) css per la cella
     */
    cellClasses?: Array<string>;
    /*
     * Codice del tabellato
     */
    listCode?: string;
    /*
     * Attributo per indicare se il campo è ordinabile
     */
    sortable?: boolean;
    /*
     * Attributo per indicare se il campo è una valuta
     */
    currency?: boolean;
    /*
     * Operazione da effettuare (sum/diff)
     */
    operation?: string;
    /*
     * Attributo per indicare se il campo è una data
     */
    date?: boolean;
    /*
     * Attributo per indicare se il campo presenta dei decimali (limitato a 2)
     */
    decimals?: boolean;
    /*
     * Array limitato a 2 valori (momentaneamente) che indica che il campo in questione è uguale alla differenza di quei valori
     */
    subBy?: Array<string>;
    /*
     * Array limitato a 2 valori (momentaneamente) che indica che il campo in questione è uguale alla somma di quei valori
     */
    sumBy?: Array<string>;
}

export interface comboListConfig{
    key?: string;

    value?: string;
}

// #endregion