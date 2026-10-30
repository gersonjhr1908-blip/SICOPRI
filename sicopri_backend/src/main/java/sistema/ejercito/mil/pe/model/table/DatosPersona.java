package sistema.ejercito.mil.pe.model.table;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class DatosPersona {

    @Column(name = "PERSONA_NOMBRES", length = 100)
    private String nombres;

    @Column(name = "PERSONA_APELLIDOS", length = 150)
    private String apellidos;

    @Column(name = "PERSONA_RUC", length = 11)
    private String ruc;

    @Column(name = "PERSONA_DNI", length = 8)
    private String dni;

    @Column(name = "PERSONA_TELEFONO", length = 25)
    private String telefono;

    @Column(name = "PERSONA_DOMICILIO", length = 250)
    private String domicilio;

    @Column(name = "PERSONA_CORREO", length = 254)
    private String correo;

    public void validarYNormalizar() {
        nombres = normalizar(nombres, 100, "Nombres");
        apellidos = normalizar(apellidos, 150, "Apellidos");
        ruc = normalizar(ruc, 11, "RUC");
        dni = normalizar(dni, 8, "DNI");
        telefono = normalizar(telefono, 25, "Teléfono");
        domicilio = normalizar(domicilio, 250, "Domicilio");
        correo = normalizar(correo, 254, "Correo");

        if (ruc != null && !ruc.matches("[0-9]{11}")) {
            throw new IllegalArgumentException(
                    "El RUC debe contener 11 dígitos."
            );
        }

        if (dni != null && !dni.matches("[0-9]{8}")) {
            throw new IllegalArgumentException(
                    "El DNI debe contener 8 dígitos."
            );
        }

        if (correo != null &&
                !correo.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException(
                    "El correo electrónico no tiene un formato válido."
            );
        }
    }

    private String normalizar(
            String valor,
            int maximo,
            String campo
    ) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        String resultado = valor.trim();

        if (resultado.length() > maximo) {
            throw new IllegalArgumentException(
                    campo + ": máximo " + maximo + " caracteres."
            );
        }

        return resultado;
    }
}