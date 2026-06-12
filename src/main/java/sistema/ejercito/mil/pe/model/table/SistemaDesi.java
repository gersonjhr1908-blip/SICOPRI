package sistema.ejercito.mil.pe.model.table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "JH_SISTEMAS_DESI")
public class SistemaDesi implements Serializable {

    @Id
    @Column(name = "ID", nullable = false, length = 20)
    private String id;

    @Column(name = "ID_SERVIDOR", nullable = false, length = 20)
    private String idServidor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_SERVIDOR", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordConsole", "passwordServ"})
    private ServidorDesi servidor;

    @Column(name = "ACRONIMO", length = 30)
    private String acronimo;

    @Column(name = "NOMBRE", nullable = false, length = 200)
    private String nombre;

    @Column(name = "TIPO", length = 20)
    private String tipo;

    @Column(name = "CATEGORIA", length = 20)
    private String categoria;

    @Column(name = "ESTADO", length = 20)
    private String estado;

    @Column(name = "URL_PRODUCCION", length = 300)
    private String urlProduccion;

    @Column(name = "DESCRIPCION", length = 1000)
    private String descripcion;

    @Column(name = "VERSION", length = 50)
    private String version;

    @Column(name = "ID_PADRE", length = 20)
    private String idPadre;

    @Column(name = "DOBLE_FACTOR")
    private Boolean dobleFactor;

    @Lob
    @Column(name = "IMG_FRONT")
    private String imgFront;

    @Column(name = "DEPENDENCIA_ADMIN", length = 200)
    private String dependenciaAdmin;

    @Column(name = "FECHA_REGISTRO")
    private LocalDateTime fechaRegistro;

    @Column(name = "FECHA_ACTUALIZACION")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    public void prePersist() {
        LocalDateTime ahora = LocalDateTime.now();
        this.fechaRegistro = ahora;
        this.fechaActualizacion = ahora;
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
