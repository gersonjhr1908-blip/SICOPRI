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

import java.util.Date;

@Entity
@Getter
@Immutable
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name="VCHASQUI_ANIO")
public class Chasquianio {


        @Id
        @Column( name = "ANIO", unique = true)
        private String anio;

        @Column( name = "CANTIDAD")
        private Integer cantidad;


}
