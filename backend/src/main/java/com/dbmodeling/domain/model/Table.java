package com.dbmodeling.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 테이블 도메인 모델
 * 데이터베이스 테이블을 나타내는 도메인 엔티티
 */
public class Table {
    private UUID id;
    private UUID projectId;
    private String name;
    private String description;
    private Integer positionX;
    private Integer positionY;
    private List<Column> columns;
    private List<Index> indexes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 기본 생성자
    public Table() {
        this.columns = new ArrayList<>();
        this.indexes = new ArrayList<>();
        this.positionX = 0;
        this.positionY = 0;
    }

    // 생성자
    public Table(String name, String description) {
        this();
        this.id = UUID.randomUUID();
        this.name = name;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 비즈니스 메서드
    public void updateTable(String name, String description) {
        this.name = name;
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePosition(Integer positionX, Integer positionY) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.updatedAt = LocalDateTime.now();
    }

    public void addColumn(Column column) {
        if (column != null) {
            this.columns.add(column);
            column.setTableId(this.id);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void removeColumn(UUID columnId) {
        this.columns.removeIf(column -> column.getId().equals(columnId));
        this.updatedAt = LocalDateTime.now();
    }

    public void addIndex(Index index) {
        if (index != null) {
            this.indexes.add(index);
            index.setTableId(this.id);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void removeIndex(UUID indexId) {
        this.indexes.removeIf(index -> index.getId().equals(indexId));
        this.updatedAt = LocalDateTime.now();
    }

    public List<Column> getPrimaryKeyColumns() {
        return columns.stream()
                .filter(Column::isPrimaryKey)
                .toList();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPositionX() {
        return positionX;
    }

    public void setPositionX(Integer positionX) {
        this.positionX = positionX;
    }

    public Integer getPositionY() {
        return positionY;
    }

    public void setPositionY(Integer positionY) {
        this.positionY = positionY;
    }

    public List<Column> getColumns() {
        return columns;
    }

    public void setColumns(List<Column> columns) {
        this.columns = columns;
    }

    public List<Index> getIndexes() {
        return indexes;
    }

    public void setIndexes(List<Index> indexes) {
        this.indexes = indexes;
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
}