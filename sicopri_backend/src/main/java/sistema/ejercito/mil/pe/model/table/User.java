package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "SIQRED_USER_DATA")
public class User {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "SEQ_PUSUARIOS_CHASQUI_ID"
    )
    @SequenceGenerator(
            name = "SEQ_PUSUARIOS_CHASQUI_ID",
            sequenceName = "SEQ_PUSUARIOS_CHASQUI_ID",
            allocationSize = 1
    )
    @Column(name = "ID_USER")
    private Long idUser;

    @Column(
            name = "USERNAME",
            length = 50,
            unique = true,
            nullable = false
    )
    private String username;

    @Column(name = "CIP")
    private String cip;

    @Column(name = "FULLNAME", length = 150)
    private String fullname;

    @Column(name = "GRADO")
    private String grado;

    @Column(name = "ARMA")
    private String arma;

    @Column(name = "ESTADO")
    private int estado;

    @Column(name = "F_ACTIVO")
    private LocalDateTime fechaActivo;

    @Column(name = "F_REGISTRO")
    private LocalDateTime fechaRegistro;

    @Column(name = "ID_NUCLEO")
    private String idNucleo;

    @Column(name = "ID_BRIGADA")
    private String idBrigada;

    @Column(name = "ID_UNIDAD")
    private String idUnidad;

    @Column(name = "ID_NUCLEO_IG", length = 50)
    private String idNucleoIg;

    @Column(name = "ID_IG", length = 50)
    private String idIg;

    @Column(name = "ROLE_ACTIVE_ID_ROLE")
    private Integer roleActiveIdRole;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "SIQRED_USER_ROLE",
            joinColumns = @JoinColumn(name = "ID_USER"),
            inverseJoinColumns = @JoinColumn(name = "ID_ROLE")
    )
    private List<Role> roles;
}