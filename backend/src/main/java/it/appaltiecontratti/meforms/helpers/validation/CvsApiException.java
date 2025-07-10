package it.appaltiecontratti.meforms.helpers.validation;

import lombok.*;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode(callSuper = true)
public class CvsApiException extends RuntimeException {
    private String message;
    private int statusCode;

    @Override
    public String getMessage() {
        return String.format("Message=%s, statusCode=%s", message, statusCode);
    }
}
