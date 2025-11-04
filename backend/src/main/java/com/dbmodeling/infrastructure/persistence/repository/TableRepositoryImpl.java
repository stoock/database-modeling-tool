package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.domain.model.Table;
import com.dbmodeling.domain.repository.TableRepository;
import com.dbmodeling.infrastructure.persistence.entity.ProjectEntity;
import com.dbmodeling.infrastructure.persistence.entity.TableEntity;
import com.dbmodeling.infrastructure.persistence.mapper.TableMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 테이블 리포지토리 구현체
 */
@Repository
@Transactional
public class TableRepositoryImpl implements TableRepository {
    
    private final TableJpaRepository jpaRepository;
    private final ProjectJpaRepository projectJpaRepository;
    private final TableMapper mapper;
    
    public TableRepositoryImpl(TableJpaRepository jpaRepository, 
                              ProjectJpaRepository projectJpaRepository,
                              TableMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.projectJpaRepository = projectJpaRepository;
        this.mapper = mapper;
    }
    
    @Override
    public Table save(Table table) {
        TableEntity entity;
        
        if (table.getId() != null) {
            // ID가 있으면 기존 엔티티 조회 시도
            Optional<TableEntity> existingEntity = jpaRepository.findById(table.getId());
            if (existingEntity.isPresent()) {
                // 기존 엔티티 업데이트 - 기존 엔티티를 가져와서 업데이트
                entity = existingEntity.get();
                mapper.updateEntity(entity, table);
                
                // 프로젝트 연관관계 설정 (필요시)
                if (table.getProjectId() != null && !table.getProjectId().equals(entity.getProject().getId())) {
                    ProjectEntity project = projectJpaRepository.findById(table.getProjectId())
                            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + table.getProjectId()));
                    entity.setProject(project);
                }
                
                entity = jpaRepository.saveAndFlush(entity);
            } else {
                // ID는 있지만 DB에 없으면 새 엔티티 생성
                entity = mapper.toEntity(table);
                // ID를 유지 (도메인에서 생성한 UUID 사용)
                
                // 프로젝트 연관관계 설정
                if (table.getProjectId() != null) {
                    ProjectEntity project = projectJpaRepository.findById(table.getProjectId())
                            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + table.getProjectId()));
                    entity.setProject(project);
                }
                
                entity = jpaRepository.save(entity);
            }
        } else {
            // 새 엔티티 생성
            entity = mapper.toEntity(table);
            
            // 프로젝트 연관관계 설정
            if (table.getProjectId() != null) {
                ProjectEntity project = projectJpaRepository.findById(table.getProjectId())
                        .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + table.getProjectId()));
                entity.setProject(project);
            }
            
            entity = jpaRepository.save(entity);
        }
        
        return mapper.toDomain(entity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Table> findById(UUID id) {
        // 기본 테이블 정보만 조회 (지연 로딩으로 컬럼과 인덱스는 필요시 로딩)
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Table> findByProjectId(UUID projectId) {
        // 기본 테이블 정보만 조회 (지연 로딩으로 컬럼과 인덱스는 필요시 로딩)
        return jpaRepository.findByProjectId(projectId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Table> findByProjectIdAndName(UUID projectId, String name) {
        return jpaRepository.findByProjectIdAndName(projectId, name)
                .map(mapper::toDomain);
    }
    
    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
    
    @Override
    public void deleteByProjectId(UUID projectId) {
        jpaRepository.deleteByProjectId(projectId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsById(UUID id) {
        return jpaRepository.existsById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByProjectIdAndName(UUID projectId, String name) {
        return jpaRepository.existsByProjectIdAndName(projectId, name);
    }
}