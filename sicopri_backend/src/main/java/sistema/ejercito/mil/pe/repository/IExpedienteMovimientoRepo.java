package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import sistema.ejercito.mil.pe.model.table.ExpedienteMovimiento;

import java.util.List;


public interface IExpedienteMovimientoRepo
        extends IGenericRepo<ExpedienteMovimiento, Long> {


    // =========================================
    // TRAZABILIDAD DE UN EXPEDIENTE
    // =========================================

    @Query("""
            SELECT m
            FROM ExpedienteMovimiento m
            WHERE m.idExpediente = :idExpediente
              AND m.activo = 'S'
            ORDER BY m.fechaMovimiento ASC
            """)
    List<ExpedienteMovimiento> listarPorExpediente(
            @Param("idExpediente")
            Long idExpediente
    );

}