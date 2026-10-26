package sistema.ejercito.mil.pe.controller;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import sistema.ejercito.mil.pe.dto.MsgResp;
import sistema.ejercito.mil.pe.dto.PersonaDTO;
import sistema.ejercito.mil.pe.dto.UsuarioDTO;
import sistema.ejercito.mil.pe.exception.CustomErrorResponse;

import sistema.ejercito.mil.pe.model.table.Role;
import sistema.ejercito.mil.pe.model.table.User;

import sistema.ejercito.mil.pe.model.view.Persona;
import sistema.ejercito.mil.pe.model.view.Nucleo;
import sistema.ejercito.mil.pe.model.view.Brigada;
import sistema.ejercito.mil.pe.model.view.Unidad;

import sistema.ejercito.mil.pe.repository.INucleoRepo;
import sistema.ejercito.mil.pe.repository.IBrigadaRepo;
import sistema.ejercito.mil.pe.repository.IUnidadRepo;

import sistema.ejercito.mil.pe.service.IRoleService;
import sistema.ejercito.mil.pe.service.IUserService;

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

    // ==========================================
    // REPOSITORIOS PARA UBICACIÓN ORGÁNICA
    // ==========================================
    private final INucleoRepo nucleoRepo;
    private final IBrigadaRepo brigadaRepo;
    private final IUnidadRepo unidadRepo;


    // ==========================================
    // CREAR USUARIO
    // ==========================================
    @PostMapping()
    public ResponseEntity<?> crearUsuarioConRoles(
            @RequestBody User user,
            @RequestParam List<Integer> idsRoles
    ) {

        User verificarUsuario =
                service.buscarporUser(user.getUsername());

        try {

            if (verificarUsuario == null) {

                user.setEstado(1);

                service.guardarUsuarioConRoles(
                        user,
                        idsRoles
                );

                return ResponseEntity.ok(
                        new MsgResp(MSG_USUARIO_CREATED)
                );

            } else {

                CustomErrorResponse customErrorResponse =
                        new CustomErrorResponse(
                                LocalDateTime.now(),
                                MSG_ERROR_USUARIO_REG,
                                "/users"
                        );

                return new ResponseEntity<>(
                        customErrorResponse,
                        HttpStatus.CONFLICT
                );
            }

        } catch (Exception e) {

            e.printStackTrace();

            CustomErrorResponse customErrorResponse =
                    new CustomErrorResponse(
                            LocalDateTime.now(),
                            MSG_ERROR_USUARIO,
                            "/users"
                    );

            return new ResponseEntity<>(
                    customErrorResponse,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    // ==========================================
    // ACTUALIZAR USUARIO
    // ==========================================
    @PutMapping("/{userId}")
    public ResponseEntity<?> actualizarUsuarioConRoles(
            @PathVariable Long userId,
            @RequestBody User user,
            @RequestParam List<Integer> idsRoles
    ) {

        try {

            User verificarUsuario =
                    service.buscarporUser(
                            user.getUsername()
                    );

            if (
                    verificarUsuario == null
                            ||
                            verificarUsuario
                                    .getIdUser()
                                    .equals(userId)
            ) {

                service.actualizarUsuarioConRoles(
                        userId,
                        user,
                        idsRoles
                );

                return ResponseEntity.ok(
                        new MsgResp(MSG_USUARIO_UPDATE)
                );

            } else {

                CustomErrorResponse customErrorResponse =
                        new CustomErrorResponse(
                                LocalDateTime.now(),
                                MSG_ERROR_USUARIO_REG,
                                "/users"
                        );

                return new ResponseEntity<>(
                        customErrorResponse,
                        HttpStatus.CONFLICT
                );
            }

        } catch (Exception e) {

            e.printStackTrace();

            CustomErrorResponse customErrorResponse =
                    new CustomErrorResponse(
                            LocalDateTime.now(),
                            MSG_ERROR_USUARIO,
                            "/users"
                    );

            return new ResponseEntity<>(
                    customErrorResponse,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    // ==========================================
    // BUSCAR USUARIO POR USERNAME
    // ==========================================
    @GetMapping("/{username}")
    public ResponseEntity<?> findByUsername(
            @PathVariable("username") String username
    ) throws Exception {

        User obj =
                service.buscarporUser(username);

        if (obj == null) {

            CustomErrorResponse customErrorResponse =
                    new CustomErrorResponse(
                            LocalDateTime.now(),
                            MSG_ERROR_USUARIO_NO_EXIST,
                            "/users"
                    );

            return new ResponseEntity<>(
                    customErrorResponse,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );

        } else {

            return ResponseEntity.ok(obj);
        }
    }


    // ==========================================
    // CAMBIAR ROLES
    // ==========================================
    @PutMapping("/roles/{username}")
    public ResponseEntity<?> changeRoles(
            @PathVariable String username,
            @RequestBody List<Integer> rolesIds
    ) {

        try {

            service.changeRoles(
                    username,
                    rolesIds
            );

            return ResponseEntity.ok(
                    new MsgResp(MSG_USUARIO_CREATED)
            );

        } catch (Exception e) {

            CustomErrorResponse customErrorResponse =
                    new CustomErrorResponse(
                            LocalDateTime.now(),
                            MSG_ERROR_ROLES,
                            "/users"
                    );

            return new ResponseEntity<>(
                    customErrorResponse,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    // ==========================================
    // CAMBIAR ROL ACTIVO / VISTA DE ROL
    // SOLO PARA ADMINISTRADOR
    // ==========================================
    @PutMapping("/active-role/{idRol}")
    public ResponseEntity<?> cambiarRolActivo(
            @PathVariable Integer idRol
    ) {

        try {

            String username =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication()
                            .getName();

            User usuario =
                    service.buscarporUser(username);

            if (usuario == null) {

                CustomErrorResponse customErrorResponse =
                        new CustomErrorResponse(
                                LocalDateTime.now(),
                                "Usuario no encontrado",
                                "/users/active-role"
                        );

                return new ResponseEntity<>(
                        customErrorResponse,
                        HttpStatus.NOT_FOUND
                );
            }


            // ==========================================
            // VERIFICAR ROL REAL ADMINISTRADOR
            // ID_ROLE = 1
            // ==========================================
            boolean esAdministrador =
                    usuario.getRoles()
                            .stream()
                            .anyMatch(
                                    rol ->
                                            rol.getIdRole() != null
                                                    &&
                                                    rol.getIdRole().equals(1)
                            );


            if (!esAdministrador) {

                CustomErrorResponse customErrorResponse =
                        new CustomErrorResponse(
                                LocalDateTime.now(),
                                "Solo el administrador puede cambiar la vista de rol",
                                "/users/active-role"
                        );

                return new ResponseEntity<>(
                        customErrorResponse,
                        HttpStatus.FORBIDDEN
                );
            }


            // ==========================================
            // VALIDAR QUE EL ROL SEA 1 - 7
            // ==========================================
            if (idRol == null || idRol < 1 || idRol > 7) {

                CustomErrorResponse customErrorResponse =
                        new CustomErrorResponse(
                                LocalDateTime.now(),
                                "Rol no válido",
                                "/users/active-role"
                        );

                return new ResponseEntity<>(
                        customErrorResponse,
                        HttpStatus.BAD_REQUEST
                );
            }


            // ==========================================
            // CAMBIAR SOLO ROLE_ACTIVE_ID_ROLE
            // NO MODIFICA SIQRED_USER_ROLE
            // ==========================================
            service.cambiarRolActivo(
                    username,
                    idRol
            );


            return ResponseEntity.ok(
                    new MsgResp(
                            "Rol activo actualizado correctamente"
                    )
            );


        } catch (Exception e) {

            e.printStackTrace();

            CustomErrorResponse customErrorResponse =
                    new CustomErrorResponse(
                            LocalDateTime.now(),
                            "Error al cambiar rol activo: "
                                    + e.getMessage(),
                            "/users/active-role"
                    );

            return new ResponseEntity<>(
                    customErrorResponse,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    // ==========================================
    // CAMBIAR ESTADO
    // ==========================================
    @PutMapping("/estado/{id}")
    public ResponseEntity<?> changeEstado(
            @PathVariable("id") Long id
    ) {

        try {

            service.changeEstado(id);

            return ResponseEntity.ok(
                    new MsgResp(MSG_USUARIO_OK)
            );

        } catch (Exception e) {

            CustomErrorResponse customErrorResponse =
                    new CustomErrorResponse(
                            LocalDateTime.now(),
                            MSG_ERROR_USUARIO,
                            "/users"
                    );

            return new ResponseEntity<>(
                    customErrorResponse,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    // ==========================================
    // BUSCAR PERSONA POR CIP
    // ==========================================
    @GetMapping("/cip/{cip}")
    public ResponseEntity<?> findByCip(
            @PathVariable("cip") String cip
    ) throws Exception {

        Persona obj =
                service.buscarporCipUserRegister(cip);

        if (obj == null) {

            CustomErrorResponse customErrorResponse =
                    new CustomErrorResponse(
                            LocalDateTime.now(),
                            MSG_ERROR_USUARIO_NO_EXIST,
                            "/users"
                    );

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(customErrorResponse);

        } else {

            return ResponseEntity.ok(
                    convertToDtoPersona(obj)
            );
        }
    }


    // ==========================================
    // LISTAR ROLES
    // ==========================================
    @GetMapping("/roles")
    public ResponseEntity<List<Role>> findAllRoles() {

        List<Role> roles =
                roleService.listRoles();

        return ResponseEntity.ok(roles);
    }


    // ==========================================
    // ROLES POR ID/CIP
    // ==========================================
    @GetMapping("/roles/{id}")
    public ResponseEntity<List<Role>> findbyIdRoles(
            @PathVariable("id") String id
    ) {

        List<Role> roles =
                roleService.listRolebyId(id);

        return ResponseEntity.ok(roles);
    }


    // ==========================================
    // LISTADO PAGINADO DE USUARIOS
    // ==========================================
    @GetMapping("/pageable")
    public ResponseEntity<Page<UsuarioDTO>> listPage(

            @RequestParam(
                    value = "s",
                    defaultValue = ""
            ) String searchParam,

            @RequestParam(
                    value = "page",
                    defaultValue = "0"
            ) int page,

            @RequestParam(
                    value = "pageSize",
                    defaultValue = "10"
            ) int pageSize
    ) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        pageSize
                );

        Page<UsuarioDTO> data =
                service
                        .listPage(
                                pageable,
                                searchParam
                        )
                        .map(this::convertToDto);

        return ResponseEntity.ok(data);
    }


    // ==========================================
    // LISTAR TODOS LOS USUARIOS
    // ==========================================
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> findAll() {

        List<UsuarioDTO> list =
                service
                        .findAll()
                        .stream()
                        .map(this::convertToDto)
                        .toList();

        return ResponseEntity.ok(list);
    }


    // ==========================================
    // ELIMINAR USUARIO
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id
    ) {

        service.deleteUser(id);

        return ResponseEntity
                .ok()
                .build();
    }


    // =====================================================
    // LISTAR NÚCLEOS
    // =====================================================
    @GetMapping("/nucleos")
    public ResponseEntity<List<Nucleo>> listarNucleos() {

        List<Nucleo> nucleos =
                nucleoRepo.findAll();

        return ResponseEntity.ok(nucleos);
    }


    // =====================================================
    // LISTAR BRIGADAS POR NÚCLEO
    // =====================================================
    @GetMapping("/brigadas/{idNucleo}")
    public ResponseEntity<List<Brigada>> listarBrigadasPorNucleo(
            @PathVariable String idNucleo
    ) {

        List<Brigada> brigadas =
                brigadaRepo.findByIdNucleo(
                        idNucleo
                );

        return ResponseEntity.ok(brigadas);
    }


    // =====================================================
    // LISTAR UNIDADES POR NÚCLEO + BRIGADA
    // =====================================================
    @GetMapping("/unidades/{idNucleo}/{idBrigada}")
    public ResponseEntity<List<Unidad>> listarUnidades(
            @PathVariable String idNucleo,
            @PathVariable String idBrigada
    ) {

        List<Unidad> unidades =
                unidadRepo
                        .findByIdNucleoAndIdBrigada(
                                idNucleo,
                                idBrigada
                        );

        return ResponseEntity.ok(unidades);
    }


    // ==========================================
    // MAPPERS
    // ==========================================
    private UsuarioDTO convertToDto(
            User obj
    ) {

        return modelMapper.map(
                obj,
                UsuarioDTO.class
        );
    }


    private PersonaDTO convertToDtoPersona(
            Persona obj
    ) {

        return modelMapper.map(
                obj,
                PersonaDTO.class
        );
    }


    private User convertToEntity(
            UsuarioDTO dto
    ) {

        return modelMapper.map(
                dto,
                User.class
        );
    }
}