package sistema.ejercito.mil.pe.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sistema.ejercito.mil.pe.model.table.ServidorDesi;

import java.time.LocalDateTime;

/**
 * Datos de servidor para la tabla de administración (incluye conteo de sistemas por ID_SERVIDOR).
 */
@Getter
@Setter
@NoArgsConstructor
public class ServidorDesiTablaDTO {

    private String id;
    private String tipo;
    private String nombre;
    private String ip;
    private String tipoSsoo;
    private String ssoo;
    private String servApp;
    private String res;
    private String descripcion;
    private String urlConsole;
    private Boolean tienePasswordServ;
    private Boolean tienePasswordConsole;
    private Boolean tieneUsuarioServ;
    private String acceso;
    private Boolean changePassword;
    private long cantidadSistemas;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaActualizacion;

    public static ServidorDesiTablaDTO desde(ServidorDesi servidor) {
        ServidorDesiTablaDTO dto = new ServidorDesiTablaDTO();
        dto.setId(servidor.getId());
        dto.setTipo(servidor.getTipo());
        dto.setNombre(servidor.getNombre());
        dto.setIp(servidor.getIp());
        dto.setTipoSsoo(servidor.getTipoSsoo());
        dto.setSsoo(servidor.getSsoo());
        dto.setServApp(servidor.getServApp());
        dto.setRes(servidor.getRes());
        dto.setDescripcion(servidor.getDescripcion());
        dto.setUrlConsole(servidor.getUrlConsole());
        dto.setTienePasswordServ(servidor.getTienePasswordServ());
        dto.setTienePasswordConsole(servidor.getTienePasswordConsole());
        dto.setTieneUsuarioServ(servidor.getTieneUsuarioServ());
        dto.setAcceso(servidor.getAcceso());
        dto.setChangePassword(servidor.getChangePassword() != null ? servidor.getChangePassword() : Boolean.FALSE);
        dto.setFechaActualizacion(servidor.getFechaActualizacion());
        dto.setCantidadSistemas(servidor.getCantidadSistemas() != null ? servidor.getCantidadSistemas() : 0L);
        return dto;
    }
}
