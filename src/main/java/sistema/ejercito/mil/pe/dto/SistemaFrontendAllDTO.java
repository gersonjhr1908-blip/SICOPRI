package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SistemaFrontendAllDTO {

    private String id;
    private String acronimo;
    private String nombre;
    private String url;
    private String img;
    private String categoria;
    private String estado;
    private String version;
    private String descripcion;
    private Boolean dobleFactor;
    private String dependenciaAdmin;
}
