package sistema.ejercito.mil.pe.controller;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import sistema.ejercito.mil.pe.model.table.Tipificacion;
import sistema.ejercito.mil.pe.repository.IUserRepo;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/expediente/catalogos/tipificaciones")
@RequiredArgsConstructor
public class TipificacionAdministradorController {
    private final IUserRepo usuarios;
    private final EntityManager em;

    @PostMapping("/{categoria}")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public List<Tipificacion> agregar(@PathVariable("categoria") long categoria,
                                      @RequestBody Alta alta, Authentication autenticacion) {
        verificarAdministrador(autenticacion);

        String nombre = alta == null || alta.nombre() == null ? "" : alta.nombre().strip();
        if (!Set.of(1L, 2L, 3L).contains(categoria) || nombre.isBlank() || nombre.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seleccione una categoría y escriba un nombre de hasta 100 caracteres.");
        }

        // La entidad usa IDs manuales. Serializa la asignación y la comprobación de duplicados en Oracle.
        em.createNativeQuery("LOCK TABLE EXP_TIPIFICACION IN EXCLUSIVE MODE").executeUpdate();
        List<Long> categorias = List.of(categoria);
        List<Tipificacion> existentes = em.createQuery("""
                select t from Tipificacion t
                where t.idTipoExpediente in :categorias and upper(trim(t.nombre)) = upper(:nombre)
                """, Tipificacion.class).setParameter("categorias", categorias).setParameter("nombre", nombre).getResultList();
        if (existentes.stream().anyMatch(item -> "S".equals(item.getActivo()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esa tipificación ya existe en una de las categorías seleccionadas.");
        }

        Long ultimoId = em.createQuery("select max(t.idTipificacion) from Tipificacion t", Long.class).getSingleResult();
        long id = ultimoId == null ? 1 : ultimoId + 1;
        return categorias.stream().map(tipo -> existentes.stream()
                        .filter(item -> tipo.equals(item.getIdTipoExpediente()))
                        .findFirst()
                        .map(item -> {
                            item.setActivo("S");
                            return item;
                        })
                        .orElseGet(() -> crear(tipo, nombre, id + categorias.indexOf(tipo))))
                .toList();
    }

    private Tipificacion crear(long categoria, String nombre, long id) {
        Tipificacion tipificacion = new Tipificacion();
        tipificacion.setIdTipificacion(id);
        tipificacion.setIdTipoExpediente(categoria);
        tipificacion.setCodigo("TIP_" + id);
        tipificacion.setNombre(nombre);
        tipificacion.setDescripcion(nombre);
        tipificacion.setActivo("S");
        em.persist(tipificacion);
        return tipificacion;
    }

    @DeleteMapping("/item/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void eliminar(@PathVariable("id") long id, Authentication autenticacion) {
        verificarAdministrador(autenticacion);
        int filas = em.createQuery("""
                update Tipificacion t set t.activo = 'N'
                where t.idTipificacion = :id and t.activo = 'S'
                  and t.idTipoExpediente in (1, 2, 3)
                """).setParameter("id", id).executeUpdate();
        if (filas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "La tipificación activa no está disponible.");
        }
    }

    private void verificarAdministrador(Authentication autenticacion) {
        var usuario = autenticacion == null || !autenticacion.isAuthenticated()
                ? null : usuarios.findOneByUsername(autenticacion.getName());
        if (usuario == null || !Integer.valueOf(1).equals(usuario.getRoleActiveIdRole())
                || usuario.getRoles() == null
                || usuario.getRoles().stream().noneMatch(rol -> Integer.valueOf(1).equals(rol.getIdRole()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seleccione la vista Administrador.");
        }

    }

    public record Alta(String nombre) {}
}



