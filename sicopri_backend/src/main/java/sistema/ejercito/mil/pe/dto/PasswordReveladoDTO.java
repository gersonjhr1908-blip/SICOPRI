package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordReveladoDTO {

    private String password;
    private String tipo;
    /** Usuario asociado (servidor o consola según tipo). */
    private String usuario;
}
