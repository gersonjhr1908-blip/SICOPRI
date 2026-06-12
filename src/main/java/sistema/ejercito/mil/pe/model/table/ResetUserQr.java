package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;


import java.util.Date;

@Entity
@Immutable
@Table(name = "THOFA_RESETQR")
@Getter
@Setter
public class ResetUserQr {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "CIP_USER_UPDATED_QR",nullable = false)
	private String cipqr;

	@Column(name = "MODIFICATION_DATE",nullable = false)
	private Date fechaActualizacion;

	@Column(name = "NAME_USER_UPDATER",nullable = false)
	private String usuarioModifica;

	@Column(name = "CIP_USER_UPDATER",nullable = false)
	private String cip;

}

