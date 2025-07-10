package it.appaltiecontratti.meforms.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import eu.europa.ted.eforms.sdk.SdkVersion;
import eu.europa.ted.eforms.sdk.resource.PathResource;
import it.appaltiecontratti.meforms.dto.HomePageInfoDTO;
import it.appaltiecontratti.meforms.dto.NoticeSubtypesDetailDTO;
import it.appaltiecontratti.meforms.dto.NoticeTypesDTO;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 22, 2024
 */
public interface SdkService {

    HomePageInfoDTO getHomePageInfo(List<SdkVersion> supportedSdks);

    NoticeTypesDTO getNoticeSubTypes(final SdkVersion sdkVersion, final Path eformsSdkDir);

    NoticeSubtypesDetailDTO getNoticeSubTypesDetail(final SdkVersion sdkVersion);

    ObjectNode serveCodelistAsJson(final SdkVersion sdkVersion, final Path eformsSdkDir, final String codelistId, final String langCode) throws IOException;

    ObjectNode serveSdkBasicMetadata(final SdkVersion sdkVersion);

    JsonNode serveSdkJsonFile(final SdkVersion sdkVersion, final PathResource resourceType, final String noticeId);

    JsonNode serveTranslations(final SdkVersion sdkVersion, final String langCode) throws ParserConfigurationException, SAXException, IOException;

    JsonNode readSdkCodelistsJson(final SdkVersion sdkVersion);

    JsonNode readNoticeTypesJson(final SdkVersion sdkVersion);

    JsonNode readSdkFieldsJson(final SdkVersion sdkVersion);
}
