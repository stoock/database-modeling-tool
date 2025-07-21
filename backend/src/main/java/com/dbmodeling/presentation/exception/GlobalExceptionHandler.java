package com.dbmodeling.presentation.exception;

import com.dbmodeling.presentation.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 전역 예외 처리 핸들러
 * 모든 컨트롤러에서 발생하는 예외를 일관된 형태로 처리합니다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    /**
     * Bean Validation 예외 처리 (@Valid 어노테이션)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException ex) {
        logger.warn("Validation error occurred: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ApiResponse<Object> response = ApiResponse.error(
            "VALIDATION_ERROR",
            "입력값이 유효하지 않습니다.",
            errors
        );
        
        return ResponseEntity.badRequest().body(response);
    }
    
    /**
     * Constraint Validation 예외 처리
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolationException(ConstraintViolationException ex) {
        logger.warn("Constraint violation occurred: {}", ex.getMessage());
        
        Map<String, String> errors = ex.getConstraintViolations().stream()
            .collect(Collectors.toMap(
                violation -> violation.getPropertyPath().toString(),
                ConstraintViolation::getMessage
            ));
        
        ApiResponse<Object> response = ApiResponse.error(
            "CONSTRAINT_VIOLATION",
            "제약 조건을 위반했습니다.",
            errors
        );
        
        return ResponseEntity.badRequest().body(response);
    }
    
    /**
     * 타입 변환 예외 처리
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatchException(MethodArgumentTypeMismatchException ex) {
        logger.warn("Type mismatch error occurred: {}", ex.getMessage());
        
        String message = String.format("파라미터 '%s'의 값 '%s'이(가) 올바른 형식이 아닙니다.", 
            ex.getName(), ex.getValue());
        
        ApiResponse<Object> response = ApiResponse.error(
            "TYPE_MISMATCH",
            message
        );
        
        return ResponseEntity.badRequest().body(response);
    }
    
    /**
     * JSON 파싱 예외 처리
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        logger.warn("JSON parsing error occurred: {}", ex.getMessage());
        
        ApiResponse<Object> response = ApiResponse.error(
            "JSON_PARSE_ERROR",
            "요청 데이터 형식이 올바르지 않습니다."
        );
        
        return ResponseEntity.badRequest().body(response);
    }
    
    /**
     * 비즈니스 로직 예외 처리
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(BusinessException ex) {
        logger.warn("Business exception occurred: {}", ex.getMessage());
        
        ApiResponse<Object> response = ApiResponse.error(
            ex.getErrorCode(),
            ex.getMessage(),
            ex.getDetails()
        );
        
        return ResponseEntity.status(ex.getHttpStatus()).body(response);
    }
    
    /**
     * 리소스를 찾을 수 없는 예외 처리
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        logger.warn("Resource not found: {}", ex.getMessage());
        
        ApiResponse<Object> response = ApiResponse.error(
            "RESOURCE_NOT_FOUND",
            ex.getMessage()
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    /**
     * 일반적인 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        logger.error("Unexpected error occurred", ex);
        
        ApiResponse<Object> response = ApiResponse.error(
            "INTERNAL_SERVER_ERROR",
            "서버 내부 오류가 발생했습니다."
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}