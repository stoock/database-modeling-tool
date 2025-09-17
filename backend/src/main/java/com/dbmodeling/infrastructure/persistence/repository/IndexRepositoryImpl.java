package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.domain.model.Index;
import com.dbmodeling.domain.repository.IndexRepository;
import com.dbmodeling.infrastructure.persistence.entity.IndexEntity;
import com.dbmodeling.infrastructure.persistence.entity.TableEntity;
import com.dbmodeling.infrastructure.persistence.mapper.IndexMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 인덱스 리포지토리 구현체
 */
@Repository
@Transactional
public class IndexRepositoryImpl implements IndexRepository {
    
    private final IndexJpaRepository jpaRepository;
    private final TableJpaRepository tableJpaRepository;
    private final IndexMapper mapper;
    
    public IndexRepositoryImpl(IndexJpaRepository jpaRepository,
                              TableJpaRepository tableJpaRepository,
                              IndexMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.tableJpaRepository = tableJpaRepository;
        this.mapper = mapper;
    }
    
    @Override
    public Index save(Index index) {
        IndexEntity entity;
        
        if (index.getId() != null) {
            // ID가 있으면 기존 엔티티 조회 시도
            Optional<IndexEntity> existingEntity = jpaRepository.findById(index.getId());
            if (existingEntity.isPresent()) {
                // 기존 엔티티 업데이트
                entity = existingEntity.get();
                mapper.updateEntity(entity, index);
            } else {
                // ID는 있지만 DB에 없으면 새 엔티티 생성
                entity = mapper.toEntity(index);
                
                // 테이블 연관관계 설정
                if (index.getTableId() != null) {
                    TableEntity table = tableJpaRepository.findById(index.getTableId())
                            .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다: " + index.getTableId()));
                    entity.setTable(table);
                }
            }
        } else {
            // 새 엔티티 생성
            entity = mapper.toEntity(index);
            
            // 테이블 연관관계 설정
            if (index.getTableId() != null) {
                TableEntity table = tableJpaRepository.findById(index.getTableId())
                        .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다: " + index.getTableId()));
                entity.setTable(table);
            }
        }
        
        IndexEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Index> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Index> findByTableId(UUID tableId) {
        return jpaRepository.findByTableId(tableId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Index> findByTableIdAndName(UUID tableId, String name) {
        return jpaRepository.findByTableIdAndName(tableId, name)
                .map(mapper::toDomain);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Index> findByTableIdAndType(UUID tableId, Index.IndexType type) {
        return jpaRepository.findByTableIdAndType(tableId, type.name())
                .map(mapper::toDomain);
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
    public boolean existsByTableIdAndType(UUID tableId, Index.IndexType type) {
        return jpaRepository.existsByTableIdAndType(tableId, type.name());
    }
    
    @Override
    public List<Index> saveAll(List<Index> indexes) {
        List<IndexEntity> entities = indexes.stream()
                .map(mapper::toEntity)
                .collect(Collectors.toList());
        
        List<IndexEntity> savedEntities = jpaRepository.saveAll(entities);
        
        return savedEntities.stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    public void deleteAllById(List<UUID> ids) {
        jpaRepository.deleteAllById(ids);
    }
}