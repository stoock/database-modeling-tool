package com.dbmodeling.domain.service;

import com.dbmodeling.domain.model.NamingRules;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.model.Table;
import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.Index;
import com.dbmodeling.domain.model.MSSQLDataType;
import com.dbmodeling.infrastructure.external.mssql.MSSQLTypeMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

/**
 * 네이밍 규칙 검증을 위한 도메인 서비스
 * 프로젝트의 네이밍 규칙에 따라 데이터베이스 객체들의 이름을 검증하고 제안을 제공
 */
@Service
public class ValidationDomainService {

    /**
     * 프로젝트 전체의 네이밍 규칙 검증
     */
    public ValidationResult validateProject(Project project) {
        ValidationResult result = new ValidationResult();
        NamingRules rules = project.getNamingRules();
        
        if (rules == null) {
            result.addError("프로젝트에 네이밍 규칙이 설정되지 않았습니다.");
            return result;
        }

        // 모든 테이블 검증
        for (Table table : project.getTables()) {
            ValidationResult tableResult = validateTable(table, rules);
            result.merge(tableResult);
        }

        return result;
    }

    /**
     * 테이블의 네이밍 규칙 검증
     */
    public ValidationResult validateTable(Table table, NamingRules rules) {
        ValidationResult result = new ValidationResult();

        // 테이블명 검증
        if (!rules.validateTableName(table.getName())) {
            String suggestion = rules.suggestTableName(table.getName());
            result.addError(
                "테이블명 '" + table.getName() + "'이 네이밍 규칙을 위반했습니다.",
                "table",
                table.getName(),
                suggestion
            );
        }

        // 모든 컬럼 검증
        for (Column column : table.getColumns()) {
            ValidationResult columnResult = validateColumn(column, rules);
            result.merge(columnResult);
        }

        // 모든 인덱스 검증
        for (Index index : table.getIndexes()) {
            ValidationResult indexResult = validateIndex(index, rules);
            result.merge(indexResult);
        }

        return result;
    }

    /**
     * 컬럼의 네이밍 규칙 검증
     */
    public ValidationResult validateColumn(Column column, NamingRules rules) {
        ValidationResult result = new ValidationResult();

        if (!rules.validateColumnName(column.getName())) {
            String suggestion = rules.suggestColumnName(column.getName());
            result.addError(
                "컬럼명 '" + column.getName() + "'이 네이밍 규칙을 위반했습니다.",
                "column",
                column.getName(),
                suggestion
            );
        }

        return result;
    }

    /**
     * 인덱스의 네이밍 규칙 검증
     */
    public ValidationResult validateIndex(Index index, NamingRules rules) {
        ValidationResult result = new ValidationResult();

        if (!rules.validateIndexName(index.getName())) {
            String suggestion = rules.suggestIndexName("Table", "Column"); // 실제로는 테이블과 컬럼 정보 필요
            result.addError(
                "인덱스명 '" + index.getName() + "'이 네이밍 규칙을 위반했습니다.",
                "index",
                index.getName(),
                suggestion
            );
        }

        return result;
    }

    /**
     * 실시간 검증을 위한 단일 이름 검증
     */
    public ValidationResult validateName(String name, String type, NamingRules rules) {
        ValidationResult result = new ValidationResult();

        boolean isValid = switch (type.toLowerCase()) {
            case "table" -> rules.validateTableName(name);
            case "column" -> rules.validateColumnName(name);
            case "index" -> rules.validateIndexName(name);
            default -> false;
        };

        if (!isValid) {
            String suggestion = switch (type.toLowerCase()) {
                case "table" -> rules.suggestTableName(name);
                case "column" -> rules.suggestColumnName(name);
                case "index" -> rules.suggestIndexName("Table", name); // 간단한 제안
                default -> null;
            };

            result.addError(
                type + "명 '" + name + "'이 네이밍 규칙을 위반했습니다.",
                type,
                name,
                suggestion
            );
        }

        return result;
    }

    /**
     * 스키마 출력 전 전체 검증 (네이밍 규칙 + 데이터 무결성)
     */
    public SchemaValidationResult validateForSchemaExport(Project project) {
        SchemaValidationResult result = new SchemaValidationResult();
        MSSQLTypeMapper typeMapper = new MSSQLTypeMapper();

        // 1. 기본 네이밍 규칙 검증
        ValidationResult namingResult = validateProject(project);
        result.addNamingErrors(namingResult.getErrors());
        result.addNamingWarnings(namingResult.getWarnings());

        // 2. 프로젝트 레벨 검증
        if (project.getTables().isEmpty()) {
            result.addStructuralError("프로젝트에 테이블이 하나도 정의되지 않았습니다.");
        }

        // 3. 테이블명 중복 검증
        Set<String> tableNames = new HashSet<>();
        for (Table table : project.getTables()) {
            if (!tableNames.add(table.getName().toLowerCase())) {
                result.addStructuralError("중복된 테이블명이 있습니다: " + table.getName());
            }
        }

        // 4. 각 테이블별 상세 검증
        for (Table table : project.getTables()) {
            validateTableForExport(table, typeMapper, result);
        }

        return result;
    }

    /**
     * 테이블별 스키마 출력 검증
     */
    private void validateTableForExport(Table table, MSSQLTypeMapper typeMapper, SchemaValidationResult result) {
        // 1. 테이블에 컬럼이 있는지 확인
        if (table.getColumns().isEmpty()) {
            result.addStructuralError("테이블 '" + table.getName() + "'에 컬럼이 정의되지 않았습니다.");
            return;
        }

        // 2. 컬럼명 중복 검증
        Set<String> columnNames = new HashSet<>();
        for (Column column : table.getColumns()) {
            if (!columnNames.add(column.getName().toLowerCase())) {
                result.addStructuralError("테이블 '" + table.getName() + "'에 중복된 컬럼명이 있습니다: " + column.getName());
            }
        }

        // 3. 기본키 검증
        List<Column> primaryKeyColumns = table.getPrimaryKeyColumns();
        if (primaryKeyColumns.isEmpty()) {
            result.addStructuralWarning("테이블 '" + table.getName() + "'에 기본키가 정의되지 않았습니다.");
        }

        // 4. 각 컬럼의 데이터 타입 검증
        for (Column column : table.getColumns()) {
            validateColumnForExport(column, typeMapper, result, table.getName());
        }

        // 5. 인덱스 검증
        for (Index index : table.getIndexes()) {
            validateIndexForExport(index, table, result);
        }
    }

    /**
     * 컬럼별 스키마 출력 검증
     */
    private void validateColumnForExport(Column column, MSSQLTypeMapper typeMapper, SchemaValidationResult result, String tableName) {
        // 1. 데이터 타입 검증
        if (column.getDataType() == null) {
            result.addDataTypeError("테이블 '" + tableName + "'의 컬럼 '" + column.getName() + "'에 데이터 타입이 설정되지 않았습니다.");
            return;
        }

        // 2. MSSQLTypeMapper를 통한 상세 검증
        MSSQLTypeMapper.ValidationResult typeValidation = typeMapper.validateColumnDataType(column);
        if (!typeValidation.isValid()) {
            for (String error : typeValidation.getErrors()) {
                result.addDataTypeError("테이블 '" + tableName + "'의 컬럼 '" + column.getName() + "': " + error);
            }
        }
        for (String warning : typeValidation.getWarnings()) {
            result.addDataTypeWarning("테이블 '" + tableName + "'의 컬럼 '" + column.getName() + "': " + warning);
        }

        // 3. IDENTITY 컬럼 검증
        if (column.isIdentity()) {
            if (!column.getDataType().supportsIdentity()) {
                result.addDataTypeError("테이블 '" + tableName + "'의 컬럼 '" + column.getName() + "': " + 
                    column.getDataType().getSqlName() + " 타입은 IDENTITY를 지원하지 않습니다.");
            }
            if (column.isNullable()) {
                result.addDataTypeError("테이블 '" + tableName + "'의 컬럼 '" + column.getName() + "': IDENTITY 컬럼은 NOT NULL이어야 합니다.");
            }
        }

        // 4. 기본키 컬럼 검증
        if (column.isPrimaryKey()) {
            if (column.isNullable()) {
                result.addDataTypeError("테이블 '" + tableName + "'의 컬럼 '" + column.getName() + "': 기본키 컬럼은 NOT NULL이어야 합니다.");
            }
            if (!column.getDataType().canBePrimaryKey()) {
                result.addDataTypeError("테이블 '" + tableName + "'의 컬럼 '" + column.getName() + "': " + 
                    column.getDataType().getSqlName() + " 타입은 기본키로 사용할 수 없습니다.");
            }
        }
    }

    /**
     * 인덱스별 스키마 출력 검증
     */
    private void validateIndexForExport(Index index, Table table, SchemaValidationResult result) {
        // 1. 인덱스에 컬럼이 있는지 확인
        if (index.getColumns().isEmpty()) {
            result.addStructuralError("테이블 '" + table.getName() + "'의 인덱스 '" + index.getName() + "'에 컬럼이 정의되지 않았습니다.");
            return;
        }

        // 2. 인덱스 컬럼이 실제 테이블 컬럼에 존재하는지 확인
        Set<java.util.UUID> tableColumnIds = table.getColumns().stream()
                .map(Column::getId)
                .collect(Collectors.toSet());

        for (Index.IndexColumn indexColumn : index.getColumns()) {
            if (!tableColumnIds.contains(indexColumn.getColumnId())) {
                result.addStructuralError("테이블 '" + table.getName() + "'의 인덱스 '" + index.getName() + "'에 존재하지 않는 컬럼이 참조되었습니다.");
            }
        }

        // 3. 클러스터드 인덱스 중복 검증 (기본키 외에 추가 클러스터드 인덱스가 있는지)
        if (index.getType() == Index.IndexType.CLUSTERED) {
            List<Column> primaryKeyColumns = table.getPrimaryKeyColumns();
            if (!primaryKeyColumns.isEmpty()) {
                result.addStructuralWarning("테이블 '" + table.getName() + "'에 기본키와 별도의 클러스터드 인덱스 '" + index.getName() + "'가 정의되었습니다. " +
                    "MSSQL에서는 테이블당 하나의 클러스터드 인덱스만 허용됩니다.");
            }
        }
    }

    /**
     * 검증 결과를 담는 클래스
     */
    public static class ValidationResult {
        private final List<ValidationError> errors = new ArrayList<>();
        private final List<ValidationWarning> warnings = new ArrayList<>();

        public void addError(String message) {
            errors.add(new ValidationError(message, null, null, null));
        }

        public void addError(String message, String field, String actual, String suggestion) {
            errors.add(new ValidationError(message, field, actual, suggestion));
        }

        public void addWarning(String message, String field) {
            warnings.add(new ValidationWarning(message, field));
        }

        public void merge(ValidationResult other) {
            this.errors.addAll(other.errors);
            this.warnings.addAll(other.warnings);
        }

        public boolean hasErrors() {
            return !errors.isEmpty();
        }

        public boolean hasWarnings() {
            return !warnings.isEmpty();
        }

        public List<ValidationError> getErrors() {
            return new ArrayList<>(errors);
        }

        public List<ValidationWarning> getWarnings() {
            return new ArrayList<>(warnings);
        }

        public boolean isValid() {
            return errors.isEmpty();
        }
    }

    /**
     * 검증 오류 정보
     */
    public static class ValidationError {
        private final String message;
        private final String field;
        private final String actual;
        private final String suggestion;

        public ValidationError(String message, String field, String actual, String suggestion) {
            this.message = message;
            this.field = field;
            this.actual = actual;
            this.suggestion = suggestion;
        }

        public String getMessage() {
            return message;
        }

        public String getField() {
            return field;
        }

        public String getActual() {
            return actual;
        }

        public String getSuggestion() {
            return suggestion;
        }
    }

    /**
     * 검증 경고 정보
     */
    public static class ValidationWarning {
        private final String message;
        private final String field;

        public ValidationWarning(String message, String field) {
            this.message = message;
            this.field = field;
        }

        public String getMessage() {
            return message;
        }

        public String getField() {
            return field;
        }
    }

    /**
     * 스키마 출력용 확장된 검증 결과
     */
    public static class SchemaValidationResult {
        private final List<ValidationError> namingErrors = new ArrayList<>();
        private final List<ValidationWarning> namingWarnings = new ArrayList<>();
        private final List<String> structuralErrors = new ArrayList<>();
        private final List<String> structuralWarnings = new ArrayList<>();
        private final List<String> dataTypeErrors = new ArrayList<>();
        private final List<String> dataTypeWarnings = new ArrayList<>();

        public void addNamingErrors(List<ValidationError> errors) {
            this.namingErrors.addAll(errors);
        }

        public void addNamingWarnings(List<ValidationWarning> warnings) {
            this.namingWarnings.addAll(warnings);
        }

        public void addStructuralError(String message) {
            this.structuralErrors.add(message);
        }

        public void addStructuralWarning(String message) {
            this.structuralWarnings.add(message);
        }

        public void addDataTypeError(String message) {
            this.dataTypeErrors.add(message);
        }

        public void addDataTypeWarning(String message) {
            this.dataTypeWarnings.add(message);
        }

        public boolean hasErrors() {
            return !namingErrors.isEmpty() || !structuralErrors.isEmpty() || !dataTypeErrors.isEmpty();
        }

        public boolean hasWarnings() {
            return !namingWarnings.isEmpty() || !structuralWarnings.isEmpty() || !dataTypeWarnings.isEmpty();
        }

        public boolean canExportSchema() {
            // 구조적 오류나 데이터 타입 오류가 있으면 스키마 출력 불가
            return structuralErrors.isEmpty() && dataTypeErrors.isEmpty();
        }

        public List<ValidationError> getNamingErrors() {
            return new ArrayList<>(namingErrors);
        }

        public List<ValidationWarning> getNamingWarnings() {
            return new ArrayList<>(namingWarnings);
        }

        public List<String> getStructuralErrors() {
            return new ArrayList<>(structuralErrors);
        }

        public List<String> getStructuralWarnings() {
            return new ArrayList<>(structuralWarnings);
        }

        public List<String> getDataTypeErrors() {
            return new ArrayList<>(dataTypeErrors);
        }

        public List<String> getDataTypeWarnings() {
            return new ArrayList<>(dataTypeWarnings);
        }

        public int getTotalErrorCount() {
            return namingErrors.size() + structuralErrors.size() + dataTypeErrors.size();
        }

        public int getTotalWarningCount() {
            return namingWarnings.size() + structuralWarnings.size() + dataTypeWarnings.size();
        }

        /**
         * 검증 결과 요약 생성
         */
        public String generateSummary() {
            StringBuilder summary = new StringBuilder();
            
            summary.append("검증 결과 요약:\n");
            summary.append("- 총 오류: ").append(getTotalErrorCount()).append("개\n");
            summary.append("- 총 경고: ").append(getTotalWarningCount()).append("개\n");
            summary.append("- 스키마 출력 가능: ").append(canExportSchema() ? "예" : "아니오").append("\n");
            
            if (hasErrors()) {
                summary.append("\n주요 오류:\n");
                if (!structuralErrors.isEmpty()) {
                    summary.append("- 구조적 오류: ").append(structuralErrors.size()).append("개\n");
                }
                if (!dataTypeErrors.isEmpty()) {
                    summary.append("- 데이터 타입 오류: ").append(dataTypeErrors.size()).append("개\n");
                }
                if (!namingErrors.isEmpty()) {
                    summary.append("- 네이밍 규칙 오류: ").append(namingErrors.size()).append("개\n");
                }
            }
            
            return summary.toString();
        }
    }

    /**
     * 고급 스키마 검증 (성능 및 모범 사례 검증 포함)
     */
    public AdvancedValidationResult validateAdvanced(Project project) {
        AdvancedValidationResult result = new AdvancedValidationResult();
        
        // 기본 검증 수행
        SchemaValidationResult basicResult = validateForSchemaExport(project);
        result.setBasicValidation(basicResult);
        
        // 성능 관련 검증
        validatePerformance(project, result);
        
        // 모범 사례 검증
        validateBestPractices(project, result);
        
        // 보안 관련 검증
        validateSecurity(project, result);
        
        return result;
    }

    /**
     * 성능 관련 검증
     */
    private void validatePerformance(Project project, AdvancedValidationResult result) {
        for (Table table : project.getTables()) {
            // 1. 인덱스 부족 검증
            if (table.getColumns().size() > 5 && table.getIndexes().isEmpty()) {
                result.addPerformanceWarning("테이블 '" + table.getName() + "'에 인덱스가 없습니다. 성능 저하가 예상됩니다.");
            }
            
            // 2. 과도한 컬럼 수 검증
            if (table.getColumns().size() > 50) {
                result.addPerformanceWarning("테이블 '" + table.getName() + "'의 컬럼 수가 " + table.getColumns().size() + "개로 과도합니다. 정규화를 고려하세요.");
            }
            
            // 3. 큰 문자열 컬럼 검증
            for (Column column : table.getColumns()) {
                if ((column.getDataType() == MSSQLDataType.VARCHAR || column.getDataType() == MSSQLDataType.NVARCHAR) 
                    && column.getMaxLength() != null && column.getMaxLength() > 4000) {
                    result.addPerformanceWarning("테이블 '" + table.getName() + "'의 컬럼 '" + column.getName() + "'의 길이가 " + column.getMaxLength() + "로 과도합니다.");
                }
            }
            
            // 4. 클러스터드 인덱스 검증
            boolean hasClusteredIndex = table.getIndexes().stream()
                    .anyMatch(index -> index.getType() == Index.IndexType.CLUSTERED);
            boolean hasPrimaryKey = !table.getPrimaryKeyColumns().isEmpty();
            
            if (!hasClusteredIndex && !hasPrimaryKey) {
                result.addPerformanceWarning("테이블 '" + table.getName() + "'에 클러스터드 인덱스나 기본키가 없습니다.");
            }
        }
    }

    /**
     * 모범 사례 검증
     */
    private void validateBestPractices(Project project, AdvancedValidationResult result) {
        for (Table table : project.getTables()) {
            // 1. 감사 컬럼 검증
            boolean hasCreatedAt = table.getColumns().stream()
                    .anyMatch(col -> col.getName().toLowerCase().contains("created"));
            boolean hasUpdatedAt = table.getColumns().stream()
                    .anyMatch(col -> col.getName().toLowerCase().contains("updated"));
            
            if (!hasCreatedAt) {
                result.addBestPracticeWarning("테이블 '" + table.getName() + "'에 생성일시 컬럼이 없습니다.");
            }
            if (!hasUpdatedAt) {
                result.addBestPracticeWarning("테이블 '" + table.getName() + "'에 수정일시 컬럼이 없습니다.");
            }
            
            // 2. ID 컬럼 검증
            boolean hasIdColumn = table.getColumns().stream()
                    .anyMatch(col -> col.getName().toLowerCase().equals("id") && col.isPrimaryKey());
            
            if (!hasIdColumn) {
                result.addBestPracticeWarning("테이블 '" + table.getName() + "'에 표준 ID 기본키가 없습니다.");
            }
            
            // 3. 외래키 명명 규칙 검증
            for (Column column : table.getColumns()) {
                if (column.getName().toLowerCase().endsWith("_id") && !column.getName().toLowerCase().equals("id")) {
                    if (column.getDataType() != MSSQLDataType.BIGINT && column.getDataType() != MSSQLDataType.INT) {
                        result.addBestPracticeWarning("외래키로 보이는 컬럼 '" + column.getName() + "'의 데이터 타입이 정수형이 아닙니다.");
                    }
                }
            }
        }
    }

    /**
     * 보안 관련 검증
     */
    private void validateSecurity(Project project, AdvancedValidationResult result) {
        for (Table table : project.getTables()) {
            for (Column column : table.getColumns()) {
                // 1. 민감한 정보 컬럼 검증
                String columnName = column.getName().toLowerCase();
                if (columnName.contains("password") || columnName.contains("pwd")) {
                    if (column.getDataType() != MSSQLDataType.NVARCHAR && column.getDataType() != MSSQLDataType.VARCHAR) {
                        result.addSecurityWarning("비밀번호 컬럼 '" + column.getName() + "'의 데이터 타입이 문자열이 아닙니다.");
                    }
                    if (column.getMaxLength() != null && column.getMaxLength() < 60) {
                        result.addSecurityWarning("비밀번호 컬럼 '" + column.getName() + "'의 길이가 해시된 비밀번호를 저장하기에 부족할 수 있습니다.");
                    }
                }
                
                // 2. 개인정보 컬럼 검증
                if (columnName.contains("email") || columnName.contains("phone") || columnName.contains("ssn")) {
                    if (column.isNullable()) {
                        result.addSecurityInfo("개인정보 컬럼 '" + column.getName() + "'이 NULL을 허용합니다. 데이터 품질을 고려하세요.");
                    }
                }
            }
        }
    }

    /**
     * 고급 검증 결과 클래스
     */
    public static class AdvancedValidationResult {
        private SchemaValidationResult basicValidation;
        private final List<String> performanceWarnings = new ArrayList<>();
        private final List<String> bestPracticeWarnings = new ArrayList<>();
        private final List<String> securityWarnings = new ArrayList<>();
        private final List<String> securityInfo = new ArrayList<>();

        public void setBasicValidation(SchemaValidationResult basicValidation) {
            this.basicValidation = basicValidation;
        }

        public void addPerformanceWarning(String message) {
            this.performanceWarnings.add(message);
        }

        public void addBestPracticeWarning(String message) {
            this.bestPracticeWarnings.add(message);
        }

        public void addSecurityWarning(String message) {
            this.securityWarnings.add(message);
        }

        public void addSecurityInfo(String message) {
            this.securityInfo.add(message);
        }

        public SchemaValidationResult getBasicValidation() {
            return basicValidation;
        }

        public List<String> getPerformanceWarnings() {
            return new ArrayList<>(performanceWarnings);
        }

        public List<String> getBestPracticeWarnings() {
            return new ArrayList<>(bestPracticeWarnings);
        }

        public List<String> getSecurityWarnings() {
            return new ArrayList<>(securityWarnings);
        }

        public List<String> getSecurityInfo() {
            return new ArrayList<>(securityInfo);
        }

        public int getTotalAdvancedWarningCount() {
            return performanceWarnings.size() + bestPracticeWarnings.size() + securityWarnings.size();
        }

        public boolean hasAdvancedIssues() {
            return !performanceWarnings.isEmpty() || !bestPracticeWarnings.isEmpty() || !securityWarnings.isEmpty();
        }
    }
}