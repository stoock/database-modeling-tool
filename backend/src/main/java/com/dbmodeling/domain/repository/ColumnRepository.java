package com.dbmodeling.domain.repository;

import com.dbmodeling.domain.model.Column;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 컬럼 리포지토리 인터페이스
 * 컬럼 도메인 모델의 영속성을 담당하는 포트
 */
public interface ColumnRepository {
    
    /**
     * 컬럼 저장
     */
    Column save(Column column);
    
    /**
     * ID로 컬럼 조회
     */
    Optional<Column> findById(UUID id);
    
    /**
     * 테이블 ID로 컬럼 목록 조회 (순서대로)
     */
    List<Column> findByTableIdOrderByOrderIndex(UUID tableId);
    
    /**
     * 테이블 내에서 이름으로 컬럼 조회
     */
    Optional<Column> findByTableIdAndName(UUID tableId, String name);
    
    /**
     * 테이블의 기본키 컬럼들 조회
     */
    List<Column> findByTableIdAndIsPrimaryKeyTrue(UUID tableId);
    
    /**
     * 컬럼 삭제
     */
    void deleteById(UUID id);
    
    /**
     * 테이블의 모든 컬럼 삭제
     */
    void deleteByTableId(UUID tableId);
    
    /**
     * 컬럼 존재 여부 확인
     */
    boolean existsById(UUID id);
    
    /**
     * 테이블 내 컬럼 이름 중복 확인
     */
    boolean existsByTableIdAndName(UUID tableId, String name);
    
    /**
     * 테이블의 다음 순서 인덱스 조회
     */
    Integer findMaxOrderIndexByTableId(UUID tableId);
}