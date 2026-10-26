package sistema.ejercito.mil.pe.service.impl;
import sistema.ejercito.mil.pe.client.Response.TwoFactorResponse;
import sistema.ejercito.mil.pe.client.Response.request.TwoFactorRequest;
import sistema.ejercito.mil.pe.client.Response.request.TwoFactorVerifyRequest;
import sistema.ejercito.mil.pe.service.ApiAuthComsumo;
import sistema.ejercito.mil.pe.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

    @Service
    @RequiredArgsConstructor
    public class ApiAuthComsumoImpl implements ApiAuthComsumo {

        private final RestTemplate restTemplate;
        private final IUserService serviceUser;

        @Override
        public String swStatusTwoFA(String cip) {

            String url = "https://twofac.ejercito.mil.pe/doble-factor/twofa/" + cip;
            String response = restTemplate.getForObject(url, String.class);
            return response;
        }

        @Override
        public TwoFactorResponse saveTwoFactor(String idCip, String username) {
            String url = "https://twofac.ejercito.mil.pe/doble-factor/twofa/save";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            TwoFactorRequest request = new TwoFactorRequest(idCip, username);
            HttpEntity<TwoFactorRequest> requestEntity = new HttpEntity<>(request, headers);

            ResponseEntity<TwoFactorResponse> responseEntity = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    TwoFactorResponse.class
            );

            return responseEntity.getBody();
        }

        public boolean verifyTwoFactor(String cip, String code) throws Exception {

            String url = "https://twofac.ejercito.mil.pe/doble-factor/twofa/verify";
            TwoFactorVerifyRequest request = new TwoFactorVerifyRequest(cip, code);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<TwoFactorVerifyRequest> entity = new HttpEntity<>(request, headers);

            try {
                ResponseEntity<Void> response = restTemplate.postForEntity(url, entity, Void.class);

                return response.getStatusCode() == HttpStatus.OK;

            } catch (HttpClientErrorException e) {
                throw new Exception("Error del cliente al verificar el código 2FA" , e);
            } catch (HttpServerErrorException e) {
                throw new Exception("Error del servidor al verificar el código 2FA" , e);
            } catch (RestClientException e) {
                throw new Exception("Error al realizar la solicitud para verificar el código 2FA", e);
            } catch (Exception e) {
                throw new Exception("Error inesperado al verificar el código 2FA", e);
            }
        }
    }
