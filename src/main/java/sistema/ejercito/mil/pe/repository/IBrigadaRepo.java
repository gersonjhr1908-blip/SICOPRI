package sistema.ejercito.mil.pe.repository;

import sistema.ejercito.mil.pe.model.view.Brigada;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IBrigadaRepo extends IGenericRepo<Brigada, String> {

    List<Brigada> findByIdNucleo(String idNucleo);

    @Query(value = "FROM Brigada brig where brig.idNucleo =:idNucleo")
    List<Brigada> brig_nucleo(@Param("idNucleo") String idNucleo);

}
