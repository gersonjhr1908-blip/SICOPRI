package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import sistema.ejercito.mil.pe.model.table.ExpedienteArchivo;

import java.util.List;

public interface IExpedienteArchivoRepo
        extends IGenericRepo<ExpedienteArchivo, Long> {


    // =========================================
    // LISTAR ARCHIVOS DE UN EXPEDIENTE
    // =========================================

    @Query("""
            SELECT a
            FROM ExpedienteArchivo a
            WHERE a.idExpediente = :idExpediente
              AND a.activo = 'S'
            ORDER BY a.idArchivo ASC
            """)
    List<ExpedienteArchivo> listarPorExpediente(
            @Param("idExpediente") Long idExpediente
    );


    // =========================================
    // CONTAR ARCHIVOS DE UN EXPEDIENTE
    // Máximo permitido posteriormente: 5
    // =========================================

    @Query("""
            SELECT COUNT(a)
            FROM ExpedienteArchivo a
            WHERE a.idExpediente = :idExpediente
              AND a.activo = 'S'
            """)
    Long contarPorExpediente(
            @Param("idExpediente") Long idExpediente
    );



}