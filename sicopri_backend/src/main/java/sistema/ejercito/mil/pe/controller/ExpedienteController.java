package sistema.ejercito.mil.pe.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import sistema.ejercito.mil.pe.model.table.Expediente;
import sistema.ejercito.mil.pe.model.table.ExpedienteArchivo;
import sistema.ejercito.mil.pe.model.table.ExpedienteMovimiento;
import sistema.ejercito.mil.pe.model.table.ExpedienteRespuesta;
import sistema.ejercito.mil.pe.model.table.ExpedienteSeguimiento;

import sistema.ejercito.mil.pe.service.IExpedienteArchivoService;
import sistema.ejercito.mil.pe.service.IExpedienteRespuestaService;
import sistema.ejercito.mil.pe.service.IExpedienteService;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/expedientes")
@RequiredArgsConstructor
public class ExpedienteController {

    private final IExpedienteService service;
    private final IExpedienteArchivoService archivoService;
    private final IExpedienteRespuestaService respuestaService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<Expediente> registrar(
            @RequestPart("expediente") Expediente expediente,
            @RequestPart(value = "archivos", required = false)
            List<MultipartFile> archivos
    ) {
        if (archivos != null && archivos.size() > 5) {
            throw new IllegalArgumentException(
                    "Solo se permiten máximo 5 archivos PDF."
            );
        }

        expediente.setFechaRegistro(LocalDateTime.now());
        expediente.setActivo("S");

        if (expediente.getIdEstado() == null) {
            expediente.setIdEstado(1);
        }

        Integer nivelCreacion = expediente.getNivelCreacion();

        if (nivelCreacion == null) {
            nivelCreacion = 2;
        }

        if (nivelCreacion != 2 &&
                nivelCreacion != 3 &&
                nivelCreacion != 4) {
            throw new IllegalArgumentException(
                    "Nivel de creación QRD inválido."
            );
        }

        expediente.setNivelCreacion(nivelCreacion);
        expediente.setNivelActual(nivelCreacion);
        expediente.setUsuarioRegistro(obtenerUsuarioActual());

        Expediente guardado =
                service.guardarExpediente(expediente);

        if (archivos != null && !archivos.isEmpty()) {
            archivoService.guardarArchivos(
                    guardado.getIdExpediente(),
                    guardado.getCinv(),
                    archivos
            );
        }

        return ResponseEntity.ok(guardado);
    }

    @GetMapping
    public ResponseEntity<List<Expediente>> listar() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{idExpediente}")
    @Transactional
    public ResponseEntity<Expediente> actualizar(
            @PathVariable Long idExpediente,
            @RequestBody Expediente expediente
    ) {
        return ResponseEntity.ok(
                service.actualizarExpediente(
                        idExpediente,
                        expediente
                )
        );
    }

    @PutMapping("/{idExpediente}/destino")
    @Transactional
    public ResponseEntity<Expediente> actualizarDestino(
            @PathVariable Long idExpediente,
            @RequestBody Expediente expediente
    ) {
        return ResponseEntity.ok(
                service.actualizarDestino(
                        idExpediente,
                        expediente.getNivelDestino()
                )
        );
    }

    @PutMapping("/{idExpediente}/observacion")
    @Transactional
    public ResponseEntity<Expediente> actualizarObservacion(
            @PathVariable Long idExpediente,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(
                service.actualizarObservacion(
                        idExpediente,
                        body.getOrDefault("observacion", "")
                )
        );
    }

    @DeleteMapping("/{idExpediente}")
    @Transactional
    public ResponseEntity<Void> eliminar(
            @PathVariable Long idExpediente
    ) {
        service.eliminarExpediente(idExpediente);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{idExpediente}/enviar-nivel-2")
    @Transactional
    public ResponseEntity<Expediente> enviarANivel2(
            @PathVariable Long idExpediente
    ) {
        return ResponseEntity.ok(
                service.enviarANivel2(
                        idExpediente,
                        obtenerUsuarioActual()
                )
        );
    }

    @PutMapping("/{idExpediente}/enviar-nivel-3")
    @Transactional
    public ResponseEntity<Expediente> enviarANivel3(
            @PathVariable Long idExpediente
    ) {
        return ResponseEntity.ok(
                service.enviarANivel3(
                        idExpediente,
                        obtenerUsuarioActual()
                )
        );
    }

    @PutMapping("/{idExpediente}/enviar-nivel-4")
    @Transactional
    public ResponseEntity<Expediente> enviarANivel4(
            @PathVariable Long idExpediente
    ) {
        return ResponseEntity.ok(
                service.enviarANivel4(
                        idExpediente,
                        obtenerUsuarioActual()
                )
        );
    }

    @GetMapping("/{idExpediente}/movimientos")
    public ResponseEntity<List<ExpedienteMovimiento>>
    listarMovimientos(
            @PathVariable Long idExpediente
    ) {
        return ResponseEntity.ok(
                service.listarMovimientos(idExpediente)
        );
    }

    @PostMapping("/{idExpediente}/seguimiento")
    @Transactional
    public ResponseEntity<ExpedienteSeguimiento>
    guardarSeguimiento(
            @PathVariable Long idExpediente,
            @RequestBody Map<String, String> body
    ) {
        LocalDate fechaInicio =
                LocalDate.parse(body.get("fechaInicio"));

        LocalDate fechaFin =
                LocalDate.parse(body.get("fechaFin"));

        return ResponseEntity.ok(
                service.guardarSeguimiento(
                        idExpediente,
                        fechaInicio,
                        fechaFin,
                        obtenerUsuarioActual()
                )
        );
    }

    @GetMapping("/{idExpediente}/seguimiento")
    public ResponseEntity<ExpedienteSeguimiento>
    obtenerSeguimiento(
            @PathVariable Long idExpediente
    ) {
        ExpedienteSeguimiento seguimiento =
                service.obtenerSeguimiento(idExpediente);

        if (seguimiento == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(seguimiento);
    }

    @PutMapping("/{idExpediente}/seguimiento")
    @Transactional
    public ResponseEntity<ExpedienteSeguimiento>
    actualizarSeguimiento(
            @PathVariable Long idExpediente,
            @RequestBody Map<String, String> body
    ) {
        LocalDate fechaInicio =
                LocalDate.parse(body.get("fechaInicio"));

        LocalDate fechaFin =
                LocalDate.parse(body.get("fechaFin"));

        return ResponseEntity.ok(
                service.actualizarSeguimiento(
                        idExpediente,
                        fechaInicio,
                        fechaFin,
                        obtenerUsuarioActual()
                )
        );
    }

    @GetMapping("/{idExpediente}/archivos")
    public ResponseEntity<List<ExpedienteArchivo>>
    listarArchivos(
            @PathVariable Long idExpediente
    ) {
        return ResponseEntity.ok(
                archivoService.listarArchivos(idExpediente)
        );
    }

    @PostMapping(
            value = "/{idExpediente}/archivos",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public ResponseEntity<List<ExpedienteArchivo>>
    agregarArchivos(
            @PathVariable Long idExpediente,
            @RequestParam("cinv") String cinv,
            @RequestPart("archivos")
            List<MultipartFile> archivos
    ) {
        if (archivos == null || archivos.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debe seleccionar al menos un archivo PDF."
            );
        }

        return ResponseEntity.ok(
                archivoService.guardarArchivos(
                        idExpediente,
                        cinv,
                        archivos
                )
        );
    }

    @DeleteMapping("/archivos/{idArchivo}")
    @Transactional
    public ResponseEntity<Void> eliminarArchivo(
            @PathVariable Long idArchivo
    ) {
        archivoService.eliminarArchivo(idArchivo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(
            value = "/archivos/{idArchivo}/ver",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<Resource> verArchivo(
            @PathVariable Long idArchivo
    ) {
        ExpedienteArchivo archivo =
                archivoService.buscarArchivoPorId(idArchivo);

        Path ruta =
                Paths.get(archivo.getRutaArchivo());

        if (!Files.exists(ruta) ||
                !Files.isRegularFile(ruta)) {
            return ResponseEntity.notFound().build();
        }

        Resource recurso =
                new FileSystemResource(ruta);

        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" +
                                nombreSeguro(
                                        archivo.getNombreArchivo()
                                ) +
                                "\""
                )
                .body(recurso);
    }

    @PostMapping(
            value = "/{idExpediente}/respuestas",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public ResponseEntity<ExpedienteRespuesta>
    guardarRespuesta(
            @PathVariable Long idExpediente,
            @RequestPart("respuesta")
            ExpedienteRespuesta respuesta,
            @RequestPart("archivo")
            MultipartFile archivo
    ) {
        return ResponseEntity.ok(
                respuestaService.guardarRespuesta(
                        idExpediente,
                        respuesta,
                        archivo,
                        obtenerUsuarioActual()
                )
        );
    }

    @GetMapping("/{idExpediente}/respuestas")
    public ResponseEntity<List<ExpedienteRespuesta>>
    listarRespuestas(
            @PathVariable Long idExpediente
    ) {
        return ResponseEntity.ok(
                respuestaService.listarRespuestas(idExpediente)
        );
    }

    @GetMapping(
            value = "/respuestas/{idRespuesta}/ver",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<Resource> verPdfRespuesta(
            @PathVariable Long idRespuesta
    ) {
        ExpedienteRespuesta respuesta =
                respuestaService.buscarRespuestaPorId(
                        idRespuesta
                );

        Path ruta =
                Paths.get(respuesta.getRutaArchivo());

        if (!Files.exists(ruta) ||
                !Files.isRegularFile(ruta)) {
            return ResponseEntity.notFound().build();
        }

        Resource recurso =
                new FileSystemResource(ruta);

        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" +
                                nombreSeguro(
                                        respuesta.getNombreArchivo()
                                ) +
                                "\""
                )
                .body(recurso);
    }

    @DeleteMapping("/respuestas/{idRespuesta}")
    @Transactional
    public ResponseEntity<Void> eliminarRespuesta(
            @PathVariable Long idRespuesta
    ) {
        respuestaService.eliminarRespuesta(idRespuesta);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{idExpediente}/enviar-respuesta-nivel-3")
    @Transactional
    public ResponseEntity<Expediente>
    enviarRespuestaANivel3(
            @PathVariable Long idExpediente
    ) {
        return ResponseEntity.ok(
                service.enviarRespuestaANivel3(
                        idExpediente,
                        obtenerUsuarioActual()
                )
        );
    }

    @PutMapping("/{idExpediente}/devolver-nivel-3")
    @Transactional
    public ResponseEntity<Expediente>
    devolverDesdeNivel4ANivel3(
            @PathVariable Long idExpediente,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(
                service.devolverDesdeNivel4ANivel3(
                        idExpediente,
                        body.get("observacion"),
                        obtenerUsuarioActual()
                )
        );
    }

    @PutMapping("/{idExpediente}/enviar-respuesta-nivel-2")
    @Transactional
    public ResponseEntity<Expediente>
    enviarRespuestaANivel2(
            @PathVariable Long idExpediente
    ) {
        return ResponseEntity.ok(
                service.enviarRespuestaANivel2(
                        idExpediente,
                        obtenerUsuarioActual()
                )
        );
    }

    private String nombreSeguro(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            return "documento.pdf";
        }

        return Normalizer
                .normalize(nombre, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^\\x20-\\x7E]", "_");
    }




    @PutMapping("/{idExpediente}/archivar")
    @Transactional
    public ResponseEntity<Expediente> archivarExpediente(
            @PathVariable Long idExpediente
    ) {
        Expediente archivado =
                service.archivarExpediente(
                        idExpediente,
                        obtenerUsuarioActual()
                );

        return ResponseEntity.ok(archivado);
    }

    @PutMapping("/{idExpediente}/devolver-desde-nivel-3")
    @Transactional
    public ResponseEntity<Expediente> devolverDesdeNivel3(
            @PathVariable Long idExpediente,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(
                service.devolverDesdeNivel3(
                        idExpediente,
                        body.get("observacion"),
                        obtenerUsuarioActual()
                )
        );
    }

    private String obtenerUsuarioActual() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }
}