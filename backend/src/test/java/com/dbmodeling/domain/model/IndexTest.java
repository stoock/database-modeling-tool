package com.dbmodeling.domain.model;

import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 인덱스 도메인 모델 테스트
 */
class IndexTest {

    @Test
    void 인덱스_생성_테스트() {
        // Given
        String name = "IX_User_Email";
        Index.IndexType type = Index.IndexType.NONCLUSTERED;
        Boolean isUnique = true;

        // When
        Index index = new Index(name, type, isUnique);

        // Then
        assertNotNull(index.getId());
        assertEquals(name, index.getName());
        assertEquals(type, index.getType());
        assertEquals(isUnique, index.isUnique());
        assertNotNull(index.getCreatedAt());
        assertNotNull(index.getUpdatedAt());
        assertNotNull(index.getColumns());
        assertTrue(index.getColumns().isEmpty());
    }

    @Test
    void 기본_인덱스_생성_테스트() {
        // Given & When
        Index index = new Index();

        // Then
        assertFalse(index.isUnique());
        assertEquals(Index.IndexType.NONCLUSTERED, index.getType());
        assertTrue(index.getColumns().isEmpty());
    }

    @Test
    void 인덱스_정보_수정_테스트() {
        // Given
        Index index = new Index("원래이름", Index.IndexType.NONCLUSTERED, false);
        String newName = "새이름";
        Index.IndexType newType = Index.IndexType.CLUSTERED;
        Boolean newIsUnique = true;

        // When
        index.updateIndex(newName, newType, newIsUnique);

        // Then
        assertEquals(newName, index.getName());
        assertEquals(newType, index.getType());
        assertEquals(newIsUnique, index.isUnique());
    }

    @Test
    void 인덱스_컬럼_추가_테스트() {
        // Given
        Index index = new Index("IX_User_Name", Index.IndexType.NONCLUSTERED, false);
        UUID columnId = UUID.randomUUID();
        Index.SortOrder order = Index.SortOrder.ASC;

        // When
        index.addColumn(columnId, order);

        // Then
        assertEquals(1, index.getColumns().size());
        Index.IndexColumn indexColumn = index.getColumns().get(0);
        assertEquals(columnId, indexColumn.getColumnId());
        assertEquals(order, indexColumn.getOrder());
    }

    @Test
    void 인덱스_컬럼_제거_테스트() {
        // Given
        Index index = new Index("IX_User_Name", Index.IndexType.NONCLUSTERED, false);
        UUID columnId = UUID.randomUUID();
        index.addColumn(columnId, Index.SortOrder.ASC);

        // When
        index.removeColumn(columnId);

        // Then
        assertEquals(0, index.getColumns().size());
    }

    @Test
    void 인덱스_컬럼_순서_변경_테스트() {
        // Given
        Index index = new Index("IX_User_Composite", Index.IndexType.NONCLUSTERED, false);
        UUID columnId1 = UUID.randomUUID();
        UUID columnId2 = UUID.randomUUID();
        
        index.addColumn(columnId1, Index.SortOrder.ASC);
        index.addColumn(columnId2, Index.SortOrder.DESC);

        List<Index.IndexColumn> newOrder = List.of(
            new Index.IndexColumn(columnId2, Index.SortOrder.ASC),
            new Index.IndexColumn(columnId1, Index.SortOrder.DESC)
        );

        // When
        index.reorderColumns(newOrder);

        // Then
        assertEquals(2, index.getColumns().size());
        assertEquals(columnId2, index.getColumns().get(0).getColumnId());
        assertEquals(Index.SortOrder.ASC, index.getColumns().get(0).getOrder());
        assertEquals(columnId1, index.getColumns().get(1).getColumnId());
        assertEquals(Index.SortOrder.DESC, index.getColumns().get(1).getOrder());
    }

    @Test
    void 복합_인덱스_확인_테스트() {
        // Given
        Index singleIndex = new Index("IX_Single", Index.IndexType.NONCLUSTERED, false);
        Index compositeIndex = new Index("IX_Composite", Index.IndexType.NONCLUSTERED, false);
        
        singleIndex.addColumn(UUID.randomUUID(), Index.SortOrder.ASC);
        compositeIndex.addColumn(UUID.randomUUID(), Index.SortOrder.ASC);
        compositeIndex.addColumn(UUID.randomUUID(), Index.SortOrder.DESC);

        // When & Then
        assertFalse(singleIndex.isComposite());
        assertTrue(compositeIndex.isComposite());
    }

    @Test
    void 인덱스_컬럼_기본_정렬순서_테스트() {
        // Given
        Index.IndexColumn indexColumn = new Index.IndexColumn();

        // When & Then
        assertEquals(Index.SortOrder.ASC, indexColumn.getOrder());
    }

    @Test
    void 인덱스_컬럼_생성자_테스트() {
        // Given
        UUID columnId = UUID.randomUUID();
        Index.SortOrder order = Index.SortOrder.DESC;

        // When
        Index.IndexColumn indexColumn = new Index.IndexColumn(columnId, order);

        // Then
        assertEquals(columnId, indexColumn.getColumnId());
        assertEquals(order, indexColumn.getOrder());
    }

    @Test
    void 인덱스_컬럼_null_정렬순서_기본값_테스트() {
        // Given
        UUID columnId = UUID.randomUUID();

        // When
        Index.IndexColumn indexColumn = new Index.IndexColumn(columnId, null);

        // Then
        assertEquals(columnId, indexColumn.getColumnId());
        assertEquals(Index.SortOrder.ASC, indexColumn.getOrder());
    }

    @Test
    void 인덱스_타입_SQL_이름_테스트() {
        // When & Then
        assertEquals("CLUSTERED", Index.IndexType.CLUSTERED.getSqlName());
        assertEquals("NONCLUSTERED", Index.IndexType.NONCLUSTERED.getSqlName());
    }

    @Test
    void 정렬순서_SQL_이름_테스트() {
        // When & Then
        assertEquals("ASC", Index.SortOrder.ASC.getSqlName());
        assertEquals("DESC", Index.SortOrder.DESC.getSqlName());
    }
}