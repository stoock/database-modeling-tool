package com.dbmodeling.application.port.in;

import com.dbmodeling.domain.model.Project;
import java.util.List;
import java.util.UUID;

/**
 * 프로젝트 조회 유스케이스
 */
public interface GetProjectUseCase {
    
    /**
     * ID로 프로젝트 조회
     * 
     * @param id 프로젝트 ID
     * @return 프로젝트
     */
    Project getProjectById(UUID id);
    
    /**
     * 모든 프로젝트 조회
     * 
     * @return 프로젝트 목록
     */
    List<Project> getAllProjects();
}