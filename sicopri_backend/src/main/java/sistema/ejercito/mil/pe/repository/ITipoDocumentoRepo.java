package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.Query;
import sistema.ejercito.mil.pe.model.table.TipoDocumento;

import java.util.List;

public interface ITipoDocumentoRepo
        extends IGenericRepo<TipoDocumento, Long> {

    @Query(value = """
            SELECT *
            FROM EXP_TIPO_DOCUMENTO
            WHERE ACTIVO = 'S'
            ORDER BY ID_TIPO_DOCUMENTO ASC
            """, nativeQuery = true)
    List<TipoDocumento> listarActivos();
}