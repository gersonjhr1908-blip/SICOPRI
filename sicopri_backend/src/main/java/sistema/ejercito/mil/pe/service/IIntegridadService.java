package sistema.ejercito.mil.pe.service;

import org.springframework.web.multipart.MultipartFile;

import sistema.ejercito.mil.pe.dto.IntegridadDetalleDTO;
import sistema.ejercito.mil.pe.dto.IntegridadListadoDTO;
import sistema.ejercito.mil.pe.model.table.Expediente;

import java.util.List;


public interface IIntegridadService {


    // =========================================
    // GUARDAR DENUNCIA
    // =========================================

    Expediente guardarDenuncia(
            Expediente expediente,
            String tipoDocumento,
            String dni,
            String correo,
            String telefono,
            String fechaActoCorrupcion,
            String motivoDenuncia,
            String medidaProteccion,
            String identificacion,
            String sexo,
            String detalle,
            String detalleOtros,
            List<MultipartFile> archivos
    );


    // =========================================
    // LISTAR REGISTRADOS
    // =========================================

    List<IntegridadListadoDTO>
    listarRegistrados();


    // =========================================
    // OBTENER DETALLE
    // =========================================

    IntegridadDetalleDTO obtenerDetalle(
            Long idExpediente
    );


    // =========================================
    // EDITAR DENUNCIA
    // =========================================

    Expediente actualizarDenuncia(

            Long idExpediente,

            String nroDocumento,

            String tipoDocumento,

            String dni,

            String correo,

            String telefono,

            String fechaActoCorrupcion,

            String motivoDenuncia,

            String medidaProteccion,

            String identificacion,

            String sexo,

            String detalle,

            String detalleOtros

    );


    // =========================================
    // ELIMINACIÓN LÓGICA
    // =========================================

    void eliminarDenuncia(
            Long idExpediente
    );

    Expediente enviarANivel3(
            Long idExpediente,
            String usuario
    );

    Expediente devolverDesdeNivel3(
            Long idExpediente,
            String observacion,
            String usuario
    );

}