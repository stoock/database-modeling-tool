package com.dbmodeling.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 인덱스 응답 DTO
 */
@Schema(description = "인덱스 상세 정보")
public class IndexResponse {
    
    @Schema(description = "인덱스 ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private String id;
    
    @Schema(description = "테이블 ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private String tableId;
    
    @Schema(description = "인덱스 이름", example = "IX_User_Email")
    private String name;
    
    @Schema(description = "인덱스 타입", example = "NONCLUSTERED")
    private String type;
    
    @Schema(description = "유니크 인덱스 여부", example = "true")
    private boolean isUnique;
    
    @Schema(description = "인덱스 컬럼 목록")
    private List<IndexSummaryResponse.IndexColumnInfo> columns;
    
    @Schema(description = "생성 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "수정 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime updatedAt;
    
    public IndexResponse() {}
    
    public IndexResponse(String id, String tableId, String name, String type, boolean isUnique,
                        List<IndexSummaryResponse.IndexColumnInfo> columns, 
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.tableId = tableId;
        this.name = name;
        this.type = type;
        this.isUnique = isUnique;
        this.columns = columns;
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
    
    public String getTableId() {
        return tableId;
    }
    
    public void setTableId(String tableId) {
        this.tableId = tableId;
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
    
    public boolean isUnique() {
        return isUnique;
    }
    
    public void setUnique(boolean unique) {
        isUnique = unique;
    }
    
    public List<IndexSummaryResponse.IndexColumnInfo> getColumns() {
        return columns;
    }
    
    public void setColumns(List<IndexSummaryResponse.IndexColumnInfo> columns) {
        this.columns = columns;
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