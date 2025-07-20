package com.dbmodeling.infrastructure.persistence.mapper;

import com.dbmodeling.domain.model.NamingRules;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.infrastructure.persistence.entity.ProjectEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * 프로젝트 Entity-Domain 매퍼
 */
@Component
public class ProjectMapper {
    
    private final ObjectMapper objectMapper;
    private final TableMapper tableMapper;
    
    public ProjectMapper(ObjectMapper objectMapper, TableMapper tableMapper) {
        this.objectMapper = objectMapper;
        this.tableMapper = tableMapper;
    }
    
    /**
     * Entity를 Domain으로 변환
     */
    public Project toDomain(ProjectEntity entity) {
        if (entity == null) {
            return null;
        }
        
        Project project = new Project();
        project.setId(entity.getId());
        project.setName(entity.getName());
        project.setDescription(entity.getDescription());
        project.setNamingRules(parseNamingRules(entity.getNamingRules()));
        project.setCreatedAt(entity.getCreatedAt());
        project.setUpdatedAt(entity.getUpdatedAt());
        
        // 테이블 목록 변환 (지연 로딩 고려)
        if (entity.getTables() != null) {
            project.setTables(
                entity.getTables().stream()
                    .map(tableMapper::toDomain)
                    .collect(Collectors.toList())
            );
        }
        
        return project;
    }
    
    /**
     * Domain을 Entity로 변환
     */
    public ProjectEntity toEntity(Project domain) {
        if (domain == null) {
            return null;
        }
        
        ProjectEntity entity = new ProjectEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setNamingRules(serializeNamingRules(domain.getNamingRules()));
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        // version은 새 엔티티의 경우 null로 설정 (JPA가 자동 관리)
        
        // 테이블은 별도로 저장되므로 여기서는 설정하지 않음
        // 양방향 관계는 테이블 리포지토리에서 처리
        
        return entity;
    }
    
    /**
     * 기존 Entity 업데이트
     */
    public void updateEntity(ProjectEntity entity, Project domain) {
        if (entity == null || domain == null) {
            return;
        }
        
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setNamingRules(serializeNamingRules(domain.getNamingRules()));
        entity.setUpdatedAt(domain.getUpdatedAt());
        // version은 JPA가 자동으로 관리하므로 설정하지 않음
    }
    
    /**
     * NamingRules JSON 파싱
     */
    private NamingRules parseNamingRules(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new NamingRules();
        }
        
        try {
            return objectMapper.readValue(json, NamingRules.class);
        } catch (JsonProcessingException e) {
            // 파싱 실패 시 기본값 반환
            return new NamingRules();
        }
    }
    
    /**
     * NamingRules JSON 직렬화
     */
    private String serializeNamingRules(NamingRules namingRules) {
        if (namingRules == null) {
            namingRules = new NamingRules();
        }
        
        try {
            return objectMapper.writeValueAsString(namingRules);
        } catch (JsonProcessingException e) {
            // 직렬화 실패 시 빈 JSON 반환
            return "{}";
        }
    }
}