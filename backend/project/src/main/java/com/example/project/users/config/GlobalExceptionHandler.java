package com.example.project.users.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * خطاهای احراز هویت — مخصوصاً حساب معلق (تعلیق‌شده) تا کاربر دلیل آن را ببیند
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        String message = "نام کاربری یا رمز عبور اشتباه است";

        if (ex instanceof LockedException) {
            status = HttpStatus.LOCKED;
            message = "اکانت شما تعلیق شده است. برای رفع تعلیق با پشتیبانی تماس بگیرید.";
        } else if (ex instanceof DisabledException) {
            status = HttpStatus.FORBIDDEN;
            message = "اکانت شما غیرفعال است. برای رفع تعلیق با پشتیبانی تماس بگیرید.";
        } else if (ex instanceof BadCredentialsException) {
            status = HttpStatus.UNAUTHORIZED;
            message = "نام کاربری یا رمز عبور اشتباه است";
        }

        logger.warn("Authentication error ({}): {}", status.value(), ex.getMessage());
        return ResponseEntity.status(status).body(Map.of(
                "success", false,
                "message", message,
                "status", status.value()
        ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        logger.error("Handling ResponseStatusException: {}", ex.getMessage());
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
                "success", false,
                "message", ex.getReason() != null ? ex.getReason() : "خطا",
                "status", ex.getStatusCode().value()
        ));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFoundException(NoResourceFoundException ex) {
        logger.warn("Resource not found: {}", ex.getResourcePath());
        Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "Resource not found",
                "message", "The requested endpoint does not exist: " + ex.getResourcePath(),
                "status", HttpStatus.NOT_FOUND.value()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        logger.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", ex.getMessage() != null ? ex.getMessage() : "Internal server error",
                "status", HttpStatus.INTERNAL_SERVER_ERROR.value()
        ));
    }
}