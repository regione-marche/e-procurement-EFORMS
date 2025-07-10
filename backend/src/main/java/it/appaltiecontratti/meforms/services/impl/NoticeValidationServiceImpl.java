package it.appaltiecontratti.meforms.services.impl;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import eu.europa.ted.eforms.sdk.SdkVersion;
import it.appaltiecontratti.meforms.helpers.TedApiClient;
import it.appaltiecontratti.meforms.helpers.TedConfig;
import it.appaltiecontratti.meforms.helpers.validation.CsvValidationMode;
import it.appaltiecontratti.meforms.helpers.validation.XsdValidator;
import it.appaltiecontratti.meforms.services.BaseService;
import it.appaltiecontratti.meforms.services.NoticeValidationService;
import it.appaltiecontratti.meforms.util.JsonUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.Validate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
@Service
@Slf4j
public class NoticeValidationServiceImpl extends BaseService implements NoticeValidationService {

    @Autowired
    private TedConfig tedConfig;

    @Autowired
    private TedApiClient tedApiClient;

    @Override
    public ObjectNode validateNoticeUsingXsd(final UUID noticeUuid, final SdkVersion sdkVersion,
                                             final String noticeXmlText, final Optional<Path> mainXsdPathOpt)
            throws SAXException, IOException {

        // Create a JSON report about the errors.
        log.info("Attempting to validate notice using XSD.");
        final ObjectNode xsdReport = JsonUtils.getStandardJacksonObjectMapper().createObjectNode();
        xsdReport.put("noticeUuid", noticeUuid.toString());
        xsdReport.put("sdkVersion", sdkVersion.toString());
        xsdReport.put("timestamp", Instant.now().toString());

        if (mainXsdPathOpt.isPresent()) {
            final Path mainXsdPath = mainXsdPathOpt.get();
            final List<SAXParseException> validationExceptions =
                    XsdValidator.validateXml(noticeXmlText, mainXsdPath);
            xsdReport.put("errorCount", validationExceptions.size());

            if (!validationExceptions.isEmpty()) {
                final ArrayNode xsdErrors = xsdReport.putArray("xsdErrors");
                for (SAXParseException ex : validationExceptions) {
                    log.error(ex.toString(), ex);
                    final ObjectNode xsdError = JsonUtils.getStandardJacksonObjectMapper().createObjectNode();
                    xsdError.put("lineNumber", ex.getLineNumber());
                    xsdError.put("columnNumber", ex.getColumnNumber());
                    xsdError.put("message", ex.getMessage());
                    xsdErrors.add(xsdError);
                }
            }
        } else {
            // This problem is related to how the XML is build and sorted, relying on the SDK definition
            // of all namespaces.
            final String message = String.format(
                    "This XSD validation feature is not supported in the editor demo for SDK version=%s",
                    sdkVersion);
            xsdReport.put("Unsupported", message);
        }
        return xsdReport;
    }

    /**
     * @param noticeXml        The notice XML text
     * @param eformsSdkVersion An optional SDK version in case it does not work with the desired
     *                         version, if not provided the version found in the notice XML will be used
     * @param svrlLangA2       The language the svrl messages should be in
     * @return The response body
     */
    @Override
    public Mono<String> validateNoticeXmlUsingCvs(final String noticeXml,
                                                    final Optional<String> eformsSdkVersion, final Optional<String> svrlLangA2,
                                                    final Optional<CsvValidationMode> sdkValidationMode) throws IOException {
        log.info("Attempting to validate notice using the CVS");

        // https://docs.ted.europa.eu/api/index.html
        // TED Developer Portal API KEY.
        final String tedDevApiKey = tedConfig.getApiKey();
        Validate.notBlank(tedDevApiKey, "Your TED API key is not configured, see application.yaml");

        final String cvsApiRootUrl = tedConfig.getCvs().getUrl();
        Validate.notBlank(cvsApiRootUrl, "The CVS URL is not configured, see application.yaml");

        //
        // Call the CVS API.
        //
        return tedApiClient.validateNoticeXml(noticeXml, svrlLangA2, eformsSdkVersion, sdkValidationMode);
    }
}
