package sistema.ejercito.mil.pe.service;

import sistema.ejercito.mil.pe.model.view.Brigada;
import sistema.ejercito.mil.pe.model.view.Dependencia;
import sistema.ejercito.mil.pe.model.view.Nucleo;

import java.util.List;

public interface INucleoService extends ICRUDService<Nucleo, String>{

    List<Brigada> findByIdNucleo(String idNucleo);

    Nucleo buscarporidnucleo(String id);

    List<Dependencia> findByIdBrigada(String idBrigada);

}
