package com.dbmodeling.domain.repository;

import com.dbmodeling.domain.model.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 프로젝트 리포지토리 인터페이스
 * 프로젝트 도메인 모델의 영속성을 담당하는 포트
 */
public interface ProjectRepository {
    
    /**
     * 프로젝트 저장
     */
    Project save(Project project);
    
    /**
     * ID로 프로젝트 조회
     */
    Optional<Project> findById(UUID id);
    
    /**
     * 모든 프로젝트 조회
     */
    List<Project> findAll();
    
    /**
     * 이름으로 프로젝트 조회
     */
    Optional<Project> findByName(String name);
    
    /**
     * 프로젝트 삭제
     */
    void deleteById(UUID id);
    
    /**
     * 프로젝트 존재 여부 확인
     */
    boolean existsById(UUID id);
    
    /**
     * 이름 중복 확인
     */
    boolean existsByName(String name);
}