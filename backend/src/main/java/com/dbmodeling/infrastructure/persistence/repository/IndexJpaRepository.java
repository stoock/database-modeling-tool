package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.infrastructure.persistence.entity.IndexEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 인덱스 JPA 리포지토리
 */
@Repository
public interface IndexJpaRepository extends JpaRepository<IndexEntity, UUID> {
    
    /**
     * 테이블 ID로 인덱스 목록 조회
     */
    List<IndexEntity> findByTableId(UUID tableId);
    
    /**
     * 테이블 내에서 이름으로 인덱스 조회
     */
    Optional<IndexEntity> findByTableIdAndName(UUID tableId, String name);
    
    /**
     * 테이블의 특정 타입 인덱스 조회
     */
    Optional<IndexEntity> findByTableIdAndType(UUID tableId, String type);
    
    /**
     * 테이블의 모든 인덱스 삭제
     */
    void deleteByTableId(UUID tableId);
    
    /**
     * 테이블 내 인덱스 이름 중복 확인
     */
    boolean existsByTableIdAndName(UUID tableId, String name);
    
    /**
     * 테이블에 특정 타입 인덱스 존재 여부 확인
     */
    boolean existsByTableIdAndType(UUID tableId, String type);
}