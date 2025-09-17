package com.dbmodeling.application.service;

import com.dbmodeling.domain.model.*;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.IndexRepository;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.repository.TableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 검증 애플리케이션 서비스
 * 프로젝트의 네이밍 규칙 검증 및 오류 수집을 담당
 */
@Service
@Transactional(readOnly = true)
public class ValidationService {
    
    private final ProjectRepository projectRepository;
    private final TableRepository tableRepository;
    private final ColumnRepository columnRepository;
    private final IndexRepository indexRepository;
    
    public ValidationService(ProjectRepository projectRepository,
                           TableRepository tableRepository,
                           ColumnRepository columnRepository,
                           IndexRepository indexRepository) {
        this.projectRepository = projectRepository;
        this.tableRepository = tableRepository;
        this.columnRepository = columnRepository;
        this.indexRepository = indexRepository;
    }
    
    /**
     * 프로젝트 전체 검증
     * 
     * @param projectId 프로젝트 ID
     * @return 검증 결과
     */
    public ValidationResult validateProject(UUID projectId) {
        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        ValidationResult result = new ValidationResult(projectId);
        NamingRules namingRules = project.getNamingRules();
        
        if (namingRules == null) {
            result.addError(new ValidationError(
                ValidationError.ErrorType.NAMING_RULE,
                "PROJECT",
                project.getName(),
                "네이밍 규칙이 설정되지 않았습니다",
                null
            ));
            return result;
        }
        
        // 테이블 검증
        List<Table> tables = tableRepository.findByProjectId(projectId);
        for (Table table : tables) {
            validateTable(table, namingRules, result);
            // SQL Server 특화 검증
            validateSqlServerRules(table, namingRules, result);
        }
        
        return result;
    }
    
    /**
     * 테이블 검증
     */
    private void validateTable(Table table, NamingRules namingRules, ValidationResult result) {
        // 테이블 이름 검증
        if (!namingRules.validateTableName(table.getName())) {
            String suggestion = namingRules.suggestTableName(table.getName());
            result.addError(new ValidationError(
                ValidationError.ErrorType.NAMING_RULE,
                "TABLE",
                table.getName(),
                "테이블 이름이 네이밍 규칙을 위반했습니다",
                suggestion
            ));
        }
        
        // 컬럼 검증
        List<Column> columns = columnRepository.findByTableIdOrderByOrderIndex(table.getId());
        for (Column column : columns) {
            validateColumn(column, namingRules, result);
        }
        
        // 인덱스 검증
        List<Index> indexes = indexRepository.findByTableId(table.getId());
        for (Index index : indexes) {
            validateIndex(index, namingRules, result);
        }
        
        // 비즈니스 규칙 검증
        validateTableBusinessRules(table, columns, result);
        
        // SQL Server 감사 컬럼 검증
        validateAuditColumns(table, columns, namingRules, result);
        
        // SQL Server 기본키 명명 검증
        validatePrimaryKeyNaming(table, columns, namingRules, result);
    }
    
    /**
     * 컬럼 검증
     */
    private void validateColumn(Column column, NamingRules namingRules, ValidationResult result) {
        // 컬럼 이름 검증
        if (!namingRules.validateColumnName(column.getName())) {
            String suggestion = namingRules.suggestColumnName(column.getName());
            result.addError(new ValidationError(
                ValidationError.ErrorType.NAMING_RULE,
                "COLUMN",
                column.getName(),
                "컬럼 이름이 네이밍 규칙을 위반했습니다",
                suggestion
            ));
        }
        
        // 데이터 타입 검증
        validateColumnDataType(column, result);
    }
    
    /**
     * 인덱스 검증
     */
    private void validateIndex(Index index, NamingRules namingRules, ValidationResult result) {
        // 인덱스 이름 검증
        if (!namingRules.validateIndexName(index.getName())) {
            result.addError(new ValidationError(
                ValidationError.ErrorType.NAMING_RULE,
                "INDEX",
                index.getName(),
                "인덱스 이름이 네이밍 규칙을 위반했습니다",
                "IX_" + index.getName()
            ));
        }
    }
    
    /**
     * 테이블 비즈니스 규칙 검증
     */
    private void validateTableBusinessRules(Table table, List<Column> columns, ValidationResult result) {
        // 기본키 존재 여부 확인
        boolean hasPrimaryKey = columns.stream().anyMatch(Column::isPrimaryKey);
        if (!hasPrimaryKey) {
            result.addWarning(new ValidationError(
                ValidationError.ErrorType.BUSINESS_RULE,
                "TABLE",
                table.getName(),
                "기본키가 정의되지 않았습니다",
                "기본키 컬럼을 추가하세요"
            ));
        }
        
        // 컬럼 이름 중복 검사
        List<String> columnNames = new ArrayList<>();
        for (Column column : columns) {
            if (columnNames.contains(column.getName().toLowerCase())) {
                result.addError(new ValidationError(
                    ValidationError.ErrorType.BUSINESS_RULE,
                    "COLUMN",
                    column.getName(),
                    "중복된 컬럼 이름입니다",
                    "고유한 컬럼 이름을 사용하세요"
                ));
            }
            columnNames.add(column.getName().toLowerCase());
        }
    }
    
    /**
     * 컬럼 데이터 타입 검증
     */
    private void validateColumnDataType(Column column, ValidationResult result) {
        MSSQLDataType dataType = column.getDataType();
        
        // 길이가 필요한 타입인데 길이가 없는 경우
        if (dataType.requiresLength() && column.getMaxLength() == null) {
            result.addError(new ValidationError(
                ValidationError.ErrorType.DATA_TYPE,
                "COLUMN",
                column.getName(),
                dataType.getSqlName() + " 타입은 길이 지정이 필요합니다",
                "길이를 지정하세요"
            ));
        }
        
        // 정밀도가 필요한 타입인데 정밀도가 없는 경우
        if (dataType.requiresPrecision() && column.getPrecision() == null) {
            result.addError(new ValidationError(
                ValidationError.ErrorType.DATA_TYPE,
                "COLUMN",
                column.getName(),
                dataType.getSqlName() + " 타입은 정밀도 지정이 필요합니다",
                "정밀도를 지정하세요"
            ));
        }
        
        // IDENTITY 속성 검증
        if (column.isIdentity() && !dataType.supportsIdentity()) {
            result.addError(new ValidationError(
                ValidationError.ErrorType.DATA_TYPE,
                "COLUMN",
                column.getName(),
                dataType.getSqlName() + " 타입은 IDENTITY를 지원하지 않습니다",
                "IDENTITY 지원 타입으로 변경하세요"
            ));
        }
        
        // 기본키 타입 검증
        if (column.isPrimaryKey() && !dataType.canBePrimaryKey()) {
            result.addError(new ValidationError(
                ValidationError.ErrorType.DATA_TYPE,
                "COLUMN",
                column.getName(),
                dataType.getSqlName() + " 타입은 기본키로 사용할 수 없습니다",
                "기본키 지원 타입으로 변경하세요"
            ));
        }
    }
    
    /**
     * 단일 테이블 검증
     * 
     * @param tableId 테이블 ID
     * @return 검증 결과
     */
    public ValidationResult validateTable(UUID tableId) {
        Table table = tableRepository.findById(tableId)
            .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다: " + tableId));
        
        Project project = projectRepository.findById(table.getProjectId())
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + table.getProjectId()));
        
        ValidationResult result = new ValidationResult(project.getId());
        validateTable(table, project.getNamingRules(), result);
        
        return result;
    }
    
    /**
     * 네이밍 규칙 검증 (실시간)
     * 
     * @param projectId 프로젝트 ID
     * @param objectType 객체 타입 (TABLE, COLUMN, INDEX)
     * @param name 검증할 이름
     * @return 검증 결과
     */
    public ValidationError validateName(UUID projectId, String objectType, String name) {
        return validateName(projectId, objectType, name, null);
    }
    
    /**
     * 네이밍 규칙 검증 (실시간) - 테이블명 포함
     * 
     * @param projectId 프로젝트 ID
     * @param objectType 객체 타입 (TABLE, COLUMN, INDEX)
     * @param name 검증할 이름
     * @param tableName 테이블명 (컬럼 검증 시 사용)
     * @return 검증 결과
     */
    public ValidationError validateName(UUID projectId, String objectType, String name, String tableName) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        NamingRules namingRules = project.getNamingRules();
        if (namingRules == null) {
            return new ValidationError(
                ValidationError.ErrorType.NAMING_RULE,
                objectType,
                name,
                "네이밍 규칙이 설정되지 않았습니다",
                null
            );
        }
        
        // SQL Server 특화 검증 먼저 수행
        ValidationError sqlServerError = validateSqlServerName(projectId, objectType, name, tableName);
        if (sqlServerError != null) {
            return sqlServerError;
        }
        
        // 기본 네이밍 규칙 검증
        boolean isValid = switch (objectType.toUpperCase()) {
            case "TABLE" -> namingRules.validateTableName(name);
            case "COLUMN" -> namingRules.validateColumnName(name);
            case "INDEX" -> namingRules.validateIndexName(name);
            default -> false;
        };
        
        if (!isValid) {
            String suggestion = switch (objectType.toUpperCase()) {
                case "TABLE" -> namingRules.suggestTableName(name);
                case "COLUMN" -> namingRules.suggestColumnName(name);
                case "INDEX" -> namingRules.suggestIndexName(tableName != null ? tableName : "Table", name);
                default -> null;
            };
            
            return new ValidationError(
                ValidationError.ErrorType.NAMING_RULE,
                objectType,
                name,
                objectType + " 이름이 네이밍 규칙을 위반했습니다",
                suggestion
            );
        }
        
        return null; // 검증 통과
    }
    
    /**
     * SQL Server 특화 규칙 검증
     */
    private void validateSqlServerRules(Table table, NamingRules namingRules, ValidationResult result) {
        // 테이블명 대문자 강제 검증
        if (namingRules.isEnforceUpperCase() && !table.getName().equals(table.getName().toUpperCase())) {
            result.addError(new ValidationError(
                ValidationError.ErrorType.SQL_SERVER_NAMING,
                "TABLE",
                table.getName(),
                "테이블명은 대문자로 작성해야 합니다",
                table.getName().toUpperCase()
            ));
        }
        
        // 테이블 설명 필수 검증
        if (namingRules.isRequireDescription() && 
            (table.getDescription() == null || table.getDescription().trim().isEmpty())) {
            result.addError(new ValidationError(
                ValidationError.ErrorType.SQL_SERVER_DESCRIPTION,
                "TABLE",
                table.getName(),
                "테이블 설명(Description)이 필수입니다",
                "의미있는 한글 설명을 추가하세요"
            ));
        }
    }
    
    /**
     * SQL Server 감사 컬럼 검증
     */
    private void validateAuditColumns(Table table, List<Column> columns, NamingRules namingRules, ValidationResult result) {
        if (!namingRules.isRecommendAuditColumns()) return;
        
        List<String> columnNames = columns.stream()
            .map(Column::getName)
            .map(String::toUpperCase)
            .toList();
        
        // REG_ID, REG_DT, CHG_ID, CHG_DT 확인 (권장사항)
        String[] auditColumns = {"REG_ID", "REG_DT", "CHG_ID", "CHG_DT"};
        List<String> missingColumns = new ArrayList<>();
        
        for (String auditColumn : auditColumns) {
            if (!columnNames.contains(auditColumn)) {
                missingColumns.add(auditColumn);
            }
        }
        
        if (!missingColumns.isEmpty()) {
            result.addWarning(new ValidationError(
                ValidationError.ErrorType.SQL_SERVER_AUDIT,
                "TABLE",
                table.getName(),
                "감사 컬럼 권장: " + String.join(", ", missingColumns),
                "감사 컬럼 추가를 권장합니다 (REG_ID, REG_DT, CHG_ID, CHG_DT)"
            ));
        }
    }
    
    /**
     * SQL Server 기본키 명명 검증
     */
    private void validatePrimaryKeyNaming(Table table, List<Column> columns, NamingRules namingRules, ValidationResult result) {
        if (!namingRules.isEnforceTableColumnNaming()) return;
        
        for (Column column : columns) {
            if (column.isPrimaryKey()) {
                String tableName = table.getName();
                String columnName = column.getName();
                
                // 단독명칭 체크 (경고)
                if (columnName.equalsIgnoreCase("ID") || 
                    columnName.equalsIgnoreCase("SEQ_NO") || 
                    columnName.equalsIgnoreCase("HIST_NO")) {
                    result.addWarning(new ValidationError(
                        ValidationError.ErrorType.SQL_SERVER_NAMING,
                        "COLUMN",
                        columnName,
                        "기본키에 단독명칭 사용 지양: " + columnName,
                        "테이블명+컬럼명 조합 권장: " + tableName + "_" + columnName
                    ));
                }
                
                // 컬럼명 대문자 강제 검증
                if (namingRules.isEnforceUpperCase() && !columnName.equals(columnName.toUpperCase())) {
                    result.addError(new ValidationError(
                        ValidationError.ErrorType.SQL_SERVER_NAMING,
                        "COLUMN",
                        columnName,
                        "컬럼명은 대문자로 작성해야 합니다",
                        columnName.toUpperCase()
                    ));
                }
                
                // 컬럼 설명 필수 검증
                if (namingRules.isRequireDescription() && 
                    (column.getDescription() == null || column.getDescription().trim().isEmpty())) {
                    result.addError(new ValidationError(
                        ValidationError.ErrorType.SQL_SERVER_DESCRIPTION,
                        "COLUMN",
                        columnName,
                        "컬럼 설명(Description)이 필수입니다",
                        "한글 설명을 추가하세요"
                    ));
                }
            }
        }
    }
    
    /**
     * SQL Server 특화 실시간 검증
     */
    public ValidationError validateSqlServerName(UUID projectId, String objectType, String name, String tableName) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        NamingRules namingRules = project.getNamingRules();
        if (namingRules == null) return null;
        
        // 대문자 강제 검증
        if (namingRules.isEnforceUpperCase() && !name.equals(name.toUpperCase())) {
            return new ValidationError(
                ValidationError.ErrorType.SQL_SERVER_NAMING,
                objectType,
                name,
                objectType + " 이름은 대문자로 작성해야 합니다",
                name.toUpperCase()
            );
        }
        
        // 기본키 단독명칭 체크 (경고)
        if ("COLUMN".equals(objectType) && tableName != null && namingRules.isEnforceTableColumnNaming()) {
            if (name.equalsIgnoreCase("ID") || name.equalsIgnoreCase("SEQ_NO") || name.equalsIgnoreCase("HIST_NO")) {
                return new ValidationError(
                    ValidationError.ErrorType.SQL_SERVER_NAMING,
                    objectType,
                    name,
                    "단독명칭 사용 지양: " + name,
                    tableName + "_" + name + " 형태 권장"
                );
            }
        }
        
        return null;
    }
    
    /**
     * 검증 결과 클래스
     */
    public static class ValidationResult {
        private final UUID projectId;
        private final List<ValidationError> errors;
        private final List<ValidationError> warnings;
        
        public ValidationResult(UUID projectId) {
            this.projectId = projectId;
            this.errors = new ArrayList<>();
            this.warnings = new ArrayList<>();
        }
        
        public void addError(ValidationError error) {
            this.errors.add(error);
        }
        
        public void addWarning(ValidationError warning) {
            this.warnings.add(warning);
        }
        
        public boolean hasErrors() {
            return !errors.isEmpty();
        }
        
        public boolean hasWarnings() {
            return !warnings.isEmpty();
        }
        
        public boolean isValid() {
            return errors.isEmpty();
        }
        
        // Getters
        public UUID getProjectId() { return projectId; }
        public List<ValidationError> getErrors() { return errors; }
        public List<ValidationError> getWarnings() { return warnings; }
    }
    
    /**
     * 검증 오류 클래스
     */
    public static class ValidationError {
        private final ErrorType errorType;
        private final String objectType;
        private final String objectName;
        private final String message;
        private final String suggestion;
        
        public ValidationError(ErrorType errorType, String objectType, String objectName, 
                             String message, String suggestion) {
            this.errorType = errorType;
            this.objectType = objectType;
            this.objectName = objectName;
            this.message = message;
            this.suggestion = suggestion;
        }
        
        // Getters
        public ErrorType getErrorType() { return errorType; }
        public String getObjectType() { return objectType; }
        public String getObjectName() { return objectName; }
        public String getMessage() { return message; }
        public String getSuggestion() { return suggestion; }
        
        public enum ErrorType {
            NAMING_RULE,
            BUSINESS_RULE,
            DATA_TYPE,
            SQL_SERVER_NAMING,
            SQL_SERVER_AUDIT,
            SQL_SERVER_DESCRIPTION
        }
    }
}