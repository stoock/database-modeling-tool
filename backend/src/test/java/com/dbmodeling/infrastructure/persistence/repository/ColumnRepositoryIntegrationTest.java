package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.MSSQLDataType;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.model.Table;
import com.dbmodeling.domain.repository.ColumnRepository;
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
 * 컬럼 리포지토리 통합 테스트
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ColumnRepositoryIntegrationTest {
    
    @Autowired
    private ColumnRepository columnRepository;
    
    @Autowired
    private TableRepository tableRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    private Table testTable;
    private Column testColumn;
    
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
        testColumn.setDescription("사용자 ID");
        testColumn.setPrimaryKey(true);
        testColumn.setIdentityProperties(true, 1, 1);
    }
    
    @Test
    @DisplayName("컬럼 저장 및 조회")
    void saveAndFindColumn() {
        // Given & When
        Column savedColumn = columnRepository.save(testColumn);
        
        // Then
        assertThat(savedColumn).isNotNull();
        assertThat(savedColumn.getId()).isNotNull();
        assertThat(savedColumn.getName()).isEqualTo("user_id");
        assertThat(savedColumn.getDataType()).isEqualTo(MSSQLDataType.BIGINT);
        assertThat(savedColumn.getTableId()).isEqualTo(testTable.getId());
        assertThat(savedColumn.isPrimaryKey()).isTrue();
        assertThat(savedColumn.isIdentity()).isTrue();
        assertThat(savedColumn.getOrderIndex()).isEqualTo(1);
        
        // 조회 테스트
        Optional<Column> foundColumn = columnRepository.findById(savedColumn.getId());
        assertThat(foundColumn).isPresent();
        assertThat(foundColumn.get().getName()).isEqualTo("user_id");
    }
    
    @Test
    @DisplayName("컬럼 업데이트")
    void updateColumn() {
        // Given
        Column savedColumn = columnRepository.save(testColumn);
        
        // When
        savedColumn.updateColumn("updated_user_id", "수정된 사용자 ID", MSSQLDataType.NVARCHAR);
        savedColumn.setDataTypeProperties(50, null, null);
        Column updatedColumn = columnRepository.save(savedColumn);
        
        // Then
        assertThat(updatedColumn.getName()).isEqualTo("updated_user_id");
        assertThat(updatedColumn.getDescription()).isEqualTo("수정된 사용자 ID");
        assertThat(updatedColumn.getDataType()).isEqualTo(MSSQLDataType.NVARCHAR);
        assertThat(updatedColumn.getMaxLength()).isEqualTo(50);
    }
    
    @Test
    @DisplayName("테이블 ID로 컬럼 목록 조회 (순서대로)")
    void findByTableIdOrderByOrderIndex() {
        // Given
        columnRepository.save(testColumn);
        
        Column secondColumn = new Column("user_name", MSSQLDataType.NVARCHAR, 2);
        secondColumn.setTableId(testTable.getId());
        secondColumn.setMaxLength(100);
        columnRepository.save(secondColumn);
        
        Column thirdColumn = new Column("email", MSSQLDataType.NVARCHAR, 3);
        thirdColumn.setTableId(testTable.getId());
        thirdColumn.setMaxLength(255);
        columnRepository.save(thirdColumn);
        
        // When
        List<Column> columns = columnRepository.findByTableIdOrderByOrderIndex(testTable.getId());
        
        // Then
        assertThat(columns).hasSize(3);
        assertThat(columns.get(0).getName()).isEqualTo("user_id");
        assertThat(columns.get(1).getName()).isEqualTo("user_name");
        assertThat(columns.get(2).getName()).isEqualTo("email");
    }
    
    @Test
    @DisplayName("테이블 내에서 이름으로 컬럼 조회")
    void findByTableIdAndName() {
        // Given
        columnRepository.save(testColumn);
        
        // When
        Optional<Column> foundColumn = columnRepository.findByTableIdAndName(
                testTable.getId(), "user_id");
        
        // Then
        assertThat(foundColumn).isPresent();
        assertThat(foundColumn.get().getName()).isEqualTo("user_id");
    }
    
    @Test
    @DisplayName("테이블의 기본키 컬럼들 조회")
    void findByTableIdAndIsPrimaryKeyTrue() {
        // Given
        columnRepository.save(testColumn);
        
        Column nonPkColumn = new Column("user_name", MSSQLDataType.NVARCHAR, 2);
        nonPkColumn.setTableId(testTable.getId());
        nonPkColumn.setPrimaryKey(false);
        columnRepository.save(nonPkColumn);
        
        // When
        List<Column> primaryKeyColumns = columnRepository.findByTableIdAndIsPrimaryKeyTrue(testTable.getId());
        
        // Then
        assertThat(primaryKeyColumns).hasSize(1);
        assertThat(primaryKeyColumns.get(0).getName()).isEqualTo("user_id");
        assertThat(primaryKeyColumns.get(0).isPrimaryKey()).isTrue();
    }
    
    @Test
    @DisplayName("컬럼 삭제")
    void deleteColumn() {
        // Given
        Column savedColumn = columnRepository.save(testColumn);
        UUID columnId = savedColumn.getId();
        
        // When
        columnRepository.deleteById(columnId);
        
        // Then
        Optional<Column> deletedColumn = columnRepository.findById(columnId);
        assertThat(deletedColumn).isEmpty();
    }
    
    @Test
    @DisplayName("테이블의 모든 컬럼 삭제")
    void deleteByTableId() {
        // Given
        columnRepository.save(testColumn);
        
        Column anotherColumn = new Column("user_name", MSSQLDataType.NVARCHAR, 2);
        anotherColumn.setTableId(testTable.getId());
        columnRepository.save(anotherColumn);
        
        // When
        columnRepository.deleteByTableId(testTable.getId());
        
        // Then
        List<Column> remainingColumns = columnRepository.findByTableIdOrderByOrderIndex(testTable.getId());
        assertThat(remainingColumns).isEmpty();
    }
    
    @Test
    @DisplayName("테이블의 최대 순서 인덱스 조회")
    void findMaxOrderIndexByTableId() {
        // Given
        columnRepository.save(testColumn);
        
        Column secondColumn = new Column("user_name", MSSQLDataType.NVARCHAR, 5);
        secondColumn.setTableId(testTable.getId());
        columnRepository.save(secondColumn);
        
        // When
        Integer maxOrderIndex = columnRepository.findMaxOrderIndexByTableId(testTable.getId());
        
        // Then
        assertThat(maxOrderIndex).isEqualTo(5);
    }
    
    @Test
    @DisplayName("빈 테이블의 최대 순서 인덱스 조회")
    void findMaxOrderIndexByTableIdWhenEmpty() {
        // When
        Integer maxOrderIndex = columnRepository.findMaxOrderIndexByTableId(testTable.getId());
        
        // Then
        assertThat(maxOrderIndex).isEqualTo(0);
    }
}