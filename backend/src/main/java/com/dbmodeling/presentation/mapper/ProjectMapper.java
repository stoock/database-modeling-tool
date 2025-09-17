package com.dbmodeling.presentation.mapper;

import com.dbmodeling.application.port.in.CreateProjectUseCase;
import com.dbmodeling.application.port.in.UpdateProjectUseCase;
import com.dbmodeling.domain.model.NamingRules;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.model.Table;
import com.dbmodeling.presentation.dto.request.CreateProjectRequest;
import com.dbmodeling.presentation.dto.request.NamingRulesRequest;
import com.dbmodeling.presentation.dto.request.UpdateProjectRequest;
import com.dbmodeling.presentation.dto.response.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 프로젝트 DTO 매퍼
 * 도메인 모델과 DTO 간의 변환을 담당합니다.
 */
@Component("presentationProjectMapper")
public class ProjectMapper {

    /**
     * CreateProjectRequest를 CreateProjectCommand로 변환
     */
    public CreateProjectUseCase.CreateProjectCommand toCommand(CreateProjectRequest request) {
        return new CreateProjectUseCase.CreateProjectCommand(
            request.getName(),
            request.getDescription()
        );
    }

    /**
     * UpdateProjectRequest를 UpdateProjectCommand로 변환
     */
    public UpdateProjectUseCase.UpdateProjectCommand toCommand(UUID id, UpdateProjectRequest request) {
        return new UpdateProjectUseCase.UpdateProjectCommand(
            id,
            request.getName(),
            request.getDescription()
        );
    }

    /**
     * Project 도메인 모델을 ProjectResponse로 변환
     */
    public ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
            project.getId().toString(),
            project.getName(),
            project.getDescription(),
            toNamingRulesResponse(project.getNamingRules()),
            toTableSummaryResponses(project.getTables()),
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }

    /**
     * Project 도메인 모델을 ProjectSummaryResponse로 변환
     */
    public ProjectSummaryResponse toSummaryResponse(Project project) {
        return new ProjectSummaryResponse(
            project.getId().toString(),
            project.getName(),
            project.getDescription(),
            project.getTables() != null ? project.getTables().size() : 0,
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }

    /**
     * Project 리스트를 ProjectSummaryResponse 리스트로 변환
     */
    public List<ProjectSummaryResponse> toSummaryResponses(List<Project> projects) {
        return projects.stream()
            .map(this::toSummaryResponse)
            .collect(Collectors.toList());
    }

    /**
     * NamingRules 도메인 모델을 NamingRulesResponse로 변환
     */
    private NamingRulesResponse toNamingRulesResponse(NamingRules namingRules) {
        if (namingRules == null) {
            return null;
        }
        
        return new NamingRulesResponse(
            namingRules.getTablePrefix(),
            namingRules.getTableSuffix(),
            namingRules.getTablePattern(),
            namingRules.getColumnPattern(),
            namingRules.getIndexPattern(),
            namingRules.getEnforceCase() != null ? namingRules.getEnforceCase().name() : null
        );
    }

    /**
     * NamingRulesRequest를 NamingRules 도메인 모델로 변환
     */
    public NamingRules toNamingRules(NamingRulesRequest request) {
        if (request == null) {
            return new NamingRules();
        }
        
        NamingRules namingRules = new NamingRules();
        namingRules.setTablePrefix(request.getTablePrefix());
        namingRules.setTableSuffix(request.getTableSuffix());
        namingRules.setTablePattern(request.getTablePattern());
        namingRules.setColumnPattern(request.getColumnPattern());
        namingRules.setIndexPattern(request.getIndexPattern());
        
        if (request.getEnforceCase() != null) {
            try {
                namingRules.setEnforceCase(NamingRules.CaseRule.valueOf(request.getEnforceCase()).toCaseType());
            } catch (IllegalArgumentException e) {
                // 잘못된 케이스 규칙은 무시
            }
        }
        
        return namingRules;
    }

    /**
     * Table 리스트를 TableSummaryResponse 리스트로 변환
     */
    private List<TableSummaryResponse> toTableSummaryResponses(List<Table> tables) {
        if (tables == null) {
            return List.of();
        }
        
        return tables.stream()
            .map(this::toTableSummaryResponse)
            .collect(Collectors.toList());
    }

    /**
     * Table 도메인 모델을 TableSummaryResponse로 변환
     */
    private TableSummaryResponse toTableSummaryResponse(Table table) {
        return new TableSummaryResponse(
            table.getId().toString(),
            table.getName(),
            table.getDescription(),
            table.getColumns() != null ? table.getColumns().size() : 0,
            table.getIndexes() != null ? table.getIndexes().size() : 0,
            table.getPositionX(),
            table.getPositionY(),
            table.getCreatedAt(),
            table.getUpdatedAt()
        );
    }
}