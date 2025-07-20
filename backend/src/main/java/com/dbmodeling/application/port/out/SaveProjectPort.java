package com.dbmodeling.application.port.out;

import com.dbmodeling.domain.model.Project;
import java.util.UUID;

/**
 * 프로젝트 저장 아웃바운드 포트
 */
public interface SaveProjectPort {
    
    /**
     * 프로젝트 저장
     */
    Project saveProject(Project project);
    
    /**
     * 프로젝트 삭제
     */
    void deleteProject(UUID projectId);
}