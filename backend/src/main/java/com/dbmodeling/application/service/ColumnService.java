package com.dbmodeling.application.service;

import com.dbmodeling.application.port.in.ManageColumnUseCase;
import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.TableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 컬럼 애플리케이션 서비스
 * 컬럼 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@Transactional
public class ColumnService implements ManageColumnUseCase {
    
    private final ColumnRepository columnRepository;
    private final TableRepository tableRepository;
    
    public ColumnService(ColumnRepository columnRepository, TableRepository tableRepository) {
        this.columnRepository = columnRepository;
        this.tableRepository = tableRepository;
    }
    
    @Override
    public Column addColumn(AddColumnCommand command) {
        // 테이블 존재 확인
        if (!tableRepository.existsById(command.tableId())) {
            throw new IllegalArgumentException("테이블을 찾을 수 없습니다: " + command.tableId());
        }
        
        // 테이블 내 컬럼 이름 중복 검사
        if (columnRepository.existsByTableIdAndName(command.tableId(), command.name())) {
            throw new IllegalArgumentException("이미 존재하는 컬럼 이름입니다: " + command.name());
        }
        
        // 다음 순서 인덱스 계산
        Integer maxOrderIndex = columnRepository.findMaxOrderIndexByTableId(command.tableId());
        int nextOrderIndex = (maxOrderIndex != null) ? maxOrderIndex + 1 : 0;
        
        // 새 컬럼 생성
        Column column = new Column(command.name(), command.dataType(), nextOrderIndex);
        column.setTableId(command.tableId());
        column.setDescription(command.description());
        
        // 데이터 타입 속성 설정
        column.setDataTypeProperties(command.maxLength(), command.precision(), command.scale());
        
        // 기본값 및 제약조건 설정
        if (command.isNullable() != null) {
            column.setNullableWithValidation(command.isNullable());
        }
        if (command.isPrimaryKey() != null) {
            column.setPrimaryKey(command.isPrimaryKey());
        }
        if (command.isIdentity() != null) {
            column.setIdentityProperties(command.isIdentity(), command.identitySeed(), command.identityIncrement());
        }
        if (command.defaultValue() != null) {
            column.setDefaultValue(command.defaultValue());
        }
        
        // 저장 및 반환
        return columnRepository.save(column);
    }
    
    @Override
    public Column updateColumn(UpdateColumnCommand command) {
        // 기존 컬럼 조회
        Column column = columnRepository.findById(command.id())
            .orElseThrow(() -> new IllegalArgumentException("컬럼을 찾을 수 없습니다: " + command.id()));
        
        // 이름 변경 시 중복 검사 (자기 자신 제외)
        if (!column.getName().equals(command.name()) && 
            columnRepository.existsByTableIdAndName(column.getTableId(), command.name())) {
            throw new IllegalArgumentException("이미 존재하는 컬럼 이름입니다: " + command.name());
        }
        
        // 컬럼 정보 업데이트
        column.updateColumn(command.name(), command.description(), command.dataType());
        
        // 데이터 타입 속성 설정
        column.setDataTypeProperties(command.maxLength(), command.precision(), command.scale());
        
        // 기본값 및 제약조건 설정
        if (command.isNullable() != null) {
            column.setNullableWithValidation(command.isNullable());
        }
        if (command.isPrimaryKey() != null) {
            column.setPrimaryKey(command.isPrimaryKey());
        }
        if (command.isIdentity() != null) {
            column.setIdentityProperties(command.isIdentity(), command.identitySeed(), command.identityIncrement());
        }
        if (command.defaultValue() != null) {
            column.setDefaultValue(command.defaultValue());
        }
        
        // 저장 및 반환
        return columnRepository.save(column);
    }
    
    @Override
    public void deleteColumn(UUID id) {
        // 컬럼 존재 확인
        if (!columnRepository.existsById(id)) {
            throw new IllegalArgumentException("컬럼을 찾을 수 없습니다: " + id);
        }
        
        // 컬럼 삭제
        columnRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Column> getColumnsByTableId(UUID tableId) {
        return columnRepository.findByTableIdOrderByOrderIndex(tableId);
    }
    
    /**
     * 컬럼 순서 변경
     * 
     * @param columnId 컬럼 ID
     * @param newOrderIndex 새로운 순서 인덱스
     * @return 수정된 컬럼
     */
    public Column updateColumnOrder(UUID columnId, Integer newOrderIndex) {
        // 기존 컬럼 조회
        Column column = columnRepository.findById(columnId)
            .orElseThrow(() -> new IllegalArgumentException("컬럼을 찾을 수 없습니다: " + columnId));
        
        // 같은 테이블의 모든 컬럼 조회
        List<Column> columns = columnRepository.findByTableIdOrderByOrderIndex(column.getTableId());
        
        // 순서 재정렬
        reorderColumns(columns, column, newOrderIndex);
        
        // 모든 컬럼 저장
        columns.forEach(columnRepository::save);
        
        return column;
    }
    
    /**
     * 컬럼 목록의 순서를 재정렬하는 헬퍼 메서드
     */
    private void reorderColumns(List<Column> columns, Column targetColumn, Integer newOrderIndex) {
        int oldIndex = targetColumn.getOrderIndex();
        
        if (newOrderIndex < 0 || newOrderIndex >= columns.size()) {
            throw new IllegalArgumentException("잘못된 순서 인덱스입니다: " + newOrderIndex);
        }
        
        if (oldIndex == newOrderIndex) {
            return; // 순서 변경 없음
        }
        
        // 순서 재정렬
        if (oldIndex < newOrderIndex) {
            // 뒤로 이동: 중간 컬럼들을 앞으로 이동
            for (Column col : columns) {
                int currentOrder = col.getOrderIndex();
                if (currentOrder > oldIndex && currentOrder <= newOrderIndex) {
                    col.setOrderIndex(currentOrder - 1);
                }
            }
        } else {
            // 앞으로 이동: 중간 컬럼들을 뒤로 이동
            for (Column col : columns) {
                int currentOrder = col.getOrderIndex();
                if (currentOrder >= newOrderIndex && currentOrder < oldIndex) {
                    col.setOrderIndex(currentOrder + 1);
                }
            }
        }
        
        // 대상 컬럼의 순서 설정
        targetColumn.setOrderIndex(newOrderIndex);
    }
    
    /**
     * 컬럼 복사
     * 
     * @param columnId 복사할 컬럼 ID
     * @param newName 새 컬럼 이름
     * @return 복사된 컬럼
     */
    public Column copyColumn(UUID columnId, String newName) {
        // 원본 컬럼 조회
        Column originalColumn = columnRepository.findById(columnId)
            .orElseThrow(() -> new IllegalArgumentException("컬럼을 찾을 수 없습니다: " + columnId));
        
        // 이름 중복 검사
        if (columnRepository.existsByTableIdAndName(originalColumn.getTableId(), newName)) {
            throw new IllegalArgumentException("이미 존재하는 컬럼 이름입니다: " + newName);
        }
        
        // 다음 순서 인덱스 계산
        Integer maxOrderIndex = columnRepository.findMaxOrderIndexByTableId(originalColumn.getTableId());
        int nextOrderIndex = (maxOrderIndex != null) ? maxOrderIndex + 1 : 0;
        
        // 새 컬럼 생성 (원본 컬럼의 속성 복사)
        Column newColumn = new Column(newName, originalColumn.getDataType(), nextOrderIndex);
        newColumn.setTableId(originalColumn.getTableId());
        newColumn.setDescription(originalColumn.getDescription());
        newColumn.setDataTypeProperties(
            originalColumn.getMaxLength(), 
            originalColumn.getPrecision(), 
            originalColumn.getScale()
        );
        newColumn.setNullableWithValidation(originalColumn.isNullable());
        newColumn.setPrimaryKey(false); // 기본키는 복사하지 않음
        newColumn.setIdentityProperties(
            originalColumn.isIdentity(), 
            originalColumn.getIdentitySeed(), 
            originalColumn.getIdentityIncrement()
        );
        newColumn.setDefaultValue(originalColumn.getDefaultValue());
        
        // 저장 및 반환
        return columnRepository.save(newColumn);
    }
    
    /**
     * 테이블의 기본키 컬럼들 조회
     * 
     * @param tableId 테이블 ID
     * @return 기본키 컬럼 목록
     */
    @Transactional(readOnly = true)
    public List<Column> getPrimaryKeyColumns(UUID tableId) {
        return columnRepository.findByTableIdAndIsPrimaryKeyTrue(tableId);
    }
    
    /**
     * 컬럼 이름으로 조회
     * 
     * @param tableId 테이블 ID
     * @param columnName 컬럼 이름
     * @return 컬럼 (존재하지 않으면 null)
     */
    @Transactional(readOnly = true)
    public Column getColumnByName(UUID tableId, String columnName) {
        return columnRepository.findByTableIdAndName(tableId, columnName).orElse(null);
    }
}