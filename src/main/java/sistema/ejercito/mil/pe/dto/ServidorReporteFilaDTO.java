package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServidorReporteFilaDTO {

    private int numero;
    private String nombre;
    private String ip;
    private String sistemaOperativo;
    private String tipoSsoo;
    private String servApp;
    private String dominio;
    private String sistemas;
}
