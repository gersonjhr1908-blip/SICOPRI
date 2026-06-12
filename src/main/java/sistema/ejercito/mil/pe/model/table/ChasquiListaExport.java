package sistema.ejercito.mil.pe.model.table;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.Date;

@Entity
@Immutable
@Table(name = "CHASQUI_LISTA_EXPORT")
@Getter
@Setter
public class ChasquiListaExport implements Serializable {

    @Id
    @Column(name = "ID")
    private String id;

    @Column(name = "CIP")
    private String cip;

    @Column(name = "DESCRIPCION")
    private String descripcion;

    @Column(name = "NOMBRES")
    private String nombres;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "CUENTA")
    private String cuenta;

    @Column(name = "CLAVE")
    private String clave;

    @Column(name = "FEC_REGISTRO")
    private Date fec_registro;

    @Column(name = "VECES")
    private int veces;

    @Column(name = "ULT_FEC")
    private String ult_fec;

    @Column(name = "CELULAR")
    private String celular;

    @Column(name = "DIRECTORIO")
    private String directorio;

}
