package sistema.ejercito.mil.pe.service.impl;

import sistema.ejercito.mil.pe.model.view.Brigada;
import sistema.ejercito.mil.pe.model.view.Dependencia;
import sistema.ejercito.mil.pe.model.view.Nucleo;
import sistema.ejercito.mil.pe.repository.IBrigadaRepo;
import sistema.ejercito.mil.pe.repository.IDependenciaRepo;
import sistema.ejercito.mil.pe.repository.IGenericRepo;
import sistema.ejercito.mil.pe.repository.INucleoRepo;
import sistema.ejercito.mil.pe.service.INucleoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NucleoServiceImpl extends  ICRUDServiceImpl<Nucleo, String> implements INucleoService {

    private final INucleoRepo repoNucleo;

    private final IBrigadaRepo repoBrigada;

    private final IDependenciaRepo repoDependencia;

    @Override
    @Transactional(readOnly = true)
    protected IGenericRepo<Nucleo, String> getRepo() {
        return repoNucleo;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Brigada> findByIdNucleo(String idNucleo) {
        return repoBrigada.findByIdNucleo(idNucleo);
    }

    @Override
    public Nucleo buscarporidnucleo(String id) {
        return repoNucleo.buscarporidnucleo(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Dependencia> findByIdBrigada(String idBrigada) {
        return repoDependencia.findByIdBrigada(idBrigada);
    }

}
