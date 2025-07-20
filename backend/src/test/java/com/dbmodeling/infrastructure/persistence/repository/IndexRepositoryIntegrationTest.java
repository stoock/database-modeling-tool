package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.domain.model.*;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.IndexRepository;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.domain.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * 인덱스 리포지토리 통합 테스트
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class IndexRepositoryIntegrationTest {
    
    @Autowired
    private IndexRepository indexRepository;
    
    @Autowired
    private TableRepository tableRepository;
    
    @Autowired
    private ColumnRepository columnRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    private Table testTable;
    private Column testColumn;
    private Index testIndex;
    
    @BeforeEach
    void setUp() {
        // 테스트용 프로젝트 생성
        Project testProject = new Project("테스트 프로젝트", "테스트용 프로젝트");
        testProject = projectRepository.save(testProject);
        
        // 테스트용 테이블 생성
        testTable = new Table("User", "사용자 테이블");
        testTable.setProjectId(testProject.getId());
        testTable = tableRepository.save(testTable);
        
        // 테스트용 컬럼 생성
        testColumn = new Column("user_id", MSSQLDataType.BIGINT, 1);
        testColumn.setTableId(testTable.getId());
        testColumn = columnRepository.save(testColumn);
        
        // 테스트용 인덱스 생성
        testIndex = new Index("IX_User_UserId", Index.IndexType.NONCLUSTERED, false);
        testIndex.setTableId(testTable.getId());
        testIndex.addColumn(testColumn.getId(), Index.SortOrder.ASC);
    }
    
    @Test
    @DisplayName("인덱스 저장 및 조회")
    void saveAndFindIndex() {
        // Given & When
        Index savedIndex = indexRepository.save(testIndex);
        
        // Then
        assertThat(savedIndex).isNotNull();
        assertThat(savedIndex.getId()).isNotNull();
        assertThat(savedIndex.getName()).isEqualTo("IX_User_UserId");
        assertThat(savedIndex.getType()).isEqualTo(Index.IndexType.NONCLUSTERED);
        assertThat(savedIndex.isUnique()).isFalse();
        assertThat(savedIndex.getTableId()).isEqualTo(testTable.getId());
        assertThat(savedIndex.getColumns()).hasSize(1);
        assertThat(savedIndex.getColumns().get(0).getColumnId()).isEqualTo(testColumn.getId());
        
        // 조회 테스트
        Optional<Index> foundIndex = indexRepository.findById(savedIndex.getId());
        assertThat(foundIndex).isPresent();
        assertThat(foundIndex.get().getName()).isEqualTo("IX_User_UserId");
    }
    
    @Test
    @DisplayName("인덱스 업데이트")
    void updateIndex() {
        // Given
        Index savedIndex = indexRepository.save(testIndex);
        
        // When
        savedIndex.updateIndex("IX_User_UserId_Updated", Index.IndexType.CLUSTERED, true);
        Index updatedIndex = indexRepository.save(savedIndex);
        
        // Then
        assertThat(updatedIndex.getName()).isEqualTo("IX_User_UserId_Updated");
        assertThat(updatedIndex.getType()).isEqualTo(Index.IndexType.CLUSTERED);
        assertThat(updatedIndex.isUnique()).isTrue();
    }
    
    @Test
    @DisplayName("테이블 ID로 인덱스 목록 조회")
    void findByTableId() {
        // Given
        indexRepository.save(testIndex);
        
        Index anotherIndex = new Index("IX_User_Email", Index.IndexType.NONCLUSTERED, true);
        anotherIndex.setTableId(testTable.getId());
        anotherIndex.addColumn(testColumn.getId(), Index.SortOrder.DESC);
        indexRepository.save(anotherIndex);
        
        // When
        List<Index> indexes = indexRepository.findByTableId(testTable.getId());
        
        // Then
        assertThat(indexes).hasSize(2);
        assertThat(indexes).extracting(Index::getName)
                .contains("IX_User_UserId", "IX_User_Email");
    }
    
    @Test
    @DisplayName("테이블 내에서 이름으로 인덱스 조회")
    void findByTableIdAndName() {
        // Given
        indexRepository.save(testIndex);
        
        // When
        Optional<Index> foundIndex = indexRepository.findByTableIdAndName(
                testTable.getId(), "IX_User_UserId");
        
        // Then
        assertThat(foundIndex).isPresent();
        assertThat(foundIndex.get().getName()).isEqualTo("IX_User_UserId");
    }
    
    @Test
    @DisplayName("테이블의 특정 타입 인덱스 조회")
    void findByTableIdAndType() {
        // Given
        Index clusteredIndex = new Index("PK_User", Index.IndexType.CLUSTERED, true);
        clusteredIndex.setTableId(testTable.getId());
        clusteredIndex.addColumn(testColumn.getId(), Index.SortOrder.ASC);
        indexRepository.save(clusteredIndex);
        
        indexRepository.save(testIndex); // NONCLUSTERED
        
        // When
        Optional<Index> foundClusteredIndex = indexRepository.findByTableIdAndType(
                testTable.getId(), Index.IndexType.CLUSTERED);
        
        // Then
        assertThat(foundClusteredIndex).isPresent();
        assertThat(foundClusteredIndex.get().getName()).isEqualTo("PK_User");
        assertThat(foundClusteredIndex.get().getType()).isEqualTo(Index.IndexType.CLUSTERED);
    }
    
    @Test
    @DisplayName("인덱스 삭제")
    void deleteIndex() {
        // Given
        Index savedIndex = indexRepository.save(testIndex);
        UUID indexId = savedIndex.getId();
        
        // When
        indexRepository.deleteById(indexId);
        
        // Then
        Optional<Index> deletedIndex = indexRepository.findById(indexId);
        assertThat(deletedIndex).isEmpty();
    }
    
    @Test
    @DisplayName("테이블의 모든 인덱스 삭제")
    void deleteByTableId() {
        // Given
        indexRepository.save(testIndex);
        
        Index anotherIndex = new Index("IX_User_Email", Index.IndexType.NONCLUSTERED, true);
        anotherIndex.setTableId(testTable.getId());
        anotherIndex.addColumn(testColumn.getId(), Index.SortOrder.ASC);
        indexRepository.save(anotherIndex);
        
        // When
        indexRepository.deleteByTableId(testTable.getId());
        
        // Then
        List<Index> remainingIndexes = indexRepository.findByTableId(testTable.getId());
        assertThat(remainingIndexes).isEmpty();
    }
    
    @Test
    @DisplayName("복합 인덱스 테스트")
    void compositeIndex() {
        // Given
        Column secondColumn = new Column("user_name", MSSQLDataType.NVARCHAR, 2);
        secondColumn.setTableId(testTable.getId());
        secondColumn = columnRepository.save(secondColumn);
        
        Index compositeIndex = new Index("IX_User_Composite", Index.IndexType.NONCLUSTERED, false);
        compositeIndex.setTableId(testTable.getId());
        compositeIndex.addColumn(testColumn.getId(), Index.SortOrder.ASC);
        compositeIndex.addColumn(secondColumn.getId(), Index.SortOrder.DESC);
        
        // When
        Index savedIndex = indexRepository.save(compositeIndex);
        
        // Then
        assertThat(savedIndex.getColumns()).hasSize(2);
        assertThat(savedIndex.isComposite()).isTrue();
        assertThat(savedIndex.getColumns().get(0).getColumnId()).isEqualTo(testColumn.getId());
        assertThat(savedIndex.getColumns().get(0).getOrder()).isEqualTo(Index.SortOrder.ASC);
        assertThat(savedIndex.getColumns().get(1).getColumnId()).isEqualTo(secondColumn.getId());
        assertThat(savedIndex.getColumns().get(1).getOrder()).isEqualTo(Index.SortOrder.DESC);
    }
    
    @Test
    @DisplayName("클러스터드 인덱스 존재 여부 확인")
    void existsByTableIdAndType() {
        // Given
        Index clusteredIndex = new Index("PK_User", Index.IndexType.CLUSTERED, true);
        clusteredIndex.setTableId(testTable.getId());
        clusteredIndex.addColumn(testColumn.getId(), Index.SortOrder.ASC);
        indexRepository.save(clusteredIndex);
        
        // When & Then
        assertThat(indexRepository.existsByTableIdAndType(testTable.getId(), Index.IndexType.CLUSTERED)).isTrue();
        assertThat(indexRepository.existsByTableIdAndType(testTable.getId(), Index.IndexType.NONCLUSTERED)).isFalse();
    }
}