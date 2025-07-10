package it.appaltiecontratti.meforms.domain;

import java.io.Serializable;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
public record XMLOutput(
        String xml
) implements Serializable {
}
