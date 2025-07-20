package com.dbmodeling.domain.service;

import com.dbmodeling.domain.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ValidationDomainService 테스트
 */
class ValidationDomainServiceTest {

    private ValidationDomainService validationService;
    private NamingRules namingRules;

    @BeforeEach
    void setUp() {
        validationService = new ValidationDomainService();
        namingRules = new NamingRules();
        namingRules.setTablePrefix("TB_");
        namingRules.setEnforceCase(NamingRules.CaseType.UPPER);
        namingRules.setColumnPattern("^[a-z][a-z0-9_]*$");
        namingRules.setIndexPattern("^IX_[A-Z][a-zA-Z0-9_]*$");
    }

    @Test
    void 프로젝트_전체_검증_성공_테스트() {
        // Given
        Project project = new Project("테스트 프로젝트", "설명");
        
        // 매우 관대한 네이밍 규칙 설정 (케이스 검증 없음)
        NamingRules relaxedRules = new NamingRules();
        relaxedRules.setEnforceCase(null); // 케이스 검증 비활성화
        
        project.setNamingRules(relaxedRules);

        Table table = new Table("TB_USER", "사용자 테이블");
        Column column = new Column("user_id", MSSQLDataType.BIGINT, 1);
        Index index = new Index("IX_User_Email", Index.IndexType.NONCLUSTERED, true);

        table.addColumn(column);
        table.addIndex(index);
        project.addTable(table);

        // When
        ValidationDomainService.ValidationResult result = validationService.validateProject(project);

        // Then
        if (!result.isValid()) {
            System.out.println("Validation errors:");
            for (ValidationDomainService.ValidationError error : result.getErrors()) {
                System.out.println("- " + error.getMessage());
            }
        }
        assertTrue(result.isValid());
        assertFalse(result.hasErrors());
    }

    @Test
    void 프로젝트_네이밍_규칙_없음_테스트() {
        // Given
        Project project = new Project("테스트 프로젝트", "설명");
        project.setNamingRules(null);

        // When
        ValidationDomainService.ValidationResult result = validationService.validateProject(project);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertEquals(1, result.getErrors().size());
        assertTrue(result.getErrors().get(0).getMessage().contains("네이밍 규칙이 설정되지 않았습니다"));
    }

    @Test
    void 테이블명_검증_실패_테스트() {
        // Given
        Table table = new Table("user", "사용자 테이블"); // 소문자, 접두사 없음

        // When
        ValidationDomainService.ValidationResult result = validationService.validateTable(table, namingRules);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertEquals(1, result.getErrors().size());
        
        ValidationDomainService.ValidationError error = result.getErrors().get(0);
        assertTrue(error.getMessage().contains("테이블명"));
        assertTrue(error.getMessage().contains("네이밍 규칙을 위반"));
        assertEquals("table", error.getField());
        assertEquals("user", error.getActual());
        assertNotNull(error.getSuggestion());
    }

    @Test
    void 컬럼명_검증_실패_테스트() {
        // Given
        Column column = new Column("UserId", MSSQLDataType.BIGINT, 1); // PascalCase

        // When
        ValidationDomainService.ValidationResult result = validationService.validateColumn(column, namingRules);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertEquals(1, result.getErrors().size());
        
        ValidationDomainService.ValidationError error = result.getErrors().get(0);
        assertTrue(error.getMessage().contains("컬럼명"));
        assertTrue(error.getMessage().contains("네이밍 규칙을 위반"));
        assertEquals("column", error.getField());
        assertEquals("UserId", error.getActual());
        assertNotNull(error.getSuggestion());
    }

    @Test
    void 인덱스명_검증_실패_테스트() {
        // Given
        Index index = new Index("user_email_idx", Index.IndexType.NONCLUSTERED, true);

        // When
        ValidationDomainService.ValidationResult result = validationService.validateIndex(index, namingRules);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertEquals(1, result.getErrors().size());
        
        ValidationDomainService.ValidationError error = result.getErrors().get(0);
        assertTrue(error.getMessage().contains("인덱스명"));
        assertTrue(error.getMessage().contains("네이밍 규칙을 위반"));
        assertEquals("index", error.getField());
        assertEquals("user_email_idx", error.getActual());
        assertNotNull(error.getSuggestion());
    }

    @Test
    void 실시간_테이블명_검증_성공_테스트() {
        // Given
        String tableName = "TB_USER";

        // When
        ValidationDomainService.ValidationResult result = validationService.validateName(tableName, "table", namingRules);

        // Then
        assertTrue(result.isValid());
        assertFalse(result.hasErrors());
    }

    @Test
    void 실시간_컬럼명_검증_실패_테스트() {
        // Given
        String columnName = "UserName";

        // When
        ValidationDomainService.ValidationResult result = validationService.validateName(columnName, "column", namingRules);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertEquals(1, result.getErrors().size());
        
        ValidationDomainService.ValidationError error = result.getErrors().get(0);
        assertTrue(error.getMessage().contains("column명"));
        assertEquals("column", error.getField());
        assertEquals("UserName", error.getActual());
        assertNotNull(error.getSuggestion());
    }

    @Test
    void 알려지지_않은_타입_검증_실패_테스트() {
        // Given
        String name = "test";
        String unknownType = "unknown";

        // When
        ValidationDomainService.ValidationResult result = validationService.validateName(name, unknownType, namingRules);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertEquals(1, result.getErrors().size());
    }

    @Test
    void 검증_결과_병합_테스트() {
        // Given
        ValidationDomainService.ValidationResult result1 = new ValidationDomainService.ValidationResult();
        ValidationDomainService.ValidationResult result2 = new ValidationDomainService.ValidationResult();
        
        result1.addError("첫 번째 오류", "field1", "actual1", "suggestion1");
        result1.addWarning("첫 번째 경고", "field1");
        
        result2.addError("두 번째 오류", "field2", "actual2", "suggestion2");
        result2.addWarning("두 번째 경고", "field2");

        // When
        result1.merge(result2);

        // Then
        assertEquals(2, result1.getErrors().size());
        assertEquals(2, result1.getWarnings().size());
        assertTrue(result1.hasErrors());
        assertTrue(result1.hasWarnings());
        assertFalse(result1.isValid());
    }

    @Test
    void 복합_테이블_검증_테스트() {
        // Given
        Table table = new Table("user", "사용자 테이블"); // 잘못된 테이블명
        
        Column validColumn = new Column("user_id", MSSQLDataType.BIGINT, 1);
        Column invalidColumn = new Column("UserName", MSSQLDataType.NVARCHAR, 2); // 잘못된 컬럼명
        
        Index validIndex = new Index("IX_User_Email", Index.IndexType.NONCLUSTERED, true);
        Index invalidIndex = new Index("user_name_idx", Index.IndexType.NONCLUSTERED, false); // 잘못된 인덱스명
        
        table.addColumn(validColumn);
        table.addColumn(invalidColumn);
        table.addIndex(validIndex);
        table.addIndex(invalidIndex);

        // When
        ValidationDomainService.ValidationResult result = validationService.validateTable(table, namingRules);

        // Then
        assertFalse(result.isValid());
        
        // 디버깅을 위해 오류 출력
        System.out.println("Total errors: " + result.getErrors().size());
        for (ValidationDomainService.ValidationError error : result.getErrors()) {
            System.out.println("- " + error.getMessage());
        }
        
        // 최소 3개의 오류가 있어야 함 (테이블명, 컬럼명, 인덱스명)
        assertTrue(result.getErrors().size() >= 3);
        
        // 오류 메시지 확인
        boolean hasTableError = result.getErrors().stream()
            .anyMatch(error -> error.getMessage().contains("테이블명"));
        boolean hasColumnError = result.getErrors().stream()
            .anyMatch(error -> error.getMessage().contains("컬럼명"));
        boolean hasIndexError = result.getErrors().stream()
            .anyMatch(error -> error.getMessage().contains("인덱스명"));
            
        assertTrue(hasTableError);
        assertTrue(hasColumnError);
        assertTrue(hasIndexError);
    }

    @Test
    void 빈_검증_결과_테스트() {
        // Given
        ValidationDomainService.ValidationResult result = new ValidationDomainService.ValidationResult();

        // When & Then
        assertTrue(result.isValid());
        assertFalse(result.hasErrors());
        assertFalse(result.hasWarnings());
        assertTrue(result.getErrors().isEmpty());
        assertTrue(result.getWarnings().isEmpty());
    }
}