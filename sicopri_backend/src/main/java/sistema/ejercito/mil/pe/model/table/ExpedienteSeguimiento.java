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
@Table(name = "EXP_EXPEDIENTE_SEGUIMIENTO")
public class ExpedienteSeguimiento {


    // =========================================
    // ID SEGUIMIENTO
    // =========================================

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "SEQ_EXP_EXPEDIENTE_SEG"
    )
    @SequenceGenerator(
            name = "SEQ_EXP_EXPEDIENTE_SEG",
            sequenceName = "SEQ_EXP_EXPEDIENTE_SEG",
            allocationSize = 1
    )
    @Column(name = "ID_SEGUIMIENTO")
    private Long idSeguimiento;


    // =========================================
    // EXPEDIENTE
    // =========================================

    @Column(
            name = "ID_EXPEDIENTE",
            nullable = false
    )
    private Long idExpediente;


    // =========================================
    // FECHA INICIO
    // =========================================

    @Column(
            name = "FECHA_INICIO",
            nullable = false
    )
    private LocalDate fechaInicio;


    // =========================================
    // FECHA FIN
    // =========================================

    @Column(
            name = "FECHA_FIN",
            nullable = false
    )
    private LocalDate fechaFin;


    // =========================================
    // CANTIDAD DE DÍAS
    // =========================================

    @Column(
            name = "CANTIDAD_DIAS",
            nullable = false
    )
    private Integer cantidadDias;


    // =========================================
    // USUARIO QUE REGISTRÓ
    // =========================================

    @Column(
            name = "USUARIO_REGISTRO",
            length = 100
    )
    private String usuarioRegistro;


    // =========================================
    // FECHA DE REGISTRO
    // =========================================

    @Column(
            name = "FECHA_REGISTRO",
            nullable = false
    )
    private LocalDateTime fechaRegistro;


    // =========================================
    // USUARIO QUE MODIFICÓ
    // =========================================

    @Column(
            name = "USUARIO_MODIFICA",
            length = 100
    )
    private String usuarioModifica;


    // =========================================
    // FECHA DE MODIFICACIÓN
    // =========================================

    @Column(name = "FECHA_MODIFICA")
    private LocalDateTime fechaModifica;


    // =========================================
    // ACTIVO
    //
    // S = ACTIVO
    // N = INACTIVO
    // =========================================

    @Column(
            name = "ACTIVO",
            length = 1,
            nullable = false
    )
    private String activo;

}