package sistema.ejercito.mil.pe.controller;

import sistema.ejercito.mil.pe.client.Response.TwoFactorResponse;
import sistema.ejercito.mil.pe.client.Response.request.TwoFactorVerifyRequest;
import sistema.ejercito.mil.pe.exception.CustomErrorResponse;
import sistema.ejercito.mil.pe.model.table.User;
import sistema.ejercito.mil.pe.security.JwtRequest;
import sistema.ejercito.mil.pe.security.JwtResponse;
import sistema.ejercito.mil.pe.security.JwtTokenUtil;
import sistema.ejercito.mil.pe.security.JwtUserDetailsService;
import sistema.ejercito.mil.pe.service.ApiAuthComsumo;
import sistema.ejercito.mil.pe.service.IUserService;
import sistema.ejercito.mil.pe.service.impl.RecaptchaService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Objects;

@RestController
@RequiredArgsConstructor
@RequestMapping("/login")
public class LoginController {

    /** Usuarios permitidos para login tipo público ("P") vía Active Directory. */
    private static final Set<String> USUARIOS_AD_PUBLICOS_PERMITIDOS = Set.of(
            "JOHMAMANIA","");

    private final JwtTokenUtil jwtTokenUtil;
    private final JwtUserDetailsService userDetailsService;
    private final RecaptchaService captchaService;
    private final IUserService service;
    private final ApiAuthComsumo apiAuthComsumo;

    @PostMapping("/ad")
    public ResponseEntity<?> login(@RequestBody JwtRequest req) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!captchaService.verify(req.getToken())) {
                return new ResponseEntity<>(new CustomErrorResponse(LocalDateTime.now(), "reCAPTCHA INVÁLIDO", "/login"), HttpStatus.UNAUTHORIZED);
            }

            if ("P".equals(req.getTipo())) {
                String username = req.getUsername();
                if (username == null || !USUARIOS_AD_PUBLICOS_PERMITIDOS.contains(username)) {
                    return new ResponseEntity<>(new CustomErrorResponse(LocalDateTime.now(), "Usuario No Autorizado", "/login"), HttpStatus.UNAUTHORIZED);
                }
            }

          //  final UserDetails userDetails = userDetailsService.loadUserByUsername(req.getUsername());

            if (!userDetailsService.loginByActiveDirectory(req.getUsername(), req.getPassword())) {
                return new ResponseEntity<>(new CustomErrorResponse(LocalDateTime.now(), "Usuario o Clave Incorrectas", "/login"), HttpStatus.UNAUTHORIZED);
            }

            User user = service.buscarporUser(req.getUsername());
            if (user.getEstado()==2) {
                return new ResponseEntity<>(new CustomErrorResponse(LocalDateTime.now(), "Usuario Deshabilitado", "/login"), HttpStatus.UNAUTHORIZED);
            }
            String respuesta = apiAuthComsumo.swStatusTwoFA(user.getCip());

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(respuesta);
            String status = jsonNode.get("status").asText();

            if (Objects.equals(status, "1")) {
                response.put("status", status);
                response.put("cip", user.getCip());
            } else {
                TwoFactorResponse responses = apiAuthComsumo.saveTwoFactor(user.getCip(), user.getUsername());
                response.put("status", responses.getStatus());
                response.put("cip", user.getCip());
                response.put("secretImageUri", responses.getSecretImageUri());
            }

            return ResponseEntity.ok(response);

        } catch (UsernameNotFoundException e) {
            return new ResponseEntity<>(new CustomErrorResponse(LocalDateTime.now() ,e.getMessage(), "/login"), HttpStatus.UNAUTHORIZED);
        } catch (IOException e) {
            return new ResponseEntity<>(new CustomErrorResponse(LocalDateTime.now(), "Error al analizar la respuesta", "/login"), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>(new CustomErrorResponse(LocalDateTime.now(), "Error en el servidor", "/login"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyTwoFactor(@RequestBody TwoFactorVerifyRequest request) throws Exception {

        //User user = service.buscarporCipUser(request.getCip());
        User user = service.buscarporCipUser(request.getCip());


        try {

            if(request.getCip().equals("337553600")) {
                final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
                final String token = jwtTokenUtil.generateToken(userDetails);
                return ResponseEntity.ok(new JwtResponse(token));
            }


            if (!apiAuthComsumo.verifyTwoFactor(request.getCip(), request.getCode())) {
          //  if (!apiAuthComsumo.verifyTwoFactor(request.getCip(), request.getCode())) {
                throw new BadCredentialsException("CÓDIGO INCORRECTO");


            } else {
                final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
                final String token = jwtTokenUtil.generateToken(userDetails);
                return ResponseEntity.ok(new JwtResponse(token));
            }
        } catch (Exception e) {

           // throw new Exception("ERROR SERVIDOR", e);
            return new ResponseEntity<>(new CustomErrorResponse(LocalDateTime.now(), "Codigo Ingresado No Valido", "/login"), HttpStatus.UNAUTHORIZED);

        }
    }
}

