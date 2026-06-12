package sistema.ejercito.mil.pe.controller;

import org.springframework.data.domain.PageRequest;
import sistema.ejercito.mil.pe.dto.MsgResp;
import sistema.ejercito.mil.pe.dto.PersonaDTO;
import sistema.ejercito.mil.pe.dto.UsuarioDTO;
import sistema.ejercito.mil.pe.exception.CustomErrorResponse;
import sistema.ejercito.mil.pe.model.table.ChasquiMatriz;
import sistema.ejercito.mil.pe.model.table.Role;
import sistema.ejercito.mil.pe.model.table.User;
import sistema.ejercito.mil.pe.model.view.Persona;
import sistema.ejercito.mil.pe.service.IRoleService;
import sistema.ejercito.mil.pe.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import static sistema.ejercito.mil.pe.util.constants.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService service;
    private final IRoleService roleService;
    private final ModelMapper modelMapper;


    @PostMapping()
    public ResponseEntity<?> crearUsuarioConRoles(@RequestBody User user, @RequestParam List<Integer> idsRoles) {
        User verificarUsuario = service.buscarporUser(user.getUsername());
        try {
            if (verificarUsuario == null) {
                user.setEstado(1);
                service.guardarUsuarioConRoles(user, idsRoles);
                return ResponseEntity.ok(new MsgResp(MSG_USUARIO_CREATED));
            } else {
                CustomErrorResponse customErrorResponse = new CustomErrorResponse(LocalDateTime.now(), MSG_ERROR_USUARIO_REG, "/users");
                return new ResponseEntity<>(customErrorResponse, HttpStatus.CONFLICT);
            }
        } catch (Exception e) {
            CustomErrorResponse customErrorResponse = new CustomErrorResponse(LocalDateTime.now(), MSG_ERROR_USUARIO, "/users");
            return new ResponseEntity<>(customErrorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> actualizarUsuarioConRoles(@PathVariable Long userId, @RequestBody User user, @RequestParam List<Integer> idsRoles) {
        try {
            // Verificar si el usuario existe
            User verificarUsuario = service.buscarporUser(user.getUsername());

            if (verificarUsuario == null || verificarUsuario.getIdUser().equals(userId)) {

             //   verificarUsuario.setNucleo(user.getNucleo());
              //  verificarUsuario.setBrigada(user.getBrigada());
              //  verificarUsuario.setDependencia(user.getDependencia());
              //  verificarUsuario.setTelefono(user.getTelefono());
                //verificarUsuario.setCargo(user.getCargo());

                service.actualizarUsuarioConRoles(userId, user, idsRoles);
                return ResponseEntity.ok(new MsgResp(MSG_USUARIO_UPDATE));

            } else {
                CustomErrorResponse customErrorResponse = new CustomErrorResponse(LocalDateTime.now(), MSG_ERROR_USUARIO_REG, "/users");
                return new ResponseEntity<>(customErrorResponse, HttpStatus.CONFLICT);
            }

        } catch (Exception e) {
            CustomErrorResponse customErrorResponse = new CustomErrorResponse(LocalDateTime.now(), MSG_ERROR_USUARIO, "/users");
            return new ResponseEntity<>(customErrorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> findByUsername(@PathVariable("username") String username) throws Exception {
        User obj = service.buscarporUser(username);

        if (obj == null) {
            CustomErrorResponse customErrorResponse = new CustomErrorResponse(LocalDateTime.now(), MSG_ERROR_USUARIO_NO_EXIST, "/users");
            return new ResponseEntity<>(customErrorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
            return ResponseEntity.ok(obj);
        }
    }


    @PutMapping("/roles/{username}")
    public ResponseEntity<?> changeRoles(@PathVariable String username, @RequestBody List<Integer> rolesIds) {
        try {
            service.changeRoles(username, rolesIds);
            return ResponseEntity.ok(new MsgResp(MSG_USUARIO_CREATED));
        } catch (Exception e) {
            CustomErrorResponse customErrorResponse = new CustomErrorResponse(LocalDateTime.now(), MSG_ERROR_ROLES, "/users");
            return new ResponseEntity<>(customErrorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/estado/{id}")
    public ResponseEntity<?> changeEstado(@PathVariable("id") Long id) {
        try {

            service.changeEstado( id);
            return ResponseEntity.ok(new MsgResp(MSG_USUARIO_OK));
        } catch (Exception e) {
            CustomErrorResponse customErrorResponse = new CustomErrorResponse(LocalDateTime.now(), MSG_ERROR_USUARIO, "/users");
            return new ResponseEntity<>(customErrorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/cip/{cip}")
    public ResponseEntity<?> findByCip(@PathVariable("cip") String cip) throws Exception {
        Persona obj = service.buscarporCipUserRegister(cip);

        if (obj == null) {
            CustomErrorResponse customErrorResponse = new CustomErrorResponse(LocalDateTime.now(), MSG_ERROR_USUARIO_NO_EXIST, "/users");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(customErrorResponse);
        } else {
            return ResponseEntity.ok(convertToDtoPersona(obj));
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> findAllRoles() {
        List<Role> roles = roleService.listRoles();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<List<Role>> findbyIdRoles(@PathVariable("id") String id) {
        List<Role> roles = roleService.listRolebyId(id);
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/pageable")
    public ResponseEntity<Page<UsuarioDTO>> listPage(
        @RequestParam(value = "s", defaultValue = "") String searchParam,
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "pageSize", defaultValue = "10") int pageSize) {

        Pageable pageable = PageRequest.of(page, pageSize);
        Page<UsuarioDTO> data = service.listPage(pageable,searchParam).map(this::convertToDto);
        return ResponseEntity.ok(data);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> findAll() {
        List<UsuarioDTO> list = service.findAll().stream().map(this::convertToDto).toList();
        return ResponseEntity.ok(list);
    }


//eliminar usuario por cip
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {

        service.deleteUser(id);
        return ResponseEntity.ok().build();
    }


    private UsuarioDTO convertToDto(User obj) {
        return modelMapper.map(obj, UsuarioDTO.class);
    }

    private PersonaDTO convertToDtoPersona(Persona obj) {
        return modelMapper.map(obj, PersonaDTO.class);
    }

    private User convertToEntity(UsuarioDTO dto) {
        return modelMapper.map(dto, User.class);
    }
}
