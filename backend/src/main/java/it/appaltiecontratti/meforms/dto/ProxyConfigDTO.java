package it.appaltiecontratti.meforms.dto;

import lombok.*;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since nov 05, 2024
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
public class ProxyConfigDTO {
    private boolean enableProxy;
    private String httpProxy;
    private String httpsProxy;
    private String noProxy;
}
