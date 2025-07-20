package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.infrastructure.persistence.entity.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * 프로젝트 JPA 리포지토리
 */
@Repository
public interface ProjectJpaRepository extends JpaRepository<ProjectEntity, UUID> {
    
    /**
     * 이름으로 프로젝트 조회
     */
    Optional<ProjectEntity> findByName(String name);
    
    /**
     * 이름 중복 확인
     */
    boolean existsByName(String name);
}