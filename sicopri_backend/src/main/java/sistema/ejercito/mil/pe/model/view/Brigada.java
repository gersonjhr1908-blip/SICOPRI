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
@Table(name = "BRIGADA")
public class Brigada {

    @Id
    @Column(name = "IDBRIGADA", length = 4)
    private String idBrigada;

    @Column(name = "NOMBRE", length = 55)
    private String nombre;

    @Column(name = "ACRONIMO", length = 20)
    private String acronimo;

    @Column(name = "ESTADO_REGISTRO", length = 1)
    private String estadoRegistro;

    @Column(name = "IDNUCLEO", length = 2)
    private String idNucleo;

    @Column(name = "FECHA")
    private LocalDateTime fecha;
}
