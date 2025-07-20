package com.dbmodeling.domain.repository;

import com.dbmodeling.domain.model.Index;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 인덱스 리포지토리 인터페이스
 * 인덱스 도메인 모델의 영속성을 담당하는 포트
 */
public interface IndexRepository {
    
    /**
     * 인덱스 저장
     */
    Index save(Index index);
    
    /**
     * ID로 인덱스 조회
     */
    Optional<Index> findById(UUID id);
    
    /**
     * 테이블 ID로 인덱스 목록 조회
     */
    List<Index> findByTableId(UUID tableId);
    
    /**
     * 테이블 내에서 이름으로 인덱스 조회
     */
    Optional<Index> findByTableIdAndName(UUID tableId, String name);
    
    /**
     * 테이블의 클러스터드 인덱스 조회
     */
    Optional<Index> findByTableIdAndType(UUID tableId, Index.IndexType type);
    
    /**
     * 인덱스 삭제
     */
    void deleteById(UUID id);
    
    /**
     * 테이블의 모든 인덱스 삭제
     */
    void deleteByTableId(UUID tableId);
    
    /**
     * 인덱스 존재 여부 확인
     */
    boolean existsById(UUID id);
    
    /**
     * 테이블 내 인덱스 이름 중복 확인
     */
    boolean existsByTableIdAndName(UUID tableId, String name);
    
    /**
     * 테이블에 클러스터드 인덱스 존재 여부 확인
     */
    boolean existsByTableIdAndType(UUID tableId, Index.IndexType type);
}