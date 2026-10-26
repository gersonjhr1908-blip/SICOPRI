package sistema.ejercito.mil.pe.service;

import sistema.ejercito.mil.pe.model.table.Expediente;
import sistema.ejercito.mil.pe.model.table.ExpedienteMovimiento;
import sistema.ejercito.mil.pe.model.table.ExpedienteSeguimiento;

import java.time.LocalDate;
import java.util.List;


public interface IExpedienteService
        extends ICRUDService<Expediente, Long> {

    Expediente guardarExpediente(
            Expediente expediente
    );

    Expediente actualizarExpediente(
            Long idExpediente,
            Expediente datos
    );

    // QRD2 asigna destino final: nivel 3 o 4.
    Expediente actualizarDestino(
            Long idExpediente,
            Integer nivelDestino
    );

    Expediente actualizarObservacion(
            Long idExpediente,
            String observacion
    );

    void eliminarExpediente(
            Long idExpediente
    );

    // QRD3 -> QRD2:
    // devolución / caso observado.
    Expediente enviarANivel2(
            Long idExpediente,
            String usuario
    );

    // QRD2 -> QRD3 o QRD4 -> QRD3.
    Expediente enviarANivel3(
            Long idExpediente,
            String usuario
    );

    // QRD3 -> QRD4.
    Expediente enviarANivel4(
            Long idExpediente,
            String usuario
    );

    // QRD4 -> QRD3:
    // respuesta normal con informes.
    Expediente enviarRespuestaANivel3(
            Long idExpediente,
            String usuario
    );

    // QRD3 -> QRD2:
    // respuesta revisada de QRD4.
    Expediente enviarRespuestaANivel2(
            Long idExpediente,
            String usuario
    );

    // QRD4 -> QRD3:
    // devolución por documento incorrecto.
    Expediente devolverDesdeNivel4ANivel3(
            Long idExpediente,
            String observacion,
            String usuario
    );

    List<ExpedienteMovimiento> listarMovimientos(
            Long idExpediente
    );

    ExpedienteSeguimiento guardarSeguimiento(
            Long idExpediente,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String usuario
    );

    ExpedienteSeguimiento obtenerSeguimiento(
            Long idExpediente
    );

    ExpedienteSeguimiento actualizarSeguimiento(
            Long idExpediente,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String usuario
    );

    Expediente archivarExpediente(
            Long idExpediente,
            String usuario
    );

    Expediente devolverDesdeNivel3(
            Long idExpediente,
            String observacion,
            String usuario
    );

}