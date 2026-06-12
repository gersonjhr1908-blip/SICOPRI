package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Datosistemreport {
    private String nombre;
    private String acronimo;
    private String url; //acceso al sistema
    private String estado; //1=prod , 2=desa
    private String responsable; //cip
    private String seccion; //cip
   // private String version;
}
