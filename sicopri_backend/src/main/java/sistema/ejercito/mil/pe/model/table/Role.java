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
@Table(name = "SIQRED_ROL")
public class Role {

    @Id
    @Column(name = "ID_ROL")
    private Integer idRole;

    @Column(name = "NOMBRE")
    private String name;

    @Column(name = "DESCRIPCION")
    private String description;
}