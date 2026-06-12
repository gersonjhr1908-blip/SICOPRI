package sistema.ejercito.mil.pe.service;


import sistema.ejercito.mil.pe.client.Response.TwoFactorResponse;

public interface ApiAuthComsumo {



    String swStatusTwoFA(String cip);  TwoFactorResponse saveTwoFactor(String idCip, String username);

    boolean verifyTwoFactor(String cip, String code) throws Exception;

}
