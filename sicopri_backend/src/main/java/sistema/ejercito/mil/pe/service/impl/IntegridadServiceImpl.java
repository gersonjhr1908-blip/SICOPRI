package sistema.ejercito.mil.pe.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import sistema.ejercito.mil.pe.dto.IntegridadDetalleDTO;
import sistema.ejercito.mil.pe.dto.IntegridadListadoDTO;

import sistema.ejercito.mil.pe.model.table.Expediente;
import sistema.ejercito.mil.pe.model.table.IntegridadDenuncia;

import sistema.ejercito.mil.pe.repository.IExpedienteRepo;
import sistema.ejercito.mil.pe.repository.IIntegridadDenunciaRepo;

import sistema.ejercito.mil.pe.service.IExpedienteArchivoService;
import sistema.ejercito.mil.pe.service.IIntegridadService;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
public class IntegridadServiceImpl
        implements IIntegridadService {


    private final IExpedienteRepo
            expedienteRepo;


    private final IIntegridadDenunciaRepo
            integridadRepo;


    private final IExpedienteArchivoService
            archivoService;


    // =========================================
    // GUARDAR
    // =========================================

    @Override
    @Transactional
    public Expediente guardarDenuncia(

            Expediente expediente,

            String tipoDocumento,

            String dni,

            String correo,

            String telefono,

            String fechaActoCorrupcion,

            String motivoDenuncia,

            String medidaProteccion,

            String identificacion,

            String sexo,

            String detalle,

            String detalleOtros,

            List<MultipartFile> archivos

    ) {


        if (expediente == null) {

            throw new IllegalArgumentException(
                    "Los datos del expediente son obligatorios."
            );

        }


        if (
                archivos != null &&
                        archivos.size() > 5
        ) {

            throw new IllegalArgumentException(
                    "Solo se permiten máximo 5 archivos PDF."
            );

        }


        // =====================================
        // CINV INTEGRIDAD
        // CINV-DEA000001
        // =====================================

        Long correlativo =
                expedienteRepo
                        .siguienteIntegridad();


        String numero =
                String.format(
                        "%06d",
                        correlativo
                );


        String cinv =
                "CINV-DEA"
                        + numero;


        expediente.setCinv(
                cinv
        );


        expediente.setIdTipoExpediente(
                5
        );


        expediente.setIdTipoDocumento(
                5
        );


        expediente.setIdEstado(
                1
        );


        expediente.setNivelActual(
                2
        );


        expediente.setActivo(
                "S"
        );


        expediente.setCategoria(
                "INTEGRIDAD"
        );


        expediente.setFechaRegistro(
                LocalDateTime.now()
        );


        if (
                motivoDenuncia != null &&
                        !motivoDenuncia.isBlank()
        ) {

            expediente.setAsunto(
                    motivoDenuncia
            );

        } else {

            expediente.setAsunto(
                    "DENUNCIA DE CORRUPCIÓN"
            );

        }


        expediente.setDescripcion(
                detalle
        );


        Expediente expedienteGuardado =
                expedienteRepo.save(
                        expediente
                );


        IntegridadDenuncia denuncia =
                new IntegridadDenuncia();


        denuncia.setIdExpediente(
                expedienteGuardado
                        .getIdExpediente()
        );


        denuncia.setTipoDocumento(
                tipoDocumento
        );


        denuncia.setDni(
                dni
        );


        denuncia.setCorreo(
                correo
        );


        denuncia.setTelefono(
                telefono
        );


        if (
                fechaActoCorrupcion != null &&
                        !fechaActoCorrupcion.isBlank()
        ) {

            denuncia.setFechaActoCorrupcion(
                    LocalDate.parse(
                            fechaActoCorrupcion
                    )
            );

        }


        denuncia.setMotivoDenuncia(
                motivoDenuncia
        );


        denuncia.setMedidaProteccion(
                medidaProteccion
        );


        denuncia.setIdentificacion(
                identificacion
        );


        denuncia.setSexo(
                sexo
        );


        denuncia.setDetalle(
                detalle
        );


        denuncia.setDetalleOtros(
                detalleOtros
        );


        integridadRepo.save(
                denuncia
        );


        if (
                archivos != null &&
                        !archivos.isEmpty()
        ) {

            archivoService.guardarArchivos(

                    expedienteGuardado
                            .getIdExpediente(),

                    expedienteGuardado
                            .getCinv(),

                    archivos

            );

        }


        return expedienteGuardado;

    }


    // =========================================
    // LISTAR REGISTRADOS
    // =========================================

    @Override
    public List<IntegridadListadoDTO>
    listarRegistrados() {


        List<Expediente> expedientes =
                expedienteRepo
                        .listarRegistradosIntegridad();


        List<IntegridadListadoDTO> resultado =
                new ArrayList<>();


        for (
                Expediente expediente :
                expedientes
        ) {


            IntegridadDenuncia denuncia =
                    integridadRepo
                            .findByIdExpediente(
                                    expediente
                                            .getIdExpediente()
                            )
                            .orElse(null);


            if (denuncia == null) {

                continue;

            }


            IntegridadListadoDTO dto =
                    new IntegridadListadoDTO();


            dto.setIdExpediente(
                    expediente
                            .getIdExpediente()
            );


            dto.setCinv(
                    expediente
                            .getCinv()
            );


            dto.setFechaRegistro(
                    expediente
                            .getFechaRegistro()
            );


            dto.setFechaActoCorrupcion(
                    denuncia
                            .getFechaActoCorrupcion()
            );


            dto.setMotivoDenuncia(
                    denuncia
                            .getMotivoDenuncia()
            );


            dto.setIdEstado(
                    expediente
                            .getIdEstado()
            );


            if (
                    Integer.valueOf(1)
                            .equals(
                                    expediente
                                            .getIdEstado()
                            )
            ) {

                dto.setEstado(
                        "REGISTRADO"
                );

            } else {

                dto.setEstado(
                        "SIN ESTADO"
                );

            }


            resultado.add(
                    dto
            );

        }


        return resultado;

    }


    // =========================================
    // OBTENER DETALLE
    // =========================================

    @Override
    public IntegridadDetalleDTO obtenerDetalle(
            Long idExpediente
    ) {


        if (idExpediente == null) {

            throw new IllegalArgumentException(
                    "El ID del expediente es obligatorio."
            );

        }


        Expediente expediente =
                expedienteRepo
                        .findById(
                                idExpediente
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Expediente no encontrado."
                                        )
                        );


        validarIntegridadActivo(
                expediente
        );


        IntegridadDenuncia denuncia =
                integridadRepo
                        .findByIdExpediente(
                                idExpediente
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "No se encontraron los datos de la denuncia."
                                        )
                        );


        IntegridadDetalleDTO dto =
                new IntegridadDetalleDTO();


        dto.setIdExpediente(
                expediente.getIdExpediente()
        );


        dto.setCinv(
                expediente.getCinv()
        );


        dto.setFechaRegistro(
                expediente.getFechaRegistro()
        );


        dto.setIdEstado(
                expediente.getIdEstado()
        );


        dto.setNivelActual(
                expediente.getNivelActual()
        );


        dto.setCategoria(
                expediente.getCategoria()
        );


        dto.setUsuarioRegistro(
                expediente.getUsuarioRegistro()
        );


        dto.setTipoDocumento(
                denuncia.getTipoDocumento()
        );


        dto.setDni(
                denuncia.getDni()
        );


        dto.setCorreo(
                denuncia.getCorreo()
        );


        dto.setTelefono(
                denuncia.getTelefono()
        );


        dto.setFechaActoCorrupcion(
                denuncia.getFechaActoCorrupcion()
        );


        dto.setMotivoDenuncia(
                denuncia.getMotivoDenuncia()
        );


        dto.setMedidaProteccion(
                denuncia.getMedidaProteccion()
        );


        dto.setIdentificacion(
                denuncia.getIdentificacion()
        );


        dto.setSexo(
                denuncia.getSexo()
        );


        dto.setDetalle(
                denuncia.getDetalle()
        );


        dto.setDetalleOtros(
                denuncia.getDetalleOtros()
        );


        return dto;

    }


    // =========================================
    // ACTUALIZAR DENUNCIA
    // =========================================

    @Override
    @Transactional
    public Expediente actualizarDenuncia(

            Long idExpediente,

            String nroDocumento,

            String tipoDocumento,

            String dni,

            String correo,

            String telefono,

            String fechaActoCorrupcion,

            String motivoDenuncia,

            String medidaProteccion,

            String identificacion,

            String sexo,

            String detalle,

            String detalleOtros

    ) {


        // =====================================
        // BUSCAR EXPEDIENTE
        // =====================================

        Expediente expediente =
                expedienteRepo
                        .findById(
                                idExpediente
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Expediente no encontrado."
                                        )
                        );


        // =====================================
        // SOLO EDITABLE SI:
        //
        // INTEGRIDAD
        // ACTIVO = S
        // ESTADO = 1
        // NIVEL = 2
        // =====================================

        validarEditable(
                expediente
        );


        IntegridadDenuncia denuncia =
                integridadRepo
                        .findByIdExpediente(
                                idExpediente
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "No se encontraron los datos de la denuncia."
                                        )
                        );


        // =====================================
        // EXP_EXPEDIENTE
        //
        // IMPORTANTE:
        // NO CAMBIAMOS EL CINV
        // =====================================

        expediente.setNroDocumento(
                limpiar(
                        nroDocumento
                )
        );


        expediente.setDescripcion(
                limpiar(
                        detalle
                )
        );


        if (
                motivoDenuncia != null &&
                        !motivoDenuncia.isBlank()
        ) {

            expediente.setAsunto(
                    motivoDenuncia
            );

        } else {

            expediente.setAsunto(
                    "DENUNCIA DE CORRUPCIÓN"
            );

        }


        expedienteRepo.save(
                expediente
        );


        // =====================================
        // INT_DENUNCIA
        // =====================================

        denuncia.setTipoDocumento(
                limpiar(
                        tipoDocumento
                )
        );


        denuncia.setDni(
                limpiar(
                        dni
                )
        );


        denuncia.setCorreo(
                limpiar(
                        correo
                )
        );


        denuncia.setTelefono(
                limpiar(
                        telefono
                )
        );


        if (
                fechaActoCorrupcion != null &&
                        !fechaActoCorrupcion.isBlank()
        ) {

            denuncia.setFechaActoCorrupcion(
                    LocalDate.parse(
                            fechaActoCorrupcion
                    )
            );

        } else {

            denuncia.setFechaActoCorrupcion(
                    null
            );

        }


        denuncia.setMotivoDenuncia(
                limpiar(
                        motivoDenuncia
                )
        );


        denuncia.setMedidaProteccion(
                limpiar(
                        medidaProteccion
                )
        );


        denuncia.setIdentificacion(
                limpiar(
                        identificacion
                )
        );


        denuncia.setSexo(
                limpiar(
                        sexo
                )
        );


        denuncia.setDetalle(
                limpiar(
                        detalle
                )
        );


        denuncia.setDetalleOtros(
                limpiar(
                        detalleOtros
                )
        );


        integridadRepo.save(
                denuncia
        );


        return expediente;

    }


    // =========================================
    // ELIMINACIÓN LÓGICA
    // =========================================

    @Override
    @Transactional
    public void eliminarDenuncia(
            Long idExpediente
    ) {


        Expediente expediente =
                expedienteRepo
                        .findById(
                                idExpediente
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Expediente no encontrado."
                                        )
                        );


        validarEditable(
                expediente
        );


        // =====================================
        // NO BORRAMOS FÍSICAMENTE
        //
        // SOLO:
        // ACTIVO = N
        // =====================================

        expediente.setActivo(
                "N"
        );


        expedienteRepo.save(
                expediente
        );

    }


    // =========================================
    // VALIDAR INTEGRIDAD ACTIVO
    // =========================================

    private void validarIntegridadActivo(
            Expediente expediente
    ) {


        if (
                expediente.getCategoria() == null ||
                        !"INTEGRIDAD".equalsIgnoreCase(
                                expediente.getCategoria()
                        )
        ) {

            throw new IllegalArgumentException(
                    "El expediente no pertenece a Integridad."
            );

        }


        if (
                expediente.getActivo() == null ||
                        !"S".equalsIgnoreCase(
                                expediente.getActivo()
                        )
        ) {

            throw new IllegalArgumentException(
                    "El expediente no se encuentra activo."
            );

        }

    }


    // =========================================
    // VALIDAR QUE TODAVÍA SE PUEDA EDITAR
    // =========================================

    private void validarEditable(
            Expediente expediente
    ) {


        validarIntegridadActivo(
                expediente
        );


        if (
                !Integer.valueOf(1)
                        .equals(
                                expediente.getIdEstado()
                        )
        ) {

            throw new IllegalArgumentException(
                    "La denuncia ya no se encuentra en estado REGISTRADO."
            );

        }


        if (
                !Integer.valueOf(2)
                        .equals(
                                expediente.getNivelActual()
                        )
        ) {

            throw new IllegalArgumentException(
                    "La denuncia ya no se encuentra en Integridad Nivel 2."
            );

        }

    }


    // =========================================
    // CONVERTIR VACÍO A NULL
    // =========================================

    private String limpiar(
            String valor
    ) {


        if (
                valor == null ||
                        valor.trim().isEmpty()
        ) {

            return null;

        }


        return valor.trim();

    }

}