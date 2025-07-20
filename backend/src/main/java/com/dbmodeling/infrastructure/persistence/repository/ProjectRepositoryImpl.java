package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.infrastructure.persistence.entity.ProjectEntity;
import com.dbmodeling.infrastructure.persistence.mapper.ProjectMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 프로젝트 리포지토리 구현체
 */
@Repository
@Transactional
public class ProjectRepositoryImpl implements ProjectRepository {
    
    private final ProjectJpaRepository jpaRepository;
    private final ProjectMapper mapper;
    
    public ProjectRepositoryImpl(ProjectJpaRepository jpaRepository, ProjectMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }
    
    @Override
    public Project save(Project project) {
        ProjectEntity entity;
        
        if (project.getId() != null) {
            // ID가 있으면 기존 엔티티 조회 시도
            Optional<ProjectEntity> existingEntity = jpaRepository.findById(project.getId());
            if (existingEntity.isPresent()) {
                // 기존 엔티티 업데이트 - 기존 엔티티를 가져와서 업데이트
                entity = existingEntity.get();
                mapper.updateEntity(entity, project);
                entity = jpaRepository.saveAndFlush(entity);
            } else {
                // ID는 있지만 DB에 없으면 새 엔티티 생성
                entity = mapper.toEntity(project);
                entity.setId(null); // 새 엔티티임을 명시
                entity = jpaRepository.save(entity);
            }
        } else {
            // 새 엔티티 생성
            entity = mapper.toEntity(project);
            entity = jpaRepository.save(entity);
        }
        
        return mapper.toDomain(entity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Project> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Project> findAll() {
        return jpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Project> findByName(String name) {
        return jpaRepository.findByName(name)
                .map(mapper::toDomain);
    }
    
    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsById(UUID id) {
        return jpaRepository.existsById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return jpaRepository.existsByName(name);
    }
}