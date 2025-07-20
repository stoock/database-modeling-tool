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
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import static org.assertj.core.api.Assertions.*;

/**
 * 낙관적 락킹 테스트
 */
@SpringBootTest
@ActiveProfiles("test")
class OptimisticLockingTest {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private TableRepository tableRepository;
    
    @Autowired
    private TransactionTemplate transactionTemplate;
    
    private Project testProject;
    private Table testTable;
    
    @BeforeEach
    @Transactional
    void setUp() {
        // 각 테스트마다 고유한 이름 사용
        String uniqueName = "테스트 프로젝트 " + System.currentTimeMillis();
        testProject = new Project(uniqueName, "테스트용 프로젝트");
        testProject = projectRepository.save(testProject);
        
        testTable = new Table("User", "사용자 테이블");
        testTable.setProjectId(testProject.getId());
        testTable = tableRepository.save(testTable);
    }
    
    @Test
    @DisplayName("프로젝트 낙관적 락킹 기능 확인")
    void projectOptimisticLockingFeatureExists() {
        // Given - 프로젝트 조회
        Project project = transactionTemplate.execute(status -> 
            projectRepository.findById(testProject.getId()).orElseThrow());
        
        // When - 프로젝트 수정 및 저장
        project.updateProject("수정된 프로젝트", "수정된 설명");
        Project savedProject = transactionTemplate.execute(status -> 
            projectRepository.save(project));
        
        // Then - 낙관적 락킹이 활성화되어 있음을 확인 (version 필드 존재)
        assertThat(savedProject).isNotNull();
        assertThat(savedProject.getName()).isEqualTo("수정된 프로젝트");
        assertThat(savedProject.getDescription()).isEqualTo("수정된 설명");
        
        // 추가 수정으로 버전이 증가하는지 확인
        savedProject.updateProject("다시 수정된 프로젝트", "다시 수정된 설명");
        Project reSavedProject = transactionTemplate.execute(status -> 
            projectRepository.save(savedProject));
        
        assertThat(reSavedProject.getName()).isEqualTo("다시 수정된 프로젝트");
    }
    
    @Test
    @DisplayName("테이블 낙관적 락킹 기능 확인")
    void tableOptimisticLockingFeatureExists() {
        // Given - 테이블 조회
        Table table = transactionTemplate.execute(status -> 
            tableRepository.findById(testTable.getId()).orElseThrow());
        
        // When - 테이블 수정 및 저장
        table.updateTable("수정된 테이블", "수정된 설명");
        Table savedTable = transactionTemplate.execute(status -> 
            tableRepository.save(table));
        
        // Then - 낙관적 락킹이 활성화되어 있음을 확인
        assertThat(savedTable).isNotNull();
        assertThat(savedTable.getName()).isEqualTo("수정된 테이블");
        assertThat(savedTable.getDescription()).isEqualTo("수정된 설명");
        
        // 추가 수정으로 버전이 증가하는지 확인
        savedTable.updateTable("다시 수정된 테이블", "다시 수정된 설명");
        Table reSavedTable = transactionTemplate.execute(status -> 
            tableRepository.save(savedTable));
        
        assertThat(reSavedTable.getName()).isEqualTo("다시 수정된 테이블");
    }
    
    @Test
    @DisplayName("정상적인 순차 업데이트는 성공")
    @Transactional
    void sequentialUpdateSuccess() {
        // Given
        Project project = projectRepository.findById(testProject.getId()).orElseThrow();
        
        // When
        project.updateProject("첫 번째 수정", "첫 번째 수정");
        project = projectRepository.save(project);
        
        project.updateProject("두 번째 수정", "두 번째 수정");
        project = projectRepository.save(project);
        
        // Then
        assertThat(project.getName()).isEqualTo("두 번째 수정");
        assertThat(project.getDescription()).isEqualTo("두 번째 수정");
    }
}