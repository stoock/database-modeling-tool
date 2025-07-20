package com.dbmodeling.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 컬럼 도메인 모델
 * 데이터베이스 테이블의 컬럼을 나타내는 도메인 엔티티
 */
public class Column {
    private UUID id;
    private UUID tableId;
    private String name;
    private String description;
    private MSSQLDataType dataType;
    private Integer maxLength;
    private Integer precision;
    private Integer scale;
    private Boolean isNullable;
    private Boolean isPrimaryKey;
    private Boolean isIdentity;
    private Integer identitySeed;
    private Integer identityIncrement;
    private String defaultValue;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 기본 생성자
    public Column() {
        this.isNullable = true;
        this.isPrimaryKey = false;
        this.isIdentity = false;
        this.identitySeed = 1;
        this.identityIncrement = 1;
    }

    // 생성자
    public Column(String name, MSSQLDataType dataType, Integer orderIndex) {
        this();
        this.id = UUID.randomUUID();
        this.name = name;
        this.dataType = dataType;
        this.orderIndex = orderIndex;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 비즈니스 메서드
    public void updateColumn(String name, String description, MSSQLDataType dataType) {
        this.name = name;
        this.description = description;
        this.dataType = dataType;
        this.updatedAt = LocalDateTime.now();
    }

    public void setDataTypeProperties(Integer maxLength, Integer precision, Integer scale) {
        this.maxLength = maxLength;
        this.precision = precision;
        this.scale = scale;
        this.updatedAt = LocalDateTime.now();
    }

    public void setPrimaryKey(Boolean isPrimaryKey) {
        this.isPrimaryKey = isPrimaryKey;
        if (isPrimaryKey) {
            this.isNullable = false; // 기본키는 NOT NULL
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void setIdentityProperties(Boolean isIdentity, Integer seed, Integer increment) {
        this.isIdentity = isIdentity;
        if (isIdentity) {
            this.identitySeed = seed != null ? seed : 1;
            this.identityIncrement = increment != null ? increment : 1;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void setNullableWithValidation(Boolean isNullable) {
        if (this.isPrimaryKey && isNullable) {
            throw new IllegalArgumentException("기본키 컬럼은 NULL을 허용할 수 없습니다.");
        }
        this.isNullable = isNullable;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean requiresLength() {
        return dataType != null && dataType.requiresLength();
    }

    public boolean requiresPrecision() {
        return dataType != null && dataType.requiresPrecision();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getTableId() {
        return tableId;
    }

    public void setTableId(UUID tableId) {
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

    public MSSQLDataType getDataType() {
        return dataType;
    }

    public void setDataType(MSSQLDataType dataType) {
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

    public Boolean isNullable() {
        return isNullable;
    }

    public void setNullable(Boolean nullable) {
        isNullable = nullable;
    }

    public Boolean isPrimaryKey() {
        return isPrimaryKey;
    }

    public Boolean isIdentity() {
        return isIdentity;
    }

    public void setIdentity(Boolean identity) {
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

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
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