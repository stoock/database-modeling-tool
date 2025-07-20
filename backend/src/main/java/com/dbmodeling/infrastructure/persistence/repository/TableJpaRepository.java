package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.infrastructure.persistence.entity.TableEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 테이블 JPA 리포지토리
 */
@Repository
public interface TableJpaRepository extends JpaRepository<TableEntity, UUID> {
    
    /**
     * 프로젝트 ID로 테이블 목록 조회
     */
    List<TableEntity> findByProjectId(UUID projectId);
    
    /**
     * 프로젝트 내에서 이름으로 테이블 조회
     */
    Optional<TableEntity> findByProjectIdAndName(UUID projectId, String name);
    
    /**
     * 프로젝트의 모든 테이블 삭제
     */
    void deleteByProjectId(UUID projectId);
    
    /**
     * 프로젝트 내 테이블 이름 중복 확인
     */
    boolean existsByProjectIdAndName(UUID projectId, String name);
    
    /**
     * 테이블과 연관된 컬럼을 함께 조회 (N+1 문제 방지)
     */
    @Query("SELECT t FROM TableEntity t " +
           "LEFT JOIN FETCH t.columns c " +
           "WHERE t.id = :tableId")
    Optional<TableEntity> findByIdWithColumns(@Param("tableId") UUID tableId);
    
    /**
     * 테이블과 연관된 인덱스를 함께 조회 (N+1 문제 방지)
     */
    @Query("SELECT t FROM TableEntity t " +
           "LEFT JOIN FETCH t.indexes i " +
           "WHERE t.id = :tableId")
    Optional<TableEntity> findByIdWithIndexes(@Param("tableId") UUID tableId);
    
    /**
     * 프로젝트의 모든 테이블과 컬럼을 함께 조회
     */
    @Query("SELECT DISTINCT t FROM TableEntity t " +
           "LEFT JOIN FETCH t.columns " +
           "WHERE t.project.id = :projectId")
    List<TableEntity> findByProjectIdWithColumns(@Param("projectId") UUID projectId);
    
    /**
     * 프로젝트의 모든 테이블과 인덱스를 함께 조회
     */
    @Query("SELECT DISTINCT t FROM TableEntity t " +
           "LEFT JOIN FETCH t.indexes " +
           "WHERE t.project.id = :projectId")
    List<TableEntity> findByProjectIdWithIndexes(@Param("projectId") UUID projectId);
}