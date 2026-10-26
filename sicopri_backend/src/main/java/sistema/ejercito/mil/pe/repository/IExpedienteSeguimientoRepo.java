package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import sistema.ejercito.mil.pe.model.table.ExpedienteSeguimiento;

import java.util.Optional;


public interface IExpedienteSeguimientoRepo
        extends IGenericRepo<ExpedienteSeguimiento, Long> {

    @Query("""
            SELECT s
            FROM ExpedienteSeguimiento s
            WHERE s.idExpediente = :idExpediente
              AND s.activo = 'S'
            """)
    Optional<ExpedienteSeguimiento>
    buscarActivoPorExpediente(
            @Param("idExpediente")
            Long idExpediente
    );

}