package sistema.ejercito.mil.pe.model.table;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "JH_SERV_AUDIT")
public class ServidorAudit implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_JH_SERV_AUDIT")
    @SequenceGenerator(name = "SEQ_JH_SERV_AUDIT", sequenceName = "SEQ_JH_SERV_AUDIT", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "IPSERV", length = 45)
    private String ipServ;

    /** view = reveló credencial de un servidor; pdf = descargó PDF de credenciales */
    @Column(name = "TIPO", length = 20)
    private String tipo;

    @Column(name = "USERNAME", length = 100, nullable = false)
    private String username;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "FECHA_HORA", nullable = false)
    private LocalDateTime fechaHora;
}
