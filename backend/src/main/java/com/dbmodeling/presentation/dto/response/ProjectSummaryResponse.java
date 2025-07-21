package com.dbmodeling.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * 프로젝트 요약 응답 DTO (목록 조회용)
 */
@Schema(description = "프로젝트 요약 정보")
public class ProjectSummaryResponse {
    
    @Schema(description = "프로젝트 ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private String id;
    
    @Schema(description = "프로젝트 이름", example = "사용자 관리 시스템")
    private String name;
    
    @Schema(description = "프로젝트 설명", example = "사용자 관리를 위한 데이터베이스 스키마")
    private String description;
    
    @Schema(description = "테이블 개수", example = "5")
    private int tableCount;
    
    @Schema(description = "생성 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "수정 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime updatedAt;
    
    public ProjectSummaryResponse() {}
    
    public ProjectSummaryResponse(String id, String name, String description, 
                                 int tableCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.tableCount = tableCount;
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
    
    public int getTableCount() {
        return tableCount;
    }
    
    public void setTableCount(int tableCount) {
        this.tableCount = tableCount;
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