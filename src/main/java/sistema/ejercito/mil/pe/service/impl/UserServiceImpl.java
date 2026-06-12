package sistema.ejercito.mil.pe.service.impl;

import sistema.ejercito.mil.pe.dto.UsuarioDtoOut;
import sistema.ejercito.mil.pe.model.table.Role;
import sistema.ejercito.mil.pe.model.table.User;
import sistema.ejercito.mil.pe.model.view.Persona;
import sistema.ejercito.mil.pe.repository.IGenericRepo;
import sistema.ejercito.mil.pe.repository.IRoleRepo;
import sistema.ejercito.mil.pe.repository.IUserRepo;
import sistema.ejercito.mil.pe.service.IUserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ICRUDServiceImpl<User, Long> implements IUserService {

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
        return List.of();
    }








    @Override
    public void guardarUsuarioConRoles(User user, List<Integer> idsRoles) {

        List<Role> roles = repoRol.findAllById(idsRoles);
        user.setRoles(roles);
        repo.save(user);
    }

    @Override
    public void actualizarUsuarioConRoles(Long userId, User updatedUser, List<Integer> idsRoles) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
                .orElseThrow(() -> new RuntimeException("User no encontrado"));
      int estadot = usuario.getEstado();
        if (usuario != null) {
            if(estadot==1){
                usuario.setEstado(2);
            }else if(estadot==2){
                usuario.setEstado(1);
            }
            repo.save(usuario);
        } else {
            throw new EntityNotFoundException("Usuario no encontrado : " + id);
        }
    }

    //buscar por cip
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
    public Page<User> listPage(Pageable pageable ,String searchParam) {

        return repo.pageUsers(pageable,searchParam);
    }

    @Transactional
    @Override
    public void deleteUser(Long userId) {

        String contextSessionUser = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<User> userOptional = repo.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getUsername().equals(contextSessionUser)) {
                throw new EntityNotFoundException("No puedes eliminarte a ti mismo");
            } else {
                repo.delete(user);
            }
        } else {
            throw new EntityNotFoundException("Usuario no encontrado con id : " + userId);
        }
    }

    @Override
    public void changeRoles(String username, List<Integer> rolesIds) {

        User user = repo.buscarporUser(username);
        user.getRoles().clear();

        for (Integer roleId : rolesIds) {
            Role role = new Role();
            role.setIdRole(roleId);
            user.getRoles().add(role);
        }
        repo.save(user);
    }


}
