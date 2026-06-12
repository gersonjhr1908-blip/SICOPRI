package sistema.ejercito.mil.pe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sistema.ejercito.mil.pe.model.table.ServidorDesi;

/**
 * Proyección liviana para el listado paginado (sin LOB ni campos pesados).
 */
@Getter
@Setter
@NoArgsConstructor
public class SistemaDesiTablaDTO {

    private String id;
    private String acronimo;
    private String nombre;
    private String tipo;
    private String categoria;
    private String estado;
    private String version;
    private String urlProduccion;
    private String idServidor;
    private ServidorDesi servidor;

    public SistemaDesiTablaDTO(
            String id,
            String acronimo,
            String nombre,
            String tipo,
            String categoria,
            String estado,
            String version,
            String urlProduccion,
            String idServidor,
            String servidorIp,
            String servidorNombre) {
        this.id = id;
        this.acronimo = acronimo;
        this.nombre = nombre;
        this.tipo = tipo;
        this.categoria = categoria;
        this.estado = estado;
        this.version = version;
        this.urlProduccion = urlProduccion;
        this.idServidor = idServidor;
        if (servidorIp != null || servidorNombre != null) {
            ServidorDesi mini = new ServidorDesi();
            mini.setIp(servidorIp);
            mini.setNombre(servidorNombre);
            this.servidor = mini;
        }
    }
}
