package sistema.ejercito.mil.pe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ServidorAuditRequestDTO {

    /** ID del servidor (JH_SERVIDORES_DESI) para resolver la IP. */
    private String idServidor;
}
