package com.dbmodeling.domain.service;

import com.dbmodeling.domain.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ValidationDomainService의 스키마 검증 기능 테스트
 */
class ValidationDomainServiceSchemaTest {

    private ValidationDomainService validationService;

    @BeforeEach
    void setUp() {
        validationService = new ValidationDomainService();
    }

    @Test
    @DisplayName("정상적인 프로젝트 스키마 검증 테스트")
    void testValidateValidProjectForSchemaExport() {
        // Given
        Project project = createValidProject();

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        // 네이밍 규칙 오류는 있을 수 있지만, 구조적/데이터타입 오류가 없으면 출력 가능
        assertTrue(result.canExportSchema());
        assertEquals(0, result.getStructuralErrors().size());
        assertEquals(0, result.getDataTypeErrors().size());
        
        System.out.println("Valid Project Validation:");
        System.out.println("Total Errors: " + result.getTotalErrorCount());
        System.out.println("Total Warnings: " + result.getTotalWarningCount());
        System.out.println("Can Export: " + result.canExportSchema());
        System.out.println("Structural Errors: " + result.getStructuralErrors().size());
        System.out.println("Data Type Errors: " + result.getDataTypeErrors().size());
        System.out.println("Naming Errors: " + result.getNamingErrors().size());
    }

    @Test
    @DisplayName("빈 프로젝트 스키마 검증 테스트")
    void testValidateEmptyProjectForSchemaExport() {
        // Given
        Project project = new Project("EmptyProject", "빈 프로젝트");

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        assertTrue(result.hasErrors());
        assertFalse(result.canExportSchema());
        assertTrue(result.getStructuralErrors().contains("프로젝트에 테이블이 하나도 정의되지 않았습니다."));
        
        System.out.println("Empty Project Validation:");
        System.out.println("Structural Errors: " + result.getStructuralErrors());
    }

    @Test
    @DisplayName("중복 테이블명 검증 테스트")
    void testValidateDuplicateTableNames() {
        // Given
        Project project = new Project("DuplicateProject", "중복 테이블명 프로젝트");
        
        Table table1 = new Table("User", "첫 번째 사용자 테이블");
        Column column1 = new Column("id", MSSQLDataType.BIGINT, 1);
        column1.setPrimaryKey(true);
        table1.addColumn(column1);
        
        Table table2 = new Table("User", "두 번째 사용자 테이블"); // 중복된 이름
        Column column2 = new Column("id", MSSQLDataType.BIGINT, 1);
        column2.setPrimaryKey(true);
        table2.addColumn(column2);
        
        project.addTable(table1);
        project.addTable(table2);

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        assertTrue(result.hasErrors());
        assertFalse(result.canExportSchema());
        assertTrue(result.getStructuralErrors().stream()
                .anyMatch(error -> error.contains("중복된 테이블명이 있습니다: User")));
        
        System.out.println("Duplicate Table Names Validation:");
        System.out.println("Structural Errors: " + result.getStructuralErrors());
    }

    @Test
    @DisplayName("컬럼이 없는 테이블 검증 테스트")
    void testValidateTableWithoutColumns() {
        // Given
        Project project = new Project("NoColumnsProject", "컬럼이 없는 테이블 프로젝트");
        Table emptyTable = new Table("EmptyTable", "빈 테이블");
        project.addTable(emptyTable);

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        assertTrue(result.hasErrors());
        assertFalse(result.canExportSchema());
        assertTrue(result.getStructuralErrors().stream()
                .anyMatch(error -> error.contains("테이블 'EmptyTable'에 컬럼이 정의되지 않았습니다.")));
        
        System.out.println("Table Without Columns Validation:");
        System.out.println("Structural Errors: " + result.getStructuralErrors());
    }

    @Test
    @DisplayName("중복 컬럼명 검증 테스트")
    void testValidateDuplicateColumnNames() {
        // Given
        Project project = new Project("DuplicateColumnsProject", "중복 컬럼명 프로젝트");
        Table table = new Table("TestTable", "테스트 테이블");
        
        Column column1 = new Column("name", MSSQLDataType.NVARCHAR, 1);
        column1.setMaxLength(100);
        
        Column column2 = new Column("name", MSSQLDataType.NVARCHAR, 2); // 중복된 이름
        column2.setMaxLength(200);
        
        table.addColumn(column1);
        table.addColumn(column2);
        project.addTable(table);

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        assertTrue(result.hasErrors());
        assertFalse(result.canExportSchema());
        assertTrue(result.getStructuralErrors().stream()
                .anyMatch(error -> error.contains("테이블 'TestTable'에 중복된 컬럼명이 있습니다: name")));
        
        System.out.println("Duplicate Column Names Validation:");
        System.out.println("Structural Errors: " + result.getStructuralErrors());
    }

    @Test
    @DisplayName("기본키가 없는 테이블 검증 테스트")
    void testValidateTableWithoutPrimaryKey() {
        // Given
        Project project = new Project("NoPKProject", "기본키가 없는 테이블 프로젝트");
        Table table = new Table("TestTable", "테스트 테이블");
        
        Column column = new Column("name", MSSQLDataType.NVARCHAR, 1);
        column.setMaxLength(100);
        table.addColumn(column);
        project.addTable(table);

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        // 네이밍 규칙 오류는 있을 수 있지만, 구조적으로는 경고만 있음
        assertTrue(result.hasWarnings());
        assertTrue(result.canExportSchema());
        assertTrue(result.getStructuralWarnings().stream()
                .anyMatch(warning -> warning.contains("테이블 'TestTable'에 기본키가 정의되지 않았습니다.")));
        assertEquals(0, result.getStructuralErrors().size());
        assertEquals(0, result.getDataTypeErrors().size());
        
        System.out.println("Table Without Primary Key Validation:");
        System.out.println("Structural Warnings: " + result.getStructuralWarnings());
        System.out.println("Total Errors: " + result.getTotalErrorCount());
        System.out.println("Can Export: " + result.canExportSchema());
    }

    @Test
    @DisplayName("데이터 타입이 없는 컬럼 검증 테스트")
    void testValidateColumnWithoutDataType() {
        // Given
        Project project = new Project("NoDataTypeProject", "데이터 타입이 없는 컬럼 프로젝트");
        Table table = new Table("TestTable", "테스트 테이블");
        
        Column validColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        validColumn.setPrimaryKey(true);
        
        Column invalidColumn = new Column("invalid_column", null, 2); // 데이터 타입 없음
        
        table.addColumn(validColumn);
        table.addColumn(invalidColumn);
        project.addTable(table);

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        assertTrue(result.hasErrors());
        assertFalse(result.canExportSchema());
        assertTrue(result.getDataTypeErrors().stream()
                .anyMatch(error -> error.contains("테이블 'TestTable'의 컬럼 'invalid_column'에 데이터 타입이 설정되지 않았습니다.")));
        
        System.out.println("Column Without Data Type Validation:");
        System.out.println("Data Type Errors: " + result.getDataTypeErrors());
    }

    @Test
    @DisplayName("잘못된 데이터 타입 속성 검증 테스트")
    void testValidateInvalidDataTypeProperties() {
        // Given
        Project project = new Project("InvalidDataTypeProject", "잘못된 데이터 타입 프로젝트");
        Table table = new Table("TestTable", "테스트 테이블");
        
        // 길이가 필요한 NVARCHAR 타입인데 길이가 없음
        Column nvarcharColumn = new Column("name", MSSQLDataType.NVARCHAR, 1);
        // maxLength를 설정하지 않음
        
        // 정밀도가 필요한 DECIMAL 타입인데 정밀도가 없음
        Column decimalColumn = new Column("price", MSSQLDataType.DECIMAL, 2);
        // precision을 설정하지 않음
        
        table.addColumn(nvarcharColumn);
        table.addColumn(decimalColumn);
        project.addTable(table);

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        assertTrue(result.hasErrors());
        assertFalse(result.canExportSchema());
        assertTrue(result.getDataTypeErrors().stream()
                .anyMatch(error -> error.contains("NVARCHAR 타입은 길이 설정이 필요합니다.")));
        assertTrue(result.getDataTypeErrors().stream()
                .anyMatch(error -> error.contains("DECIMAL 타입은 정밀도 설정이 필요합니다.")));
        
        System.out.println("Invalid Data Type Properties Validation:");
        System.out.println("Data Type Errors: " + result.getDataTypeErrors());
    }

    @Test
    @DisplayName("IDENTITY 컬럼 검증 테스트")
    void testValidateIdentityColumn() {
        // Given
        Project project = new Project("IdentityProject", "IDENTITY 컬럼 프로젝트");
        Table table = new Table("TestTable", "테스트 테이블");
        
        // 올바른 IDENTITY 컬럼
        Column validIdentityColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        validIdentityColumn.setPrimaryKey(true);
        validIdentityColumn.setIdentityProperties(true, 1, 1);
        validIdentityColumn.setNullableWithValidation(false);
        
        // 잘못된 IDENTITY 컬럼 (NVARCHAR는 IDENTITY 지원 안함)
        Column invalidIdentityColumn = new Column("invalid_id", MSSQLDataType.NVARCHAR, 2);
        invalidIdentityColumn.setMaxLength(50);
        invalidIdentityColumn.setIdentity(true);
        
        table.addColumn(validIdentityColumn);
        table.addColumn(invalidIdentityColumn);
        project.addTable(table);

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        assertTrue(result.hasErrors());
        assertFalse(result.canExportSchema());
        assertTrue(result.getDataTypeErrors().stream()
                .anyMatch(error -> error.contains("NVARCHAR 타입은 IDENTITY를 지원하지 않습니다.")));
        
        System.out.println("Identity Column Validation:");
        System.out.println("Data Type Errors: " + result.getDataTypeErrors());
    }

    @Test
    @DisplayName("기본키 컬럼 검증 테스트")
    void testValidatePrimaryKeyColumn() {
        // Given
        Project project = new Project("PKProject", "기본키 컬럼 프로젝트");
        Table table = new Table("TestTable", "테스트 테이블");
        
        // NULL을 허용하는 기본키 컬럼 (오류)
        Column nullablePKColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        nullablePKColumn.setPrimaryKey(true);
        nullablePKColumn.setNullable(true); // 기본키인데 NULL 허용
        
        table.addColumn(nullablePKColumn);
        project.addTable(table);

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        assertTrue(result.hasErrors());
        assertFalse(result.canExportSchema());
        assertTrue(result.getDataTypeErrors().stream()
                .anyMatch(error -> error.contains("기본키 컬럼은 NOT NULL이어야 합니다.")));
        
        System.out.println("Primary Key Column Validation:");
        System.out.println("Data Type Errors: " + result.getDataTypeErrors());
    }

    @Test
    @DisplayName("인덱스 검증 테스트")
    void testValidateIndex() {
        // Given
        Project project = new Project("IndexProject", "인덱스 프로젝트");
        Table table = new Table("TestTable", "테스트 테이블");
        
        Column idColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        idColumn.setPrimaryKey(true);
        idColumn.setNullableWithValidation(false);
        
        Column nameColumn = new Column("name", MSSQLDataType.NVARCHAR, 2);
        nameColumn.setMaxLength(100);
        
        table.addColumn(idColumn);
        table.addColumn(nameColumn);
        
        // 컬럼이 없는 인덱스
        Index emptyIndex = new Index("IX_Empty", Index.IndexType.NONCLUSTERED, false);
        // 컬럼을 추가하지 않음
        
        // 존재하지 않는 컬럼을 참조하는 인덱스
        Index invalidIndex = new Index("IX_Invalid", Index.IndexType.NONCLUSTERED, false);
        invalidIndex.addColumn(java.util.UUID.randomUUID(), Index.SortOrder.ASC); // 존재하지 않는 컬럼 ID
        
        table.addIndex(emptyIndex);
        table.addIndex(invalidIndex);
        project.addTable(table);

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        assertTrue(result.hasErrors());
        assertFalse(result.canExportSchema());
        assertTrue(result.getStructuralErrors().stream()
                .anyMatch(error -> error.contains("인덱스 'IX_Empty'에 컬럼이 정의되지 않았습니다.")));
        assertTrue(result.getStructuralErrors().stream()
                .anyMatch(error -> error.contains("인덱스 'IX_Invalid'에 존재하지 않는 컬럼이 참조되었습니다.")));
        
        System.out.println("Index Validation:");
        System.out.println("Structural Errors: " + result.getStructuralErrors());
    }

    @Test
    @DisplayName("클러스터드 인덱스 중복 검증 테스트")
    void testValidateClusteredIndexDuplication() {
        // Given
        Project project = new Project("ClusteredProject", "클러스터드 인덱스 프로젝트");
        Table table = new Table("TestTable", "테스트 테이블");
        
        Column idColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        idColumn.setPrimaryKey(true); // 기본키는 자동으로 클러스터드 인덱스
        idColumn.setNullableWithValidation(false);
        
        Column nameColumn = new Column("name", MSSQLDataType.NVARCHAR, 2);
        nameColumn.setMaxLength(100);
        
        table.addColumn(idColumn);
        table.addColumn(nameColumn);
        
        // 추가 클러스터드 인덱스 (경고)
        Index clusteredIndex = new Index("IX_Clustered", Index.IndexType.CLUSTERED, false);
        clusteredIndex.addColumn(nameColumn.getId(), Index.SortOrder.ASC);
        
        table.addIndex(clusteredIndex);
        project.addTable(table);

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);

        // Then
        // 네이밍 규칙 오류는 있을 수 있지만, 구조적으로는 경고만 있음
        assertTrue(result.hasWarnings());
        assertTrue(result.canExportSchema());
        assertTrue(result.getStructuralWarnings().stream()
                .anyMatch(warning -> warning.contains("기본키와 별도의 클러스터드 인덱스 'IX_Clustered'가 정의되었습니다.")));
        assertEquals(0, result.getStructuralErrors().size());
        assertEquals(0, result.getDataTypeErrors().size());
        
        System.out.println("Clustered Index Duplication Validation:");
        System.out.println("Structural Warnings: " + result.getStructuralWarnings());
        System.out.println("Total Errors: " + result.getTotalErrorCount());
        System.out.println("Can Export: " + result.canExportSchema());
    }

    /**
     * 정상적인 프로젝트 생성
     */
    private Project createValidProject() {
        Project project = new Project("ValidProject", "정상적인 프로젝트");
        
        Table table = new Table("User", "사용자 테이블");
        
        Column idColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        idColumn.setPrimaryKey(true);
        idColumn.setIdentityProperties(true, 1, 1);
        idColumn.setNullableWithValidation(false);
        
        Column nameColumn = new Column("name", MSSQLDataType.NVARCHAR, 2);
        nameColumn.setMaxLength(100);
        nameColumn.setNullableWithValidation(false);
        
        Column emailColumn = new Column("email", MSSQLDataType.NVARCHAR, 3);
        emailColumn.setMaxLength(255);
        
        table.addColumn(idColumn);
        table.addColumn(nameColumn);
        table.addColumn(emailColumn);
        
        Index emailIndex = new Index("IX_User_Email", Index.IndexType.NONCLUSTERED, true);
        emailIndex.addColumn(emailColumn.getId(), Index.SortOrder.ASC);
        table.addIndex(emailIndex);
        
        project.addTable(table);
        
        return project;
    }

    @Test
    @DisplayName("고급 검증 - 성능 관련 검증 테스트")
    void testAdvancedValidationPerformance() {
        // Given
        Project project = new Project("PerformanceProject", "성능 테스트 프로젝트");
        
        // 인덱스가 없는 큰 테이블
        Table largeTableWithoutIndex = new Table("LargeTable", "인덱스가 없는 큰 테이블");
        for (int i = 1; i <= 10; i++) {
            Column column = new Column("column" + i, MSSQLDataType.NVARCHAR, i);
            column.setMaxLength(100);
            largeTableWithoutIndex.addColumn(column);
        }
        
        // 과도한 컬럼 수를 가진 테이블
        Table tableWithTooManyColumns = new Table("WideTable", "컬럼이 너무 많은 테이블");
        Column idColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        idColumn.setPrimaryKey(true);
        tableWithTooManyColumns.addColumn(idColumn);
        
        for (int i = 2; i <= 55; i++) { // 50개 초과
            Column column = new Column("col" + i, MSSQLDataType.NVARCHAR, i);
            column.setMaxLength(50);
            tableWithTooManyColumns.addColumn(column);
        }
        
        // 큰 문자열 컬럼을 가진 테이블
        Table tableWithLargeString = new Table("StringTable", "큰 문자열 테이블");
        Column largeStringColumn = new Column("large_text", MSSQLDataType.NVARCHAR, 1);
        largeStringColumn.setMaxLength(5000); // 4000 초과
        tableWithLargeString.addColumn(largeStringColumn);
        
        project.addTable(largeTableWithoutIndex);
        project.addTable(tableWithTooManyColumns);
        project.addTable(tableWithLargeString);

        // When
        ValidationDomainService.AdvancedValidationResult result = validationService.validateAdvanced(project);

        // Then
        assertTrue(result.hasAdvancedIssues());
        assertFalse(result.getPerformanceWarnings().isEmpty());
        
        assertTrue(result.getPerformanceWarnings().stream()
                .anyMatch(warning -> warning.contains("인덱스가 없습니다")));
        assertTrue(result.getPerformanceWarnings().stream()
                .anyMatch(warning -> warning.contains("컬럼 수가") && warning.contains("개로 과도합니다")));
        assertTrue(result.getPerformanceWarnings().stream()
                .anyMatch(warning -> warning.contains("길이가") && warning.contains("로 과도합니다")));
        
        System.out.println("Advanced Performance Validation:");
        System.out.println("Performance Warnings: " + result.getPerformanceWarnings().size());
        for (String warning : result.getPerformanceWarnings()) {
            System.out.println("- " + warning);
        }
    }

    @Test
    @DisplayName("고급 검증 - 모범 사례 검증 테스트")
    void testAdvancedValidationBestPractices() {
        // Given
        Project project = new Project("BestPracticeProject", "모범 사례 테스트 프로젝트");
        
        // 감사 컬럼이 없는 테이블
        Table tableWithoutAuditColumns = new Table("NoAuditTable", "감사 컬럼이 없는 테이블");
        Column nameColumn = new Column("name", MSSQLDataType.NVARCHAR, 1);
        nameColumn.setMaxLength(100);
        tableWithoutAuditColumns.addColumn(nameColumn);
        
        // 표준 ID가 없는 테이블
        Table tableWithoutStandardId = new Table("NoIdTable", "표준 ID가 없는 테이블");
        Column customIdColumn = new Column("custom_key", MSSQLDataType.BIGINT, 1);
        customIdColumn.setPrimaryKey(true);
        tableWithoutStandardId.addColumn(customIdColumn);
        
        // 외래키 명명 규칙을 위반하는 테이블
        Table tableWithBadForeignKey = new Table("BadFKTable", "잘못된 외래키 테이블");
        Column userIdColumn = new Column("user_id", MSSQLDataType.NVARCHAR, 1); // 외래키인데 문자열
        userIdColumn.setMaxLength(50);
        tableWithBadForeignKey.addColumn(userIdColumn);
        
        project.addTable(tableWithoutAuditColumns);
        project.addTable(tableWithoutStandardId);
        project.addTable(tableWithBadForeignKey);

        // When
        ValidationDomainService.AdvancedValidationResult result = validationService.validateAdvanced(project);

        // Then
        assertTrue(result.hasAdvancedIssues());
        assertFalse(result.getBestPracticeWarnings().isEmpty());
        
        assertTrue(result.getBestPracticeWarnings().stream()
                .anyMatch(warning -> warning.contains("생성일시 컬럼이 없습니다")));
        assertTrue(result.getBestPracticeWarnings().stream()
                .anyMatch(warning -> warning.contains("수정일시 컬럼이 없습니다")));
        assertTrue(result.getBestPracticeWarnings().stream()
                .anyMatch(warning -> warning.contains("표준 ID 기본키가 없습니다")));
        assertTrue(result.getBestPracticeWarnings().stream()
                .anyMatch(warning -> warning.contains("외래키로 보이는 컬럼") && warning.contains("정수형이 아닙니다")));
        
        System.out.println("Advanced Best Practice Validation:");
        System.out.println("Best Practice Warnings: " + result.getBestPracticeWarnings().size());
        for (String warning : result.getBestPracticeWarnings()) {
            System.out.println("- " + warning);
        }
    }

    @Test
    @DisplayName("고급 검증 - 보안 관련 검증 테스트")
    void testAdvancedValidationSecurity() {
        // Given
        Project project = new Project("SecurityProject", "보안 테스트 프로젝트");
        
        Table userTable = new Table("User", "사용자 테이블");
        
        // 잘못된 비밀번호 컬럼 (타입이 정수)
        Column badPasswordColumn = new Column("password", MSSQLDataType.INT, 1);
        
        // 길이가 부족한 비밀번호 컬럼
        Column shortPasswordColumn = new Column("pwd", MSSQLDataType.NVARCHAR, 2);
        shortPasswordColumn.setMaxLength(30); // 60보다 작음
        
        // NULL을 허용하는 개인정보 컬럼
        Column nullableEmailColumn = new Column("email", MSSQLDataType.NVARCHAR, 3);
        nullableEmailColumn.setMaxLength(255);
        nullableEmailColumn.setNullable(true);
        
        userTable.addColumn(badPasswordColumn);
        userTable.addColumn(shortPasswordColumn);
        userTable.addColumn(nullableEmailColumn);
        project.addTable(userTable);

        // When
        ValidationDomainService.AdvancedValidationResult result = validationService.validateAdvanced(project);

        // Then
        assertTrue(result.hasAdvancedIssues());
        assertFalse(result.getSecurityWarnings().isEmpty());
        assertFalse(result.getSecurityInfo().isEmpty());
        
        assertTrue(result.getSecurityWarnings().stream()
                .anyMatch(warning -> warning.contains("비밀번호 컬럼") && warning.contains("문자열이 아닙니다")));
        assertTrue(result.getSecurityWarnings().stream()
                .anyMatch(warning -> warning.contains("비밀번호 컬럼") && warning.contains("길이가") && warning.contains("부족할 수 있습니다")));
        assertTrue(result.getSecurityInfo().stream()
                .anyMatch(info -> info.contains("개인정보 컬럼") && info.contains("NULL을 허용합니다")));
        
        System.out.println("Advanced Security Validation:");
        System.out.println("Security Warnings: " + result.getSecurityWarnings().size());
        for (String warning : result.getSecurityWarnings()) {
            System.out.println("- " + warning);
        }
        System.out.println("Security Info: " + result.getSecurityInfo().size());
        for (String info : result.getSecurityInfo()) {
            System.out.println("- " + info);
        }
    }

    @Test
    @DisplayName("검증 결과 요약 생성 테스트")
    void testValidationResultSummary() {
        // Given
        Project project = createProjectWithMixedIssues();

        // When
        ValidationDomainService.SchemaValidationResult result = validationService.validateForSchemaExport(project);
        String summary = result.generateSummary();

        // Then
        assertNotNull(summary);
        assertTrue(summary.contains("검증 결과 요약:"));
        assertTrue(summary.contains("총 오류:"));
        assertTrue(summary.contains("총 경고:"));
        assertTrue(summary.contains("스키마 출력 가능:"));
        
        System.out.println("Validation Result Summary:");
        System.out.println(summary);
    }

    /**
     * 다양한 문제가 있는 프로젝트 생성
     */
    private Project createProjectWithMixedIssues() {
        Project project = new Project("MixedIssuesProject", "다양한 문제가 있는 프로젝트");
        
        // 정상적인 테이블
        Table validTable = new Table("ValidTable", "정상 테이블");
        Column validIdColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        validIdColumn.setPrimaryKey(true);
        validIdColumn.setNullableWithValidation(false);
        validTable.addColumn(validIdColumn);
        
        // 경고가 있는 테이블 (기본키 없음)
        Table warningTable = new Table("WarningTable", "경고 테이블");
        Column warningColumn = new Column("name", MSSQLDataType.NVARCHAR, 1);
        warningColumn.setMaxLength(100);
        warningTable.addColumn(warningColumn);
        
        project.addTable(validTable);
        project.addTable(warningTable);
        
        return project;
    }
}