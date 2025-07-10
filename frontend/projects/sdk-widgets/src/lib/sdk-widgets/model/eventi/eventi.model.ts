import { ResponseDTO } from "../lib.model";

export interface WLogEventiDTO { 
    codApp?: string;
    codProfilo?: string;
    codiceEvento?: string;
    dataOra?: Date;
    descrizione?: string;
    descrizioneUtente?: string;
    errorMessage?: string;
    idEvento?: number;
    ipEvento?: string;
    livelloEvento?: number;
    oggettoEvento?: string;
    syscon?: number;
    dataOraFormatted?: string;
}

export interface ResponseListaDTO<T> extends ResponseDTO<T> {
    totalCount?: number;
}
