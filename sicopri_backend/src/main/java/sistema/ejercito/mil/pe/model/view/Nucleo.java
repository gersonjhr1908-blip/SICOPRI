
package sistema.ejercito.mil.pe.model.view;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Immutable
@Table(name = "NUCLEO")
public class Nucleo {

    @Id
    @Column(name = "IDNUCLEO", length = 2)
    private String idNucleo;

    @Column(name = "NOMBRE", length = 60)
    private String nombre;

    @Column(name = "ACRONIMO", length = 15)
    private String acronimo;

    @Column(name = "ESTADO_REGISTRO", length = 1)
    private String estadoRegistro;

    @Column(name = "FECHA")
    private LocalDateTime fecha;
}
