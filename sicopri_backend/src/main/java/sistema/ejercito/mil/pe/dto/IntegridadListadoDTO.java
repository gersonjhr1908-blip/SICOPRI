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
public class IntegridadListadoDTO {

    private Long idExpediente;

    private String cinv;

    private LocalDateTime fechaRegistro;

    private LocalDate fechaActoCorrupcion;

    private String motivoDenuncia;

    private Integer idEstado;

    private String estado;

}