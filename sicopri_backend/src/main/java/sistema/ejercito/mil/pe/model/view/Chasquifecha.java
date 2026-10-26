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
@Table(name="VCHASQUI_DIA")
public class Chasquifecha {


        @Id
        @Column( name = "FECHA", unique = true)
        private Date fecha;

        @Column( name = "CANTIDAD")
        private Integer cantidad;


}
