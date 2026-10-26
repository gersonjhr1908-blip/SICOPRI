package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {

    private Long idUser;
    private String username;
    private String cip;
    private String dni;
    private String grado;
    private String arma;
    private String fullname;

    private Integer estado;

    // FECHAS
    private LocalDateTime fechaActivo;
    private LocalDateTime fechaRegistro;

    private Integer nivel;
    private String telefono;
    private String userSuper;

    private NucleoDto nucleo;
    private BrigadaDto brigada;
    private DependenciaDto dependencia;

    private List<RoleDTO> roles;
}