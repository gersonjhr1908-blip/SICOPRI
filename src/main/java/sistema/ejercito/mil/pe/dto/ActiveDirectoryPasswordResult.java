package sistema.ejercito.mil.pe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ActiveDirectoryPasswordResult(
        @JsonProperty("success") boolean success,
        @JsonProperty("mensajeExito") String mensajeExito,
        @JsonProperty("mensajeError") String mensajeError
) {
}
