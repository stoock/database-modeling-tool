package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.infrastructure.persistence.entity.ColumnEntity;
import com.dbmodeling.infrastructure.persistence.entity.TableEntity;
import com.dbmodeling.infrastructure.persistence.mapper.ColumnMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 컬럼 리포지토리 구현체
 */
@Repository
@Transactional
public class ColumnRepositoryImpl implements ColumnRepository {
    
    private final ColumnJpaRepository jpaRepository;
    private final TableJpaRepository tableJpaRepository;
    private final ColumnMapper mapper;
    
    public ColumnRepositoryImpl(ColumnJpaRepository jpaRepository,
                               TableJpaRepository tableJpaRepository,
                               ColumnMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.tableJpaRepository = tableJpaRepository;
        this.mapper = mapper;
    }
    
    @Override
    public Column save(Column column) {
        ColumnEntity entity;
        
        if (column.getId() != null) {
            // ID가 있으면 기존 엔티티 조회 시도
            Optional<ColumnEntity> existingEntity = jpaRepository.findById(column.getId());
            if (existingEntity.isPresent()) {
                // 기존 엔티티 업데이트 - 기존 엔티티를 가져와서 업데이트
                entity = existingEntity.get();
                mapper.updateEntity(entity, column);
                
                // 테이블 연관관계 설정 (필요시)
                if (column.getTableId() != null && !column.getTableId().equals(entity.getTable().getId())) {
                    TableEntity table = tableJpaRepository.findById(column.getTableId())
                            .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다: " + column.getTableId()));
                    entity.setTable(table);
                }
                
                entity = jpaRepository.saveAndFlush(entity);
            } else {
                // ID는 있지만 DB에 없으면 새 엔티티 생성
                entity = mapper.toEntity(column);
                entity.setId(null); // 새 엔티티임을 명시
                
                // 테이블 연관관계 설정
                if (column.getTableId() != null) {
                    TableEntity table = tableJpaRepository.findById(column.getTableId())
                            .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다: " + column.getTableId()));
                    entity.setTable(table);
                }
                
                entity = jpaRepository.save(entity);
            }
        } else {
            // 새 엔티티 생성
            entity = mapper.toEntity(column);
            
            // 테이블 연관관계 설정
            if (column.getTableId() != null) {
                TableEntity table = tableJpaRepository.findById(column.getTableId())
                        .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다: " + column.getTableId()));
                entity.setTable(table);
            }
            
            entity = jpaRepository.save(entity);
        }
        
        return mapper.toDomain(entity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Column> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Column> findByTableIdOrderByOrderIndex(UUID tableId) {
        return jpaRepository.findByTableIdOrderByOrderIndex(tableId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Column> findByTableIdAndName(UUID tableId, String name) {
        return jpaRepository.findByTableIdAndName(tableId, name)
                .map(mapper::toDomain);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Column> findByTableIdAndIsPrimaryKeyTrue(UUID tableId) {
        return jpaRepository.findByTableIdAndIsPrimaryKeyTrue(tableId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
    
    @Override
    public void deleteByTableId(UUID tableId) {
        jpaRepository.deleteByTableId(tableId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsById(UUID id) {
        return jpaRepository.existsById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByTableIdAndName(UUID tableId, String name) {
        return jpaRepository.existsByTableIdAndName(tableId, name);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Integer findMaxOrderIndexByTableId(UUID tableId) {
        Integer maxIndex = jpaRepository.findMaxOrderIndexByTableId(tableId);
        return maxIndex != null ? maxIndex : 0;
    }
    
    @Override
    public List<Column> saveAll(List<Column> columns) {
        List<ColumnEntity> entities = columns.stream()
                .map(mapper::toEntity)
                .collect(Collectors.toList());
        
        List<ColumnEntity> savedEntities = jpaRepository.saveAll(entities);
        
        return savedEntities.stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public void deleteAllById(List<UUID> ids) {
        jpaRepository.deleteAllById(ids);
    }
}