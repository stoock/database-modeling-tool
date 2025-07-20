package com.dbmodeling.application.service;

import com.dbmodeling.application.port.in.CreateTableUseCase.CreateTableCommand;
import com.dbmodeling.application.port.in.ManageColumnUseCase.AddColumnCommand;
import com.dbmodeling.application.port.in.UpdateTableUseCase.UpdateTableCommand;
import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.MSSQLDataType;
import com.dbmodeling.domain.model.Table;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("테이블 서비스 테스트")
class TableServiceTest {
    
    @Mock
    private TableRepository tableRepository;
    
    @Mock
    private ColumnRepository columnRepository;
    
    @Mock
    private ProjectRepository projectRepository;
    
    @InjectMocks
    private TableService tableService;
    
    private UUID testProjectId;
    private UUID testTableId;
    private Table testTable;
    
    @BeforeEach
    void setUp() {
        testProjectId = UUID.randomUUID();
        testTableId = UUID.randomUUID();
        testTable = new Table("테스트 테이블", "테스트 설명");
        testTable.setId(testTableId);
        testTable.setProjectId(testProjectId);
    }
    
    @Test
    @DisplayName("테이블 생성 - 성공")
    void createTable_Success() {
        // Given
        CreateTableCommand command = new CreateTableCommand(testProjectId, "새 테이블", "새 테이블 설명", 100, 200);
        when(projectRepository.existsById(testProjectId)).thenReturn(true);
        when(tableRepository.existsByProjectIdAndName(testProjectId, "새 테이블")).thenReturn(false);
        when(tableRepository.save(any(Table.class))).thenReturn(testTable);
        
        // When
        Table result = tableService.createTable(command);
        
        // Then
        assertThat(result).isNotNull();
        verify(projectRepository).existsById(testProjectId);
        verify(tableRepository).existsByProjectIdAndName(testProjectId, "새 테이블");
        verify(tableRepository).save(any(Table.class));
    }
    
    @Test
    @DisplayName("테이블 생성 - 프로젝트 없음")
    void createTable_ProjectNotFound_ThrowsException() {
        // Given
        CreateTableCommand command = new CreateTableCommand(testProjectId, "새 테이블", "설명", null, null);
        when(projectRepository.existsById(testProjectId)).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> tableService.createTable(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("프로젝트를 찾을 수 없습니다");
        
        verify(projectRepository).existsById(testProjectId);
        verify(tableRepository, never()).save(any(Table.class));
    }
    
    @Test
    @DisplayName("테이블 생성 - 이름 중복")
    void createTable_DuplicateName_ThrowsException() {
        // Given
        CreateTableCommand command = new CreateTableCommand(testProjectId, "중복 테이블", "설명", null, null);
        when(projectRepository.existsById(testProjectId)).thenReturn(true);
        when(tableRepository.existsByProjectIdAndName(testProjectId, "중복 테이블")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> tableService.createTable(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 존재하는 테이블 이름입니다");
        
        verify(tableRepository, never()).save(any(Table.class));
    }
    
    @Test
    @DisplayName("테이블 수정 - 성공")
    void updateTable_Success() {
        // Given
        UpdateTableCommand command = new UpdateTableCommand(testTableId, "수정된 테이블", "수정된 설명");
        when(tableRepository.findById(testTableId)).thenReturn(Optional.of(testTable));
        when(tableRepository.existsByProjectIdAndName(testProjectId, "수정된 테이블")).thenReturn(false);
        when(tableRepository.save(any(Table.class))).thenReturn(testTable);
        
        // When
        Table result = tableService.updateTable(command);
        
        // Then
        assertThat(result).isNotNull();
        verify(tableRepository).findById(testTableId);
        verify(tableRepository).save(testTable);
    }
    
    @Test
    @DisplayName("컬럼 추가 - 성공")
    void addColumn_Success() {
        // Given
        AddColumnCommand command = new AddColumnCommand(
            testTableId, "새 컬럼", "설명", MSSQLDataType.NVARCHAR, 
            255, null, null, true, false, false, null, null, null
        );
        when(tableRepository.existsById(testTableId)).thenReturn(true);
        when(columnRepository.existsByTableIdAndName(testTableId, "새 컬럼")).thenReturn(false);
        when(columnRepository.findMaxOrderIndexByTableId(testTableId)).thenReturn(0);
        
        Column savedColumn = new Column("새 컬럼", MSSQLDataType.NVARCHAR, 1);
        when(columnRepository.save(any(Column.class))).thenReturn(savedColumn);
        
        // When
        Column result = tableService.addColumn(command);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("새 컬럼");
        verify(tableRepository).existsById(testTableId);
        verify(columnRepository).existsByTableIdAndName(testTableId, "새 컬럼");
        verify(columnRepository).save(any(Column.class));
    }
    
    @Test
    @DisplayName("컬럼 추가 - 테이블 없음")
    void addColumn_TableNotFound_ThrowsException() {
        // Given
        AddColumnCommand command = new AddColumnCommand(
            testTableId, "새 컬럼", "설명", MSSQLDataType.NVARCHAR, 
            255, null, null, true, false, false, null, null, null
        );
        when(tableRepository.existsById(testTableId)).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> tableService.addColumn(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("테이블을 찾을 수 없습니다");
        
        verify(columnRepository, never()).save(any(Column.class));
    }
    
    @Test
    @DisplayName("테이블 삭제 - 성공")
    void deleteTable_Success() {
        // Given
        when(tableRepository.existsById(testTableId)).thenReturn(true);
        
        // When
        tableService.deleteTable(testTableId);
        
        // Then
        verify(tableRepository).existsById(testTableId);
        verify(columnRepository).deleteByTableId(testTableId);
        verify(tableRepository).deleteById(testTableId);
    }
    
    @Test
    @DisplayName("프로젝트별 테이블 조회 - 성공")
    void getTablesByProjectId_Success() {
        // Given
        Table table2 = new Table("테이블2", "설명2");
        List<Table> tables = Arrays.asList(testTable, table2);
        when(tableRepository.findByProjectId(testProjectId)).thenReturn(tables);
        
        // When
        List<Table> result = tableService.getTablesByProjectId(testProjectId);
        
        // Then
        assertThat(result).hasSize(2);
        assertThat(result).contains(testTable, table2);
        verify(tableRepository).findByProjectId(testProjectId);
    }
}