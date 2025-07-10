package it.appaltiecontratti.meforms.helpers.notice;

import lombok.*;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
@Data
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class DocumentTypeNamespace {
    private final String prefix;
    private final String uri;
    private final String schemaLocation;
}
