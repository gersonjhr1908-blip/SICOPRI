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
@Table(name = "EXP_TIPO_EXPEDIENTE")
public class TipoExpediente {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "ID_TIPO_EXPEDIENTE")
    private Long idTipoExpediente;

    @Column(name = "ID_DEPARTAMENTO")
    private Long idDepartamento;

    @Column(name = "CODIGO")
    private String codigo;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "DESCRIPCION")
    private String descripcion;

    @Column(name = "CONFIDENCIAL_DEFECTO")
    private String confidencialDefecto;

    @Column(name = "ACTIVO")
    private String activo;
}