package com.dbmodeling.application.service;

import com.dbmodeling.application.service.BatchProcessingService.ColumnOrderUpdate;
import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.Index;
import com.dbmodeling.domain.model.MSSQLDataType;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.IndexRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("배치 처리 서비스 테스트")
class BatchProcessingServiceTest {

    @Mock
    private ColumnRepository columnRepository;

    @Mock
    private IndexRepository indexRepository;

    @InjectMocks
    private BatchProcessingService batchProcessingService;

    private UUID testTableId;
    private Column testColumn1;
    private Column testColumn2;
    private Column testColumn3;

    @BeforeEach
    void setUp() {
        testTableId = UUID.randomUUID();

        testColumn1 = new Column();
        testColumn1.setId(UUID.randomUUID());
        testColumn1.setTableId(testTableId);
        testColumn1.setName("column1");
        testColumn1.setDataType(MSSQLDataType.VARCHAR);
        testColumn1.setOrderIndex(0);

        testColumn2 = new Column();
        testColumn2.setId(UUID.randomUUID());
        testColumn2.setTableId(testTableId);
        testColumn2.setName("column2");
        testColumn2.setDataType(MSSQLDataType.INT);
        testColumn2.setOrderIndex(1);

        testColumn3 = new Column();
        testColumn3.setId(UUID.randomUUID());
        testColumn3.setTableId(testTableId);
        testColumn3.setName("column3");
        testColumn3.setDataType(MSSQLDataType.DATETIME);
        testColumn3.setOrderIndex(2);
    }

    @Test
    @DisplayName("컬럼 순서 일괄 업데이트 - 성공")
    void updateColumnOrderBatch_Success() {
        // Given
        List<Column> existingColumns = Arrays.asList(testColumn1, testColumn2, testColumn3);
        List<ColumnOrderUpdate> updates = Arrays.asList(
            new ColumnOrderUpdate(testColumn1.getId(), 2),
            new ColumnOrderUpdate(testColumn2.getId(), 0),
            new ColumnOrderUpdate(testColumn3.getId(), 1)
        );

        when(columnRepository.findByTableIdOrderByOrderIndex(testTableId))
            .thenReturn(existingColumns);
        when(columnRepository.saveAll(anyList())).thenReturn(existingColumns);

        // When
        List<Column> result = batchProcessingService.updateColumnOrderBatch(testTableId, updates);

        // Then
        assertThat(result).hasSize(3);
        assertThat(testColumn1.getOrderIndex()).isEqualTo(2);
        assertThat(testColumn2.getOrderIndex()).isEqualTo(0);
        assertThat(testColumn3.getOrderIndex()).isEqualTo(1);
        verify(columnRepository).findByTableIdOrderByOrderIndex(testTableId);
        verify(columnRepository).saveAll(existingColumns);
    }

    @Test
    @DisplayName("컬럼 순서 일괄 업데이트 - 존재하지 않는 컬럼 ID는 무시")
    void updateColumnOrderBatch_IgnoreNonExistentColumns() {
        // Given
        List<Column> existingColumns = Arrays.asList(testColumn1, testColumn2);
        List<ColumnOrderUpdate> updates = Arrays.asList(
            new ColumnOrderUpdate(testColumn1.getId(), 1),
            new ColumnOrderUpdate(UUID.randomUUID(), 0), // 존재하지 않는 컬럼
            new ColumnOrderUpdate(testColumn2.getId(), 0)
        );

        when(columnRepository.findByTableIdOrderByOrderIndex(testTableId))
            .thenReturn(existingColumns);
        when(columnRepository.saveAll(anyList())).thenReturn(existingColumns);

        // When
        List<Column> result = batchProcessingService.updateColumnOrderBatch(testTableId, updates);

        // Then
        assertThat(result).hasSize(2);
        assertThat(testColumn1.getOrderIndex()).isEqualTo(1);
        assertThat(testColumn2.getOrderIndex()).isEqualTo(0);
    }

    @Test
    @DisplayName("인덱스 일괄 생성 - 성공")
    void createIndexesBatch_Success() {
        // Given
        Index index1 = new Index();
        index1.setName("idx_test1");

        Index index2 = new Index();
        index2.setName("idx_test2");

        List<Index> indexes = Arrays.asList(index1, index2);
        when(indexRepository.saveAll(anyList())).thenReturn(indexes);

        // When
        List<Index> result = batchProcessingService.createIndexesBatch(testTableId, indexes);

        // Then
        assertThat(result).hasSize(2);
        assertThat(index1.getTableId()).isEqualTo(testTableId);
        assertThat(index2.getTableId()).isEqualTo(testTableId);
        verify(indexRepository).saveAll(indexes);
    }

    @Test
    @DisplayName("컬럼 일괄 생성 - 성공")
    void createColumnsBatch_Success() {
        // Given
        Column newColumn1 = new Column();
        newColumn1.setName("new_column1");
        newColumn1.setDataType(MSSQLDataType.VARCHAR);

        Column newColumn2 = new Column();
        newColumn2.setName("new_column2");
        newColumn2.setDataType(MSSQLDataType.INT);

        List<Column> columns = Arrays.asList(newColumn1, newColumn2);
        when(columnRepository.saveAll(anyList())).thenReturn(columns);

        // When
        List<Column> result = batchProcessingService.createColumnsBatch(testTableId, columns);

        // Then
        assertThat(result).hasSize(2);
        assertThat(newColumn1.getTableId()).isEqualTo(testTableId);
        assertThat(newColumn1.getOrderIndex()).isEqualTo(0);
        assertThat(newColumn2.getTableId()).isEqualTo(testTableId);
        assertThat(newColumn2.getOrderIndex()).isEqualTo(1);
        verify(columnRepository).saveAll(columns);
    }

    @Test
    @DisplayName("컬럼 일괄 생성 - 순서 인덱스가 이미 설정된 경우")
    void createColumnsBatch_WithPresetOrderIndex() {
        // Given
        Column newColumn1 = new Column();
        newColumn1.setName("new_column1");
        newColumn1.setDataType(MSSQLDataType.VARCHAR);
        newColumn1.setOrderIndex(10);

        Column newColumn2 = new Column();
        newColumn2.setName("new_column2");
        newColumn2.setDataType(MSSQLDataType.INT);
        newColumn2.setOrderIndex(20);

        List<Column> columns = Arrays.asList(newColumn1, newColumn2);
        when(columnRepository.saveAll(anyList())).thenReturn(columns);

        // When
        List<Column> result = batchProcessingService.createColumnsBatch(testTableId, columns);

        // Then
        assertThat(result).hasSize(2);
        assertThat(newColumn1.getOrderIndex()).isEqualTo(10); // 기존 값 유지
        assertThat(newColumn2.getOrderIndex()).isEqualTo(20); // 기존 값 유지
    }

    @Test
    @DisplayName("컬럼 일괄 업데이트 - 성공")
    void updateColumnsBatch_Success() {
        // Given
        List<Column> columns = Arrays.asList(testColumn1, testColumn2);
        when(columnRepository.saveAll(anyList())).thenReturn(columns);

        // When
        List<Column> result = batchProcessingService.updateColumnsBatch(columns);

        // Then
        assertThat(result).hasSize(2);
        verify(columnRepository).saveAll(columns);
    }

    @Test
    @DisplayName("컬럼 일괄 삭제 - 성공")
    void deleteColumnsBatch_Success() {
        // Given
        List<UUID> columnIds = Arrays.asList(
            testColumn1.getId(),
            testColumn2.getId(),
            testColumn3.getId()
        );
        doNothing().when(columnRepository).deleteAllById(columnIds);

        // When
        batchProcessingService.deleteColumnsBatch(columnIds);

        // Then
        verify(columnRepository).deleteAllById(columnIds);
    }

    @Test
    @DisplayName("인덱스 일괄 삭제 - 성공")
    void deleteIndexesBatch_Success() {
        // Given
        List<UUID> indexIds = Arrays.asList(
            UUID.randomUUID(),
            UUID.randomUUID()
        );
        doNothing().when(indexRepository).deleteAllById(indexIds);

        // When
        batchProcessingService.deleteIndexesBatch(indexIds);

        // Then
        verify(indexRepository).deleteAllById(indexIds);
    }

    @Test
    @DisplayName("ColumnOrderUpdate DTO 테스트")
    void columnOrderUpdate_DtoTest() {
        // Given
        UUID columnId = UUID.randomUUID();
        Integer orderIndex = 5;

        // When
        ColumnOrderUpdate update1 = new ColumnOrderUpdate();
        update1.setColumnId(columnId);
        update1.setOrderIndex(orderIndex);

        ColumnOrderUpdate update2 = new ColumnOrderUpdate(columnId, orderIndex);

        // Then
        assertThat(update1.getColumnId()).isEqualTo(columnId);
        assertThat(update1.getOrderIndex()).isEqualTo(orderIndex);
        assertThat(update2.getColumnId()).isEqualTo(columnId);
        assertThat(update2.getOrderIndex()).isEqualTo(orderIndex);
    }
}
