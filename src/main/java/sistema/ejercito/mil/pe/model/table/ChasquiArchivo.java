package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import java.io.Serializable;
import java.util.Date;

@Entity
@Immutable
@Table(name = "CHASQUI_ARCHIVO")
@Getter
@Setter
public class ChasquiArchivo implements Serializable {

    @Id
    @Column(name = "ID")
    private String id;

    @Column(name = "CIP")
    private String cip;

    @Column(name = "NOMBRES")
    private String nombres;

    @Column(name = "EMAIL")
    private String correoAlt;

    @Column(name = "CUENTA")
    private String cuenta;

    @Column(name = "CLAVE")
    private String clave;

    @Column(name = "FEC_REGISTRO")
    private Date fec_registro;

    @Column(name = "ESTADO")
    private String estado;

    @Column(name = "NUMTELEF")
    private String numTelef;

    @Column(name = "USERNAME_RESET_CHASQUI")
    private String usernameResetChasqui;

    private static final long serialVersionUID = 1L;

}
