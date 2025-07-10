package it.appaltiecontratti.meforms.resources;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static it.appaltiecontratti.meforms.common.Constants.API_V1;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since mar 14, 2025
 */
@RestController
@RequestMapping(value = API_V1 + "navigation")
@Slf4j
public class NavigationResource extends BaseResource {

    @Value("${application.standaloneUse}")
    private Boolean standaloneUse;

    @Value("${application.forbiddenSlugs}")
    private List<String> forbiddenSlugs;


    @GetMapping(value = "/can-activate/{slugId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Boolean canActivateSlug(@PathVariable(value = "slugId") final String slugId) {
        return standaloneUse || !forbiddenSlugs.contains(slugId);
    }
}
