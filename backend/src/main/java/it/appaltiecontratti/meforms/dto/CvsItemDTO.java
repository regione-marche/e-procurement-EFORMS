package it.appaltiecontratti.meforms.dto;

import lombok.*;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class CvsItemDTO implements Serializable {

    private String index;           // es.: KO-1, KO-2, OK-1, OK-2, OK-3 ...
    private String id;              // es.: BR-BT-05071-0190
    private String location;        // es.: /pin:PriorInformationNotice/cac:ProcurementProject/cac:RealizedLocation/cac:Address
    private Integer numeroLotto;    // es.: 1
    private String test;            // es.: count(cbc:CountrySubentityCode) = 0 or ...
    private String role;            // es.: ERROR
    private String text;            // es.: Mancano le informazioni di ...
    private String legenda;         // es.: Il motivo della mancata selezione di un vincitore.

    private String see;                     // es.: BT-11-Procedure-Buyer (valore dell'attributo "see")
    private List<Integer> indiciSezioni;    // es.: 1, 2 (lotto compreso)
}
