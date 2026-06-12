package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "USER_DATA_QR")
public class User_Data {


    @Id
    @Column
    private String idCip;

    @Column(length = 50, unique = true, nullable = true)
    private String username;

    @Column( length = 100)
    private String secret;

    @Column( length = 1)
    private Integer status;


}
