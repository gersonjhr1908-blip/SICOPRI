package sistema.ejercito.mil.pe.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import sistema.ejercito.mil.pe.model.table.Expediente;
import sistema.ejercito.mil.pe.model.table.ExpedienteMovimiento;
import sistema.ejercito.mil.pe.model.table.ExpedienteSeguimiento;

import sistema.ejercito.mil.pe.repository.IExpedienteMovimientoRepo;
import sistema.ejercito.mil.pe.repository.IExpedienteSeguimientoRepo;
import sistema.ejercito.mil.pe.repository.IExpedienteRepo;
import sistema.ejercito.mil.pe.repository.IGenericRepo;
import sistema.ejercito.mil.pe.repository.IExpedienteRespuestaRepo;

import sistema.ejercito.mil.pe.service.IExpedienteService;


import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;


@Service
@RequiredArgsConstructor
public class ExpedienteServiceImpl
        extends ICRUDServiceImpl<Expediente, Long>
        implements IExpedienteService {



    private final IExpedienteRepo repo;

    private final IExpedienteMovimientoRepo
            movimientoRepo;
    private final IExpedienteSeguimientoRepo
            seguimientoRepo;
    private final IExpedienteRespuestaRepo
            respuestaRepo;



    @Override
    protected IGenericRepo<Expediente, Long>
    getRepo() {

        return repo;

    }



    @Override
    @Transactional
    public Expediente guardarExpediente(
            Expediente expediente
    ) {



        if (
                expediente.getIdNucleo() == null ||
                        expediente.getIdNucleo().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Debe seleccionar un núcleo"
            );

        }


        if (
                expediente.getIdBrigada() == null ||
                        expediente.getIdBrigada().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Debe seleccionar una gran unidad"
            );

        }



        String cinv =
                generarCinv(
                        expediente
                );


        expediente.setCinv(
                cinv
        );



        Expediente guardado =
                repo.save(
                        expediente
                );

        registrarMovimiento(
                guardado,
                guardado.getNivelCreacion(),
                guardado.getNivelCreacion(),
                "EXPEDIENTE REGISTRADO",
                guardado.getUsuarioRegistro()
        );

        return guardado;
    }


    @Override
    @Transactional
    public Expediente actualizarExpediente(
            Long idExpediente,
            Expediente datos
    ) {


        Expediente existente =
                buscarExpedienteActivo(idExpediente);

        Integer estado = existente.getIdEstado();
        Integer nivelActual = existente.getNivelActual();

        Integer nivelCreacion =
                existente.getNivelCreacion() == null
                        ? 2
                        : existente.getNivelCreacion();

        boolean registradoEnOrigen =
                Integer.valueOf(1).equals(estado)
                        && nivelCreacion.equals(nivelActual);

        boolean observadoEnNivel2 =
                Integer.valueOf(3).equals(estado)
                        && Integer.valueOf(2).equals(nivelActual);

        if (!registradoEnOrigen && !observadoEnNivel2) {
            throw new IllegalArgumentException(
                    "Solo se pueden editar expedientes registrados en su nivel de origen "
                            + "u observados que se encuentren en QRD Nivel 2."
            );
        }


        if (
                datos.getIdNucleo() == null ||
                        datos.getIdNucleo().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Debe seleccionar un núcleo."
            );

        }


        if (
                datos.getIdBrigada() == null ||
                        datos.getIdBrigada().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Debe seleccionar una gran unidad."
            );

        }



        existente.setIdTipoExpediente(
                datos.getIdTipoExpediente()
        );

        existente.setCategoria(
                datos.getCategoria()
        );

        existente.setIdTipoDocumento(
                datos.getIdTipoDocumento()
        );

        existente.setOtroTipoDocumento(
                datos.getOtroTipoDocumento()
        );

        existente.setNroDocumento(
                datos.getNroDocumento()
        );

        existente.setFechaDocumento(
                datos.getFechaDocumento()
        );

        existente.setIdTipificacion(
                datos.getIdTipificacion()
        );

        existente.setIdNucleo(
                datos.getIdNucleo()
        );

        existente.setIdBrigada(
                datos.getIdBrigada()
        );

        existente.setIdUnidad(
                datos.getIdUnidad()
        );

        existente.setIdNucleoIg(
                datos.getIdNucleoIg()
        );

        existente.setIdIg(
                datos.getIdIg()
        );



        existente.setNivelDestino(
                datos.getNivelDestino()
        );


        existente.setAsunto(
                datos.getAsunto()
        );

        existente.setDescripcion(
                datos.getDescripcion()
        );


        return repo.save(
                existente
        );

    }



    @Override
    @Transactional
    public Expediente actualizarDestino(
            Long idExpediente,
            Integer nivelDestino
    ) {

        Expediente existente =
                buscarExpedienteActivo(
                        idExpediente
                );

        if (
                !Integer.valueOf(2).equals(
                        existente.getNivelActual()
                )
        ) {

            throw new IllegalArgumentException(
                    "El destino solo puede asignarse desde QRD Nivel 2."
            );

        }

        if (
                !Integer.valueOf(2).equals(
                        existente.getIdEstado()
                )
                        &&
                        !Integer.valueOf(3).equals(
                                existente.getIdEstado()
                        )
        ) {

            throw new IllegalArgumentException(
                    "El expediente no está pendiente de atención en QRD Nivel 2."
            );

        }

        if (
                !Integer.valueOf(3).equals(nivelDestino)
                        &&
                        !Integer.valueOf(4).equals(nivelDestino)
        ) {

            throw new IllegalArgumentException(
                    "Debe seleccionar como destino final QRD Nivel 3 o QRD Nivel 4."
            );

        }

        existente.setNivelDestino(
                nivelDestino
        );

        return repo.save(
                existente
        );

    }



    @Override
    @Transactional
    public Expediente actualizarObservacion(
            Long idExpediente,
            String observacion
    ) {


        Expediente expediente =
                buscarExpedienteActivo(
                        idExpediente
                );


        String valor =
                observacion == null
                        ? ""
                        : observacion.trim();


        if (
                valor.length() > 2000
        ) {

            throw new IllegalArgumentException(
                    "La observación no puede superar los 2000 caracteres."
            );

        }


        expediente.setObservacionActual(
                valor
        );


        return repo.save(
                expediente
        );

    }



    @Override
    @Transactional
    public void eliminarExpediente(Long idExpediente) {

        Expediente expediente =
                buscarExpedienteActivo(idExpediente);

        Integer estado = expediente.getIdEstado();
        Integer nivelActual = expediente.getNivelActual();

        Integer nivelCreacion =
                expediente.getNivelCreacion() == null
                        ? 2
                        : expediente.getNivelCreacion();

        boolean registradoEnOrigen =
                Integer.valueOf(1).equals(estado)
                        && nivelCreacion.equals(nivelActual);

        boolean observadoEnNivel2 =
                Integer.valueOf(3).equals(estado)
                        && Integer.valueOf(2).equals(nivelActual);

        if (!registradoEnOrigen && !observadoEnNivel2) {
            throw new IllegalArgumentException(
                    "Solo se pueden eliminar expedientes registrados en su nivel de origen "
                            + "u observados que se encuentren en QRD Nivel 2."
            );
        }

        expediente.setActivo("N");

        repo.save(expediente);
    }

    @Override
    @Transactional
    public Expediente devolverDesdeNivel3(
            Long idExpediente,
            String observacion,
            String usuario
    ) {
        Expediente expediente =
                buscarExpedienteActivo(idExpediente);

        if (!Integer.valueOf(3).equals(expediente.getNivelActual())) {
            throw new IllegalArgumentException(
                    "El expediente debe encontrarse en QRD Nivel 3 para devolverlo."
            );
        }

        Integer estado = expediente.getIdEstado();

        if (!Integer.valueOf(2).equals(estado)
                && !Integer.valueOf(3).equals(estado)) {
            throw new IllegalArgumentException(
                    "Solo se pueden devolver expedientes pendientes u observados."
            );
        }

        String motivo =
                observacion == null ? "" : observacion.trim();

        if (motivo.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debe registrar una observación antes de devolver el documento."
            );
        }

        if (motivo.length() > 2000) {
            throw new IllegalArgumentException(
                    "La observación no puede superar los 2000 caracteres."
            );
        }

        Integer nivelDevolucion = 2;

        if (Integer.valueOf(4).equals(expediente.getNivelCreacion())) {
            List<ExpedienteMovimiento> movimientos =
                    movimientoRepo.listarPorExpediente(idExpediente);

            if (movimientos == null || movimientos.isEmpty()) {
                throw new IllegalArgumentException(
                        "No se encontró el historial necesario para determinar "
                                + "el nivel de devolución."
                );
            }

            boolean yaPasoPorNivel2 =
                    movimientos.stream().anyMatch(movimiento ->
                            Integer.valueOf(2).equals(
                                    movimiento.getNivelOrigen()
                            )
                                    || Integer.valueOf(2).equals(
                                    movimiento.getNivelDestino()
                            )
                    );

            if (!yaPasoPorNivel2) {
                nivelDevolucion = 4;
            }
        }

        expediente.setObservacionActual(motivo);
        expediente.setIdEstado(3);
        expediente.setNivelActual(nivelDevolucion);

        Expediente guardado = repo.save(expediente);

        registrarMovimiento(
                guardado,
                3,
                nivelDevolucion,
                "OBSERVADO",
                usuario
        );

        return guardado;
    }


    @Override
    @Transactional
    public Expediente enviarANivel2(
            Long idExpediente,
            String usuario
    ) {
        Expediente expediente =
                buscarExpedienteActivo(idExpediente);

        Integer origen = expediente.getNivelActual();
        Integer estado = expediente.getIdEstado();
        Integer nivelCreacion = expediente.getNivelCreacion();

        if (!Integer.valueOf(3).equals(origen)) {
            throw new IllegalArgumentException(
                    "Solo QRD Nivel 3 puede enviar un expediente a QRD Nivel 2."
            );
        }

        boolean primerEnvioDesdeQrd3 =
                Integer.valueOf(3).equals(nivelCreacion)
                        && Integer.valueOf(1).equals(estado);

        boolean primerEnvioDesdeQrd4 = false;

        if (Integer.valueOf(4).equals(nivelCreacion)
                && Integer.valueOf(2).equals(estado)) {

            boolean yaPasoPorNivel2 =
                    movimientoRepo
                            .listarPorExpediente(idExpediente)
                            .stream()
                            .anyMatch(movimiento ->
                                    Integer.valueOf(2).equals(
                                            movimiento.getNivelOrigen()
                                    )
                                            || Integer.valueOf(2).equals(
                                            movimiento.getNivelDestino()
                                    )
                            );

            primerEnvioDesdeQrd4 = !yaPasoPorNivel2;
        }

        boolean envioInicial =
                primerEnvioDesdeQrd3 || primerEnvioDesdeQrd4;

        if (!envioInicial
                && !Integer.valueOf(2).equals(estado)
                && !Integer.valueOf(3).equals(estado)) {
            throw new IllegalArgumentException(
                    "El estado actual del expediente no permite enviarlo "
                            + "o devolverlo a QRD Nivel 2."
            );
        }

        expediente.setIdEstado(envioInicial ? 2 : 3);
        expediente.setNivelActual(2);

        Expediente guardado = repo.save(expediente);

        registrarMovimiento(
                guardado,
                3,
                2,
                envioInicial ? "ENVIADO" : "OBSERVADO",
                usuario
        );

        return guardado;
    }



    @Override
    @Transactional
    public Expediente enviarANivel3(
            Long idExpediente,
            String usuario
    ) {

        Expediente expediente =
                buscarExpedienteActivo(
                        idExpediente
                );

        Integer origen =
                expediente.getNivelActual();


        if (Integer.valueOf(2).equals(origen)) {

            if (
                    !Integer.valueOf(1).equals(expediente.getIdEstado())
                            && !Integer.valueOf(2).equals(expediente.getIdEstado())
                            && !Integer.valueOf(3).equals(expediente.getIdEstado())
            ) {
                throw new IllegalArgumentException(
                        "El expediente no se encuentra listo para enviarse desde QRD Nivel 2."
                );
            }

            expediente.setIdEstado(2);
            expediente.setNivelActual(3);

            Expediente guardado =
                    repo.save(expediente);

            registrarMovimiento(
                    guardado,
                    2,
                    3,
                    "ENVIADO",
                    usuario
            );

            return guardado;
        }


        if (Integer.valueOf(4).equals(origen)) {

            if (!Integer.valueOf(1).equals(expediente.getIdEstado())) {
                throw new IllegalArgumentException(
                        "Solo los expedientes REGISTRADOS de QRD Nivel 4 pueden enviarse a Inspectoría QRD Nivel 3."
                );
            }

            expediente.setIdEstado(2);
            expediente.setNivelActual(3);

            Expediente guardado =
                    repo.save(expediente);

            registrarMovimiento(
                    guardado,
                    4,
                    3,
                    "ENVIADO",
                    usuario
            );

            return guardado;
        }

        throw new IllegalArgumentException(
                "El expediente no puede enviarse a QRD Nivel 3 desde su nivel actual."
        );
    }



    @Override
    @Transactional
    public Expediente enviarANivel4(
            Long idExpediente,
            String usuario
    ) {


        Expediente expediente =
                buscarExpedienteActivo(
                        idExpediente
                );


        if (
                !Integer.valueOf(3).equals(
                        expediente.getNivelActual()
                )
        ) {

            throw new IllegalArgumentException(
                    "Solo QRD Nivel 3 puede enviar un expediente a QRD Nivel 4."
            );

        }



        if (
                Integer.valueOf(2).equals(
                        expediente.getNivelCreacion()
                )
                        &&
                        !Integer.valueOf(4).equals(
                                expediente.getNivelDestino()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Este expediente no tiene como destino Inspectoría QRD Nivel 4."
            );

        }


        expediente.setIdEstado(
                2
        );

        expediente.setNivelActual(
                4
        );


        Expediente guardado =
                repo.save(
                        expediente
                );


        registrarMovimiento(
                guardado,
                3,
                4,
                "ENVIADO",
                usuario
        );


        return guardado;

    }



    @Override
    @Transactional
    public Expediente enviarRespuestaANivel3(
            Long idExpediente,
            String usuario
    ) {

        Expediente expediente =
                buscarExpedienteActivo(
                        idExpediente
                );

        if (
                !Integer.valueOf(4).equals(
                        expediente.getNivelActual()
                )
        ) {
            throw new IllegalArgumentException(
                    "Solo QRD Nivel 4 puede enviar una respuesta a QRD Nivel 3."
            );
        }

        Long cantidadRespuestas =
                respuestaRepo.contarActivasPorExpediente(
                        idExpediente
                );

        if (
                cantidadRespuestas == null ||
                        cantidadRespuestas == 0
        ) {
            throw new IllegalArgumentException(
                    "Registre al menos un informe antes de enviar la respuesta."
            );
        }

        expediente.setIdEstado(4);
        expediente.setNivelActual(3);

        Expediente guardado =
                repo.save(expediente);

        registrarMovimiento(
                guardado,
                4,
                3,
                "RESPUESTA ENVIADA",
                usuario
        );

        return guardado;
    }



    @Override
    @Transactional
    public Expediente devolverDesdeNivel4ANivel3(
            Long idExpediente,
            String observacion,
            String usuario
    ) {

        Expediente expediente =
                buscarExpedienteActivo(
                        idExpediente
                );

        if (
                !Integer.valueOf(4).equals(
                        expediente.getNivelActual()
                )
        ) {
            throw new IllegalArgumentException(
                    "Solo QRD Nivel 4 puede devolver el documento a QRD Nivel 3."
            );
        }

        String motivo =
                observacion == null
                        ? ""
                        : observacion.trim();

        if (motivo.isBlank()) {
            throw new IllegalArgumentException(
                    "Debe indicar el motivo de la devolución."
            );
        }

        expediente.setObservacionActual(motivo);
        expediente.setIdEstado(3);
        expediente.setNivelActual(3);

        Expediente guardado =
                repo.save(expediente);

        registrarMovimiento(
                guardado,
                4,
                3,
                "DEVUELTO",
                usuario
        );

        return guardado;
    }


    @Override
    @Transactional
    public Expediente enviarRespuestaANivel2(
            Long idExpediente,
            String usuario
    ) {

        Expediente expediente =
                buscarExpedienteActivo(
                        idExpediente
                );

        if (
                !Integer.valueOf(3).equals(
                        expediente.getNivelActual()
                )
        ) {
            throw new IllegalArgumentException(
                    "Solo QRD Nivel 3 puede remitir la respuesta a QRD Nivel 2."
            );
        }

        Long cantidadRespuestas =
                respuestaRepo.contarActivasPorExpediente(
                        idExpediente
                );

        if (
                cantidadRespuestas == null ||
                        cantidadRespuestas == 0
        ) {
            throw new IllegalArgumentException(
                    "No existen informes de respuesta para remitir a QRD Nivel 2."
            );
        }

        expediente.setIdEstado(4);
        expediente.setNivelActual(2);

        Expediente guardado =
                repo.save(expediente);

        registrarMovimiento(
                guardado,
                3,
                2,
                "RESPUESTA REMITIDA A QRD2",
                usuario
        );

        return guardado;
    }

    @Override
    @Transactional
    public Expediente archivarExpediente(
            Long idExpediente,
            String usuario
    ) {
        Expediente expediente =
                buscarExpedienteActivo(idExpediente);

        expediente.setIdEstado(5);

        Expediente archivado =
                repo.save(expediente);

        registrarMovimiento(
                archivado,
                expediente.getNivelActual(),
                expediente.getNivelActual(),
                "EXPEDIENTE ARCHIVADO",
                usuario
        );

        return archivado;
    }


    @Override
    public List<ExpedienteMovimiento>
    listarMovimientos(
            Long idExpediente
    ) {


        repo.findById(
                        idExpediente
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Expediente no encontrado."
                                )
                );


        return movimientoRepo
                .listarPorExpediente(
                        idExpediente
                );

    }


    @Override
    @Transactional
    public ExpedienteSeguimiento guardarSeguimiento(
            Long idExpediente,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String usuario
    ) {


        buscarExpedienteActivo(
                idExpediente
        );


        if (
                seguimientoRepo
                        .buscarActivoPorExpediente(
                                idExpediente
                        )
                        .isPresent()
        ) {

            throw new IllegalArgumentException(
                    "El expediente ya tiene un seguimiento registrado."
            );

        }


        validarFechasSeguimiento(
                fechaInicio,
                fechaFin
        );


        ExpedienteSeguimiento seguimiento =
                new ExpedienteSeguimiento();


        seguimiento.setIdExpediente(
                idExpediente
        );

        seguimiento.setFechaInicio(
                fechaInicio
        );

        seguimiento.setFechaFin(
                fechaFin
        );

        seguimiento.setCantidadDias(
                calcularCantidadDias(
                        fechaInicio,
                        fechaFin
                )
        );

        seguimiento.setUsuarioRegistro(
                usuario
        );

        seguimiento.setFechaRegistro(
                LocalDateTime.now()
        );

        seguimiento.setActivo(
                "S"
        );


        return seguimientoRepo.save(
                seguimiento
        );

    }



    @Override
    public ExpedienteSeguimiento obtenerSeguimiento(
            Long idExpediente
    ) {


        buscarExpedienteActivo(
                idExpediente
        );


        return seguimientoRepo
                .buscarActivoPorExpediente(
                        idExpediente
                )
                .orElse(null);

    }



    @Override
    @Transactional
    public ExpedienteSeguimiento actualizarSeguimiento(
            Long idExpediente,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String usuario
    ) {


        buscarExpedienteActivo(
                idExpediente
        );


        ExpedienteSeguimiento seguimiento =
                seguimientoRepo
                        .buscarActivoPorExpediente(
                                idExpediente
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "El expediente no tiene seguimiento registrado."
                                        )
                        );


        validarFechasSeguimiento(
                fechaInicio,
                fechaFin
        );


        seguimiento.setFechaInicio(
                fechaInicio
        );

        seguimiento.setFechaFin(
                fechaFin
        );

        seguimiento.setCantidadDias(
                calcularCantidadDias(
                        fechaInicio,
                        fechaFin
                )
        );

        seguimiento.setUsuarioModifica(
                usuario
        );

        seguimiento.setFechaModifica(
                LocalDateTime.now()
        );


        return seguimientoRepo.save(
                seguimiento
        );

    }



    private void validarFechasSeguimiento(
            LocalDate fechaInicio,
            LocalDate fechaFin
    ) {


        if (
                fechaInicio == null ||
                        fechaFin == null
        ) {

            throw new IllegalArgumentException(
                    "Debe ingresar la fecha de inicio y la fecha de término."
            );

        }


        if (
                fechaFin.isBefore(
                        fechaInicio
                )
        ) {

            throw new IllegalArgumentException(
                    "La fecha de término no puede ser anterior a la fecha de inicio."
            );

        }

    }



    private Integer calcularCantidadDias(
            LocalDate fechaInicio,
            LocalDate fechaFin
    ) {

        long dias =
                ChronoUnit.DAYS.between(
                        fechaInicio,
                        fechaFin
                ) + 1;


        return Math.toIntExact(
                dias
        );

    }



    private void registrarMovimiento(
            Expediente expediente,
            Integer nivelOrigen,
            Integer nivelDestino,
            String accion,
            String usuario
    ) {


        ExpedienteMovimiento movimiento =
                new ExpedienteMovimiento();


        movimiento.setIdExpediente(
                expediente.getIdExpediente()
        );

        movimiento.setNivelOrigen(
                nivelOrigen
        );

        movimiento.setNivelDestino(
                nivelDestino
        );

        movimiento.setAccion(
                accion
        );

        movimiento.setObservacion(
                expediente.getObservacionActual()
        );

        movimiento.setUsuario(
                usuario
        );

        movimiento.setFechaMovimiento(
                LocalDateTime.now()
        );

        movimiento.setActivo(
                "S"
        );


        movimientoRepo.save(
                movimiento
        );

    }



    private Expediente buscarExpedienteActivo(
            Long idExpediente
    ) {


        Expediente expediente =
                repo.findById(
                                idExpediente
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Expediente no encontrado."
                                        )
                        );


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


        return expediente;

    }



    private String generarCinv(
            Expediente expediente
    ) {


        Integer idTipoExpediente =
                expediente.getIdTipoExpediente();


        if (
                idTipoExpediente == null
        ) {

            throw new IllegalArgumentException(
                    "Debe seleccionar una sección"
            );

        }


        String prefijo;

        Long correlativo;



        switch (
                idTipoExpediente
        ) {


            case 1 -> {

                prefijo =
                        "D";


                correlativo =
                        repo.siguienteDenuncia();

            }


            case 2 -> {

                prefijo =
                        "Q";


                correlativo =
                        repo.siguienteQueja();

            }


            case 3 -> {

                prefijo =
                        "R";


                correlativo =
                        repo.siguienteReclamo();

            }


            default ->
                    throw new IllegalArgumentException(
                            "Tipo de expediente no válido para QRD"
                    );

        }


        String numero =
                String.format(
                        "%06d",
                        correlativo
                );


        return "CINV-"
                + expediente.getIdBrigada()
                + "-"
                + expediente.getIdNucleo()
                + "-"
                + prefijo
                + numero;

    }

}
