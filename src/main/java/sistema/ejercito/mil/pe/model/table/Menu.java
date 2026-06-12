package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "CHASQUI_JH_MENU")
public class Menu {

    @Id
    @EqualsAndHashCode.Include
    private Integer idMenu;

    @Column(nullable = false, length = 20)
    private String icon;

    @Column(nullable = false, length = 20)
    private String name;

    @Column(nullable = false, length = 50)
    private String url;



    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "chasqui_menu_role_jh",
            joinColumns = @JoinColumn(name = "id_menu", referencedColumnName = "idMenu"),
            inverseJoinColumns = @JoinColumn(name = "id_role", referencedColumnName = "idRole"))
    private List<Role> roles;

}
