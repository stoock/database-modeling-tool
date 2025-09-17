package com.dbmodeling.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 인덱스 생성 요청 DTO
 */
@Schema(description = "인덱스 생성 요청")
public class CreateIndexRequest {
    
    @Schema(description = "인덱스 이름", example = "IX_User_Email", required = true)
    @NotBlank(message = "인덱스 이름은 필수입니다.")
    @Size(min = 1, max = 255, message = "인덱스 이름은 1자 이상 255자 이하여야 합니다.")
    private String name;
    
    @Schema(description = "인덱스 타입", example = "NONCLUSTERED", required = true, allowableValues = {"CLUSTERED", "NONCLUSTERED"})
    @NotBlank(message = "인덱스 타입은 필수입니다.")
    @Pattern(regexp = "^(CLUSTERED|NONCLUSTERED)$", message = "인덱스 타입은 CLUSTERED 또는 NONCLUSTERED여야 합니다.")
    private String type;
    
    @Schema(description = "유니크 인덱스 여부", example = "true")
    private Boolean isUnique = false;
    
    @Schema(description = "인덱스 컬럼 목록", required = true)
    @NotEmpty(message = "인덱스 컬럼은 최소 1개 이상이어야 합니다.")
    @Valid
    private List<IndexColumnRequest> columns;
    
    public CreateIndexRequest() {}
    
    public CreateIndexRequest(String name, String type, Boolean isUnique, List<IndexColumnRequest> columns) {
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
    
    public List<IndexColumnRequest> getColumns() {
        return columns;
    }
    
    public void setColumns(List<IndexColumnRequest> columns) {
        this.columns = columns;
    }
    
    /**
     * 인덱스 컬럼 요청 DTO
     */
    @Schema(description = "인덱스 컬럼 정보")
    public static class IndexColumnRequest {
        @Schema(description = "컬럼 ID", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
        @NotBlank(message = "컬럼 ID는 필수입니다.")
        private String columnId;
        
        @Schema(description = "정렬 순서", example = "ASC", allowableValues = {"ASC", "DESC"})
        @Pattern(regexp = "^(ASC|DESC)$", message = "정렬 순서는 ASC 또는 DESC여야 합니다.")
        private String order = "ASC";
        
        public IndexColumnRequest() {}
        
        public IndexColumnRequest(String columnId, String order) {
            this.columnId = columnId;
            this.order = order;
        }
        
        // Getters and Setters
        public String getColumnId() {
            return columnId;
        }
        
        public void setColumnId(String columnId) {
            this.columnId = columnId;
        }
        
        public String getOrder() {
            return order;
        }
        
        public void setOrder(String order) {
            this.order = order;
        }
    }
}