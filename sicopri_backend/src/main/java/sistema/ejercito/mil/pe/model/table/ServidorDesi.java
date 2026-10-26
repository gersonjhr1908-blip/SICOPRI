package sistema.ejercito.mil.pe.model.table;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "JH_SERVIDORES_DESI")
public class ServidorDesi implements Serializable {

    @Id
    @Column(name = "ID", nullable = false, length = 20,unique = true)
    private String id;

    @Column(name = "TIPO", length = 10)
    private String tipo;

    @Column(name = "NOMBRE", nullable = false, length = 150)
    private String nombre;

    @Column(name = "IP", length = 45,unique = true)
    private String ip;

    @Column(name = "DOMINIO", length = 200)
    private String dominio;

    @Column(name = "TIPO_SSOO", length = 20)
    private String tipoSsoo;

    @Column(name = "SSOO", length = 100)
    private String ssoo;

    @Column(name = "RAM", length = 50)
    private String ram;

    @Column(name = "DD_TOTAL", length = 50)
    private String ddTotal;

    @Column(name = "SERV_APP", length = 100)
    private String servApp;

    @Column(name = "DESCRIPCION", length = 500)
    private String descripcion;

    @Column(name = "URL_CONSOLE", length = 300)
    private String urlConsole;

    @Column(name = "USUARIO_CONSOLE", length = 100)
    private String usuarioConsole;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    @Column(name = "PASSWORD_CONSOLE", length = 500)
    private String passwordConsole;

    @Column(name = "RES", length = 20)
    private String res;

    @Column(name = "USUARIO_SERV", length = 100)
    private String usuarioServ;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    @Column(name = "PASSWORD_SERV", length = 500)
    private String passwordServ;

    @JsonProperty("passwordConsole")
    public void setPasswordConsole(String passwordConsole) {
        this.passwordConsole = passwordConsole;
    }

    @JsonIgnore
    public String getPasswordConsole() {
        return passwordConsole;
    }

    @JsonProperty("passwordServ")
    public void setPasswordServ(String passwordServ) {
        this.passwordServ = passwordServ;
    }

    @JsonIgnore
    public String getPasswordServ() {
        return passwordServ;
    }

    @Transient
    private Boolean tienePasswordServ;

    @Transient
    private Boolean tienePasswordConsole;

    @Transient
    private Boolean tieneUsuarioServ;

    /** Conteo de sistemas (JH_SISTEMAS_DESI) por ID_SERVIDOR; solo para listado. */
    @Transient
    private Long cantidadSistemas;

    @Column(name = "OBSERVACION", length = 1000)
    private String observacion;

    @Column(name = "ACCESO", length = 100)
    private String acceso;

    @ColumnDefault("0")
    @Column(name = "CHANGE_PASSWORD", nullable = false)
    private Boolean changePassword = Boolean.FALSE;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "FECHA_REGISTRO")
    private LocalDateTime fechaRegistro;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "FECHA_ACTUALIZACION")
    private LocalDateTime fechaActualizacion;

    @Column(name = "USER_SAVE", length = 100)
    private String userSave;

    @Column(name = "USER_UPDATE", length = 100)
    private String userUpdate;

    @PrePersist
    public void prePersist() {
        LocalDateTime ahora = LocalDateTime.now();
        this.fechaRegistro = ahora;
        this.fechaActualizacion = ahora;
        if (this.changePassword == null) {
            this.changePassword = Boolean.FALSE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
