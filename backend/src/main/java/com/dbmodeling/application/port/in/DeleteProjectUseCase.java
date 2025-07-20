package com.dbmodeling.application.port.in;

import java.util.UUID;

/**
 * 프로젝트 삭제 유스케이스
 */
public interface DeleteProjectUseCase {
    
    /**
     * 프로젝트 삭제
     * 
     * @param id 삭제할 프로젝트 ID
     */
    void deleteProject(UUID id);
}