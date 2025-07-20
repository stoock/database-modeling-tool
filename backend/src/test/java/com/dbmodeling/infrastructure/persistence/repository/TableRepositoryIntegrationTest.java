package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.model.Table;
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
 * 테이블 리포지토리 통합 테스트
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TableRepositoryIntegrationTest {
    
    @Autowired
    private TableRepository tableRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    private Project testProject;
    private Table testTable;
    
    @BeforeEach
    void setUp() {
        // 테스트용 프로젝트 생성
        testProject = new Project("테스트 프로젝트", "테스트용 프로젝트");
        testProject = projectRepository.save(testProject);
        
        // 테스트용 테이블 생성
        testTable = new Table("User", "사용자 테이블");
        testTable.setProjectId(testProject.getId());
        testTable.updatePosition(100, 200);
    }
    
    @Test
    @DisplayName("테이블 저장 및 조회")
    void saveAndFindTable() {
        // Given & When
        Table savedTable = tableRepository.save(testTable);
        
        // Then
        assertThat(savedTable).isNotNull();
        assertThat(savedTable.getId()).isNotNull();
        assertThat(savedTable.getName()).isEqualTo("User");
        assertThat(savedTable.getDescription()).isEqualTo("사용자 테이블");
        assertThat(savedTable.getProjectId()).isEqualTo(testProject.getId());
        assertThat(savedTable.getPositionX()).isEqualTo(100);
        assertThat(savedTable.getPositionY()).isEqualTo(200);
        
        // 조회 테스트
        Optional<Table> foundTable = tableRepository.findById(savedTable.getId());
        assertThat(foundTable).isPresent();
        assertThat(foundTable.get().getName()).isEqualTo("User");
    }
    
    @Test
    @DisplayName("테이블 업데이트")
    void updateTable() {
        // Given
        Table savedTable = tableRepository.save(testTable);
        
        // When
        savedTable.updateTable("UpdatedUser", "수정된 사용자 테이블");
        savedTable.updatePosition(300, 400);
        Table updatedTable = tableRepository.save(savedTable);
        
        // Then
        assertThat(updatedTable.getName()).isEqualTo("UpdatedUser");
        assertThat(updatedTable.getDescription()).isEqualTo("수정된 사용자 테이블");
        assertThat(updatedTable.getPositionX()).isEqualTo(300);
        assertThat(updatedTable.getPositionY()).isEqualTo(400);
    }
    
    @Test
    @DisplayName("프로젝트 ID로 테이블 목록 조회")
    void findByProjectId() {
        // Given
        tableRepository.save(testTable);
        
        Table anotherTable = new Table("Product", "상품 테이블");
        anotherTable.setProjectId(testProject.getId());
        tableRepository.save(anotherTable);
        
        // When
        List<Table> tables = tableRepository.findByProjectId(testProject.getId());
        
        // Then
        assertThat(tables).hasSize(2);
        assertThat(tables).extracting(Table::getName)
                .contains("User", "Product");
    }
    
    @Test
    @DisplayName("프로젝트 내에서 이름으로 테이블 조회")
    void findByProjectIdAndName() {
        // Given
        tableRepository.save(testTable);
        
        // When
        Optional<Table> foundTable = tableRepository.findByProjectIdAndName(
                testProject.getId(), "User");
        
        // Then
        assertThat(foundTable).isPresent();
        assertThat(foundTable.get().getName()).isEqualTo("User");
    }
    
    @Test
    @DisplayName("테이블 삭제")
    void deleteTable() {
        // Given
        Table savedTable = tableRepository.save(testTable);
        UUID tableId = savedTable.getId();
        
        // When
        tableRepository.deleteById(tableId);
        
        // Then
        Optional<Table> deletedTable = tableRepository.findById(tableId);
        assertThat(deletedTable).isEmpty();
    }
    
    @Test
    @DisplayName("프로젝트의 모든 테이블 삭제")
    void deleteByProjectId() {
        // Given
        tableRepository.save(testTable);
        
        Table anotherTable = new Table("Product", "상품 테이블");
        anotherTable.setProjectId(testProject.getId());
        tableRepository.save(anotherTable);
        
        // When
        tableRepository.deleteByProjectId(testProject.getId());
        
        // Then
        List<Table> remainingTables = tableRepository.findByProjectId(testProject.getId());
        assertThat(remainingTables).isEmpty();
    }
    
    @Test
    @DisplayName("테이블 존재 여부 확인")
    void existsById() {
        // Given
        Table savedTable = tableRepository.save(testTable);
        
        // When & Then
        assertThat(tableRepository.existsById(savedTable.getId())).isTrue();
        assertThat(tableRepository.existsById(UUID.randomUUID())).isFalse();
    }
    
    @Test
    @DisplayName("프로젝트 내 테이블 이름 중복 확인")
    void existsByProjectIdAndName() {
        // Given
        tableRepository.save(testTable);
        
        // When & Then
        assertThat(tableRepository.existsByProjectIdAndName(testProject.getId(), "User")).isTrue();
        assertThat(tableRepository.existsByProjectIdAndName(testProject.getId(), "NonExistent")).isFalse();
    }
}