package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonaDTO {

    private String cip;
    private String dni;

    private String chasqui;

    private String gradoCodigo;
    private String gradoNombre;

    private String armaCodigo;
    private String armaNombre;

    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombres;

    private String nucleoCodigo;
    private String nucleoNombre;

    private String brigadaCodigo;
    private String brigadaNombre;

    private String unidadCodigo;
    private String unidadNombre;

    private String situacionMilitarCodigo;
    private String situacionMilitarNombre;
}