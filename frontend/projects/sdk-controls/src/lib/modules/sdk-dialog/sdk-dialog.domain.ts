import { Subject } from 'rxjs';

// #region Dialog

/**
 * Interfaccia di configurazione di un dialog
 */
export interface SdkDialogConfig {
    /**
     * Titolo del dialog, se omesso non verra' renderizzato il pulsante di chiusura
     */
    header?: string;
    /**
     * Contenuro del dialog
     */
    message?: string;
    /**
     * Subject per l'apertura del dialog, presenta una callback che verra' chiamata se il dialog verra' confermato
     */
    open: Subject<Function>;
    /**
     * Label tradotta per il pulsante di conferma
     */
    acceptLabel?: string;
    /**
     * Label tradotta per il pulsante di rifiuto
     */
    rejectLabel?: string;
    /**
     * Identificativo della dialog nel caso ce ne siano più di una.
     */
    dialogId?: string;
    /**
     * Label tradotta per il campo di motivazione
     */
    motivazioneLabel?: string;
    /**
     * Label tradotta per il campo di data nel datepicker-dialog.
     */
    dataDialogLabel?: string;
    /**
     * Label tradotta per campo aggiuntivo. Utilizzabile come stringa jolly per il dialog senza conferma.
     */
    multiPurposeString? : string;
}

// #endregion