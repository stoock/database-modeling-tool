package com.dbmodeling.application.port.in;

import com.dbmodeling.domain.model.Table;
import java.util.UUID;

/**
 * 테이블 수정 유스케이스
 */
public interface UpdateTableUseCase {
    
    /**
     * 테이블 정보 수정
     * 
     * @param command 테이블 수정 명령
     * @return 수정된 테이블
     */
    Table updateTable(UpdateTableCommand command);
    
    /**
     * 테이블 위치 수정
     * 
     * @param command 테이블 위치 수정 명령
     * @return 수정된 테이블
     */
    Table updateTablePosition(UpdateTablePositionCommand command);
    
    /**
     * 테이블 수정 명령 객체
     */
    record UpdateTableCommand(
        UUID id,
        String name,
        String description
    ) {
        public UpdateTableCommand {
            if (id == null) {
                throw new IllegalArgumentException("테이블 ID는 필수입니다");
            }
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("테이블 이름은 필수입니다");
            }
        }
    }
    
    /**
     * 테이블 위치 수정 명령 객체
     */
    record UpdateTablePositionCommand(
        UUID id,
        Integer positionX,
        Integer positionY
    ) {
        public UpdateTablePositionCommand {
            if (id == null) {
                throw new IllegalArgumentException("테이블 ID는 필수입니다");
            }
        }
    }
}