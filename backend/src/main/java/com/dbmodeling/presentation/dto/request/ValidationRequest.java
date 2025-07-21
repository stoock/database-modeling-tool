package com.dbmodeling.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * 네이밍 규칙 검증 요청 DTO
 */
@Schema(description = "네이밍 규칙 검증 요청")
public class ValidationRequest {
    
    @Schema(description = "검증할 이름", example = "User", required = true)
    @NotBlank(message = "검증할 이름은 필수입니다.")
    private String name;
    
    @Schema(description = "검증 타입", example = "TABLE", required = true, allowableValues = {"TABLE", "COLUMN", "INDEX"})
    @NotBlank(message = "검증 타입은 필수입니다.")
    private String type;
    
    public ValidationRequest() {}
    
    public ValidationRequest(String name, String type) {
        this.name = name;
        this.type = type;
    }
    
    // Getters and Setters
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
}