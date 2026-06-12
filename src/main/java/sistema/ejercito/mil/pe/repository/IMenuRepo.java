package sistema.ejercito.mil.pe.repository;

import sistema.ejercito.mil.pe.model.table.Menu;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IMenuRepo extends IGenericRepo<Menu, Integer> {

    @Query(value = """
                  select chasqui_jh_menu.* from chasqui_menu_role_jh            
                         inner join chasqui_jh_menu  on chasqui_jh_menu.id_menu = chasqui_menu_role_jh.id_menu                      
                        inner join chasqui_user_role_jh  on chasqui_user_role_jh.id_role = chasqui_menu_role_jh.id_role            
                        inner join jh_recover_chasqui_usuarios on jh_recover_chasqui_usuarios.id_user = chasqui_user_role_jh.id_user
                                           
                        where jh_recover_chasqui_usuarios.username =:username ORDER BY chasqui_menu_role_jh.id_menu
            """, nativeQuery = true)
    List<Menu> getMenusByUsername(@Param("username") String username);

    @Query(value = "SELECT * FROM chasqui_jh_menu ORDER BY id_menu ASC", nativeQuery = true)
    List<Menu> findAllOrdered();

    @Query(value = """
            SELECT id_menu FROM chasqui_menu_role_jh
            WHERE id_role = :roleId ORDER BY id_menu ASC
            """, nativeQuery = true)
    List<Integer> findMenuIdsByRoleId(@Param("roleId") Integer roleId);

    @Modifying
    @Query(value = "DELETE FROM chasqui_menu_role_jh WHERE id_role = :roleId", nativeQuery = true)
    void deleteMenuRoleByRoleId(@Param("roleId") Integer roleId);

    @Modifying
    @Query(value = """
            INSERT INTO chasqui_menu_role_jh (id_menu, id_role)
            VALUES (:menuId, :roleId)
            """, nativeQuery = true)
    void insertMenuRole(@Param("menuId") Integer menuId, @Param("roleId") Integer roleId);

    /*
    @Query(value = """
                  select sisllaa_st_menu.* from sisllaa_menu_role_st
                         inner join sisllaa_st_menu  on sisllaa_st_menu.id_menu = sisllaa_menu_role_st.id_menu
                        inner join sisllaa_user_role_st  on sisllaa_user_role_st.id_role = sisllaa_menu_role_st.id_role
                        inner join sisllaa_st_user  on sisllaa_st_user.id_user = sisllaa_user_role_st.id_user

                        where sisllaa_st_user.username =:username ORDER BY sisllaa_menu_role_st.id_menu
            """, nativeQuery = true)
    List<Menu> getMenusByUsername(@Param("username") String username);
*/
}
