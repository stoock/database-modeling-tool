package com.dbmodeling.application.port.in;

import com.dbmodeling.domain.model.Table;
import java.util.List;
import java.util.UUID;

/**
 * 테이블 조회 유스케이스
 */
public interface GetTableUseCase {
    
    /**
     * ID로 테이블 조회
     * 
     * @param id 테이블 ID
     * @return 테이블
     */
    Table getTableById(UUID id);
    
    /**
     * 프로젝트의 모든 테이블 조회
     * 
     * @param projectId 프로젝트 ID
     * @return 테이블 목록
     */
    List<Table> getTablesByProjectId(UUID projectId);
}