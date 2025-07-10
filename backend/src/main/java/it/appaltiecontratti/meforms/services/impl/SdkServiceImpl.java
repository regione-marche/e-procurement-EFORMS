package it.appaltiecontratti.meforms.services.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.helger.genericode.v10.CodeListDocument;
import com.helger.genericode.v10.Column;
import com.helger.genericode.v10.Row;
import com.helger.genericode.v10.Value;
import eu.europa.ted.eforms.sdk.SdkConstants;
import eu.europa.ted.eforms.sdk.SdkVersion;
import eu.europa.ted.eforms.sdk.resource.PathResource;
import eu.europa.ted.eforms.sdk.resource.SdkResourceLoader;
import it.appaltiecontratti.meforms.domain.Language;
import it.appaltiecontratti.meforms.dto.HomePageInfoDTO;
import it.appaltiecontratti.meforms.dto.NoticeSubtypesDetailDTO;
import it.appaltiecontratti.meforms.dto.NoticeTypesDTO;
import it.appaltiecontratti.meforms.genericode.CustomGenericodeMarshaller;
import it.appaltiecontratti.meforms.genericode.GenericodeTools;
import it.appaltiecontratti.meforms.helpers.SafeDocumentBuilder;
import it.appaltiecontratti.meforms.helpers.VersionHelper;
import it.appaltiecontratti.meforms.services.BaseService;
import it.appaltiecontratti.meforms.services.SdkService;
import it.appaltiecontratti.meforms.util.IntuitiveStringComparator;
import it.appaltiecontratti.meforms.util.JavaTools;
import it.appaltiecontratti.meforms.util.JsonUtils;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.Validate;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static it.appaltiecontratti.meforms.common.Constants.*;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 22, 2024
 */
@Service
@Slf4j
public class SdkServiceImpl extends BaseService implements SdkService {

    @SuppressWarnings("java:S3749")
    private final Map<String, List<String>> availableCodeListsId = new HashMap<>();
    @SuppressWarnings("java:S3749")
    private final Map<String, ObjectNode> codeListsMap = new HashMap<>();
    @Getter
    @SuppressWarnings("java:S3749")
    private final Map<String, Map<String, String>> fieldsAndGroupsMap = new HashMap<>();

    private static Optional<Value> gcFindFirstColumnRef(final Collection<Value> gcRowValues,
                                                        final String columnRefText) {
        return gcRowValues.stream()
                .filter(v -> ((Column) v.getColumnRef()).getId().equals(columnRefText))
                .findFirst();
    }

    private static void putCodeValueAndLangCode(final String codelistId, final String langCode, final ObjectMapper jsonMapper,
                                                final ArrayNode jsonRows, final String technicalCode, final Optional<Value> englishLabelOpt) {
        putCodeValueAndLangCode(codelistId, langCode, jsonMapper, jsonRows, technicalCode, englishLabelOpt, Optional.empty());
    }

    private static void putCodeValueAndLangCode(final String codelistId, final String langCode, final ObjectMapper jsonMapper,
                                                final ArrayNode jsonRows, final String technicalCode, final Optional<Value> englishLabelOpt, final Optional<Value> parentCodeValOpt) {


        String englishText = englishLabelOpt.get().getSimpleValueValue();
        final ObjectNode jsonRow = jsonMapper.createObjectNode();
        jsonRows.add(jsonRow);
        jsonRow.put("codeValue", technicalCode.strip());

        // EFORMS-81
        if (codelistId.equals("nuts-lvl3")) {
            try {
                englishText = englishText.strip() + " [" + technicalCode.strip() + "]";
            } catch (Exception e) {
                log.warn("Non e' stato possibile mappare i codici nuts nelle label", e);
            }
        }

        jsonRow.put(langCode, englishText.strip());
        if (parentCodeValOpt.isPresent()) {
            final String parentCode = parentCodeValOpt.map(Value::getSimpleValueValue).orElse(null);
            jsonRow.put("parentCode", parentCode);
        }
    }

    /**
     * Validates the format of the sdk version string because the sdk version may also be a folder
     * name.
     *
     * @return true if valid, else false
     */
    static boolean securityValidateSdkVersionFormat(final String sdkVersion) {
        if (StringUtils.isBlank(sdkVersion)) {
            return false;
        }
        return REGEX_SDK_VERSION.matcher(sdkVersion).matches();
    }

    /**
     * Throws a runtime exception if the sdkVersion does not match the expected format.
     */
    public static void securityValidateSdkVersionFormatThrows(final String sdkVersion) {
        if (!securityValidateSdkVersionFormat(sdkVersion)) {
            throw new RuntimeException(String.format("Invalid SDK version format: %s", sdkVersion));
        }
    }

    /**
     * Reads an SDK translation file for given SDK and language. The files are in XML format but they
     * will be converted to JSON.
     *
     * @return Map of the labels by id
     */
    public static Map<String, String> getTranslations(final SdkVersion sdkVersion,
                                                      final Path eformsSdkDir, final String labelAssetType, final String langCode)
            throws ParserConfigurationException, SAXException, IOException {

        // SECURITY: Do not inject the passed language directly into a string that goes to the file
        // system. We use our internal enum as a whitelist.
        final Language lang = Language.valueOfFromLocale(langCode);
        final String filenameForDownload =
                String.format("%s_%s.xml", labelAssetType, lang.getLocale().getLanguage());

        final Path path = SdkResourceLoader.getResourceAsPath(sdkVersion, SdkConstants.SdkResource.TRANSLATIONS,
                filenameForDownload, eformsSdkDir);

        // Example:
        // <?xml version="1.0" encoding="UTF-8"?>
        // <!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
        // <properties>
        // <entry key="field|name|BT-01(c)-Procedure">Procedure Legal Basis (ELI - celex)</entry>
        // ...

        // Parse the XML, build a map of text by id.
        final DocumentBuilder db = SafeDocumentBuilder.buildSafeDocumentBuilderAllowDoctype(true);
        final File file = path.toFile();

        // NOTE: the file may not exist if there are no translations yet.
        if (lang != Language.EN && !file.exists()) {
            // The best fallback is to respond as if the file was there but with empty values.
            // The keys (labelIds) are the same in english, we are only missing the values.
            // Take the english file to get the keys and leave the the translations empty.
            log.warn("File does not exist: {}", file.getName());
            final Map<String, String> fallbackMap =
                    getTranslations(sdkVersion, eformsSdkDir, labelAssetType, "en");
            for (final Map.Entry<String, String> entry : fallbackMap.entrySet()) {
                entry.setValue("");
            }
            return fallbackMap;
        }

        final Document doc = db.parse(file);
        doc.getDocumentElement().normalize();

        // Get all entries and populate a map with the key and values.
        final NodeList entries = doc.getElementsByTagName("entry");
        final Map<String, String> labelById = new LinkedHashMap<>();
        for (int i = 0; i < entries.getLength(); i++) {
            final Node entry = entries.item(i);
            if (entry.getNodeType() == Node.ELEMENT_NODE) {
                final NamedNodeMap attributes = entry.getAttributes();
                final String id = attributes.getNamedItem("key").getTextContent().strip();
                final String labelText = entry.getTextContent().strip();
                labelById.put(id, labelText);
            }
        }
        return labelById;
    }

    @PostConstruct
    private void loadResources() {
        // Carica una cache contenente tutti i code lists con chiave "sdk|lingua|codice"
        this.loadAllAvailableCodeLists();

        // Carica una cache contenente tutti i fields e i groups presi dalla cartella "translations" con chiave "sdk|lingua"
        this.loadAllAvailableFieldsAndGroups();
    }

    @Override
    public HomePageInfoDTO getHomePageInfo(List<SdkVersion> supportedSdks) {
        Validate.notNull(supportedSdks, "Undefined supported SDKs");

        final Map<String, Object> map = new LinkedHashMap<>();
        final Instant now = Instant.now();

        final String instantNowIso8601Str = now.toString();
        log.debug("Fetching home info: {}", instantNowIso8601Str);

        val dto = new HomePageInfoDTO(APP_VERSION, supportedSdks.stream()
                .map(SdkVersion::toStringWithoutPatch)
                .sorted(new IntuitiveStringComparator<>())
                .sorted(Collections.reverseOrder())
                .collect(Collectors.toList()));

        log.debug("Fetching home info: DONE");
        return dto;
    }

    /**
     * Dynamically get the available notice sub types from the given SDK. They will be proposed in the
     * UI for the user to select.
     */
    @Override
    public NoticeTypesDTO getNoticeSubTypes(final SdkVersion sdkVersion,
                                            final Path eformsSdkDir) {

        val dto = new NoticeTypesDTO();

        // Just proxy this back to the UI as XHR calls could be async.
        dto.setSdkVersion(sdkVersion);
        try {
            final List<String> availableNoticeTypes = JavaTools.listFiles(
                    SdkResourceLoader.getResourceAsPath(sdkVersion, SdkConstants.SdkResource.NOTICE_TYPES, eformsSdkDir));

            final List<String> noticeTypes = availableNoticeTypes.stream()
                    // Remove some files.
                    .filter(filename -> filename.endsWith(".json")
                            && !SDK_NOTICE_TYPES_JSON.equals(filename))
                    // Remove extension.
                    .map(filename -> filename.substring(0, filename.lastIndexOf('.')))
                    .sorted(new IntuitiveStringComparator<>())
                    .collect(Collectors.toList());

            dto.setNoticeTypes(noticeTypes);

        } catch (final IOException e) {
            log.error(e.toString(), e);
        }
        log.debug("Fetching getNoticeSubTypes: DONE");
        return dto;
    }

    @Override
    public NoticeSubtypesDetailDTO getNoticeSubTypesDetail(final SdkVersion sdkVersion) {
        final JsonNode noticeTypesJson = readNoticeTypesJson(sdkVersion);
        TypeReference<ArrayList<JsonNode>> mapType = new TypeReference<>() {
        };
        List<JsonNode> noticeTypesList = JsonUtils.getStandardJacksonObjectMapper().convertValue(noticeTypesJson.get("noticeSubTypes"), mapType);
        val dto = new NoticeSubtypesDetailDTO(sdkVersion, noticeTypesList);
        log.debug("Fetching getNoticeSubTypesDetail: DONE");
        return dto;
    }

    /**
     * Serve an SDK codelist information as JSON. This is called when a field allows to select codes.
     */
    @Override
    public ObjectNode serveCodelistAsJson(final SdkVersion sdkVersion, final Path eformsSdkDir, final String codelistId, final String langCode) {
        Validate.isTrue(isCodeListIdPermittedForSdk(sdkVersion, codelistId), "codelistId=%s not permitted", codelistId);
        return codeListsMap.get(generateCodeListsKey(sdkVersion.toString(), langCode, codelistId));
    }

    /**
     * Serves basic information about the SDK like fields.json and codelists.json data required to
     * build the form in the UI.
     *
     * @param sdkVersion The version for selecting the correct SDK.
     */
    @Override
    public ObjectNode serveSdkBasicMetadata(final SdkVersion sdkVersion) {
        Validate.notNull(sdkVersion, "sdkVersion is null");

        final JsonNode fieldsJson = readSdkFieldsJson(sdkVersion);
        final JsonNode codelistsJson = readSdkCodelistsJson(sdkVersion);

        // Instead of doing several separate calls, it is simpler to group basic information in one go.
        final ObjectNode basicInfoJson = JsonUtils.createObjectNode();
        basicInfoJson.set("fieldsJson", fieldsJson);
        basicInfoJson.set("codelistsJson", codelistsJson);

        return basicInfoJson;
    }

    /**
     * Common SDK folder logic for reading JSON files.
     *
     * <p>
     * PERFORMANCE: To simplify we serve the entire JSON, it is possible that the application does not
     * everything or that some information could be filtered before it is served to reduce the passed
     * data. We do not go this far in the editor demo.
     * </p>
     */
    @Override
    public JsonNode serveSdkJsonFile(final SdkVersion sdkVersion,
                                     final PathResource resourceType, final String noticeId) {
        Validate.notNull(sdkVersion, "Undefined SDK version");
        Validate.notNull(noticeId, "Undefined Notice ID");

        final String filenameForDownload = String.format("%s.json", noticeId);

        try {

            final Path path = SdkResourceLoader.getResourceAsPath(sdkVersion, resourceType,
                    filenameForDownload, eformsSdkDir);

            try (InputStream is = Files.newInputStream(path)) {
                if (is == null) {
                    throw new RuntimeException(String.format("InputStream is null for %s", path));
                }

                final ObjectMapper mapper = JsonUtils.getStandardJacksonObjectMapper();
                return mapper.readValue(is, JsonNode.class);

            } catch (final IOException ex) {
                log.info("Error responding with file '{}' for download.", path, ex);
                throw new RuntimeException("IOException writing file to output stream.", ex);
            }

        } catch (Exception ex) {
            log.error(ex.toString(), ex);
            throw new RuntimeException(
                    String.format("Exception serving JSON file %s", filenameForDownload), ex);
        }
    }

    @Override
    public JsonNode serveTranslations(final SdkVersion sdkVersion, final String langCode) {

        Validate.notNull(sdkVersion, "Undefined SDK version");
        Validate.notNull(langCode, "Undefined Lang Code");

        return JsonUtils.getStandardJacksonObjectMapper().convertValue(
                fieldsAndGroupsMap.get(generateFieldsAndGroupsKey(sdkVersion.toString(), langCode)),
                JsonNode.class
        );
    }

    private ObjectNode buildJsonFromCodelistId(final String codelistId, final Path path,
                                               final String langCode) throws IOException {
        // Use GC Helger lib to load SDK .gc file.
        final CustomGenericodeMarshaller marshaller = GenericodeTools.getMarshaller();
        try (InputStream is = Files.newInputStream(path)) {

            // Transform the XML to Java objects.
            final CodeListDocument gcDoc = GenericodeTools.parseGenericode(is, marshaller);

            final String shortName = gcDoc.getIdentification().getShortNameValue();
            final String longName = gcDoc.getIdentification().getLongNameAtIndex(0).getValue();

            final ObjectMapper jsonMapper = JsonUtils.getStandardJacksonObjectMapper();
            final ObjectNode jsonCodelist = jsonMapper.createObjectNode();

            // By convention of the SDK the longname is the codelist identifier.
            jsonCodelist.put("id", longName);

            // This could be used in the UI for display purposes.
            jsonCodelist.put("longName", longName);
            jsonCodelist.put("shortName", shortName);

            final ArrayNode jsonRows = jsonCodelist.putArray("codes");

            // Example: "en "to "eng_label"
            final Language desiredLang = Language.valueOfFromLocale(langCode);
            final String genericodeLang = desiredLang.getGenericodeLanguage();

            final List<Row> gcRows = gcDoc.getSimpleCodeList().getRow();
            for (final Row gcRow : gcRows) {

                final List<Value> gcRowValues = gcRow.getValue();
                final Optional<Value> technicalCodeValOpt = gcFindFirstColumnRef(gcRowValues, "code");
                final Optional<Value> parentCodeValOpt = gcFindFirstColumnRef(gcRowValues, "parentCode");

                final String technicalCode;
                if (technicalCodeValOpt.isPresent()) {
                    technicalCode = technicalCodeValOpt.get().getSimpleValueValue();
                    Validate.notBlank("technicalCode is blank for codelistId=%s", codelistId);

                    // Get desired language first, fallback to eng.
                    final Optional<Value> desiredLabelOpt = gcFindFirstColumnRef(gcRowValues, genericodeLang);
                    if (desiredLabelOpt.isPresent()) {
                        putCodeValueAndLangCode(codelistId, langCode, jsonMapper, jsonRows, technicalCode, desiredLabelOpt, parentCodeValOpt);
                    } else {
                        final Optional<Value> englishLabelOpt = gcFindFirstColumnRef(gcRowValues, "eng_label");
                        if (englishLabelOpt.isPresent()) {
                            putCodeValueAndLangCode(codelistId, langCode, jsonMapper, jsonRows, technicalCode,
                                    englishLabelOpt, parentCodeValOpt);
                        } else {
                            // Just take the Name and assume it is in english.
                            final Optional<Value> nameLabelOpt = gcFindFirstColumnRef(gcRowValues, "Name");
                            if (nameLabelOpt.isPresent()) {
                                putCodeValueAndLangCode(codelistId, langCode, jsonMapper, jsonRows, technicalCode,
                                        nameLabelOpt, parentCodeValOpt);
                            }
                        }
                    }
                }
            }

            return jsonCodelist;
        }
    }

    /**
     * Reads SDK JSON file into a JsonNode to be used in the Java code on the server-side.
     */
    public JsonNode readSdkJsonFile(final SdkVersion sdkVersion, final PathResource resourceType,
                                    final String filenameForDownload) {
        Validate.notNull(sdkVersion, "Undefined SDK version");
        try {
            final Path path = readSdkPath(sdkVersion, resourceType, filenameForDownload);
            final ObjectMapper mapper = JsonMapper.builder().build();
            return mapper.readTree(path.toFile());
        } catch (IOException ex) {
            log.error(ex.toString(), ex);
            throw new RuntimeException(
                    String.format("Exception reading JSON file %s", filenameForDownload), ex);
        }
    }

    /**
     * SDK resouce as a Path.
     */
    public Path readSdkPath(final SdkVersion sdkVersion, final PathResource resourceType,
                            final String filenameForDownload) {
        Validate.notNull(sdkVersion, "SDK version is null");
        // For the moment the way the folders work is that the folder "1.1.2" would be in folder "1.1",
        // if "1.1.3" exists it would overwrite "1.1.2", but the folder would still be "1.1".
        final String sdkVersionNoPatch = VersionHelper.buildSdkVersionWithoutPatch(sdkVersion);
        return SdkResourceLoader.getResourceAsPath(new SdkVersion(sdkVersionNoPatch), resourceType,
                filenameForDownload, eformsSdkDir);
    }

    @Override
    public JsonNode readSdkCodelistsJson(final SdkVersion sdkVersion) {
        return readSdkJsonFile(sdkVersion, SdkConstants.SdkResource.CODELISTS, SDK_CODELISTS_JSON);
    }

    @Override
    public JsonNode readNoticeTypesJson(final SdkVersion sdkVersion) {
        return readSdkJsonFile(sdkVersion, SdkConstants.SdkResource.NOTICE_TYPES, SDK_NOTICE_TYPES_JSON);
    }

    /**
     * PERFORMANCE: we serve the entire JSON for simplicity in the editor demo, but note that some
     * data may not be used at all in the front-end. This could be optimised by removing this data
     * here before sending the response. Some information could also be retrieved dynamically on
     * demand later (case by case).
     */
    @Override
    public JsonNode readSdkFieldsJson(final SdkVersion sdkVersion) {
        return readSdkJsonFile(sdkVersion, SdkConstants.SdkResource.FIELDS, SDK_FIELDS_JSON);
    }

    // Carica tutti i code list
    private void loadAllAvailableCodeLists() {
        log.info("Starting loading of all code lists.");
        this.supportedSdksObj.forEach(sdkVersion -> {
            List<String> codeListsId = new ArrayList<>();
            // Read the file codelists.json for the current SDK version
            final JsonNode codelistsJson = readSdkCodelistsJson(sdkVersion);
            // for each codelist...
            for (JsonNode jsonNode : codelistsJson.get("codelists")) {
                // for each supported language...
                this.supportedLanguages.forEach(supportedLanguage -> {
                    // Retrieve the codeListId
                    String codeListId = jsonNode.get("id").asText();
                    codeListsId.add(codeListId);
                    // Retrieve the filename
                    String filename = jsonNode.get("filename").asText();
                    // Build the path for the ".gc" file
                    final Path path = SdkResourceLoader.getResourceAsPath(sdkVersion, SdkConstants.SdkResource.CODELISTS, filename, eformsSdkDir);
                    try {
                        // Retrieve the langCode
                        final Language lang = Language.valueOfFromLocale(supportedLanguage);
                        final String langCode = lang.getLocale().getLanguage();

                        // Load the codelist
                        log.debug("Loading codelist: {} for sdk: {} and language: {}", codeListId, sdkVersion, langCode);
                        codeListsMap.put(
                                generateCodeListsKey(sdkVersion.toString(), langCode, codeListId),
                                buildJsonFromCodelistId(codeListId, path, langCode)
                        );
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
            }
            availableCodeListsId.put(sdkVersion.toString(), codeListsId.stream().toList());
        });
        log.info("All code lists were loaded.");
    }

    private boolean isCodeListIdPermittedForSdk(final SdkVersion sdkVersion, final String codelistId) {
        Validate.notNull(sdkVersion, "sdkVersion null");
        Validate.notNull(codelistId, "codelistId null");
        if (availableCodeListsId.containsKey(sdkVersion.toString())) {
            List<String> codeListsId = availableCodeListsId.get(sdkVersion.toString());
            return codeListsId.contains(codelistId);
        }
        return false;
    }

    private String generateCodeListsKey(String sdkVersion, String langCode, String codelistId) {
        return sdkVersion + "|" + langCode + "|" + codelistId;
    }

    // Carica tutti i fields e i groups
    private void loadAllAvailableFieldsAndGroups() {
        log.info("Starting loading of all fields and groups.");
        this.supportedSdksObj.forEach(sdkVersion -> {
            this.supportedLanguages.forEach(langCode -> {
                try {
                    log.debug("Loading fields and groups for sdk: {} and language: {}", sdkVersion, langCode);

                    Map<String, String> tempMap = new HashMap<>();

                    // Read "fields"
                    tempMap.putAll(getTranslations(sdkVersion, eformsSdkDir, "field", langCode));
                    // Read "groups"
                    tempMap.putAll(getTranslations(sdkVersion, eformsSdkDir, "group", langCode));

                    fieldsAndGroupsMap.put(generateFieldsAndGroupsKey(sdkVersion.toString(), langCode), tempMap);
                } catch (ParserConfigurationException | SAXException | IOException e) {
                    throw new RuntimeException(e);
                }
            });
        });
        log.info("All fields and groups were loaded.");
    }

    private String generateFieldsAndGroupsKey(String sdkVersion, String langCode) {
        return sdkVersion + "|" + langCode;
    }
}
