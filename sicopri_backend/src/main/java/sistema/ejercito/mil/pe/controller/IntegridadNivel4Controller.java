package sistema.ejercito.mil.pe.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import sistema.ejercito.mil.pe.model.table.Expediente;
import sistema.ejercito.mil.pe.model.table.ExpedienteMovimiento;
import sistema.ejercito.mil.pe.model.table.ExpedienteRespuesta;

import sistema.ejercito.mil.pe.repository.IExpedienteRepo;
import sistema.ejercito.mil.pe.repository.IExpedienteMovimientoRepo;

import sistema.ejercito.mil.pe.service.IExpedienteRespuestaService;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/integridad")
@RequiredArgsConstructor
public class IntegridadNivel4Controller {

    private final IExpedienteRepo expedienteRepo;
    private final IExpedienteMovimientoRepo movimientoRepo;
    private final IExpedienteRespuestaService respuestaService;

    @GetMapping("/{idExpediente}/respuestas-nivel4")
    public ResponseEntity<List<ExpedienteRespuesta>> listar(
            @PathVariable Long idExpediente
    ) {
        buscarIntegridad(idExpediente);

        return ResponseEntity.ok(
                respuestasNivel4(idExpediente)
        );
    }

    @PostMapping(
            value = "/{idExpediente}/respuestas-nivel4",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public ResponseEntity<ExpedienteRespuesta> guardar(
            @PathVariable Long idExpediente,
            @RequestPart("respuesta") ExpedienteRespuesta datos,
            @RequestPart("archivo") MultipartFile archivo
    ) {
        Expediente expediente = buscarIntegridad(idExpediente);

        validarAtencionNivel4(expediente);
        validarDatosRespuesta(datos);

        ExpedienteRespuesta respuesta =
                respuestaService.guardarRespuesta(
                        idExpediente,
                        datos,
                        archivo,
                        usuarioActual()
                );

        expediente.setIdEstado(4);
        expedienteRepo.save(expediente);

        registrarMovimiento(
                expediente,
                4,
                4,
                "RESPUESTA_REGISTRADA",
                expediente.getObservacionActual()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(respuesta);
    }

    @GetMapping(
            value = "/{idExpediente}/respuestas-nivel4/{idRespuesta}/ver",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<Resource> verPdf(
            @PathVariable Long idExpediente,
            @PathVariable Long idRespuesta
    ) {
        buscarIntegridad(idExpediente);

        ExpedienteRespuesta respuesta =
                buscarRespuestaDelCaso(idExpediente, idRespuesta);

        if (respuesta.getRutaArchivo() == null
                || respuesta.getRutaArchivo().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No se encontró el PDF de la respuesta."
            );
        }

        Path ruta = Path.of(respuesta.getRutaArchivo())
                .toAbsolutePath()
                .normalize();

        if (!Files.isRegularFile(ruta)
                || !Files.isReadable(ruta)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No se encontró el PDF de la respuesta."
            );
        }

        String nombre = respuesta.getNombreArchivo();

        if (nombre == null || nombre.isBlank()) {
            nombre = "respuesta.pdf";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(
                                        nombre,
                                        StandardCharsets.UTF_8
                                )
                                .build()
                                .toString()
                )
                .body(new FileSystemResource(ruta));
    }

    @DeleteMapping(
            "/{idExpediente}/respuestas-nivel4/{idRespuesta}"
    )
    @Transactional
    public ResponseEntity<Void> eliminar(
            @PathVariable Long idExpediente,
            @PathVariable Long idRespuesta
    ) {
        Expediente expediente = buscarIntegridad(idExpediente);

        validarAtencionNivel4(expediente);
        buscarRespuestaDelCaso(idExpediente, idRespuesta);

        respuestaService.eliminarRespuesta(idRespuesta);

        if (respuestasNivel4(idExpediente).isEmpty()) {
            expediente.setIdEstado(2);
            expedienteRepo.save(expediente);
        }

        registrarMovimiento(
                expediente,
                4,
                4,
                "RESPUESTA_ELIMINADA",
                expediente.getObservacionActual()
        );

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{idExpediente}/enviar-respuesta-desde-nivel-4")
    @Transactional
    public ResponseEntity<Expediente> enviarRespuesta(
            @PathVariable Long idExpediente
    ) {
        Expediente expediente = buscarIntegridad(idExpediente);

        validarAtencionNivel4(expediente);

        if (!Integer.valueOf(4).equals(expediente.getIdEstado())
                || respuestasNivel4(idExpediente).isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Primero registre una respuesta con su PDF."
            );
        }

        expediente.setNivelActual(3);
        expediente.setIdEstado(4);

        Expediente guardado = expedienteRepo.save(expediente);

        registrarMovimiento(
                guardado,
                4,
                3,
                "RESPUESTA_ENVIADA",
                guardado.getObservacionActual()
        );

        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{idExpediente}/devolver-desde-nivel-4")
    @Transactional
    public ResponseEntity<Expediente> devolver(
            @PathVariable Long idExpediente,
            @RequestBody Map<String, String> datos
    ) {
        Expediente expediente = buscarIntegridad(idExpediente);

        validarAtencionNivel4(expediente);

        if (!respuestasNivel4(idExpediente).isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El caso ya tiene una respuesta. "
                            + "Utilice Enviar respuesta a Integridad Nivel 3."
            );
        }

        String observacion = datos.get("observacion");

        observacion = observacion == null
                ? ""
                : observacion.trim();

        if (observacion.isEmpty() || observacion.length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Indique el motivo de devolución "
                            + "con un máximo de 2000 caracteres."
            );
        }

        expediente.setObservacionActual(observacion);
        expediente.setNivelActual(3);
        expediente.setIdEstado(3);

        Expediente guardado = expedienteRepo.save(expediente);

        registrarMovimiento(
                guardado,
                4,
                3,
                "OBSERVADO",
                observacion
        );

        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{idExpediente}/remitir-respuesta-nivel-2")
    @Transactional
    public ResponseEntity<Expediente> remitirRespuestaAlNivel2(
            @PathVariable Long idExpediente
    ) {
        Expediente expediente = buscarIntegridad(idExpediente);

        if (!Integer.valueOf(3).equals(expediente.getNivelActual())
                || !Integer.valueOf(4).equals(expediente.getNivelDestino())
                || !Integer.valueOf(4).equals(expediente.getIdEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La denuncia debe estar concluida en Integridad Nivel 3 "
                            + "con destino final Nivel 4."
            );
        }

        if (respuestasNivel4(idExpediente).isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No existe una respuesta activa de Integridad Nivel 4."
            );
        }

        expediente.setNivelActual(2);
        expediente.setIdEstado(4);

        Expediente guardado = expedienteRepo.save(expediente);

        registrarMovimiento(
                guardado,
                3,
                2,
                "RESPUESTA_NIVEL4_REMITIDA",
                guardado.getObservacionActual()
        );

        return ResponseEntity.ok(guardado);
    }

    private Expediente buscarIntegridad(Long idExpediente) {
        Expediente expediente = expedienteRepo
                .findById(idExpediente)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Expediente no encontrado."
                ));

        if (!"INTEGRIDAD".equalsIgnoreCase(expediente.getCategoria())
                || !"S".equalsIgnoreCase(expediente.getActivo())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El expediente no es una denuncia activa de Integridad."
            );
        }

        return expediente;
    }

    private void validarAtencionNivel4(Expediente expediente) {
        if (!Integer.valueOf(4).equals(expediente.getNivelActual())
                || !Integer.valueOf(4).equals(expediente.getNivelDestino())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La denuncia debe estar en Integridad Nivel 4 "
                            + "y tener destino final Nivel 4."
            );
        }

        Integer estado = expediente.getIdEstado();

        if (!Integer.valueOf(2).equals(estado)
                && !Integer.valueOf(4).equals(estado)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estado actual no permite esta acción."
            );
        }
    }

    private void validarDatosRespuesta(ExpedienteRespuesta datos) {
        if (datos == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los datos de la respuesta son obligatorios."
            );
        }

        String nombre = datos.getNombreDocumento();
        String tipo = datos.getTipoDocumento();
        String descripcion = datos.getDescripcion();

        if (nombre == null
                || nombre.isBlank()
                || nombre.trim().length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ingrese un nombre de hasta 150 caracteres."
            );
        }

        if (tipo == null
                || tipo.isBlank()
                || tipo.trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ingrese un tipo de documento de hasta 100 caracteres."
            );
        }

        if (descripcion == null
                || descripcion.isBlank()
                || descripcion.length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ingrese una respuesta de hasta 2000 caracteres."
            );
        }

        if (datos.getFechaDocumento() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Seleccione la fecha del documento."
            );
        }

        datos.setNombreDocumento(nombre.trim());
        datos.setTipoDocumento(tipo.trim());
        datos.setDescripcion(descripcion.trim());
    }

    private List<ExpedienteRespuesta> respuestasNivel4(
            Long idExpediente
    ) {
        return respuestaService.listarRespuestas(idExpediente)
                .stream()
                .filter(respuesta ->
                        Integer.valueOf(4).equals(
                                respuesta.getNivelOrigen()
                        )
                                && Integer.valueOf(3).equals(
                                respuesta.getNivelDestino()
                        )
                )
                .toList();
    }

    private ExpedienteRespuesta buscarRespuestaDelCaso(
            Long idExpediente,
            Long idRespuesta
    ) {
        return respuestasNivel4(idExpediente)
                .stream()
                .filter(respuesta ->
                        idRespuesta.equals(respuesta.getIdRespuesta())
                )
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La respuesta no pertenece a este caso "
                                + "o ya fue eliminada."
                ));
    }

    private void registrarMovimiento(
            Expediente expediente,
            Integer origen,
            Integer destino,
            String accion,
            String observacion
    ) {
        ExpedienteMovimiento movimiento = new ExpedienteMovimiento();

        movimiento.setIdExpediente(expediente.getIdExpediente());
        movimiento.setNivelOrigen(origen);
        movimiento.setNivelDestino(destino);
        movimiento.setAccion(accion);
        movimiento.setObservacion(observacion);
        movimiento.setUsuario(usuarioActual());
        movimiento.setFechaMovimiento(LocalDateTime.now());
        movimiento.setActivo("S");

        movimientoRepo.save(movimiento);
    }

    private String usuarioActual() {
        Authentication autenticacion = SecurityContextHolder
                .getContext()
                .getAuthentication();

        return autenticacion == null
                ? "LOCAL"
                : autenticacion.getName();
    }
}