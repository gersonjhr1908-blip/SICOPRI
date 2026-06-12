package sistema.ejercito.mil.pe.model.table;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "CHASQUI_CIU")
@Getter
@Setter
public class DatosCarnetPersona implements Serializable {

	@Id
	@Column(name = "CIU")
	private String ciu;

	@Column(name = "DNI")
	private String dni;

	@Column(name = "CIP")
	private String cip;

	@Column(name = "FEC_TRAMITE")
	private LocalDateTime fecTramite;

	@Column(name = "FEC_PROCE")
	private LocalDateTime fecProce;

	@Column(name = "FEC_CADU")
	private LocalDateTime fecCadu;

	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

}
