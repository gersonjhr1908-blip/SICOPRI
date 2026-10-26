package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.Query;
import sistema.ejercito.mil.pe.model.table.EstadoExpediente;

import java.util.List;

public interface IEstadoExpedienteRepo
        extends IGenericRepo<EstadoExpediente, Long> {

    @Query(value = """
            SELECT *
            FROM EXP_ESTADO_EXPEDIENTE
            WHERE ACTIVO = 'S'
            ORDER BY ORDEN_FLUJO ASC, ID_ESTADO ASC
            """, nativeQuery = true)
    List<EstadoExpediente> listarActivos();
}