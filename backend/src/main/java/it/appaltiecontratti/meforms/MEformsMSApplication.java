package it.appaltiecontratti.meforms;

import it.appaltiecontratti.meforms.helpers.TedConfig;
import it.appaltiecontratti.meforms.helpers.exclusion.ApplicationConfiguration;
import it.appaltiecontratti.meforms.helpers.rendering.RenderConfig;
import it.appaltiecontratti.meforms.helpers.validation.CvsConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({TedConfig.class, CvsConfig.class, RenderConfig.class, ApplicationConfiguration.class})
public class MEformsMSApplication {

    public static void main(String[] args) {
        SpringApplication.run(MEformsMSApplication.class, args);
    }

}
