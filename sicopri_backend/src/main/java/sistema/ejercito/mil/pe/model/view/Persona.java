package sistema.ejercito.mil.pe.model.view;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Immutable
@Table(name = "EP_PERSONAS")
public class Persona {

    @Id
    @Column(name = "CIP", length = 9)
    private String cip;

    @Column(name = "DNI", length = 20)
    private String dni;

    @Column(name = "CHASQUI", length = 80)
    private String chasqui;

    @Column(name = "VTIPOPERSONA_CODIGO", length = 1)
    private String vTipoPersonaCodigo;

    @Column(name = "GRADO_CODIGO", length = 3)
    private String gradoCodigo;

    @Column(name = "GRADO_NOMBRE", length = 10)
    private String gradoNombre;

    @Column(name = "ARMA_CODIGO", length = 3)
    private String armaCodigo;

    @Column(name = "ARMA_NOMBRE", length = 20)
    private String armaNombre;

    @Column(name = "APELLIDO_PATERNO", length = 100)
    private String apellidoPaterno;

    @Column(name = "APELLIDO_MATERNO", length = 100)
    private String apellidoMaterno;

    @Column(name = "NOMBRES", length = 100)
    private String nombres;

    @Column(name = "NUCLEO_CODIGO", length = 2)
    private String nucleoCodigo;

    @Column(name = "NUCLEO_NOMBRE", length = 15)
    private String nucleoNombre;

    @Column(name = "BRIGADA_CODIGO", length = 4)
    private String brigadaCodigo;

    @Column(name = "BRIGADA_NOMBRE", length = 25)
    private String brigadaNombre;

    @Column(name = "UNIDAD_CODIGO", length = 6)
    private String unidadCodigo;

    @Column(name = "UNIDAD_NOMBRE", length = 40)
    private String unidadNombre;

    @Column(name = "VSITUMIL_CODIGO", length = 1)
    private String situacionMilitarCodigo;

    @Column(name = "VSITUMIL_NOMBRE", length = 20)
    private String situacionMilitarNombre;

    @Column(name = "DMILITARES_FECHING")
    private LocalDateTime fechaIngreso;
}

