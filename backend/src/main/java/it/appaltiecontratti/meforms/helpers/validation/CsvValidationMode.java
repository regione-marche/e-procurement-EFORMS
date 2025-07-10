package it.appaltiecontratti.meforms.helpers.validation;

import lombok.Getter;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
@Getter
public enum CsvValidationMode {
    STATIC("static"), DYNAMIC("dynamic");

    private final String text;

    CsvValidationMode(String text) {
        this.text = text;
    }

}
