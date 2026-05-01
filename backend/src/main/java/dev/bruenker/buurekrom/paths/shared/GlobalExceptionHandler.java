package dev.bruenker.buurekrom.paths.shared;

import dev.bruenker.buurekrom.paths.exception.InvalidCredentialsException;
import dev.bruenker.buurekrom.paths.exception.NotFoundException;
import dev.bruenker.buurekrom.paths.exception.UsernameAlreadyTakenException;
import dev.bruenker.buurekrom.paths.shared.geojson.InvalidGeoJsonException;
import jakarta.annotation.Nonnull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    @Nonnull
    public ResponseEntity<ErrorResponse> handleNotFound(@Nonnull final NotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(UsernameAlreadyTakenException.class)
    @Nonnull
    public ResponseEntity<ErrorResponse> handleUsernameTaken(@Nonnull final UsernameAlreadyTakenException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(InvalidGeoJsonException.class)
    @Nonnull
    public ResponseEntity<ErrorResponse> handleInvalidGeoJson(@Nonnull final InvalidGeoJsonException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    @Nonnull
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(@Nonnull final InvalidCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @Nonnull
    public ResponseEntity<ErrorResponse> handleValidation(@Nonnull final MethodArgumentNotValidException ex) {
        final String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return build(HttpStatus.BAD_REQUEST, message.isEmpty() ? "Validation failed" : message);
    }

    @Nonnull
    private static ResponseEntity<ErrorResponse> build(@Nonnull final HttpStatus status, @Nonnull final String message) {
        return ResponseEntity.status(status)
                .body(ErrorResponse.of(status.value(), status.getReasonPhrase(), message));
    }
}
