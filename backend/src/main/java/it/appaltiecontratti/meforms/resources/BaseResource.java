package it.appaltiecontratti.meforms.resources;

import eu.europa.ted.eforms.sdk.SdkVersion;
import it.appaltiecontratti.meforms.services.SdkService;
import it.appaltiecontratti.meforms.services.XmlWriteService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
public abstract class BaseResource {

    @Value("${application.eforms.sdk.path}")
    protected String eformsSdkDirString;

    @Value("${application.eforms.sdk.versions}")
    protected List<String> supportedSdks;

    protected Path eformsSdkDir;
    protected List<SdkVersion> supportedSdksObj;

    @Autowired
    protected SdkService sdkService;

    @Autowired
    protected XmlWriteService xmlService;

    @PostConstruct
    private void loadResources() {
        this.eformsSdkDir = Path.of(this.eformsSdkDirString);
        this.supportedSdksObj = this.supportedSdks.stream().map(SdkVersion::new).collect(Collectors.toList());
    }
}
