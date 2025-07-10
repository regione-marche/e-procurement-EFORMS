package it.appaltiecontratti.meforms.sorting;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * @author Cristiano Perin <cristiano.perin@akera.it>
 * @version 1.0.0
 * @since ott 23, 2024
 */
@Data
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class OrderItem implements Comparable<OrderItem> {
    private final String fieldOrNodeId;
    private final String xmlName;
    private final Integer order;

    @Override
    public int compareTo(OrderItem o) {
        return this.order.compareTo(o.getOrder());
    }
}
