package it.appaltiecontratti.meforms.services.impl;

import it.appaltiecontratti.meforms.helpers.TedApiClient;
import it.appaltiecontratti.meforms.helpers.TedConfig;
import it.appaltiecontratti.meforms.services.BaseService;
import it.appaltiecontratti.meforms.services.NoticeRenderService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.Validate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.util.Optional;

@Service
@Slf4j
public class NoticeRenderServiceImpl extends BaseService implements NoticeRenderService {

    @Autowired
    private TedConfig tedConfig;

    @Autowired
    private TedApiClient tedApiClient;

    @Override
    public Flux<DataBuffer> renderNoticeXml(String noticeXml, Optional<String> language) throws IOException {
        log.info("Attempting to render notice");

        // https://docs.ted.europa.eu/api/index.html
        // TED Developer Portal API KEY.
        final String tedDevApiKey = tedConfig.getApiKey();
        Validate.notBlank(tedDevApiKey, "Your TED API key is not configured, see application.yaml");

        final String renderApiRootUrl = tedConfig.getRender().getUrl();
        Validate.notBlank(renderApiRootUrl, "The RENDER URL is not configured, see application.yaml");

        //
        // Call the RENDER API.
        //
        return tedApiClient.renderNoticeXml(noticeXml, language);
    }

}
