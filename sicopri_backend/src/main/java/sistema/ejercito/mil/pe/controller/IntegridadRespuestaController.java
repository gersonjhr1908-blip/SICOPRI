package sistema.ejercito.mil.pe.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import sistema.ejercito.mil.pe.model.table.Expediente;
import sistema.ejercito.mil.pe.model.table.ExpedienteMovimiento;
import sistema.ejercito.mil.pe.model.table.ExpedienteRespuesta;

import sistema.ejercito.mil.pe.repository.IExpedienteRepo;
import sistema.ejercito.mil.pe.repository.IExpedienteMovimientoRepo;

import sistema.ejercito.mil.pe.service.IExpedienteRespuestaService;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/integridad")
@RequiredArgsConstructor
public class IntegridadRespuestaController {

    private final IExpedienteRepo expedienteRepo;

    private final IExpedienteMovimientoRepo movimientoRepo;

    private final IExpedienteRespuestaService respuestaService;

    @GetMapping("/{idExpediente}/respuestas-nivel3")
    public ResponseEntity<List<ExpedienteRespuesta>> listar(
            @PathVariable Long idExpediente
    ) {
        buscarIntegridad(idExpediente);

        return ResponseEntity.ok(
                respuestasNivel3(idExpediente)
        );
    }

    @PostMapping(
            value = "/{idExpediente}/respuestas-nivel3",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public ResponseEntity<ExpedienteRespuesta> guardar(
            @PathVariable Long idExpediente,
            @RequestPart("respuesta")
            ExpedienteRespuesta datos,
            @RequestPart("archivo")
            MultipartFile archivo
    ) {
        Expediente expediente =
                buscarIntegridad(idExpediente);

        validarAtencionNivel3(expediente);

        if (datos == null) {
            throw new IllegalArgumentException(
                    "Los datos de la respuesta son obligatorios."
            );
        }

        if (datos.getNombreDocumento() == null
                || datos.getNombreDocumento().isBlank()
                || datos.getNombreDocumento().trim().length() > 150) {
            throw new IllegalArgumentException(
                    "Ingrese un nombre de documento de hasta 150 caracteres."
            );
        }

        if (datos.getTipoDocumento() == null
                || datos.getTipoDocumento().isBlank()
                || datos.getTipoDocumento().trim().length() > 100) {
            throw new IllegalArgumentException(
                    "Ingrese un tipo de documento válido."
            );
        }

        if (datos.getDescripcion() == null
                || datos.getDescripcion().isBlank()
                || datos.getDescripcion().length() > 2000) {
            throw new IllegalArgumentException(
                    "La respuesta es obligatoria y admite máximo 2000 caracteres."
            );
        }

        ExpedienteRespuesta respuesta =
                respuestaService.guardarRespuesta(
                        idExpediente,
                        datos,
                        archivo,
                        usuarioActual()
                );

        // Respondido, pero todavía permanece en Nivel 3.
        expediente.setIdEstado(4);
        expedienteRepo.save(expediente);

        registrarMovimiento(
                expediente,
                3,
                3,
                "RESPUESTA_REGISTRADA"
        );

        return ResponseEntity.ok(respuesta);
    }

    @GetMapping(
            value = "/{idExpediente}/respuestas-nivel3/{idRespuesta}/ver",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<Resource> verPdf(
            @PathVariable Long idExpediente,
            @PathVariable Long idRespuesta
    ) {
        buscarIntegridad(idExpediente);

        ExpedienteRespuesta respuesta =
                respuestaService.buscarRespuestaPorId(idRespuesta);

        if (!idExpediente.equals(
                respuesta.getIdExpediente()
        ) || !Integer.valueOf(3).equals(
                respuesta.getNivelOrigen()
        ) || !Integer.valueOf(2).equals(
                respuesta.getNivelDestino()
        )) {
            return ResponseEntity.notFound().build();
        }

        Path ruta = Paths.get(
                respuesta.getRutaArchivo()
        );

        if (!Files.exists(ruta)
                || !Files.isRegularFile(ruta)) {
            return ResponseEntity.notFound().build();
        }

        String nombre = respuesta.getNombreArchivo();

        if (nombre == null || nombre.isBlank()) {
            nombre = "respuesta.pdf";
        }

        String disposicion = ContentDisposition
                .inline()
                .filename(nombre, StandardCharsets.UTF_8)
                .build()
                .toString();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposicion
                )
                .body(new FileSystemResource(ruta));
    }

    @PutMapping("/{idExpediente}/enviar-respuesta-nivel-2")
    @Transactional
    public ResponseEntity<Expediente> enviarAlNivel2(
            @PathVariable Long idExpediente
    ) {
        Expediente expediente =
                buscarIntegridad(idExpediente);

        validarAtencionNivel3(expediente);

        if (!Integer.valueOf(4).equals(
                expediente.getIdEstado()
        ) || respuestasNivel3(idExpediente).isEmpty()) {
            throw new IllegalArgumentException(
                    "Debe guardar una respuesta con su PDF antes de enviar."
            );
        }

        expediente.setNivelActual(2);
        expediente.setIdEstado(4);

        Expediente guardado =
                expedienteRepo.save(expediente);

        registrarMovimiento(
                guardado,
                3,
                2,
                "RESPUESTA_ENVIADA"
        );

        return ResponseEntity.ok(guardado);
    }

    private List<ExpedienteRespuesta> respuestasNivel3(
            Long idExpediente
    ) {
        return respuestaService
                .listarRespuestas(idExpediente)
                .stream()
                .filter(respuesta ->
                        Integer.valueOf(3).equals(
                                respuesta.getNivelOrigen()
                        )
                                && Integer.valueOf(2).equals(
                                respuesta.getNivelDestino()
                        )
                )
                .toList();
    }

    private Expediente buscarIntegridad(
            Long idExpediente
    ) {
        Expediente expediente = expedienteRepo
                .findById(idExpediente)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Expediente no encontrado."
                        )
                );

        if (!"INTEGRIDAD".equalsIgnoreCase(
                expediente.getCategoria()
        ) || !"S".equalsIgnoreCase(
                expediente.getActivo()
        )) {
            throw new IllegalArgumentException(
                    "El expediente no es una denuncia activa de Integridad."
            );
        }

        return expediente;
    }

    private void validarAtencionNivel3(
            Expediente expediente
    ) {
        if (!Integer.valueOf(3).equals(
                expediente.getNivelActual()
        )) {
            throw new IllegalArgumentException(
                    "La denuncia no se encuentra en Integridad Nivel 3."
            );
        }

        if (!Integer.valueOf(3).equals(
                expediente.getNivelDestino()
        )) {
            throw new IllegalArgumentException(
                    "La respuesta de Nivel 3 requiere destino final Nivel 3."
            );
        }

        Integer estado = expediente.getIdEstado();

        if (!Integer.valueOf(2).equals(estado)
                && !Integer.valueOf(3).equals(estado)
                && !Integer.valueOf(4).equals(estado)) {
            throw new IllegalArgumentException(
                    "El estado actual no permite esta acción."
            );
        }
    }

    private void registrarMovimiento(
            Expediente expediente,
            Integer origen,
            Integer destino,
            String accion
    ) {
        ExpedienteMovimiento movimiento =
                new ExpedienteMovimiento();

        movimiento.setIdExpediente(
                expediente.getIdExpediente()
        );

        movimiento.setNivelOrigen(origen);
        movimiento.setNivelDestino(destino);
        movimiento.setAccion(accion);

        movimiento.setObservacion(
                expediente.getObservacionActual()
        );

        movimiento.setUsuario(usuarioActual());
        movimiento.setFechaMovimiento(LocalDateTime.now());
        movimiento.setActivo("S");

        movimientoRepo.save(movimiento);
    }
    @DeleteMapping(
            "/{idExpediente}/respuestas-nivel3/{idRespuesta}"
    )
    @Transactional
    public ResponseEntity<Void> eliminarRespuesta(
            @PathVariable Long idExpediente,
            @PathVariable Long idRespuesta
    ) {
        Expediente expediente =
                buscarIntegridad(idExpediente);

        validarAtencionNivel3(expediente);

        ExpedienteRespuesta respuesta =
                respuestaService.buscarRespuestaPorId(idRespuesta);

        if (!idExpediente.equals(
                respuesta.getIdExpediente()
        ) || !Integer.valueOf(3).equals(
                respuesta.getNivelOrigen()
        ) || !Integer.valueOf(2).equals(
                respuesta.getNivelDestino()
        )) {
            throw new IllegalArgumentException(
                    "La respuesta no corresponde a este caso."
            );
        }

        respuestaService.eliminarRespuesta(idRespuesta);

        // Sin respuestas activas vuelve a quedar pendiente.
        if (respuestasNivel3(idExpediente).isEmpty()) {
            expediente.setIdEstado(2);
            expedienteRepo.save(expediente);
        }

        registrarMovimiento(
                expediente,
                3,
                3,
                "RESPUESTA_ELIMINADA"
        );

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{idExpediente}/archivar")
    @Transactional
    public ResponseEntity<Expediente> archivar(
            @PathVariable Long idExpediente
    ) {
        Expediente expediente =
                buscarIntegridad(idExpediente);

        if (!Integer.valueOf(2).equals(
                expediente.getNivelActual()
        ) || !Integer.valueOf(4).equals(
                expediente.getIdEstado()
        )) {
            throw new IllegalArgumentException(
                    "Solo puede archivar denuncias concluidas "
                            + "que se encuentren en Integridad Nivel 2."
            );
        }

        expediente.setIdEstado(5);

        Expediente guardado =
                expedienteRepo.save(expediente);

        registrarMovimiento(
                guardado,
                2,
                2,
                "ARCHIVADO"
        );

        return ResponseEntity.ok(guardado);
    }

    @DeleteMapping("/{idExpediente}/archivado")
    @Transactional
    public ResponseEntity<Void> eliminarArchivado(
            @PathVariable Long idExpediente
    ) {
        Expediente expediente =
                buscarIntegridad(idExpediente);

        if (!Integer.valueOf(2).equals(
                expediente.getNivelActual()
        ) || !Integer.valueOf(5).equals(
                expediente.getIdEstado()
        )) {
            throw new IllegalArgumentException(
                    "Solo puede eliminar denuncias archivadas "
                            + "que se encuentren en Integridad Nivel 2."
            );
        }

        registrarMovimiento(
                expediente,
                2,
                2,
                "ELIMINADO"
        );

        expediente.setActivo("N");
        expedienteRepo.save(expediente);

        return ResponseEntity.noContent().build();
    }

    private String usuarioActual() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }
}