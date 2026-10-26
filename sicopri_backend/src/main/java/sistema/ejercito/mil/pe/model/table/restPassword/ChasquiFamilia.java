package sistema.ejercito.mil.pe.model.table.restPassword;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import java.io.Serializable;
import java.util.Date;

@Entity
@Immutable
@Table(name = "CHASQUI_FAMILIA", schema = "EP_CHASQUI")
@Getter
@Setter
public class ChasquiFamilia implements Serializable {

    @Id
    @Column(name = "CIF")
    private String cif;

    @Column(name = "CIP")
    private String cip;

    @Column(name = "APENOM")
    private String apenom;

    @Column(name = "SEXO")
    private String sexo;

    @Column(name = "ID_FAM")
    private String idFam;

    @Temporal(TemporalType.DATE)
    @Column(name = "FEC_NAC")
    private Date fecNac;

    @Temporal(TemporalType.DATE)
    @Column(name = "FEC_INSC")
    private Date fecInsc;

    @Column(name = "DOCUMENTO")
    private String documento;

}
