package com.dbmodeling.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 표준 API 응답 래퍼 클래스
 * 모든 API 응답에 일관된 구조를 제공합니다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "표준 API 응답")
public class ApiResponse<T> {
    
    @Schema(description = "응답 성공 여부", example = "true")
    private boolean success;
    
    @Schema(description = "응답 데이터")
    private T data;
    
    @Schema(description = "응답 메시지", example = "요청이 성공적으로 처리되었습니다.")
    private String message;
    
    @Schema(description = "에러 정보")
    private ErrorInfo error;
    
    // 기본 생성자
    public ApiResponse() {}
    
    // 성공 응답 생성자
    private ApiResponse(T data, String message) {
        this.success = true;
        this.data = data;
        this.message = message;
    }
    
    // 실패 응답 생성자
    private ApiResponse(ErrorInfo error) {
        this.success = false;
        this.error = error;
    }
    
    /**
     * 성공 응답 생성 (데이터 포함)
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data, null);
    }
    
    /**
     * 성공 응답 생성 (데이터와 메시지 포함)
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(data, message);
    }
    
    /**
     * 성공 응답 생성 (메시지만)
     */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(null, message);
    }
    
    /**
     * 실패 응답 생성
     */
    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(new ErrorInfo(code, message));
    }
    
    /**
     * 실패 응답 생성 (상세 정보 포함)
     */
    public static <T> ApiResponse<T> error(String code, String message, Object details) {
        return new ApiResponse<>(new ErrorInfo(code, message, details));
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public ErrorInfo getError() {
        return error;
    }
    
    public void setError(ErrorInfo error) {
        this.error = error;
    }
    
    /**
     * 에러 정보 클래스
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "에러 정보")
    public static class ErrorInfo {
        @Schema(description = "에러 코드", example = "VALIDATION_ERROR")
        private String code;
        
        @Schema(description = "에러 메시지", example = "입력값이 유효하지 않습니다.")
        private String message;
        
        @Schema(description = "에러 상세 정보")
        private Object details;
        
        public ErrorInfo() {}
        
        public ErrorInfo(String code, String message) {
            this.code = code;
            this.message = message;
        }
        
        public ErrorInfo(String code, String message, Object details) {
            this.code = code;
            this.message = message;
            this.details = details;
        }
        
        // Getters and Setters
        public String getCode() {
            return code;
        }
        
        public void setCode(String code) {
            this.code = code;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public Object getDetails() {
            return details;
        }
        
        public void setDetails(Object details) {
            this.details = details;
        }
    }
}