package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sistema.ejercito.mil.pe.model.table.SistemaDesi;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SistemasPorServidorDTO {

    private String idServidor;
    private String nombreServidor;
    private List<SistemaDesi> frontends;
    private List<SistemaDesi> backends;
    private List<SistemaDesi> monolitos;
}
