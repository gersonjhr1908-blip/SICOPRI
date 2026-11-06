package sistema.ejercito.mil.pe.controller;

import jakarta.persistence.EntityManager;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import sistema.ejercito.mil.pe.repository.IUserRepo;

@RestController
@RequestMapping("/expedientes/{id}/administrador")
@Transactional
public class ExpedienteAdministradorController {
    private final EntityManager em;
    private final IUserRepo usuarios;

    public ExpedienteAdministradorController(EntityManager em, IUserRepo usuarios) {
        this.em = em;
        this.usuarios = usuarios;
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") Long id, Authentication autenticacion) {
        verificarAdministrador(autenticacion);
        verificarActualizado(em.createQuery("""
                update Expediente e set e.activo = 'N'
                where e.idExpediente = :id and e.activo = 'S'
                """).setParameter("id", id).executeUpdate());
    }

    @PutMapping("/inspectoria")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cambiarInspectoria(@PathVariable("id") Long id,
                                   @RequestBody Inspectoria datos,
                                   Authentication autenticacion) {
        verificarAdministrador(autenticacion);
        if (datos == null || vacio(datos.idNucleo()) || vacio(datos.idBrigada())
                || vacio(datos.idUnidad()) || datos.idNucleoIg() == null
                || datos.idNucleoIg() <= 0 || vacio(datos.idIg())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complete los cinco campos de inspectoría.");
        }
        verificarActualizado(em.createQuery("""
                update Expediente e
                set e.idNucleo = :nucleo, e.idBrigada = :brigada, e.idUnidad = :unidad,
                    e.idNucleoIg = :nucleoIg, e.idIg = :ig
                where e.idExpediente = :id and e.activo = 'S'
                """).setParameter("nucleo", datos.idNucleo().trim())
                .setParameter("brigada", datos.idBrigada().trim())
                .setParameter("unidad", datos.idUnidad().trim())
                .setParameter("nucleoIg", datos.idNucleoIg())
                .setParameter("ig", datos.idIg().trim())
                .setParameter("id", id).executeUpdate());
    }

    private void verificarAdministrador(Authentication autenticacion) {
        if (autenticacion != null && autenticacion.isAuthenticated()) {
            var usuario = usuarios.findOneByUsername(autenticacion.getName());
            if (usuario != null && Integer.valueOf(1).equals(usuario.getRoleActiveIdRole())
                    && usuario.getRoles() != null && usuario.getRoles().stream()
                    .anyMatch(rol -> Integer.valueOf(1).equals(rol.getIdRole()))) {
                return;
            }
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seleccione la vista Administrador.");
    }

    private static void verificarActualizado(int filas) {
        if (filas == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El expediente activo no está disponible.");
        }
    }

    private static boolean vacio(String valor) {
        return valor == null || valor.isBlank();
    }

    public record Inspectoria(String idNucleo, String idBrigada, String idUnidad,
                              Integer idNucleoIg, String idIg) {}
}
