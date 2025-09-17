package com.dbmodeling.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * 컬럼 응답 DTO
 */
@Schema(description = "컬럼 상세 정보")
public class ColumnResponse {
    
    @Schema(description = "컬럼 ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private String id;
    
    @Schema(description = "테이블 ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private String tableId;
    
    @Schema(description = "컬럼 이름", example = "user_id")
    private String name;
    
    @Schema(description = "컬럼 설명", example = "사용자 고유 식별자")
    private String description;
    
    @Schema(description = "데이터 타입", example = "BIGINT")
    private String dataType;
    
    @Schema(description = "최대 길이", example = "255")
    private Integer maxLength;
    
    @Schema(description = "정밀도", example = "18")
    private Integer precision;
    
    @Schema(description = "소수점 자릿수", example = "2")
    private Integer scale;
    
    @Schema(description = "NULL 허용 여부", example = "false")
    private boolean isNullable;
    
    @Schema(description = "기본키 여부", example = "true")
    private boolean isPrimaryKey;
    
    @Schema(description = "자동증가 여부", example = "true")
    private boolean isIdentity;
    
    @Schema(description = "자동증가 시작값", example = "1")
    private Integer identitySeed;
    
    @Schema(description = "자동증가 증가값", example = "1")
    private Integer identityIncrement;
    
    @Schema(description = "기본값", example = "GETDATE()")
    private String defaultValue;
    
    @Schema(description = "컬럼 순서", example = "1")
    private int orderIndex;
    
    @Schema(description = "생성 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "수정 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime updatedAt;
    
    public ColumnResponse() {}
    
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getDataType() {
        return dataType;
    }
    
    public void setDataType(String dataType) {
        this.dataType = dataType;
    }
    
    public Integer getMaxLength() {
        return maxLength;
    }
    
    public void setMaxLength(Integer maxLength) {
        this.maxLength = maxLength;
    }
    
    public Integer getPrecision() {
        return precision;
    }
    
    public void setPrecision(Integer precision) {
        this.precision = precision;
    }
    
    public Integer getScale() {
        return scale;
    }
    
    public void setScale(Integer scale) {
        this.scale = scale;
    }
    
    public boolean isNullable() {
        return isNullable;
    }
    
    public void setNullable(boolean nullable) {
        isNullable = nullable;
    }
    
    public boolean isPrimaryKey() {
        return isPrimaryKey;
    }
    
    public void setPrimaryKey(boolean primaryKey) {
        isPrimaryKey = primaryKey;
    }
    
    public boolean isIdentity() {
        return isIdentity;
    }
    
    public void setIdentity(boolean identity) {
        isIdentity = identity;
    }
    
    public Integer getIdentitySeed() {
        return identitySeed;
    }
    
    public void setIdentitySeed(Integer identitySeed) {
        this.identitySeed = identitySeed;
    }
    
    public Integer getIdentityIncrement() {
        return identityIncrement;
    }
    
    public void setIdentityIncrement(Integer identityIncrement) {
        this.identityIncrement = identityIncrement;
    }
    
    public String getDefaultValue() {
        return defaultValue;
    }
    
    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }
    
    public int getOrderIndex() {
        return orderIndex;
    }
    
    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
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