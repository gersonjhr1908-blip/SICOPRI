package sistema.ejercito.mil.pe.security;


import sistema.ejercito.mil.pe.model.table.User;
import sistema.ejercito.mil.pe.repository.IUserRepo;
import sistema.ejercito.mil.pe.repository.repoImpl.ADImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
public class JwtUserDetailsService implements UserDetailsService {

    private final IUserRepo repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = repo.findOneByUsername(username);

        if (user == null) {
            throw new UsernameNotFoundException("USUARIO NO ENCONTRADO: " + username);
        }


        List<SimpleGrantedAuthority> roles = new ArrayList<>();
        user.getRoles().forEach(rol -> roles.add(new SimpleGrantedAuthority(rol.getName())));


        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getFullname(), roles);
    }

    public boolean loginByActiveDirectory(String username, String password) throws Exception {

        User oUsuario;
        ADImpl userAD = new ADImpl();

        try {
            if (userAD.login(username, password)) {
                oUsuario = repo.findOneByUsername(username);
                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            throw new Exception(e);
        }
    }
}
