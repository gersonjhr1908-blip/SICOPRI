package sistema.ejercito.mil.pe.repository;

import sistema.ejercito.mil.pe.model.table.Role;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IRoleRepo extends IGenericRepo<Role, Integer> {


    // ==========================================
    // ROLES DE UN USUARIO SEGÚN SU CIP
    // ==========================================
    @Query(value = """
            SELECT
                r.ID_ROL,
                r.NOMBRE,
                r.DESCRIPCION
            FROM USUARIOS ud
            INNER JOIN SIQRED_USER_ROLE ur
                ON ud.ID_USER = ur.ID_USER
            INNER JOIN SIQRED_ROL r
                ON ur.ID_ROLE = r.ID_ROL
            WHERE ud.CIP = :id
            ORDER BY r.ID_ROL ASC
            """, nativeQuery = true)
    List<Role> listRolesbyId(
            @Param("id") String id
    );


    // ==========================================
    // LISTAR TODOS LOS ROLES ACTIVOS
    // ==========================================
    @Query(value = """
            SELECT
                ID_ROL,
                NOMBRE,
                DESCRIPCION
            FROM SIQRED_ROL
            WHERE ACTIVO = 'S'
            ORDER BY ID_ROL ASC
            """, nativeQuery = true)
    List<Role> listRoles();


    // ==========================================
    // ÚLTIMO ID DE ROL
    // ==========================================
    @Query(value = """
            SELECT NVL(MAX(ID_ROL), 0)
            FROM SIQRED_ROL
            """, nativeQuery = true)
    Integer findMaxRoleId();


    // ==========================================
    // CONTAR USUARIOS POR ROL
    // ==========================================
    @Query(value = """
            SELECT COUNT(*)
            FROM SIQRED_USER_ROLE
            WHERE ID_ROLE = :roleId
            """, nativeQuery = true)
    Long countUsersByRoleId(
            @Param("roleId") Integer roleId
    );


    // ==========================================
    // ELIMINAR RELACIONES USUARIO - ROL
    // ==========================================
    @Modifying
    @Query(value = """
            DELETE FROM SIQRED_USER_ROLE
            WHERE ID_ROLE = :roleId
            """, nativeQuery = true)
    void deleteUserRolesByRoleId(
            @Param("roleId") Integer roleId
    );


    // ==========================================
    // JPA
    // ==========================================
    @Query("from Role")
    List<Role> findAllRoles();
}