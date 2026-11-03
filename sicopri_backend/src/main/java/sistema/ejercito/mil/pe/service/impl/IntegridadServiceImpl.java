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
import sistema.ejercito.mil.pe.model.table.ExpedienteMovimiento;
import sistema.ejercito.mil.pe.repository.IExpedienteMovimientoRepo;
import sistema.ejercito.mil.pe.model.table.DatosPersona;
import sistema.ejercito.mil.pe.repository.IExpedienteSeguimientoRepo;

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

    private final IExpedienteMovimientoRepo
            movimientoRepo;

    private final IExpedienteSeguimientoRepo
            seguimientoRepo;


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
        // IDENTIFICACIÓN

        identificacion = identificacion == null
                ? null
                : identificacion.trim();

        if (!"DENUNCIANTE".equals(identificacion)
                && !"ANONIMA".equals(identificacion)) {
            throw new IllegalArgumentException(
                    "Seleccione una identificación válida del denunciante."
            );
        }

        sexo = sexo == null || sexo.isBlank()
                ? null
                : sexo.trim();

        DatosPersona persona = expediente.getDatosPersona();

        if (persona == null) {
            persona = new DatosPersona();
        }

        if (persona.getDni() == null) {
            persona.setDni(dni);
        }

        if (persona.getTelefono() == null) {
            persona.setTelefono(telefono);
        }

        if (persona.getCorreo() == null) {
            persona.setCorreo(correo);
        }

        persona.validarYNormalizar();

        if (persona.getCorreo() != null
                && persona.getCorreo().length() > 150) {
            throw new IllegalArgumentException(
                    "El correo electrónico admite máximo 150 caracteres."
            );
        }

        if ("DENUNCIANTE".equals(identificacion)) {
            if (persona.getNombres() == null
                    || persona.getApellidos() == null
                    || persona.getDni() == null
                    || persona.getTelefono() == null
                    || persona.getDomicilio() == null
                    || persona.getCorreo() == null
                    || sexo == null) {
                throw new IllegalArgumentException(
                        "Para el denunciante identificado complete todos "
                                + "los datos personales. El RUC es opcional."
                );
            }
        }

        if (sexo != null
                && !"MASCULINO".equals(sexo)
                && !"FEMENINO".equals(sexo)
                && !"NO_DECLARA".equals(sexo)) {
            throw new IllegalArgumentException(
                    "Seleccione una opción válida de sexo."
            );
        }

        expediente.setDatosPersona(persona);

        dni = persona.getDni();
        telefono = persona.getTelefono();
        correo = persona.getCorreo();

        Integer destino = expediente.getNivelDestino();

        if (destino == null
                || (destino != 3 && destino != 4)) {
            throw new IllegalArgumentException(
                    "Seleccione un destino: Integridad Nivel 3 o Nivel 4."
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


        if (expediente.getFechaRegistro() == null) {
            throw new IllegalArgumentException(
                    "La fecha de registro es obligatoria."
            );
        }


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

        dto.setNroDocumento(
                expediente.getNroDocumento()
        );

        dto.setIdNucleo(
                expediente.getIdNucleo()
        );

        dto.setIdBrigada(
                expediente.getIdBrigada()
        );

        dto.setIdUnidad(
                expediente.getIdUnidad()
        );

        dto.setIdNucleoIg(
                expediente.getIdNucleoIg()
        );

        dto.setIdIg(
                expediente.getIdIg()
        );

        dto.setNivelDestino(
                expediente.getNivelDestino()
        );

        dto.setObservacionActual(
                expediente.getObservacionActual()
        );

        dto.setDatosPersona(
                expediente.getDatosPersona()
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
        validarIntegridadActivo(expediente);

        if (!Integer.valueOf(2).equals(
                expediente.getNivelActual()
        )) {
            throw new IllegalArgumentException(
                    "La denuncia no se encuentra en Integridad Nivel 2."
            );
        }

        Integer estado = expediente.getIdEstado();

        if (!Integer.valueOf(1).equals(estado)
                && !Integer.valueOf(3).equals(estado)) {
            throw new IllegalArgumentException(
                    "Solo puede modificar denuncias registradas "
                            + "o devueltas para subsanar."
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

    @Override
    @Transactional
    public Expediente enviarANivel3(
            Long idExpediente,
            String usuario
    ) {
        if (idExpediente == null) {
            throw new IllegalArgumentException(
                    "El expediente es obligatorio."
            );
        }

        Expediente expediente = expedienteRepo
                .findById(idExpediente)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Expediente no encontrado."
                        )
                );

        validarIntegridadActivo(expediente);

        if (!Integer.valueOf(2).equals(
                expediente.getNivelActual()
        )) {
            throw new IllegalArgumentException(
                    "La denuncia no se encuentra en Integridad Nivel 2."
            );
        }

        Integer estado = expediente.getIdEstado();

        if (!Integer.valueOf(1).equals(estado)
                && !Integer.valueOf(3).equals(estado)) {
            throw new IllegalArgumentException(
                    "Solo puede enviar denuncias registradas "
                            + "o devueltas para subsanar."
            );
        }

        Integer destinoFinal =
                expediente.getNivelDestino();

        if (!Integer.valueOf(3).equals(destinoFinal)
                && !Integer.valueOf(4).equals(destinoFinal)) {
            throw new IllegalArgumentException(
                    "Seleccione un destino final: Nivel 3 o Nivel 4."
            );
        }

        var seguimiento = seguimientoRepo
                .buscarActivoPorExpediente(idExpediente)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Debe registrar y guardar el seguimiento "
                                        + "antes de enviar la denuncia."
                        )
                );

        if (seguimiento.getFechaInicio() == null
                || seguimiento.getFechaFin() == null
                || seguimiento.getFechaFin().isBefore(
                seguimiento.getFechaInicio()
        )) {
            throw new IllegalArgumentException(
                    "El seguimiento debe tener fechas de inicio y fin válidas."
            );
        }
        expediente.setNivelActual(3);
        expediente.setIdEstado(2);

        Expediente guardado =
                expedienteRepo.save(expediente);

        ExpedienteMovimiento movimiento =
                new ExpedienteMovimiento();

        movimiento.setIdExpediente(
                guardado.getIdExpediente()
        );

        movimiento.setNivelOrigen(2);
        movimiento.setNivelDestino(3);
        movimiento.setAccion("ENVIADO");

        movimiento.setObservacion(
                guardado.getObservacionActual()
        );

        movimiento.setUsuario(usuario);
        movimiento.setFechaMovimiento(LocalDateTime.now());
        movimiento.setActivo("S");

        movimientoRepo.save(movimiento);

        return guardado;
    }

    @Override
    @Transactional
    public Expediente devolverDesdeNivel3(
            Long idExpediente,
            String observacion,
            String usuario
    ) {
        if (idExpediente == null) {
            throw new IllegalArgumentException(
                    "El expediente es obligatorio."
            );
        }

        Expediente expediente = expedienteRepo
                .findById(idExpediente)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Expediente no encontrado."
                        )
                );

        validarIntegridadActivo(expediente);

        if (!Integer.valueOf(3).equals(
                expediente.getNivelActual()
        )) {
            throw new IllegalArgumentException(
                    "La denuncia no se encuentra en Integridad Nivel 3."
            );
        }

        if (!Integer.valueOf(2).equals(expediente.getIdEstado())
                && !Integer.valueOf(3).equals(expediente.getIdEstado())) {
            throw new IllegalArgumentException(
                    "El estado actual no permite devolver la denuncia."
            );
        }

        String motivo = limpiar(observacion);

        if (motivo == null) {
            throw new IllegalArgumentException(
                    "Ingrese el motivo de la devolución."
            );
        }

        if (motivo.length() > 2000) {
            throw new IllegalArgumentException(
                    "La observación admite máximo 2000 caracteres."
            );
        }

        expediente.setObservacionActual(motivo);
        expediente.setNivelActual(2);
        expediente.setIdEstado(3);

        Expediente guardado =
                expedienteRepo.save(expediente);

        ExpedienteMovimiento movimiento =
                new ExpedienteMovimiento();

        movimiento.setIdExpediente(
                guardado.getIdExpediente()
        );

        movimiento.setNivelOrigen(3);
        movimiento.setNivelDestino(2);
        movimiento.setAccion("OBSERVADO");
        movimiento.setObservacion(motivo);
        movimiento.setUsuario(usuario);
        movimiento.setFechaMovimiento(LocalDateTime.now());
        movimiento.setActivo("S");

        movimientoRepo.save(movimiento);

        return guardado;
    }

}