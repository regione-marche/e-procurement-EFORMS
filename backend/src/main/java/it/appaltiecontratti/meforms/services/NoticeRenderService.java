package it.appaltiecontratti.meforms.services;

import org.springframework.core.io.buffer.DataBuffer;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.util.Optional;

public interface NoticeRenderService {

    Flux<DataBuffer> renderNoticeXml(final String noticeXml, final Optional<String> language) throws IOException;
}
