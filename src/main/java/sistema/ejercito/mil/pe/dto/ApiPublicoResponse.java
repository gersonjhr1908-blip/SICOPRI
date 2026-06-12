package sistema.ejercito.mil.pe.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Respuesta estándar para APIs públicas (data, mensaje, fecha y banderas ok/error).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiPublicoResponse {

    private static final ZoneId ZONA_PERU = ZoneId.of("America/Lima");

    private Object data;
    private String message;

    /** Día/mes/año y hora:minuto (zona América/Lima al obtener el instante). */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime fecha;
    private boolean ok;
    private boolean error;

    public static ApiPublicoResponse exito(Object data, String message) {
        LocalDateTime ahora = LocalDateTime.now(ZONA_PERU);
        return new ApiPublicoResponse(data, message, ahora, true, false);
    }

    public static ApiPublicoResponse fallo(Object data, String message) {
        LocalDateTime ahora = LocalDateTime.now(ZONA_PERU);
        return new ApiPublicoResponse(data, message, ahora, false, true);
    }
}
