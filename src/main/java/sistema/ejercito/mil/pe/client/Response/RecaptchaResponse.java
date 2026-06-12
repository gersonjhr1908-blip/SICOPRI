package sistema.ejercito.mil.pe.client.Response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class RecaptchaResponse {

    @JsonProperty("success")
    private boolean success;

    @JsonProperty("challenge_ts")
    private String challengeTs;

    @JsonProperty("hostname")
    private String hostname;
}
