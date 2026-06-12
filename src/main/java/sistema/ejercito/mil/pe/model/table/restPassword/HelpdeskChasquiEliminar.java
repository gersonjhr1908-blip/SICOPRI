package sistema.ejercito.mil.pe.model.table.restPassword;


import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.Email;

import java.io.Serializable;
import java.util.Date;

public class HelpdeskChasquiEliminar implements Serializable {

	@Id

	private Integer IHelpdeskChasqui_id;

	@Column(name = "VHelpdeskChasqui_cip", nullable = false)
	private String cip;

	private String sincip;

	@Column(name = "VHelpdeskChasqui_DNI")
	private String dni;

	@Column(name = "VHelpdeskChasqui_DNI_FAMILIA")
	private String dniFamiliar;

	@Temporal(TemporalType.DATE)
	@Column(name = "DHelpdeskChasqui_fechaEmis")
	private Date fechaEmis;

	@Temporal(TemporalType.DATE)
	@Column(name = "DHelpdeskChasqui_fechaCad")
	private Date fechaCad;

	@Column(name = "VHelpdeskChasqui_ciu", nullable = false)
	private String ciu;

	@Email
	@Column(name = "VHelpdeskChasqui_emailAlt", nullable = false)
	private String emailAlt;

	@Column(name = "VHelpdeskChasqui_estado", nullable = false)
	private String estado;

	@Column(name = "DHelpdeskChasqui_fechaReg")
	private Date fechaReg;

	@Column(name = "VHelpdeskChasqui_userEnv")
	private String userEnv;

	@Column(name = "DHelpdeskChasqui_fechaEnv")
	private Date fechaEnv;

	@Column(name = "VHelpdeskChasqui_cuenta")
	private String cuenta;

	@Column(name = "VHelpdeskChasqui_password")
	private String password;

	@Column(name = "VHELPDESK_CHASQUI_NUMTELEF")
	private String numTelef;

	@Column(name = "VHELPDESK_CHASQUI_ESTADO_CIU")
	private String estadoCiu;

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

}
