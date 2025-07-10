package it.appaltiecontratti.meforms.configuration;

import it.appaltiecontratti.meforms.resources.ResponseBodyHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.ReactiveAdapterRegistry;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.web.reactive.accept.RequestedContentTypeResolver;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 24, 2024
 */
@Configuration
public class ResponseHandlerConfiguration {

    @Value("${spring.webflux.base-path}")
    private String contextPath;

    @Bean
    public ResponseBodyHandler responseWrapper(ServerCodecConfigurer serverCodecConfigurer,
                                               RequestedContentTypeResolver requestedContentTypeResolver) {
        return new ResponseBodyHandler(
                serverCodecConfigurer.getWriters(),
                requestedContentTypeResolver,
                ReactiveAdapterRegistry.getSharedInstance(),
                contextPath
        );
    }
}
