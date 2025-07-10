package it.appaltiecontratti.meforms.configuration;

import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import reactor.util.context.Context;

import java.util.UUID;

import static it.appaltiecontratti.meforms.common.Constants.BASE_PATH_XML_RESOURCE;
import static it.appaltiecontratti.meforms.common.Constants.MDC_TRACE_ID;

@Order(1)
@Component
public class MDCFilter implements WebFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Imposta un Trace-Id solamente per il base path desiderato
        if (request.getURI().getPath().contains(BASE_PATH_XML_RESOURCE)) {
            String traceId = UUID.randomUUID().toString();
            MDC.put(MDC_TRACE_ID, traceId);

            return chain.filter(exchange)
                    .contextWrite(Context.of(MDC_TRACE_ID, traceId))
                    .doFinally(signal -> MDC.clear());
        }
        return chain.filter(exchange);
    }
}
