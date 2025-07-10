package it.appaltiecontratti.meforms.dto;

import eu.europa.ted.eforms.sdk.SdkVersion;
import lombok.*;

import java.util.List;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 24, 2024
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class NoticeTypesDTO {
    private SdkVersion sdkVersion;
    private List<String> noticeTypes;
}
