package com.dbmodeling.infrastructure.persistence.mapper;

import com.dbmodeling.domain.model.Index;
import com.dbmodeling.infrastructure.persistence.entity.IndexEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 인덱스 Entity-Domain 매퍼
 */
@Component("persistenceIndexMapper")
public class IndexMapper {
    
    private final ObjectMapper objectMapper;
    
    public IndexMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    
    /**
     * Entity를 Domain으로 변환
     */
    public Index toDomain(IndexEntity entity) {
        if (entity == null) {
            return null;
        }
        
        Index index = new Index();
        index.setId(entity.getId());
        index.setTableId(entity.getTable() != null ? entity.getTable().getId() : null);
        index.setName(entity.getName());
        index.setType(parseIndexType(entity.getType()));
        index.setUnique(entity.getIsUnique());
        index.setColumns(parseIndexColumns(entity.getColumns()));
        index.setCreatedAt(entity.getCreatedAt());
        index.setUpdatedAt(entity.getUpdatedAt());
        
        return index;
    }
    
    /**
     * Domain을 Entity로 변환
     */
    public IndexEntity toEntity(Index domain) {
        if (domain == null) {
            return null;
        }
        
        IndexEntity entity = new IndexEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setType(serializeIndexType(domain.getType()));
        entity.setIsUnique(domain.isUnique());
        entity.setColumns(serializeIndexColumns(domain.getColumns()));
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        
        return entity;
    }
    
    /**
     * 기존 Entity 업데이트
     */
    public void updateEntity(IndexEntity entity, Index domain) {
        if (entity == null || domain == null) {
            return;
        }
        
        entity.setName(domain.getName());
        entity.setType(serializeIndexType(domain.getType()));
        entity.setIsUnique(domain.isUnique());
        entity.setColumns(serializeIndexColumns(domain.getColumns()));
        entity.setUpdatedAt(domain.getUpdatedAt());
    }
    
    /**
     * 문자열을 IndexType으로 파싱
     */
    private Index.IndexType parseIndexType(String typeString) {
        if (typeString == null || typeString.trim().isEmpty()) {
            return Index.IndexType.NONCLUSTERED;
        }
        
        try {
            return Index.IndexType.valueOf(typeString.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Index.IndexType.NONCLUSTERED;
        }
    }
    
    /**
     * IndexType을 문자열로 직렬화
     */
    private String serializeIndexType(Index.IndexType type) {
        return type != null ? type.name() : Index.IndexType.NONCLUSTERED.name();
    }
    
    /**
     * JSON 문자열을 IndexColumn 리스트로 파싱
     */
    private List<Index.IndexColumn> parseIndexColumns(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        try {
            List<IndexColumnDto> dtos = objectMapper.readValue(json, new TypeReference<List<IndexColumnDto>>() {});
            return dtos.stream()
                    .map(dto -> new Index.IndexColumn(
                        UUID.fromString(dto.columnId),
                        Index.SortOrder.valueOf(dto.order.toUpperCase())
                    ))
                    .toList();
        } catch (Exception e) {
            // 파싱 실패 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }
    
    /**
     * IndexColumn 리스트를 JSON 문자열로 직렬화
     */
    private String serializeIndexColumns(List<Index.IndexColumn> columns) {
        if (columns == null || columns.isEmpty()) {
            return "[]";
        }
        
        try {
            List<IndexColumnDto> dtos = columns.stream()
                    .map(col -> new IndexColumnDto(col.getColumnId().toString(), col.getOrder().name()))
                    .toList();
            return objectMapper.writeValueAsString(dtos);
        } catch (JsonProcessingException e) {
            // 직렬화 실패 시 빈 배열 반환
            return "[]";
        }
    }
    
    /**
     * JSON 직렬화/역직렬화를 위한 DTO 클래스
     */
    private static class IndexColumnDto {
        public String columnId;
        public String order;
        
        public IndexColumnDto() {}
        
        public IndexColumnDto(String columnId, String order) {
            this.columnId = columnId;
            this.order = order;
        }
    }
}