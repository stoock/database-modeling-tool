package com.dbmodeling.application.service;

import com.dbmodeling.application.service.ExportService.ExportFormat;
import com.dbmodeling.application.service.ExportService.ExportResult;
import com.dbmodeling.application.service.ExportService.ValidationSummary;
import com.dbmodeling.domain.model.*;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.service.SchemaExportService;
import com.dbmodeling.domain.service.SqlGeneratorService;
import com.dbmodeling.domain.service.ValidationDomainService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("ExportService 테스트")
class ExportServiceTest {
    
    @Mock
    private ProjectRepository projectRepository;
    
    @Mock
    private SchemaExportService schemaExportService;
    
    @Mock
    private SqlGeneratorService sqlGeneratorService;
    
    @Mock
    private ValidationDomainService validationDomainService;
    
    @InjectMocks
    private ExportService exportService;
    
    private UUID projectId;
    private Project testProject;
    private ValidationDomainService.SchemaValidationResult validationResult;
    
    @BeforeEach
    void setUp() {
        projectId = UUID.randomUUID();
        testProject = new Project("Test Project", "테스트 프로젝트");
        testProject.setId(projectId);
        
        // 테스트 테이블 추가
        Table testTable = new Table("TestTable", "테스트 테이블");
        testTable.setId(UUID.randomUUID());
        testTable.setProjectId(projectId);
        
        Column testColumn = new Column("id", MSSQLDataType.BIGINT, 0);
        testColumn.setPrimaryKey(true);
        testTable.addColumn(testColumn);
        
        testProject.addTable(testTable);
        
        // 검증 결과 모킹
        validationResult = mock(ValidationDomainService.SchemaValidationResult.class);
        when(validationResult.canExportSchema()).thenReturn(true);
        when(validationResult.getTotalErrorCount()).thenReturn(0);
        when(validationResult.getTotalWarningCount()).thenReturn(0);
        when(validationResult.getStructuralErrors()).thenReturn(Collections.emptyList());
        when(validationResult.getDataTypeErrors()).thenReturn(Collections.emptyList());
    }
    
    @Test
    @DisplayName("프로젝트 SQL 내보내기 - 성공")
    void exportProject_SqlFormat_Success() {
        // Given
        String expectedSql = "CREATE TABLE [TestTable] (\n    [id] BIGINT NOT NULL\n);";
        SchemaExportService.ExportResult domainResult = new SchemaExportService.ExportResult(
            true, expectedSql, validationResult, SchemaExportService.ExportFormat.SQL_SCRIPT
        );
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(schemaExportService.exportSchema(eq(testProject), eq(SchemaExportService.ExportFormat.SQL_SCRIPT)))
            .thenReturn(domainResult);
        
        // When
        ExportResult result = exportService.exportProject(projectId, ExportFormat.SQL);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getContent()).isEqualTo(expectedSql);
        assertThat(result.getFormat()).isEqualTo(ExportFormat.SQL);
        
        verify(schemaExportService).exportSchema(testProject, SchemaExportService.ExportFormat.SQL_SCRIPT);
    }
    
    @Test
    @DisplayName("프로젝트 내보내기 - 프로젝트 없음")
    void exportProject_ProjectNotFound() {
        // Given
        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> exportService.exportProject(projectId, ExportFormat.SQL))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("프로젝트를 찾을 수 없습니다");
    }
    
    @Test
    @DisplayName("SQL 스크립트 생성 - 성공")
    void generateSqlScript_Success() {
        // Given
        String expectedSql = "CREATE TABLE [TestTable] (\n    [id] BIGINT NOT NULL\n);";
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(sqlGeneratorService.generateProjectSql(testProject)).thenReturn(expectedSql);
        
        // When
        String result = exportService.generateSqlScript(projectId);
        
        // Then
        assertThat(result).isEqualTo(expectedSql);
        verify(sqlGeneratorService).generateProjectSql(testProject);
    }
    
    @Test
    @DisplayName("검증 포함 SQL 스크립트 생성 - 성공")
    void generateSqlScriptWithValidation_Success() {
        // Given
        String expectedContent = "/* 검증 결과 */\nCREATE TABLE [TestTable] (\n    [id] BIGINT NOT NULL\n);";
        SchemaExportService.ExportResult domainResult = new SchemaExportService.ExportResult(
            true, expectedContent, validationResult, SchemaExportService.ExportFormat.SQL_WITH_VALIDATION
        );
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(schemaExportService.exportSchema(eq(testProject), eq(SchemaExportService.ExportFormat.SQL_WITH_VALIDATION)))
            .thenReturn(domainResult);
        
        // When
        String result = exportService.generateSqlScriptWithValidation(projectId);
        
        // Then
        assertThat(result).isEqualTo(expectedContent);
        verify(schemaExportService).exportSchema(testProject, SchemaExportService.ExportFormat.SQL_WITH_VALIDATION);
    }
    
    @Test
    @DisplayName("마크다운 문서 생성 - 성공")
    void generateDocumentation_Success() {
        // Given
        String expectedMarkdown = "# Test Project\n\n## 테이블 목록\n\n- TestTable";
        SchemaExportService.ExportResult domainResult = new SchemaExportService.ExportResult(
            true, expectedMarkdown, validationResult, SchemaExportService.ExportFormat.DOCUMENTATION
        );
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(schemaExportService.exportSchema(eq(testProject), eq(SchemaExportService.ExportFormat.DOCUMENTATION)))
            .thenReturn(domainResult);
        
        // When
        String result = exportService.generateDocumentation(projectId);
        
        // Then
        assertThat(result).isEqualTo(expectedMarkdown);
        verify(schemaExportService).exportSchema(testProject, SchemaExportService.ExportFormat.DOCUMENTATION);
    }
    
    @Test
    @DisplayName("HTML 문서 생성 - 성공")
    void generateHtmlDocumentation_Success() {
        // Given
        String expectedHtml = "<html><head><title>Test Project</title></head><body><h1>Test Project</h1></body></html>";
        SchemaExportService.ExportResult domainResult = new SchemaExportService.ExportResult(
            true, expectedHtml, validationResult, SchemaExportService.ExportFormat.HTML_DOCUMENTATION
        );
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(schemaExportService.exportSchema(eq(testProject), eq(SchemaExportService.ExportFormat.HTML_DOCUMENTATION)))
            .thenReturn(domainResult);
        
        // When
        String result = exportService.generateHtmlDocumentation(projectId);
        
        // Then
        assertThat(result).isEqualTo(expectedHtml);
        verify(schemaExportService).exportSchema(testProject, SchemaExportService.ExportFormat.HTML_DOCUMENTATION);
    }
    
    @Test
    @DisplayName("JSON 스키마 생성 - 성공")
    void generateJsonSchema_Success() {
        // Given
        String expectedJson = "{\"project\":{\"name\":\"Test Project\",\"tables\":[]}}";
        SchemaExportService.ExportResult domainResult = new SchemaExportService.ExportResult(
            true, expectedJson, validationResult, SchemaExportService.ExportFormat.JSON_SCHEMA
        );
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(schemaExportService.exportSchema(eq(testProject), eq(SchemaExportService.ExportFormat.JSON_SCHEMA)))
            .thenReturn(domainResult);
        
        // When
        String result = exportService.generateJsonSchema(projectId);
        
        // Then
        assertThat(result).isEqualTo(expectedJson);
        verify(schemaExportService).exportSchema(testProject, SchemaExportService.ExportFormat.JSON_SCHEMA);
    }
    
    @Test
    @DisplayName("CSV 테이블 목록 생성 - 성공")
    void generateCsvTableList_Success() {
        // Given
        String expectedCsv = "테이블명,설명,컬럼수,인덱스수\nTestTable,테스트 테이블,1,0";
        SchemaExportService.ExportResult domainResult = new SchemaExportService.ExportResult(
            true, expectedCsv, validationResult, SchemaExportService.ExportFormat.CSV_TABLE_LIST
        );
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(schemaExportService.exportSchema(eq(testProject), eq(SchemaExportService.ExportFormat.CSV_TABLE_LIST)))
            .thenReturn(domainResult);
        
        // When
        String result = exportService.generateCsvTableList(projectId);
        
        // Then
        assertThat(result).isEqualTo(expectedCsv);
        verify(schemaExportService).exportSchema(testProject, SchemaExportService.ExportFormat.CSV_TABLE_LIST);
    }
    
    @Test
    @DisplayName("내보내기 검증 - 성공")
    void validateForExport_Success() {
        // Given
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(validationDomainService.validateForSchemaExport(testProject)).thenReturn(validationResult);
        
        // When
        ValidationSummary result = exportService.validateForExport(projectId);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.canExport()).isTrue();
        assertThat(result.getErrorCount()).isEqualTo(0);
        assertThat(result.getWarningCount()).isEqualTo(0);
        assertThat(result.hasIssues()).isFalse();
        
        verify(validationDomainService).validateForSchemaExport(testProject);
    }
    
    @Test
    @DisplayName("내보내기 검증 - 오류 있음")
    void validateForExport_WithErrors() {
        // Given
        when(validationResult.canExportSchema()).thenReturn(false);
        when(validationResult.getTotalErrorCount()).thenReturn(2);
        when(validationResult.getTotalWarningCount()).thenReturn(1);
        when(validationResult.getStructuralErrors()).thenReturn(Arrays.asList("구조적 오류 1", "구조적 오류 2"));
        when(validationResult.getDataTypeErrors()).thenReturn(Arrays.asList("데이터 타입 오류"));
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(testProject));
        when(validationDomainService.validateForSchemaExport(testProject)).thenReturn(validationResult);
        
        // When
        ValidationSummary result = exportService.validateForExport(projectId);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.canExport()).isFalse();
        assertThat(result.getErrorCount()).isEqualTo(2);
        assertThat(result.getWarningCount()).isEqualTo(1);
        assertThat(result.hasIssues()).isTrue();
        assertThat(result.getStructuralErrors()).hasSize(2);
        assertThat(result.getDataTypeErrors()).hasSize(1);
    }
    
    @Test
    @DisplayName("ExportResult 파일명 생성")
    void exportResult_GenerateFileName() {
        // Given
        ExportResult result = new ExportResult(true, "content", ExportFormat.SQL, validationResult);
        
        // When
        String fileName = result.generateFileName("My Test Project!");
        
        // Then
        assertThat(fileName).isEqualTo("My_Test_Project__schema.sql");
    }
    
    @Test
    @DisplayName("ExportFormat 속성 확인")
    void exportFormat_Properties() {
        // Given & When & Then
        assertThat(ExportFormat.SQL.getDisplayName()).isEqualTo("SQL 스크립트");
        assertThat(ExportFormat.SQL.getFileExtension()).isEqualTo(".sql");
        assertThat(ExportFormat.SQL.getMimeType()).isEqualTo("application/sql");
        
        assertThat(ExportFormat.MARKDOWN.getDisplayName()).isEqualTo("마크다운 문서");
        assertThat(ExportFormat.MARKDOWN.getFileExtension()).isEqualTo(".md");
        assertThat(ExportFormat.MARKDOWN.getMimeType()).isEqualTo("text/markdown");
        
        assertThat(ExportFormat.HTML.getDisplayName()).isEqualTo("HTML 문서");
        assertThat(ExportFormat.HTML.getFileExtension()).isEqualTo(".html");
        assertThat(ExportFormat.HTML.getMimeType()).isEqualTo("text/html");
        
        assertThat(ExportFormat.JSON.getDisplayName()).isEqualTo("JSON 스키마");
        assertThat(ExportFormat.JSON.getFileExtension()).isEqualTo(".json");
        assertThat(ExportFormat.JSON.getMimeType()).isEqualTo("application/json");
        
        assertThat(ExportFormat.CSV.getDisplayName()).isEqualTo("CSV 테이블 목록");
        assertThat(ExportFormat.CSV.getFileExtension()).isEqualTo(".csv");
        assertThat(ExportFormat.CSV.getMimeType()).isEqualTo("text/csv");
    }
}