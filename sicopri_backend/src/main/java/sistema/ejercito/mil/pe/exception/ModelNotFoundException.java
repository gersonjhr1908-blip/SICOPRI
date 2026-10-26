package sistema.ejercito.mil.pe.exception;

//@ResponseStatus(HttpStatus.NOT_FOUND)
public class ModelNotFoundException extends RuntimeException{

    public ModelNotFoundException(String message) {
        super(message);
    }

    private static final long serialVersionUID = 1L;




}
