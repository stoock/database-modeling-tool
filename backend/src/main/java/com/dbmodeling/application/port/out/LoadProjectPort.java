package com.dbmodeling.application.port.out;

import com.dbmodeling.domain.model.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 프로젝트 로드 아웃바운드 포트
 */
public interface LoadProjectPort {
    
    /**
     * ID로 프로젝트 조회
     */
    Optional<Project> loadProject(UUID projectId);
    
    /**
     * 모든 프로젝트 조회
     */
    List<Project> loadAllProjects();
    
    /**
     * 이름으로 프로젝트 조회
     */
    Optional<Project> loadProjectByName(String name);
    
    /**
     * 프로젝트 존재 여부 확인
     */
    boolean existsProject(UUID projectId);
    
    /**
     * 이름 중복 확인
     */
    boolean existsProjectByName(String name);
}