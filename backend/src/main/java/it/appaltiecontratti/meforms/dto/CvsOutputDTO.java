package it.appaltiecontratti.meforms.dto;

import lombok.*;

import java.io.Serializable;
import java.util.List;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since nov 27, 2024
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class CvsOutputDTO implements Serializable {

    private String idTracciatura;
    private int totalFiredRules;
    private int totalFailedAsserts;
    private List<CvsItemDTO> items;
    private String xml; // XML della notice
}
