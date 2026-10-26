package sistema.ejercito.mil.pe.service;

import sistema.ejercito.mil.pe.dto.MenuAssignDTO;
import sistema.ejercito.mil.pe.dto.RoleAdminDTO;
import sistema.ejercito.mil.pe.dto.RoleRequestDTO;
import sistema.ejercito.mil.pe.model.table.Role;

import java.util.List;

public interface IAdminRolesMenuService {

    List<RoleAdminDTO> listRolesWithStats();

    List<MenuAssignDTO> listMenusForRole(Integer roleId);

    void updateRoleMenus(Integer roleId, List<Integer> menuIds);

    Role createRole(RoleRequestDTO request);

    Role updateRole(Integer roleId, RoleRequestDTO request);

    void deleteRole(Integer roleId);
}
