package com.dbmodeling.application.service;

import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.Index;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.IndexRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 배치 처리 최적화 서비스
 */
@Service
@Transactional
public class BatchProcessingService {

    private final ColumnRepository columnRepository;
    private final IndexRepository indexRepository;

    public BatchProcessingService(
            ColumnRepository columnRepository,
            IndexRepository indexRepository) {
        this.columnRepository = columnRepository;
        this.indexRepository = indexRepository;
    }

    /**
     * 컬럼 순서 일괄 업데이트
     * 개별 업데이트 대신 배치로 처리하여 성능 향상
     */
    public List<Column> updateColumnOrderBatch(String tableId, List<ColumnOrderUpdate> updates) {
        // 기존 컬럼들 조회
        List<Column> existingColumns = columnRepository.findByTableIdOrderByOrderIndex(tableId);
        Map<String, Column> columnMap = existingColumns.stream()
                .collect(Collectors.toMap(Column::getId, column -> column));

        // 순서 업데이트 적용
        for (ColumnOrderUpdate update : updates) {
            Column column = columnMap.get(update.getColumnId());
            if (column != null) {
                column.updateOrderIndex(update.getOrderIndex());
            }
        }

        // 배치로 저장
        return columnRepository.saveAll(existingColumns);
    }

    /**
     * 인덱스 일괄 생성
     */
    public List<Index> createIndexesBatch(String tableId, List<Index> indexes) {
        // 테이블 ID 설정
        indexes.forEach(index -> index.setTableId(tableId));
        
        // 배치로 저장
        return indexRepository.saveAll(indexes);
    }

    /**
     * 컬럼 일괄 생성
     */
    public List<Column> createColumnsBatch(String tableId, List<Column> columns) {
        // 테이블 ID 설정 및 순서 인덱스 자동 설정
        for (int i = 0; i < columns.size(); i++) {
            Column column = columns.get(i);
            column.setTableId(tableId);
            if (column.getOrderIndex() == null) {
                column.setOrderIndex(i);
            }
        }
        
        // 배치로 저장
        return columnRepository.saveAll(columns);
    }

    /**
     * 컬럼 일괄 업데이트
     */
    public List<Column> updateColumnsBatch(List<Column> columns) {
        return columnRepository.saveAll(columns);
    }

    /**
     * 컬럼 일괄 삭제
     */
    public void deleteColumnsBatch(List<String> columnIds) {
        columnRepository.deleteAllById(columnIds);
    }

    /**
     * 인덱스 일괄 삭제
     */
    public void deleteIndexesBatch(List<String> indexIds) {
        indexRepository.deleteAllById(indexIds);
    }

    /**
     * 컬럼 순서 업데이트 DTO
     */
    public static class ColumnOrderUpdate {
        private String columnId;
        private Integer orderIndex;

        public ColumnOrderUpdate() {}

        public ColumnOrderUpdate(String columnId, Integer orderIndex) {
            this.columnId = columnId;
            this.orderIndex = orderIndex;
        }

        public String getColumnId() { return columnId; }
        public void setColumnId(String columnId) { this.columnId = columnId; }
        public Integer getOrderIndex() { return orderIndex; }
        public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    }
}