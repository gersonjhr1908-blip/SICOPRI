package sistema.ejercito.mil.pe.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import sistema.ejercito.mil.pe.dto.IntegridadDetalleDTO;
import sistema.ejercito.mil.pe.dto.IntegridadListadoDTO;

import sistema.ejercito.mil.pe.model.table.Expediente;
import sistema.ejercito.mil.pe.model.table.DatosPersona;

import sistema.ejercito.mil.pe.service.IIntegridadService;
import java.util.Map;

import java.util.List;


@RestController
@RequestMapping("/integridad")
@RequiredArgsConstructor
public class IntegridadController {


    // ==========================================
    // SERVICE
    // ==========================================

    private final IIntegridadService
            integridadService;


    // ==========================================
    // REGISTRAR
    //
    // POST /integridad
    // ==========================================

    @PostMapping(
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public ResponseEntity<Expediente> registrar(

            @RequestPart("expediente")
            Expediente expediente,

            @RequestParam(
                    value = "tipoDocumento",
                    required = false
            )
            String tipoDocumento,

            @RequestParam(
                    value = "dni",
                    required = false
            )
            String dni,

            @RequestParam(
                    value = "correo",
                    required = false
            )
            String correo,

            @RequestParam(
                    value = "telefono",
                    required = false
            )
            String telefono,

            @RequestParam(
                    value = "fechaActoCorrupcion",
                    required = false
            )
            String fechaActoCorrupcion,

            @RequestParam(
                    value = "motivoDenuncia",
                    required = false
            )
            String motivoDenuncia,

            @RequestParam(
                    value = "medidaProteccion",
                    required = false
            )
            String medidaProteccion,

            @RequestParam(
                    value = "identificacion",
                    required = false
            )
            String identificacion,

            @RequestParam(
                    value = "sexo",
                    required = false
            )
            String sexo,

            @RequestParam(
                    value = "detalle",
                    required = false
            )
            String detalle,

            @RequestParam(
                    value = "detalleOtros",
                    required = false
            )
            String detalleOtros,

            @RequestPart(
                    value = "archivos",
                    required = false
            )
            List<MultipartFile> archivos

    ) {


        if (
                archivos != null &&
                        archivos.size() > 5
        ) {

            throw new IllegalArgumentException(
                    "Solo se permiten máximo 5 archivos PDF."
            );

        }


        String username =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();


        expediente.setUsuarioRegistro(
                username
        );


        Expediente guardado =
                integridadService
                        .guardarDenuncia(

                                expediente,

                                tipoDocumento,

                                dni,

                                correo,

                                telefono,

                                fechaActoCorrupcion,

                                motivoDenuncia,

                                medidaProteccion,

                                identificacion,

                                sexo,

                                detalle,

                                detalleOtros,

                                archivos

                        );


        return ResponseEntity.ok(
                guardado
        );

    }


    // ==========================================
    // LISTAR REGISTRADOS
    //
    // GET /integridad/registrados
    // ==========================================

    @GetMapping("/registrados")
    public ResponseEntity<List<IntegridadListadoDTO>>
    listarRegistrados() {

        return ResponseEntity.ok(
                integridadService
                        .listarRegistrados()
        );

    }


    // ==========================================
    // OBTENER DETALLE
    //
    // GET /integridad/{idExpediente}
    // ==========================================

    @GetMapping("/{idExpediente}")
    public ResponseEntity<IntegridadDetalleDTO>
    obtenerDetalle(

            @PathVariable
            Long idExpediente

    ) {

        return ResponseEntity.ok(
                integridadService
                        .obtenerDetalle(
                                idExpediente
                        )
        );

    }


    // ==========================================
    // EDITAR DENUNCIA
    //
    // PUT /integridad/{idExpediente}
    // ==========================================

    @PutMapping(
            value = "/{idExpediente}",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public ResponseEntity<Expediente>
    actualizarDenuncia(

            @PathVariable
            Long idExpediente,

            @RequestParam(
                    value = "nroDocumento",
                    required = false
            )
            String nroDocumento,

            @RequestParam(
                    value = "tipoDocumento",
                    required = false
            )
            String tipoDocumento,

            @RequestParam(
                    value = "dni",
                    required = false
            )
            String dni,

            @RequestParam(
                    value = "correo",
                    required = false
            )
            String correo,

            @RequestParam(
                    value = "telefono",
                    required = false
            )
            String telefono,

            @RequestParam(
                    value = "fechaActoCorrupcion",
                    required = false
            )
            String fechaActoCorrupcion,

            @RequestParam(
                    value = "motivoDenuncia",
                    required = false
            )
            String motivoDenuncia,

            @RequestParam(
                    value = "medidaProteccion",
                    required = false
            )
            String medidaProteccion,

            @RequestParam(
                    value = "identificacion",
                    required = false
            )
            String identificacion,

            @RequestParam(
                    value = "sexo",
                    required = false
            )
            String sexo,

            @RequestParam(
                    value = "detalle",
                    required = false
            )
            String detalle,

            @RequestParam(
                    value = "detalleOtros",
                    required = false
            )
            String detalleOtros,

            @RequestParam(value = "situacion", required = false)
            String situacion

    ) {


        Expediente actualizado =
                integridadService
                        .actualizarDenuncia(

                                idExpediente,

                                nroDocumento,

                                tipoDocumento,

                                dni,

                                correo,

                                telefono,

                                fechaActoCorrupcion,

                                motivoDenuncia,

                                medidaProteccion,

                                identificacion,

                                sexo,

                                detalle,

                                detalleOtros

                        );
        if (situacion != null) {
            String valor = situacion.trim();

            if (valor.length() > 80) {
                throw new IllegalArgumentException(
                        "La situación de la persona admite máximo 80 caracteres."
                );
            }

            DatosPersona persona = actualizado.getDatosPersona();

            if (persona == null && !valor.isEmpty()) {
                persona = new DatosPersona();
                actualizado.setDatosPersona(persona);
            }

            if (persona != null) {
                persona.setSituacion(valor.isEmpty() ? null : valor);
            }
        }

        return ResponseEntity.ok(
                actualizado
        );

    }


    // ==========================================
    // ELIMINACIÓN LÓGICA
    //
    // DELETE /integridad/{idExpediente}
    //
    // ACTIVO = N
    // ==========================================

    @DeleteMapping("/{idExpediente}")
    @Transactional
    public ResponseEntity<Void>
    eliminarDenuncia(

            @PathVariable
            Long idExpediente

    ) {


        integridadService
                .eliminarDenuncia(
                        idExpediente
                );


        return ResponseEntity
                .noContent()
                .build();

    }
    @PutMapping("/{idExpediente}/enviar-nivel-3")
    @Transactional
    public ResponseEntity<Expediente> enviarANivel3(
            @PathVariable Long idExpediente
    ) {
        String usuario = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return ResponseEntity.ok(
                integridadService.enviarANivel3(
                        idExpediente,
                        usuario
                )
        );
    }
    @PutMapping("/{idExpediente}/devolver-desde-nivel-3")
    @Transactional
    public ResponseEntity<Expediente> devolverDesdeNivel3(
            @PathVariable Long idExpediente,
            @RequestBody Map<String, String> body
    ) {
        String usuario = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return ResponseEntity.ok(
                integridadService.devolverDesdeNivel3(
                        idExpediente,
                        body.get("observacion"),
                        usuario
                )
        );
    }

}