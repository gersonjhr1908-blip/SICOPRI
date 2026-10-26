package sistema.ejercito.mil.pe.model.table;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.Immutable;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;

@Entity
@Immutable
@ToString
@Table(name = "CHASQUI_LISTA_EMAILS")
@Getter
@Setter
public class ChasquiListaEmails implements Serializable {

    @Id
    @Column(name = "ID")
    private String id;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "CUENTA")
    private String cuenta;

    @Column(name = "PASSWORD")
    private String password;

    private static final long serialVersionUID = 1L;

}
