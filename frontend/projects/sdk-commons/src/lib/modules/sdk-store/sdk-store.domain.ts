import { SdkAppConfig } from '../sdk-shared/types/sdk-loader.types';

export class SdkStoreAction<T = any> {
    constructor(
        public type: string,
        public payload?: T
    ) { }
}

export class SdkStateMap {
    constructor(
        public config: SdkAppConfig,
        public userProfile?: UserProfile,
        public stazioniAppaltantiCount?: number,
        public saInfo?: any,
        public searchFormS?: any,
        //gare
        public searchFormGS?: any,
        //archivio imprese
        public searchFormAIS?: any,
        //archivio centri di costo
        public searchFormACDCS?: any,
        //archivio stazioni appaltanti
        public searchFormASAS?: any,
        //archivio tecnici
        public searchFormATECNICIS?: any,
        //archivio uffici
        public searchFormAUFFICIS?: any,
        //archivio soggetti (229)
        public searchFormASS?: any,
        //esportazioni (229)
        public searchFormES?: any,
        //flussi (SITATOR)
        public searchFormFlussiS?: any,
        //feedback (SITATOR)
        public searchFormFeedbackS?: any,        
        //comuniczioni scp (SITATOR)
        public searchFormComunicazioniScpS?: any,
        //adempimenti (190)
        public searchFormAS?: any,
        //warning nuovo adempimento (190)
        public searchFormWNAS?: any,
        //sitat190
        public fromLottiS?: any,
        //sitat190 ricerca lotti
        public searchFormLS?: any,
        //gestione deleghe lista fasi lotto
        public currentNumAppaFasiLottoS?: number,
        // form di ricerca utenti
        public searchFormUtentiS?: any,
        // form di ricerca configurazioni
        public searchFormGestioneConfigurazioniS?: any,
        // from di ricerca eventi
        public searchFormGestioneEventiS?: any,
        // form di ricerca tabellati
        public searchFormGestioneTabellatiS?: any,
        // form di ricerca modelli
        public searchFormModelliS?: any,
        //Schede trasmesse PCP
        public searchFormRPCPS?: any,
        // form di ricerca per atti generali
        public searchFormAGS?: any,
        // form di ricerca clienti (M-RP)
        public searchFormClientiS?: any
    ) { }
}

export interface UserProfile {
    nome: string;
    cognome: string;
    codiceFiscale?: string;
    login?: string;
    syscon?: string;
    configurations?: any;
    abilitazioni?: Array<string>;
    opzioniProdotto?: Array<string>;
    chiaviAccessoOrt?: any;
    ruolo?: string;
    richiestaAssistenzaAttiva?: boolean;
    userEmail?: string;
    internal?: boolean;
    loa?: string;
    providerType?: string;
    cfImpersonato?: string;
    loaImpersonato?: string;
    idpImpersonato?: string;
    abilitaIntegrazioneJSerfin?: boolean;
}

export interface SdkReducer {
    run(state: SdkStateMap, action: SdkStoreAction): SdkStateMap;
}
