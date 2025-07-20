package com.dbmodeling.domain.service;

import com.dbmodeling.domain.model.*;
import com.dbmodeling.infrastructure.external.mssql.MSSQLTypeMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

/**
 * SchemaExportService 단위 테스트
 */
class SchemaExportServiceTest {

    private SchemaExportService schemaExportService;
    private SqlGeneratorService sqlGeneratorService;
    private ValidationDomainService validationService;

    @BeforeEach
    void setUp() {
        MSSQLTypeMapper typeMapper = new MSSQLTypeMapper();
        sqlGeneratorService = new SqlGeneratorService(typeMapper);
        validationService = new ValidationDomainService();
        schemaExportService = new SchemaExportService(sqlGeneratorService, validationService);
    }

    @Test
    @DisplayName("정상적인 프로젝트의 SQL 스크립트 내보내기 테스트")
    void testExportValidProjectAsSqlScript() {
        // Given
        Project project = createValidProject();

        // When
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, SchemaExportService.ExportFormat.SQL_SCRIPT);

        // Then
        assertTrue(result.isSuccess());
        assertNotNull(result.getContent());
        assertTrue(result.getContent().contains("CREATE TABLE [User]"));
        assertTrue(result.getContent().contains("CREATE TABLE [Product]"));
        assertEquals(SchemaExportService.ExportFormat.SQL_SCRIPT, result.getFormat());
        
        System.out.println("SQL Script Export:");
        System.out.println(result.getContent());
    }

    @Test
    @DisplayName("검증 정보가 포함된 SQL 스크립트 내보내기 테스트")
    void testExportProjectAsSqlWithValidation() {
        // Given
        Project project = createValidProject();

        // When
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, SchemaExportService.ExportFormat.SQL_WITH_VALIDATION);

        // Then
        assertTrue(result.isSuccess());
        assertNotNull(result.getContent());
        assertTrue(result.getContent().contains("=== 스키마 검증 결과 ==="));
        assertTrue(result.getContent().contains("CREATE TABLE [User]"));
        
        System.out.println("SQL with Validation Export:");
        System.out.println(result.getContent());
    }

    @Test
    @DisplayName("마크다운 문서 형식 내보내기 테스트")
    void testExportProjectAsDocumentation() {
        // Given
        Project project = createValidProject();

        // When
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, SchemaExportService.ExportFormat.DOCUMENTATION);

        // Then
        assertTrue(result.isSuccess());
        assertNotNull(result.getContent());
        assertTrue(result.getContent().contains("# TestProject 데이터베이스 스키마"));
        assertTrue(result.getContent().contains("## 테이블 목록"));
        assertTrue(result.getContent().contains("### User"));
        assertTrue(result.getContent().contains("### Product"));
        assertTrue(result.getContent().contains("#### 컬럼"));
        assertTrue(result.getContent().contains("## SQL 스크립트"));
        
        System.out.println("Documentation Export:");
        System.out.println(result.getContent());
    }

    @Test
    @DisplayName("오류가 있는 프로젝트의 내보내기 테스트")
    void testExportInvalidProject() {
        // Given
        Project project = createInvalidProject();

        // When
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, SchemaExportService.ExportFormat.SQL_SCRIPT);

        // Then
        assertFalse(result.isSuccess());
        assertNotNull(result.getContent());
        assertTrue(result.getContent().contains("-- 스키마 출력 실패"));
        assertTrue(result.getValidationResult().hasErrors());
        assertFalse(result.getValidationResult().canExportSchema());
        
        System.out.println("Invalid Project Export:");
        System.out.println(result.getContent());
    }

    @Test
    @DisplayName("경고가 있는 프로젝트의 검증 포함 내보내기 테스트")
    void testExportProjectWithWarnings() {
        // Given
        Project project = createProjectWithWarnings();

        // When
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, SchemaExportService.ExportFormat.SQL_WITH_VALIDATION);

        // Then
        assertTrue(result.isSuccess()); // 경고는 있지만 출력 가능
        assertNotNull(result.getContent());
        assertTrue(result.getContent().contains("=== 경고 목록 ==="));
        assertTrue(result.getValidationResult().hasWarnings());
        assertTrue(result.getValidationResult().canExportSchema());
        
        System.out.println("Project with Warnings Export:");
        System.out.println(result.getContent());
    }

    @Test
    @DisplayName("빈 프로젝트 내보내기 테스트")
    void testExportEmptyProject() {
        // Given
        Project project = new Project("EmptyProject", "빈 프로젝트");

        // When
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, SchemaExportService.ExportFormat.DOCUMENTATION);

        // Then
        assertFalse(result.isSuccess());
        assertTrue(result.getValidationResult().hasErrors());
        assertTrue(result.getValidationResult().getStructuralErrors().contains("프로젝트에 테이블이 하나도 정의되지 않았습니다."));
        
        System.out.println("Empty Project Export:");
        System.out.println(result.getContent());
    }

    @Test
    @DisplayName("복잡한 프로젝트의 문서화 내보내기 테스트")
    void testExportComplexProjectAsDocumentation() {
        // Given
        Project project = createComplexProject();

        // When
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, SchemaExportService.ExportFormat.DOCUMENTATION);

        // Then
        // 네이밍 규칙 오류가 있어도 구조적/데이터타입 오류가 없으면 출력 가능
        assertTrue(result.getValidationResult().canExportSchema());
        assertNotNull(result.getContent());
        assertTrue(result.getContent().contains("DECIMAL(18,2)"));
        assertTrue(result.getContent().contains("IDENTITY"));
        
        System.out.println("Complex Project Documentation:");
        System.out.println(result.getContent());
        System.out.println("Validation Result - Can Export: " + result.getValidationResult().canExportSchema());
        System.out.println("Total Errors: " + result.getValidationResult().getTotalErrorCount());
        System.out.println("Structural Errors: " + result.getValidationResult().getStructuralErrors().size());
        System.out.println("Data Type Errors: " + result.getValidationResult().getDataTypeErrors().size());
    }

    /**
     * 정상적인 프로젝트 생성
     */
    private Project createValidProject() {
        Project project = new Project("TestProject", "테스트 프로젝트");
        
        // User 테이블
        Table userTable = new Table("User", "사용자 테이블");
        
        Column userIdColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        userIdColumn.setPrimaryKey(true);
        userIdColumn.setIdentityProperties(true, 1, 1);
        userIdColumn.setNullableWithValidation(false);
        
        Column userNameColumn = new Column("name", MSSQLDataType.NVARCHAR, 2);
        userNameColumn.setMaxLength(100);
        userNameColumn.setNullableWithValidation(false);
        userNameColumn.setDescription("사용자 이름");
        
        Column userEmailColumn = new Column("email", MSSQLDataType.NVARCHAR, 3);
        userEmailColumn.setMaxLength(255);
        userEmailColumn.setDescription("사용자 이메일");
        
        userTable.addColumn(userIdColumn);
        userTable.addColumn(userNameColumn);
        userTable.addColumn(userEmailColumn);
        
        Index emailIndex = new Index("IX_User_Email", Index.IndexType.NONCLUSTERED, true);
        emailIndex.addColumn(userEmailColumn.getId(), Index.SortOrder.ASC);
        userTable.addIndex(emailIndex);
        
        // Product 테이블
        Table productTable = new Table("Product", "상품 테이블");
        
        Column productIdColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        productIdColumn.setPrimaryKey(true);
        productIdColumn.setIdentityProperties(true, 1, 1);
        productIdColumn.setNullableWithValidation(false);
        
        Column productNameColumn = new Column("name", MSSQLDataType.NVARCHAR, 2);
        productNameColumn.setMaxLength(200);
        productNameColumn.setNullableWithValidation(false);
        productNameColumn.setDescription("상품명");
        
        productTable.addColumn(productIdColumn);
        productTable.addColumn(productNameColumn);
        
        project.addTable(userTable);
        project.addTable(productTable);
        
        return project;
    }

    /**
     * 오류가 있는 프로젝트 생성
     */
    private Project createInvalidProject() {
        Project project = new Project("InvalidProject", "오류가 있는 프로젝트");
        
        // 컬럼이 없는 테이블
        Table emptyTable = new Table("EmptyTable", "빈 테이블");
        project.addTable(emptyTable);
        
        // 데이터 타입이 없는 컬럼이 있는 테이블
        Table invalidTable = new Table("InvalidTable", "잘못된 테이블");
        Column invalidColumn = new Column("invalid_column", null, 1); // 데이터 타입 없음
        invalidTable.addColumn(invalidColumn);
        project.addTable(invalidTable);
        
        return project;
    }

    /**
     * 경고가 있는 프로젝트 생성
     */
    private Project createProjectWithWarnings() {
        Project project = new Project("ProjectWithWarnings", "경고가 있는 프로젝트");
        
        // 기본키가 없는 테이블 (경고)
        Table tableWithoutPK = new Table("TableWithoutPK", "기본키가 없는 테이블");
        
        Column nameColumn = new Column("name", MSSQLDataType.NVARCHAR, 1);
        nameColumn.setMaxLength(100);
        nameColumn.setNullableWithValidation(false);
        
        tableWithoutPK.addColumn(nameColumn);
        project.addTable(tableWithoutPK);
        
        return project;
    }

    /**
     * 복잡한 프로젝트 생성
     */
    private Project createComplexProject() {
        Project project = new Project("ComplexProject", "복잡한 프로젝트");
        
        Table orderTable = new Table("Order", "주문 테이블");
        
        Column orderIdColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        orderIdColumn.setPrimaryKey(true);
        orderIdColumn.setIdentityProperties(true, 1, 1);
        orderIdColumn.setNullableWithValidation(false);
        
        Column userIdColumn = new Column("user_id", MSSQLDataType.BIGINT, 2);
        userIdColumn.setNullableWithValidation(false);
        
        Column totalAmountColumn = new Column("total_amount", MSSQLDataType.DECIMAL, 3);
        totalAmountColumn.setPrecision(18);
        totalAmountColumn.setScale(2);
        totalAmountColumn.setDefaultValue("0.00");
        totalAmountColumn.setDescription("총 주문 금액");
        
        Column createdAtColumn = new Column("created_at", MSSQLDataType.DATETIME2, 4);
        createdAtColumn.setPrecision(7);
        createdAtColumn.setDefaultValue("GETDATE()");
        
        orderTable.addColumn(orderIdColumn);
        orderTable.addColumn(userIdColumn);
        orderTable.addColumn(totalAmountColumn);
        orderTable.addColumn(createdAtColumn);
        
        // 복합 인덱스
        Index compositeIndex = new Index("IX_Order_UserId_CreatedAt", Index.IndexType.NONCLUSTERED, false);
        compositeIndex.addColumn(userIdColumn.getId(), Index.SortOrder.ASC);
        compositeIndex.addColumn(createdAtColumn.getId(), Index.SortOrder.DESC);
        orderTable.addIndex(compositeIndex);
        
        project.addTable(orderTable);
        
        return project;
    }

    @Test
    @DisplayName("HTML 문서 형식 내보내기 테스트")
    void testExportProjectAsHtmlDocumentation() {
        // Given
        Project project = createValidProject();

        // When
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, SchemaExportService.ExportFormat.HTML_DOCUMENTATION);

        // Then
        assertTrue(result.isSuccess());
        assertNotNull(result.getContent());
        assertTrue(result.getContent().contains("<!DOCTYPE html>"));
        assertTrue(result.getContent().contains("<title>TestProject - 데이터베이스 스키마</title>"));
        assertTrue(result.getContent().contains("<h1>TestProject 데이터베이스 스키마</h1>"));
        assertTrue(result.getContent().contains("<h2>테이블 목록</h2>"));
        assertTrue(result.getContent().contains("<table>"));
        
        System.out.println("HTML Documentation Export:");
        System.out.println(result.getContent());
    }

    @Test
    @DisplayName("JSON 스키마 형식 내보내기 테스트")
    void testExportProjectAsJsonSchema() {
        // Given
        Project project = createValidProject();

        // When
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, SchemaExportService.ExportFormat.JSON_SCHEMA);

        // Then
        assertTrue(result.isSuccess());
        assertNotNull(result.getContent());
        assertTrue(result.getContent().contains("\"project\":"));
        assertTrue(result.getContent().contains("\"name\": \"TestProject\""));
        assertTrue(result.getContent().contains("\"tables\":"));
        assertTrue(result.getContent().contains("\"columns\":"));
        assertTrue(result.getContent().contains("\"indexes\":"));
        
        System.out.println("JSON Schema Export:");
        System.out.println(result.getContent());
    }

    @Test
    @DisplayName("CSV 테이블 목록 내보내기 테스트")
    void testExportProjectAsCsvTableList() {
        // Given
        Project project = createValidProject();

        // When
        SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, SchemaExportService.ExportFormat.CSV_TABLE_LIST);

        // Then
        assertTrue(result.isSuccess());
        assertNotNull(result.getContent());
        assertTrue(result.getContent().contains("테이블명,설명,컬럼수,인덱스수,기본키컬럼,검증상태"));
        assertTrue(result.getContent().contains("\"User\""));
        assertTrue(result.getContent().contains("\"Product\""));
        assertTrue(result.getContent().contains("\"정상\""));
        
        System.out.println("CSV Table List Export:");
        System.out.println(result.getContent());
    }

    @Test
    @DisplayName("모든 출력 형식 테스트")
    void testAllExportFormats() {
        // Given
        Project project = createValidProject();

        // When & Then
        for (SchemaExportService.ExportFormat format : SchemaExportService.ExportFormat.values()) {
            SchemaExportService.ExportResult result = schemaExportService.exportSchema(project, format);
            
            assertTrue(result.isSuccess(), "Format " + format + " should succeed");
            assertNotNull(result.getContent(), "Format " + format + " should have content");
            assertEquals(format, result.getFormat(), "Format should match");
            
            System.out.println("=== " + format.getDisplayName() + " ===");
            System.out.println("File Extension: " + format.getFileExtension());
            System.out.println("Content Length: " + result.getContent().length());
            System.out.println("Success: " + result.isSuccess());
            System.out.println();
        }
    }
}