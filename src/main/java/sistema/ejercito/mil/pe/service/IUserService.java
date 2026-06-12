package sistema.ejercito.mil.pe.service;

import sistema.ejercito.mil.pe.dto.UsuarioDtoOut;
import sistema.ejercito.mil.pe.model.table.Role;
import sistema.ejercito.mil.pe.model.table.User;
import sistema.ejercito.mil.pe.model.view.Persona;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IUserService extends ICRUDService<User, Long>{


    public List<UsuarioDtoOut> getAll();

    public Page<UsuarioDtoOut> getAll(Pageable pageable);

    public List<Role> findAllRoles();



    void guardarUsuarioConRoles(User user, List<Integer> idsRoles);

    void actualizarUsuarioConRoles(Long userId, User updatedUser, List<Integer> idsRoles);

    User buscarporUser(String username);

    void changeEstado(Long  id);

    Persona buscarporCip(String cip);

    Persona buscarporCipUserRegister(String cip); //para registrar

    User buscarporCipUser(String cip);  //agregado

    Page<User> listPage(Pageable pageable,String searchParam);

    void deleteUser(Long id);

    void changeRoles(String cip, List<Integer> rolesIds);


}
