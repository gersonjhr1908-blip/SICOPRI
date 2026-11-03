package sistema.ejercito.mil.pe.service.impl;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import sistema.ejercito.mil.pe.model.table.ExpedienteArchivo;
import sistema.ejercito.mil.pe.repository.IExpedienteArchivoRepo;
import sistema.ejercito.mil.pe.repository.IExpedienteRepo;
import sistema.ejercito.mil.pe.service.IExpedienteArchivoService;

import java.io.IOException;
import java.io.InputStream;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpedienteArchivoServiceImpl
        implements IExpedienteArchivoService {

    private final IExpedienteArchivoRepo repo;

    private final IExpedienteRepo expedienteRepo;

    private static final int MAX_ARCHIVOS = 5;

    private static final long MAX_TAMANIO =
            10L * 1024L * 1024L;

    // =========================================
    // GUARDAR ARCHIVOS
    // =========================================

    @Override
    public List<ExpedienteArchivo> guardarArchivos(
            Long idExpediente,
            String cinv,
            List<MultipartFile> archivos
    ) {
        if (archivos == null || archivos.isEmpty()) {
            return List.of();
        }

        if (cinv == null || cinv.isBlank()) {
            throw new IllegalArgumentException(
                    "El CINV del expediente es obligatorio."
            );
        }

        // La categoría se consulta en la base.
        // Solo Integridad puede adjuntar ZIP.
        boolean esIntegridad = expedienteRepo
                .findById(idExpediente)
                .map(expediente ->
                        "INTEGRIDAD".equalsIgnoreCase(
                                expediente.getCategoria()
                        )
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No se encontró el expediente."
                        )
                );

        Long cantidadActual =
                repo.contarPorExpediente(idExpediente);

        if (cantidadActual == null) {
            cantidadActual = 0L;
        }

        if (cantidadActual + archivos.size() > MAX_ARCHIVOS) {
            throw new IllegalArgumentException(
                    esIntegridad
                            ? "El expediente solo puede tener máximo 5 archivos, entre PDF y ZIP."
                            : "El expediente solo puede tener máximo 5 archivos PDF."
            );
        }

        // Validación previa de los adjuntos de Integridad.
        // Evita copiar el primero si otro archivo del lote
        // tiene una extensión o contenido no permitido.
        List<String> extensionesIntegridad =
                new ArrayList<>();

        if (esIntegridad) {
            for (MultipartFile archivo : archivos) {
                extensionesIntegridad.add(
                        validarArchivoIntegridad(archivo)
                );
            }
        }

        Path carpeta = Paths.get(
                "uploads",
                "expedientes",
                cinv
        );

        try {
            Files.createDirectories(carpeta);
        } catch (IOException e) {
            throw new RuntimeException(
                    "No se pudo crear la carpeta del expediente.",
                    e
            );
        }

        List<ExpedienteArchivo> guardados =
                new ArrayList<>();

        for (int i = 0; i < archivos.size(); i++) {
            MultipartFile archivo = archivos.get(i);

            String extension;

            if (esIntegridad) {
                extension = extensionesIntegridad.get(i);
            } else {
                // Conserva la validación existente de QRD.
                validarArchivo(archivo);
                extension = ".pdf";
            }

            String nombreOriginal =
                    archivo.getOriginalFilename();

            String nombreGuardado =
                    UUID.randomUUID() + extension;

            Path destino =
                    carpeta.resolve(nombreGuardado);

            try (InputStream entrada =
                         archivo.getInputStream()) {

                Files.copy(
                        entrada,
                        destino,
                        StandardCopyOption.REPLACE_EXISTING
                );

            } catch (IOException e) {
                throw new RuntimeException(
                        "Error al guardar el archivo: "
                                + nombreOriginal,
                        e
                );
            }

            ExpedienteArchivo registro =
                    new ExpedienteArchivo();

            registro.setIdExpediente(idExpediente);

            registro.setNombreArchivo(nombreOriginal);

            registro.setNombreGuardado(nombreGuardado);

            if (esIntegridad) {
                registro.setTipoArchivo(
                        ".zip".equals(extension)
                                ? "application/zip"
                                : "application/pdf"
                );
            } else {
                // Conserva el valor utilizado por QRD.
                registro.setTipoArchivo(
                        archivo.getContentType()
                );
            }

            registro.setTamano(
                    archivo.getSize()
            );

            registro.setRutaArchivo(
                    destino.toAbsolutePath().toString()
            );

            registro.setFechaRegistro(
                    LocalDateTime.now()
            );

            registro.setActivo("S");

            ExpedienteArchivo guardado =
                    repo.save(registro);

            guardados.add(guardado);
        }

        return guardados;
    }

    // =========================================
    // LISTAR ARCHIVOS ACTIVOS
    // =========================================

    @Override
    public List<ExpedienteArchivo> listarArchivos(
            Long idExpediente
    ) {
        return repo.listarPorExpediente(
                idExpediente
        );
    }

    // =========================================
    // BUSCAR ARCHIVO ACTIVO
    // =========================================

    @Override
    public ExpedienteArchivo buscarArchivoPorId(
            Long idArchivo
    ) {
        ExpedienteArchivo archivo = repo
                .findById(idArchivo)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Archivo no encontrado."
                        )
                );

        if (
                archivo.getActivo() == null
                        || !"S".equalsIgnoreCase(
                        archivo.getActivo()
                )
        ) {
            throw new RuntimeException(
                    "El archivo no está disponible."
            );
        }

        return archivo;
    }

    // =========================================
    // ELIMINACIÓN LÓGICA
    // =========================================

    @Override
    public void eliminarArchivo(
            Long idArchivo
    ) {
        ExpedienteArchivo archivo = repo
                .findById(idArchivo)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Archivo no encontrado."
                        )
                );

        if (
                archivo.getActivo() == null
                        || !"S".equalsIgnoreCase(
                        archivo.getActivo()
                )
        ) {
            throw new IllegalArgumentException(
                    "El archivo ya no se encuentra activo."
            );
        }

        archivo.setActivo("N");

        repo.save(archivo);
    }

    // =========================================
    // VALIDACIÓN ORIGINAL: SOLO PDF
    // Se conserva para QRD.
    // =========================================

    private void validarArchivo(
            MultipartFile archivo
    ) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException(
                    "No se permiten archivos vacíos."
            );
        }

        if (archivo.getSize() > MAX_TAMANIO) {
            throw new IllegalArgumentException(
                    "Cada archivo PDF debe pesar como máximo 10 MB."
            );
        }

        String tipo =
                archivo.getContentType();

        if (
                tipo == null
                        || !tipo.equalsIgnoreCase(
                        "application/pdf"
                )
        ) {
            throw new IllegalArgumentException(
                    "Solo se permiten archivos PDF."
            );
        }

        String nombre =
                archivo.getOriginalFilename();

        if (
                nombre == null
                        || !nombre
                        .toLowerCase()
                        .endsWith(".pdf")
        ) {
            throw new IllegalArgumentException(
                    "El archivo debe tener extensión .pdf."
            );
        }
    }

    // =========================================
    // NUEVO: PDF O ZIP SOLO PARA INTEGRIDAD
    // =========================================

    private String validarArchivoIntegridad(
            MultipartFile archivo
    ) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException(
                    "No se permiten archivos vacíos."
            );
        }

        if (archivo.getSize() > MAX_TAMANIO) {
            throw new IllegalArgumentException(
                    "Cada archivo debe pesar como máximo 10 MB."
            );
        }

        String nombre =
                archivo.getOriginalFilename();

        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException(
                    "El archivo debe tener un nombre."
            );
        }

        String nombreNormalizado =
                nombre.toLowerCase(Locale.ROOT);

        boolean esPdf =
                nombreNormalizado.endsWith(".pdf");

        boolean esZip =
                nombreNormalizado.endsWith(".zip");

        if (!esPdf && !esZip) {
            throw new IllegalArgumentException(
                    "Integridad solo permite archivos PDF o ZIP."
            );
        }

        // Comprueba la cabecera del formato.
        // Los ZIP se guardan sin descomprimir.
        try (InputStream entrada =
                     archivo.getInputStream()) {

            byte[] cabecera =
                    entrada.readNBytes(5);

            boolean cabeceraPdf =
                    cabecera.length >= 5
                            && cabecera[0] == '%'
                            && cabecera[1] == 'P'
                            && cabecera[2] == 'D'
                            && cabecera[3] == 'F'
                            && cabecera[4] == '-';

            boolean cabeceraZip =
                    cabecera.length >= 4
                            && cabecera[0] == 'P'
                            && cabecera[1] == 'K'
                            && (
                            (
                                    cabecera[2] == 3
                                            && cabecera[3] == 4
                            )
                                    || (
                                    cabecera[2] == 5
                                            && cabecera[3] == 6
                            )
                                    || (
                                    cabecera[2] == 7
                                            && cabecera[3] == 8
                            )
                    );

            if (esPdf && !cabeceraPdf) {
                throw new IllegalArgumentException(
                        "El contenido del archivo no corresponde a un PDF."
                );
            }

            if (esZip && !cabeceraZip) {
                throw new IllegalArgumentException(
                        "El contenido del archivo no corresponde a un ZIP."
                );
            }

        } catch (IOException e) {
            throw new IllegalArgumentException(
                    "No se pudo leer el archivo adjunto.",
                    e
            );
        }

        return esZip ? ".zip" : ".pdf";
    }
}