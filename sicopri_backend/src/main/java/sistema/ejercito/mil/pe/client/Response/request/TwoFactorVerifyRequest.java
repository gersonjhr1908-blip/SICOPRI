package sistema.ejercito.mil.pe.client.Response.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TwoFactorVerifyRequest {

    private String cip;
    private String code;

}

