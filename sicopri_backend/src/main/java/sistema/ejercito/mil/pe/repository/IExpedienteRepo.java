package sistema.ejercito.mil.pe.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import sistema.ejercito.mil.pe.model.table.Expediente;

import java.util.List;

public interface IExpedienteRepo
        extends IGenericRepo<Expediente, Long> {


    // CORRELATIVO DENUNCIA

    @Query(
            value = "SELECT SEQ_CINV_DENUNCIA.NEXTVAL FROM DUAL",
            nativeQuery = true
    )
    Long siguienteDenuncia();


    // CORRELATIVO QUEJA

    @Query(
            value = "SELECT SEQ_CINV_QUEJA.NEXTVAL FROM DUAL",
            nativeQuery = true
    )
    Long siguienteQueja();


    // CORRELATIVO RECLAMO

    @Query(
            value = "SELECT SEQ_CINV_RECLAMO.NEXTVAL FROM DUAL",
            nativeQuery = true
    )
    Long siguienteReclamo();


    // CORRELATIVO INTEGRIDAD - DEA

    @Query(
            value = "SELECT SEQ_CINV_INTEGRIDAD.NEXTVAL FROM DUAL",
            nativeQuery = true
    )
    Long siguienteIntegridad();


    // =========================================
    // LISTAR REGISTRADOS DE INTEGRIDAD
    // =========================================

    @Query("""
            SELECT e
            FROM Expediente e
            WHERE UPPER(e.categoria) = 'INTEGRIDAD'
              AND e.activo = 'S'
              AND e.idEstado = 1
              AND e.nivelActual = 2
            ORDER BY e.fechaRegistro DESC
            """)
    List<Expediente> listarRegistradosIntegridad();

}