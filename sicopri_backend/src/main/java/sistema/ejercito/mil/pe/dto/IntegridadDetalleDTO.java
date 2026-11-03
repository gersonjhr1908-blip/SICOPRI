package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import sistema.ejercito.mil.pe.model.table.DatosPersona;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IntegridadDetalleDTO {

    private Long idExpediente;
    private String cinv;
    private String nroDocumento;
    private LocalDateTime fechaRegistro;

    private Integer idEstado;
    private Integer nivelActual;
    private String categoria;
    private String usuarioRegistro;

    private String idNucleo;
    private String idBrigada;
    private String idUnidad;

    private Integer idNucleoIg;
    private String idIg;
    private Integer nivelDestino;

    private String observacionActual;
    private DatosPersona datosPersona;

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