package sistema.ejercito.mil.pe.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sistema.ejercito.mil.pe.model.table.User;
import sistema.ejercito.mil.pe.model.view.Persona;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IUserRepo extends IGenericRepo<User, Long> {



    //public User findByUsername(String username);

    public Optional<User> findById(Long id);

    User findOneByUsername(String username);

    @Query("from User where username =:username")
    User buscarporUser(String username);

    @Query("from User u where u.cip = :cip")
    User buscarporCipUser(@Param("cip") String cip);




    @Query("""
    SELECT p    FROM User p
      WHERE      UPPER(p.fullname) LIKE UPPER(CONCAT('%', :searchParam, '%'))
        OR UPPER(p.cip) LIKE UPPER(CONCAT('%', :searchParam, '%') )
        order by p.estado asc
        
       
      
""")
    Page<User> pageUsers(Pageable pageable, @Param("searchParam") String searchParam);



    @Query("from Persona p where p.cip =:cip")
    Persona buscarporCip(@Param("cip") String cip);

    @Query("from Persona p where p.cip =:cip")
    Persona buscarporCipUserRegister(@Param("cip") String cip);



    //reporte list users
    @Query(value = """
            SELECT
                  u.cip,
                  u.grado,
                  u.arma,
                  u.fullname,
                  v_nucleo.acronimo AS nucleo_acronimo,
                  v_brigada.acronimo AS brigada_acronimo,
                   v_unidad.acronimo AS unidad_acronimo,
                  u.telefono
              FROM
                  SISLLAA_ST_USER u
              LEFT JOIN
                  SISLLAA_NUCLEO v_nucleo ON u.nucleo_idnucleo = v_nucleo.idnucleo
              LEFT JOIN
                  SISLLAA_BRIGADA v_brigada ON u.brigada_idbrigada = v_brigada.idbrigada
                    LEFT JOIN
                  SISLLAA_UNIDAD v_unidad ON u.dependencia_idunidad = v_unidad.idunidad        
                                         """, nativeQuery = true)
    List<Object[]> listfindAllUsers();

    //buscar por id de division
    @Query(value = """

            SELECT
                 u.cip,
                 u.grado,
                 u.arma,
                 u.fullname,
                 v_nucleo.acronimo AS nucleo_acronimo,
                 v_brigada.acronimo AS brigada_acronimo,
                    v_unidad.acronimo AS unidad_acronimo,
                 u.telefono
               
             FROM
                 SISLLAA_ST_USER u
             LEFT JOIN
                 SISLLAA_NUCLEO v_nucleo ON u.nucleo_idnucleo = v_nucleo.idnucleo
             LEFT JOIN
                 SISLLAA_BRIGADA v_brigada ON u.brigada_idbrigada = v_brigada.idbrigada
             LEFT JOIN
                 SISLLAA_UNIDAD v_unidad ON u.dependencia_idunidad = v_unidad.idunidad
             WHERE
                 nucleo_idnucleo = :id
                                        """, nativeQuery = true)
    List<Object[]> buscarpordivision(@Param("id") String id);


}
