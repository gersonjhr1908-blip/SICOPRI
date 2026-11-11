package sistema.ejercito.mil.pe.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import sistema.ejercito.mil.pe.model.table.User;
import sistema.ejercito.mil.pe.security.JwtResponse;
import sistema.ejercito.mil.pe.security.JwtTokenUtil;
import sistema.ejercito.mil.pe.security.JwtUserDetailsService;
import sistema.ejercito.mil.pe.service.IUserService;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/login")
@Profile("local")
@RequiredArgsConstructor
public class LocalLoginController {

    private final JwtTokenUtil jwtTokenUtil;
    private final JwtUserDetailsService userDetailsService;
    private final IUserService userService;

    /*
     * Todos los usuarios locales de prueba usarán
     * la contraseña configurada en application.properties.
     */
    @Value("${app.local-login.password}")
    private String localPassword;

    public record LocalLoginRequest(
            String username,
            String password
    ) {}

    @PostMapping("/local")
    public ResponseEntity<?> login(
            @RequestBody LocalLoginRequest request
    ) {

        // =========================================
        // VALIDAR SOLICITUD
        // =========================================

        if (request == null ||
                request.username() == null ||
                request.username().isBlank() ||
                request.password() == null) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "message",
                            "Debe ingresar usuario y contraseña"
                    ));
        }

        String username = request
                .username()
                .trim()
                .toUpperCase(Locale.ROOT);

        // =========================================
        // VALIDAR CONTRASEÑA LOCAL COMPARTIDA
        // =========================================

        if (!localPassword.equals(request.password())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Usuario o contraseña local incorrectos"
                    ));
        }

        // =========================================
        // BUSCAR USUARIO EN LA BASE DE DATOS
        // =========================================

        User usuario;

        try {
            usuario = userService.buscarporUser(username);
        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Usuario local inexistente"
                    ));
        }

        // =========================================
        // VALIDAR QUE ESTÉ ACTIVO
        // =========================================

        if (usuario == null ||
                !Integer.valueOf(1).equals(usuario.getEstado())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Usuario local inexistente o inactivo"
                    ));
        }

        // =========================================
        // GENERAR TOKEN CON SU ROL REAL
        // =========================================

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(username);

        String token =
                jwtTokenUtil.generateToken(userDetails);

        return ResponseEntity.ok(
                new JwtResponse(token)
        );
    }
}