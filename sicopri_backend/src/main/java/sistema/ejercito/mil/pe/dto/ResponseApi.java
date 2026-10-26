package sistema.ejercito.mil.pe.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResponseApi {

    private static final ZoneId ZONA_PERU = ZoneId.of("America/Lima");

    private String message;
    private Object data;
    private String code;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime fecha;

    private String url;

    /** Constructor usado por endpoints existentes (message, data, code). */
    public ResponseApi(String message, Object data, String code) {
        this.message = message;
        this.data = data;
        this.code = code;
        this.fecha = LocalDateTime.now(ZONA_PERU);
    }

    public static ResponseApi ok(Object data, String message) {
        ResponseApi response = new ResponseApi();
        response.setMessage(message);
        response.setData(data);
        response.setCode("200");
        response.setFecha(LocalDateTime.now(ZONA_PERU));
        return response;
    }

    public static ResponseApi ok(Object data, String message, String url) {
        ResponseApi response = ok(data, message);
        response.setUrl(url);
        return response;
    }

    public static ResponseApi error(String message, Object data, String code) {
        ResponseApi response = new ResponseApi();
        response.setMessage(message);
        response.setData(data);
        response.setCode(code);
        response.setFecha(LocalDateTime.now(ZONA_PERU));
        return response;
    }

    public static ResponseApi error(String message, String code) {
        return error(message, null, code);
    }
}
