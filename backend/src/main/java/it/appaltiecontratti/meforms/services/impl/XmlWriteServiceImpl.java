package it.appaltiecontratti.meforms.services.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import eu.europa.ted.eforms.sdk.SdkConstants;
import eu.europa.ted.eforms.sdk.SdkVersion;
import it.appaltiecontratti.meforms.dto.CvsOutputDTO;
import it.appaltiecontratti.meforms.helpers.VersionHelper;
import it.appaltiecontratti.meforms.helpers.exclusion.ApplicationConfiguration;
import it.appaltiecontratti.meforms.helpers.notice.ConceptualModel;
import it.appaltiecontratti.meforms.helpers.notice.FieldsAndNodes;
import it.appaltiecontratti.meforms.helpers.notice.PhysicalModel;
import it.appaltiecontratti.meforms.helpers.notice.VisualModel;
import it.appaltiecontratti.meforms.helpers.validation.CsvValidationMode;
import it.appaltiecontratti.meforms.services.*;
import it.appaltiecontratti.meforms.util.JsonUtils;
import it.appaltiecontratti.meforms.util.LoggingUtils;
import it.appaltiecontratti.meforms.util.NoticeCleaner;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.Validate;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.nio.file.Path;
import java.util.*;

import static it.appaltiecontratti.meforms.common.Constants.MDC_PHYSICAL_MODEL;
import static it.appaltiecontratti.meforms.common.Constants.MDC_VISUAL_MODEL;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
@Service
@Slf4j
public class XmlWriteServiceImpl extends BaseService implements XmlWriteService {

    /**
     * Enriches the XML for human readability but it becomes invalid. Also adds .dot files and other
     * debug files in target.
     */
    @Value("${application.xml.generation.debug}")
    private boolean debug;

    @Value("${application.xml.generation.skipIfEmpty}")
    private boolean skipIfNoValue;

    @Value("${application.xml.generation.sortXmlElements}")
    private boolean sortXmlElements;

    @Autowired
    private SdkService sdkService;

    @Autowired
    private NoticeValidationService noticeValidationService;

    @Autowired
    private NoticeRenderService noticeRenderService;

    @Autowired
    private XmlParserService xmlParserService;

    @Autowired
    private ApplicationConfiguration applicationConfiguration;

    /**
     * @param noticeJson The notice as JSON as built by the front-end form.
     */
    @Override
    public String saveNoticeAsXml(final String noticeJson, final TimeZone timezone) throws Exception {
        log.info("Execution start {}::saveNoticeAsXml", getClass().getSimpleName());
        if (log.isDebugEnabled())
            log.debug("Notice json {}", noticeJson);

        final PhysicalModel physicalModel =
                buildPhysicalModel(noticeJson, debug, skipIfNoValue, sortXmlElements, timezone);
        final UUID noticeUuid = physicalModel.getNoticeId();
        final SdkVersion sdkVersion = physicalModel.getSdkVersion();
        try {
            // Transform physical model to XML.
            final String noticeXmlText = physicalModel.toXmlText(true);

            log.info("Execution end {}::saveNoticeAsXml", getClass().getSimpleName());

            return noticeXmlText;
        } catch (final Exception e) {
            // Catch any error, log some useful context and rethrow.
            log.error("Error for notice uuid={}, sdkVersion={}", noticeUuid,
                    sdkVersion.toNormalisedString(true));
            throw e;
        }
    }

    /**
     * @param noticeJson The notice as JSON as built by the front-end form.
     */
    @Override
    public JsonNode validateUsingXsd(final String noticeJson, final TimeZone timezone) throws Exception {
        log.info("Execution start {}::validateUsingXsd", getClass().getSimpleName());
        if (log.isDebugEnabled())
            log.debug("Notice json {}", noticeJson);

        // Traccio nell'MDC il json visuale
        try {
            String tracciatoLog = LoggingUtils.getZippedLoggingString(noticeJson);
            MDC.put(MDC_VISUAL_MODEL, tracciatoLog);
        } catch (Exception e) {
            log.error("Errore durante il salvataggio del tracciato visuale nell'MDC");
        }

        final PhysicalModel physicalModel =
                buildPhysicalModel(noticeJson, debug, skipIfNoValue, sortXmlElements, timezone);
        final SdkVersion sdkVersion = physicalModel.getSdkVersion();
        final UUID noticeUuid = physicalModel.getNoticeId();
        try {
            // Transform physical model to XML.
            final String noticeXmlText = physicalModel.toXmlText(true);

            // Traccio nell'MDC l'XML
            try {
                if (StringUtils.isNotBlank(noticeXmlText)) {
                    String tracciatoLog = LoggingUtils.getZippedLoggingString(noticeXmlText);
                    MDC.put(MDC_PHYSICAL_MODEL, tracciatoLog);
                }
            } catch (Exception e) {
                log.error("Errore durante il salvataggio dell'XML nell'MDC");
            }

            // Validate it using XSD.
            final Optional<Path> mainXsdPathOpt = physicalModel.getMainXsdPathOpt();

            final ObjectNode xsdReport = noticeValidationService.validateNoticeUsingXsd(noticeUuid,
                    sdkVersion, noticeXmlText, mainXsdPathOpt);

            final String jsonText = xsdReport.toPrettyString();
            final ObjectMapper mapper = JsonUtils.getStandardJacksonObjectMapper();
            final JsonNode jsonNode = mapper.readValue(jsonText, JsonNode.class);

            log.info("Execution end {}::validateUsingXsd", getClass().getSimpleName());

            return jsonNode;

        } catch (final Exception e) {
            // Catch any error, log some useful context and rethrow.
            log.error("Error for notice uuid={}, sdkVersion={}", noticeUuid,
                    sdkVersion.toNormalisedString(true));
            throw e;
        }
    }

    @Override
    public PhysicalModel buildPhysicalModel(final String noticeJson, final boolean debug,
                                            final boolean skipIfNoValue, final boolean sortXml, final TimeZone timezone)
            throws Exception {
        final JsonNode visualRoot = noticeCleaner.cleanNotice(noticeJson);
        final SdkVersion sdkVersion = parseSdkVersion(visualRoot);
        final UUID noticeUuid = parseNoticeUuid(visualRoot);
        try {
            log.info("Attempting to transform visual model into physical model as XML.");
            return buildPhysicalModel(visualRoot, sdkVersion, noticeUuid, debug, skipIfNoValue, sortXml, timezone);
        } catch (final Exception e) {
            // Catch any error, log some useful context and rethrow.
            log.error("Error for notice uuid={}, sdkVersion={}", noticeUuid,
                    sdkVersion.toNormalisedString(true));
            throw e;
        }
    }

    /**
     * Validate the notice using the remote Central Validation Service (CVS). Configuration is
     * required for this to work, see application.yaml
     *
     * @param noticeJson The notice as JSON as built by the front-end form.
     */
    @Override
    public Mono<CvsOutputDTO> validateUsingCvs(final String noticeJson, final TimeZone timezone, final String sdkVersion, final String langCode) throws Exception {
        Validate.notBlank(noticeJson, "noticeJson is blank");

        // Validazione XSD prima di effettuare il controllo CVS (lancia eccezione se validazione errata)
        JsonNode jsonNode = this.validateUsingXsd(noticeJson, timezone);
        log.info("Esito validazione XSD prima della validazione CVS: {}", jsonNode.toString());

        final PhysicalModel physicalModel =
                buildPhysicalModel(noticeJson, debug, skipIfNoValue, sortXmlElements, timezone);
        final UUID noticeUuid = physicalModel.getNoticeId();
        //final SdkVersion sdkVersion = physicalModel.getSdkVersion();

        // Transform physical model to XML.
        final String noticeXmlText = physicalModel.toXmlText(true);

        // Validate using the CVS.

        // Could pass the language of the UI for the SVRL report.
        final Optional<String> svrlLangA2 = Optional.of("it");

        final Optional<String> eformsSdkVersion = Optional.empty(); // Use default.
        final Optional<CsvValidationMode> validationMode = Optional.empty(); // Use default.

        log.debug("OUTPUT {}", noticeXmlText);

        final Mono<CvsOutputDTO> svrlXml = noticeValidationService.validateNoticeXmlUsingCvs(noticeXmlText,
                        eformsSdkVersion, svrlLangA2, validationMode)
                .flatMap(s -> xmlParserService.parseXmlCvsValidation(s, sdkVersion, langCode))
                .handle((cvsOutputDTO, sink) -> {
                    // Aggiunge l'XML nel caso in cui non ci siano failed asserts
                    if (cvsOutputDTO.getTotalFailedAsserts() == 0) {
                        try {
                            cvsOutputDTO.setXml(this.saveNoticeAsXml(noticeJson, timezone));
                        } catch (Exception e) {
                            sink.error(e);
                            return;
                        }
                    }
                    sink.next(cvsOutputDTO);
                });

        return svrlXml;
    }

    /**
     * Render the notice using the remote RENDER service. Configuration is
     * required for this to work, see application.yaml
     *
     * @param noticeJson The notice as JSON as built by the front-end form.
     */
    @Override
    public Mono<ResponseEntity<Flux<DataBuffer>>> saveNoticeAndRender(String noticeJson, TimeZone timezone) throws Exception {
        Validate.notBlank(noticeJson, "noticeJson is blank");

        final PhysicalModel physicalModel =
                buildPhysicalModel(noticeJson, debug, skipIfNoValue, sortXmlElements, timezone);

        // Transform physical model to XML.
        final String noticeXmlText = physicalModel.toXmlText(true);

        // Could pass the language of the UI.
        final Optional<String> language = Optional.of("it");

        log.debug("OUTPUT {}", noticeXmlText);

        return noticeRenderService.renderNoticeXml(noticeXmlText, language)
                .collectList()
                .map(dataBufferList -> {
                    // Gestisce la response come un flusso
                    Flux<DataBuffer> fileFlux = Flux.fromIterable(dataBufferList);

                    return ResponseEntity
                            .ok()
                            .contentType(MediaType.APPLICATION_PDF)
                            .body(fileFlux);
                });
    }

    /**
     * Goes from the visual model to the physical model of a notice. The conceptual model is a hidden
     * intermediary step.
     *
     * @param visualRoot    The root of the visual model of the notice, this is the main input
     * @param sdkVersion    The SDK version of the notice
     * @param debug         Adds special debug info to the XML, useful for humans and unit tests. Not for
     *                      production
     * @param skipIfNoValue Skip items if there is no value, this can help with debugging
     * @param sortXml       Sorts the XML if true, false otherwise. This can be used for debugging or
     *                      development purposes
     * @param timezone      The timezone
     * @return The physical model of the notice as the output
     */
    private PhysicalModel buildPhysicalModel(final JsonNode visualRoot, final SdkVersion sdkVersion,
                                             final UUID noticeUuid, final boolean debug, final boolean skipIfNoValue,
                                             final boolean sortXml, final TimeZone timezone)
            throws ParserConfigurationException, SAXException, IOException {
        Validate.notNull(visualRoot);
        Validate.notNull(noticeUuid);

        final FieldsAndNodes sdkFieldsAndNodes = readSdkFieldsAndNodes(sdkVersion);
        final VisualModel visualModel = new VisualModel(visualRoot, skipIfNoValue, applicationConfiguration);

        final JsonNode noticeTypesJson = sdkService.readNoticeTypesJson(sdkVersion);
        final Map<String, JsonNode> noticeInfoBySubtype = loadSdkNoticeTypeInfo(noticeTypesJson);
        final Map<String, JsonNode> documentInfoByType = parseDocumentTypes(noticeTypesJson);

        // Go from visual model to conceptual model.
        final ConceptualModel conceptModel =
                visualModel.toConceptualModel(sdkFieldsAndNodes, debug, timezone);

        // Build physical model.
        final boolean buildFields = true;
        return PhysicalModel.buildPhysicalModel(conceptModel,
                sdkFieldsAndNodes, noticeInfoBySubtype, documentInfoByType, debug, buildFields,
                eformsSdkDir, sortXml);
    }

    private static Map<String, JsonNode> loadSdkNoticeTypeInfo(
            final JsonNode noticeTypesJson) {
        final Map<String, JsonNode> noticeInfoBySubtype = new HashMap<>(512);
        // TODO add "noticeSubTypes" to the SDK constants.
        // SdkResource.NOTICE_SUB_TYPES
        final JsonNode noticeSubTypes = noticeTypesJson.get("noticeSubTypes");
        for (final JsonNode item : noticeSubTypes) {
            // TODO add "subTypeId" to the SDK constants.
            final String subTypeId = JsonUtils.getTextStrict(item, "subTypeId");
            noticeInfoBySubtype.put(subTypeId, item);
        }
        return noticeInfoBySubtype;
    }

    public FieldsAndNodes readSdkFieldsAndNodes(final SdkVersion sdkVersion) {
        final JsonNode fieldsJson = sdkService.readSdkFieldsJson(sdkVersion);
        return new FieldsAndNodes(fieldsJson, sdkVersion);
    }

    public static Map<String, JsonNode> parseDocumentTypes(final JsonNode noticeTypesJson) {
        final Map<String, JsonNode> documentInfoByType = new HashMap<>();
        final JsonNode documentTypes =
                noticeTypesJson.get(SdkConstants.NOTICE_TYPES_JSON_DOCUMENT_TYPES_KEY);
        for (final JsonNode item : documentTypes) {
            // TODO add document type "id" to the SDK constants. Maybe DOCUMENT_TYPE_ID.
            final String id = JsonUtils.getTextStrict(item, "id");
            documentInfoByType.put(id, item);
        }
        return documentInfoByType;
    }

    /**
     * Get the SDK version.
     *
     * @param visualRoot root of the visual JSON
     */
    private static SdkVersion parseSdkVersion(final JsonNode visualRoot) {
        // Example: the SDK value looks like "eforms-sdk-1.1.0".
        // final String sdkVersionFieldId = ConceptualModel.FIELD_ID_SDK_VERSION;
        // final JsonNode visualField = visualRoot.get(sdkVersionFieldId);
        // final String eformsSdkVersion = getTextStrict(visualField, "value");

        // Use the shortcut we put at the virtual root top level:
        final String eformsSdkVersion =
                JsonUtils.getTextStrict(visualRoot, VisualModel.VIS_SDK_VERSION);
        Validate.notBlank(eformsSdkVersion, "virtual root eFormsSdkVersion is blank");

        final SdkVersion sdkVersion =
                VersionHelper.parsePrefixedSdkVersion(eformsSdkVersion);
        log.info("Found SDK version: {}, using {}", eformsSdkVersion, sdkVersion);
        return sdkVersion;
    }

    /**
     * Get the notice id, notice UUID.
     *
     * @param visualRoot Root of the visual JSON
     */
    private static UUID parseNoticeUuid(final JsonNode visualRoot) {
        // final JsonNode visualItem = visualRoot.get("BT-701-notice");
        // Validate.notNull(visualItem, "Json item holding notice UUID is null!");
        // final String uuidStr = getTextStrict(visualItem, "value");

        final String uuidStr = JsonUtils.getTextStrict(visualRoot, VisualModel.VIS_NOTICE_UUID);
        Validate.notBlank(uuidStr, "The notice UUID is blank!");

        final UUID uuidV4 = UUID.fromString(uuidStr);
        // The UUID supports multiple versions but we are only interested in version 4.
        // Instead of failing later, it is better to catch problems early!
        final int version = uuidV4.version();
        Validate.isTrue(version == 4, "Expecting notice UUID to be version 4 but found %s for %s",
                version, uuidStr);

        return uuidV4;
    }
}
