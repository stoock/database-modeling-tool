package com.dbmodeling.application.port.in;

import com.dbmodeling.domain.model.Project;
import java.util.UUID;

/**
 * 프로젝트 수정 유스케이스
 */
public interface UpdateProjectUseCase {
    
    /**
     * 프로젝트 정보 수정
     * 
     * @param command 프로젝트 수정 명령
     * @return 수정된 프로젝트
     */
    Project updateProject(UpdateProjectCommand command);
    
    /**
     * 프로젝트 수정 명령 객체
     */
    record UpdateProjectCommand(
        UUID id,
        String name,
        String description
    ) {
        public UpdateProjectCommand {
            if (id == null) {
                throw new IllegalArgumentException("프로젝트 ID는 필수입니다");
            }
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("프로젝트 이름은 필수입니다");
            }
        }
    }
}