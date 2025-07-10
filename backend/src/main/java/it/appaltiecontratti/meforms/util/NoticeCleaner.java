package it.appaltiecontratti.meforms.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.codehaus.plexus.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.io.IOException;
import java.util.*;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since feb 25, 2025
 */
@Slf4j
@Component
public class NoticeCleaner {

    private Map<String, Set<String>> tpoMap;
    private Map<String, Set<String>> uboMap;
    private Map<String, Set<String>> tpaMap;
    private Map<String, Set<String>> tenMap;
    private Map<String, Set<String>> conMap;

    @Autowired
    private ResourceLoader resourceLoader;

    @PostConstruct
    private void loadResources() throws IOException {
        TypeReference<Map<String, Set<String>>> mapType = new TypeReference<>() {
        };
        final ObjectMapper mapper = JsonUtils.getStandardJacksonObjectMapper();

        // Load TPO
        log.info("Loading Notice Cleaner TPO");
        Resource r = resourceLoader.getResource(
                "classpath:notice-cleaner/notice-cleaner-TPO.json");
        tpoMap = mapper.readValue(r.getInputStream(), mapType);

        // Load UBO
        log.info("Loading Notice Cleaner UBO");
        r = resourceLoader.getResource(
                "classpath:notice-cleaner/notice-cleaner-UBO.json");
        uboMap = mapper.readValue(r.getInputStream(), mapType);

        // Load TPA
        log.info("Loading Notice Cleaner TPA");
        r = resourceLoader.getResource(
                "classpath:notice-cleaner/notice-cleaner-TPA.json");
        tpaMap = mapper.readValue(r.getInputStream(), mapType);

        // Load TEN
        log.info("Loading Notice Cleaner TEN");
        r = resourceLoader.getResource(
                "classpath:notice-cleaner/notice-cleaner-TEN.json");
        tenMap = mapper.readValue(r.getInputStream(), mapType);

        // Load CON
        log.info("Loading Notice Cleaner CON");
        r = resourceLoader.getResource(
                "classpath:notice-cleaner/notice-cleaner-CON.json");
        conMap = mapper.readValue(r.getInputStream(), mapType);
    }

    /**
     * Metodo che esegue la pulizia del modello visuale (es. rimuove occorrenze id scheme non utilizzate)
     *
     * @param noticeJson Json del modello visuale
     * @return La root del modello visuale come ObjectNode
     * @throws Exception Eccezione in caso di errore di parsing Jackson
     */
    public JsonNode cleanNotice(final String noticeJson) throws Exception {

        log.info("Execution start {}::cleanNotice", NoticeCleaner.class.getSimpleName());

        try {
            final ObjectMapper mapper = JsonUtils.getStandardJacksonObjectMapper();
            ObjectNode visualRoot = (ObjectNode) mapper.readTree(noticeJson);

            String noticeSubType = visualRoot.get("noticeSubType").asText();

            visualRoot = findAndCleanTPO(visualRoot, noticeSubType);
            visualRoot = findAndCleanUBO(visualRoot, noticeSubType);
            visualRoot = findAndCleanTPA(visualRoot, noticeSubType);
            visualRoot = findAndCleanTEN(visualRoot, noticeSubType);
            visualRoot = findAndCleanCON(visualRoot, noticeSubType);

            log.debug("visualRoot {}", visualRoot);

            return visualRoot;

        } catch (Exception e) {
            log.error("Errore", e);
            throw e;
        }
    }

    /**
     * Metodo che esegue la pulizia delle occorrenze dei touch points
     *
     * @param visualRoot Modello visuale ObjectNode
     * @return ObjectNode aggiornato
     */
    private ObjectNode findAndCleanTPO(final ObjectNode visualRoot, final String noticeSubType) {
        // Check TPOs
        String targetFieldContentId = "OPT-201-Organization-TouchPoint";
        String targetGroupContentId = "GR-Touch-Point";

        log.info("Execution start {}::findAndCleanTPO for group [ {} ] and field [ {} ]", NoticeCleaner.class.getSimpleName(), targetGroupContentId, targetFieldContentId);

        ObjectNode noticeData = (ObjectNode) visualRoot.get("children").get(1);

        // Step 1: Count occurrences of all "value" attributes
        final Map<String, Integer> valueOccurrencies = new HashMap<>();
        countValueOccurrences(noticeData, valueOccurrencies);

        Set<String> fieldsToCheck = this.tpoMap.getOrDefault(noticeSubType, null);
        if (fieldsToCheck != null) {
            findAndRemoveGroupsWithoutOccurrencies(noticeData, targetGroupContentId, targetFieldContentId, valueOccurrencies, fieldsToCheck);
            ((ArrayNode) visualRoot.get("children")).remove(1);
            ((ArrayNode) visualRoot.get("children")).add(noticeData);
        }

        return visualRoot;
    }

    /**
     * Metodo che esegue la pulizia delle occorrenze dei beneficiari
     *
     * @param visualRoot Modello visuale ObjectNode
     * @return ObjectNode aggiornato
     */
    private ObjectNode findAndCleanUBO(final ObjectNode visualRoot, final String noticeSubType) {
        // Check UBOs
        String targetFieldContentId = "OPT-202-UBO";
        String targetGroupContentId = "GR-UBO";

        log.info("Execution start {}::findAndCleanUBO for group [ {} ] and field [ {} ]", NoticeCleaner.class.getSimpleName(), targetGroupContentId, targetFieldContentId);

        ObjectNode noticeData = (ObjectNode) visualRoot.get("children").get(1);

        // Step 1: Count occurrences of all "value" attributes
        final Map<String, Integer> valueOccurrencies = new HashMap<>();
        countValueOccurrences(noticeData, valueOccurrencies);

        Set<String> fieldsToCheck = this.uboMap.getOrDefault(noticeSubType, null);
        if (fieldsToCheck != null) {
            findAndRemoveGroupsWithoutOccurrencies(noticeData, targetGroupContentId, targetFieldContentId, valueOccurrencies, fieldsToCheck);
            ((ArrayNode) visualRoot.get("children")).remove(1);
            ((ArrayNode) visualRoot.get("children")).add(noticeData);
        }

        return visualRoot;
    }

    /**
     * Metodo che esegue la pulizia delle occorrenze dei TPA
     *
     * @param visualRoot Modello visuale ObjectNode
     * @return ObjectNode aggiornato
     */
    private ObjectNode findAndCleanTPA(final ObjectNode visualRoot, final String noticeSubType) {
        // Check UBOs
        String targetFieldContentId = "OPT-210-Tenderer";
        String targetGroupContentId = "GR-TenderingParty";

        log.info("Execution start {}::findAndCleanTPA for group [ {} ] and field [ {} ]", NoticeCleaner.class.getSimpleName(), targetGroupContentId, targetFieldContentId);

        ObjectNode noticeData = (ObjectNode) visualRoot.get("children").get(1);

        // Step 1: Count occurrences of all "value" attributes
        final Map<String, Integer> valueOccurrencies = new HashMap<>();
        countValueOccurrences(noticeData, valueOccurrencies);

        Set<String> fieldsToCheck = this.tpaMap.getOrDefault(noticeSubType, null);
        if (fieldsToCheck != null) {
            findAndRemoveGroupsWithoutOccurrencies(noticeData, targetGroupContentId, targetFieldContentId, valueOccurrencies, fieldsToCheck);
            ((ArrayNode) visualRoot.get("children")).remove(1);
            ((ArrayNode) visualRoot.get("children")).add(noticeData);
        }

        return visualRoot;
    }

    /**
     * Metodo che esegue la pulizia delle occorrenze dei TEN
     *
     * @param visualRoot Modello visuale ObjectNode
     * @return ObjectNode aggiornato
     */
    private ObjectNode findAndCleanTEN(final ObjectNode visualRoot, final String noticeSubType) {
        // Check UBOs
        String targetFieldContentId = "OPT-321-Tender";
        String targetGroupContentId = "GR-LotTender";

        log.info("Execution start {}::findAndCleanTEN for group [ {} ] and field [ {} ]", NoticeCleaner.class.getSimpleName(), targetGroupContentId, targetFieldContentId);

        ObjectNode noticeData = (ObjectNode) visualRoot.get("children").get(1);

        // Step 1: Count occurrences of all "value" attributes
        final Map<String, Integer> valueOccurrencies = new HashMap<>();
        countValueOccurrences(noticeData, valueOccurrencies);

        Set<String> fieldsToCheck = this.tenMap.getOrDefault(noticeSubType, null);
        if (fieldsToCheck != null) {
            findAndRemoveGroupsWithoutOccurrencies(noticeData, targetGroupContentId, targetFieldContentId, valueOccurrencies, fieldsToCheck);
            ((ArrayNode) visualRoot.get("children")).remove(1);
            ((ArrayNode) visualRoot.get("children")).add(noticeData);
        }

        return visualRoot;
    }

    /**
     * Metodo che esegue la pulizia delle occorrenze dei CON
     *
     * @param visualRoot Modello visuale ObjectNode
     * @return ObjectNode aggiornato
     */
    private ObjectNode findAndCleanCON(final ObjectNode visualRoot, final String noticeSubType) {
        // Check UBOs
        String targetFieldContentId = "OPT-316-Contract";
        String targetGroupContentId = "GR-SettledContract";

        log.info("Execution start {}::findAndCleanCON for group [ {} ] and field [ {} ]", NoticeCleaner.class.getSimpleName(), targetGroupContentId, targetFieldContentId);

        ObjectNode noticeData = (ObjectNode) visualRoot.get("children").get(1);

        // Step 1: Count occurrences of all "value" attributes
        final Map<String, Integer> valueOccurrencies = new HashMap<>();
        countValueOccurrences(noticeData, valueOccurrencies);

        Set<String> fieldsToCheck = this.conMap.getOrDefault(noticeSubType, null);
        if (fieldsToCheck != null) {
            findAndRemoveGroupsWithoutOccurrencies(noticeData, targetGroupContentId, targetFieldContentId, valueOccurrencies, fieldsToCheck);
            ((ArrayNode) visualRoot.get("children")).remove(1);
            ((ArrayNode) visualRoot.get("children")).add(noticeData);
        }

        return visualRoot;
    }

    /**
     * Metodo che indicizza tutti gli attributi "value" in una mappa e ne conteggia le occorrenze
     *
     * @param node             Nodo da navigare
     * @param valueOccurrences Mappa delle occorrenze
     */
    private void countValueOccurrences(final JsonNode node, final Map<String, Integer> valueOccurrences) {
        if (node.has("value")) {
            String value = node.get("value").asText();
            valueOccurrences.put(value, valueOccurrences.getOrDefault(value, 0) + 1);
        }

        if (node.has("children") && node.get("children").isArray()) {
            for (JsonNode child : node.get("children")) {
                countValueOccurrences(child, valueOccurrences);
            }
        }
    }

    /**
     * Metodo che cerca le occorrenze di un campo (es TPO-XXXX) e, se non trova utilizzi, rimuove il gruppo/nodo genitore
     * dalle organizzazioni
     *
     * @param node                 Nodo da analizzare
     * @param targetGroupContentId Id del gruppo da trovare
     * @param targetFieldContentId Id del campo da trovare
     * @param valueOccurrencies    Mappa delle occorrenze
     * @param fieldsToCheck        Eventuale insieme di campi da controllare per definire un gruppo "da eliminare"
     */
    private void findAndRemoveGroupsWithoutOccurrencies(ObjectNode node, final String targetGroupContentId, final String targetFieldContentId, final Map<String, Integer> valueOccurrencies, final Set<String> fieldsToCheck) {
        if (node.has("children") && node.get("children").isArray()) {
            List<Integer> idxsToRemove = new ArrayList<>();
            // Ciclo i figli, se tra di essi e' presente il nodo interessato (es. il gruppo contenente i touch points)
            // allora cerco il nodo figlio (foglia) che corrisponde all'id del campo contenente il valore da verificare
            // (es. TPO-0001)
            for (int i = 0; i < ((ArrayNode) node.get("children")).size(); i++) {
                JsonNode group = ((ArrayNode) node.get("children")).get(i);
                if (getNodeContentIdEquals(group, targetGroupContentId)) {
                    log.debug("Found group {}", group);
                    // Controllo il figlio con contentid = targetFieldContentId e recupero il valore
                    if (group.has("children") && group.get("children").isArray()) {
                        boolean fieldFound = false;
                        for (JsonNode child2 : (ArrayNode) group.get("children")) {
                            if (getNodeContentIdEquals(child2, targetFieldContentId)) {
                                log.debug("Found group 2 {}", child2);
                                fieldFound = true;
                                // Trovato, recupero il valore
                                String value = JsonUtils.getTextStrict(child2, "value");
                                if (value != null && valueOccurrencies.getOrDefault(value, 0) == 1 && isAllFieldsEmpty(group, fieldsToCheck)) {
                                    log.debug("Found value [ {} ] with count [ {} ] at index [ {} ]", value, valueOccurrencies.get(value), i);
                                    idxsToRemove.add(i);
                                    break;
                                }
                            }
                        }
                        if (!fieldFound) {
                            // Se non trovo il figlio al primo livello, cerco nel secondo
                            for (JsonNode child2 : (ArrayNode) group.get("children")) {
                                if (child2.has("children") && child2.get("children").isArray()) {
                                    for (JsonNode child3 : (ArrayNode) child2.get("children")) {
                                        if (getNodeContentIdEquals(child3, targetFieldContentId)) {
                                            log.debug("Found group 3 {}", child3);
                                            // Trovato, recupero il valore
                                            String value = JsonUtils.getTextStrict(child3, "value");
                                            if (value != null && valueOccurrencies.getOrDefault(value, 0) == 1 && isAllFieldsEmpty(group, fieldsToCheck)) {
                                                log.debug("Found value [ {} ] with count [ {} ] at index [ {} ]", value, valueOccurrencies.get(value), i);
                                                idxsToRemove.add(i);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                findAndRemoveGroupsWithoutOccurrencies((ObjectNode) group, targetGroupContentId, targetFieldContentId, valueOccurrencies, fieldsToCheck);
            }

            if (!idxsToRemove.isEmpty()) {
                // Ordine inverso per poter rimuovere correttamente i nodi dal json
                for (int j = idxsToRemove.size() - 1; j >= 0; j--) {
                    Integer idxToRemove = idxsToRemove.get(j);
                    log.debug("Removing node at index [ {} ]", idxToRemove);
                    ((ArrayNode) node.get("children")).remove(idxToRemove);
                }
            }
        }
    }


    /**
     * Utilita' per verificare l'uguaglianza dell'id
     *
     * @param node            Nodo da verificare
     * @param targetContentId Id da verificare
     * @return Ritorna true se l'attributo "contentId" e' uguale a targetContentId
     */
    private boolean getNodeContentIdEquals(final JsonNode node, final String targetContentId) {
        return JsonUtils.getTextStrict(node, "contentId").equals(targetContentId);
    }

    /**
     * Metodo che cerca nel nodo attuale tutte le occorrenze di campi prensenti nell'array fieldsToCheck
     * e memorizza un booleano in una lista interna per il valore di ogni campo.
     * Se tutti i valori dei campi sono nulli o vuoti allora considero l'intero nodo "non utilizzato" in modo da
     * rimuoverlo successivamente.
     *
     * @param group         Il nodo su cui operare
     * @param fieldsToCheck Lista degli id dei campi da verificare. Gli id possono assumere uno dei seguenti due formati
     *                      "fieldid" oppure "groupid.fieldid"
     * @return Se tutti i campi indicati sono vuoti
     */
    private boolean isAllFieldsEmpty(final JsonNode group, final Set<String> fieldsToCheck) {
        Assert.notNull(group, "group empty");
        Assert.notEmpty(fieldsToCheck, "fieldsToCheck empty");

        if (!group.has("children") || !group.get("children").isArray()) {
            String msg = "Il gruppo non e' un gruppo, non contiene la proprieta' children";
            log.error(msg);
            throw new IllegalArgumentException(msg);
        }

        final Map<String, Set<String>> nestedFieldsToCheck = new HashMap<>();

        fieldsToCheck.forEach(f -> {
            if (f.contains(".")) {
                val idx = f.lastIndexOf(".");
                val groupKeys = f.substring(0, idx);
                val fieldKey = f.substring(idx + 1);

                // Verifico se il campo e' dentro un gruppo nested
                val nestedGroup = groupKeys.contains(".");
                if (nestedGroup) {
                    val groupIdx = groupKeys.lastIndexOf(".");
                    val firstGroup = groupKeys.substring(0, groupIdx);
                    val otherGroups = groupKeys.substring(groupIdx + 1);

                    val newKey = otherGroups + "." + fieldKey;

                    Set<String> newFieldsToCheck = nestedFieldsToCheck.getOrDefault(firstGroup, new HashSet<>());
                    newFieldsToCheck.add(newKey);
                    nestedFieldsToCheck.put(firstGroup, newFieldsToCheck);
                }
            }
        });

        ArrayNode children = (ArrayNode) group.get("children");
        final HashMap<String, Boolean> filledFields = new HashMap<>();

        children.forEach(child -> {
            fieldsToCheck.forEach(f -> {
                if (f.contains(".")) {
                    // e' un gruppo, devo trovarlo e cercare nei suoi figli
                    val idx = f.lastIndexOf(".");
                    val groupKeys = f.substring(0, idx);
                    val fieldKey = f.substring(idx + 1);

                    // Verifico se il campo e' dentro un gruppo nested
                    val nestedGroup = groupKeys.contains(".");

                    if (nestedGroup) {
                        val firstGroup = groupKeys.substring(0, groupKeys.indexOf("."));
                        if (nestedFieldsToCheck.containsKey(firstGroup) && getNodeContentIdEquals(child, firstGroup)) {
                            filledFields.putAll(isAllNestedFieldsEmpty(child, nestedFieldsToCheck.get(firstGroup), filledFields));
                        }
                    } else {
                        if (getNodeContentIdEquals(child, groupKeys)) {
                            JsonNode childField = findNodeByContentId((ArrayNode) child.get("children"), fieldKey);
                            val id = childField.get("contentId").asText();
                            val valueEmpty = isValueEmpty(childField);
                            addEmptyFieldToMap(filledFields, id, valueEmpty);
                        }
                    }
                } else {
                    // e' un campo, cerco nei figli diretti di "group"
                    if (getNodeContentIdEquals(child, f)) {
                        val id = child.get("contentId").asText();
                        val valueEmpty = isValueEmpty(child);
                        addEmptyFieldToMap(filledFields, id, valueEmpty);
                    }
                }
            });
        });


        if (fieldsToCheck.size() != filledFields.size()) {
            log.error("Non sono stati trovati tutti i campi, pertanto non sono tutti vuoti");
            return false;
        }

        List<Boolean> valuesList = new ArrayList<>(filledFields.values());

        return !valuesList.contains(false);
    }

    private Map<String, Boolean> isAllNestedFieldsEmpty(final JsonNode group, final Set<String> fieldsToCheck, final Map<String, Boolean> filledFields) {
        Assert.notNull(group, "group empty");
        Assert.notEmpty(fieldsToCheck, "fieldsToCheck empty");

        if (!group.has("children") || !group.get("children").isArray()) {
            String msg = "Il gruppo non e' un gruppo, non contiene la proprieta' children";
            log.error(msg);
            throw new IllegalArgumentException(msg);
        }

        final Map<String, Set<String>> nestedFieldsToCheck = new HashMap<>();

        fieldsToCheck.forEach(f -> {
            if (f.contains(".")) {
                val idx = f.lastIndexOf(".");
                val groupKeys = f.substring(0, idx);
                val fieldKey = f.substring(idx + 1);

                // Verifico se il campo e' dentro un gruppo nested
                val nestedGroup = groupKeys.contains(".");
                if (nestedGroup) {
                    val groupIdx = groupKeys.lastIndexOf(".");
                    val firstGroup = groupKeys.substring(0, groupIdx);
                    val otherGroups = groupKeys.substring(groupIdx + 1);

                    val newKey = otherGroups + "." + fieldKey;

                    Set<String> newFieldsToCheck = nestedFieldsToCheck.getOrDefault(firstGroup, new HashSet<>());
                    newFieldsToCheck.add(newKey);
                    nestedFieldsToCheck.put(firstGroup, newFieldsToCheck);
                }
            }
        });

        ArrayNode children = (ArrayNode) group.get("children");

        children.forEach(child -> {
            fieldsToCheck.forEach(f -> {
                if (f.contains(".")) {
                    // e' un gruppo, devo trovarlo e cercare nei suoi figli
                    val idx = f.lastIndexOf(".");
                    val groupKeys = f.substring(0, idx);
                    val fieldKey = f.substring(idx + 1);

                    // Verifico se il campo e' dentro un gruppo nested
                    val nestedGroup = groupKeys.contains(".");

                    if (nestedGroup) {
                        val firstGroup = groupKeys.substring(0, groupKeys.indexOf("."));
                        if (nestedFieldsToCheck.containsKey(firstGroup) && getNodeContentIdEquals(child, firstGroup)) {
                            filledFields.putAll(isAllNestedFieldsEmpty(child, nestedFieldsToCheck.get(firstGroup), filledFields));
                        }
                    } else {
                        if (getNodeContentIdEquals(child, groupKeys)) {
                            JsonNode childField = findNodeByContentId((ArrayNode) child.get("children"), fieldKey);
                            val id = childField.get("contentId").asText();
                            val valueEmpty = isValueEmpty(childField);
                            addEmptyFieldToMap(filledFields, id, valueEmpty);
                        }
                    }
                } else {
                    // e' un campo, cerco nei figli diretti di "group"
                    if (getNodeContentIdEquals(child, f)) {
                        val id = child.get("contentId").asText();
                        val valueEmpty = isValueEmpty(child);
                        addEmptyFieldToMap(filledFields, id, valueEmpty);
                    }
                }
            });
        });
        return filledFields;
    }

    /**
     * Metodo che aggiunge alla mappa dei campi inseriti o vuoti il campo/valore vuoto nei seguenti casi
     * Il campo non e' vuoto
     * Il campo e' vuoto e la mappa non contiene il campo oppure il campo contenuto e' vuoto
     * Questo per evitare di andare a sovrascrivere il campo con uno vuoto se in uno dei gruppi ripetibili esso e' valorizzato
     *
     * @param fields     Mappa dei campi
     * @param id         Id del campo
     * @param valueEmpty Se il campo e' vuoto o meno
     */
    private void addEmptyFieldToMap(Map<String, Boolean> fields, final String id, final Boolean valueEmpty) {
        Assert.notNull(fields, "fields null");
        if (
                !valueEmpty || !fields.containsKey(id) || fields.get(id)
        ) {
            // Controllo se il valore nella mappa e' gia' falso per non andarci sopra
            fields.put(id, valueEmpty);
        }
    }

    /**
     * Metodo che verifica se l'attributo value di un field e' vuoto/null
     *
     * @param field Il campo da verificare
     * @return Se l'attributo value di un field e' vuoto/null
     */
    private boolean isValueEmpty(final JsonNode field) {
        Assert.notNull(field, "field null");

        if (!field.has("value") || field.get("value").isNull())
            return true;

        return StringUtils.isBlank(field.get("value").asText());
    }

    /**
     * Metodo che da un ArrayNode trova un JsonNode (contenuto nell'ArrayNode) per l'attributo contentId
     *
     * @param arrayNode ArrayNode
     * @param contentId ContentId
     * @return Il nodo se trovato, altrimenti null
     */
    private JsonNode findNodeByContentId(ArrayNode arrayNode, String contentId) {
        for (JsonNode node : arrayNode) {
            if (getNodeContentIdEquals(node, contentId)) {
                return node;
            }
        }
        return null;
    }
}
