package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CuentaDTO {
    private String cip;
    private String grado;
    private String arma;
    private String username;
    private String nombres;

}
