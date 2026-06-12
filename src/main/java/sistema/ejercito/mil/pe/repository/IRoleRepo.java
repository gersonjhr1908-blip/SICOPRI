package sistema.ejercito.mil.pe.repository;

import sistema.ejercito.mil.pe.model.table.Role;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IRoleRepo extends IGenericRepo<Role, Integer> {

    @Query(value = """
                    SELECT r.id_role, r.name, r.description
                    FROM user_data ud
                    JOIN user_role ur ON ud.id_user = ur.id_user
                    JOIN role r ON ur.id_role = r.id_role
                    WHERE ud.cip = :id ORDER BY r.id_role ASC
                    """, nativeQuery = true)
    List<Role> listRolesbyId(@Param("id") String id);

    @Query(value = "SELECT id_role, name, description FROM chasqui_jh_roles ORDER BY id_role ASC", nativeQuery = true)
    List<Role> listRoles();

    @Query(value = "SELECT NVL(MAX(id_role), 0) FROM chasqui_jh_roles", nativeQuery = true)
    Integer findMaxRoleId();

    @Query(value = "SELECT COUNT(*) FROM chasqui_user_role_jh WHERE id_role = :roleId", nativeQuery = true)
    Long countUsersByRoleId(@Param("roleId") Integer roleId);

    @Modifying
    @Query(value = "DELETE FROM chasqui_user_role_jh WHERE id_role = :roleId", nativeQuery = true)
    void deleteUserRolesByRoleId(@Param("roleId") Integer roleId);

    @Query("from Role")
    public List<Role> findAllRoles();
}
