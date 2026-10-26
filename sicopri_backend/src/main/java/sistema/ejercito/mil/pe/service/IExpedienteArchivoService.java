package sistema.ejercito.mil.pe.service;

import org.springframework.web.multipart.MultipartFile;
import sistema.ejercito.mil.pe.model.table.ExpedienteArchivo;

import java.util.List;


public interface IExpedienteArchivoService {


    // GUARDAR ARCHIVOS

    List<ExpedienteArchivo> guardarArchivos(
            Long idExpediente,
            String cinv,
            List<MultipartFile> archivos
    );


    // LISTAR ARCHIVOS ACTIVOS

    List<ExpedienteArchivo> listarArchivos(
            Long idExpediente
    );


    // BUSCAR ARCHIVO POR ID

    ExpedienteArchivo buscarArchivoPorId(
            Long idArchivo
    );


    // ELIMINAR ARCHIVO
    // ACTIVO = N

    void eliminarArchivo(
            Long idArchivo
    );

}