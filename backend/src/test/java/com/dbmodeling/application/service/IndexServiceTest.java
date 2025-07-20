package com.dbmodeling.application.service;

import com.dbmodeling.application.port.in.ManageIndexUseCase.CreateIndexCommand;
import com.dbmodeling.application.port.in.ManageIndexUseCase.IndexColumnSpec;
import com.dbmodeling.application.port.in.ManageIndexUseCase.UpdateIndexCommand;
import com.dbmodeling.domain.model.Index;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.IndexRepository;
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
@DisplayName("인덱스 서비스 테스트")
class IndexServiceTest {
    
    @Mock
    private IndexRepository indexRepository;
    
    @Mock
    private TableRepository tableRepository;
    
    @Mock
    private ColumnRepository columnRepository;
    
    @InjectMocks
    private IndexService indexService;
    
    private UUID testTableId;
    private UUID testIndexId;
    private UUID testColumnId;
    private Index testIndex;
    
    @BeforeEach
    void setUp() {
        testTableId = UUID.randomUUID();
        testIndexId = UUID.randomUUID();
        testColumnId = UUID.randomUUID();
        testIndex = new Index("테스트 인덱스", Index.IndexType.NONCLUSTERED, false);
        testIndex.setId(testIndexId);
        testIndex.setTableId(testTableId);
    }
    
    @Test
    @DisplayName("인덱스 생성 - 성공")
    void createIndex_Success() {
        // Given
        List<IndexColumnSpec> columns = Arrays.asList(
            new IndexColumnSpec(testColumnId, Index.SortOrder.ASC)
        );
        CreateIndexCommand command = new CreateIndexCommand(
            testTableId, "새 인덱스", Index.IndexType.NONCLUSTERED, false, columns
        );
        
        when(tableRepository.existsById(testTableId)).thenReturn(true);
        when(indexRepository.existsByTableIdAndName(testTableId, "새 인덱스")).thenReturn(false);
        when(columnRepository.existsById(testColumnId)).thenReturn(true);
        when(indexRepository.save(any(Index.class))).thenReturn(testIndex);
        
        // When
        Index result = indexService.createIndex(command);
        
        // Then
        assertThat(result).isNotNull();
        verify(tableRepository).existsById(testTableId);
        verify(indexRepository).existsByTableIdAndName(testTableId, "새 인덱스");
        verify(columnRepository).existsById(testColumnId);
        verify(indexRepository).save(any(Index.class));
    }
    
    @Test
    @DisplayName("인덱스 생성 - 테이블 없음")
    void createIndex_TableNotFound_ThrowsException() {
        // Given
        List<IndexColumnSpec> columns = Arrays.asList(
            new IndexColumnSpec(testColumnId, Index.SortOrder.ASC)
        );
        CreateIndexCommand command = new CreateIndexCommand(
            testTableId, "새 인덱스", Index.IndexType.NONCLUSTERED, false, columns
        );
        
        when(tableRepository.existsById(testTableId)).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> indexService.createIndex(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("테이블을 찾을 수 없습니다");
        
        verify(indexRepository, never()).save(any(Index.class));
    }
    
    @Test
    @DisplayName("인덱스 생성 - 이름 중복")
    void createIndex_DuplicateName_ThrowsException() {
        // Given
        List<IndexColumnSpec> columns = Arrays.asList(
            new IndexColumnSpec(testColumnId, Index.SortOrder.ASC)
        );
        CreateIndexCommand command = new CreateIndexCommand(
            testTableId, "중복 인덱스", Index.IndexType.NONCLUSTERED, false, columns
        );
        
        when(tableRepository.existsById(testTableId)).thenReturn(true);
        when(indexRepository.existsByTableIdAndName(testTableId, "중복 인덱스")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> indexService.createIndex(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 존재하는 인덱스 이름입니다");
        
        verify(indexRepository, never()).save(any(Index.class));
    }
    
    @Test
    @DisplayName("클러스터드 인덱스 생성 - 중복 실패")
    void createIndex_DuplicateClusteredIndex_ThrowsException() {
        // Given
        List<IndexColumnSpec> columns = Arrays.asList(
            new IndexColumnSpec(testColumnId, Index.SortOrder.ASC)
        );
        CreateIndexCommand command = new CreateIndexCommand(
            testTableId, "클러스터드 인덱스", Index.IndexType.CLUSTERED, false, columns
        );
        
        when(tableRepository.existsById(testTableId)).thenReturn(true);
        when(indexRepository.existsByTableIdAndName(testTableId, "클러스터드 인덱스")).thenReturn(false);
        when(indexRepository.existsByTableIdAndType(testTableId, Index.IndexType.CLUSTERED)).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> indexService.createIndex(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("하나의 클러스터드 인덱스만 생성할 수 있습니다");
        
        verify(indexRepository, never()).save(any(Index.class));
    }
    
    @Test
    @DisplayName("인덱스 수정 - 성공")
    void updateIndex_Success() {
        // Given
        List<IndexColumnSpec> columns = Arrays.asList(
            new IndexColumnSpec(testColumnId, Index.SortOrder.DESC)
        );
        UpdateIndexCommand command = new UpdateIndexCommand(
            testIndexId, "수정된 인덱스", Index.IndexType.NONCLUSTERED, true, columns
        );
        
        when(indexRepository.findById(testIndexId)).thenReturn(Optional.of(testIndex));
        when(indexRepository.existsByTableIdAndName(testTableId, "수정된 인덱스")).thenReturn(false);
        when(columnRepository.existsById(testColumnId)).thenReturn(true);
        when(indexRepository.save(any(Index.class))).thenReturn(testIndex);
        
        // When
        Index result = indexService.updateIndex(command);
        
        // Then
        assertThat(result).isNotNull();
        verify(indexRepository).findById(testIndexId);
        verify(indexRepository).save(testIndex);
    }
    
    @Test
    @DisplayName("인덱스 삭제 - 성공")
    void deleteIndex_Success() {
        // Given
        when(indexRepository.existsById(testIndexId)).thenReturn(true);
        
        // When
        indexService.deleteIndex(testIndexId);
        
        // Then
        verify(indexRepository).existsById(testIndexId);
        verify(indexRepository).deleteById(testIndexId);
    }
    
    @Test
    @DisplayName("테이블별 인덱스 조회 - 성공")
    void getIndexesByTableId_Success() {
        // Given
        Index index2 = new Index("인덱스2", Index.IndexType.NONCLUSTERED, false);
        List<Index> indexes = Arrays.asList(testIndex, index2);
        when(indexRepository.findByTableId(testTableId)).thenReturn(indexes);
        
        // When
        List<Index> result = indexService.getIndexesByTableId(testTableId);
        
        // Then
        assertThat(result).hasSize(2);
        assertThat(result).contains(testIndex, index2);
        verify(indexRepository).findByTableId(testTableId);
    }
}