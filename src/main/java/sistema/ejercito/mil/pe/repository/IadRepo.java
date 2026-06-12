package sistema.ejercito.mil.pe.repository;

import org.springframework.stereotype.Repository;

@Repository
public interface IadRepo {

    boolean login(String sLogin, String sClave) throws Exception;

    boolean loginLda(String usuario, String clave , String lda) throws Exception;
}
