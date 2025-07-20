package com.dbmodeling.application.port.in;

import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.MSSQLDataType;
import java.util.List;
import java.util.UUID;

/**
 * 컬럼 관리 유스케이스
 */
public interface ManageColumnUseCase {
    
    /**
     * 새 컬럼 추가
     * 
     * @param command 컬럼 추가 명령
     * @return 추가된 컬럼
     */
    Column addColumn(AddColumnCommand command);
    
    /**
     * 컬럼 정보 수정
     * 
     * @param command 컬럼 수정 명령
     * @return 수정된 컬럼
     */
    Column updateColumn(UpdateColumnCommand command);
    
    /**
     * 컬럼 삭제
     * 
     * @param id 삭제할 컬럼 ID
     */
    void deleteColumn(UUID id);
    
    /**
     * 테이블의 컬럼 목록 조회
     * 
     * @param tableId 테이블 ID
     * @return 컬럼 목록 (순서대로)
     */
    List<Column> getColumnsByTableId(UUID tableId);
    
    /**
     * 컬럼 추가 명령 객체
     */
    record AddColumnCommand(
        UUID tableId,
        String name,
        String description,
        MSSQLDataType dataType,
        Integer maxLength,
        Integer precision,
        Integer scale,
        Boolean isNullable,
        Boolean isPrimaryKey,
        Boolean isIdentity,
        Integer identitySeed,
        Integer identityIncrement,
        String defaultValue
    ) {
        public AddColumnCommand {
            if (tableId == null) {
                throw new IllegalArgumentException("테이블 ID는 필수입니다");
            }
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("컬럼 이름은 필수입니다");
            }
            if (dataType == null) {
                throw new IllegalArgumentException("데이터 타입은 필수입니다");
            }
        }
    }
    
    /**
     * 컬럼 수정 명령 객체
     */
    record UpdateColumnCommand(
        UUID id,
        String name,
        String description,
        MSSQLDataType dataType,
        Integer maxLength,
        Integer precision,
        Integer scale,
        Boolean isNullable,
        Boolean isPrimaryKey,
        Boolean isIdentity,
        Integer identitySeed,
        Integer identityIncrement,
        String defaultValue
    ) {
        public UpdateColumnCommand {
            if (id == null) {
                throw new IllegalArgumentException("컬럼 ID는 필수입니다");
            }
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("컬럼 이름은 필수입니다");
            }
            if (dataType == null) {
                throw new IllegalArgumentException("데이터 타입은 필수입니다");
            }
        }
    }
}