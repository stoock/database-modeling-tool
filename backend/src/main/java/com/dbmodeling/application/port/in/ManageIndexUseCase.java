package com.dbmodeling.application.port.in;

import com.dbmodeling.domain.model.Index;
import java.util.List;
import java.util.UUID;

/**
 * 인덱스 관리 유스케이스
 */
public interface ManageIndexUseCase {
    
    /**
     * 새 인덱스 생성
     * 
     * @param command 인덱스 생성 명령
     * @return 생성된 인덱스
     */
    Index createIndex(CreateIndexCommand command);
    
    /**
     * 인덱스 정보 수정
     * 
     * @param command 인덱스 수정 명령
     * @return 수정된 인덱스
     */
    Index updateIndex(UpdateIndexCommand command);
    
    /**
     * 인덱스 삭제
     * 
     * @param id 삭제할 인덱스 ID
     */
    void deleteIndex(UUID id);
    
    /**
     * 테이블의 인덱스 목록 조회
     * 
     * @param tableId 테이블 ID
     * @return 인덱스 목록
     */
    List<Index> getIndexesByTableId(UUID tableId);
    
    /**
     * 인덱스 생성 명령 객체
     */
    record CreateIndexCommand(
        UUID tableId,
        String name,
        Index.IndexType type,
        Boolean isUnique,
        List<IndexColumnSpec> columns
    ) {
        public CreateIndexCommand {
            if (tableId == null) {
                throw new IllegalArgumentException("테이블 ID는 필수입니다");
            }
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("인덱스 이름은 필수입니다");
            }
            if (type == null) {
                throw new IllegalArgumentException("인덱스 타입은 필수입니다");
            }
            if (columns == null || columns.isEmpty()) {
                throw new IllegalArgumentException("인덱스 컬럼은 최소 하나 이상 필요합니다");
            }
        }
    }
    
    /**
     * 인덱스 수정 명령 객체
     */
    record UpdateIndexCommand(
        UUID id,
        String name,
        Index.IndexType type,
        Boolean isUnique,
        List<IndexColumnSpec> columns
    ) {
        public UpdateIndexCommand {
            if (id == null) {
                throw new IllegalArgumentException("인덱스 ID는 필수입니다");
            }
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("인덱스 이름은 필수입니다");
            }
            if (type == null) {
                throw new IllegalArgumentException("인덱스 타입은 필수입니다");
            }
            if (columns == null || columns.isEmpty()) {
                throw new IllegalArgumentException("인덱스 컬럼은 최소 하나 이상 필요합니다");
            }
        }
    }
    
    /**
     * 인덱스 컬럼 명세
     */
    record IndexColumnSpec(
        UUID columnId,
        Index.SortOrder order
    ) {
        public IndexColumnSpec {
            if (columnId == null) {
                throw new IllegalArgumentException("컬럼 ID는 필수입니다");
            }
            if (order == null) {
                order = Index.SortOrder.ASC;
            }
        }
        
        public IndexColumnSpec(UUID columnId) {
            this(columnId, Index.SortOrder.ASC);
        }
    }
}