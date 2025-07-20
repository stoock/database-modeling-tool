package com.dbmodeling.application.service;

import com.dbmodeling.application.port.in.CreateProjectUseCase.CreateProjectCommand;
import com.dbmodeling.application.port.in.UpdateProjectUseCase.UpdateProjectCommand;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.repository.ProjectRepository;
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
@DisplayName("프로젝트 서비스 테스트")
class ProjectServiceTest {
    
    @Mock
    private ProjectRepository projectRepository;
    
    @InjectMocks
    private ProjectService projectService;
    
    private Project testProject;
    private UUID testProjectId;
    
    @BeforeEach
    void setUp() {
        testProjectId = UUID.randomUUID();
        testProject = new Project("테스트 프로젝트", "테스트 설명");
        testProject.setId(testProjectId);
    }
    
    @Test
    @DisplayName("프로젝트 생성 - 성공")
    void createProject_Success() {
        // Given
        CreateProjectCommand command = new CreateProjectCommand("새 프로젝트", "새 프로젝트 설명");
        when(projectRepository.existsByName("새 프로젝트")).thenReturn(false);
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);
        
        // When
        Project result = projectService.createProject(command);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("테스트 프로젝트");
        verify(projectRepository).existsByName("새 프로젝트");
        verify(projectRepository).save(any(Project.class));
    }
    
    @Test
    @DisplayName("프로젝트 생성 - 이름 중복 실패")
    void createProject_DuplicateName_ThrowsException() {
        // Given
        CreateProjectCommand command = new CreateProjectCommand("중복 프로젝트", "설명");
        when(projectRepository.existsByName("중복 프로젝트")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> projectService.createProject(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 존재하는 프로젝트 이름입니다");
        
        verify(projectRepository).existsByName("중복 프로젝트");
        verify(projectRepository, never()).save(any(Project.class));
    }
    
    @Test
    @DisplayName("프로젝트 생성 - 빈 이름으로 실패")
    void createProject_EmptyName_ThrowsException() {
        // When & Then
        assertThatThrownBy(() -> new CreateProjectCommand("", "설명"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("프로젝트 이름은 필수입니다");
    }
    
    @Test
    @DisplayName("프로젝트 수정 - 성공")
    void updateProject_Success() {
        // Given
        UpdateProjectCommand command = new UpdateProjectCommand(testProjectId, "수정된 프로젝트", "수정된 설명");
        when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(testProject));
        when(projectRepository.existsByName("수정된 프로젝트")).thenReturn(false);
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);
        
        // When
        Project result = projectService.updateProject(command);
        
        // Then
        assertThat(result).isNotNull();
        verify(projectRepository).findById(testProjectId);
        verify(projectRepository).existsByName("수정된 프로젝트");
        verify(projectRepository).save(testProject);
    }
    
    @Test
    @DisplayName("프로젝트 수정 - 존재하지 않는 프로젝트")
    void updateProject_NotFound_ThrowsException() {
        // Given
        UpdateProjectCommand command = new UpdateProjectCommand(testProjectId, "수정된 프로젝트", "수정된 설명");
        when(projectRepository.findById(testProjectId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> projectService.updateProject(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("프로젝트를 찾을 수 없습니다");
        
        verify(projectRepository).findById(testProjectId);
        verify(projectRepository, never()).save(any(Project.class));
    }
    
    @Test
    @DisplayName("프로젝트 수정 - 이름 중복 실패")
    void updateProject_DuplicateName_ThrowsException() {
        // Given
        UpdateProjectCommand command = new UpdateProjectCommand(testProjectId, "중복 이름", "수정된 설명");
        when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(testProject));
        when(projectRepository.existsByName("중복 이름")).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> projectService.updateProject(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 존재하는 프로젝트 이름입니다");
        
        verify(projectRepository).findById(testProjectId);
        verify(projectRepository).existsByName("중복 이름");
        verify(projectRepository, never()).save(any(Project.class));
    }
    
    @Test
    @DisplayName("프로젝트 조회 - 성공")
    void getProjectById_Success() {
        // Given
        when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(testProject));
        
        // When
        Project result = projectService.getProjectById(testProjectId);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testProjectId);
        verify(projectRepository).findById(testProjectId);
    }
    
    @Test
    @DisplayName("프로젝트 조회 - 존재하지 않는 프로젝트")
    void getProjectById_NotFound_ThrowsException() {
        // Given
        when(projectRepository.findById(testProjectId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> projectService.getProjectById(testProjectId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("프로젝트를 찾을 수 없습니다");
        
        verify(projectRepository).findById(testProjectId);
    }
    
    @Test
    @DisplayName("모든 프로젝트 조회 - 성공")
    void getAllProjects_Success() {
        // Given
        Project project2 = new Project("프로젝트2", "설명2");
        List<Project> projects = Arrays.asList(testProject, project2);
        when(projectRepository.findAll()).thenReturn(projects);
        
        // When
        List<Project> result = projectService.getAllProjects();
        
        // Then
        assertThat(result).hasSize(2);
        assertThat(result).contains(testProject, project2);
        verify(projectRepository).findAll();
    }
    
    @Test
    @DisplayName("프로젝트 삭제 - 성공")
    void deleteProject_Success() {
        // Given
        when(projectRepository.existsById(testProjectId)).thenReturn(true);
        
        // When
        projectService.deleteProject(testProjectId);
        
        // Then
        verify(projectRepository).existsById(testProjectId);
        verify(projectRepository).deleteById(testProjectId);
    }
    
    @Test
    @DisplayName("프로젝트 삭제 - 존재하지 않는 프로젝트")
    void deleteProject_NotFound_ThrowsException() {
        // Given
        when(projectRepository.existsById(testProjectId)).thenReturn(false);
        
        // When & Then
        assertThatThrownBy(() -> projectService.deleteProject(testProjectId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("프로젝트를 찾을 수 없습니다");
        
        verify(projectRepository).existsById(testProjectId);
        verify(projectRepository, never()).deleteById(any(UUID.class));
    }
}