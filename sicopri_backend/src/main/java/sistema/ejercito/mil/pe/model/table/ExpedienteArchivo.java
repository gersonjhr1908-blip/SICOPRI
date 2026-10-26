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
@Table(name = "EXP_EXPEDIENTE_ARCHIVO")
public class ExpedienteArchivo {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "SEQ_EXP_EXPEDIENTE_ARCHIVO"
    )
    @SequenceGenerator(
            name = "SEQ_EXP_EXPEDIENTE_ARCHIVO",
            sequenceName = "SEQ_EXP_EXPEDIENTE_ARCHIVO",
            allocationSize = 1
    )
    @Column(name = "ID_ARCHIVO")
    private Long idArchivo;


    // =========================================
    // EXPEDIENTE AL QUE PERTENECE EL PDF
    // =========================================

    @Column(name = "ID_EXPEDIENTE", nullable = false)
    private Long idExpediente;


    // =========================================
    // NOMBRE ORIGINAL DEL ARCHIVO
    // Ejemplo: oficio_123.pdf
    // =========================================

    @Column(name = "NOMBRE_ARCHIVO", length = 255, nullable = false)
    private String nombreArchivo;


    // =========================================
    // NOMBRE INTERNO GUARDADO EN SERVIDOR
    // =========================================

    @Column(name = "NOMBRE_GUARDADO", length = 255, nullable = false)
    private String nombreGuardado;


    // =========================================
    // TIPO MIME
    // application/pdf
    // =========================================

    @Column(name = "TIPO_ARCHIVO", length = 100)
    private String tipoArchivo;


    // =========================================
    // TAMAÑO EN BYTES
    // =========================================

    @Column(name = "TAMANO")
    private Long tamano;


    // =========================================
    // RUTA FÍSICA DEL ARCHIVO
    // =========================================

    @Column(name = "RUTA_ARCHIVO", length = 1000, nullable = false)
    private String rutaArchivo;


    // =========================================
    // FECHA DE REGISTRO
    // =========================================

    @Column(name = "FECHA_REGISTRO")
    private LocalDateTime fechaRegistro;


    // =========================================
    // ACTIVO
    // S / N
    // =========================================

    @Column(name = "ACTIVO", length = 1)
    private String activo;

}