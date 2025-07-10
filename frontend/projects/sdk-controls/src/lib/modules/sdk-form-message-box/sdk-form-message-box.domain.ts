import { IDictionary } from '@maggioli/sdk-commons';

/**
 * Classe per il messaggio di alert
 */
export interface SdkFormMessageItem {
    /**
     * Testo
     */
    text: string;
    /**
     * Parametri
     */
    params?: IDictionary<any>;
}