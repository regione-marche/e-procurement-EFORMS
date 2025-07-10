package it.appaltiecontratti.meforms.helpers.validation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
@ConfigurationProperties(prefix = "application.ted.cvs")
@Data
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class CvsConfig {
    private final String url;
}
