package com.dbmodeling.application.port.in;

import com.dbmodeling.domain.model.Table;
import java.util.UUID;

/**
 * 테이블 생성 유스케이스
 */
public interface CreateTableUseCase {
    
    /**
     * 새 테이블 생성
     * 
     * @param command 테이블 생성 명령
     * @return 생성된 테이블
     */
    Table createTable(CreateTableCommand command);
    
    /**
     * 테이블 생성 명령 객체
     */
    record CreateTableCommand(
        UUID projectId,
        String name,
        String description,
        Integer positionX,
        Integer positionY
    ) {
        public CreateTableCommand {
            if (projectId == null) {
                throw new IllegalArgumentException("프로젝트 ID는 필수입니다");
            }
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("테이블 이름은 필수입니다");
            }
        }
    }
}