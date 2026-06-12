package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonaDTO {

    private String chasqui;
    private String grado;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombres;
    private String arma;
    private String nucleo;
    private String idnucleo;
    private String brigada;
    private String idbrigada;
    private String unidad;
    private String idunidad;
    private String dni;

}
