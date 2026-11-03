package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sistema.ejercito.mil.pe.model.table.IntegridadInformeEnvio;

import java.util.List;
import java.util.Optional;

public interface IIntegridadInformeEnvioRepo
        extends JpaRepository<IntegridadInformeEnvio, Long> {

    List<IntegridadInformeEnvio>
    findByIdExpedienteAndActivoOrderByIdInformeAsc(
            Long idExpediente,
            String activo
    );

    Optional<IntegridadInformeEnvio>
    findByIdInformeAndIdExpedienteAndActivo(
            Long idInforme,
            Long idExpediente,
            String activo
    );
}