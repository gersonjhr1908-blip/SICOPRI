package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import java.io.Serializable;
import java.util.Date;

@Entity
@Immutable
@Table(name = "CHASQUI_CORREO")
@Getter
@Setter
public class ChasquiCorreo implements Serializable {

    @Id
    @Column(name = "ID")
    private String id;

    @Column(name = "CIP")
    private String cip;

    @Column(name = "NOMBRES")
    private String nombres;

    @Column(name = "CUENTA")
    private String cuenta;

    @Column(name = "CLAVE")
    private String clave;

    @Column(name = "FEC_REGISTRO")
    private Date fec_registro;

    @Column(name = "VECES")
    private int veces;

    @Column(name = "ULT_FEC")
    private String ultFec;

    @Column(name = "NUMTELEF")
    private String numTelef;

    @Column(name = "CORREO_ALT")
    private String correoAlt;

    private static final long serialVersionUID = 1L;

}
