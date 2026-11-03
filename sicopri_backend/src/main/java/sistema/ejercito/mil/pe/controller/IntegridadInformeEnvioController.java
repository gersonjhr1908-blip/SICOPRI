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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import sistema.ejercito.mil.pe.model.table.Expediente;
import sistema.ejercito.mil.pe.model.table.ExpedienteMovimiento;
import sistema.ejercito.mil.pe.model.table.IntegridadInformeEnvio;

import sistema.ejercito.mil.pe.repository.IExpedienteMovimientoRepo;
import sistema.ejercito.mil.pe.repository.IExpedienteRepo;
import sistema.ejercito.mil.pe.repository.IIntegridadInformeEnvioRepo;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/integridad")
@RequiredArgsConstructor
public class IntegridadInformeEnvioController {

    private final IExpedienteRepo expedienteRepo;
    private final IExpedienteMovimientoRepo movimientoRepo;
    private final IIntegridadInformeEnvioRepo informeRepo;

    public record InformeRequest(
            String nombreDocumento,
            String tipoDocumento,
            LocalDate fechaRegistro
    ) {}

    @GetMapping("/{idExpediente}/informes-envio")
    public ResponseEntity<List<IntegridadInformeEnvio>> listar(
            @PathVariable Long idExpediente
    ) {
        buscarIntegridad(idExpediente);

        return ResponseEntity.ok(
                informeRepo
                        .findByIdExpedienteAndActivoOrderByIdInformeAsc(
                                idExpediente,
                                "S"
                        )
        );
    }

    @PostMapping(
            value = "/{idExpediente}/informes-envio",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public ResponseEntity<IntegridadInformeEnvio> guardar(
            @PathVariable Long idExpediente,
            @RequestPart("informe") InformeRequest datos,
            @RequestPart("archivo") MultipartFile archivo
    ) throws IOException {

        Expediente expediente = buscarIntegridad(idExpediente);

        if (!Integer.valueOf(3).equals(expediente.getNivelActual())
                || !Integer.valueOf(4).equals(expediente.getNivelDestino())
                || !Integer.valueOf(2).equals(expediente.getIdEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El informe requiere una denuncia pendiente "
                            + "en Integridad Nivel 3 con destino final Nivel 4."
            );
        }

        if (datos == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los datos del informe son obligatorios."
            );
        }

        String nombre = normalizar(datos.nombreDocumento());
        String tipo = normalizar(datos.tipoDocumento());

        if (nombre.isEmpty() || nombre.length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ingrese un nombre de hasta 150 caracteres."
            );
        }

        if (tipo.isEmpty() || tipo.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ingrese un tipo de documento de hasta 100 caracteres."
            );
        }

        if (datos.fechaRegistro() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Seleccione la fecha del informe."
            );
        }

        String nombreArchivo = validarPdf(archivo);

        Path directorio = directorioInformes(idExpediente);
        Files.createDirectories(directorio);

        Path ruta = directorio
                .resolve(UUID.randomUUID() + ".pdf")
                .normalize();

        registrarLimpiezaSiRollback(ruta);

        try (InputStream contenido = archivo.getInputStream()) {
            Files.copy(contenido, ruta);
        }

        IntegridadInformeEnvio informe = new IntegridadInformeEnvio();

        informe.setIdExpediente(idExpediente);
        informe.setNombreDocumento(nombre);
        informe.setTipoDocumento(tipo);
        informe.setFechaRegistro(datos.fechaRegistro());
        informe.setNombreArchivo(nombreArchivo);
        informe.setRutaArchivo(ruta.toString());
        informe.setTamano(archivo.getSize());
        informe.setUsuarioRegistro(usuarioActual());
        informe.setFechaCreacion(LocalDateTime.now());
        informe.setActivo("S");

        IntegridadInformeEnvio guardado =
                informeRepo.saveAndFlush(informe);

        ExpedienteMovimiento movimiento = new ExpedienteMovimiento();

        movimiento.setIdExpediente(idExpediente);
        movimiento.setNivelOrigen(3);
        movimiento.setNivelDestino(3);
        movimiento.setAccion("INFORME_ENVIO_REGISTRADO");
        movimiento.setObservacion(
                "Informe de envío registrado: " + nombre
        );
        movimiento.setUsuario(usuarioActual());
        movimiento.setFechaMovimiento(LocalDateTime.now());
        movimiento.setActivo("S");

        movimientoRepo.save(movimiento);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guardado);
    }

    @GetMapping(
            value = "/{idExpediente}/informes-envio/{idInforme}/ver",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<Resource> verPdf(
            @PathVariable Long idExpediente,
            @PathVariable Long idInforme
    ) {
        buscarIntegridad(idExpediente);

        IntegridadInformeEnvio informe = informeRepo
                .findByIdInformeAndIdExpedienteAndActivo(
                        idInforme,
                        idExpediente,
                        "S"
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el informe."
                ));

        Path directorio = directorioInformes(idExpediente);

        Path ruta = Path.of(informe.getRutaArchivo())
                .toAbsolutePath()
                .normalize();

        if (!ruta.startsWith(directorio)
                || !Files.isRegularFile(ruta)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No se encontró el PDF del informe."
            );
        }

        String disposicion = ContentDisposition
                .inline()
                .filename(
                        informe.getNombreArchivo(),
                        StandardCharsets.UTF_8
                )
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

    @DeleteMapping("/{idExpediente}/informes-envio/{idInforme}")
    @Transactional
    public ResponseEntity<Void> eliminar(
            @PathVariable Long idExpediente,
            @PathVariable Long idInforme
    ) {
        Expediente expediente = buscarIntegridad(idExpediente);

        if (!Integer.valueOf(3).equals(expediente.getNivelActual())
                || !Integer.valueOf(4).equals(expediente.getNivelDestino())
                || !Integer.valueOf(2).equals(expediente.getIdEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo puede eliminar informes mientras la denuncia "
                            + "esté pendiente en Integridad Nivel 3 "
                            + "con destino final Nivel 4."
            );
        }

        IntegridadInformeEnvio informe = informeRepo
                .findByIdInformeAndIdExpedienteAndActivo(
                        idInforme,
                        idExpediente,
                        "S"
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el informe."
                ));

        informe.setActivo("N");
        informeRepo.save(informe);

        ExpedienteMovimiento movimiento = new ExpedienteMovimiento();

        movimiento.setIdExpediente(idExpediente);
        movimiento.setNivelOrigen(3);
        movimiento.setNivelDestino(3);
        movimiento.setAccion("INFORME_ENVIO_ELIMINADO");
        movimiento.setObservacion(
                "Informe de envío eliminado: "
                        + informe.getNombreDocumento()
        );
        movimiento.setUsuario(usuarioActual());
        movimiento.setFechaMovimiento(LocalDateTime.now());
        movimiento.setActivo("S");

        movimientoRepo.save(movimiento);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{idExpediente}/enviar-nivel-4")
    @Transactional
    public ResponseEntity<Expediente> enviarANivel4(
            @PathVariable Long idExpediente
    ) {
        Expediente expediente = buscarIntegridad(idExpediente);

        if (!Integer.valueOf(3).equals(
                expediente.getNivelActual()
        ) || !Integer.valueOf(4).equals(
                expediente.getNivelDestino()
        ) || !Integer.valueOf(2).equals(
                expediente.getIdEstado()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo puede enviar una denuncia pendiente "
                            + "desde Integridad Nivel 3 "
                            + "con destino final Nivel 4."
            );
        }

        List<IntegridadInformeEnvio> informes = informeRepo
                .findByIdExpedienteAndActivoOrderByIdInformeAsc(
                        idExpediente,
                        "S"
                );

        if (informes.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Primero registre el informe de envío con su PDF."
            );
        }

        Path directorio = directorioInformes(idExpediente);

        boolean existePdf = informes.stream().anyMatch(informe -> {
            String rutaGuardada = informe.getRutaArchivo();

            if (rutaGuardada == null || rutaGuardada.isBlank()) {
                return false;
            }

            Path ruta = Path.of(rutaGuardada)
                    .toAbsolutePath()
                    .normalize();

            return ruta.startsWith(directorio)
                    && Files.isRegularFile(ruta)
                    && Files.isReadable(ruta);
        });

        if (!existePdf) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se encontró un PDF disponible para los informes "
                            + "de envío registrados."
            );
        }

        expediente.setNivelActual(4);
        expediente.setIdEstado(2);

        Expediente guardado = expedienteRepo.save(expediente);

        ExpedienteMovimiento movimiento = new ExpedienteMovimiento();

        movimiento.setIdExpediente(idExpediente);
        movimiento.setNivelOrigen(3);
        movimiento.setNivelDestino(4);
        movimiento.setAccion("ENVIADO");
        movimiento.setObservacion(
                expediente.getObservacionActual()
        );
        movimiento.setUsuario(usuarioActual());
        movimiento.setFechaMovimiento(LocalDateTime.now());
        movimiento.setActivo("S");

        movimientoRepo.save(movimiento);

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

    private String validarPdf(MultipartFile archivo) throws IOException {
        if (archivo == null
                || archivo.isEmpty()
                || archivo.getSize() > 10L * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Adjunte un PDF con contenido de hasta 10 MB."
            );
        }

        String nombre = normalizar(archivo.getOriginalFilename())
                .replace('\\', '/');

        nombre = nombre.substring(nombre.lastIndexOf('/') + 1);

        if (nombre.isEmpty()
                || nombre.length() > 255
                || nombre.chars().anyMatch(Character::isISOControl)
                || !nombre.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El archivo debe tener un nombre válido y extensión PDF."
            );
        }

        byte[] firma;

        try (InputStream contenido = archivo.getInputStream()) {
            firma = contenido.readNBytes(5);
        }

        if (!Arrays.equals(
                firma,
                "%PDF-".getBytes(StandardCharsets.US_ASCII)
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El archivo no contiene una cabecera PDF válida."
            );
        }

        return nombre;
    }

    private Path directorioInformes(Long idExpediente) {
        return Path.of(
                "uploads",
                "integridad",
                idExpediente.toString(),
                "informes-envio"
        ).toAbsolutePath().normalize();
    }

    private void registrarLimpiezaSiRollback(Path ruta) {
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCompletion(int status) {
                        if (status != STATUS_COMMITTED) {
                            try {
                                Files.deleteIfExists(ruta);
                            } catch (IOException error) {
                                org.slf4j.LoggerFactory
                                        .getLogger(IntegridadInformeEnvioController.class)
                                        .error(
                                                "No se pudo limpiar el PDF del informe: {}",
                                                ruta,
                                                error
                                        );
                            }
                        }
                    }
                }
        );
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim();
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