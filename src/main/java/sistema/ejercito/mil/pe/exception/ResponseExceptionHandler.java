package sistema.ejercito.mil.pe.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

//@Slf4j
@RestControllerAdvice
public class ResponseExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        CustomErrorResponse err = new CustomErrorResponse(
                LocalDateTime.now(),
                "Error de validación: " + errors,
                request.getDescription(false));
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CustomErrorResponse> handleAllException(Exception ex, WebRequest request) {
        CustomErrorResponse err = new CustomErrorResponse(
                LocalDateTime.now(),
                ex.getMessage(),
                request.getDescription(false));
        return new ResponseEntity<>(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ModelNotFoundException.class)
    public ResponseEntity<CustomErrorResponse> handleModelNotFoundException(ModelNotFoundException ex, WebRequest request) {
        CustomErrorResponse err = new CustomErrorResponse(
                LocalDateTime.now(),
                ex.getMessage(),
                request.getDescription(false));
        ;

        return new ResponseEntity<>(err, HttpStatus.NOT_FOUND);
    }
}





    //Desde Spring Boot 3
    /*@ExceptionHandler(ModelNotFoundException.class)
    public ProblemDetail handleModelNotFoundException(ModelNotFoundException ex, WebRequest request){
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setTitle("Mot Not Found Exception");
        problemDetail.setType(URI.create(request.getDescription(false)));
        problemDetail.setProperty("extra1", "extra-value");
        problemDetail.setProperty("extra2", 33);
        return problemDetail;
    }*/

    /*@ExceptionHandler(ModelNotFoundException.class)
    public ErrorResponse handleModelNotFoundException(ModelNotFoundException ex, WebRequest request){
        return ErrorResponse.builder(ex, HttpStatus.NOT_FOUND, ex.getMessage())
                .title("Model Not Found Exception")
                .type(URI.create(request.getContextPath()))
                .property("extra1", "extra-value")
                .property("extra2", 32)
                .build();
    }*/



