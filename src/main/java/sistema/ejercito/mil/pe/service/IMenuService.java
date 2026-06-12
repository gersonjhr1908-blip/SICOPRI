package sistema.ejercito.mil.pe.service;


import sistema.ejercito.mil.pe.model.table.Menu;

import java.util.List;

public interface IMenuService extends ICRUDService<Menu, Integer> {

    List<Menu> getMenusByUsername(String username);
}
