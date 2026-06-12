package sistema.ejercito.mil.pe.repository;

import sistema.ejercito.mil.pe.model.view.Nucleo;
import org.springframework.data.jpa.repository.Query;

public interface INucleoRepo  extends IGenericRepo<Nucleo, String>{


    @Query("from Nucleo where id =:id")
    Nucleo buscarporidnucleo(String id);
}
