package com.dbmodeling.application.service;

import com.dbmodeling.application.port.in.*;
import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.Table;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.repository.TableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 테이블 애플리케이션 서비스
 * 테이블 관련 유스케이스들을 구현
 */
@Service
@Transactional
public class TableService implements 
    CreateTableUseCase, 
    UpdateTableUseCase, 
    GetTableUseCase, 
    DeleteTableUseCase,
    ManageColumnUseCase {
    
    private final TableRepository tableRepository;
    private final ColumnRepository columnRepository;
    private final ProjectRepository projectRepository;
    
    public TableService(TableRepository tableRepository, 
                       ColumnRepository columnRepository,
                       ProjectRepository projectRepository) {
        this.tableRepository = tableRepository;
        this.columnRepository = columnRepository;
        this.projectRepository = projectRepository;
    }
    
    @Override
    public Table createTable(CreateTableCommand command) {
        // 프로젝트 존재 확인
        if (!projectRepository.existsById(command.projectId())) {
            throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + command.projectId());
        }
        
        // 프로젝트 내 테이블 이름 중복 검사
        if (tableRepository.existsByProjectIdAndName(command.projectId(), command.name())) {
            throw new IllegalArgumentException("이미 존재하는 테이블 이름입니다: " + command.name());
        }
        
        // 새 테이블 생성
        Table table = new Table(command.name(), command.description());
        table.setProjectId(command.projectId());
        
        if (command.positionX() != null) {
            table.setPositionX(command.positionX());
        }
        if (command.positionY() != null) {
            table.setPositionY(command.positionY());
        }
        
        // 저장 및 반환
        return tableRepository.save(table);
    }
    
    @Override
    public Table updateTable(UpdateTableCommand command) {
        // 기존 테이블 조회
        Table table = tableRepository.findById(command.id())
            .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다: " + command.id()));
        
        // 이름 변경 시 중복 검사 (자기 자신 제외)
        if (!table.getName().equals(command.name()) && 
            tableRepository.existsByProjectIdAndName(table.getProjectId(), command.name())) {
            throw new IllegalArgumentException("이미 존재하는 테이블 이름입니다: " + command.name());
        }
        
        // 테이블 정보 업데이트
        table.updateTable(command.name(), command.description());
        
        // 저장 및 반환
        return tableRepository.save(table);
    }
    
    @Override
    public Table updateTablePosition(UpdateTablePositionCommand command) {
        // 기존 테이블 조회
        Table table = tableRepository.findById(command.id())
            .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다: " + command.id()));
        
        // 위치 업데이트
        table.updatePosition(command.positionX(), command.positionY());
        
        // 저장 및 반환
        return tableRepository.save(table);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Table getTableById(UUID id) {
        return tableRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다: " + id));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Table> getTablesByProjectId(UUID projectId) {
        return tableRepository.findByProjectId(projectId);
    }
    
    @Override
    public void deleteTable(UUID id) {
        // 테이블 존재 확인
        if (!tableRepository.existsById(id)) {
            throw new IllegalArgumentException("테이블을 찾을 수 없습니다: " + id);
        }
        
        // 관련 컬럼들 먼저 삭제
        columnRepository.deleteByTableId(id);
        
        // 테이블 삭제
        tableRepository.deleteById(id);
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
}