package com.dbmodeling.application.service;

import com.dbmodeling.application.port.in.*;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.infrastructure.config.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 프로젝트 애플리케이션 서비스
 * 프로젝트 관련 유스케이스들을 구현
 */
@Service
@Transactional
public class ProjectService implements 
    CreateProjectUseCase, 
    UpdateProjectUseCase, 
    GetProjectUseCase, 
    DeleteProjectUseCase {
    
    private final ProjectRepository projectRepository;
    
    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }
    
    @Override
    @CacheEvict(value = CacheConfig.PROJECT_CACHE, allEntries = true)
    public Project createProject(CreateProjectCommand command) {
        // 이름 중복 검사
        if (projectRepository.existsByName(command.name())) {
            throw new IllegalArgumentException("이미 존재하는 프로젝트 이름입니다: " + command.name());
        }
        
        // 새 프로젝트 생성
        Project project = new Project(command.name(), command.description());
        
        // 저장 및 반환
        return projectRepository.save(project);
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = CacheConfig.PROJECT_CACHE, key = "#command.id()"),
        @CacheEvict(value = CacheConfig.PROJECT_CACHE, allEntries = true)
    })
    public Project updateProject(UpdateProjectCommand command) {
        // 기존 프로젝트 조회
        Project project = projectRepository.findById(command.id())
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + command.id()));
        
        // 이름 변경 시 중복 검사 (자기 자신 제외)
        if (!project.getName().equals(command.name()) && 
            projectRepository.existsByName(command.name())) {
            throw new IllegalArgumentException("이미 존재하는 프로젝트 이름입니다: " + command.name());
        }
        
        // 프로젝트 정보 업데이트
        project.updateProject(command.name(), command.description());
        
        // 저장 및 반환
        return projectRepository.save(project);
    }
    
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.PROJECT_CACHE, key = "#id")
    public Project getProjectById(UUID id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));
    }
    
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.PROJECT_CACHE, key = "'all'")
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    
    @Override
    @Caching(evict = {
        @CacheEvict(value = CacheConfig.PROJECT_CACHE, key = "#id"),
        @CacheEvict(value = CacheConfig.PROJECT_CACHE, allEntries = true),
        @CacheEvict(value = CacheConfig.TABLE_CACHE, allEntries = true)
    })
    public void deleteProject(UUID id) {
        // 프로젝트 존재 확인
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id);
        }
        
        // 프로젝트 삭제
        projectRepository.deleteById(id);
    }
}