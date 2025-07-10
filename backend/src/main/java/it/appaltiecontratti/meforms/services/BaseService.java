package it.appaltiecontratti.meforms.services;

import eu.europa.ted.eforms.sdk.SdkVersion;
import it.appaltiecontratti.meforms.util.NoticeCleaner;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 22, 2024
 */
public abstract class BaseService {

    @Value("${application.eforms.sdk.path}")
    private String eformsSdkDirString;
    @Value("${application.eforms.sdk.versions}")
    protected List<String> supportedSdks;
    @Value("${application.eforms.supportedLanguages}")
    protected List<String> supportedLanguages;

    @Value("${application.enableProxy:false}")
    private boolean enableProxy;
    @Value("${http_proxy:}")
    private String httpProxy;
    @Value("${https_proxy:}")
    private String httpsProxy;
    @Value("${no_proxy:}")
    private String noProxy;

    @Autowired
    protected NoticeCleaner noticeCleaner;

    protected Path eformsSdkDir;
    protected List<SdkVersion> supportedSdksObj;

    @PostConstruct
    private void loadResources() {
        this.eformsSdkDir = Path.of(this.eformsSdkDirString);
        this.supportedSdksObj = this.supportedSdks.stream().map(SdkVersion::new).collect(Collectors.toList());
    }
}
