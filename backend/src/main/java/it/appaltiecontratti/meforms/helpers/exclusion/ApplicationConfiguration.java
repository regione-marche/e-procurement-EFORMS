package it.appaltiecontratti.meforms.helpers.exclusion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Data
@AllArgsConstructor
@ToString
@EqualsAndHashCode
@ConfigurationProperties(prefix = "application.configuration")
public class ApplicationConfiguration {

    private final List<ExclusionItem> exclusion;
}
