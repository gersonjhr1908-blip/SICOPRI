package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(
        name = "EXP_EXPEDIENTE_RESPUESTA",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UK_RESPUESTA_NUMERO",
                        columnNames = {
                                "ID_EXPEDIENTE",
                                "NUMERO_INFORME"
                        }
                )
        }
)
public class ExpedienteRespuesta {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "SEQ_EXP_EXPEDIENTE_RESPUESTA"
    )
    @SequenceGenerator(
            name = "SEQ_EXP_EXPEDIENTE_RESPUESTA",
            sequenceName = "SEQ_EXP_EXPEDIENTE_RESPUESTA",
            allocationSize = 1
    )
    @Column(name = "ID_RESPUESTA")
    private Long idRespuesta;


    @Column(name = "ID_EXPEDIENTE", nullable = false)
    private Long idExpediente;


    @Column(name = "NUMERO_INFORME", nullable = false)
    private Integer numeroInforme;


    @Column(
            name = "NOMBRE_DOCUMENTO",
            length = 255,
            nullable = false
    )
    private String nombreDocumento;


    @Column(
            name = "TIPO_DOCUMENTO",
            length = 100,
            nullable = false
    )
    private String tipoDocumento;


    @Lob
    @Column(
            name = "DESCRIPCION",
            nullable = false
    )
    private String descripcion;


    // Siempre QRD4
    @Column(
            name = "NIVEL_ORIGEN",
            nullable = false
    )
    private Integer nivelOrigen;


    // Destino final: QRD2.
    // QRD3 solo revisa y funciona como puente.
    @Column(
            name = "NIVEL_DESTINO",
            nullable = false
    )
    private Integer nivelDestino;


    @Column(
            name = "FECHA_DOCUMENTO",
            nullable = false
    )
    private LocalDate fechaDocumento;


    // Único PDF por informe
    @Column(
            name = "NOMBRE_ARCHIVO",
            length = 255,
            nullable = false
    )
    private String nombreArchivo;


    @Column(
            name = "NOMBRE_GUARDADO",
            length = 255,
            nullable = false
    )
    private String nombreGuardado;


    @Column(
            name = "TIPO_ARCHIVO",
            length = 100,
            nullable = false
    )
    private String tipoArchivo;


    @Column(
            name = "TAMANO",
            nullable = false
    )
    private Long tamano;


    @Column(
            name = "RUTA_ARCHIVO",
            length = 1000,
            nullable = false
    )
    private String rutaArchivo;


    @Column(
            name = "USUARIO_REGISTRO",
            length = 150,
            nullable = false
    )
    private String usuarioRegistro;


    @Column(name = "FECHA_REGISTRO")
    private LocalDateTime fechaRegistro;


    @Column(
            name = "ACTIVO",
            length = 1
    )
    private String activo;
}