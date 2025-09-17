package com.dbmodeling.domain.service;

import com.dbmodeling.domain.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 스키마 내보내기 서비스
 * 다양한 형식으로 스키마를 내보내는 기능을 제공
 */
@Service
public class SchemaExportService {
    
    private final SqlGeneratorService sqlGeneratorService;
    private final ValidationDomainService validationService;

    public SchemaExportService(SqlGeneratorService sqlGeneratorService, ValidationDomainService validationService) {
        this.sqlGeneratorService = sqlGeneratorService;
        this.validationService = validationService;
    }

    /**
     * 스키마 내보내기 결과
     */
    public static class ExportResult {
        private final boolean success;
        private final String content;
        private final ValidationDomainService.SchemaValidationResult validationResult;
        private final ExportFormat format;

        public ExportResult(boolean success, String content, ValidationDomainService.SchemaValidationResult validationResult, ExportFormat format) {
            this.success = success;
            this.content = content;
            this.validationResult = validationResult;
            this.format = format;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getContent() {
            return content;
        }

        public ValidationDomainService.SchemaValidationResult getValidationResult() {
            return validationResult;
        }

        public ExportFormat getFormat() {
            return format;
        }
    }

    /**
     * 내보내기 형식
     */
    public enum ExportFormat {
        SQL_SCRIPT("SQL 스크립트", ".sql"),
        DOCUMENTATION("문서화", ".md"),
        SQL_WITH_VALIDATION("검증 포함 SQL", ".sql"),
        HTML_DOCUMENTATION("HTML 문서", ".html"),
        JSON_SCHEMA("JSON 스키마", ".json"),
        CSV_TABLE_LIST("CSV 테이블 목록", ".csv");

        private final String displayName;
        private final String fileExtension;

        ExportFormat(String displayName, String fileExtension) {
            this.displayName = displayName;
            this.fileExtension = fileExtension;
        }

        public String getDisplayName() {
            return displayName;
        }

        public String getFileExtension() {
            return fileExtension;
        }
    }

    /**
     * 프로젝트 스키마 내보내기
     */
    public ExportResult exportSchema(Project project, ExportFormat format) {
        // 1. 스키마 검증
        ValidationDomainService.SchemaValidationResult validationResult = validationService.validateForSchemaExport(project);

        // 2. 형식에 따른 내보내기
        String content = switch (format) {
            case SQL_SCRIPT -> generateSqlScript(project, validationResult);
            case DOCUMENTATION -> generateDocumentation(project, validationResult);
            case SQL_WITH_VALIDATION -> generateSqlWithValidation(project, validationResult);
            case HTML_DOCUMENTATION -> generateHtmlDocumentation(project, validationResult);
            case JSON_SCHEMA -> generateJsonSchema(project, validationResult);
            case CSV_TABLE_LIST -> generateCsvTableList(project, validationResult);
        };

        boolean success = validationResult.canExportSchema();
        return new ExportResult(success, content, validationResult, format);
    }

    /**
     * 순수 SQL 스크립트 생성
     */
    private String generateSqlScript(Project project, ValidationDomainService.SchemaValidationResult validationResult) {
        if (!validationResult.canExportSchema()) {
            return generateErrorReport(validationResult);
        }

        return sqlGeneratorService.generateProjectSql(project);
    }

    /**
     * 검증 정보가 포함된 SQL 스크립트 생성
     */
    private String generateSqlWithValidation(Project project, ValidationDomainService.SchemaValidationResult validationResult) {
        StringBuilder content = new StringBuilder();

        // 검증 결과 헤더
        content.append("/*\n");
        content.append("=== 스키마 검증 결과 ===\n");
        content.append("프로젝트: ").append(project.getName()).append("\n");
        content.append("생성일: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
        content.append("총 오류: ").append(validationResult.getTotalErrorCount()).append("개\n");
        content.append("총 경고: ").append(validationResult.getTotalWarningCount()).append("개\n");
        content.append("\n");

        if (validationResult.hasErrors()) {
            content.append("=== 오류 목록 ===\n");
            
            if (!validationResult.getStructuralErrors().isEmpty()) {
                content.append("구조적 오류:\n");
                for (String error : validationResult.getStructuralErrors()) {
                    content.append("- ").append(error).append("\n");
                }
                content.append("\n");
            }

            if (!validationResult.getDataTypeErrors().isEmpty()) {
                content.append("데이터 타입 오류:\n");
                for (String error : validationResult.getDataTypeErrors()) {
                    content.append("- ").append(error).append("\n");
                }
                content.append("\n");
            }

            if (!validationResult.getNamingErrors().isEmpty()) {
                content.append("네이밍 규칙 오류:\n");
                for (ValidationDomainService.ValidationError error : validationResult.getNamingErrors()) {
                    content.append("- ").append(error.getMessage());
                    if (error.getSuggestion() != null) {
                        content.append(" (제안: ").append(error.getSuggestion()).append(")");
                    }
                    content.append("\n");
                }
                content.append("\n");
            }
        }

        if (validationResult.hasWarnings()) {
            content.append("=== 경고 목록 ===\n");
            
            if (!validationResult.getStructuralWarnings().isEmpty()) {
                content.append("구조적 경고:\n");
                for (String warning : validationResult.getStructuralWarnings()) {
                    content.append("- ").append(warning).append("\n");
                }
                content.append("\n");
            }

            if (!validationResult.getDataTypeWarnings().isEmpty()) {
                content.append("데이터 타입 경고:\n");
                for (String warning : validationResult.getDataTypeWarnings()) {
                    content.append("- ").append(warning).append("\n");
                }
                content.append("\n");
            }

            if (!validationResult.getNamingWarnings().isEmpty()) {
                content.append("네이밍 규칙 경고:\n");
                for (ValidationDomainService.ValidationWarning warning : validationResult.getNamingWarnings()) {
                    content.append("- ").append(warning.getMessage()).append("\n");
                }
                content.append("\n");
            }
        }

        content.append("*/\n\n");

        // SQL 스크립트 추가
        if (validationResult.canExportSchema()) {
            content.append(sqlGeneratorService.generateProjectSql(project));
        } else {
            content.append("-- 오류로 인해 SQL 스크립트를 생성할 수 없습니다.\n");
            content.append("-- 위의 오류를 수정한 후 다시 시도하세요.\n");
        }

        return content.toString();
    }

    /**
     * 마크다운 문서 형식으로 생성
     */
    private String generateDocumentation(Project project, ValidationDomainService.SchemaValidationResult validationResult) {
        StringBuilder doc = new StringBuilder();

        // 문서 헤더
        doc.append("# ").append(project.getName()).append(" 데이터베이스 스키마\n\n");
        
        if (project.getDescription() != null && !project.getDescription().trim().isEmpty()) {
            doc.append("## 프로젝트 설명\n\n");
            doc.append(project.getDescription()).append("\n\n");
        }

        doc.append("**생성일:** ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH:mm"))).append("\n\n");

        // 검증 결과 요약
        doc.append("## 검증 결과\n\n");
        doc.append("- **총 오류:** ").append(validationResult.getTotalErrorCount()).append("개\n");
        doc.append("- **총 경고:** ").append(validationResult.getTotalWarningCount()).append("개\n");
        doc.append("- **스키마 출력 가능:** ").append(validationResult.canExportSchema() ? "예" : "아니오").append("\n\n");

        // 테이블 목록
        doc.append("## 테이블 목록\n\n");
        doc.append("| 테이블명 | 설명 | 컬럼 수 | 인덱스 수 |\n");
        doc.append("|----------|------|---------|----------|\n");
        
        for (Table table : project.getTables()) {
            doc.append("| ").append(table.getName()).append(" | ");
            doc.append(table.getDescription() != null ? table.getDescription() : "").append(" | ");
            doc.append(table.getColumns().size()).append(" | ");
            doc.append(table.getIndexes().size()).append(" |\n");
        }
        doc.append("\n");

        // 각 테이블 상세 정보
        for (Table table : project.getTables()) {
            generateTableDocumentation(table, doc);
        }

        // 검증 오류 및 경고 상세
        if (validationResult.hasErrors() || validationResult.hasWarnings()) {
            doc.append("## 검증 상세 결과\n\n");
            
            if (validationResult.hasErrors()) {
                doc.append("### 오류\n\n");
                generateValidationErrorsDocumentation(validationResult, doc);
            }
            
            if (validationResult.hasWarnings()) {
                doc.append("### 경고\n\n");
                generateValidationWarningsDocumentation(validationResult, doc);
            }
        }

        // SQL 스크립트 (오류가 없는 경우에만)
        if (validationResult.canExportSchema()) {
            doc.append("## SQL 스크립트\n\n");
            doc.append("```sql\n");
            doc.append(sqlGeneratorService.generateProjectSql(project));
            doc.append("```\n\n");
        }

        return doc.toString();
    }

    /**
     * 테이블별 문서화
     */
    private void generateTableDocumentation(Table table, StringBuilder doc) {
        doc.append("### ").append(table.getName());
        if (table.getDescription() != null && !table.getDescription().trim().isEmpty()) {
            doc.append(" - ").append(table.getDescription());
        }
        doc.append("\n\n");

        // 컬럼 정보
        doc.append("#### 컬럼\n\n");
        doc.append("| 컬럼명 | 데이터 타입 | NULL 허용 | 기본키 | 자동증가 | 기본값 | 설명 |\n");
        doc.append("|--------|-------------|-----------|--------|----------|--------|------|\n");

        List<Column> sortedColumns = table.getColumns().stream()
                .sorted((c1, c2) -> Integer.compare(c1.getOrderIndex(), c2.getOrderIndex()))
                .collect(Collectors.toList());

        for (Column column : sortedColumns) {
            doc.append("| ").append(column.getName()).append(" | ");
            doc.append(formatDataTypeForDoc(column)).append(" | ");
            doc.append(column.isNullable() ? "예" : "아니오").append(" | ");
            doc.append(column.isPrimaryKey() ? "예" : "아니오").append(" | ");
            doc.append(column.isIdentity() ? "예" : "아니오").append(" | ");
            doc.append(column.getDefaultValue() != null ? column.getDefaultValue() : "").append(" | ");
            doc.append(column.getDescription() != null ? column.getDescription() : "").append(" |\n");
        }
        doc.append("\n");

        // 인덱스 정보
        if (!table.getIndexes().isEmpty()) {
            doc.append("#### 인덱스\n\n");
            doc.append("| 인덱스명 | 타입 | 유니크 | 컬럼 |\n");
            doc.append("|----------|------|--------|------|\n");

            for (Index index : table.getIndexes()) {
                doc.append("| ").append(index.getName()).append(" | ");
                doc.append(index.getType().getSqlName()).append(" | ");
                doc.append(index.isUnique() ? "예" : "아니오").append(" | ");
                
                String columnList = index.getColumns().stream()
                        .map(indexColumn -> {
                            Column column = findColumnById(table, indexColumn.getColumnId());
                            return column != null ? column.getName() + " " + indexColumn.getOrder().getSqlName() : "알 수 없음";
                        })
                        .collect(Collectors.joining(", "));
                doc.append(columnList).append(" |\n");
            }
            doc.append("\n");
        }
    }

    /**
     * 문서용 데이터 타입 포맷팅
     */
    private String formatDataTypeForDoc(Column column) {
        if (column.getDataType() == null) {
            return "미정의";
        }
        return column.getDataType().toSqlString(column.getMaxLength(), column.getPrecision(), column.getScale());
    }

    /**
     * 검증 오류 문서화
     */
    private void generateValidationErrorsDocumentation(ValidationDomainService.SchemaValidationResult validationResult, StringBuilder doc) {
        if (!validationResult.getStructuralErrors().isEmpty()) {
            doc.append("#### 구조적 오류\n\n");
            for (String error : validationResult.getStructuralErrors()) {
                doc.append("- ").append(error).append("\n");
            }
            doc.append("\n");
        }

        if (!validationResult.getDataTypeErrors().isEmpty()) {
            doc.append("#### 데이터 타입 오류\n\n");
            for (String error : validationResult.getDataTypeErrors()) {
                doc.append("- ").append(error).append("\n");
            }
            doc.append("\n");
        }

        if (!validationResult.getNamingErrors().isEmpty()) {
            doc.append("#### 네이밍 규칙 오류\n\n");
            for (ValidationDomainService.ValidationError error : validationResult.getNamingErrors()) {
                doc.append("- ").append(error.getMessage());
                if (error.getSuggestion() != null) {
                    doc.append(" *(제안: ").append(error.getSuggestion()).append(")*");
                }
                doc.append("\n");
            }
            doc.append("\n");
        }
    }

    /**
     * 검증 경고 문서화
     */
    private void generateValidationWarningsDocumentation(ValidationDomainService.SchemaValidationResult validationResult, StringBuilder doc) {
        if (!validationResult.getStructuralWarnings().isEmpty()) {
            doc.append("#### 구조적 경고\n\n");
            for (String warning : validationResult.getStructuralWarnings()) {
                doc.append("- ").append(warning).append("\n");
            }
            doc.append("\n");
        }

        if (!validationResult.getDataTypeWarnings().isEmpty()) {
            doc.append("#### 데이터 타입 경고\n\n");
            for (String warning : validationResult.getDataTypeWarnings()) {
                doc.append("- ").append(warning).append("\n");
            }
            doc.append("\n");
        }

        if (!validationResult.getNamingWarnings().isEmpty()) {
            doc.append("#### 네이밍 규칙 경고\n\n");
            for (ValidationDomainService.ValidationWarning warning : validationResult.getNamingWarnings()) {
                doc.append("- ").append(warning.getMessage()).append("\n");
            }
            doc.append("\n");
        }
    }

    /**
     * 오류 보고서 생성
     */
    private String generateErrorReport(ValidationDomainService.SchemaValidationResult validationResult) {
        StringBuilder report = new StringBuilder();
        
        report.append("-- 스키마 출력 실패\n");
        report.append("-- 다음 오류들을 수정한 후 다시 시도하세요.\n\n");

        if (!validationResult.getStructuralErrors().isEmpty()) {
            report.append("-- 구조적 오류:\n");
            for (String error : validationResult.getStructuralErrors()) {
                report.append("-- - ").append(error).append("\n");
            }
            report.append("\n");
        }

        if (!validationResult.getDataTypeErrors().isEmpty()) {
            report.append("-- 데이터 타입 오류:\n");
            for (String error : validationResult.getDataTypeErrors()) {
                report.append("-- - ").append(error).append("\n");
            }
            report.append("\n");
        }

        return report.toString();
    }

    /**
     * HTML 문서 형식으로 생성
     */
    private String generateHtmlDocumentation(Project project, ValidationDomainService.SchemaValidationResult validationResult) {
        StringBuilder html = new StringBuilder();
        
        // HTML 헤더
        html.append("<!DOCTYPE html>\n");
        html.append("<html lang=\"ko\">\n");
        html.append("<head>\n");
        html.append("    <meta charset=\"UTF-8\">\n");
        html.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        html.append("    <title>").append(project.getName()).append(" - 데이터베이스 스키마</title>\n");
        html.append("    <style>\n");
        html.append("        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }\n");
        html.append("        h1, h2, h3 { color: #333; }\n");
        html.append("        table { border-collapse: collapse; width: 100%; margin: 10px 0; }\n");
        html.append("        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n");
        html.append("        th { background-color: #f2f2f2; }\n");
        html.append("        .error { color: #d32f2f; }\n");
        html.append("        .warning { color: #f57c00; }\n");
        html.append("        .success { color: #388e3c; }\n");
        html.append("        .code { background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; }\n");
        html.append("    </style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        
        // 문서 내용
        html.append("    <h1>").append(project.getName()).append(" 데이터베이스 스키마</h1>\n");
        
        if (project.getDescription() != null && !project.getDescription().trim().isEmpty()) {
            html.append("    <h2>프로젝트 설명</h2>\n");
            html.append("    <p>").append(project.getDescription()).append("</p>\n");
        }
        
        html.append("    <p><strong>생성일:</strong> ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH:mm"))).append("</p>\n");
        
        // 검증 결과
        html.append("    <h2>검증 결과</h2>\n");
        html.append("    <ul>\n");
        html.append("        <li><strong>총 오류:</strong> <span class=\"error\">").append(validationResult.getTotalErrorCount()).append("개</span></li>\n");
        html.append("        <li><strong>총 경고:</strong> <span class=\"warning\">").append(validationResult.getTotalWarningCount()).append("개</span></li>\n");
        html.append("        <li><strong>스키마 출력 가능:</strong> <span class=\"").append(validationResult.canExportSchema() ? "success" : "error").append("\">").append(validationResult.canExportSchema() ? "예" : "아니오").append("</span></li>\n");
        html.append("    </ul>\n");
        
        // 테이블 목록
        html.append("    <h2>테이블 목록</h2>\n");
        html.append("    <table>\n");
        html.append("        <thead>\n");
        html.append("            <tr><th>테이블명</th><th>설명</th><th>컬럼 수</th><th>인덱스 수</th></tr>\n");
        html.append("        </thead>\n");
        html.append("        <tbody>\n");
        
        for (Table table : project.getTables()) {
            html.append("            <tr>\n");
            html.append("                <td><a href=\"#table-").append(table.getName().toLowerCase()).append("\">").append(table.getName()).append("</a></td>\n");
            html.append("                <td>").append(table.getDescription() != null ? table.getDescription() : "").append("</td>\n");
            html.append("                <td>").append(table.getColumns().size()).append("</td>\n");
            html.append("                <td>").append(table.getIndexes().size()).append("</td>\n");
            html.append("            </tr>\n");
        }
        
        html.append("        </tbody>\n");
        html.append("    </table>\n");
        
        // 각 테이블 상세 정보
        for (Table table : project.getTables()) {
            generateTableHtmlDocumentation(table, html);
        }
        
        // SQL 스크립트 (오류가 없는 경우에만)
        if (validationResult.canExportSchema()) {
            html.append("    <h2>SQL 스크립트</h2>\n");
            html.append("    <div class=\"code\">\n");
            html.append("        <pre>").append(escapeHtml(sqlGeneratorService.generateProjectSql(project))).append("</pre>\n");
            html.append("    </div>\n");
        }
        
        // HTML 푸터
        html.append("</body>\n");
        html.append("</html>\n");
        
        return html.toString();
    }

    /**
     * JSON 스키마 형식으로 생성
     */
    private String generateJsonSchema(Project project, ValidationDomainService.SchemaValidationResult validationResult) {
        StringBuilder json = new StringBuilder();
        
        json.append("{\n");
        json.append("  \"project\": {\n");
        json.append("    \"name\": \"").append(escapeJson(project.getName())).append("\",\n");
        json.append("    \"description\": \"").append(escapeJson(project.getDescription() != null ? project.getDescription() : "")).append("\",\n");
        json.append("    \"generatedAt\": \"").append(LocalDateTime.now().toString()).append("\",\n");
        json.append("    \"validation\": {\n");
        json.append("      \"totalErrors\": ").append(validationResult.getTotalErrorCount()).append(",\n");
        json.append("      \"totalWarnings\": ").append(validationResult.getTotalWarningCount()).append(",\n");
        json.append("      \"canExport\": ").append(validationResult.canExportSchema()).append("\n");
        json.append("    },\n");
        json.append("    \"tables\": [\n");
        
        for (int i = 0; i < project.getTables().size(); i++) {
            Table table = project.getTables().get(i);
            json.append("      {\n");
            json.append("        \"name\": \"").append(escapeJson(table.getName())).append("\",\n");
            json.append("        \"description\": \"").append(escapeJson(table.getDescription() != null ? table.getDescription() : "")).append("\",\n");
            json.append("        \"columns\": [\n");
            
            List<Column> sortedColumns = table.getColumns().stream()
                    .sorted((c1, c2) -> Integer.compare(c1.getOrderIndex(), c2.getOrderIndex()))
                    .collect(Collectors.toList());
            
            for (int j = 0; j < sortedColumns.size(); j++) {
                Column column = sortedColumns.get(j);
                json.append("          {\n");
                json.append("            \"name\": \"").append(escapeJson(column.getName())).append("\",\n");
                json.append("            \"dataType\": \"").append(column.getDataType() != null ? column.getDataType().getSqlName() : "").append("\",\n");
                json.append("            \"maxLength\": ").append(column.getMaxLength() != null ? column.getMaxLength() : "null").append(",\n");
                json.append("            \"precision\": ").append(column.getPrecision() != null ? column.getPrecision() : "null").append(",\n");
                json.append("            \"scale\": ").append(column.getScale() != null ? column.getScale() : "null").append(",\n");
                json.append("            \"nullable\": ").append(column.isNullable()).append(",\n");
                json.append("            \"primaryKey\": ").append(column.isPrimaryKey()).append(",\n");
                json.append("            \"identity\": ").append(column.isIdentity()).append(",\n");
                json.append("            \"defaultValue\": \"").append(escapeJson(column.getDefaultValue() != null ? column.getDefaultValue() : "")).append("\",\n");
                json.append("            \"description\": \"").append(escapeJson(column.getDescription() != null ? column.getDescription() : "")).append("\"\n");
                json.append("          }").append(j < sortedColumns.size() - 1 ? "," : "").append("\n");
            }
            
            json.append("        ],\n");
            json.append("        \"indexes\": [\n");
            
            for (int k = 0; k < table.getIndexes().size(); k++) {
                Index index = table.getIndexes().get(k);
                json.append("          {\n");
                json.append("            \"name\": \"").append(escapeJson(index.getName())).append("\",\n");
                json.append("            \"type\": \"").append(index.getType().getSqlName()).append("\",\n");
                json.append("            \"unique\": ").append(index.isUnique()).append(",\n");
                json.append("            \"columns\": [");
                
                for (int l = 0; l < index.getColumns().size(); l++) {
                    Index.IndexColumn indexColumn = index.getColumns().get(l);
                    Column column = findColumnById(table, indexColumn.getColumnId());
                    json.append("\"").append(column != null ? column.getName() : "unknown").append("\"");
                    if (l < index.getColumns().size() - 1) json.append(", ");
                }
                
                json.append("]\n");
                json.append("          }").append(k < table.getIndexes().size() - 1 ? "," : "").append("\n");
            }
            
            json.append("        ]\n");
            json.append("      }").append(i < project.getTables().size() - 1 ? "," : "").append("\n");
        }
        
        json.append("    ]\n");
        json.append("  }\n");
        json.append("}\n");
        
        return json.toString();
    }

    /**
     * CSV 테이블 목록 생성
     */
    private String generateCsvTableList(Project project, ValidationDomainService.SchemaValidationResult validationResult) {
        StringBuilder csv = new StringBuilder();
        
        // CSV 헤더
        csv.append("테이블명,설명,컬럼수,인덱스수,기본키컬럼,검증상태\n");
        
        // 각 테이블 정보
        for (Table table : project.getTables()) {
            csv.append("\"").append(escapeCsv(table.getName())).append("\",");
            csv.append("\"").append(escapeCsv(table.getDescription() != null ? table.getDescription() : "")).append("\",");
            csv.append(table.getColumns().size()).append(",");
            csv.append(table.getIndexes().size()).append(",");
            
            // 기본키 컬럼들
            String primaryKeys = table.getPrimaryKeyColumns().stream()
                    .map(Column::getName)
                    .collect(Collectors.joining("; "));
            csv.append("\"").append(escapeCsv(primaryKeys)).append("\",");
            
            // 검증 상태 (간단히)
            csv.append("\"").append(validationResult.canExportSchema() ? "정상" : "오류있음").append("\"\n");
        }
        
        return csv.toString();
    }

    /**
     * HTML 테이블 문서화
     */
    private void generateTableHtmlDocumentation(Table table, StringBuilder html) {
        html.append("    <h3 id=\"table-").append(table.getName().toLowerCase()).append("\">").append(table.getName());
        if (table.getDescription() != null && !table.getDescription().trim().isEmpty()) {
            html.append(" - ").append(table.getDescription());
        }
        html.append("</h3>\n");
        
        // 컬럼 정보
        html.append("    <h4>컬럼</h4>\n");
        html.append("    <table>\n");
        html.append("        <thead>\n");
        html.append("            <tr><th>컬럼명</th><th>데이터 타입</th><th>NULL 허용</th><th>기본키</th><th>자동증가</th><th>기본값</th><th>설명</th></tr>\n");
        html.append("        </thead>\n");
        html.append("        <tbody>\n");
        
        List<Column> sortedColumns = table.getColumns().stream()
                .sorted((c1, c2) -> Integer.compare(c1.getOrderIndex(), c2.getOrderIndex()))
                .collect(Collectors.toList());
        
        for (Column column : sortedColumns) {
            html.append("            <tr>\n");
            html.append("                <td>").append(column.getName()).append("</td>\n");
            html.append("                <td>").append(formatDataTypeForDoc(column)).append("</td>\n");
            html.append("                <td>").append(column.isNullable() ? "예" : "아니오").append("</td>\n");
            html.append("                <td>").append(column.isPrimaryKey() ? "예" : "아니오").append("</td>\n");
            html.append("                <td>").append(column.isIdentity() ? "예" : "아니오").append("</td>\n");
            html.append("                <td>").append(column.getDefaultValue() != null ? column.getDefaultValue() : "").append("</td>\n");
            html.append("                <td>").append(column.getDescription() != null ? column.getDescription() : "").append("</td>\n");
            html.append("            </tr>\n");
        }
        
        html.append("        </tbody>\n");
        html.append("    </table>\n");
        
        // 인덱스 정보
        if (!table.getIndexes().isEmpty()) {
            html.append("    <h4>인덱스</h4>\n");
            html.append("    <table>\n");
            html.append("        <thead>\n");
            html.append("            <tr><th>인덱스명</th><th>타입</th><th>유니크</th><th>컬럼</th></tr>\n");
            html.append("        </thead>\n");
            html.append("        <tbody>\n");
            
            for (Index index : table.getIndexes()) {
                html.append("            <tr>\n");
                html.append("                <td>").append(index.getName()).append("</td>\n");
                html.append("                <td>").append(index.getType().getSqlName()).append("</td>\n");
                html.append("                <td>").append(index.isUnique() ? "예" : "아니오").append("</td>\n");
                
                String columnList = index.getColumns().stream()
                        .map(indexColumn -> {
                            Column column = findColumnById(table, indexColumn.getColumnId());
                            return column != null ? column.getName() + " " + indexColumn.getOrder().getSqlName() : "알 수 없음";
                        })
                        .collect(Collectors.joining(", "));
                html.append("                <td>").append(columnList).append("</td>\n");
                html.append("            </tr>\n");
            }
            
            html.append("        </tbody>\n");
            html.append("    </table>\n");
        }
    }

    /**
     * HTML 이스케이프
     */
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#x27;");
    }

    /**
     * JSON 이스케이프
     */
    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }

    /**
     * CSV 이스케이프
     */
    private String escapeCsv(String text) {
        if (text == null) return "";
        return text.replace("\"", "\"\"");
    }

    /**
     * 테이블에서 컬럼 ID로 컬럼 찾기
     */
    private Column findColumnById(Table table, java.util.UUID columnId) {
        return table.getColumns().stream()
                .filter(column -> column.getId().equals(columnId))
                .findFirst()
                .orElse(null);
    }
}