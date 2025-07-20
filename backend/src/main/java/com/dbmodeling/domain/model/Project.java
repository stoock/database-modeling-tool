package com.dbmodeling.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 프로젝트 도메인 모델
 * 데이터베이스 모델링 프로젝트를 나타내는 핵심 도메인 엔티티
 */
public class Project {
    private UUID id;
    private String name;
    private String description;
    private NamingRules namingRules;
    private List<Table> tables;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 기본 생성자
    public Project() {
        this.tables = new ArrayList<>();
        this.namingRules = new NamingRules();
    }

    // 생성자
    public Project(String name, String description) {
        this();
        this.id = UUID.randomUUID();
        this.name = name;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 비즈니스 메서드
    public void updateProject(String name, String description) {
        this.name = name;
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public void addTable(Table table) {
        if (table != null) {
            this.tables.add(table);
            table.setProjectId(this.id);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void removeTable(UUID tableId) {
        this.tables.removeIf(table -> table.getId().equals(tableId));
        this.updatedAt = LocalDateTime.now();
    }

    public void updateNamingRules(NamingRules namingRules) {
        this.namingRules = namingRules;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public NamingRules getNamingRules() {
        return namingRules;
    }

    public void setNamingRules(NamingRules namingRules) {
        this.namingRules = namingRules;
    }

    public List<Table> getTables() {
        return tables;
    }

    public void setTables(List<Table> tables) {
        this.tables = tables;
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