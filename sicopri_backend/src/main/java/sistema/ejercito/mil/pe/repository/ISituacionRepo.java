package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.Query;
import sistema.ejercito.mil.pe.model.table.Situacion;

import java.util.List;

public interface ISituacionRepo
        extends IGenericRepo<Situacion, Long> {

    @Query(value = """
            SELECT *
            FROM EXP_SITUACION
            WHERE ACTIVO = 'S'
            ORDER BY ID_SITUACION
            """, nativeQuery = true)
    List<Situacion> listarActivos();
}