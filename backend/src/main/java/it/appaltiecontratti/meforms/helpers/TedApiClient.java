package it.appaltiecontratti.meforms.helpers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import it.appaltiecontratti.meforms.dto.ProxyConfigDTO;
import it.appaltiecontratti.meforms.exceptions.TedFailedException;
import it.appaltiecontratti.meforms.helpers.validation.CsvValidationMode;
import it.appaltiecontratti.meforms.util.JsonUtils;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.netty.transport.ProxyProvider;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
@Slf4j
@Component
public class TedApiClient {

    private static final Charset CHARSET = StandardCharsets.UTF_8;

    private static final String CVS_API_V1_VALIDATION = "v1/notices/validation";
    private static final String RENDER_API_V2_RENDERING = "api/v2/notices/render";
    private static final String TED_API_HTTP_HEADER_API_KEY = "X-API-Key";
    private static final String HTTP_PREFIX = "http://";
    private static final String HTTPS_PREFIX = "https://";
    private static final String COLON = ":";

    private final TedConfig tedConfig;
    private final ObjectMapper objectMapper;
    private final ProxyConfigDTO proxyConfig;

    /**
     * @param tedConfig   Config of TED services
     * @param proxyConfig The proxy configuration to be used for the HTTP client
     */
    public TedApiClient(final TedConfig tedConfig, final ProxyConfigDTO proxyConfig) {
        this.tedConfig = tedConfig;
        this.objectMapper = JsonUtils.getStandardJacksonObjectMapper();
        this.proxyConfig = proxyConfig;
    }

    /**
     * Uses the RENDER API to render the notice, returns the response body.
     *
     * @param noticeXml The notice XML text
     * @param language  Language to generate the SVRL report, for example "en" for English
     * @return The response body, XML as PDF in this case
     */
    public Flux<DataBuffer> renderNoticeXml(final String noticeXml, final Optional<String> language) throws IOException {
        if (noticeXml == null || noticeXml.isEmpty()) {
            throw new RuntimeException("Expecting notice xml but it is blank.");
        }
        final String noticeInBase64 = toBase64(noticeXml);

        final UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(this.tedConfig.getRender().getUrl()).path(RENDER_API_V2_RENDERING);

        String postUrl = builder.build(false).toUriString();

        final MediaType requestContentType = MediaType.APPLICATION_JSON; // Known to be JSON.
        final MediaType responseContentType = MediaType.APPLICATION_PDF; // "application/pdf"

        final ObjectNode jsonPayload = this.objectMapper.createObjectNode();
        {
            jsonPayload.put("file", noticeInBase64);
            putIfPresent(jsonPayload, "language", language);
            jsonPayload.put("format", "PDF");
            jsonPayload.put("summary", false);
        }

        return httpPostToFluxResponse(postUrl, requestContentType, responseContentType, jsonPayload, language);
    }

    /**
     * Uses the CVS API to validate the notice, returns the response body.
     *
     * @param noticeXml         The notice XML text
     * @param svrlLangA2        Language to generate the SVRL report, for example "en" for English
     * @param eformsSdkVersion  Specify the eForms SDK version to use for validating the XML document
     *                          encoded in base64, if not specified the version contained in the XML will be used
     * @param sdkValidationMode Specify the validation mode that will be applied, selecting the
     *                          corresponding sub-group of the eForms SDK version ("static" or "dynamic")
     * @return The response body, SVRL XML as text in this case
     */
    public Mono<String> validateNoticeXml(final String noticeXml, final Optional<String> svrlLangA2,
                                          final Optional<String> eformsSdkVersion, final Optional<CsvValidationMode> sdkValidationMode)
            throws IOException {
        if (noticeXml == null || noticeXml.isEmpty()) {
            throw new RuntimeException("Expecting notice xml but it is blank.");
        }
        final String noticeInBase64 = toBase64(noticeXml);

        final UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(this.tedConfig.getCvs().getUrl()).path(CVS_API_V1_VALIDATION);

        String postUrl = builder.build(false).toUriString();

        final MediaType requestContentType = MediaType.APPLICATION_JSON; // Known to be JSON.
        final MediaType responseContentType = MediaType.ALL; // "application/xml"; (if valid it is xml, otherwise?)

        final ObjectNode jsonPayload = this.objectMapper.createObjectNode();
        {
            jsonPayload.put("notice", noticeInBase64);
            putIfPresent(jsonPayload, "language", svrlLangA2);

            final Optional<String> validationModeOpt =
                    sdkValidationMode.map(CsvValidationMode::getText);
            putIfPresent(jsonPayload, "validationMode", validationModeOpt);

            putIfPresent(jsonPayload, "eFormsSdkVersion", eformsSdkVersion);
        }

        return httpPostToParameterizedMonoResponse(postUrl, requestContentType, responseContentType, jsonPayload, svrlLangA2, String.class);
    }

    private static void putIfPresent(final ObjectNode jsonPayload, final String key,
                                     final Optional<String> eformsSdkVersion) {
        eformsSdkVersion.ifPresent(s -> jsonPayload.put(key, s));
    }

    /**
     * Common WebClient preparation with proxy, headers and body.
     *
     * @return the response spec used to retrieve the response body
     */
    private WebClient.ResponseSpec commonHttpPost(final String postUrl, final MediaType requestContentType,
                                                  final MediaType responseContentType, final ObjectNode jsonPayload,
                                                  final Optional<String> svrlLangA2) {
        WebClient.Builder webClientBuilder = WebClient.builder();

        // Attachment size in byte
        val attachmentSize = tedConfig.getAttachmentSizeMB() * 1024 * 1024;

        // Verifica se la configurazione del proxy è fornita e abilitata
        if (proxyConfig != null && proxyConfig.isEnableProxy()) {

            // Seleziona il proxy HTTPS se disponibile, altrimenti usa il proxy HTTP
            String proxy = StringUtils.isNotBlank(proxyConfig.getHttpsProxy()) ? proxyConfig.getHttpsProxy() : proxyConfig.getHttpProxy();

            // Assicura che un proxy sia effettivamente definito
            if (StringUtils.isBlank(proxy)) {
                String msg = "Proxy non definito";
                log.error(msg);
                throw new IllegalArgumentException(msg);
            }

            // Rimuove i prefissi HTTP/HTTPS dalla stringa del proxy
            proxy = proxy.replace(HTTP_PREFIX, "").replace(HTTPS_PREFIX, "");

            // Trova l'ultima occorrenza dei due punti nella stringa del proxy (separa host da porta)
            int lastColonIndex = proxy.lastIndexOf(COLON);

            if (lastColonIndex == -1) {
                String msg = "Formato proxy non valido. Formato atteso: host:port";
                log.error(msg);
                throw new IllegalArgumentException(msg);
            }

            val proxyHost = proxy.substring(0, lastColonIndex);
            val proxyPort = Integer.parseInt(proxy.substring(lastColonIndex + 1));

            if (StringUtils.isBlank(proxyHost)) {
                throw new IllegalArgumentException("L'host del proxy non puo' essere vuoto");
            }
            // Valida che la porta del proxy sia nell'intervallo valido (1-65535)
            if (proxyPort <= 0 || proxyPort > 65535) {
                throw new IllegalArgumentException("Porta del proxy non valida: " + proxyPort);
            }

            HttpClient httpClient = HttpClient
                    .create()
                    .proxy(p -> p.type(ProxyProvider.Proxy.HTTP)
                            .address(new InetSocketAddress(proxyHost, proxyPort))
                    );

            webClientBuilder = webClientBuilder.clientConnector(new ReactorClientHttpConnector(httpClient));
        }

        val requestBuilder = webClientBuilder
                .exchangeStrategies(
                        ExchangeStrategies.builder()
                                .codecs(clientCodecConfigurer ->
                                        clientCodecConfigurer.defaultCodecs().maxInMemorySize(attachmentSize)
                                ).build())
                .build()
                .method(HttpMethod.POST).uri(postUrl);

        // Set content type
        if (requestContentType != null) {
            requestBuilder.contentType(requestContentType);
        }

        // Set accept
        if (responseContentType != null) {
            requestBuilder.accept(responseContentType);
        }

        setupHeaders(requestBuilder);

        // Set body
        requestBuilder.body(BodyInserters.fromValue(jsonPayload));

        val response = requestBuilder.retrieve();

        log.info("POST url={}", postUrl);
        log.info("Posting to CVS: wait ... (could stall if there are network issues, proxy, ...)");

        return response;
    }

    /**
     * @return The response body as flux
     */
    private Flux<DataBuffer> httpPostToFluxResponse(final String postUrl, final MediaType requestContentType,
                                                    final MediaType responseContentType, final ObjectNode jsonPayload,
                                                    final Optional<String> svrlLangA2) {

        val response = commonHttpPost(postUrl, requestContentType, responseContentType, jsonPayload, svrlLangA2);

        return response
                .onStatus(HttpStatusCode::isError, err -> {
                    log.error("Response status: {}", err.statusCode());
                    log.error("Response headers: {}", err.headers().asHttpHeaders());
                    return err.bodyToMono(String.class).flatMap(body -> Mono.error(new TedFailedException(body, err.statusCode().value())));
                })
                .bodyToFlux(DataBuffer.class);
    }

    /**
     * @return The response body as parameterized mono
     */
    private <T> Mono<T> httpPostToParameterizedMonoResponse(final String postUrl, final MediaType requestContentType,
                                                            final MediaType responseContentType, final ObjectNode jsonPayload,
                                                            final Optional<String> svrlLangA2, Class<T> bodyType) {

        val response = commonHttpPost(postUrl, requestContentType, responseContentType, jsonPayload, svrlLangA2);

        return response
                .onStatus(HttpStatusCode::isError, err -> {
                    log.error("Response status: {}", err.statusCode());
                    log.error("Response headers: {}", err.headers().asHttpHeaders());
                    return err.bodyToMono(String.class).flatMap(body -> {
                        log.error("Errore TED {}", body);
                        return Mono.error(new TedFailedException(body, err.statusCode().value()));
                    });
                })
                .bodyToMono(bodyType);
    }

    private void setupHeaders(final WebClient.RequestBodySpec requestBuilder) {
        // Security, authentication / authorization related.
        requestBuilder.header(TED_API_HTTP_HEADER_API_KEY, this.tedConfig.getApiKey()) //
                // Mime types.
                .header("Accept-Encoding", CHARSET.toString())
                // Other headers
                .header("DNT", "1")
                .header("Upgrade-Insecure-Requests", "1")
                .header("cache-control", "no-cache, no-store, max-age=0, must-revalidate");
    }

    /**
     * @return The text encoded in base 64
     */
    private static String toBase64(final String text) {
        return new String(Base64.getEncoder().encode(text.getBytes(CHARSET)), CHARSET);
    }
}
