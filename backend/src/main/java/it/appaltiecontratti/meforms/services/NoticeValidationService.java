package it.appaltiecontratti.meforms.services;

import com.fasterxml.jackson.databind.node.ObjectNode;
import eu.europa.ted.eforms.sdk.SdkVersion;
import it.appaltiecontratti.meforms.helpers.validation.CsvValidationMode;
import org.xml.sax.SAXException;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
public interface NoticeValidationService {

    ObjectNode validateNoticeUsingXsd(final UUID noticeUuid, final SdkVersion sdkVersion, final String noticeXmlText, final Optional<Path> mainXsdPathOpt) throws SAXException, IOException;

    Mono<String> validateNoticeXmlUsingCvs(final String noticeXml, final Optional<String> eformsSdkVersion, final Optional<String> svrlLangA2, final Optional<CsvValidationMode> sdkValidationMode) throws IOException;
}
