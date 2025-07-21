package com.dbmodeling.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 네이밍 규칙 응답 DTO
 */
@Schema(description = "네이밍 규칙 정보")
public class NamingRulesResponse {
    
    @Schema(description = "테이블명 접두사", example = "tbl_")
    private String tablePrefix;
    
    @Schema(description = "테이블명 접미사", example = "_table")
    private String tableSuffix;
    
    @Schema(description = "테이블명 패턴 (정규식)", example = "^[A-Z][a-zA-Z0-9]*$")
    private String tablePattern;
    
    @Schema(description = "컬럼명 패턴 (정규식)", example = "^[a-z][a-z0-9_]*$")
    private String columnPattern;
    
    @Schema(description = "인덱스명 패턴 (정규식)", example = "^IX_[A-Z][a-zA-Z0-9_]*$")
    private String indexPattern;
    
    @Schema(description = "대소문자 규칙", example = "PASCAL")
    private String enforceCase;
    
    public NamingRulesResponse() {}
    
    public NamingRulesResponse(String tablePrefix, String tableSuffix, String tablePattern,
                              String columnPattern, String indexPattern, String enforceCase) {
        this.tablePrefix = tablePrefix;
        this.tableSuffix = tableSuffix;
        this.tablePattern = tablePattern;
        this.columnPattern = columnPattern;
        this.indexPattern = indexPattern;
        this.enforceCase = enforceCase;
    }
    
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