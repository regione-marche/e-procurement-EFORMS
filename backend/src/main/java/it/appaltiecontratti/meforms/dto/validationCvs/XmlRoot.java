package it.appaltiecontratti.meforms.dto.validationCvs;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonMerge;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JacksonXmlRootElement(localName = "schematron-output", namespace = "http://purl.oclc.org/dsdl/svrl")
@JsonIgnoreProperties(ignoreUnknown = true)
public class XmlRoot {

    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "fired-rule")
    @JsonMerge()
    private List<FiredRule> firedRules;

    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "failed-assert")
    @JsonMerge()
    private List<FailedAssert> failedAsserts;
}