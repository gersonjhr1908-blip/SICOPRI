package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "Helpdesk_chasqui")
@Getter
@Setter
@ToString
public class HelpdeskChasqui implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_HCHASQUI_ID")
	@SequenceGenerator(name = "SEQ_HCHASQUI_ID", allocationSize = 1, sequenceName = "SEQ_HCHASQUI_ID")
	private Integer IHelpdeskChasqui_id;

	@Column(name = "VHelpdeskChasqui_cip", nullable = false)
	private String cip;

	@Column(name = "VHelpdeskChasqui_DNI")
	private String dni;

	//@Temporal(TemporalType.DATE)
	@Column(name = "DHelpdeskChasqui_fechaEmis")
	private Date fechaEmis;

	//@Temporal(TemporalType.DATE)
	@Column(name = "DHelpdeskChasqui_fechaCad")
	private Date fechaCad;

	@Column(name = "VHELPDESK_CHASQUI_CIU")
	private String ciu;

	@Email
	@Column(name = "VHELPDESK_CHASQUI_EMAIL_ALT")
	private String emailAlt;

	@Column(name = "VHELPDESK_CHASQUI_ESTADO") //1   2   3        4
	private String estado;

	@Column(name = "DHELPDESK_CHASQUI_FECHA_REG")
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

	@Column(name = "VHelpdeskChasqui_DNI_FAMILIA")
	private String dniFamiliar;

	@Column(name = "VHELPDESK_CHASQUI_ESTADO_CIU")
	private String estadoCiu;

	@Column(name = "USERNAME_RESET_CHASQUI", nullable = true)
	private String usernameResetChasqui;

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

}
