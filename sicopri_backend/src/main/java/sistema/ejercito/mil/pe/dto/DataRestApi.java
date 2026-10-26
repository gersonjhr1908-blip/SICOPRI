package sistema.ejercito.mil.pe.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DataRestApi {
    @NotBlank(message = "cip es requerido")
    private String cip;
    @NotBlank(message = "cipuserlog es requerido")
    private String cipuserlog;
  //  private String password;
}
