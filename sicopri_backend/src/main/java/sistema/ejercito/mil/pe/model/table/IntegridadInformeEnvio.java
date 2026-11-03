package sistema.ejercito.mil.pe.model.table;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "INT_INFORME_ENVIO")
public class IntegridadInformeEnvio {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "integridadInformeEnvioSeq"
    )
    @SequenceGenerator(
            name = "integridadInformeEnvioSeq",
            sequenceName = "SEQ_INT_INFORME_ENVIO",
            allocationSize = 1
    )
    @Column(name = "ID_INFORME")
    private Long idInforme;

    @Column(name = "ID_EXPEDIENTE", nullable = false)
    private Long idExpediente;

    @Column(name = "NOMBRE_DOCUMENTO", nullable = false, length = 150)
    private String nombreDocumento;

    @Column(name = "TIPO_DOCUMENTO", nullable = false, length = 100)
    private String tipoDocumento;

    @Column(name = "FECHA_REGISTRO", nullable = false)
    private LocalDate fechaRegistro;

    @Column(name = "NOMBRE_ARCHIVO", nullable = false, length = 255)
    private String nombreArchivo;

    @JsonIgnore
    @Column(name = "RUTA_ARCHIVO", nullable = false, length = 1000)
    private String rutaArchivo;

    @Column(name = "TAMANO", nullable = false)
    private Long tamano;

    @Column(name = "USUARIO_REGISTRO", length = 150)
    private String usuarioRegistro;

    @Column(name = "FECHA_CREACION", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "ACTIVO", nullable = false, length = 1)
    private String activo;
}