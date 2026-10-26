package sistema.ejercito.mil.pe.model.table;

public class RandomPassword {
    //copiado
    public static String NUMEROS = "0123789";
    public static String MAYUSCULAS = "ABCDEFGUVWXYZ";
    public static String MINUSCULAS = "abcdefguvwxyz";
    public static String ESPECIALES = "$%#*";

    public static String getPinNumber() {
        return getPassword(NUMEROS, 4);
    }

    public static String getPassword() {
        return getPassword(8);
    }

    public static String getPassword(int length) {
        return getPassword(NUMEROS + MAYUSCULAS + MINUSCULAS + ESPECIALES, length);
    }

    public static String getPassword(String key, int length) {
        String pswd = "";

        for (int i = 0; i < length; i++) {
            pswd += (key.charAt((int) (Math.random() * key.length())));
        }

        return pswd;
    }
}
