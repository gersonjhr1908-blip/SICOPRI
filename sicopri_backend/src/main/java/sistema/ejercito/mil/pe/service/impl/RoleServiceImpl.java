package sistema.ejercito.mil.pe.service.impl;

import sistema.ejercito.mil.pe.model.table.Role;
import sistema.ejercito.mil.pe.repository.IGenericRepo;
import sistema.ejercito.mil.pe.repository.IRoleRepo;
import sistema.ejercito.mil.pe.service.IRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class RoleServiceImpl extends ICRUDServiceImpl<Role, Integer> implements IRoleService {

        private final IRoleRepo repo;


        @Override
        protected IGenericRepo<Role, Integer> getRepo() {
                return repo;
        }

        @Override
        public List<Role> listRolebyId(String id) {
                return repo.listRolesbyId(id);
        }

        @Override
        public List<Role> listRoles() {
                return repo.listRoles();
        }


}

