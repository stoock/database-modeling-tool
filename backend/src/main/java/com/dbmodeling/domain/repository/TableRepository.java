package com.dbmodeling.domain.repository;

import com.dbmodeling.domain.model.Table;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 테이블 리포지토리 인터페이스
 * 테이블 도메인 모델의 영속성을 담당하는 포트
 */
public interface TableRepository {
    
    /**
     * 테이블 저장
     */
    Table save(Table table);
    
    /**
     * ID로 테이블 조회
     */
    Optional<Table> findById(UUID id);
    
    /**
     * 프로젝트 ID로 테이블 목록 조회
     */
    List<Table> findByProjectId(UUID projectId);
    
    /**
     * 프로젝트 내에서 이름으로 테이블 조회
     */
    Optional<Table> findByProjectIdAndName(UUID projectId, String name);
    
    /**
     * 테이블 삭제
     */
    void deleteById(UUID id);
    
    /**
     * 프로젝트의 모든 테이블 삭제
     */
    void deleteByProjectId(UUID projectId);
    
    /**
     * 테이블 존재 여부 확인
     */
    boolean existsById(UUID id);
    
    /**
     * 프로젝트 내 테이블 이름 중복 확인
     */
    boolean existsByProjectIdAndName(UUID projectId, String name);
}