package it.appaltiecontratti.meforms.exceptions;

import lombok.Getter;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since nov 04, 2024
 */
@Getter
public class TedFailedException extends RuntimeException {
    private final String error;
    private final int statusCode;

    public TedFailedException(String error, int statusCode) {
        super();
        this.error = error;
        this.statusCode = statusCode;
    }
}
