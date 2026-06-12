package sistema.ejercito.mil.pe.client.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TwoFactorResponse {

    private String secretImageUri;
    private int status;
}

