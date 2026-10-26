package sistema.ejercito.mil.pe.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CambiarPasswordServidorDTO {

    private String passwordActual;
    private String passwordNueva;
}
