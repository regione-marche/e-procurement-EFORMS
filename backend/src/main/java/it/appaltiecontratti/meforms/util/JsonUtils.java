package it.appaltiecontratti.meforms.util;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.lang3.Validate;

import java.util.*;

/**
 * Helper for Jackson JSON construction and reading (get).
 */
public class JsonUtils {

    private JsonUtils() {
        throw new UnsupportedOperationException("The class is a utility class!");
    }

    public static ObjectMapper getStandardJacksonObjectMapper() {
        return JsonMapper.builder()
                .findAndAddModules()
                // Value that indicates that only properties with non-null values are to be included.
                .serializationInclusion(JsonInclude.Include.NON_NULL)
                // Value that indicates that only properties with null value, or what is considered empty, are
                // not to be included.
                .serializationInclusion(JsonInclude.Include.NON_EMPTY)
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }

    public static ObjectNode createObjectNode() {
        return getStandardJacksonObjectMapper().createObjectNode();
    }

    public static ArrayNode createArrayNode() {
        return getStandardJacksonObjectMapper().createArrayNode();
    }

    public static ArrayNode createArrayNode(final ObjectNode objectNode, final String key) {
        return objectNode.putArray(key);
    }

    public static int getIntStrict(final JsonNode json, final String key) {
        final JsonNode jsonElem = checkKeyAndElemNotNull(json, key);
        return jsonElem.asInt();
    }

    public static boolean getBoolStrict(final JsonNode json, final String key) {
        final JsonNode jsonElem = checkKeyAndElemNotNull(json, key);
        return jsonElem.asBoolean();
    }

    public static String getTextMaybeBlank(final JsonNode json, final String key) {
        final JsonNode jsonElem = checkKeyAndElemNotNull(json, key);
        return jsonElem.asText("");
    }

    /**
     * @return The expected text, otherwise it fails with the key as only information
     */
    public static String getTextStrict(final JsonNode json, final String key) {
        final JsonNode jsonElem = checkKeyAndElemNotNull(json, key);
        final String text = jsonElem.asText(null);
        Validate.notBlank(text, "Text is blank for key=%s, json=%s", key, json);
        return text;
    }

    /**
     * @param errorText This text will be shown in case of an error, this can be used to provide
     *                  additional context
     * @return The expected text, otherwise it fails with the key text and error text
     */
    public static String getTextStrict(final JsonNode json, final String key,
                                       final String errorText) {
        final JsonNode jsonElem = checkKeyAndElemNotNull(json, key, errorText);
        final String text = jsonElem.asText(null);
        Validate.notBlank(text, "Text is blank for key=%s, msg=%s", key, errorText);
        return text;
    }

    private static JsonNode checkKeyAndElemNotNull(final JsonNode json, final String key,
                                                   final String errorText) {
        Validate.notNull(json, "Elem is null for key=%s, msg=%s", key, errorText);

        final JsonNode jsonElem = json.get(key);
        Validate.notNull(jsonElem, "Not found for key=%s, msg=%s", key, errorText);
        return jsonElem;
    }

    private static JsonNode checkKeyAndElemNotNull(final JsonNode json, final String key) {
        Validate.notNull(json, "Elem is null for key=%s, json=%s", key, json);

        final JsonNode jsonElem = json.get(key);
        Validate.notNull(jsonElem, "Not found for key=%s, json=%s", key, json);
        return jsonElem;
    }

    public static Optional<String> getTextOpt(final JsonNode json, final String key) {
        Validate.notNull(json, "Elem is null for key=%s, json=%s", key, json);
        final JsonNode jsonElem = json.get(key);
        if (jsonElem == null) {
            return Optional.empty();
        }
        final String text = jsonElem.asText(null);
        if (text == null) {
            return Optional.empty();
        }
        return Optional.of(text);
    }

    public static String marshall(final Object obj) throws JsonProcessingException {
        final ObjectMapper objectMapper = getStandardJacksonObjectMapper();
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
    }

    public static List<String> getListOfStrings(final JsonNode jsonNode, final String key) {
        return getListOfStrings(jsonNode.get(key));
    }

    public static List<String> getListOfStrings(final JsonNode jsonNode) {
        if (jsonNode != null && jsonNode.isArray()) {
            final ArrayNode arrayNode = (ArrayNode) jsonNode;
            final List<String> values = new ArrayList<>(arrayNode.size());
            for (final Iterator<JsonNode> elements = arrayNode.elements(); elements.hasNext(); ) {
                values.add(elements.next().asText());
            }
            return values;
        }
        return Collections.emptyList();
    }

    public static List<JsonNode> getList(final JsonNode jsonNode) {
        if (jsonNode != null && jsonNode.isArray()) {
            final ArrayNode arrayNode = (ArrayNode) jsonNode;
            final List<JsonNode> values = new ArrayList<>(arrayNode.size());
            for (final Iterator<JsonNode> elements = arrayNode.elements(); elements.hasNext(); ) {
                values.add(elements.next());
            }
            return values;
        }
        return Collections.emptyList();
    }
}
