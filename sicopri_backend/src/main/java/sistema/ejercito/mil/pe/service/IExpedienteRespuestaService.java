package sistema.ejercito.mil.pe.service;

import org.springframework.web.multipart.MultipartFile;

import sistema.ejercito.mil.pe.model.table.ExpedienteRespuesta;

import java.util.List;

public interface IExpedienteRespuestaService {

    ExpedienteRespuesta guardarRespuesta(
            Long idExpediente,
            ExpedienteRespuesta datos,
            MultipartFile archivo,
            String usuario
    );

    List<ExpedienteRespuesta> listarRespuestas(
            Long idExpediente
    );

    ExpedienteRespuesta buscarRespuestaPorId(
            Long idRespuesta
    );

    void eliminarRespuesta(
            Long idRespuesta
    );
}