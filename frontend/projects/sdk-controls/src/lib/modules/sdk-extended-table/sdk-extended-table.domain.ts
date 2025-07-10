// #region Extended Table
import { IDictionary } from '@maggioli/sdk-commons';


/**
 * Interfaccia di configurazione di una tabella estesa (es. quadro economico)
 */
export interface SdkExtendedTableConfig {
    /**
     * Lista di celle di testata
     */
    header?: Array<SdkExtendedTableRowConfig>;
    /**
     * Lista di righe
     */
    rows: Array<SdkExtendedTableRowConfig>;
    /**
     * Legenda della tabella
     */
    legend?: Array<SdkExtendedTableRowConfig>;
}

/**
 * Interfaccia che rappresenta la riga/testata della tabella
 */
export interface SdkExtendedTableRowConfig {
    /**
     * Codice univoco che identifica la riga
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
     * Lista di celle della riga
     */
    cells: Array<SdkExtendedTableCellConfig>;
    /**
     * Campo corrispettivo al contratto della risorsa REST in ingresso
     */
    mappingInput?: string;
    /**
     * Classe(i) css per la riga
     */
    rowClasses?: Array<string>;
    /**
     * Lista di righe figlie (non implementato per la testata)
     */
    children?: Array<SdkExtendedTableRowConfig>;
    /**
     * Booleano per espandere la riga
     */
    rowExpanded?: boolean;
}

/**
 * Interfaccia che rappresenta la singola cella
 */
export interface SdkExtendedTableCellConfig {
    /**
     * Codice univoco che identifica una cella
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
     * Valore assunto dal campo
     */
    value?: number;
    /**
     * Campo corrispettivo al contratto della risorsa REST in ingresso
     */
    mappingInput?: string;
    /**
     * Colspan
     */
    colspan?: number;
    /**
     * Rowspan
     */
    rowspan?: number;
    /**
     * Classe(i) css per la cella
     */
    cellClasses?: Array<string>;
}

// #endregion