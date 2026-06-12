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

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="EP_PERSONAS")
@Immutable
public class Persona implements Serializable {

    @Id
    @Column (name = "IDMILITAR", updatable = false, nullable = false )
    private String id;

    @Column( name = "DNI")
    private String dni;

    @Column( name ="APELLIDO_PATERNO")
    private String apellidoPaterno;

    @Column( name ="APELLIDO_MATERNO")
    private String apellidoMaterno;

    @Column( name ="NOMBRES")
    private String nombres;

    @Column( name ="GRADO")
    private String grado;

    @Column( name ="ARMESP")
    private String arma;

    @Column( name ="COD_NUCLEO")  //
    private String idnucleo;

    @Column( name ="COD_BRIG") //
    private String idbrigada;

    @Column( name ="COD_UU")//
    private String idunidad;

    @Column( name ="NUCLEO_ACRONIMO")  //
    private String nucleo;

    @Column( name ="BRIG_ACRONIMO") //
    private String brigada;

    @Column( name ="UNIDAD_ACRONIMO")//
    private String unidad;


    @Column( name ="ESTADO")
    private int estado;

    @Column( name = "CHASQUI")
    private String chasqui;





    /**
     *
     */
    private static final long serialVersionUID = 1L;

}

