package sistema.ejercito.mil.pe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ActiveDirectoryPasswordRequest(
        @JsonProperty("usuario") String usuario,
        @JsonProperty("password") String password
) {
}
