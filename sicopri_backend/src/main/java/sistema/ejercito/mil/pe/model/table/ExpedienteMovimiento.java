package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "EXP_EXPEDIENTE_MOVIMIENTO")
public class ExpedienteMovimiento {


    // =========================================
    // ID MOVIMIENTO
    // =========================================

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "SEQ_EXP_EXPEDIENTE_MOV"
    )
    @SequenceGenerator(
            name = "SEQ_EXP_EXPEDIENTE_MOV",
            sequenceName = "SEQ_EXP_EXPEDIENTE_MOV",
            allocationSize = 1
    )
    @Column(name = "ID_MOVIMIENTO")
    private Long idMovimiento;


    // =========================================
    // EXPEDIENTE
    // =========================================

    @Column(
            name = "ID_EXPEDIENTE",
            nullable = false
    )
    private Long idExpediente;


    // =========================================
    // NIVEL ORIGEN
    //
    // 2 = QRD NIVEL 2
    // 3 = QRD NIVEL 3
    // 4 = QRD NIVEL 4
    // =========================================

    @Column(name = "NIVEL_ORIGEN")
    private Integer nivelOrigen;


    // =========================================
    // NIVEL DESTINO
    // =========================================

    @Column(name = "NIVEL_DESTINO")
    private Integer nivelDestino;


    // =========================================
    // ACCIÓN
    //
    // ENVIADO
    // OBSERVADO
    // CONCLUIDO
    // =========================================

    @Column(
            name = "ACCION",
            length = 50
    )
    private String accion;


    // =========================================
    // OBSERVACIÓN DEL MOVIMIENTO
    // =========================================

    @Column(
            name = "OBSERVACION",
            length = 2000
    )
    private String observacion;


    // =========================================
    // USUARIO QUE REALIZÓ LA ACCIÓN
    // =========================================

    @Column(
            name = "USUARIO",
            length = 100
    )
    private String usuario;


    // =========================================
    // FECHA DEL MOVIMIENTO
    //
    // OJO:
    // LA TABLA EXISTENTE USA FECHA_MOVIMIENTO
    // =========================================

    @Column(name = "FECHA_MOVIMIENTO")
    private LocalDateTime fechaMovimiento;


    // =========================================
    // ACTIVO
    // =========================================

    @Column(
            name = "ACTIVO",
            length = 1
    )
    private String activo;

}