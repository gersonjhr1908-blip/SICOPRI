package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServidorPasswordReporteFilaDTO {

    private int numero;
    private String nombre;
    private String ip;
    private String usuario;
    private String password;
}
