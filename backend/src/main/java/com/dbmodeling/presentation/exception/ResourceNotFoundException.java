package com.dbmodeling.presentation.exception;

/**
 * 리소스를 찾을 수 없을 때 발생하는 예외
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceType, Object id) {
        super(String.format("%s를 찾을 수 없습니다. ID: %s", resourceType, id));
    }
    
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}