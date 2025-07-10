package it.appaltiecontratti.meforms.resources;

import it.appaltiecontratti.meforms.domain.SimpleError;
import it.appaltiecontratti.meforms.exceptions.TedFailedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import reactor.core.publisher.Mono;

import static it.appaltiecontratti.meforms.common.Constants.MDC_TRACE_ID;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 24, 2024
 */
@Slf4j
@ControllerAdvice
public class ResponseErrorHandler {

    @ExceptionHandler({ Exception.class })
    public final Mono<ResponseEntity<SimpleError>> handleException(final Exception ex) {
        log.error("Errore {}", ex.getMessage(), ex);
        return Mono.deferContextual(ctx -> Mono.just(ResponseEntity
                .internalServerError()
                .body(new SimpleError(ctx.getOrDefault(MDC_TRACE_ID, null), ex.getMessage())))
        );
    }

    @ExceptionHandler({ TedFailedException.class })
    public final Mono<ResponseEntity<SimpleError>> handleApisException(final TedFailedException ex) {
        log.error("Errore {}", ex.getMessage(), ex);
        return Mono.deferContextual(ctx -> Mono.just(ResponseEntity
                .status(ex.getStatusCode())
                .body(new SimpleError(ctx.getOrDefault(MDC_TRACE_ID, null), ex.getError())))
        );
    }
}
