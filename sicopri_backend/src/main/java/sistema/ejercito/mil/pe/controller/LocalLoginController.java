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

import java.util.Map;

@RestController
@RequestMapping("/login")
@Profile("local")
@RequiredArgsConstructor
public class LocalLoginController {

    private final JwtTokenUtil jwtTokenUtil;
    private final JwtUserDetailsService userDetailsService;
    private final IUserService userService;

    @Value("${app.local-login.username}")
    private String localUsername;

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
        if (!localUsername.equals(request.username())
                || !localPassword.equals(request.password())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Usuario o contraseña local incorrectos"
                    ));
        }

        User usuario = userService.buscarporUser(localUsername);

        if (usuario == null || usuario.getEstado() != 1) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Usuario local inexistente o inactivo"
                    ));
        }

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(localUsername);

        String token = jwtTokenUtil.generateToken(userDetails);

        return ResponseEntity.ok(new JwtResponse(token));
    }
}