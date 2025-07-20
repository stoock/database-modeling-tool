package com.dbmodeling.domain.service;

import com.dbmodeling.domain.model.*;
import com.dbmodeling.infrastructure.external.mssql.MSSQLTypeMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * SqlGeneratorService 단위 테스트
 */
class SqlGeneratorServiceTest {

    private SqlGeneratorService sqlGeneratorService;
    private MSSQLTypeMapper typeMapper;

    @BeforeEach
    void setUp() {
        typeMapper = new MSSQLTypeMapper();
        sqlGeneratorService = new SqlGeneratorService(typeMapper);
    }

    @Test
    @DisplayName("기본 테이블 CREATE 문 생성 테스트")
    void testGenerateCreateTableSql() {
        // Given
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
        emailColumn.setDescription("사용자 이메일");
        
        table.addColumn(idColumn);
        table.addColumn(nameColumn);
        table.addColumn(emailColumn);

        // When
        String sql = sqlGeneratorService.generateCreateTableSql(table);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("CREATE TABLE [User]"));
        assertTrue(sql.contains("[id] BIGINT IDENTITY(1,1) NOT NULL"));
        assertTrue(sql.contains("[name] NVARCHAR(100) NOT NULL"));
        assertTrue(sql.contains("[email] NVARCHAR(255) NULL -- 사용자 이메일"));
        assertTrue(sql.contains("CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED ([id] ASC)"));
        
        System.out.println("Generated SQL:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("복합 기본키 테이블 CREATE 문 생성 테스트")
    void testGenerateCreateTableSqlWithCompositePrimaryKey() {
        // Given
        Table table = new Table("OrderItem", "주문 상품 테이블");
        
        Column orderIdColumn = new Column("order_id", MSSQLDataType.BIGINT, 1);
        orderIdColumn.setPrimaryKey(true);
        orderIdColumn.setNullableWithValidation(false);
        
        Column productIdColumn = new Column("product_id", MSSQLDataType.BIGINT, 2);
        productIdColumn.setPrimaryKey(true);
        productIdColumn.setNullableWithValidation(false);
        
        Column quantityColumn = new Column("quantity", MSSQLDataType.INT, 3);
        quantityColumn.setDefaultValue("1");
        
        table.addColumn(orderIdColumn);
        table.addColumn(productIdColumn);
        table.addColumn(quantityColumn);

        // When
        String sql = sqlGeneratorService.generateCreateTableSql(table);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("CREATE TABLE [OrderItem]"));
        assertTrue(sql.contains("[order_id] BIGINT NOT NULL"));
        assertTrue(sql.contains("[product_id] BIGINT NOT NULL"));
        assertTrue(sql.contains("[quantity] INT NULL DEFAULT 1"));
        assertTrue(sql.contains("CONSTRAINT [PK_OrderItem] PRIMARY KEY CLUSTERED ([order_id] ASC, [product_id] ASC)"));
        
        System.out.println("Generated Composite PK SQL:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("DECIMAL 타입 컬럼 CREATE 문 생성 테스트")
    void testGenerateCreateTableSqlWithDecimalColumn() {
        // Given
        Table table = new Table("Product", "상품 테이블");
        
        Column idColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        idColumn.setPrimaryKey(true);
        idColumn.setIdentityProperties(true, 1, 1);
        idColumn.setNullableWithValidation(false);
        
        Column priceColumn = new Column("price", MSSQLDataType.DECIMAL, 2);
        priceColumn.setPrecision(18);
        priceColumn.setScale(2);
        priceColumn.setNullableWithValidation(false);
        priceColumn.setDefaultValue("0.00");
        
        table.addColumn(idColumn);
        table.addColumn(priceColumn);

        // When
        String sql = sqlGeneratorService.generateCreateTableSql(table);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("[price] DECIMAL(18,2) NOT NULL DEFAULT 0.00"));
        
        System.out.println("Generated Decimal SQL:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("인덱스 CREATE 문 생성 테스트")
    void testGenerateCreateIndexSql() {
        // Given
        Table table = new Table("User", "사용자 테이블");
        
        Column idColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        idColumn.setPrimaryKey(true);
        
        Column emailColumn = new Column("email", MSSQLDataType.NVARCHAR, 2);
        emailColumn.setMaxLength(255);
        
        table.addColumn(idColumn);
        table.addColumn(emailColumn);
        
        Index emailIndex = new Index("IX_User_Email", Index.IndexType.NONCLUSTERED, true);
        emailIndex.addColumn(emailColumn.getId(), Index.SortOrder.ASC);
        table.addIndex(emailIndex);

        // When
        String sql = sqlGeneratorService.generateCreateIndexSql(table, emailIndex);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("CREATE UNIQUE NONCLUSTERED INDEX [IX_User_Email]"));
        assertTrue(sql.contains("ON [User]"));
        assertTrue(sql.contains("[email] ASC"));
        
        System.out.println("Generated Index SQL:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("복합 인덱스 CREATE 문 생성 테스트")
    void testGenerateCreateCompositeIndexSql() {
        // Given
        Table table = new Table("Order", "주문 테이블");
        
        Column idColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        Column userIdColumn = new Column("user_id", MSSQLDataType.BIGINT, 2);
        Column createdAtColumn = new Column("created_at", MSSQLDataType.DATETIME2, 3);
        
        table.addColumn(idColumn);
        table.addColumn(userIdColumn);
        table.addColumn(createdAtColumn);
        
        Index compositeIndex = new Index("IX_Order_UserId_CreatedAt", Index.IndexType.NONCLUSTERED, false);
        compositeIndex.addColumn(userIdColumn.getId(), Index.SortOrder.ASC);
        compositeIndex.addColumn(createdAtColumn.getId(), Index.SortOrder.DESC);
        table.addIndex(compositeIndex);

        // When
        String sql = sqlGeneratorService.generateCreateIndexSql(table, compositeIndex);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("CREATE NONCLUSTERED INDEX [IX_Order_UserId_CreatedAt]"));
        assertTrue(sql.contains("ON [Order]"));
        assertTrue(sql.contains("[user_id] ASC, [created_at] DESC"));
        
        System.out.println("Generated Composite Index SQL:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("프로젝트 전체 SQL 생성 테스트")
    void testGenerateProjectSql() {
        // Given
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
        
        userTable.addColumn(userIdColumn);
        userTable.addColumn(userNameColumn);
        
        Index userNameIndex = new Index("IX_User_Name", Index.IndexType.NONCLUSTERED, false);
        userNameIndex.addColumn(userNameColumn.getId(), Index.SortOrder.ASC);
        userTable.addIndex(userNameIndex);
        
        // Product 테이블
        Table productTable = new Table("Product", "상품 테이블");
        Column productIdColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        productIdColumn.setPrimaryKey(true);
        productIdColumn.setIdentityProperties(true, 1, 1);
        productIdColumn.setNullableWithValidation(false);
        
        Column productNameColumn = new Column("name", MSSQLDataType.NVARCHAR, 2);
        productNameColumn.setMaxLength(200);
        productNameColumn.setNullableWithValidation(false);
        
        productTable.addColumn(productIdColumn);
        productTable.addColumn(productNameColumn);
        
        project.addTable(userTable);
        project.addTable(productTable);

        // When
        String sql = sqlGeneratorService.generateProjectSql(project);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("-- TestProject 데이터베이스 스키마"));
        assertTrue(sql.contains("-- 설명: 테스트 프로젝트"));
        assertTrue(sql.contains("CREATE TABLE [User]"));
        assertTrue(sql.contains("CREATE TABLE [Product]"));
        assertTrue(sql.contains("CREATE NONCLUSTERED INDEX [IX_User_Name]"));
        
        System.out.println("Generated Project SQL:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("DROP 테이블 SQL 생성 테스트")
    void testGenerateDropTableSql() {
        // Given
        Table table = new Table("User", "사용자 테이블");
        
        Column idColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        Column nameColumn = new Column("name", MSSQLDataType.NVARCHAR, 2);
        nameColumn.setMaxLength(100);
        
        table.addColumn(idColumn);
        table.addColumn(nameColumn);
        
        Index nameIndex = new Index("IX_User_Name", Index.IndexType.NONCLUSTERED, false);
        nameIndex.addColumn(nameColumn.getId(), Index.SortOrder.ASC);
        table.addIndex(nameIndex);

        // When
        String sql = sqlGeneratorService.generateDropTableSql(table);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("DROP INDEX [IX_User_Name] ON [User]"));
        assertTrue(sql.contains("DROP TABLE [User]"));
        
        System.out.println("Generated Drop SQL:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("테이블 존재 여부 확인 SQL 생성 테스트")
    void testGenerateExistenceCheckSql() {
        // Given
        Table table = new Table("User", "사용자 테이블");
        
        Column idColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        idColumn.setPrimaryKey(true);
        idColumn.setIdentityProperties(true, 1, 1);
        idColumn.setNullableWithValidation(false);
        
        table.addColumn(idColumn);

        // When
        String sql = sqlGeneratorService.generateExistenceCheckSql(table);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[User]')"));
        assertTrue(sql.contains("BEGIN"));
        assertTrue(sql.contains("END"));
        assertTrue(sql.contains("CREATE TABLE [User]"));
        
        System.out.println("Generated Existence Check SQL:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("다양한 데이터 타입 테스트")
    void testGenerateCreateTableSqlWithVariousDataTypes() {
        // Given
        Table table = new Table("TestTable", "다양한 데이터 타입 테스트 테이블");
        
        // 각종 데이터 타입 컬럼 추가
        Column bigintColumn = new Column("bigint_col", MSSQLDataType.BIGINT, 1);
        bigintColumn.setPrimaryKey(true);
        bigintColumn.setIdentityProperties(true, 1, 1);
        bigintColumn.setNullableWithValidation(false);
        
        Column nvarcharColumn = new Column("nvarchar_col", MSSQLDataType.NVARCHAR, 2);
        nvarcharColumn.setMaxLength(255);
        
        Column decimalColumn = new Column("decimal_col", MSSQLDataType.DECIMAL, 3);
        decimalColumn.setPrecision(18);
        decimalColumn.setScale(2);
        
        Column datetime2Column = new Column("datetime2_col", MSSQLDataType.DATETIME2, 4);
        datetime2Column.setPrecision(7);
        
        Column bitColumn = new Column("bit_col", MSSQLDataType.BIT, 5);
        bitColumn.setDefaultValue("0");
        
        Column uniqueidentifierColumn = new Column("guid_col", MSSQLDataType.UNIQUEIDENTIFIER, 6);
        uniqueidentifierColumn.setDefaultValue("NEWID()");
        
        table.addColumn(bigintColumn);
        table.addColumn(nvarcharColumn);
        table.addColumn(decimalColumn);
        table.addColumn(datetime2Column);
        table.addColumn(bitColumn);
        table.addColumn(uniqueidentifierColumn);

        // When
        String sql = sqlGeneratorService.generateCreateTableSql(table);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("[bigint_col] BIGINT IDENTITY(1,1) NOT NULL"));
        assertTrue(sql.contains("[nvarchar_col] NVARCHAR(255) NULL"));
        assertTrue(sql.contains("[decimal_col] DECIMAL(18,2) NULL"));
        assertTrue(sql.contains("[datetime2_col] DATETIME2(7) NULL"));
        assertTrue(sql.contains("[bit_col] BIT NULL DEFAULT 0"));
        assertTrue(sql.contains("[guid_col] UNIQUEIDENTIFIER NULL DEFAULT NEWID()"));
        
        System.out.println("Generated Various Data Types SQL:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("스키마 생성 옵션을 사용한 프로젝트 SQL 생성 테스트")
    void testGenerateProjectSqlWithOptions() {
        // Given
        Project project = new Project("TestProject", "테스트 프로젝트");
        
        Table userTable = new Table("User", "사용자 테이블");
        Column userIdColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        userIdColumn.setPrimaryKey(true);
        userIdColumn.setIdentityProperties(true, 1, 1);
        userIdColumn.setNullableWithValidation(false);
        
        userTable.addColumn(userIdColumn);
        project.addTable(userTable);

        SchemaGenerationOptions options = new SchemaGenerationOptions();
        options.setIncludeDropStatements(true);
        options.setGenerateBatchScript(true);
        options.setSchemaName("TestSchema");

        // When
        String sql = sqlGeneratorService.generateProjectSql(project, options);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("SET NOCOUNT ON"));
        assertTrue(sql.contains("BEGIN TRANSACTION"));
        assertTrue(sql.contains("CREATE SCHEMA [TestSchema]"));
        assertTrue(sql.contains("DROP TABLE [User]"));
        assertTrue(sql.contains("COMMIT TRANSACTION"));
        
        System.out.println("Generated Project SQL with Options:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("제약조건 생성 테스트")
    void testGenerateConstraintsSql() {
        // Given
        Table table = new Table("TestTable", "제약조건 테스트 테이블");
        
        Column bitColumn = new Column("status", MSSQLDataType.BIT, 1);
        Column tinyintColumn = new Column("age", MSSQLDataType.TINYINT, 2);
        
        table.addColumn(bitColumn);
        table.addColumn(tinyintColumn);

        // When
        String sql = sqlGeneratorService.generateConstraintsSql(table);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("CK_TestTable_status"));
        assertTrue(sql.contains("CK_TestTable_age"));
        assertTrue(sql.contains("CHECK ([status] IN (0, 1))"));
        assertTrue(sql.contains("CHECK ([age] >= 0 AND [age] <= 255)"));
        
        System.out.println("Generated Constraints SQL:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("백업 스크립트 생성 테스트")
    void testGenerateBackupScript() {
        // When
        String sql = sqlGeneratorService.generateBackupScript("TestDB", "C:\\Backup\\TestDB.bak");

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("BACKUP DATABASE [TestDB]"));
        assertTrue(sql.contains("TO DISK = 'C:\\Backup\\TestDB.bak'"));
        assertTrue(sql.contains("WITH FORMAT, INIT"));
        
        System.out.println("Generated Backup Script:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("통계 업데이트 스크립트 생성 테스트")
    void testGenerateStatisticsUpdateScript() {
        // Given
        Project project = new Project("TestProject", "테스트 프로젝트");
        
        Table userTable = new Table("User", "사용자 테이블");
        Table productTable = new Table("Product", "상품 테이블");
        
        project.addTable(userTable);
        project.addTable(productTable);

        // When
        String sql = sqlGeneratorService.generateStatisticsUpdateScript(project);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("UPDATE STATISTICS [User] WITH FULLSCAN"));
        assertTrue(sql.contains("UPDATE STATISTICS [Product] WITH FULLSCAN"));
        
        System.out.println("Generated Statistics Update Script:");
        System.out.println(sql);
    }

    @Test
    @DisplayName("테이블 변경 스크립트 생성 테스트")
    void testGenerateAlterTableSql() {
        // Given - 원본 테이블
        Table originalTable = new Table("User", "사용자 테이블");
        Column originalIdColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        originalIdColumn.setPrimaryKey(true);
        originalTable.addColumn(originalIdColumn);

        // Given - 수정된 테이블 (컬럼 추가)
        Table modifiedTable = new Table("User", "사용자 테이블");
        Column modifiedIdColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        modifiedIdColumn.setId(originalIdColumn.getId()); // 같은 ID로 설정
        modifiedIdColumn.setPrimaryKey(true);
        
        Column newNameColumn = new Column("name", MSSQLDataType.NVARCHAR, 2);
        newNameColumn.setMaxLength(100);
        
        modifiedTable.addColumn(modifiedIdColumn);
        modifiedTable.addColumn(newNameColumn);

        // When
        String sql = sqlGeneratorService.generateAlterTableSql(originalTable, modifiedTable);

        // Then
        assertNotNull(sql);
        assertTrue(sql.contains("ALTER TABLE [User] ADD"));
        assertTrue(sql.contains("[name] NVARCHAR(100)"));
        
        System.out.println("Generated Alter Table SQL:");
        System.out.println(sql);
    }
}