package sistema.ejercito.mil.pe.controller;

import sistema.ejercito.mil.pe.dto.MenuDTO;
import sistema.ejercito.mil.pe.model.table.Menu;
import sistema.ejercito.mil.pe.service.IMenuService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/menus")
@RequiredArgsConstructor
public class MenuController {

    private final IMenuService service;

    @Qualifier("defaultMapper")
    private final ModelMapper modelMapper;

    @PostMapping("/user")
    public ResponseEntity<List<MenuDTO>> getMenusByUser(@RequestBody String username){
        List<Menu> menus = service.getMenusByUsername(username);
        List<MenuDTO> menuDTOS = menus.stream().map( e -> modelMapper.map(e, MenuDTO.class)).toList();
        return ResponseEntity.ok(menuDTOS);
    }
}
