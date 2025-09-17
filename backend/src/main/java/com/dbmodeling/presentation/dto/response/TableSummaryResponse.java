package com.dbmodeling.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * 테이블 요약 응답 DTO
 */
@Schema(description = "테이블 요약 정보")
public class TableSummaryResponse {
    
    @Schema(description = "테이블 ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private String id;
    
    @Schema(description = "테이블 이름", example = "User")
    private String name;
    
    @Schema(description = "테이블 설명", example = "사용자 정보 테이블")
    private String description;
    
    @Schema(description = "컬럼 개수", example = "8")
    private int columnCount;
    
    @Schema(description = "인덱스 개수", example = "3")
    private int indexCount;
    
    @Schema(description = "캔버스 X 좌표", example = "100")
    private int positionX;
    
    @Schema(description = "캔버스 Y 좌표", example = "200")
    private int positionY;
    
    @Schema(description = "생성 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "수정 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime updatedAt;
    
    public TableSummaryResponse() {}
    
    public TableSummaryResponse(String id, String name, String description, 
                               int columnCount, int indexCount, 
                               int positionX, int positionY,
                               LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.columnCount = columnCount;
        this.indexCount = indexCount;
        this.positionX = positionX;
        this.positionY = positionY;
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
    
    public int getColumnCount() {
        return columnCount;
    }
    
    public void setColumnCount(int columnCount) {
        this.columnCount = columnCount;
    }
    
    public int getIndexCount() {
        return indexCount;
    }
    
    public void setIndexCount(int indexCount) {
        this.indexCount = indexCount;
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