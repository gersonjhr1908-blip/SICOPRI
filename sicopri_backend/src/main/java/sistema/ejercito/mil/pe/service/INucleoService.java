package sistema.ejercito.mil.pe.service;

import sistema.ejercito.mil.pe.model.view.Brigada;
import sistema.ejercito.mil.pe.model.view.Nucleo;
import sistema.ejercito.mil.pe.model.view.Unidad;

import java.util.List;

public interface INucleoService extends ICRUDService<Nucleo, String>{

    List<Brigada> findByIdNucleo(String idNucleo);

    Nucleo buscarporidnucleo(String id);

    List<Unidad> findByIdBrigada(String idBrigada);
}
