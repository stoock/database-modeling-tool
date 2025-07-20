package com.dbmodeling.domain.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 테이블 도메인 모델 테스트
 */
class TableTest {

    @Test
    void 테이블_생성_테스트() {
        // Given
        String name = "User";
        String description = "사용자 테이블";

        // When
        Table table = new Table(name, description);

        // Then
        assertNotNull(table.getId());
        assertEquals(name, table.getName());
        assertEquals(description, table.getDescription());
        assertNotNull(table.getCreatedAt());
        assertNotNull(table.getUpdatedAt());
        assertNotNull(table.getColumns());
        assertNotNull(table.getIndexes());
        assertTrue(table.getColumns().isEmpty());
        assertTrue(table.getIndexes().isEmpty());
        assertEquals(0, table.getPositionX());
        assertEquals(0, table.getPositionY());
    }

    @Test
    void 테이블_정보_수정_테스트() {
        // Given
        Table table = new Table("원래이름", "원래설명");
        String newName = "새이름";
        String newDescription = "새설명";

        // When
        table.updateTable(newName, newDescription);

        // Then
        assertEquals(newName, table.getName());
        assertEquals(newDescription, table.getDescription());
    }

    @Test
    void 테이블_위치_수정_테스트() {
        // Given
        Table table = new Table("테이블", "설명");
        Integer newX = 100;
        Integer newY = 200;

        // When
        table.updatePosition(newX, newY);

        // Then
        assertEquals(newX, table.getPositionX());
        assertEquals(newY, table.getPositionY());
    }

    @Test
    void 컬럼_추가_테스트() {
        // Given
        Table table = new Table("User", "사용자 테이블");
        Column column = new Column("id", MSSQLDataType.BIGINT, 1);

        // When
        table.addColumn(column);

        // Then
        assertEquals(1, table.getColumns().size());
        assertEquals(table.getId(), column.getTableId());
        assertTrue(table.getColumns().contains(column));
    }

    @Test
    void 컬럼_제거_테스트() {
        // Given
        Table table = new Table("User", "사용자 테이블");
        Column column = new Column("id", MSSQLDataType.BIGINT, 1);
        table.addColumn(column);

        // When
        table.removeColumn(column.getId());

        // Then
        assertEquals(0, table.getColumns().size());
        assertFalse(table.getColumns().contains(column));
    }

    @Test
    void 인덱스_추가_테스트() {
        // Given
        Table table = new Table("User", "사용자 테이블");
        Index index = new Index("IX_User_Email", Index.IndexType.NONCLUSTERED, true);

        // When
        table.addIndex(index);

        // Then
        assertEquals(1, table.getIndexes().size());
        assertEquals(table.getId(), index.getTableId());
        assertTrue(table.getIndexes().contains(index));
    }

    @Test
    void 인덱스_제거_테스트() {
        // Given
        Table table = new Table("User", "사용자 테이블");
        Index index = new Index("IX_User_Email", Index.IndexType.NONCLUSTERED, true);
        table.addIndex(index);

        // When
        table.removeIndex(index.getId());

        // Then
        assertEquals(0, table.getIndexes().size());
        assertFalse(table.getIndexes().contains(index));
    }

    @Test
    void 기본키_컬럼_조회_테스트() {
        // Given
        Table table = new Table("User", "사용자 테이블");
        Column pkColumn = new Column("id", MSSQLDataType.BIGINT, 1);
        pkColumn.setPrimaryKey(true);
        Column normalColumn = new Column("name", MSSQLDataType.NVARCHAR, 2);
        
        table.addColumn(pkColumn);
        table.addColumn(normalColumn);

        // When
        var primaryKeyColumns = table.getPrimaryKeyColumns();

        // Then
        assertEquals(1, primaryKeyColumns.size());
        assertTrue(primaryKeyColumns.contains(pkColumn));
        assertFalse(primaryKeyColumns.contains(normalColumn));
    }

    @Test
    void null_컬럼_추가_시_무시_테스트() {
        // Given
        Table table = new Table("User", "사용자 테이블");

        // When
        table.addColumn(null);

        // Then
        assertEquals(0, table.getColumns().size());
    }

    @Test
    void null_인덱스_추가_시_무시_테스트() {
        // Given
        Table table = new Table("User", "사용자 테이블");

        // When
        table.addIndex(null);

        // Then
        assertEquals(0, table.getIndexes().size());
    }
}