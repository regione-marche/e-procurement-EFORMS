import { SdkFormBuilderField } from '@maggioli/sdk-controls';

export interface ResponseDTO<T> {
    done: string,
    response?: T,
    messages?: Array<string>;
}

export interface ValoreTabellato {
    archiviato: string;
    cap?: string;
    codice: string;
    codiceProvincia?: string;
    codistat?: string;
    descrizione: string;
}

export interface DynamicValue {
    codice?: number;
    descrizione?: string;
    value?: number;
}

export interface ProfiloInfo {
    codCliente?: number;
    codProfilo?: string;
    codapp?: string;
    crc?: number;
    descrizione?: string;
    flagInterno?: number;
    nome?: string;
    ok?: boolean;
}

export interface ProfiloConfiguration {
    idProfilo: string;
    ok: boolean;
    nome: string;
    configurazioni: Array<ProfiloConfigurationItem>;
    campiSolaLettura: Array<string>;
}

export interface ProfiloConfigurationItem {
    key?: string;
    valore?: boolean;
    ok?: boolean;
    valDefault?: number;
    okDefault?: boolean;
    default?: boolean;
}

export interface ResponseResult<T> {
    data?: T;
    error?: string;
    errorData?: string;
    esito?: boolean;
}

export interface TabellatoInfo {
    data: Array<ValoreTabellato>;
    expiration?: Date;
}

export type CustomParamsFunction = (field: SdkFormBuilderField, restObject?: any, dynamicField?: boolean) => CustomParamsFunctionResponse;

export interface CustomParamsFunctionResponse {
    mapping: boolean;
    field: SdkFormBuilderField;
}

export interface StazioneAppaltanteBaseInfo {
    /**
     * Codice della stazione appaltante
     */
    codice?: string;

    /**
     * Nome della stazione appaltante
     */
    nome?: string;
}

export interface StazioneAppaltanteInfo extends StazioneAppaltanteBaseInfo {
    /**
     * CAP stazione appaltante
     */
    cap?: string;
    /**
     * CF stazione appaltante
     */
    codFiscale?: string;
    /**
     * Cod istat comune stazione appaltante
     */
    codistat?: string;
    /**
     * Comune stazione appaltante
     */
    comune?: string;
    /**
     * Email stazione appaltante
     */
    email?: string;
    /**
     * Fax stazione appaltante
     */
    fax?: string;
    /**
     * Indirizzo stazione appaltante
     */
    indirizzo?: string;
    /**
     * Numero civico stazione appaltante
     */
    numCivico?: string;
    /**
     * Lista dei profili abilitati per l'utente e la stazione appaltante
     */
    profili?: Array<ProfiloInfo>;
    /**
     * Provincia stazione appaltante
     */
    provincia?: string;
    /**
     * Telefono stazione appaltante
     */
    telefono?: string;
}