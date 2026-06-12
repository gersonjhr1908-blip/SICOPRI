package sistema.ejercito.mil.pe.service;


import sistema.ejercito.mil.pe.model.table.Role;

import java.util.List;

public interface IRoleService extends ICRUDService<Role, Integer>{

    List<Role> listRolebyId(String idUser);

    List<Role> listRoles();

}
