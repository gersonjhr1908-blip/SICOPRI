package sistema.ejercito.mil.pe.repository;

import sistema.ejercito.mil.pe.model.view.Unidad;

import java.util.List;

public interface IUnidadRepo extends IGenericRepo<Unidad, String> {

   List<Unidad> findByIdBrigada(String idBrigada);

   List<Unidad> findByIdNucleo(String idNucleo);

   List<Unidad> findByIdNucleoAndIdBrigada(
           String idNucleo,
           String idBrigada
   );
}