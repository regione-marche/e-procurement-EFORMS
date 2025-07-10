package it.appaltiecontratti.meforms.helpers.exclusion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExclusionItem implements Serializable {

    private String groupName;
    private List<String> fields;
}
