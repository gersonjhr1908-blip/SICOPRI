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
@Table(name = "EXP_EXPEDIENTE")
public class Expediente {


    // ==========================================
    // ID DEL EXPEDIENTE
    // ==========================================

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "SEQ_EXP_EXPEDIENTE"
    )
    @SequenceGenerator(
            name = "SEQ_EXP_EXPEDIENTE",
            sequenceName = "SEQ_EXP_EXPEDIENTE",
            allocationSize = 1
    )
    @Column(name = "ID_EXPEDIENTE")
    private Long idExpediente;


    // ==========================================
    // TIPO DE EXPEDIENTE
    //
    // EN QRD SE MOSTRARÁ COMO:
    // CATEGORÍA
    //
    // 1 = DENUNCIA
    // 2 = QUEJA
    // 3 = RECLAMO
    // 5 = DENUNCIA CORRUPCIÓN / INTEGRIDAD
    // ==========================================

    @Column(
            name = "ID_TIPO_EXPEDIENTE",
            nullable = false
    )
    private Integer idTipoExpediente;


    // ==========================================
    // TIPO DE DOCUMENTO
    // ==========================================

    @Column(
            name = "ID_TIPO_DOCUMENTO",
            nullable = false
    )
    private Integer idTipoDocumento;


    // ==========================================
    // OTRO TIPO DE DOCUMENTO
    //
    // SOLO SE USA CUANDO:
    // TIPO DOCUMENTO = OTROS
    //
    // EJ:
    // MEMORANDUM
    // PARTE
    // ACTA
    // ETC
    // ==========================================

    @Column(
            name = "OTRO_TIPO_DOCUMENTO",
            length = 150
    )
    private String otroTipoDocumento;


    // ==========================================
    // TIPIFICACIÓN
    // ==========================================

    @Column(name = "ID_TIPIFICACION")
    private Integer idTipificacion;


    // ==========================================
    // ESTADO INTERNO DEL EXPEDIENTE
    // ==========================================

    @Column(
            name = "ID_ESTADO",
            nullable = false
    )
    private Integer idEstado;


    // ==========================================
    // CIP
    // ==========================================

    @Column(
            name = "CIP",
            length = 20
    )
    private String cip;


    // ==========================================
    // NÚMERO DE DOCUMENTO
    // ==========================================

    @Column(
            name = "NRO_DOCUMENTO",
            length = 100
    )
    private String nroDocumento;


    // ==========================================
    // FECHA DEL DOCUMENTO
    // ==========================================

    @Column(name = "FECHA_DOCUMENTO")
    private LocalDate fechaDocumento;


    // ==========================================
    // UBICACIÓN ORIGINAL DEL DOCUMENTO
    //
    // NÚCLEO
    // GRAN UNIDAD
    // UNIDAD
    // ==========================================

    @Column(
            name = "ID_NUCLEO",
            length = 50
    )
    private String idNucleo;


    @Column(
            name = "ID_BRIGADA",
            length = 50
    )
    private String idBrigada;


    @Column(
            name = "ID_UNIDAD",
            length = 50
    )
    private String idUnidad;


    // ==========================================
    // NÚCLEO IG
    //
    // Ejemplo:
    // 45 = V DIVISION DE EJERCITO
    // ==========================================

    @Column(name = "ID_NUCLEO_IG")
    private Integer idNucleoIg;


    // ==========================================
    // IG
    //
    // GUARDA IDBRIGADA
    //
    // Ejemplo:
    // 0864 = 5A BRIGADA DE SERVICIOS
    // ==========================================

    @Column(
            name = "ID_IG",
            length = 20
    )
    private String idIg;


    // ==========================================
    // DESTINO FINAL ELEGIDO POR QRD NIVEL 2
    //
    // 3 = INSPECTORÍA QRD NIVEL 3
    // 4 = INSPECTORÍA QRD NIVEL 4
    //
    // IMPORTANTE:
    //
    // Si destino = 4:
    //
    // QRD 2 -> QRD 3 -> QRD 4
    //
    // QRD 3 SIGUE SIENDO EL PUENTE.
    // ==========================================

    @Column(name = "NIVEL_DESTINO")
    private Integer nivelDestino;


    // ==========================================
    // ASUNTO
    // ==========================================

    @Column(
            name = "ASUNTO",
            length = 300,
            nullable = false
    )
    private String asunto;


    // ==========================================
    // DESCRIPCIÓN
    // ==========================================

    @Column(
            name = "DESCRIPCION",
            length = 2000
    )
    private String descripcion;


    // ==========================================
    // USUARIO QUE REGISTRÓ
    // ==========================================

    @Column(
            name = "USUARIO_REGISTRO",
            length = 50
    )
    private String usuarioRegistro;


    // ==========================================
    // FECHA REAL DE REGISTRO
    // ==========================================

    @Column(name = "FECHA_REGISTRO")
    private LocalDateTime fechaRegistro;


    // ==========================================
    // REGISTRO ACTIVO
    //
    // S = ACTIVO
    // N = INACTIVO
    // ==========================================

    @Column(
            name = "ACTIVO",
            length = 1
    )
    private String activo;


    // ==========================================
    // CATEGORÍA / DISCRIMINADOR INTERNO
    //
    // IMPORTANTE:
    //
    // QRD YA NO USARÁ
    // INTERNO / EXTERNO.
    //
    // ESTA COLUMNA SE CONSERVA PORQUE
    // INTEGRIDAD UTILIZA:
    //
    // CATEGORIA = INTEGRIDAD
    // ==========================================

    @Column(
            name = "CATEGORIA",
            length = 20
    )
    private String categoria;


    // ==========================================
    // SITUACIÓN GENERAL
    // ==========================================

    @Column(name = "ID_SITUACION")
    private Integer idSituacion;


    // ==========================================
    // CÓDIGO CINV
    // ==========================================

    @Column(
            name = "CINV",
            length = 100
    )
    private String cinv;




// NIVEL DE CREACIÓN
//
// INDICA EN QUÉ NIVEL NACIÓ EL EXPEDIENTE.
//
// 2 = QRD NIVEL 2
// 3 = QRD NIVEL 3
// 4 = QRD NIVEL 4
//
// ESTE VALOR NO DEBE CAMBIAR DURANTE
// EL FLUJO DEL EXPEDIENTE.


    @Column(name = "NIVEL_CREACION")
    private Integer nivelCreacion;

    // NIVEL ACTUAL
    //
    // REPRESENTA DÓNDE ESTÁ AHORA.
    //
    // 2 = QRD NIVEL 2
    // 3 = QRD NIVEL 3
    // 4 = QRD NIVEL 4
    //
    // NO CONFUNDIR CON NIVEL_DESTINO.
    //
    // Ej:
    //
    // nivelDestino = 4
    // nivelActual  = 3
    //
    // significa:
    // destino final N4,
    // pero actualmente está pasando por N3.
    // ==========================================

    @Column(name = "NIVEL_ACTUAL")
    private Integer nivelActual;


    // OBSERVACIÓN ACTUAL


    @Column(
            name = "OBSERVACION_ACTUAL",
            length = 2000
    )
    private String observacionActual;

}