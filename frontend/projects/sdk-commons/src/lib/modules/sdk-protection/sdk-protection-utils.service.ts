import { get, has, isEmpty } from 'lodash-es';
import { IDictionary } from '../sdk-shared/types/sdk-common.types';
import { ProfiloConfigurationItem } from './sdk-protection.domain';

/**
 * Servizio per la gestione
 */
export class SdkProtectionUtilsService {

    // #region Variables

    public static readonly typeMap: IDictionary<string> = {
        COLONNE: 'COLS',
        FUNZIONI: 'FUNZ',
        MASCHERE: 'MASC',
        MENU: 'MENU',
        PAGINE: 'PAGE',
        SEZIONI: 'SEZ',
        SUBMENU: 'SUBMENU',
        TABS: 'TABS'
    };

    public static readonly actionVis: string = 'VIS';
    public static readonly actionMan: string = 'MAN';
    public static readonly actionMod: string = 'MOD';
    public static readonly actionDel: string = 'DEL';

    // #endregion

    // #region Public

    /**
     * Metodo che verifica la protezione di un oggetto applicando il controllo inizialmente su tutta la chiave
     * ed eventualmente rimuovendo l'ultima parte di chiave sostituendola con un asterisco, ripetendo poi l'azione
     * finché rimane solo l'asterisco
     * Esempio:
     * oggettoProtezione = DL229.PROG_ANAG.STATO_CUP
     * 1a verifica su <checkType>.<azione>.DL229.PROG_ANAG.STATO_CUP
     * 2a verifica su <checkType>.<azione>.DL229.PROG_ANAG.*
     * 3a verifica su <checkType>.<azione>.DL229.*
     * e cosi' via finche' non rimane
     * <checkType>.<azione>.*
     * 
     * Mi fermo quando sono in quest'ultima situazione oppure trovo una corrispondenza per una chiave
     * itermedia
     * @param oggettoProtezione La chiave da verificare
     * @param checkType La tipologia di controllo (COLS, PAGE, SEZ, ecc...)
     * @param action L'azione da controllare (VIS, MOD, MAN)
     * @param protectionMap La mappa delle protezioni
     * @returns Se il risultato della condizione e' vero o falso
     */
    public static checkOggettoProtezione(oggettoProtezione: string, checkType: string, action: string, protectionMap: IDictionary<ProfiloConfigurationItem>): boolean {
        // Se l'oggetto protezione e' null o vuoto allora ritorno true di default
        if (oggettoProtezione == null || isEmpty(oggettoProtezione))
            return true;

        let key: string = `${checkType}.${action}.${oggettoProtezione}`;

        let conditionResult = this.checkKey(protectionMap, key);

        if (oggettoProtezione == '*' && conditionResult == undefined) {
            // Default protection
            if (action == this.actionVis)
                return true;
            else if (action == this.actionMod)
                return true;
            else if (action == this.actionMan)
                return false;
            else if (action == this.actionDel)
                return true;
        } else if (conditionResult == undefined) {
            let tempOggettoProtezione: string = this.removeOggettoProtezioneLastPart(oggettoProtezione);
            return this.checkOggettoProtezione(tempOggettoProtezione, checkType, action, protectionMap);
        }

        return conditionResult;
    }

    // #endregion

    // #region Private

    /**
     * Modifica l'oggetto protezione sostituendo l'ultima parte con un asterisco.
     * Se l'oggetto non contiene punti, restituisce solo un asterisco.
     * 
     * @param oggettoProtezione La stringa dell'oggetto protezione da modificare
     * @returns La stringa modificata con l'ultima parte sostituita da un asterisco
     */
    private static removeOggettoProtezioneLastPart(oggettoProtezione: string): string {
        if (!oggettoProtezione.includes('.'))
            return '*';

        let parts: Array<string> = oggettoProtezione.split('.');

        // Se sono gia' nel caso in cui l'ultima parte e' un asterisco,
        // la rimuovo
        if (parts[parts.length - 1] == '*')
            parts.splice(parts.length - 1, 1);

        // Sostituisco l'ultima parte con un asterisco
        parts[parts.length - 1] = '*';

        return parts.join('.');
    }

    /**
     * Metodo che verifica se una chiave e' presente tra le protezioni
     * @param protectionMap Mappa di protezioni
     * @param key Chiave
     * @returns Ritorna true se la chiave non e' stata trovata tra le protezioni altrimenti torna il valore del campo "valore" della protezione
     */
    private static checkKey(protectionMap: IDictionary<ProfiloConfigurationItem>, key: string): boolean {
        if (has(protectionMap, key)) {
            let protValue: ProfiloConfigurationItem = get(protectionMap, key);
            return protValue.valore;
        }
        return undefined;
    }

    // #endregion
}