package sistema.ejercito.mil.pe.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import sistema.ejercito.mil.pe.model.table.Expediente;
import sistema.ejercito.mil.pe.model.table.ExpedienteRespuesta;

import sistema.ejercito.mil.pe.repository.IExpedienteRepo;
import sistema.ejercito.mil.pe.repository.IExpedienteRespuestaRepo;

import sistema.ejercito.mil.pe.service.IExpedienteRespuestaService;

import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.time.LocalDateTime;

import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ExpedienteRespuestaServiceImpl
        implements IExpedienteRespuestaService {

    private final IExpedienteRespuestaRepo respuestaRepo;

    private final IExpedienteRepo expedienteRepo;

    private static final long MAX_TAMANIO =
            10L * 1024L * 1024L;


    @Override
    @Transactional
    public ExpedienteRespuesta guardarRespuesta(
            Long idExpediente,
            ExpedienteRespuesta datos,
            MultipartFile archivo,
            String usuario
    ) {

        Expediente expediente =
                buscarExpedienteActivo(idExpediente);

        // La respuesta se registra desde QRD4.
        Integer nivelActual = expediente.getNivelActual();

        if (
                !Integer.valueOf(3).equals(nivelActual)
                        &&
                        !Integer.valueOf(4).equals(nivelActual)
        ) {
            throw new IllegalArgumentException(
                    "La respuesta solo puede registrarse desde QRD Nivel 3 o QRD Nivel 4."
            );
        }

        validarDatos(datos);
        validarPdf(archivo);

        Integer ultimoNumero =
                respuestaRepo.obtenerUltimoNumero(idExpediente);

        int siguienteNumero =
                (ultimoNumero == null ? 0 : ultimoNumero) + 1;

        Path carpeta = Paths.get(
                "uploads",
                "expedientes",
                expediente.getCinv(),
                "respuestas"
        );

        try {
            Files.createDirectories(carpeta);
        } catch (IOException e) {
            throw new RuntimeException(
                    "No se pudo crear la carpeta de respuestas.",
                    e
            );
        }

        String nombreOriginal =
                archivo.getOriginalFilename();

        String nombreGuardado =
                UUID.randomUUID() + ".pdf";

        Path destino =
                carpeta.resolve(nombreGuardado);

        try {
            Files.copy(
                    archivo.getInputStream(),
                    destino,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException e) {
            throw new RuntimeException(
                    "No se pudo guardar el PDF de respuesta.",
                    e
            );
        }

        ExpedienteRespuesta respuesta =
                new ExpedienteRespuesta();

        respuesta.setIdExpediente(idExpediente);
        respuesta.setNumeroInforme(siguienteNumero);

        respuesta.setNombreDocumento(
                datos.getNombreDocumento().trim()
        );

        respuesta.setTipoDocumento(
                datos.getTipoDocumento().trim()
        );

        respuesta.setDescripcion(
                datos.getDescripcion().trim()
        );

        // El origen y destino dependen del nivel que responde.
        respuesta.setNivelOrigen(expediente.getNivelActual());

        if (Integer.valueOf(4).equals(expediente.getNivelActual())) {
            // QRD4 siempre devuelve la respuesta a QRD3.
            respuesta.setNivelDestino(3);
        } else {
            // QRD3 remite la respuesta a QRD2.
            respuesta.setNivelDestino(2);
        }

        respuesta.setFechaDocumento(
                datos.getFechaDocumento()
        );

        respuesta.setNombreArchivo(
                nombreOriginal
        );

        respuesta.setNombreGuardado(
                nombreGuardado
        );

        respuesta.setTipoArchivo(
                archivo.getContentType()
        );

        respuesta.setTamano(
                archivo.getSize()
        );

        respuesta.setRutaArchivo(
                destino.toAbsolutePath().toString()
        );

        respuesta.setUsuarioRegistro(usuario);
        respuesta.setFechaRegistro(LocalDateTime.now());
        respuesta.setActivo("S");

        return respuestaRepo.save(respuesta);
    }


    @Override
    public List<ExpedienteRespuesta> listarRespuestas(
            Long idExpediente
    ) {

        buscarExpedienteActivo(idExpediente);

        return respuestaRepo.listarPorExpediente(
                idExpediente
        );
    }


    @Override
    public ExpedienteRespuesta buscarRespuestaPorId(
            Long idRespuesta
    ) {

        ExpedienteRespuesta respuesta =
                respuestaRepo.findById(idRespuesta)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Respuesta no encontrada."
                                )
                        );

        if (
                respuesta.getActivo() == null ||
                        !"S".equalsIgnoreCase(respuesta.getActivo())
        ) {
            throw new IllegalArgumentException(
                    "La respuesta ya no está disponible."
            );
        }

        return respuesta;
    }


    @Override
    @Transactional
    public void eliminarRespuesta(
            Long idRespuesta
    ) {

        ExpedienteRespuesta respuesta =
                buscarRespuestaPorId(idRespuesta);

        respuesta.setActivo("N");

        respuestaRepo.save(respuesta);
    }


    private Expediente buscarExpedienteActivo(
            Long idExpediente
    ) {

        Expediente expediente =
                expedienteRepo.findById(idExpediente)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Expediente no encontrado."
                                )
                        );

        if (
                expediente.getActivo() == null ||
                        !"S".equalsIgnoreCase(expediente.getActivo())
        ) {
            throw new IllegalArgumentException(
                    "El expediente no se encuentra activo."
            );
        }

        return expediente;
    }


    private void validarDatos(
            ExpedienteRespuesta datos
    ) {

        if (
                datos == null ||
                        datos.getNombreDocumento() == null ||
                        datos.getNombreDocumento().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "El nombre del documento es obligatorio."
            );
        }

        if (
                datos.getTipoDocumento() == null ||
                        datos.getTipoDocumento().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "El tipo de documento es obligatorio."
            );
        }

        if (
                datos.getDescripcion() == null ||
                        datos.getDescripcion().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "La descripción del documento es obligatoria."
            );
        }

        if (datos.getDescripcion().length() > 2000) {
            throw new IllegalArgumentException(
                    "La descripción no puede superar los 2000 caracteres."
            );
        }

        if (datos.getFechaDocumento() == null) {
            throw new IllegalArgumentException(
                    "La fecha del documento es obligatoria."
            );
        }
    }


    private void validarPdf(
            MultipartFile archivo
    ) {

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debe adjuntar un PDF para el informe."
            );
        }

        if (archivo.getSize() > MAX_TAMANIO) {
            throw new IllegalArgumentException(
                    "El PDF puede pesar máximo 10 MB."
            );
        }

        String tipo = archivo.getContentType();

        if (
                tipo == null ||
                        !tipo.equalsIgnoreCase("application/pdf")
        ) {
            throw new IllegalArgumentException(
                    "Solo se permite adjuntar archivos PDF."
            );
        }

        String nombre = archivo.getOriginalFilename();

        if (
                nombre == null ||
                        !nombre.toLowerCase().endsWith(".pdf")
        ) {
            throw new IllegalArgumentException(
                    "El archivo debe tener extensión .pdf."
            );
        }
    }
}