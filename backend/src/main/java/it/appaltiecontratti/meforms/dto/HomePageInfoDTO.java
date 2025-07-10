package it.appaltiecontratti.meforms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 24, 2024
 */
@Data
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class HomePageInfoDTO {
    private final String appVersion;
    private final List<String> sdkVersions;
}
