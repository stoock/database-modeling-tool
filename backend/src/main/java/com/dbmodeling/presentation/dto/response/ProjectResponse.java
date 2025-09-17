package com.dbmodeling.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 프로젝트 응답 DTO
 */
@Schema(description = "프로젝트 정보")
public class ProjectResponse {
    
    @Schema(description = "프로젝트 ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private String id;
    
    @Schema(description = "프로젝트 이름", example = "사용자 관리 시스템")
    private String name;
    
    @Schema(description = "프로젝트 설명", example = "사용자 관리를 위한 데이터베이스 스키마")
    private String description;
    
    @Schema(description = "네이밍 규칙 설정")
    private NamingRulesResponse namingRules;
    
    @Schema(description = "테이블 목록")
    private List<TableSummaryResponse> tables;
    
    @Schema(description = "생성 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "수정 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime updatedAt;
    
    public ProjectResponse() {}
    
    public ProjectResponse(String id, String name, String description, 
                          NamingRulesResponse namingRules, List<TableSummaryResponse> tables,
                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.namingRules = namingRules;
        this.tables = tables;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public NamingRulesResponse getNamingRules() {
        return namingRules;
    }
    
    public void setNamingRules(NamingRulesResponse namingRules) {
        this.namingRules = namingRules;
    }
    
    public List<TableSummaryResponse> getTables() {
        return tables;
    }
    
    public void setTables(List<TableSummaryResponse> tables) {
        this.tables = tables;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}