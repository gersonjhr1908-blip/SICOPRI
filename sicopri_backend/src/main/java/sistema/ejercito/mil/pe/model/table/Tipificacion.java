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
@Table(name = "EXP_TIPIFICACION")
public class Tipificacion {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "ID_TIPIFICACION")
    private Long idTipificacion;

    @Column(name = "ID_TIPO_EXPEDIENTE")
    private Long idTipoExpediente;

    @Column(name = "CODIGO")
    private String codigo;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "DESCRIPCION")
    private String descripcion;

    @Column(name = "ACTIVO")
    private String activo;
}