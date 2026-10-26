package sistema.ejercito.mil.pe.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sistema.ejercito.mil.pe.dto.UsuarioDtoOut;
import sistema.ejercito.mil.pe.model.table.Role;
import sistema.ejercito.mil.pe.model.table.User;
import sistema.ejercito.mil.pe.model.view.Persona;
import sistema.ejercito.mil.pe.repository.IGenericRepo;
import sistema.ejercito.mil.pe.repository.IRoleRepo;
import sistema.ejercito.mil.pe.repository.IUserRepo;
import sistema.ejercito.mil.pe.service.IUserService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl
        extends ICRUDServiceImpl<User, Long>
        implements IUserService {

    private final IUserRepo repo;
    private final IRoleRepo repoRol;

    @Override
    protected IGenericRepo<User, Long> getRepo() {
        return repo;
    }

    @Override
    public List<UsuarioDtoOut> getAll() {
        return List.of();
    }

    @Override
    public Page<UsuarioDtoOut> getAll(Pageable pageable) {
        return null;
    }

    @Override
    public List<Role> findAllRoles() {
        return repoRol.findAll();
    }

    @Override
    @Transactional
    public void guardarUsuarioConRoles(
            User user,
            List<Integer> idsRoles
    ) {

        if (idsRoles == null || idsRoles.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debe seleccionar al menos un rol"
            );
        }

        List<Role> roles = repoRol.findAllById(idsRoles);

        if (roles.isEmpty()) {
            throw new EntityNotFoundException(
                    "No se encontraron los roles seleccionados"
            );
        }

        user.setEstado(1);

        user.setFechaRegistro(LocalDateTime.now());

        user.setFechaActivo(null);

        user.setRoleActiveIdRole(
                roles.get(0).getIdRole()
        );

        user.setRoles(roles);

        repo.save(user);
    }

    @Override
    public void actualizarUsuarioConRoles(
            Long userId,
            User updatedUser,
            List<Integer> idsRoles
    ) {

        User user = repo.findById(userId)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "Usuario no encontrado con ID: " + userId
                        )
                );

        user.setUsername(updatedUser.getUsername());

        List<Role> roles = repoRol.findAllById(idsRoles);

        user.setRoles(roles);

        repo.save(user);
    }

    @Override
    public User buscarporUser(String username) {
        return repo.buscarporUser(username);
    }

    @Override
    public void changeEstado(Long id) {

        User usuario = repo.findById(id)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "Usuario no encontrado con ID: " + id
                        )
                );

        int estadoActual = usuario.getEstado();

        if (estadoActual == 1) {
            usuario.setEstado(2);
        } else if (estadoActual == 2) {
            usuario.setEstado(1);
        }

        repo.save(usuario);
    }

    @Override
    public Persona buscarporCip(String cip) {
        return repo.buscarporCip(cip);
    }

    @Override
    public Persona buscarporCipUserRegister(String cip) {
        return repo.buscarporCipUserRegister(cip);
    }

    @Override
    public User buscarporCipUser(String cip) {
        return repo.buscarporCipUser(cip);
    }

    @Override
    public Page<User> listPage(
            Pageable pageable,
            String searchParam
    ) {
        return repo.pageUsers(pageable, searchParam);
    }

    @Transactional
    @Override
    public void deleteUser(Long userId) {

        String usuarioSesion =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        User usuario = repo.findById(userId)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "Usuario no encontrado con ID: " + userId
                        )
                );

        if (usuario.getUsername().equals(usuarioSesion)) {
            throw new EntityNotFoundException(
                    "No puedes eliminarte a ti mismo"
            );
        }

        repo.delete(usuario);
    }

    @Override
    public void changeRoles(
            String username,
            List<Integer> rolesIds
    ) {

        User user = repo.buscarporUser(username);

        if (user == null) {
            throw new EntityNotFoundException(
                    "Usuario no encontrado: " + username
            );
        }

        List<Role> roles = repoRol.findAllById(rolesIds);

        user.getRoles().clear();
        user.getRoles().addAll(roles);

        repo.save(user);
    }


    // CAMBIAR ROL ACTIVO


    @Override
    @Transactional
    public void cambiarRolActivo(
            String username,
            Integer idRol
    ) {

        User user = repo.buscarporUser(username);

        if (user == null) {
            throw new EntityNotFoundException(
                    "Usuario no encontrado: " + username
            );
        }

        Role rol = repoRol.findById(idRol)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "Rol no encontrado con ID: " + idRol
                        )
                );

        user.setRoleActiveIdRole(
                rol.getIdRole()
        );

        repo.save(user);
    }
}