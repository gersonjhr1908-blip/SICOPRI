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

import java.time.LocalDate;
import java.util.Date;


    @Entity
    @Getter
    @Immutable
    @ToString
    @NoArgsConstructor
    @AllArgsConstructor
    @Table(name="VCHASQUI_MES")
    public class Chasquimes {


        @Id
        @Column( name = "ANIO_MES", unique = true)
        private String fecha;

        @Column( name = "CANTIDAD")
        private Integer cantidad;



}
