package com.dbmodeling.application.service;

import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.service.SchemaExportService;
import com.dbmodeling.domain.service.SqlGeneratorService;
import com.dbmodeling.domain.service.ValidationDomainService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * 내보내기 애플리케이션 서비스
 * 프로젝트 스키마를 다양한 형식으로 내보내는 기능을 제공
 */
@Service
@Transactional(readOnly = true)
public class ExportService {
    
    private final ProjectRepository projectRepository;
    private final SchemaExportService schemaExportService;
    private final SqlGeneratorService sqlGeneratorService;
    private final ValidationDomainService validationDomainService;
    
    public ExportService(ProjectRepository projectRepository,
                        SchemaExportService schemaExportService,
                        SqlGeneratorService sqlGeneratorService,
                        ValidationDomainService validationDomainService) {
        this.projectRepository = projectRepository;
        this.schemaExportService = schemaExportService;
        this.sqlGeneratorService = sqlGeneratorService;
        this.validationDomainService = validationDomainService;
    }
    
    /**
     * 프로젝트를 지정된 형식으로 내보내기
     * 
     * @param projectId 프로젝트 ID
     * @param format 내보내기 형식
     * @return 내보내기 결과
     */
    public ExportResult exportProject(UUID projectId, ExportFormat format) {
        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        // 스키마 내보내기 서비스를 통해 내보내기 실행
        SchemaExportService.ExportResult domainResult = schemaExportService.exportSchema(
            project, 
            convertToSchemaExportFormat(format)
        );
        
        // 애플리케이션 계층 결과로 변환
        return new ExportResult(
            domainResult.isSuccess(),
            domainResult.getContent(),
            format,
            domainResult.getValidationResult()
        );
    }
    
    /**
     * SQL 스크립트만 생성 (빠른 내보내기)
     * 
     * @param projectId 프로젝트 ID
     * @return SQL 스크립트
     */
    public String generateSqlScript(UUID projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        return sqlGeneratorService.generateProjectSql(project);
    }
    
    /**
     * SQL 스크립트 생성 (옵션 지정)
     * 
     * @param projectId 프로젝트 ID
     * @param options 생성 옵션
     * @return SQL 스크립트
     */
    public String generateSqlScript(UUID projectId, com.dbmodeling.domain.model.SchemaGenerationOptions options) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        return sqlGeneratorService.generateProjectSql(project, options);
    }
    
    /**
     * 검증과 함께 SQL 스크립트 생성
     * 
     * @param projectId 프로젝트 ID
     * @return 검증 정보가 포함된 SQL 스크립트
     */
    public String generateSqlScriptWithValidation(UUID projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(
            project, 
            SchemaExportService.ExportFormat.SQL_WITH_VALIDATION
        );
        
        return result.getContent();
    }
    
    /**
     * 마크다운 문서 생성
     * 
     * @param projectId 프로젝트 ID
     * @return 마크다운 문서
     */
    public String generateDocumentation(UUID projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(
            project, 
            SchemaExportService.ExportFormat.DOCUMENTATION
        );
        
        return result.getContent();
    }
    
    /**
     * HTML 문서 생성
     * 
     * @param projectId 프로젝트 ID
     * @return HTML 문서
     */
    public String generateHtmlDocumentation(UUID projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(
            project, 
            SchemaExportService.ExportFormat.HTML_DOCUMENTATION
        );
        
        return result.getContent();
    }
    
    /**
     * JSON 스키마 생성
     * 
     * @param projectId 프로젝트 ID
     * @return JSON 스키마
     */
    public String generateJsonSchema(UUID projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(
            project, 
            SchemaExportService.ExportFormat.JSON_SCHEMA
        );
        
        return result.getContent();
    }
    
    /**
     * CSV 테이블 목록 생성
     * 
     * @param projectId 프로젝트 ID
     * @return CSV 테이블 목록
     */
    public String generateCsvTableList(UUID projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(
            project, 
            SchemaExportService.ExportFormat.CSV_TABLE_LIST
        );
        
        return result.getContent();
    }
    
    /**
     * 프로젝트 내보내기 가능 여부 확인
     * 
     * @param projectId 프로젝트 ID
     * @return 내보내기 가능 여부와 검증 결과
     */
    public ValidationSummary validateForExport(UUID projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));
        
        ValidationDomainService.SchemaValidationResult validationResult = 
            validationDomainService.validateForSchemaExport(project);
        
        return new ValidationSummary(
            validationResult.canExportSchema(),
            validationResult.getTotalErrorCount(),
            validationResult.getTotalWarningCount(),
            validationResult.getStructuralErrors(),
            validationResult.getDataTypeErrors()
        );
    }
    
    /**
     * 애플리케이션 계층 내보내기 형식을 도메인 계층 형식으로 변환
     */
    private SchemaExportService.ExportFormat convertToSchemaExportFormat(ExportFormat format) {
        return switch (format) {
            case SQL -> SchemaExportService.ExportFormat.SQL_SCRIPT;
            case SQL_WITH_VALIDATION -> SchemaExportService.ExportFormat.SQL_WITH_VALIDATION;
            case MARKDOWN -> SchemaExportService.ExportFormat.DOCUMENTATION;
            case HTML -> SchemaExportService.ExportFormat.HTML_DOCUMENTATION;
            case JSON -> SchemaExportService.ExportFormat.JSON_SCHEMA;
            case CSV -> SchemaExportService.ExportFormat.CSV_TABLE_LIST;
        };
    }
    
    /**
     * 내보내기 형식 열거형
     */
    public enum ExportFormat {
        SQL("SQL 스크립트", ".sql", "application/sql"),
        SQL_WITH_VALIDATION("검증 포함 SQL", ".sql", "application/sql"),
        MARKDOWN("마크다운 문서", ".md", "text/markdown"),
        HTML("HTML 문서", ".html", "text/html"),
        JSON("JSON 스키마", ".json", "application/json"),
        CSV("CSV 테이블 목록", ".csv", "text/csv");
        
        private final String displayName;
        private final String fileExtension;
        private final String mimeType;
        
        ExportFormat(String displayName, String fileExtension, String mimeType) {
            this.displayName = displayName;
            this.fileExtension = fileExtension;
            this.mimeType = mimeType;
        }
        
        public String getDisplayName() { return displayName; }
        public String getFileExtension() { return fileExtension; }
        public String getMimeType() { return mimeType; }
    }
    
    /**
     * 내보내기 결과 클래스
     */
    public static class ExportResult {
        private final boolean success;
        private final String content;
        private final ExportFormat format;
        private final ValidationDomainService.SchemaValidationResult validationResult;
        
        public ExportResult(boolean success, String content, ExportFormat format, 
                          ValidationDomainService.SchemaValidationResult validationResult) {
            this.success = success;
            this.content = content;
            this.format = format;
            this.validationResult = validationResult;
        }
        
        public boolean isSuccess() { return success; }
        public String getContent() { return content; }
        public ExportFormat getFormat() { return format; }
        public ValidationDomainService.SchemaValidationResult getValidationResult() { return validationResult; }
        
        /**
         * 파일명 생성
         */
        public String generateFileName(String projectName) {
            String sanitizedName = projectName.replaceAll("[^a-zA-Z0-9가-힣_-]", "_");
            return sanitizedName + "_schema" + format.getFileExtension();
        }
    }
    
    /**
     * 검증 요약 클래스
     */
    public static class ValidationSummary {
        private final boolean canExport;
        private final int errorCount;
        private final int warningCount;
        private final java.util.List<String> structuralErrors;
        private final java.util.List<String> dataTypeErrors;
        
        public ValidationSummary(boolean canExport, int errorCount, int warningCount,
                               java.util.List<String> structuralErrors,
                               java.util.List<String> dataTypeErrors) {
            this.canExport = canExport;
            this.errorCount = errorCount;
            this.warningCount = warningCount;
            this.structuralErrors = structuralErrors;
            this.dataTypeErrors = dataTypeErrors;
        }
        
        public boolean canExport() { return canExport; }
        public int getErrorCount() { return errorCount; }
        public int getWarningCount() { return warningCount; }
        public java.util.List<String> getStructuralErrors() { return structuralErrors; }
        public java.util.List<String> getDataTypeErrors() { return dataTypeErrors; }
        
        public boolean hasIssues() {
            return errorCount > 0 || warningCount > 0;
        }
    }
}