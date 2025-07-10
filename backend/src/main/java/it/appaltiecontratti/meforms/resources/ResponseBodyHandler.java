package it.appaltiecontratti.meforms.resources;

import it.appaltiecontratti.meforms.domain.ResponseResult;
import org.springframework.core.MethodParameter;
import org.springframework.core.ReactiveAdapterRegistry;
import org.springframework.http.codec.HttpMessageWriter;
import org.springframework.web.reactive.HandlerResult;
import org.springframework.web.reactive.accept.RequestedContentTypeResolver;
import org.springframework.web.reactive.result.method.annotation.ResponseBodyResultHandler;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 24, 2024
 */
public class ResponseBodyHandler extends ResponseBodyResultHandler {

    private final String contextPath;

    private final static List<String> SYSTEM_ENDPOINTS = List.of("/swagger-ui", "/v3/api-docs", "/webjars");

    public ResponseBodyHandler(List<HttpMessageWriter<?>> writers,
                               RequestedContentTypeResolver resolver,
                               ReactiveAdapterRegistry registry,
                               String contextPath) {
        super(writers, resolver, registry);
        this.contextPath = contextPath;
    }

    @Override
    public Mono<Void> handleResult(ServerWebExchange exchange, HandlerResult result) {

        Object body = result.getReturnValue();
        MethodParameter returnType = result.getReturnTypeSource();

        // Do not wrap swagger endpoints in the base object
        if (isSystemEndpoint(exchange)) {
            return writeBody(body, returnType, exchange);
        }

        Object response = null;

        if (body instanceof Mono) {
            response = ((Mono<?>) body).map(this::wrapInStandardResponse);
        } else if (body instanceof Flux) {
            response = ((Flux<?>) body).map(this::wrapInStandardResponse);
        } else {
            response = Mono.just(wrapInStandardResponse(body));
        }

        return writeBody(response, returnType, exchange);
    }

    private ResponseResult<?> wrapInStandardResponse(Object body) {
        if (body instanceof ResponseResult) {
            return (ResponseResult<?>) body;
        }

        return new ResponseResult<>(true, null, body);
    }

    private boolean isSystemEndpoint(ServerWebExchange exchange) {
        String requestPath = exchange.getRequest().getPath().toString();
        requestPath = requestPath.replace(contextPath, "");
        return SYSTEM_ENDPOINTS.stream()
                .anyMatch(requestPath::startsWith);
    }
}
