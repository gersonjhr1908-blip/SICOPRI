package sistema.ejercito.mil.pe.service.impl;

import sistema.ejercito.mil.pe.client.Response.RecaptchaResponse;
import sistema.ejercito.mil.pe.util.constants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor

public class RecaptchaService {

    private final RestTemplate restTemplate;

    public boolean verify(String response) {
        MultiValueMap<String, String> param = new LinkedMultiValueMap<>();
        param.add("secret", constants.RECAPTCHA_SECRET_KEY);
        param.add("response", response);

        RecaptchaResponse recaptchaResponse = null;
        try {
            recaptchaResponse = this.restTemplate.postForObject(constants.RECAPTCHA_VERIFY_URL, param, RecaptchaResponse.class);
        } catch (RestClientException e) {
            System.out.print(e.getMessage());
        }
        if (recaptchaResponse.isSuccess()) {
            return true;
        } else {
            return false;
        }
    }
}

