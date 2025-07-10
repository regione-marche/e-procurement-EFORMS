package it.appaltiecontratti.meforms.exceptions;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since feb 19, 2025
 *
 * Classe che gestisce il caso in cui ci siano gruppi facoltativi i quali hanno all'interno campi
 * obbligatori.
 * Questi gruppi facoltativi vengono inseriti anche quando l'utente non compila manualmente i campi perche' contengono
 * campi con valori preselezionati dall'SDK TED oppure campi attributo (es. lingua)
 */
public class HandledGroupException extends RuntimeException {
    public HandledGroupException() {
        super();
    }

    public HandledGroupException(String message) {
        super(message);
    }

    public HandledGroupException(Throwable t) {
        super(t);
    }

    public HandledGroupException(String message, Throwable t) {
        super(message, t);
    }
}
