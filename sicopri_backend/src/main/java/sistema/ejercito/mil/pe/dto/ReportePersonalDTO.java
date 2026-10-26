package sistema.ejercito.mil.pe.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import sistema.ejercito.mil.pe.model.table.ChasquiArchivo;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class ReportePersonalDTO {

    private String cip;
    private String nombres;
    private List<ChasquiArchivo> solicitudes = new ArrayList<>();
}
