package com.dbmodeling.domain.model;

import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 비즈니스 로직 엣지 케이스 테스트
 * 예외 상황과 경계 조건을 테스트
 */
class BusinessLogicEdgeCaseTest {

    @Test
    void 빈_프로젝트_테이블_제거_시도_테스트() {
        // Given
        Project project = new Project("빈 프로젝트", "테이블이 없는 프로젝트");
        UUID nonExistentTableId = UUID.randomUUID();

        // When
        project.removeTable(nonExistentTableId);

        // Then - 예외 발생하지 않고 정상 처리
        assertEquals(0, project.getTables().size());
    }

    @Test
    void 테이블에서_존재하지_않는_컬럼_제거_시도_테스트() {
        // Given
        Table table = new Table("TestTable", "테스트 테이블");
        UUID nonExistentColumnId = UUID.randomUUID();

        // When
        table.removeColumn(nonExistentColumnId);

        // Then - 예외 발생하지 않고 정상 처리
        assertEquals(0, table.getColumns().size());
    }

    @Test
    void 테이블에서_존재하지_않는_인덱스_제거_시도_테스트() {
        // Given
        Table table = new Table("TestTable", "테스트 테이블");
        UUID nonExistentIndexId = UUID.randomUUID();

        // When
        table.removeIndex(nonExistentIndexId);

        // Then - 예외 발생하지 않고 정상 처리
        assertEquals(0, table.getIndexes().size());
    }

    @Test
    void 인덱스에서_존재하지_않는_컬럼_제거_시도_테스트() {
        // Given
        Index index = new Index("TestIndex", Index.IndexType.NONCLUSTERED, false);
        UUID nonExistentColumnId = UUID.randomUUID();

        // When
        index.removeColumn(nonExistentColumnId);

        // Then - 예외 발생하지 않고 정상 처리
        assertEquals(0, index.getColumns().size());
    }

    @Test
    void 컬럼_데이터타입_null_설정_테스트() {
        // Given
        Column column = new Column("test", MSSQLDataType.INT, 1);

        // When
        column.setDataType(null);

        // Then
        assertNull(column.getDataType());
        assertFalse(column.requiresLength());
        assertFalse(column.requiresPrecision());
    }

    @Test
    void 네이밍_규칙_null_패턴_검증_테스트() {
        // Given
        NamingRules rules = new NamingRules();
        rules.setEnforceCase(null); // 케이스 검증 비활성화
        // 모든 패턴을 null로 설정 (기본값)

        // When & Then - null 패턴은 검증을 통과해야 함
        assertTrue(rules.validateTableName("AnyTableName"));
        assertTrue(rules.validateColumnName("any_column_name"));
        assertTrue(rules.validateIndexName("any_index_name"));
    }

    @Test
    void 네이밍_규칙_빈_문자열_패턴_검증_테스트() {
        // Given
        NamingRules rules = new NamingRules();
        rules.setTablePattern("");
        rules.setColumnPattern("");
        rules.setIndexPattern("");
        rules.setEnforceCase(null); // 케이스 검증 비활성화

        // When & Then - 빈 패턴은 아무것도 매치하지 않으므로 검증 실패
        assertFalse(rules.validateTableName("AnyTableName"));
        assertFalse(rules.validateColumnName("any_column_name"));
        assertFalse(rules.validateIndexName("any_index_name"));
    }

    @Test
    void 컬럼_순서_인덱스_경계값_테스트() {
        // Given
        Column column1 = new Column("col1", MSSQLDataType.INT, Integer.MAX_VALUE);
        Column column2 = new Column("col2", MSSQLDataType.INT, Integer.MIN_VALUE);
        Column column3 = new Column("col3", MSSQLDataType.INT, 0);

        // When & Then
        assertEquals(Integer.MAX_VALUE, column1.getOrderIndex());
        assertEquals(Integer.MIN_VALUE, column2.getOrderIndex());
        assertEquals(Integer.valueOf(0), column3.getOrderIndex());
    }

    @Test
    void 테이블_위치_경계값_테스트() {
        // Given
        Table table = new Table("TestTable", "테스트");

        // When
        table.updatePosition(Integer.MAX_VALUE, Integer.MIN_VALUE);

        // Then
        assertEquals(Integer.MAX_VALUE, table.getPositionX());
        assertEquals(Integer.MIN_VALUE, table.getPositionY());
    }

    @Test
    void 자동증가_시드_및_증가값_경계값_테스트() {
        // Given
        Column column = new Column("id", MSSQLDataType.BIGINT, 1);

        // When
        column.setIdentityProperties(true, Integer.MAX_VALUE, Integer.MIN_VALUE);

        // Then
        assertTrue(column.isIdentity());
        assertEquals(Integer.MAX_VALUE, column.getIdentitySeed());
        assertEquals(Integer.MIN_VALUE, column.getIdentityIncrement());
    }

    @Test
    void DECIMAL_최대_정밀도_및_스케일_테스트() {
        // Given
        Column column = new Column("decimal_col", MSSQLDataType.DECIMAL, 1);

        // When
        column.setDataTypeProperties(null, 38, 38); // MSSQL 최대 정밀도

        // Then
        assertEquals(Integer.valueOf(38), column.getPrecision());
        assertEquals(Integer.valueOf(38), column.getScale());
        
        String sqlString = column.getDataType().toSqlString(null, 38, 38);
        assertEquals("DECIMAL(38,38)", sqlString);
    }

    @Test
    void NVARCHAR_최대_길이_테스트() {
        // Given
        Column column = new Column("text_col", MSSQLDataType.NVARCHAR, 1);

        // When
        column.setMaxLength(4000); // NVARCHAR 최대 길이

        // Then
        assertEquals(Integer.valueOf(4000), column.getMaxLength());
        
        String sqlString = column.getDataType().toSqlString(4000, null, null);
        assertEquals("NVARCHAR(4000)", sqlString);
    }

    @Test
    void 복합_인덱스_최대_컬럼_수_시뮬레이션_테스트() {
        // Given
        Index compositeIndex = new Index("IX_Composite", Index.IndexType.NONCLUSTERED, false);
        
        // When - 16개 컬럼 추가 (MSSQL 복합 인덱스 최대 컬럼 수)
        for (int i = 1; i <= 16; i++) {
            UUID columnId = UUID.randomUUID();
            Index.SortOrder order = (i % 2 == 0) ? Index.SortOrder.DESC : Index.SortOrder.ASC;
            compositeIndex.addColumn(columnId, order);
        }

        // Then
        assertEquals(16, compositeIndex.getColumns().size());
        assertTrue(compositeIndex.isComposite());
        
        // 첫 번째와 마지막 컬럼의 정렬 순서 확인
        assertEquals(Index.SortOrder.ASC, compositeIndex.getColumns().get(0).getOrder());
        assertEquals(Index.SortOrder.DESC, compositeIndex.getColumns().get(15).getOrder());
    }

    @Test
    void 프로젝트_대량_테이블_추가_테스트() {
        // Given
        Project project = new Project("대용량 프로젝트", "많은 테이블을 가진 프로젝트");

        // When - 100개 테이블 추가
        for (int i = 1; i <= 100; i++) {
            Table table = new Table("Table" + i, "테이블 " + i);
            project.addTable(table);
        }

        // Then
        assertEquals(100, project.getTables().size());
        
        // 모든 테이블이 올바른 프로젝트 ID를 가지는지 확인
        for (Table table : project.getTables()) {
            assertEquals(project.getId(), table.getProjectId());
        }
    }

    @Test
    void 테이블_대량_컬럼_추가_테스트() {
        // Given
        Table table = new Table("WideTable", "많은 컬럼을 가진 테이블");

        // When - 50개 컬럼 추가
        for (int i = 1; i <= 50; i++) {
            MSSQLDataType dataType = (i % 2 == 0) ? MSSQLDataType.NVARCHAR : MSSQLDataType.INT;
            Column column = new Column("column" + i, dataType, i);
            
            if (dataType == MSSQLDataType.NVARCHAR) {
                column.setMaxLength(100);
            }
            
            table.addColumn(column);
        }

        // Then
        assertEquals(50, table.getColumns().size());
        
        // 모든 컬럼이 올바른 테이블 ID를 가지는지 확인
        for (Column column : table.getColumns()) {
            assertEquals(table.getId(), column.getTableId());
        }
    }

    @Test
    void 네이밍_규칙_특수문자_패턴_테스트() {
        // Given
        NamingRules rules = new NamingRules();
        rules.setTablePattern("^[A-Z][a-zA-Z0-9_$#@]*$"); // 특수문자 포함 패턴
        rules.setEnforceCase(null); // 케이스 검증은 패턴에서 처리

        // When & Then
        assertTrue(rules.validateTableName("Table_Name$123"));
        assertTrue(rules.validateTableName("User#Profile@Info"));
        assertFalse(rules.validateTableName("table_name")); // 소문자 시작
        assertFalse(rules.validateTableName("Table Name")); // 공백 포함
    }

    @Test
    void 인덱스_컬럼_순서_변경_빈_리스트_테스트() {
        // Given
        Index index = new Index("TestIndex", Index.IndexType.NONCLUSTERED, false);
        UUID columnId = UUID.randomUUID();
        index.addColumn(columnId, Index.SortOrder.ASC);

        // When - 빈 리스트로 순서 변경
        index.reorderColumns(java.util.List.of());

        // Then
        assertEquals(0, index.getColumns().size());
        assertFalse(index.isComposite());
    }

    @Test
    void 컬럼_기본값_특수_케이스_테스트() {
        // Given
        Column column1 = new Column("col1", MSSQLDataType.NVARCHAR, 1);
        column1.setMaxLength(50);
        
        Column column2 = new Column("col2", MSSQLDataType.DATETIME2, 2);
        column2.setPrecision(7);
        
        Column column3 = new Column("col3", MSSQLDataType.UNIQUEIDENTIFIER, 3);

        // When - 다양한 기본값 설정
        column1.setDefaultValue("'DEFAULT_VALUE'");
        column2.setDefaultValue("GETDATE()");
        column3.setDefaultValue("NEWID()");

        // Then
        assertEquals("'DEFAULT_VALUE'", column1.getDefaultValue());
        assertEquals("GETDATE()", column2.getDefaultValue());
        assertEquals("NEWID()", column3.getDefaultValue());
    }

    @Test
    void 프로젝트_네이밍_규칙_null_설정_테스트() {
        // Given
        Project project = new Project("테스트", "설명");

        // When
        project.setNamingRules(null);

        // Then
        assertNull(project.getNamingRules());
    }

    @Test
    void 동일한_컬럼_여러번_인덱스_추가_테스트() {
        // Given
        Index index = new Index("TestIndex", Index.IndexType.NONCLUSTERED, false);
        UUID columnId = UUID.randomUUID();

        // When - 동일한 컬럼을 여러 번 추가
        index.addColumn(columnId, Index.SortOrder.ASC);
        index.addColumn(columnId, Index.SortOrder.DESC);
        index.addColumn(columnId, Index.SortOrder.ASC);

        // Then - 중복 제거 로직이 없으므로 모두 추가됨
        assertEquals(3, index.getColumns().size());
        assertTrue(index.isComposite());
    }

    @Test
    void 테이블_컬럼_순서_중복_테스트() {
        // Given
        Table table = new Table("TestTable", "테스트");
        
        // When - 동일한 순서 인덱스를 가진 컬럼들 추가
        Column col1 = new Column("col1", MSSQLDataType.INT, 1);
        Column col2 = new Column("col2", MSSQLDataType.INT, 1);
        Column col3 = new Column("col3", MSSQLDataType.INT, 1);
        
        table.addColumn(col1);
        table.addColumn(col2);
        table.addColumn(col3);

        // Then - 모든 컬럼이 추가되어야 함 (순서 중복 허용)
        assertEquals(3, table.getColumns().size());
        
        // 모든 컬럼의 순서 인덱스가 1인지 확인
        for (Column column : table.getColumns()) {
            assertEquals(Integer.valueOf(1), column.getOrderIndex());
        }
    }
}