package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "EXP_SITUACION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Situacion {

    @Id
    @Column(name = "ID_SITUACION")
    private Long idSituacion;

    @Column(name = "CODIGO")
    private String codigo;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "ACTIVO")
    private String activo;
}