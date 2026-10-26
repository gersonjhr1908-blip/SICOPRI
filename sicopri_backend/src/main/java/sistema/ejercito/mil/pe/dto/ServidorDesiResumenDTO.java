package sistema.ejercito.mil.pe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServidorDesiResumenDTO {

    private long totalServidores;
    private long totalLinux;
    private long totalWindows;
    private long totalMv;
}
