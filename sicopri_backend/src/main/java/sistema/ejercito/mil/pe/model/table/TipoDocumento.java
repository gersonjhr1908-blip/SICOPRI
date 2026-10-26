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
@Table(name = "EXP_TIPO_DOCUMENTO")
public class TipoDocumento {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "ID_TIPO_DOCUMENTO")
    private Long idTipoDocumento;

    @Column(name = "CODIGO")
    private String codigo;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "DESCRIPCION")
    private String descripcion;

    @Column(name = "ACTIVO")
    private String activo;
}