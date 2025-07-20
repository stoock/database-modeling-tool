package com.dbmodeling.infrastructure.persistence.repository;

import com.dbmodeling.domain.model.NamingRules;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.repository.ProjectRepository;
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
 * 프로젝트 리포지토리 통합 테스트
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProjectRepositoryIntegrationTest {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    private Project testProject;
    
    @BeforeEach
    void setUp() {
        testProject = new Project("테스트 프로젝트", "테스트용 프로젝트입니다");
        
        NamingRules namingRules = new NamingRules();
        namingRules.setTablePrefix("tbl_");
        namingRules.setEnforceCase(NamingRules.CaseType.PASCAL);
        testProject.setNamingRules(namingRules);
    }
    
    @Test
    @DisplayName("프로젝트 저장 및 조회")
    void saveAndFindProject() {
        // Given & When
        Project savedProject = projectRepository.save(testProject);
        
        // Then
        assertThat(savedProject).isNotNull();
        assertThat(savedProject.getId()).isNotNull();
        assertThat(savedProject.getName()).isEqualTo("테스트 프로젝트");
        assertThat(savedProject.getDescription()).isEqualTo("테스트용 프로젝트입니다");
        assertThat(savedProject.getNamingRules().getTablePrefix()).isEqualTo("tbl_");
        assertThat(savedProject.getCreatedAt()).isNotNull();
        assertThat(savedProject.getUpdatedAt()).isNotNull();
        
        // 조회 테스트
        Optional<Project> foundProject = projectRepository.findById(savedProject.getId());
        assertThat(foundProject).isPresent();
        assertThat(foundProject.get().getName()).isEqualTo("테스트 프로젝트");
    }
    
    @Test
    @DisplayName("프로젝트 업데이트")
    void updateProject() {
        // Given
        Project savedProject = projectRepository.save(testProject);
        
        // When
        savedProject.updateProject("수정된 프로젝트", "수정된 설명");
        Project updatedProject = projectRepository.save(savedProject);
        
        // Then
        assertThat(updatedProject.getName()).isEqualTo("수정된 프로젝트");
        assertThat(updatedProject.getDescription()).isEqualTo("수정된 설명");
        assertThat(updatedProject.getUpdatedAt()).isAfter(updatedProject.getCreatedAt());
    }
    
    @Test
    @DisplayName("프로젝트 이름으로 조회")
    void findByName() {
        // Given
        projectRepository.save(testProject);
        
        // When
        Optional<Project> foundProject = projectRepository.findByName("테스트 프로젝트");
        
        // Then
        assertThat(foundProject).isPresent();
        assertThat(foundProject.get().getName()).isEqualTo("테스트 프로젝트");
    }
    
    @Test
    @DisplayName("모든 프로젝트 조회")
    void findAll() {
        // Given
        projectRepository.save(testProject);
        
        Project anotherProject = new Project("다른 프로젝트", "다른 설명");
        projectRepository.save(anotherProject);
        
        // When
        List<Project> projects = projectRepository.findAll();
        
        // Then
        assertThat(projects).hasSizeGreaterThanOrEqualTo(2);
        assertThat(projects).extracting(Project::getName)
                .contains("테스트 프로젝트", "다른 프로젝트");
    }
    
    @Test
    @DisplayName("프로젝트 삭제")
    void deleteProject() {
        // Given
        Project savedProject = projectRepository.save(testProject);
        UUID projectId = savedProject.getId();
        
        // When
        projectRepository.deleteById(projectId);
        
        // Then
        Optional<Project> deletedProject = projectRepository.findById(projectId);
        assertThat(deletedProject).isEmpty();
    }
    
    @Test
    @DisplayName("프로젝트 존재 여부 확인")
    void existsById() {
        // Given
        Project savedProject = projectRepository.save(testProject);
        
        // When & Then
        assertThat(projectRepository.existsById(savedProject.getId())).isTrue();
        assertThat(projectRepository.existsById(UUID.randomUUID())).isFalse();
    }
    
    @Test
    @DisplayName("프로젝트 이름 중복 확인")
    void existsByName() {
        // Given
        projectRepository.save(testProject);
        
        // When & Then
        assertThat(projectRepository.existsByName("테스트 프로젝트")).isTrue();
        assertThat(projectRepository.existsByName("존재하지 않는 프로젝트")).isFalse();
    }
}