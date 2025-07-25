package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.infrastructure.persistence.entity.ColumnEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 컬럼 JPA 리포지토리
 */
@Repository
public interface ColumnJpaRepository extends JpaRepository<ColumnEntity, UUID> {
    
    /**
     * 테이블 ID로 컬럼 목록 조회 (순서대로)
     */
    List<ColumnEntity> findByTableIdOrderByOrderIndex(UUID tableId);
    
    /**
     * 테이블 내에서 이름으로 컬럼 조회
     */
    Optional<ColumnEntity> findByTableIdAndName(UUID tableId, String name);
    
    /**
     * 테이블의 기본키 컬럼들 조회
     */
    List<ColumnEntity> findByTableIdAndIsPrimaryKeyTrue(UUID tableId);
    
    /**
     * 테이블의 모든 컬럼 삭제
     */
    void deleteByTableId(UUID tableId);
    
    /**
     * 테이블 내 컬럼 이름 중복 확인
     */
    boolean existsByTableIdAndName(UUID tableId, String name);
    
    /**
     * 테이블의 최대 순서 인덱스 조회
     */
    @Query("SELECT COALESCE(MAX(c.orderIndex), 0) FROM ColumnEntity c WHERE c.table.id = :tableId")
    Integer findMaxOrderIndexByTableId(@Param("tableId") UUID tableId);
    
    /**
     * 테이블 ID 목록으로 모든 컬럼 조회 (배치 처리용)
     * N+1 문제 방지를 위한 fetch join 사용
     */
    @Query("SELECT c FROM ColumnEntity c JOIN FETCH c.table WHERE c.table.id IN :tableIds ORDER BY c.table.id, c.orderIndex")
    List<ColumnEntity> findByTableIdsWithTable(@Param("tableIds") List<UUID> tableIds);
    
    /**
     * 프로젝트의 모든 컬럼 조회 (통계용)
     */
    @Query("SELECT c FROM ColumnEntity c JOIN FETCH c.table t WHERE t.project.id = :projectId ORDER BY t.name, c.orderIndex")
    List<ColumnEntity> findByProjectIdWithTable(@Param("projectId") UUID projectId);
    
    /**
     * 특정 데이터 타입의 컬럼 개수 조회
     */
    @Query("SELECT COUNT(c) FROM ColumnEntity c WHERE c.table.id = :tableId AND c.dataType = :dataType")
    Long countByTableIdAndDataType(@Param("tableId") UUID tableId, @Param("dataType") String dataType);
    
    /**
     * 테이블별 컬럼 개수 조회 (배치)
     */
    @Query("SELECT c.table.id, COUNT(c) FROM ColumnEntity c WHERE c.table.id IN :tableIds GROUP BY c.table.id")
    List<Object[]> countColumnsByTableIds(@Param("tableIds") List<UUID> tableIds);
}