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
@Table(name = "SIQRED_MENU")
public class Menu {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "ID_MENU")
    private Integer idMenu;

    @Column(name = "ICON", nullable = false, length = 20)
    private String icon;

    @Column(name = "NAME", nullable = false, length = 20)
    private String name;

    @Column(name = "URL", nullable = false, length = 50)
    private String url;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "SIQRED_MENU_ROLE",
            joinColumns = @JoinColumn(name = "ID_MENU"),
            inverseJoinColumns = @JoinColumn(name = "ID_ROLE")
    )
    private List<Role> roles;
}