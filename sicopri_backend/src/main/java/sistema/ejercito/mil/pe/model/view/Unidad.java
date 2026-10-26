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
@Table(name = "UNIDAD_ALL")
public class Unidad {

    @Id
    @Column(name = "IDUNIDAD", length = 6)
    private String idUnidad;

    @Column(name = "NOMBRE", length = 120)
    private String nombre;

    @Column(name = "ACRONIMO", length = 40)
    private String acronimo;

    @Column(name = "GUARNICION", length = 61)
    private String guarnicion;

    @Column(name = "ESTADO_REGISTRO", length = 1)
    private String estadoRegistro;

    @Column(name = "IDNUCLEO", length = 2)
    private String idNucleo;

    @Column(name = "IDBRIGADA", length = 4)
    private String idBrigada;

    @Column(name = "UBIGEO", length = 6)
    private String ubigeo;

    @Column(name = "FECHA")
    private LocalDateTime fecha;
}

