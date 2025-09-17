package com.dbmodeling.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;

/**
 * 스키마 내보내기 요청 DTO
 */
@Schema(description = "스키마 내보내기 요청")
public class ExportRequest {
    
    @Schema(description = "출력 형식", example = "SQL", allowableValues = {"SQL", "MARKDOWN", "HTML", "JSON", "CSV"})
    @Pattern(regexp = "^(SQL|MARKDOWN|HTML|JSON|CSV)$", message = "출력 형식은 SQL, MARKDOWN, HTML, JSON, CSV 중 하나여야 합니다.")
    private String format = "SQL";
    
    @Schema(description = "테이블 생성문 포함 여부", example = "true")
    private Boolean includeTables = true;
    
    @Schema(description = "인덱스 생성문 포함 여부", example = "true")
    private Boolean includeIndexes = true;
    
    @Schema(description = "제약조건 포함 여부", example = "true")
    private Boolean includeConstraints = true;
    
    @Schema(description = "주석 포함 여부", example = "true")
    private Boolean includeComments = true;
    
    @Schema(description = "유효성 검사 포함 여부", example = "true")
    private Boolean includeValidation = false;
    
    public ExportRequest() {}
    
    public ExportRequest(String format, Boolean includeTables, Boolean includeIndexes, 
                        Boolean includeConstraints, Boolean includeComments, Boolean includeValidation) {
        this.format = format;
        this.includeTables = includeTables;
        this.includeIndexes = includeIndexes;
        this.includeConstraints = includeConstraints;
        this.includeComments = includeComments;
        this.includeValidation = includeValidation;
    }
    
    // Getters and Setters
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public Boolean getIncludeTables() {
        return includeTables;
    }
    
    public void setIncludeTables(Boolean includeTables) {
        this.includeTables = includeTables;
    }
    
    public Boolean getIncludeIndexes() {
        return includeIndexes;
    }
    
    public void setIncludeIndexes(Boolean includeIndexes) {
        this.includeIndexes = includeIndexes;
    }
    
    public Boolean getIncludeConstraints() {
        return includeConstraints;
    }
    
    public void setIncludeConstraints(Boolean includeConstraints) {
        this.includeConstraints = includeConstraints;
    }
    
    public Boolean getIncludeComments() {
        return includeComments;
    }
    
    public void setIncludeComments(Boolean includeComments) {
        this.includeComments = includeComments;
    }
    
    public Boolean getIncludeValidation() {
        return includeValidation;
    }
    
    public Boolean isIncludeValidation() {
        return includeValidation;
    }
    
    public void setIncludeValidation(Boolean includeValidation) {
        this.includeValidation = includeValidation;
    }
}