package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.Query;
import sistema.ejercito.mil.pe.model.table.TipoExpediente;

import java.util.List;

public interface ITipoExpedienteRepo
        extends IGenericRepo<TipoExpediente, Long> {

    @Query(value = """
            SELECT *
            FROM EXP_TIPO_EXPEDIENTE
            WHERE ACTIVO = 'S'
            ORDER BY ID_TIPO_EXPEDIENTE ASC
            """, nativeQuery = true)
    List<TipoExpediente> listarActivos();
}