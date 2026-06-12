package sistema.ejercito.mil.pe.repository;

import sistema.ejercito.mil.pe.model.view.Dependencia;

import java.util.List;

public interface IDependenciaRepo extends IGenericRepo<Dependencia, String>{

    List<Dependencia> findByIdBrigada(String idBrigada);

/*
    @Query("select t from Dependencia t where t.idBrigada  = ?1 order by t.nombreCorto")
    List <Dependencia> findByDistribucion(String idBrigada);*/
}
