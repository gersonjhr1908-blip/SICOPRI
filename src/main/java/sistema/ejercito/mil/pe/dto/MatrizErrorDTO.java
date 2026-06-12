package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MatrizErrorDTO {
    private String cip;
    private String cuenta;
    private String descripcion;
    private String email;
    private String name;
    private Integer tipo;
    private String directorio;
    private String motivoError;
}

