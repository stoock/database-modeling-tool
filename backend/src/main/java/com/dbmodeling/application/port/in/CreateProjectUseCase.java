package com.dbmodeling.application.port.in;

import com.dbmodeling.domain.model.Project;

/**
 * 프로젝트 생성 유스케이스
 */
public interface CreateProjectUseCase {
    
    /**
     * 새 프로젝트 생성
     * 
     * @param command 프로젝트 생성 명령
     * @return 생성된 프로젝트
     */
    Project createProject(CreateProjectCommand command);
    
    /**
     * 프로젝트 생성 명령 객체
     */
    record CreateProjectCommand(
        String name,
        String description
    ) {
        public CreateProjectCommand {
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("프로젝트 이름은 필수입니다");
            }
        }
    }
}