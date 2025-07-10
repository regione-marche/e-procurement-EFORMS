package it.appaltiecontratti.meforms.resources;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import eu.europa.ted.eforms.sdk.SdkConstants;
import eu.europa.ted.eforms.sdk.SdkVersion;
import it.appaltiecontratti.meforms.dto.HomePageInfoDTO;
import it.appaltiecontratti.meforms.dto.NoticeSubtypesDetailDTO;
import it.appaltiecontratti.meforms.dto.NoticeTypesDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.xml.sax.SAXException;
import reactor.core.publisher.Mono;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;

import static it.appaltiecontratti.meforms.common.Constants.API_V1;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 22, 2024
 */
@Slf4j
@RestController
@RequestMapping(value = API_V1 + "sdk")
public class SdkResource extends BaseResource {

    @GetMapping(value = "/info", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<HomePageInfoDTO> selectHomeInfo() {
        log.debug("Execution start {}::selectHomeInfo", getClass().getSimpleName());
        return Mono.just(sdkService.getHomePageInfo(supportedSdksObj));
    }

    @GetMapping(value = "/{sdkVersion}/notice-types", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<NoticeTypesDTO> selectNoticeTypesList(
            @PathVariable(value = "sdkVersion") final String sdkVersion) {
        log.debug("Execution start {}::selectNoticeTypesList with sdk version [ {} ]", getClass().getSimpleName(), sdkVersion);
        return Mono.just(sdkService.getNoticeSubTypes(new SdkVersion(sdkVersion), eformsSdkDir));
    }

    @GetMapping(value = "/{sdkVersion}/notice-sub-types-details", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<NoticeSubtypesDetailDTO> getNoticeTypesSublistDetails(@PathVariable(value = "sdkVersion") final String sdkVersion) {
        log.debug("Execution start {}::getNoticeTypesSublistDetails with sdk version [ {} ]", getClass().getSimpleName(), sdkVersion);
        return Mono.just(sdkService.getNoticeSubTypesDetail(new SdkVersion(sdkVersion)));
    }

    @GetMapping(value = "/{sdkVersion}/codelists/{codelistId}/lang/{langCode}", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    private Mono<ObjectNode> serveCodelist(@PathVariable(value = "sdkVersion") final String sdkVersion,
                                           @PathVariable(value = "codelistId") final String codelistId,
                                           @PathVariable(value = "langCode") final String langCode)
            throws IOException {
        log.debug("Execution start {}::serveCodelist with sdk version [ {} ], codelistId [ {} ] and langCode [ {} ]", getClass().getSimpleName(), sdkVersion, codelistId, langCode);
        return Mono.just(sdkService.serveCodelistAsJson(new SdkVersion(sdkVersion), eformsSdkDir, codelistId, langCode));
    }

    @GetMapping(value = "/{sdkVersion}/basic-meta-data", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ObjectNode> serveFieldsJson(@PathVariable(value = "sdkVersion") final String sdkVersion) {
        log.debug("Execution start {}::serveFieldsJson with sdk version [ {} ]", getClass().getSimpleName(), sdkVersion);
        return Mono.just(sdkService.serveSdkBasicMetadata(new SdkVersion(sdkVersion)));
    }

    @GetMapping(value = "/{sdkVersion}/notice-types/{noticeId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<JsonNode> serveNoticeTypeJson(@PathVariable(value = "sdkVersion") final String sdkVersion, @PathVariable(value = "noticeId") final String noticeId) {
        log.debug("Execution start {}::serveNoticeTypeJson with sdk version [ {} ] and noticeId [ {} ]", getClass().getSimpleName(), sdkVersion, noticeId);
        return Mono.just(sdkService.serveSdkJsonFile(new SdkVersion(sdkVersion), SdkConstants.SdkResource.NOTICE_TYPES, noticeId));
    }

    @GetMapping(value = "/{sdkVersion}/translations/{langCode}.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<JsonNode> serveTranslationsFields(@PathVariable(value = "sdkVersion") final String sdkVersion, @PathVariable(value = "langCode") final String langCode) throws ParserConfigurationException, SAXException, IOException {
        log.debug("Execution start {}::serveTranslationsFields with sdk version [ {} ] and langCode [ {} ]", getClass().getSimpleName(), sdkVersion, langCode);
        return Mono.just(sdkService.serveTranslations(new SdkVersion(sdkVersion), langCode));
    }
}
