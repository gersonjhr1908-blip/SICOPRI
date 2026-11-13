package sistema.ejercito.mil.pe.repository;

import sistema.ejercito.mil.pe.model.table.Menu;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IMenuRepo extends IGenericRepo<Menu, Integer> {


    // =====================================================
    // MENÚS DEL USUARIO LOGUEADO
    // SEGÚN ROLE_ACTIVE_ID_ROLE
    // =====================================================
    @Query(value = """
        SELECT DISTINCT m.*
        FROM USUARIOS u
        INNER JOIN SIQRED_MENU_ROLE mr
            ON mr.ID_ROLE = u.ROLE_ACTIVE_ID_ROLE
        INNER JOIN SIQRED_MENU m
            ON m.ID_MENU = mr.ID_MENU
        WHERE UPPER(u.USERNAME) = UPPER(:username)
        ORDER BY
            CASE

                -- =========================
                -- INICIO
                -- =========================
                WHEN m.ID_MENU = 10 THEN 1


                -- =========================
                -- ADMINISTRADOR
                -- =========================
                WHEN m.ID_MENU = 11 THEN 2
                WHEN m.ID_MENU = 12 THEN 3
                WHEN m.ID_MENU = 13 THEN 4
                WHEN m.ID_MENU = 14 THEN 5
                WHEN m.ID_MENU = 15 THEN 6


                -- =========================
                -- REGISTRAR QRD
                -- =========================
                WHEN m.ID_MENU = 17 THEN 2


                -- =========================
                -- REGISTRAR INTEGRIDAD
                -- Roles 2, 4 y 6
                -- =========================
                WHEN m.ID_MENU = 21 THEN 2


                -- =========================
                -- DEMÁS MENÚS
                -- =========================
                WHEN m.ID_MENU = 18 THEN 3
                WHEN m.ID_MENU = 19 THEN 4
                WHEN m.ID_MENU = 20 THEN 5


                -- =========================
                -- MANUAL
                -- =========================
                WHEN m.ID_MENU = 16 THEN 7


                ELSE 99

            END,
            m.ID_MENU
        """, nativeQuery = true)
    List<Menu> getMenusByUsername(
            @Param("username") String username
    );


    // =====================================================
    // LISTAR TODOS LOS MENÚS
    // =====================================================
    @Query(
            value = """
                    SELECT *
                    FROM SIQRED_MENU
                    ORDER BY ID_MENU ASC
                    """,
            nativeQuery = true
    )
    List<Menu> findAllOrdered();


    // =====================================================
    // OBTENER IDs DE MENÚ POR ROL
    // =====================================================
    @Query(value = """
            SELECT ID_MENU
            FROM SIQRED_MENU_ROLE
            WHERE ID_ROLE = :roleId
            ORDER BY
                CASE

                    -- =========================
                    -- INICIO
                    -- =========================
                    WHEN ID_MENU = 10 THEN 1


                    -- =========================
                    -- ADMINISTRADOR
                    -- =========================
                    WHEN ID_MENU = 11 THEN 2
                    WHEN ID_MENU = 12 THEN 3
                    WHEN ID_MENU = 13 THEN 4
                    WHEN ID_MENU = 14 THEN 5
                    WHEN ID_MENU = 15 THEN 6


                    -- =========================
                    -- REGISTRAR QRD
                    -- =========================
                    WHEN ID_MENU = 17 THEN 2


                    -- =========================
                    -- REGISTRAR INTEGRIDAD
                    -- Roles 2, 4 y 6
                    -- =========================
                    WHEN ID_MENU = 21 THEN 2


                    -- =========================
                    -- DEMÁS MENÚS
                    -- =========================
                    WHEN ID_MENU = 18 THEN 3
                    WHEN ID_MENU = 19 THEN 4
                    WHEN ID_MENU = 20 THEN 5


                    -- =========================
                    -- MANUAL
                    -- =========================
                    WHEN ID_MENU = 16 THEN 7


                    ELSE 99

                END,
                ID_MENU
            """, nativeQuery = true)
    List<Integer> findMenuIdsByRoleId(
            @Param("roleId") Integer roleId
    );


    // =====================================================
    // ELIMINAR MENÚS ASIGNADOS A UN ROL
    // =====================================================
    @Modifying
    @Query(
            value = """
                    DELETE FROM SIQRED_MENU_ROLE
                    WHERE ID_ROLE = :roleId
                    """,
            nativeQuery = true
    )
    void deleteMenuRoleByRoleId(
            @Param("roleId") Integer roleId
    );


    // =====================================================
    // ASIGNAR MENÚ A ROL
    // =====================================================
    @Modifying
    @Query(value = """
            INSERT INTO SIQRED_MENU_ROLE
                (ID_MENU, ID_ROLE)
            VALUES
                (:menuId, :roleId)
            """, nativeQuery = true)
    void insertMenuRole(
            @Param("menuId") Integer menuId,
            @Param("roleId") Integer roleId
    );

}