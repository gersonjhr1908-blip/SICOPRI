package sistema.ejercito.mil.pe.service.impl;

import sistema.ejercito.mil.pe.model.table.Menu;
import sistema.ejercito.mil.pe.repository.IGenericRepo;
import sistema.ejercito.mil.pe.repository.IMenuRepo;
import sistema.ejercito.mil.pe.service.IMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl extends ICRUDServiceImpl<Menu, Integer> implements IMenuService {

    private final IMenuRepo repo;

    @Override
    protected IGenericRepo<Menu, Integer> getRepo() {
        return repo;
    }

    @Override
    public List<Menu> getMenusByUsername(String username) {
      //   String contextSessionUser = SecurityContextHolder.getContext().getAuthentication().getName();
        return repo.getMenusByUsername(username);
    }
}
