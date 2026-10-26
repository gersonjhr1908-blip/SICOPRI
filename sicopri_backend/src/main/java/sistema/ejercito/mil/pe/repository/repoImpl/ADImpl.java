package sistema.ejercito.mil.pe.repository.repoImpl;

import sistema.ejercito.mil.pe.repository.IadRepo;
import sistema.ejercito.mil.pe.util.constants;

import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

import static sistema.ejercito.mil.pe.util.constants.*;


public class ADImpl implements IadRepo {

    DirContext ctx;

    @Override
    public boolean login(String username, String password) {

        boolean resp = false;
        String[] tipos = {SSOO, TCOS, OFICIALES, PC, GRL_BRIG, GRL_DIV};

        try {
            for (String tipo : tipos) {
                resp = loginLda(username, password, tipo);
                if (resp) break;
            }
        } catch (Exception ex) {
            resp = false;
        }
        return resp;
    }

    @Override
    public boolean loginLda(String username, String password, String tipo) throws Exception {

        Hashtable env = new Hashtable();
        env.put(Context.INITIAL_CONTEXT_FACTORY, constants.LDA_FACTORY);
        env.put(Context.PROVIDER_URL, constants.LDAP_URL);
        env.put(Context.SECURITY_AUTHENTICATION, constants.LDA_SIMPLE);
        env.put(Context.SECURITY_PRINCIPAL, "CN=" + username.toUpperCase() + ",OU=" + tipo + ", OU=CHASQUI, DC=ep,DC=mil,DC=pe");
        env.put(Context.SECURITY_CREDENTIALS, password);
        try {
            ctx = new InitialDirContext(env);
            return true;
        } catch (NamingException ex) {
        }
        return false;
    }
}



