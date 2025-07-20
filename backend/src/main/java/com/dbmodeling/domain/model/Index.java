package com.dbmodeling.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 인덱스 도메인 모델
 * 데이터베이스 인덱스를 나타내는 도메인 엔티티
 */
public class Index {
    private UUID id;
    private UUID tableId;
    private String name;
    private IndexType type;
    private Boolean isUnique;
    private List<IndexColumn> columns;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 기본 생성자
    public Index() {
        this.columns = new ArrayList<>();
        this.isUnique = false;
        this.type = IndexType.NONCLUSTERED;
    }

    // 생성자
    public Index(String name, IndexType type, Boolean isUnique) {
        this();
        this.id = UUID.randomUUID();
        this.name = name;
        this.type = type;
        this.isUnique = isUnique;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 비즈니스 메서드
    public void updateIndex(String name, IndexType type, Boolean isUnique) {
        this.name = name;
        this.type = type;
        this.isUnique = isUnique;
        this.updatedAt = LocalDateTime.now();
    }

    public void addColumn(UUID columnId, SortOrder order) {
        IndexColumn indexColumn = new IndexColumn(columnId, order);
        this.columns.add(indexColumn);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeColumn(UUID columnId) {
        this.columns.removeIf(col -> col.getColumnId().equals(columnId));
        this.updatedAt = LocalDateTime.now();
    }

    public void reorderColumns(List<IndexColumn> newOrder) {
        this.columns.clear();
        this.columns.addAll(newOrder);
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isComposite() {
        return columns.size() > 1;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getTableId() {
        return tableId;
    }

    public void setTableId(UUID tableId) {
        this.tableId = tableId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public IndexType getType() {
        return type;
    }

    public void setType(IndexType type) {
        this.type = type;
    }

    public Boolean isUnique() {
        return isUnique;
    }

    public void setUnique(Boolean unique) {
        isUnique = unique;
    }

    public List<IndexColumn> getColumns() {
        return columns;
    }

    public void setColumns(List<IndexColumn> columns) {
        this.columns = columns;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * 인덱스 타입 열거형
     */
    public enum IndexType {
        CLUSTERED("CLUSTERED"),
        NONCLUSTERED("NONCLUSTERED");

        private final String sqlName;

        IndexType(String sqlName) {
            this.sqlName = sqlName;
        }

        public String getSqlName() {
            return sqlName;
        }
    }

    /**
     * 정렬 순서 열거형
     */
    public enum SortOrder {
        ASC("ASC"),
        DESC("DESC");

        private final String sqlName;

        SortOrder(String sqlName) {
            this.sqlName = sqlName;
        }

        public String getSqlName() {
            return sqlName;
        }
    }

    /**
     * 인덱스 컬럼 내부 클래스
     */
    public static class IndexColumn {
        private UUID columnId;
        private SortOrder order;

        public IndexColumn() {
            this.order = SortOrder.ASC;
        }

        public IndexColumn(UUID columnId, SortOrder order) {
            this.columnId = columnId;
            this.order = order != null ? order : SortOrder.ASC;
        }

        public UUID getColumnId() {
            return columnId;
        }

        public void setColumnId(UUID columnId) {
            this.columnId = columnId;
        }

        public SortOrder getOrder() {
            return order;
        }

        public void setOrder(SortOrder order) {
            this.order = order;
        }
    }
}