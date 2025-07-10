package it.appaltiecontratti.meforms.util;

import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.TimeZone;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since mar 27, 2025
 */
public class DateTimeUtils {

    /**
     * Metodo per formattare una stringa data in una data senza il time con l'offset
     * @param inputDate Data input
     * @param timezone Timezone attuale (della JVM)
     * @return Data formattata
     */
    public static String formatDate(final String inputDate, final TimeZone timezone) {

        if (StringUtils.isBlank(inputDate))
            return inputDate;

        String output = null;

        try {
            // Check ISO Date
            OffsetDateTime dateTime = OffsetDateTime.parse(inputDate);
            output = dateTime.atZoneSameInstant(timezone.toZoneId()).format(DateTimeFormatter.ISO_DATE);
        } catch (Exception ignored) {
        }

        if (StringUtils.isBlank(output)) {
            try {

                LocalDate date = parseDate(inputDate);
                DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-ddXXX")
                        .withZone(timezone.toZoneId());

                ZonedDateTime zonedDateTime = ZonedDateTime.of(date, LocalTime.MIDNIGHT, timezone.toZoneId());

                output = date.atStartOfDay().atOffset(zonedDateTime.getOffset()).format(outputFormatter);
            } catch (DateTimeParseException e) {
                if (StringUtils.isNotBlank(inputDate) && !inputDate.endsWith("Z")) {
                    output += "+00:00";
                }
            }
        }

        return output;
    }

    /**
     * Metodo per formattare una stringa time in un time senza la data con l'offset
     * @param inputTime Time input
     * @param timezone Timezone attuale (della JVM)
     * @return Time formattato
     */
    public static String formatTime(final String inputTime, final TimeZone timezone) {
        String output = null;

        try {
            // Check ISO Date
            OffsetDateTime dateTime = OffsetDateTime.parse(inputTime);
            output = dateTime.atZoneSameInstant(timezone.toZoneId()).format(DateTimeFormatter.ofPattern("HH:mm:ssXXX"));
        } catch (Exception ignored) {
        }

        if (StringUtils.isBlank(output)) {

            try {
                LocalTime time = parseTime(inputTime);
                DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("HH:mm:ssXXX")
                        .withZone(timezone.toZoneId());

                output = time.withSecond(0).atDate(LocalDate.now()).atZone(timezone.toZoneId()).format(outputFormatter);
            } catch (DateTimeParseException | NullPointerException e) {
                if (StringUtils.isNotBlank(inputTime) && !inputTime.endsWith("Z")) {
                    output += "+00:00";
                }
            }
        }
        return output;
    }

    private static LocalDate parseDate(final String inputDate) {
        try {
            // Caso senza timezone
            return LocalDate.parse(inputDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (DateTimeParseException e1) {
            // Caso con Z (zulu) finale
            try {
                return LocalDate.parse(inputDate, DateTimeFormatter.ofPattern("yyyy-MM-dd'Z'"));
            } catch (DateTimeParseException e2) {
                // Con l'offset gia' presente
                return LocalDate.parse(inputDate, DateTimeFormatter.ofPattern("yyyy-MM-ddXXX"));
            }
        }
    }

    private static LocalTime parseTime(final String inputTime) {
        LocalTime lt = parseTimeWithoutTimezone(inputTime);
        if (lt == null) {
            lt = parseTimeWithZulu(inputTime);
        }

        if (lt == null) {
            lt = parseTimeWithOffset(inputTime);
        }
        return lt;
    }

    private static LocalTime parseTimeWithoutTimezone(final String inputTime) {
        try {
            return LocalTime.parse(inputTime, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (DateTimeParseException e1) {
            try {
                return LocalTime.parse(inputTime, DateTimeFormatter.ofPattern("HH:mm:ss"));
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    private static LocalTime parseTimeWithZulu(final String inputTime) {
        try {
            return LocalTime.parse(inputTime, DateTimeFormatter.ofPattern("HH:mm'Z'"));
        } catch (DateTimeParseException e1) {
            try {
                return LocalTime.parse(inputTime, DateTimeFormatter.ofPattern("HH:mm:ss'Z'"));
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    private static LocalTime parseTimeWithOffset(final String inputTime) {
        try {
            return LocalTime.parse(inputTime, DateTimeFormatter.ofPattern("HH:mmXXX"));
        } catch (DateTimeParseException e1) {
            try {
                return LocalTime.parse(inputTime, DateTimeFormatter.ofPattern("HH:mm:ssXXX"));
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }
}
