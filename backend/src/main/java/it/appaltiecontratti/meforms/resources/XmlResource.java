package it.appaltiecontratti.meforms.resources;

import com.fasterxml.jackson.databind.JsonNode;
import it.appaltiecontratti.meforms.domain.XMLOutput;
import it.appaltiecontratti.meforms.dto.CvsOutputDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.TimeZone;

import static it.appaltiecontratti.meforms.common.Constants.API_V1;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
@Slf4j
@RestController
@RequestMapping(value = API_V1 + "xml")
public class XmlResource extends BaseResource {

    /**
     * Save: Takes notice as JSON and builds notice XML. The SDK version is in the notice metadata.
     */
    @PostMapping(value = "/notice/save/validation/none", produces = {MediaType.APPLICATION_JSON_VALUE}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public Mono<XMLOutput> saveNotice(final TimeZone timezone, final @RequestBody String noticeJson)
            throws Exception {
        // For the XML generation config booleans, see application.yaml
        return Mono.just(new XMLOutput(xmlService.saveNoticeAsXml(noticeJson, timezone)));
    }

    /**
     * Save: Takes notice as JSON and builds notice XML. The SDK version is in the notice metadata.
     * The notice XML is validated against the appropriate SDK XSDs.
     */
    @PostMapping(value = "/notice/save/validation/xsd", produces = {MediaType.APPLICATION_JSON_VALUE}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public Mono<JsonNode> saveNoticeAndXsdValidate(final TimeZone timezone, final @RequestBody String noticeJson) throws Exception {
        return Mono.just(xmlService.validateUsingXsd(noticeJson, timezone));
    }

    /**
     * Save: Takes notice as JSON and builds notice XML. The SDK version is in the notice metadata.
     * The notice XML is validated using the remote CVS service (through the API). You must configure
     * this in the application.yaml file.
     */
    @PostMapping(value = "/notice/save/validation/cvs", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public Mono<CvsOutputDTO> saveNoticeAndCvsValidate(final TimeZone timezone, final @RequestBody String noticeJson,
                                                       @RequestParam(value = "sdkVersion") final String sdkVersion, @RequestParam(value = "langCode") final String langCode) throws Exception {
        return xmlService.validateUsingCvs(noticeJson, timezone, sdkVersion, langCode);
    }

    /**
     * Save: Takes notice as JSON and builds notice XML. The SDK version is in the notice metadata.
     * The notice XML is rendered in PDF using the remote RENDER service (through the API). You must configure
     * this in the application.yaml file.
     */
    @PostMapping(value = "/notice/save/render", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<Flux<DataBuffer>>> saveNoticeAndRender(final TimeZone timezone, final @RequestBody String noticeJson) throws Exception {
        return xmlService.saveNoticeAndRender(noticeJson, timezone);
    }
}
