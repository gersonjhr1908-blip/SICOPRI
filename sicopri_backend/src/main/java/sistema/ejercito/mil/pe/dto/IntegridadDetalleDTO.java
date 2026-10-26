package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IntegridadDetalleDTO {

    // =========================================
    // DATOS GENERALES
    // =========================================

    private Long idExpediente;

    private String cinv;

    private String nroDocumento;

    private LocalDateTime fechaRegistro;

    private Integer idEstado;

    private Integer nivelActual;

    private String categoria;

    private String usuarioRegistro;


    // =========================================
    // DATOS INTEGRIDAD
    // =========================================

    private String tipoDocumento;

    private String dni;

    private String correo;

    private String telefono;

    private LocalDate fechaActoCorrupcion;

    private String motivoDenuncia;

    private String medidaProteccion;

    private String identificacion;

    private String sexo;

    private String detalle;

    private String detalleOtros;

}