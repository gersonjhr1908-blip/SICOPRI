package sistema.ejercito.mil.pe.model.view;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import java.io.Serializable;

@Entity
@Immutable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "SISLLAA_UNIDAD")
public class Dependencia implements Serializable {

    @Id
    @Column(name = "IDUNIDAD")
    private String id;

    @Column(name = "ACRONIMO")
    private String nombreCorto;

    @Column(name = "ESTADO_REGISTRO")
    private char estado;

    @Column(name = "IDBRIGADA")
    private String idBrigada;

    @Column(name = "UBIGEO")
    private String ubigeo;

    //private static final long serialVersionUID = 1L;

}
