package com.dbmodeling.application.service;

import com.dbmodeling.application.port.in.ManageColumnUseCase.AddColumnCommand;
import com.dbmodeling.application.port.in.ManageColumnUseCase.UpdateColumnCommand;
import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.MSSQLDataType;
import com.dbmodeling.domain.repository.ColumnRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ColumnService 테스트")
class ColumnServiceTest {
    
    @Mock
    private ColumnRepository columnRepository;
    
    @Mock
    private TableRepository tableRepository;
    
    @InjectMocks
    private ColumnService columnService;
    
    private UUID tableId;
    private UUID columnId;
    private Column testColumn;
    
    @BeforeEach
    void setUp() {
        tableId = UUID.randomUUID();
        columnId = UUID.randomUUID();
        testColumn = new Column("test_column", MSSQLDataType.NVARCHAR, 0);
        testColumn.setId(columnId);
        testColumn.setTableId(tableId);
    }
    
    @Test
    @DisplayName("컬럼 추가 - 성공")
    void addColumn_Success() {
        // Given
        AddColumnCommand command = new AddColumnCommand(
            tableId, "user_name", "사용자 이름", MSSQLDataType.NVARCHAR,
            50, null, null, true, false, false, null, null, null
        );
        
        when(tableRepository.existsById(tableId)).thenReturn(true);
        when(columnRepository.existsByTableIdAndName(tableId, "user_name")).thenReturn(false);
        when(columnRepository.findMaxOrderIndexByTableId(tableId)).thenReturn(2);
        when(columnRepository.save(any(Column.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        Column result = columnService.addColumn(command);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("user_name");
        assertThat(result.getDescription()).isEqualTo("사용자 이름");
        assertThat(result.getDataType()).isEqualTo(MSSQLDataType.NVARCHAR);
        assertThat(result.getMaxLength()).isEqualTo(50);
        assertThat(result.getOrderIndex()).isEqualTo(3);
        
        verify(columnRepository).save(any(Column.class));
    }
    
    @Test
    @DisplayName("컬럼 추가 - 테이블이 존재하지 않음")
    void addColumn_TableNotFound() {
        // Given
        AddColumnCommand command = new AddColumnCommand(
            tableId, "user_name", "사용자 이름", MSSQLDataType.NVARCHAR,
            50, null, null, true, false, false, null, null, null
        );
        
        when(tableRepository.existsById(tableId)).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> columnService.addColumn(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("테이블을 찾을 수 없습니다");
    }
    
    @Test
    @DisplayName("컬럼 추가 - 이름 중복")
    void addColumn_DuplicateName() {
        // Given
        AddColumnCommand command = new AddColumnCommand(
            tableId, "user_name", "사용자 이름", MSSQLDataType.NVARCHAR,
            50, null, null, true, false, false, null, null, null
        );
        
        when(tableRepository.existsById(tableId)).thenReturn(true);
        when(columnRepository.existsByTableIdAndName(tableId, "user_name")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> columnService.addColumn(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 존재하는 컬럼 이름입니다");
    }
    
    @Test
    @DisplayName("컬럼 수정 - 성공")
    void updateColumn_Success() {
        // Given
        UpdateColumnCommand command = new UpdateColumnCommand(
            columnId, "updated_name", "수정된 설명", MSSQLDataType.INT,
            null, null, null, false, true, false, null, null, "0"
        );
        
        when(columnRepository.findById(columnId)).thenReturn(Optional.of(testColumn));
        when(columnRepository.existsByTableIdAndName(tableId, "updated_name")).thenReturn(false);
        when(columnRepository.save(any(Column.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        Column result = columnService.updateColumn(command);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("updated_name");
        assertThat(result.getDescription()).isEqualTo("수정된 설명");
        assertThat(result.getDataType()).isEqualTo(MSSQLDataType.INT);
        assertThat(result.isPrimaryKey()).isTrue();
        assertThat(result.isNullable()).isFalse();
        
        verify(columnRepository).save(testColumn);
    }
    
    @Test
    @DisplayName("컬럼 수정 - 컬럼이 존재하지 않음")
    void updateColumn_ColumnNotFound() {
        // Given
        UpdateColumnCommand command = new UpdateColumnCommand(
            columnId, "updated_name", "수정된 설명", MSSQLDataType.INT,
            null, null, null, false, true, false, null, null, "0"
        );
        
        when(columnRepository.findById(columnId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> columnService.updateColumn(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("컬럼을 찾을 수 없습니다");
    }
    
    @Test
    @DisplayName("컬럼 삭제 - 성공")
    void deleteColumn_Success() {
        // Given
        when(columnRepository.existsById(columnId)).thenReturn(true);
        
        // When
        columnService.deleteColumn(columnId);
        
        // Then
        verify(columnRepository).deleteById(columnId);
    }
    
    @Test
    @DisplayName("컬럼 삭제 - 컬럼이 존재하지 않음")
    void deleteColumn_ColumnNotFound() {
        // Given
        when(columnRepository.existsById(columnId)).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> columnService.deleteColumn(columnId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("컬럼을 찾을 수 없습니다");
    }
    
    @Test
    @DisplayName("테이블의 컬럼 목록 조회")
    void getColumnsByTableId() {
        // Given
        List<Column> expectedColumns = Arrays.asList(testColumn);
        when(columnRepository.findByTableIdOrderByOrderIndex(tableId)).thenReturn(expectedColumns);
        
        // When
        List<Column> result = columnService.getColumnsByTableId(tableId);
        
        // Then
        assertThat(result).isEqualTo(expectedColumns);
        verify(columnRepository).findByTableIdOrderByOrderIndex(tableId);
    }
    
    @Test
    @DisplayName("컬럼 순서 변경 - 성공")
    void updateColumnOrder_Success() {
        // Given
        Column column1 = new Column("col1", MSSQLDataType.INT, 0);
        column1.setId(UUID.randomUUID());
        column1.setTableId(tableId);
        
        Column column2 = new Column("col2", MSSQLDataType.INT, 1);
        column2.setId(UUID.randomUUID());
        column2.setTableId(tableId);
        
        Column column3 = new Column("col3", MSSQLDataType.INT, 2);
        column3.setId(UUID.randomUUID());
        column3.setTableId(tableId);
        
        List<Column> columns = Arrays.asList(column1, column2, column3);
        
        when(columnRepository.findById(column1.getId())).thenReturn(Optional.of(column1));
        when(columnRepository.findByTableIdOrderByOrderIndex(tableId)).thenReturn(columns);
        when(columnRepository.save(any(Column.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When - column1을 인덱스 2로 이동
        Column result = columnService.updateColumnOrder(column1.getId(), 2);
        
        // Then
        assertThat(result.getOrderIndex()).isEqualTo(2);
        assertThat(column2.getOrderIndex()).isEqualTo(0); // 앞으로 이동
        assertThat(column3.getOrderIndex()).isEqualTo(1); // 앞으로 이동
        
        verify(columnRepository, times(3)).save(any(Column.class));
    }
    
    @Test
    @DisplayName("컬럼 복사 - 성공")
    void copyColumn_Success() {
        // Given
        String newName = "copied_column";
        when(columnRepository.findById(columnId)).thenReturn(Optional.of(testColumn));
        when(columnRepository.existsByTableIdAndName(tableId, newName)).thenReturn(false);
        when(columnRepository.findMaxOrderIndexByTableId(tableId)).thenReturn(5);
        when(columnRepository.save(any(Column.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        Column result = columnService.copyColumn(columnId, newName);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo(newName);
        assertThat(result.getDataType()).isEqualTo(testColumn.getDataType());
        assertThat(result.getOrderIndex()).isEqualTo(6);
        assertThat(result.isPrimaryKey()).isFalse(); // 기본키는 복사되지 않음
        
        verify(columnRepository).save(any(Column.class));
    }
    
    @Test
    @DisplayName("기본키 컬럼 조회")
    void getPrimaryKeyColumns() {
        // Given
        List<Column> primaryKeyColumns = Arrays.asList(testColumn);
        when(columnRepository.findByTableIdAndIsPrimaryKeyTrue(tableId)).thenReturn(primaryKeyColumns);
        
        // When
        List<Column> result = columnService.getPrimaryKeyColumns(tableId);
        
        // Then
        assertThat(result).isEqualTo(primaryKeyColumns);
        verify(columnRepository).findByTableIdAndIsPrimaryKeyTrue(tableId);
    }
    
    @Test
    @DisplayName("컬럼 이름으로 조회 - 존재함")
    void getColumnByName_Found() {
        // Given
        String columnName = "test_column";
        when(columnRepository.findByTableIdAndName(tableId, columnName)).thenReturn(Optional.of(testColumn));
        
        // When
        Column result = columnService.getColumnByName(tableId, columnName);
        
        // Then
        assertThat(result).isEqualTo(testColumn);
    }
    
    @Test
    @DisplayName("컬럼 이름으로 조회 - 존재하지 않음")
    void getColumnByName_NotFound() {
        // Given
        String columnName = "nonexistent_column";
        when(columnRepository.findByTableIdAndName(tableId, columnName)).thenReturn(Optional.empty());
        
        // When
        Column result = columnService.getColumnByName(tableId, columnName);
        
        // Then
        assertThat(result).isNull();
    }
}