package sistema.ejercito.mil.pe.service.impl;

import sistema.ejercito.mil.pe.model.view.Brigada;
import sistema.ejercito.mil.pe.repository.IBrigadaRepo;
import sistema.ejercito.mil.pe.repository.IGenericRepo;
import sistema.ejercito.mil.pe.service.IBrigadaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BrigadaServiceImpl extends ICRUDServiceImpl<Brigada, String> implements IBrigadaService {

    private final IBrigadaRepo repo;

    @Override
    protected IGenericRepo<Brigada, String> getRepo() {
        return repo;
    }


}
