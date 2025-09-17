package com.dbmodeling.presentation.exception;

import org.springframework.http.HttpStatus;

/**
 * 비즈니스 로직 예외 기본 클래스
 */
public class BusinessException extends RuntimeException {
    
    private final String errorCode;
    private final HttpStatus httpStatus;
    private final Object details;
    
    public BusinessException(String errorCode, String message) {
        this(errorCode, message, HttpStatus.BAD_REQUEST, null);
    }
    
    public BusinessException(String errorCode, String message, HttpStatus httpStatus) {
        this(errorCode, message, httpStatus, null);
    }
    
    public BusinessException(String errorCode, String message, Object details) {
        this(errorCode, message, HttpStatus.BAD_REQUEST, details);
    }
    
    public BusinessException(String errorCode, String message, HttpStatus httpStatus, Object details) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
        this.details = details;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
    
    public Object getDetails() {
        return details;
    }
}