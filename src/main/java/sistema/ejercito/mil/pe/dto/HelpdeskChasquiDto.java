package sistema.ejercito.mil.pe.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class HelpdeskChasquiDto {

    private Integer IHelpdeskChasqui_id;
    private String cip;
    private String dni;
    private Date fechaEmis;
    private Date fechaCad;
    private String ciu;
    private String emailAlt;
    private String estado;
    private String userEnv;
    private Date fechaEnv;
    private String cuenta;
    private String password;
    private String numTelef;
    private String dniFamiliar;
    private String estadoCiu;
    private String usernameResetChasqui;


    private String tokenRecaptcha;



}
