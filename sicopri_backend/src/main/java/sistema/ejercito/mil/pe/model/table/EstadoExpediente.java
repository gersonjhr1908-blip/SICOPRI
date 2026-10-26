package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "EXP_ESTADO_EXPEDIENTE")
public class EstadoExpediente {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "ID_ESTADO")
    private Long idEstado;

    @Column(name = "CODIGO")
    private String codigo;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "DESCRIPCION")
    private String descripcion;

    @Column(name = "ORDEN_FLUJO")
    private Long ordenFlujo;

    @Column(name = "ESTADO_FINAL")
    private String estadoFinal;

    @Column(name = "ACTIVO")
    private String activo;
}