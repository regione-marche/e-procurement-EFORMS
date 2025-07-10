package it.appaltiecontratti.meforms.util;

import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.zip.GZIPOutputStream;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since apr 02, 2025
 */
@Slf4j
public class LoggingUtils {

    public static String getZippedLoggingString(final String data) {
        try {
            byte[] gzippedJson = gzipString(data);
            return Base64.getEncoder().encodeToString(gzippedJson);
        } catch (Exception e) {
            log.error("Errore durante lo zip del tracciato");
            return data;
        }
    }

    private static byte[] gzipString(final String data) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (GZIPOutputStream gzipOutputStream = new GZIPOutputStream(byteArrayOutputStream)) {
            gzipOutputStream.write(data.getBytes(StandardCharsets.UTF_8));
        }
        return byteArrayOutputStream.toByteArray();
    }
}
