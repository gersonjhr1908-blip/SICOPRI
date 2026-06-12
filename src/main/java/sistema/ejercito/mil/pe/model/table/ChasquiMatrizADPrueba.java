package sistema.ejercito.mil.pe.model.table;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "JH_USUARIOS_AD")
public class ChasquiMatrizADPrueba {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cip;      // sn
    private String username;      // sAMAccountName
    private String email;         // mail o userPrincipalName
   // private String nombres;       // givenName
 //   private String apellidos;     //
    private String nombreCompleto;// displayName o cn
    private String dn;            // distinguishedName
    private String guid;          // objectGUID

    @Column(name = "estado_cuenta", length = 30)
    private String estadoCuenta;  // ACTIVO, BLOQUEADO, DESHABILITADO...
    @Column(name = "estado_cuenta_boolean", length = 30)
    private boolean activo;       // userAccountControl
    @Column(name = "grupos_ad", length = 2000)
    private String gruposAd;      // grupos de AD (memberOf)

    private LocalDateTime fechaRegistro = LocalDateTime.now();

    // getters y setters
}