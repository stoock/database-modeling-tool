package com.dbmodeling.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

/**
 * 프로젝트 수정 요청 DTO
 */
@Schema(description = "프로젝트 수정 요청")
public class UpdateProjectRequest {
    
    @Schema(description = "프로젝트 이름", example = "사용자 관리 시스템 v2")
    @Size(min = 1, max = 255, message = "프로젝트 이름은 1자 이상 255자 이하여야 합니다.")
    private String name;
    
    @Schema(description = "프로젝트 설명", example = "업데이트된 사용자 관리 데이터베이스 스키마")
    @Size(max = 1000, message = "프로젝트 설명은 1000자 이하여야 합니다.")
    private String description;
    
    @Schema(description = "네이밍 규칙 설정")
    private NamingRulesRequest namingRules;
    
    public UpdateProjectRequest() {}
    
    public UpdateProjectRequest(String name, String description, NamingRulesRequest namingRules) {
        this.name = name;
        this.description = description;
        this.namingRules = namingRules;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public NamingRulesRequest getNamingRules() {
        return namingRules;
    }
    
    public void setNamingRules(NamingRulesRequest namingRules) {
        this.namingRules = namingRules;
    }
}