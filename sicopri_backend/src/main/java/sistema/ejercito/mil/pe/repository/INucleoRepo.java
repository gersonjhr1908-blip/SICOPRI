package sistema.ejercito.mil.pe.repository;

import org.springframework.data.repository.query.Param;
import sistema.ejercito.mil.pe.model.view.Nucleo;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface INucleoRepo extends IGenericRepo<Nucleo, String> {

    // Buscar un núcleo por ID - LO QUE YA TENÍAS
    @Query("from Nucleo n where n.idNucleo = :id")
    Nucleo buscarporidnucleo(@Param("id") String id);


    // Listar núcleos para el desplegable
    @Query("""
        SELECT n
        FROM Nucleo n
        ORDER BY n.nombre
    """)
    List<Nucleo> listarNucleos();
}