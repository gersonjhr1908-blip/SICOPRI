package sistema.ejercito.mil.pe.model.table;

import lombok.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "CHASQUI_MATRIZ")
public class ChasquiMatriz implements Serializable{

	@Id
	@Column(name = "VCHASQUI_CIP", nullable = false,unique = true)
	private String id;

	@Column(name = "VCHASQUI_CUENTA", nullable = false,unique = true)
	private String cuenta; //username

	@Column(name = "VCHASQUI_DESCRIPCION", nullable = false)
	private String descripcion;//grado arma apellidos y nombres

	@Column(name = "VCHASQUI_NAME", nullable = false)
	private String name;//NOMBRE COMPLETO*/

	@Column(name = "VCHASQUI_EMAIL", nullable = false)
	private String email;//@ejercito.mil.pe

	@Column(name = "VCHASQUI_TIPO")
	private String tipo;//TIPO DE PERSONA

	@Column(name = "VCHASQUI_DIRECTORY", nullable = false)
	private String directorio;//DIRECTORIO



}
