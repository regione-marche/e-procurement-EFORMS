package it.appaltiecontratti.meforms.services;

import com.fasterxml.jackson.databind.JsonNode;
import it.appaltiecontratti.meforms.dto.CvsOutputDTO;
import it.appaltiecontratti.meforms.helpers.notice.PhysicalModel;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.TimeZone;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
public interface XmlWriteService {

    String saveNoticeAsXml(final String noticeJson, final TimeZone timezone) throws Exception;

    JsonNode validateUsingXsd(final String noticeJson, final TimeZone timezone) throws Exception;

    PhysicalModel buildPhysicalModel(final String noticeJson, final boolean debug, final boolean skipIfNoValue, final boolean sortXml, final TimeZone timezone) throws Exception;

    Mono<CvsOutputDTO> validateUsingCvs(final String noticeJson, final TimeZone timezone, String sdkVersion, String langCode) throws Exception;

    Mono<ResponseEntity<Flux<DataBuffer>>> saveNoticeAndRender(final String noticeJson, final TimeZone timezone) throws Exception;
}
