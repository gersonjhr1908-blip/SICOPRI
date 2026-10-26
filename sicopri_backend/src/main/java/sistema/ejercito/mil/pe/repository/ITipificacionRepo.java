package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sistema.ejercito.mil.pe.model.table.Tipificacion;

import java.util.List;

public interface ITipificacionRepo
        extends IGenericRepo<Tipificacion, Long> {

    @Query(value = """
            SELECT *
            FROM EXP_TIPIFICACION
            WHERE ACTIVO = 'S'
              AND ID_TIPO_EXPEDIENTE = :idTipoExpediente
            ORDER BY ID_TIPIFICACION ASC
            """, nativeQuery = true)
    List<Tipificacion> listarPorTipoExpediente(
            @Param("idTipoExpediente") Long idTipoExpediente
    );
}