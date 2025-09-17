package com.dbmodeling.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 인덱스 수정 요청 DTO
 */
@Schema(description = "인덱스 수정 요청")
public class UpdateIndexRequest {
    
    @Schema(description = "인덱스 이름", example = "IX_User_Email_Updated")
    @Size(min = 1, max = 255, message = "인덱스 이름은 1자 이상 255자 이하여야 합니다.")
    private String name;
    
    @Schema(description = "인덱스 타입", example = "CLUSTERED", allowableValues = {"CLUSTERED", "NONCLUSTERED"})
    @Pattern(regexp = "^(CLUSTERED|NONCLUSTERED)$", message = "인덱스 타입은 CLUSTERED 또는 NONCLUSTERED여야 합니다.")
    private String type;
    
    @Schema(description = "유니크 인덱스 여부", example = "false")
    private Boolean isUnique;
    
    @Schema(description = "인덱스 컬럼 목록")
    @Valid
    private List<CreateIndexRequest.IndexColumnRequest> columns;
    
    public UpdateIndexRequest() {}
    
    public UpdateIndexRequest(String name, String type, Boolean isUnique, List<CreateIndexRequest.IndexColumnRequest> columns) {
        this.name = name;
        this.type = type;
        this.isUnique = isUnique;
        this.columns = columns;
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
    
    public Boolean getIsUnique() {
        return isUnique;
    }
    
    public void setIsUnique(Boolean isUnique) {
        this.isUnique = isUnique;
    }
    
    public List<CreateIndexRequest.IndexColumnRequest> getColumns() {
        return columns;
    }
    
    public void setColumns(List<CreateIndexRequest.IndexColumnRequest> columns) {
        this.columns = columns;
    }
}