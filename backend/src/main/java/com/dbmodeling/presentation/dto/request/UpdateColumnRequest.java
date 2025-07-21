package com.dbmodeling.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;

/**
 * 컬럼 수정 요청 DTO
 */
@Schema(description = "컬럼 수정 요청")
public class UpdateColumnRequest {
    
    @Schema(description = "컬럼 이름", example = "updated_user_id")
    @Size(min = 1, max = 255, message = "컬럼 이름은 1자 이상 255자 이하여야 합니다.")
    private String name;
    
    @Schema(description = "컬럼 설명", example = "업데이트된 사용자 고유 식별자")
    @Size(max = 1000, message = "컬럼 설명은 1000자 이하여야 합니다.")
    private String description;
    
    @Schema(description = "데이터 타입", example = "NVARCHAR")
    private String dataType;
    
    @Schema(description = "최대 길이", example = "500")
    @Min(value = 1, message = "최대 길이는 1 이상이어야 합니다.")
    private Integer maxLength;
    
    @Schema(description = "정밀도", example = "20")
    @Min(value = 1, message = "정밀도는 1 이상이어야 합니다.")
    private Integer precision;
    
    @Schema(description = "소수점 자릿수", example = "4")
    @Min(value = 0, message = "소수점 자릿수는 0 이상이어야 합니다.")
    private Integer scale;
    
    @Schema(description = "NULL 허용 여부", example = "true")
    private Boolean isNullable;
    
    @Schema(description = "기본키 여부", example = "false")
    private Boolean isPrimaryKey;
    
    @Schema(description = "자동증가 여부", example = "false")
    private Boolean isIdentity;
    
    @Schema(description = "자동증가 시작값", example = "10")
    @Min(value = 1, message = "자동증가 시작값은 1 이상이어야 합니다.")
    private Integer identitySeed;
    
    @Schema(description = "자동증가 증가값", example = "2")
    @Min(value = 1, message = "자동증가 증가값은 1 이상이어야 합니다.")
    private Integer identityIncrement;
    
    @Schema(description = "기본값", example = "NULL")
    @Size(max = 500, message = "기본값은 500자 이하여야 합니다.")
    private String defaultValue;
    
    @Schema(description = "컬럼 순서", example = "2")
    @Min(value = 1, message = "컬럼 순서는 1 이상이어야 합니다.")
    private Integer orderIndex;
    
    public UpdateColumnRequest() {}
    
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
    
    public Boolean getIsNullable() {
        return isNullable;
    }
    
    public void setIsNullable(Boolean isNullable) {
        this.isNullable = isNullable;
    }
    
    public Boolean getIsPrimaryKey() {
        return isPrimaryKey;
    }
    
    public void setIsPrimaryKey(Boolean isPrimaryKey) {
        this.isPrimaryKey = isPrimaryKey;
    }
    
    public Boolean getIsIdentity() {
        return isIdentity;
    }
    
    public void setIsIdentity(Boolean isIdentity) {
        this.isIdentity = isIdentity;
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
}