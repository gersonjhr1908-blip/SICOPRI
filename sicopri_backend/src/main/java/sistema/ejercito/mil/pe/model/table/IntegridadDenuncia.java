package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "INT_DENUNCIA")
@NoArgsConstructor
@AllArgsConstructor
public class IntegridadDenuncia {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "SEQ_INT_DENUNCIA_GEN"
    )
    @SequenceGenerator(
            name = "SEQ_INT_DENUNCIA_GEN",
            sequenceName = "SEQ_INT_DENUNCIA",
            allocationSize = 1
    )
    @Column(name = "ID_DENUNCIA")
    private Long idDenuncia;


    @Column(name = "ID_EXPEDIENTE", nullable = false)
    private Long idExpediente;


    @Column(name = "TIPO_DOCUMENTO", length = 50)
    private String tipoDocumento;


    @Column(name = "DNI", length = 20)
    private String dni;


    @Column(name = "CORREO", length = 150)
    private String correo;


    @Column(name = "TELEFONO", length = 30)
    private String telefono;


    @Column(name = "FECHA_ACTO_CORRUPCION")
    private LocalDate fechaActoCorrupcion;


    @Column(name = "MOTIVO_DENUNCIA", length = 100)
    private String motivoDenuncia;


    @Column(name = "MEDIDA_PROTECCION", length = 100)
    private String medidaProteccion;


    @Column(name = "IDENTIFICACION", length = 50)
    private String identificacion;


    @Column(name = "SEXO", length = 30)
    private String sexo;


    @Column(name = "DETALLE", length = 3000)
    private String detalle;


    @Column(name = "DETALLE_OTROS", length = 3000)
    private String detalleOtros;
}