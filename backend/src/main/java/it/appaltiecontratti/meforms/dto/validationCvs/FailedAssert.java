package it.appaltiecontratti.meforms.dto.validationCvs;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonMerge;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class FailedAssert {

    @JacksonXmlProperty(isAttribute = true)
    public String id;

    @JacksonXmlProperty(isAttribute = true)
    public String location;

    @JacksonXmlProperty(isAttribute = true)
    public String test;

    @JacksonXmlProperty(isAttribute = true)
    public String role;

    @JacksonXmlProperty(localName = "text")
    @JsonMerge()
    public String text;

    @JacksonXmlProperty(localName = "diagnostic-reference")
    @JsonMerge()
    public DiagnosticReference diagnosticReference;

}