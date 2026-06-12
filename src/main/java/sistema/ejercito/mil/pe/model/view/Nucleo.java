package sistema.ejercito.mil.pe.model.view;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.Immutable;


@Entity
@Getter
@Immutable
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name="SISLLAA_NUCLEO")
public class Nucleo {

    @Id
    @Column( name = "IDNUCLEO")
    private String id;

    @Column( name = "ACRONIMO")
    private String nombreCorto;

    @Column( name = "NOMBRE")
    private String nombreLargo;

    @Column( name = "ESTADO_REGISTRO")
    private char estado;
}
