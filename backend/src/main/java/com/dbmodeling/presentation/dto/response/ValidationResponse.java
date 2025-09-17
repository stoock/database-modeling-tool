package com.dbmodeling.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * 네이밍 규칙 검증 응답 DTO
 */
@Schema(description = "네이밍 규칙 검증 결과")
public class ValidationResponse {
    
    @Schema(description = "검증 성공 여부", example = "true")
    private boolean isValid;
    
    @Schema(description = "검증된 이름", example = "User")
    private String name;
    
    @Schema(description = "검증 타입", example = "TABLE")
    private String type;
    
    @Schema(description = "검증 오류 목록")
    private List<ValidationError> errors;
    
    @Schema(description = "수정 제안")
    private String suggestion;
    
    public ValidationResponse() {}
    
    public ValidationResponse(boolean isValid, String name, String type, 
                             List<ValidationError> errors, String suggestion) {
        this.isValid = isValid;
        this.name = name;
        this.type = type;
        this.errors = errors;
        this.suggestion = suggestion;
    }
    
    // Getters and Setters
    public boolean isValid() {
        return isValid;
    }
    
    public void setValid(boolean valid) {
        isValid = valid;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public List<ValidationError> getErrors() {
        return errors;
    }
    
    public void setErrors(List<ValidationError> errors) {
        this.errors = errors;
    }
    
    public String getSuggestion() {
        return suggestion;
    }
    
    public void setSuggestion(String suggestion) {
        this.suggestion = suggestion;
    }
    
    /**
     * 검증 오류 정보
     */
    @Schema(description = "검증 오류 정보")
    public static class ValidationError {
        @Schema(description = "오류 코드", example = "NAMING_PATTERN_VIOLATION")
        private String code;
        
        @Schema(description = "오류 메시지", example = "테이블명이 네이밍 패턴을 위반했습니다.")
        private String message;
        
        @Schema(description = "위반된 규칙", example = "^[A-Z][a-zA-Z0-9]*$")
        private String rule;
        
        public ValidationError() {}
        
        public ValidationError(String code, String message, String rule) {
            this.code = code;
            this.message = message;
            this.rule = rule;
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
        
        public String getRule() {
            return rule;
        }
        
        public void setRule(String rule) {
            this.rule = rule;
        }
    }
}