package com.dbmodeling.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 테이블 응답 DTO
 */
@Schema(description = "테이블 상세 정보")
public class TableResponse {
    
    @Schema(description = "테이블 ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private String id;
    
    @Schema(description = "프로젝트 ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private String projectId;
    
    @Schema(description = "테이블 이름", example = "User")
    private String name;
    
    @Schema(description = "테이블 설명", example = "사용자 정보를 저장하는 테이블")
    private String description;
    
    @Schema(description = "캔버스 X 좌표", example = "100")
    private int positionX;
    
    @Schema(description = "캔버스 Y 좌표", example = "200")
    private int positionY;
    
    @Schema(description = "컬럼 목록")
    private List<ColumnResponse> columns;
    
    @Schema(description = "인덱스 목록")
    private List<IndexSummaryResponse> indexes;
    
    @Schema(description = "생성 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "수정 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime updatedAt;
    
    public TableResponse() {}
    
    public TableResponse(String id, String projectId, String name, String description,
                        int positionX, int positionY, List<ColumnResponse> columns,
                        List<IndexSummaryResponse> indexes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.projectId = projectId;
        this.name = name;
        this.description = description;
        this.positionX = positionX;
        this.positionY = positionY;
        this.columns = columns;
        this.indexes = indexes;
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
    
    public String getProjectId() {
        return projectId;
    }
    
    public void setProjectId(String projectId) {
        this.projectId = projectId;
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
    
    public int getPositionX() {
        return positionX;
    }
    
    public void setPositionX(int positionX) {
        this.positionX = positionX;
    }
    
    public int getPositionY() {
        return positionY;
    }
    
    public void setPositionY(int positionY) {
        this.positionY = positionY;
    }
    
    public List<ColumnResponse> getColumns() {
        return columns;
    }
    
    public void setColumns(List<ColumnResponse> columns) {
        this.columns = columns;
    }
    
    public List<IndexSummaryResponse> getIndexes() {
        return indexes;
    }
    
    public void setIndexes(List<IndexSummaryResponse> indexes) {
        this.indexes = indexes;
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