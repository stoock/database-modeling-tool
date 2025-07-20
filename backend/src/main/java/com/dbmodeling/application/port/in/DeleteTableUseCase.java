package com.dbmodeling.application.port.in;

import java.util.UUID;

/**
 * 테이블 삭제 유스케이스
 */
public interface DeleteTableUseCase {
    
    /**
     * 테이블 삭제
     * 
     * @param id 삭제할 테이블 ID
     */
    void deleteTable(UUID id);
}