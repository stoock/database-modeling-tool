package com.dbmodeling.infrastructure.persistence.mapper;

import com.dbmodeling.domain.model.Table;
import com.dbmodeling.infrastructure.persistence.entity.TableEntity;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * 테이블 Entity-Domain 매퍼
 */
@Component
public class TableMapper {
    
    private final ColumnMapper columnMapper;
    private final IndexMapper indexMapper;
    
    public TableMapper(ColumnMapper columnMapper, IndexMapper indexMapper) {
        this.columnMapper = columnMapper;
        this.indexMapper = indexMapper;
    }
    
    /**
     * Entity를 Domain으로 변환
     */
    public Table toDomain(TableEntity entity) {
        if (entity == null) {
            return null;
        }
        
        Table table = new Table();
        table.setId(entity.getId());
        table.setProjectId(entity.getProject() != null ? entity.getProject().getId() : null);
        table.setName(entity.getName());
        table.setDescription(entity.getDescription());
        table.setPositionX(entity.getPositionX());
        table.setPositionY(entity.getPositionY());
        table.setCreatedAt(entity.getCreatedAt());
        table.setUpdatedAt(entity.getUpdatedAt());
        
        // 컬럼 목록 변환 (지연 로딩 고려)
        if (entity.getColumns() != null) {
            table.setColumns(
                entity.getColumns().stream()
                    .map(columnMapper::toDomain)
                    .collect(Collectors.toList())
            );
        }
        
        // 인덱스 목록 변환 (지연 로딩 고려)
        if (entity.getIndexes() != null) {
            table.setIndexes(
                entity.getIndexes().stream()
                    .map(indexMapper::toDomain)
                    .collect(Collectors.toList())
            );
        }
        
        return table;
    }
    
    /**
     * Domain을 Entity로 변환
     */
    public TableEntity toEntity(Table domain) {
        if (domain == null) {
            return null;
        }
        
        TableEntity entity = new TableEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setPositionX(domain.getPositionX());
        entity.setPositionY(domain.getPositionY());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        // version은 새 엔티티의 경우 null로 설정 (JPA가 자동 관리)
        
        // 컬럼과 인덱스는 별도로 저장되므로 여기서는 설정하지 않음
        // 양방향 관계는 각각의 리포지토리에서 처리
        
        return entity;
    }
    
    /**
     * 기존 Entity 업데이트
     */
    public void updateEntity(TableEntity entity, Table domain) {
        if (entity == null || domain == null) {
            return;
        }
        
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setPositionX(domain.getPositionX());
        entity.setPositionY(domain.getPositionY());
        entity.setUpdatedAt(domain.getUpdatedAt());
        // version은 JPA가 자동으로 관리하므로 설정하지 않음
    }
}