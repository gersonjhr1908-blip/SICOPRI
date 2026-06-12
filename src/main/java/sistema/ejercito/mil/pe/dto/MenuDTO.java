package sistema.ejercito.mil.pe.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuDTO {

    private Integer idMenu;
    private String icon;
    private String name;
    private String url;
    private List<RoleDTO> roles;
}
