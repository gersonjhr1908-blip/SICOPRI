package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuAssignDTO {

    private Integer idMenu;
    private String icon;
    private String name;
    private String url;
    private boolean assigned;
}
