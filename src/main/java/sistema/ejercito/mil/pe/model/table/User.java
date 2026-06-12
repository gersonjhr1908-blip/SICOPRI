package sistema.ejercito.mil.pe.model.table;


import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "JH_RECOVER_CHASQUI_USUARIOS")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_PUSUARIOS_CHASQUI_ID")
    @SequenceGenerator(name = "SEQ_PUSUARIOS_CHASQUI_ID", allocationSize = 1, sequenceName = "SEQ_PUSUARIOS_CHASQUI_ID")
    private Long idUser;

    @Column(length = 50, unique = true, nullable = false)
    private String username;

    @Column( nullable = false)
    private String cip;

   @Column(length =70)
    private String fullname;

   // @Column( length = 20)
   // private String arma;

   // @Column(length = 150)
   // private String fullname;

   // @Column( length = 150)
   // private String cargo;

   // @Column(length = 90)
  //  private String telefono;

    @Column(length = 2 )
    private int estado; // 1 activo 2 desactivado

/*
    @ManyToOne( fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private Nucleo nucleo;

    @ManyToOne( fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private Brigada brigada;

    @ManyToOne( fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private Dependencia dependencia;

*/
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "chasqui_user_role_jh",
            joinColumns = @JoinColumn(name = "id_user", referencedColumnName = "idUser"),
            inverseJoinColumns = @JoinColumn(name = "id_role", referencedColumnName = "idRole"))
    private List<Role> roles;

}


