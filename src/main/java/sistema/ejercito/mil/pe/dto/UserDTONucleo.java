package sistema.ejercito.mil.pe.dto;

import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTONucleo {

    private String nucleoselect;
    private String responsable;
   // private String fechaFin;
   // private String unidad;
    private List<SalidaDTO> salidaDTO;
}
