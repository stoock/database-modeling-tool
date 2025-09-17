package com.dbmodeling.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 네이밍 규칙 요청 DTO
 */
@Schema(description = "네이밍 규칙 설정")
public class NamingRulesRequest {
    
    @Schema(description = "테이블명 접두사", example = "tbl_")
    @Size(max = 50, message = "테이블명 접두사는 50자 이하여야 합니다.")
    private String tablePrefix;
    
    @Schema(description = "테이블명 접미사", example = "_table")
    @Size(max = 50, message = "테이블명 접미사는 50자 이하여야 합니다.")
    private String tableSuffix;
    
    @Schema(description = "테이블명 패턴 (정규식)", example = "^[A-Z][a-zA-Z0-9]*$")
    @Size(max = 200, message = "테이블명 패턴은 200자 이하여야 합니다.")
    private String tablePattern;
    
    @Schema(description = "컬럼명 패턴 (정규식)", example = "^[a-z][a-z0-9_]*$")
    @Size(max = 200, message = "컬럼명 패턴은 200자 이하여야 합니다.")
    private String columnPattern;
    
    @Schema(description = "인덱스명 패턴 (정규식)", example = "^IX_[A-Z][a-zA-Z0-9_]*$")
    @Size(max = 200, message = "인덱스명 패턴은 200자 이하여야 합니다.")
    private String indexPattern;
    
    @Schema(description = "대소문자 규칙", example = "PASCAL", allowableValues = {"UPPER", "LOWER", "PASCAL", "SNAKE"})
    @Pattern(regexp = "^(UPPER|LOWER|PASCAL|SNAKE)$", message = "대소문자 규칙은 UPPER, LOWER, PASCAL, SNAKE 중 하나여야 합니다.")
    private String enforceCase;
    
    public NamingRulesRequest() {}
    
    // Getters and Setters
    public String getTablePrefix() {
        return tablePrefix;
    }
    
    public void setTablePrefix(String tablePrefix) {
        this.tablePrefix = tablePrefix;
    }
    
    public String getTableSuffix() {
        return tableSuffix;
    }
    
    public void setTableSuffix(String tableSuffix) {
        this.tableSuffix = tableSuffix;
    }
    
    public String getTablePattern() {
        return tablePattern;
    }
    
    public void setTablePattern(String tablePattern) {
        this.tablePattern = tablePattern;
    }
    
    public String getColumnPattern() {
        return columnPattern;
    }
    
    public void setColumnPattern(String columnPattern) {
        this.columnPattern = columnPattern;
    }
    
    public String getIndexPattern() {
        return indexPattern;
    }
    
    public void setIndexPattern(String indexPattern) {
        this.indexPattern = indexPattern;
    }
    
    public String getEnforceCase() {
        return enforceCase;
    }
    
    public void setEnforceCase(String enforceCase) {
        this.enforceCase = enforceCase;
    }
}