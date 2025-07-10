package it.appaltiecontratti.meforms.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 28, 2024
 */
@Configuration
public class CorsEndpointConfiguration {

    @Bean
    @SuppressWarnings("java:S5122")
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.addAllowedOrigin("*"); // Configure allowed origins
        corsConfig.addAllowedMethod("*"); // Configure allowed methods
        corsConfig.addAllowedHeader("*"); // Configure allowed headers
        corsConfig.setMaxAge(3600L); // Optional: set how long the browser should cache the CORS config

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
