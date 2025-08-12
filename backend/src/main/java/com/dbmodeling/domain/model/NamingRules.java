package com.dbmodeling.domain.model;

/**
 * 네이밍 규칙 도메인 모델
 * 프로젝트의 데이터베이스 객체 네이밍 규칙을 정의
 */
public class NamingRules {
    private String tablePrefix;
    private String tableSuffix;
    private String tablePattern;
    private String columnPattern;
    private String indexPattern;
    private CaseType enforceCase;
    
    // SQL Server 특화 규칙
    private boolean enforceUpperCase = false;
    private boolean recommendAuditColumns = false;
    private boolean requireDescription = false;
    private boolean enforceTableColumnNaming = false;
    private boolean enforceConstraintNaming = false;
    private String abbreviationRules;

    // 기본 생성자
    public NamingRules() {
        this.enforceCase = CaseType.PASCAL;
    }

    // 생성자
    public NamingRules(String tablePattern, String columnPattern, String indexPattern, CaseType enforceCase) {
        this.tablePattern = tablePattern;
        this.columnPattern = columnPattern;
        this.indexPattern = indexPattern;
        this.enforceCase = enforceCase != null ? enforceCase : CaseType.PASCAL;
    }

    // 비즈니스 메서드
    public boolean validateTableName(String tableName) {
        if (tableName == null || tableName.trim().isEmpty()) {
            return false;
        }

        // 접두사 검증
        if (tablePrefix != null && !tableName.startsWith(tablePrefix)) {
            return false;
        }

        // 접미사 검증
        if (tableSuffix != null && !tableName.endsWith(tableSuffix)) {
            return false;
        }

        // 패턴 검증
        if (tablePattern != null && !tableName.matches(tablePattern)) {
            return false;
        }

        // SQL Server 대문자 강제 검증
        if (enforceUpperCase && !tableName.equals(tableName.toUpperCase())) {
            return false;
        }

        // 케이스 검증
        return validateCase(tableName);
    }

    public boolean validateColumnName(String columnName) {
        if (columnName == null || columnName.trim().isEmpty()) {
            return false;
        }

        // 패턴 검증
        if (columnPattern != null && !columnName.matches(columnPattern)) {
            return false;
        }

        // SQL Server 대문자 강제 검증
        if (enforceUpperCase && !columnName.equals(columnName.toUpperCase())) {
            return false;
        }

        // 케이스 검증
        return validateCase(columnName);
    }

    public boolean validateIndexName(String indexName) {
        if (indexName == null || indexName.trim().isEmpty()) {
            return false;
        }

        // 패턴 검증
        if (indexPattern != null && !indexName.matches(indexPattern)) {
            return false;
        }

        // SQL Server 대문자 강제 검증
        if (enforceUpperCase && !indexName.equals(indexName.toUpperCase())) {
            return false;
        }

        // 케이스 검증
        return validateCase(indexName);
    }

    private boolean validateCase(String name) {
        if (enforceCase == null) {
            return true;
        }

        return switch (enforceCase) {
            case UPPER -> name.equals(name.toUpperCase());
            case LOWER -> name.equals(name.toLowerCase());
            case PASCAL -> isPascalCase(name);
            case SNAKE -> isSnakeCase(name);
        };
    }

    private boolean isPascalCase(String name) {
        if (name.isEmpty()) return false;
        return Character.isUpperCase(name.charAt(0)) && !name.contains("_") && !name.contains("-");
    }

    private boolean isSnakeCase(String name) {
        return name.equals(name.toLowerCase()) && !name.contains("-") && !name.contains(" ");
    }

    public String suggestTableName(String originalName) {
        if (originalName == null) return null;
        
        String suggested = applyCaseRule(originalName);
        
        if (tablePrefix != null && !suggested.startsWith(tablePrefix)) {
            suggested = tablePrefix + suggested;
        }
        
        if (tableSuffix != null && !suggested.endsWith(tableSuffix)) {
            suggested = suggested + tableSuffix;
        }
        
        return suggested;
    }

    public String suggestColumnName(String originalName) {
        if (originalName == null) return null;
        return applyCaseRule(originalName);
    }

    public String suggestIndexName(String tableName, String columnName) {
        if (tableName == null || columnName == null) return null;
        
        String suggested = "IX_" + tableName + "_" + columnName;
        return applyCaseRule(suggested);
    }

    private String applyCaseRule(String name) {
        if (enforceCase == null) return name;
        
        return switch (enforceCase) {
            case UPPER -> name.toUpperCase();
            case LOWER -> name.toLowerCase();
            case PASCAL -> toPascalCase(name);
            case SNAKE -> toSnakeCase(name);
        };
    }

    private String toPascalCase(String name) {
        if (name == null || name.isEmpty()) return name;
        
        // camelCase를 먼저 처리 (userId -> user_id)
        String processed = name.replaceAll("([a-z])([A-Z])", "$1_$2");
        
        String[] parts = processed.split("[_\\s-]+");
        StringBuilder result = new StringBuilder();
        
        for (String part : parts) {
            if (!part.isEmpty()) {
                result.append(Character.toUpperCase(part.charAt(0)));
                if (part.length() > 1) {
                    result.append(part.substring(1).toLowerCase());
                }
            }
        }
        
        return result.toString();
    }

    private String toSnakeCase(String name) {
        if (name == null || name.isEmpty()) return name;
        
        return name.replaceAll("([a-z])([A-Z])", "$1_$2")
                   .replaceAll("[\\s-]+", "_")
                   .toLowerCase();
    }

    // SQL Server 특화 검증 메서드
    public boolean validateAuditColumns(java.util.List<String> columnNames) {
        if (!recommendAuditColumns) return true;
        
        return columnNames.contains("REG_ID") && columnNames.contains("REG_DT") &&
               columnNames.contains("CHG_ID") && columnNames.contains("CHG_DT");
    }
    
    public boolean validatePrimaryKeyNaming(String tableName, String columnName) {
        if (!enforceTableColumnNaming) return true;
        
        // 단독명칭 체크 (경고용)
        if (columnName.equalsIgnoreCase("ID") || 
            columnName.equalsIgnoreCase("SEQ_NO") || 
            columnName.equalsIgnoreCase("HIST_NO")) {
            return false;
        }
        
        // 테이블명+컬럼명 조합 권장
        String expectedPattern = tableName + "_";
        return columnName.toUpperCase().startsWith(expectedPattern.toUpperCase());
    }
    
    public boolean validateConstraintNaming(String constraintName, String tableName, String columnName) {
        if (!enforceConstraintNaming) return true;
        
        String expectedPrefix = "PK__" + tableName + "__" + columnName;
        return constraintName.toUpperCase().startsWith(expectedPrefix.toUpperCase());
    }
    
    public String suggestConstraintName(String type, String tableName, String columnName) {
        if (enforceUpperCase) {
            return type.toUpperCase() + "__" + tableName.toUpperCase() + "__" + columnName.toUpperCase();
        }
        return type + "__" + tableName + "__" + columnName;
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

    public CaseType getEnforceCase() {
        return enforceCase;
    }

    public void setEnforceCase(CaseType enforceCase) {
        this.enforceCase = enforceCase;
    }

    // SQL Server 특화 규칙 Getters and Setters
    public boolean isEnforceUpperCase() {
        return enforceUpperCase;
    }

    public void setEnforceUpperCase(boolean enforceUpperCase) {
        this.enforceUpperCase = enforceUpperCase;
    }

    public boolean isRecommendAuditColumns() {
        return recommendAuditColumns;
    }

    public void setRecommendAuditColumns(boolean recommendAuditColumns) {
        this.recommendAuditColumns = recommendAuditColumns;
    }

    public boolean isRequireDescription() {
        return requireDescription;
    }

    public void setRequireDescription(boolean requireDescription) {
        this.requireDescription = requireDescription;
    }

    public boolean isEnforceTableColumnNaming() {
        return enforceTableColumnNaming;
    }

    public void setEnforceTableColumnNaming(boolean enforceTableColumnNaming) {
        this.enforceTableColumnNaming = enforceTableColumnNaming;
    }

    public boolean isEnforceConstraintNaming() {
        return enforceConstraintNaming;
    }

    public void setEnforceConstraintNaming(boolean enforceConstraintNaming) {
        this.enforceConstraintNaming = enforceConstraintNaming;
    }

    public String getAbbreviationRules() {
        return abbreviationRules;
    }

    public void setAbbreviationRules(String abbreviationRules) {
        this.abbreviationRules = abbreviationRules;
    }

    /**
     * 케이스 타입 열거형
     */
    public enum CaseType {
        UPPER("UPPER"),
        LOWER("LOWER"),
        PASCAL("PASCAL"),
        SNAKE("SNAKE");

        private final String name;

        CaseType(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }
    }

    /**
     * 케이스 규칙 열거형 (CaseRule 별칭)
     */
    public enum CaseRule {
        UPPER("UPPER"),
        LOWER("LOWER"),
        PASCAL("PASCAL"),
        SNAKE("SNAKE");

        private final String name;

        CaseRule(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public CaseType toCaseType() {
            return CaseType.valueOf(this.name());
        }
    }
}