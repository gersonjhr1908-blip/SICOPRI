package sistema.ejercito.mil.pe.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioDtoOut {

	private Long id;
	private String username;
	private Long cip;
	private String grado;
	private String arma;
	private String cargo;
	private String apellidosNombres;
	private String foto;

}
