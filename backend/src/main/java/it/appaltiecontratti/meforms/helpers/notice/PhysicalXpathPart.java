package it.appaltiecontratti.meforms.helpers.notice;

import lombok.Getter;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
public record PhysicalXpathPart(
        String xpathExpr,
        String tagOrAttr
) {

    /**
     * @return An xml tag, or in rare cases an attribute
     */
    public String getTagOrAttribute() {
        return tagOrAttr;
    }

    /**
     * @return An xpath expression
     */
    public String getXpathExpr() {
        return xpathExpr;
    }
}
