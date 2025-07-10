package it.appaltiecontratti.meforms.services;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import it.appaltiecontratti.meforms.dto.CvsItemDTO;
import it.appaltiecontratti.meforms.dto.CvsOutputDTO;
import it.appaltiecontratti.meforms.dto.validationCvs.FailedAssert;
import it.appaltiecontratti.meforms.dto.validationCvs.FiredRule;
import it.appaltiecontratti.meforms.dto.validationCvs.XmlRoot;
import it.appaltiecontratti.meforms.services.impl.SdkServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static it.appaltiecontratti.meforms.common.Constants.MDC_TRACE_ID;

@Service
@Slf4j
@RequiredArgsConstructor
public class XmlParserService {

    private final SdkServiceImpl sdkService;

    /**
     * Metodo che legge un XML sotto forma di stringa e lo converte in un oggetto di response
     * @param xmlString l'XML sotto forma di stringa
     * @return l'oggetto di response
     */
    public Mono<CvsOutputDTO> parseXmlCvsValidation(final String xmlString, final String sdkVersion, final String langCode) {

        final String KO_PREFIX = "KO-";
        final String OK_PREFIX = "OK-";

        try {
            // Crea un XmlMapper
            XmlMapper xmlMapper = new XmlMapper();

            // Converte l'XML in un oggetto Java
            XmlRoot xmlRoot = xmlMapper.readValue(xmlString, XmlRoot.class);
            List<CvsItemDTO> cvsItemDTOList = new ArrayList<>();

            // Recupera tutte le failed-assert
            int index = 1;
            if (xmlRoot.getFailedAsserts() != null) {
                for (FailedAssert failedAssert : xmlRoot.getFailedAsserts()) {
                    cvsItemDTOList.add(CvsItemDTO.builder()
                            .index(KO_PREFIX + index)
                            .id(failedAssert.id)
                            .location(failedAssert.location)
                            .numeroLotto(this.createNumeroLotto(failedAssert))
                            .test(failedAssert.test)
                            .role(failedAssert.role)
                            .text(failedAssert.text)
                            .legenda(this.createLegenda(failedAssert, sdkVersion, langCode))
                            // campi per evidenziare errori CVS nella form
                            .see(this.parseSeeAttribute(failedAssert))
                            .indiciSezioni(this.retrieveSectionIndexes(failedAssert))
                            .build()
                    );
                    ++index;
                }
            }

            // Recupera tutte le fired-rule
            index = 1;
            if (xmlRoot.getFiredRules() != null) {
                for (FiredRule firedRule : xmlRoot.getFiredRules()) {
                    cvsItemDTOList.add(CvsItemDTO.builder()
                            .index(OK_PREFIX + index)
                            .location(firedRule.context)
                            .build()
                    );
                    ++index;
                }
            }

            return Mono.deferContextual(ctx -> {
                // Crea l'oggetto di response
                CvsOutputDTO cvsOutputDTO = new CvsOutputDTO();
                cvsOutputDTO.setIdTracciatura(ctx.getOrDefault(MDC_TRACE_ID, null));
                cvsOutputDTO.setItems(cvsItemDTOList);
                cvsOutputDTO.setTotalFiredRules(xmlRoot.getFiredRules().size());
                cvsOutputDTO.setTotalFailedAsserts(xmlRoot.getFailedAsserts() != null? xmlRoot.getFailedAsserts().size() : 0);

                return Mono.just(cvsOutputDTO);
            });

        }
        catch (Exception e){
            throw new RuntimeException("Errore durante il parsing dell'XML della validazione CVS");
        }
    }

    // Metodo per recupera tutti gli indici della sezione ripetibile (lotto compreso) di un errore CVS
    private List<Integer> retrieveSectionIndexes(final FailedAssert failedAssert) {
        // RegEx per estrarre tutti i numeri nella forma "[X]", dove X è un numero
        Pattern pattern = Pattern.compile("\\[(\\d+)]");
        Matcher matcher = pattern.matcher(failedAssert.getLocation());

        List<Integer> indiciSezioni  = new ArrayList<>();

        while (matcher.find()) {
            // recupera solo il numero senza le parentesi
            String number = matcher.group(1);
            indiciSezioni.add(Integer.parseInt(number) - 1);
        }

        return indiciSezioni;
    }

    // Metodo per recuperare il valore dell'attributo "see"
    private String parseSeeAttribute(final FailedAssert failedAssert) {
        if (failedAssert.getDiagnosticReference() != null){
            String seeValue = failedAssert.getDiagnosticReference().getSee();
            if (seeValue != null && seeValue.contains(":")) {
                return seeValue.split(":")[1];  // estrae il valore dopo ":"
            }
        }
        return null;
    }

    // Metodo per popolare la colonna del numero lotto per un dato errore CVS
    private Integer createNumeroLotto(final FailedAssert failedAssert) {
        // RegEx per estrarre tutti i numeri di lotto nella forma "[X]", dove X è un numero
        Pattern pattern = Pattern.compile("\\[(\\d+)]");
        Matcher matcher = pattern.matcher(failedAssert.getLocation());

        List<Integer> lotNumbers  = new ArrayList<>();

        while (matcher.find()) {
            // recupera solo il numero senza le parentesi
            String number = matcher.group(1);
            lotNumbers.add(Integer.parseInt(number) - 1);
        }

        return !lotNumbers.isEmpty() ? lotNumbers.getFirst() : null;    // se è presente solo un lotto, il match non c'è
    }

    // Metodo per popolare la colonna della legenda per un dato errore CVS
    private String createLegenda(final FailedAssert failedAssert, final String sdkVersion, final String langCode){
        StringBuilder legenda = new StringBuilder();

        Set<String> legendaAddedFields = new HashSet<>();

        // 1 - RegEx per estrarre tutti i campi/gruppi presenti nella descrizione (campo <svrl:text>)
        Pattern pattern = Pattern.compile("(BT-|OPT-|OPP-|OPA-|GR-|ND-)[^\\s'\"]+");
        Matcher matcher = pattern.matcher(failedAssert.getText());

        while (matcher.find()) {
            String key = matcher.group();
            // rimuove le parentesi più esterne se presenti
            if (key.endsWith(")")) {
                key = key.substring(0, key.length() - 1);
            }
            if (!legendaAddedFields.contains(key)) {
                addFieldToLegenda(key, legenda, sdkVersion, langCode);
                legendaAddedFields.add(key);
            }
        }

        // 2 - Cerca anche il campo/gruppo presente all'interno dell'attributo "see" di <svrl:diagnostic-reference>
        String seeValue = failedAssert.getDiagnosticReference() != null? failedAssert.getDiagnosticReference().getSee() : null;
        if (seeValue != null && seeValue.contains(":")) {
            String key = seeValue.split(":")[1];    // estrae il valore dopo ":"
            if (!legendaAddedFields.contains(key)) {
                addFieldToLegenda(key, legenda, sdkVersion, langCode);
                legendaAddedFields.add(key);
            }
        }

        return legenda.isEmpty()? "-" : legenda.toString();
    }

    // Aggiunge un campo alla legenda con la relativa descrizione
    private void addFieldToLegenda(String key, StringBuilder legenda, String sdkVersion, String langCode){
        String descriptionKey = "description|" + key;
        String hintKey = "hint|" + key;
        String nameKey = "name|" + key;

        // Recupera la mappa eliminando l'informazione su "field" o "group" per ogni entry
        Map<String, String> seeInfoMap = sdkService.getFieldsAndGroupsMap().get(sdkVersion + "|" + langCode)
                .entrySet().stream().collect(Collectors.toMap(
                        e -> {
                            String[] parts = e.getKey().split("\\|");
                            return (parts.length > 2) ? parts[1] + "|" + parts[2] : e.getKey();
                        },
                        Map.Entry::getValue
                ));

        StringBuilder legendaSingola = new StringBuilder();

        // check name key
        if (seeInfoMap.containsKey(nameKey)) {
            legendaSingola.append(key).append(" - ").append(seeInfoMap.get(nameKey)).append(".");
        }

        // check description key
        if (seeInfoMap.containsKey(descriptionKey)) {
            if (!legendaSingola.isEmpty()) {
                legendaSingola.append(" - ");
            } else {
                legendaSingola.append(key).append(" - ");
            }
            legendaSingola.append(seeInfoMap.get(descriptionKey)).append(".");
        }

        // check hint key
        if (seeInfoMap.containsKey(hintKey)) {
            if (!legendaSingola.isEmpty()) {
                legendaSingola.append(" - ");
            } else {
                legendaSingola.append(key).append(" - ");
            }
            legendaSingola.append(seeInfoMap.get(hintKey)).append(".");
        }

        if (!legendaSingola.isEmpty()) {
            legenda.append(" # ");
            legenda.append(legendaSingola);
        }
    }
}
