package com.dbmodeling.domain.model;

/**
 * 스키마 생성 옵션
 * SQL 스크립트 생성 시 사용할 다양한 옵션들을 정의
 */
public class SchemaGenerationOptions {
    private boolean includeDropStatements;
    private boolean includeExistenceChecks;
    private boolean includeComments;
    private boolean includeConstraints;
    private boolean includeIndexes;
    private boolean generateBatchScript;
    private String schemaName;
    private OutputFormat outputFormat;

    // 기본 생성자
    public SchemaGenerationOptions() {
        this.includeDropStatements = false;
        this.includeExistenceChecks = true;
        this.includeComments = true;
        this.includeConstraints = true;
        this.includeIndexes = true;
        this.generateBatchScript = false;
        this.outputFormat = OutputFormat.SQL_SCRIPT;
    }

    // 정적 팩토리 메서드들
    public static SchemaGenerationOptions defaultOptions() {
        return new SchemaGenerationOptions();
    }

    public static SchemaGenerationOptions productionOptions() {
        SchemaGenerationOptions options = new SchemaGenerationOptions();
        options.includeExistenceChecks = true;
        options.includeDropStatements = false;
        options.generateBatchScript = true;
        return options;
    }

    public static SchemaGenerationOptions developmentOptions() {
        SchemaGenerationOptions options = new SchemaGenerationOptions();
        options.includeDropStatements = true;
        options.includeExistenceChecks = false;
        options.includeComments = true;
        return options;
    }

    // Getters and Setters
    public boolean isIncludeDropStatements() {
        return includeDropStatements;
    }

    public void setIncludeDropStatements(boolean includeDropStatements) {
        this.includeDropStatements = includeDropStatements;
    }

    public boolean isIncludeExistenceChecks() {
        return includeExistenceChecks;
    }

    public void setIncludeExistenceChecks(boolean includeExistenceChecks) {
        this.includeExistenceChecks = includeExistenceChecks;
    }

    public boolean isIncludeComments() {
        return includeComments;
    }

    public void setIncludeComments(boolean includeComments) {
        this.includeComments = includeComments;
    }

    public boolean isIncludeConstraints() {
        return includeConstraints;
    }

    public void setIncludeConstraints(boolean includeConstraints) {
        this.includeConstraints = includeConstraints;
    }

    public boolean isIncludeIndexes() {
        return includeIndexes;
    }

    public void setIncludeIndexes(boolean includeIndexes) {
        this.includeIndexes = includeIndexes;
    }

    public boolean isGenerateBatchScript() {
        return generateBatchScript;
    }

    public void setGenerateBatchScript(boolean generateBatchScript) {
        this.generateBatchScript = generateBatchScript;
    }

    public String getSchemaName() {
        return schemaName;
    }

    public void setSchemaName(String schemaName) {
        this.schemaName = schemaName;
    }

    public OutputFormat getOutputFormat() {
        return outputFormat;
    }

    public void setOutputFormat(OutputFormat outputFormat) {
        this.outputFormat = outputFormat;
    }

    /**
     * 출력 형식 열거형
     */
    public enum OutputFormat {
        SQL_SCRIPT("SQL 스크립트"),
        DOCUMENTATION("문서화"),
        BOTH("SQL + 문서화");

        private final String description;

        OutputFormat(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}