package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sistema.ejercito.mil.pe.model.table.IntegridadDenuncia;

import java.util.Optional;

public interface IIntegridadDenunciaRepo
        extends JpaRepository<IntegridadDenuncia, Long> {

    Optional<IntegridadDenuncia> findByIdExpediente(Long idExpediente);
}