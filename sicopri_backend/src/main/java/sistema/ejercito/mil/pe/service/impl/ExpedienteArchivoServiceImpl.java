package sistema.ejercito.mil.pe.service.impl;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import sistema.ejercito.mil.pe.model.table.ExpedienteArchivo;
import sistema.ejercito.mil.pe.repository.IExpedienteArchivoRepo;
import sistema.ejercito.mil.pe.service.IExpedienteArchivoService;

import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ExpedienteArchivoServiceImpl
        implements IExpedienteArchivoService {


    // =========================================
    // REPOSITORY
    // =========================================

    private final IExpedienteArchivoRepo repo;


    // =========================================
    // REGLAS DE ARCHIVOS
    // =========================================

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


        // =====================================
        // SIN ARCHIVOS
        // =====================================

        if (
                archivos == null ||
                        archivos.isEmpty()
        ) {

            return List.of();

        }


        // =====================================
        // VALIDAR CINV
        // =====================================

        if (
                cinv == null ||
                        cinv.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "El CINV del expediente es obligatorio."
            );

        }


        // =====================================
        // CUÁNTOS ARCHIVOS ACTIVOS YA TIENE
        // =====================================

        Long cantidadActual =
                repo.contarPorExpediente(
                        idExpediente
                );


        if (
                cantidadActual == null
        ) {

            cantidadActual = 0L;

        }


        // =====================================
        // MÁXIMO 5 PDFs EN TOTAL
        //
        // Ejemplo:
        //
        // 3 actuales + 2 nuevos = 5 OK
        // 4 actuales + 2 nuevos = 6 ERROR
        // =====================================

        if (
                cantidadActual +
                        archivos.size()
                        > MAX_ARCHIVOS
        ) {

            throw new IllegalArgumentException(
                    "El expediente solo puede tener máximo 5 archivos PDF."
            );

        }


        // =====================================
        // CARPETA DEL EXPEDIENTE
        //
        // uploads/
        //   expedientes/
        //     CINV-XXXX/
        // =====================================

        Path carpeta =
                Paths.get(
                        "uploads",
                        "expedientes",
                        cinv
                );


        // =====================================
        // CREAR CARPETA
        // =====================================

        try {

            Files.createDirectories(
                    carpeta
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "No se pudo crear la carpeta del expediente.",
                    e
            );

        }


        // =====================================
        // LISTA DE ARCHIVOS GUARDADOS
        // =====================================

        List<ExpedienteArchivo> guardados =
                new ArrayList<>();


        // =====================================
        // GUARDAR CADA PDF
        // =====================================

        for (
                MultipartFile archivo :
                archivos
        ) {


            // =================================
            // VALIDAR ARCHIVO
            // =================================

            validarArchivo(
                    archivo
            );


            // =================================
            // NOMBRE ORIGINAL
            // =================================

            String nombreOriginal =
                    archivo.getOriginalFilename();


            // =================================
            // NOMBRE INTERNO ÚNICO
            // =================================

            String nombreGuardado =
                    UUID.randomUUID()
                            + ".pdf";


            // =================================
            // RUTA FINAL
            // =================================

            Path destino =
                    carpeta.resolve(
                            nombreGuardado
                    );


            // =================================
            // COPIAR PDF AL SERVIDOR
            // =================================

            try {

                Files.copy(

                        archivo.getInputStream(),

                        destino,

                        StandardCopyOption
                                .REPLACE_EXISTING

                );

            } catch (IOException e) {

                throw new RuntimeException(

                        "Error al guardar el archivo: "
                                + nombreOriginal,

                        e

                );

            }


            // =================================
            // REGISTRAR ARCHIVO EN ORACLE
            // =================================

            ExpedienteArchivo registro =
                    new ExpedienteArchivo();


            registro.setIdExpediente(
                    idExpediente
            );


            registro.setNombreArchivo(
                    nombreOriginal
            );


            registro.setNombreGuardado(
                    nombreGuardado
            );


            registro.setTipoArchivo(
                    archivo.getContentType()
            );


            registro.setTamano(
                    archivo.getSize()
            );


            registro.setRutaArchivo(
                    destino
                            .toAbsolutePath()
                            .toString()
            );


            registro.setFechaRegistro(
                    LocalDateTime.now()
            );


            registro.setActivo(
                    "S"
            );


            // =================================
            // GUARDAR EN BD
            // =================================

            ExpedienteArchivo guardado =
                    repo.save(
                            registro
                    );


            guardados.add(
                    guardado
            );

        }


        // =====================================
        // DEVOLVER ARCHIVOS GUARDADOS
        // =====================================

        return guardados;

    }


    // =========================================
    // LISTAR ARCHIVOS ACTIVOS
    // DE UN EXPEDIENTE
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
    // BUSCAR ARCHIVO POR ID
    //
    // Se utiliza para visualizar el PDF.
    // =========================================

    @Override
    public ExpedienteArchivo buscarArchivoPorId(

            Long idArchivo

    ) {


        ExpedienteArchivo archivo =
                repo.findById(
                                idArchivo
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Archivo no encontrado."
                                        )
                        );


        // =====================================
        // SOLO ARCHIVOS ACTIVOS
        // =====================================

        if (
                archivo.getActivo() == null ||
                        !"S".equalsIgnoreCase(
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
    // ELIMINAR ARCHIVO
    //
    // ELIMINACIÓN LÓGICA:
    //
    // ACTIVO = S
    //       ↓
    // ACTIVO = N
    //
    // No borramos físicamente el PDF.
    // =========================================

    @Override
    public void eliminarArchivo(

            Long idArchivo

    ) {


        // =====================================
        // BUSCAR ARCHIVO
        // =====================================

        ExpedienteArchivo archivo =
                repo.findById(
                                idArchivo
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Archivo no encontrado."
                                        )
                        );


        // =====================================
        // VALIDAR QUE SIGA ACTIVO
        // =====================================

        if (
                archivo.getActivo() == null ||
                        !"S".equalsIgnoreCase(
                                archivo.getActivo()
                        )
        ) {

            throw new IllegalArgumentException(
                    "El archivo ya no se encuentra activo."
            );

        }


        // =====================================
        // MARCAR COMO ELIMINADO
        // =====================================

        archivo.setActivo(
                "N"
        );


        repo.save(
                archivo
        );

    }


    // =========================================
    // VALIDAR PDF
    // =========================================

    private void validarArchivo(

            MultipartFile archivo

    ) {


        // =====================================
        // ARCHIVO VACÍO
        // =====================================

        if (
                archivo == null ||
                        archivo.isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "No se permiten archivos vacíos."
            );

        }


        // =====================================
        // TAMAÑO MÁXIMO 10 MB
        // =====================================

        if (
                archivo.getSize()
                        > MAX_TAMANIO
        ) {

            throw new IllegalArgumentException(
                    "Cada archivo PDF debe pesar como máximo 10 MB."
            );

        }


        // =====================================
        // VALIDAR MIME
        // =====================================

        String tipo =
                archivo.getContentType();


        if (
                tipo == null ||
                        !tipo.equalsIgnoreCase(
                                "application/pdf"
                        )
        ) {

            throw new IllegalArgumentException(
                    "Solo se permiten archivos PDF."
            );

        }


        // =====================================
        // VALIDAR EXTENSIÓN
        // =====================================

        String nombre =
                archivo.getOriginalFilename();


        if (
                nombre == null ||
                        !nombre
                                .toLowerCase()
                                .endsWith(".pdf")


        ) {

            throw new IllegalArgumentException(
                    "El archivo debe tener extensión .pdf."
            );

        }

    }

}