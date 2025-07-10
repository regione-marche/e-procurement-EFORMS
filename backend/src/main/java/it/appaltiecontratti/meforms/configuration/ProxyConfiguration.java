package it.appaltiecontratti.meforms.configuration;

import it.appaltiecontratti.meforms.dto.ProxyConfigDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ProxyConfiguration {

    @Value("${application.enableProxy:false}")
    private boolean enableProxy;
    @Value("${http_proxy:}")
    private String httpProxy;
    @Value("${https_proxy:}")
    private String httpsProxy;
    @Value("${no_proxy:}")
    private String noProxy;

    @Bean
    public ProxyConfigDTO proxyConfigDTO() {
        return new ProxyConfigDTO(enableProxy, httpProxy, httpsProxy, noProxy);
    }
}
