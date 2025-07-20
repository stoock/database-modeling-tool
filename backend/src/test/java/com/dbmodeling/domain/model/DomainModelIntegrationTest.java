package com.dbmodeling.domain.model;

import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 도메인 모델 통합 테스트
 * 여러 도메인 모델 간의 상호작용을 테스트
 */
class DomainModelIntegrationTest {

    @Test
    void 완전한_프로젝트_생성_및_검증_시나리오_테스트() {
        // Given - 프로젝트 생성
        Project project = new Project("사용자 관리 시스템", "사용자 정보를 관리하는 시스템");
        
        // 네이밍 규칙 설정 (각 타입별로 다른 규칙 적용)
        NamingRules namingRules = new NamingRules();
        namingRules.setTablePrefix("TB_");
        namingRules.setEnforceCase(null); // 케이스 검증은 패턴에서 처리
        namingRules.setTablePattern("^TB_[A-Z][A-Z0-9_]*$"); // 테이블은 UPPER
        namingRules.setColumnPattern("^[a-z][a-z0-9_]*$"); // 컬럼은 snake_case
        namingRules.setIndexPattern("^IX_[A-Z][A-Z0-9_]*$"); // 인덱스는 UPPER
        project.setNamingRules(namingRules);

        // 사용자 테이블 생성
        Table userTable = new Table("TB_USER", "사용자 정보 테이블");
        userTable.updatePosition(100, 200);

        // 컬럼 추가
        Column idColumn = new Column("user_id", MSSQLDataType.BIGINT, 1);
        idColumn.setPrimaryKey(true);
        idColumn.setIdentityProperties(true, 1, 1);
        
        Column nameColumn = new Column("user_name", MSSQLDataType.NVARCHAR, 2);
        nameColumn.setMaxLength(100);
        nameColumn.setNullableWithValidation(false);
        
        Column emailColumn = new Column("email", MSSQLDataType.NVARCHAR, 3);
        emailColumn.setMaxLength(255);
        
        Column createdAtColumn = new Column("created_at", MSSQLDataType.DATETIME2, 4);
        createdAtColumn.setPrecision(7);
        createdAtColumn.setDefaultValue("GETDATE()");

        userTable.addColumn(idColumn);
        userTable.addColumn(nameColumn);
        userTable.addColumn(emailColumn);
        userTable.addColumn(createdAtColumn);

        // 인덱스 추가
        Index emailIndex = new Index("IX_USER_EMAIL", Index.IndexType.NONCLUSTERED, true);
        emailIndex.addColumn(emailColumn.getId(), Index.SortOrder.ASC);
        
        Index nameIndex = new Index("IX_USER_NAME", Index.IndexType.NONCLUSTERED, false);
        nameIndex.addColumn(nameColumn.getId(), Index.SortOrder.ASC);

        userTable.addIndex(emailIndex);
        userTable.addIndex(nameIndex);

        project.addTable(userTable);

        // When & Then - 프로젝트 구조 검증
        assertEquals(1, project.getTables().size());
        assertEquals(project.getId(), userTable.getProjectId());
        
        // 테이블 검증
        assertEquals(4, userTable.getColumns().size());
        assertEquals(2, userTable.getIndexes().size());
        assertEquals(Integer.valueOf(100), userTable.getPositionX());
        assertEquals(Integer.valueOf(200), userTable.getPositionY());
        
        // 기본키 컬럼 검증
        var primaryKeys = userTable.getPrimaryKeyColumns();
        assertEquals(1, primaryKeys.size());
        assertEquals(idColumn, primaryKeys.get(0));
        assertTrue(primaryKeys.get(0).isIdentity());
        
        // 인덱스 검증
        assertTrue(emailIndex.isUnique());
        assertFalse(nameIndex.isUnique());
        assertFalse(emailIndex.isComposite());
        assertFalse(nameIndex.isComposite());
        
        // 네이밍 규칙 검증
        assertTrue(namingRules.validateTableName("TB_USER"));
        assertTrue(namingRules.validateColumnName("user_id"));
        assertTrue(namingRules.validateIndexName("IX_USER_EMAIL"));
    }

    @Test
    void 복합_인덱스_생성_및_관리_테스트() {
        // Given
        Table orderTable = new Table("TB_ORDER", "주문 테이블");
        
        Column userIdColumn = new Column("user_id", MSSQLDataType.BIGINT, 1);
        Column orderDateColumn = new Column("order_date", MSSQLDataType.DATE, 2);
        Column statusColumn = new Column("status", MSSQLDataType.NVARCHAR, 3);
        statusColumn.setMaxLength(20);
        
        orderTable.addColumn(userIdColumn);
        orderTable.addColumn(orderDateColumn);
        orderTable.addColumn(statusColumn);

        // When - 복합 인덱스 생성
        Index compositeIndex = new Index("IX_Order_UserDate", Index.IndexType.NONCLUSTERED, false);
        compositeIndex.addColumn(userIdColumn.getId(), Index.SortOrder.ASC);
        compositeIndex.addColumn(orderDateColumn.getId(), Index.SortOrder.DESC);
        
        orderTable.addIndex(compositeIndex);

        // Then
        assertTrue(compositeIndex.isComposite());
        assertEquals(2, compositeIndex.getColumns().size());
        
        // 컬럼 순서 확인
        assertEquals(userIdColumn.getId(), compositeIndex.getColumns().get(0).getColumnId());
        assertEquals(Index.SortOrder.ASC, compositeIndex.getColumns().get(0).getOrder());
        assertEquals(orderDateColumn.getId(), compositeIndex.getColumns().get(1).getColumnId());
        assertEquals(Index.SortOrder.DESC, compositeIndex.getColumns().get(1).getOrder());
        
        // 컬럼 순서 변경 테스트
        var newOrder = java.util.List.of(
            new Index.IndexColumn(orderDateColumn.getId(), Index.SortOrder.ASC),
            new Index.IndexColumn(userIdColumn.getId(), Index.SortOrder.ASC)
        );
        
        compositeIndex.reorderColumns(newOrder);
        
        assertEquals(orderDateColumn.getId(), compositeIndex.getColumns().get(0).getColumnId());
        assertEquals(userIdColumn.getId(), compositeIndex.getColumns().get(1).getColumnId());
    }

    @Test
    void 데이터타입_변경_시나리오_테스트() {
        // Given
        Column priceColumn = new Column("price", MSSQLDataType.INT, 1);
        
        // When - INT에서 DECIMAL로 변경
        priceColumn.updateColumn("price", "상품 가격", MSSQLDataType.DECIMAL);
        priceColumn.setDataTypeProperties(null, 18, 2);

        // Then
        assertEquals(MSSQLDataType.DECIMAL, priceColumn.getDataType());
        assertEquals(Integer.valueOf(18), priceColumn.getPrecision());
        assertEquals(Integer.valueOf(2), priceColumn.getScale());
        assertTrue(priceColumn.requiresPrecision());
        
        // DECIMAL 타입의 SQL 문자열 생성 확인
        String sqlString = priceColumn.getDataType().toSqlString(null, 18, 2);
        assertEquals("DECIMAL(18,2)", sqlString);
    }

    @Test
    void 자동증가_컬럼_제약사항_테스트() {
        // Given
        Column idColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        
        // When - 기본키 및 자동증가 설정
        idColumn.setPrimaryKey(true);
        idColumn.setIdentityProperties(true, 100, 10);

        // Then
        assertTrue(idColumn.isPrimaryKey());
        assertTrue(idColumn.isIdentity());
        assertFalse(idColumn.isNullable()); // 기본키는 자동으로 NOT NULL
        assertEquals(Integer.valueOf(100), idColumn.getIdentitySeed());
        assertEquals(Integer.valueOf(10), idColumn.getIdentityIncrement());
        
        // 자동증가 컬럼은 NULL 허용 불가 확인
        assertThrows(IllegalArgumentException.class, () -> {
            idColumn.setNullableWithValidation(true);
        });
    }

    @Test
    void 네이밍_규칙_제안_기능_통합_테스트() {
        // Given
        NamingRules rules = new NamingRules();
        rules.setTablePrefix("TB_");
        rules.setTableSuffix("_INFO");
        rules.setEnforceCase(NamingRules.CaseType.UPPER);

        // When & Then - 다양한 입력에 대한 제안 테스트
        assertEquals("TB_USER_INFO", rules.suggestTableName("user"));
        assertEquals("TB_USER_INFO", rules.suggestTableName("User"));
        assertEquals("TB_USERPROFILE_INFO", rules.suggestTableName("userProfile"));
        assertEquals("TB_USER_PROFILE_INFO", rules.suggestTableName("user_profile"));
        
        // 컬럼명 제안 (snake_case)
        rules.setEnforceCase(NamingRules.CaseType.SNAKE);
        assertEquals("user_id", rules.suggestColumnName("UserId"));
        assertEquals("created_at", rules.suggestColumnName("CreatedAt"));
        assertEquals("user_profile_id", rules.suggestColumnName("UserProfileId"));
        
        // 인덱스명 제안
        rules.setEnforceCase(NamingRules.CaseType.PASCAL);
        assertEquals("IxUserEmail", rules.suggestIndexName("User", "Email"));
        assertEquals("IxOrderUserDate", rules.suggestIndexName("Order", "UserDate"));
    }

    @Test
    void 테이블_관계_시뮬레이션_테스트() {
        // Given - 사용자와 주문 테이블 관계 시뮬레이션
        Project project = new Project("전자상거래", "온라인 쇼핑몰 시스템");
        
        // 사용자 테이블
        Table userTable = new Table("User", "사용자 정보");
        Column userIdColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        userIdColumn.setPrimaryKey(true);
        userIdColumn.setIdentityProperties(true, 1, 1);
        userTable.addColumn(userIdColumn);
        
        // 주문 테이블
        Table orderTable = new Table("Order", "주문 정보");
        Column orderIdColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        orderIdColumn.setPrimaryKey(true);
        orderIdColumn.setIdentityProperties(true, 1, 1);
        
        Column orderUserIdColumn = new Column("user_id", MSSQLDataType.BIGINT, 2);
        orderUserIdColumn.setNullableWithValidation(false); // 외래키는 NOT NULL
        
        orderTable.addColumn(orderIdColumn);
        orderTable.addColumn(orderUserIdColumn);
        
        // 외래키 인덱스 생성
        Index fkIndex = new Index("IX_Order_UserId", Index.IndexType.NONCLUSTERED, false);
        fkIndex.addColumn(orderUserIdColumn.getId(), Index.SortOrder.ASC);
        orderTable.addIndex(fkIndex);
        
        project.addTable(userTable);
        project.addTable(orderTable);

        // When & Then
        assertEquals(2, project.getTables().size());
        
        // 사용자 테이블 검증
        assertEquals(1, userTable.getPrimaryKeyColumns().size());
        assertTrue(userTable.getPrimaryKeyColumns().get(0).isIdentity());
        
        // 주문 테이블 검증
        assertEquals(1, orderTable.getPrimaryKeyColumns().size());
        assertEquals(1, orderTable.getIndexes().size());
        
        // 외래키 컬럼 검증
        assertFalse(orderUserIdColumn.isPrimaryKey());
        assertFalse(orderUserIdColumn.isNullable());
        assertEquals(MSSQLDataType.BIGINT, orderUserIdColumn.getDataType());
        
        // 인덱스 검증
        assertFalse(fkIndex.isUnique());
        assertEquals(1, fkIndex.getColumns().size());
        assertEquals(orderUserIdColumn.getId(), fkIndex.getColumns().get(0).getColumnId());
    }

    @Test
    void 대용량_데이터_타입_제약사항_테스트() {
        // Given
        Table documentTable = new Table("Document", "문서 테이블");
        
        // TEXT 타입 컬럼 (기본키 불가, 자동증가 불가)
        Column contentColumn = new Column("content", MSSQLDataType.TEXT, 1);
        
        // IMAGE 타입 컬럼 (기본키 불가)
        Column imageColumn = new Column("image_data", MSSQLDataType.IMAGE, 2);
        
        documentTable.addColumn(contentColumn);
        documentTable.addColumn(imageColumn);

        // When & Then
        assertFalse(contentColumn.getDataType().canBePrimaryKey());
        assertFalse(contentColumn.getDataType().supportsIdentity());
        assertFalse(imageColumn.getDataType().canBePrimaryKey());
        assertFalse(imageColumn.getDataType().supportsIdentity());
        
        // 길이나 정밀도 불필요 확인
        assertFalse(contentColumn.requiresLength());
        assertFalse(contentColumn.requiresPrecision());
        assertFalse(imageColumn.requiresLength());
        assertFalse(imageColumn.requiresPrecision());
    }

    @Test
    void 프로젝트_업데이트_시간_추적_테스트() {
        // Given
        Project project = new Project("테스트 프로젝트", "설명");
        var initialUpdatedAt = project.getUpdatedAt();
        
        // 잠시 대기 (시간 차이를 만들기 위해)
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // When - 프로젝트 정보 수정
        project.updateProject("수정된 프로젝트", "수정된 설명");
        
        // Then
        assertTrue(project.getUpdatedAt().isAfter(initialUpdatedAt));
        assertEquals("수정된 프로젝트", project.getName());
        assertEquals("수정된 설명", project.getDescription());
    }
}