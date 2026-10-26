package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SistemaDesiResumenDTO {

    private long frontendDesarrollo;
    private long frontendProduccion;
    private long backendDesarrollo;
    private long backendProduccion;
}
