package it.appaltiecontratti.meforms.common;

import java.util.regex.Pattern;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 22, 2024
 */
public class Constants {

    public static final String APP_VERSION = "1.0.0";

    public static final String API_V1 = "/v1/public/";
    public static final String BASE_PATH_XML_RESOURCE = "/v1/public/xml";

    public static final String MDC_TRACE_ID = "Trace-Id";
    public static final String MDC_VISUAL_MODEL = "Visual-Model";
    public static final String MDC_PHYSICAL_MODEL = "Physical-Model";

    public static final String SDK_NOTICE_TYPES_JSON = "notice-types.json";
    public static final String SDK_FIELDS_JSON = "fields.json";
    public static final String SDK_CODELISTS_JSON = "codelists.json";

    public static final Pattern REGEX_SDK_VERSION = Pattern.compile("\\p{Digit}{1,2}\\.\\p{Digit}{1,2}\\.\\p{Digit}{1,2}");
}
