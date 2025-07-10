package it.appaltiecontratti.meforms.helpers.rendering;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "application.ted.render")
@Data
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class RenderConfig {
    private final String url;
}
