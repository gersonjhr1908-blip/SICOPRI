package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import sistema.ejercito.mil.pe.model.table.ExpedienteRespuesta;

import java.util.List;

public interface IExpedienteRespuestaRepo
        extends IGenericRepo<ExpedienteRespuesta, Long> {

    @Query("""
            SELECT r
            FROM ExpedienteRespuesta r
            WHERE r.idExpediente = :idExpediente
              AND r.activo = 'S'
            ORDER BY r.numeroInforme ASC
            """)
    List<ExpedienteRespuesta> listarPorExpediente(
            @Param("idExpediente")
            Long idExpediente
    );


    @Query("""
        SELECT COALESCE(
            MAX(r.numeroInforme),
            0
        )
        FROM ExpedienteRespuesta r
        WHERE r.idExpediente = :idExpediente
        """)
    Integer obtenerUltimoNumero(
            @Param("idExpediente")
            Long idExpediente
    );

    @Query("""
            SELECT COUNT(r)
            FROM ExpedienteRespuesta r
            WHERE r.idExpediente = :idExpediente
              AND r.activo = 'S'
            """)
    Long contarActivasPorExpediente(
            @Param("idExpediente")
            Long idExpediente
    );
}