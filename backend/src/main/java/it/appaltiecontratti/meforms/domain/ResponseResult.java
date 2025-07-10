package it.appaltiecontratti.meforms.domain;

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
public class ResponseResult<T> {
    private boolean done;
    private List<String> messages;
    private T data;
}
