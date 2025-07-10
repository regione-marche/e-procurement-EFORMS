package it.appaltiecontratti.meforms.helpers;

import it.appaltiecontratti.meforms.helpers.rendering.RenderConfig;
import it.appaltiecontratti.meforms.helpers.validation.CvsConfig;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "application.ted")
@Data
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class TedConfig {

    private final String apiKey;
    private final int attachmentSizeMB;
    private final CvsConfig cvs;
    private final RenderConfig render;
}
