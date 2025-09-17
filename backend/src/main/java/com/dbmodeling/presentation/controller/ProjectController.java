package com.dbmodeling.presentation.controller;

import com.dbmodeling.application.service.ProjectService;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.presentation.dto.request.CreateProjectRequest;
import com.dbmodeling.presentation.dto.request.UpdateProjectRequest;
import com.dbmodeling.presentation.dto.response.ApiResponse;
import com.dbmodeling.presentation.dto.response.ProjectResponse;
import com.dbmodeling.presentation.dto.response.ProjectSummaryResponse;
import com.dbmodeling.presentation.exception.ResourceNotFoundException;
import com.dbmodeling.presentation.mapper.ProjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 프로젝트 관리 REST API 컨트롤러
 * 데이터베이스 모델링 프로젝트의 CRUD 작업을 처리합니다.
 */
@RestController
@RequestMapping(ApiConstants.API_BASE_PATH + ApiConstants.PROJECTS_PATH)
@Tag(name = "프로젝트 관리", description = "데이터베이스 모델링 프로젝트 관리 API")
public class ProjectController extends BaseController {

    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    public ProjectController(ProjectService projectService, ProjectMapper projectMapper) {
        this.projectService = projectService;
        this.projectMapper = projectMapper;
    }

    @Operation(
        summary = "프로젝트 목록 조회",
        description = "모든 프로젝트의 요약 정보를 조회합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectSummaryResponse>>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        List<ProjectSummaryResponse> responses = projectMapper.toSummaryResponses(projects);
        return success(responses, "프로젝트 목록을 성공적으로 조회했습니다.");
    }

    @Operation(
        summary = "프로젝트 상세 조회",
        description = "특정 프로젝트의 상세 정보를 조회합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
        @Parameter(description = "프로젝트 ID", required = true)
        @PathVariable String id
    ) {
        try {
            UUID projectId = UUID.fromString(id);
            Project project = projectService.getProjectById(projectId);
            ProjectResponse response = projectMapper.toResponse(project);
            return success(response, "프로젝트를 성공적으로 조회했습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("프로젝트를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("프로젝트", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 프로젝트 ID입니다: " + id);
        }
    }

    @Operation(
        summary = "프로젝트 생성",
        description = "새로운 데이터베이스 모델링 프로젝트를 생성합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "생성 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
        @Parameter(description = "프로젝트 생성 요청", required = true)
        @Valid @RequestBody CreateProjectRequest request
    ) {
        Project project = projectService.createProject(projectMapper.toCommand(request));
        
        // 네이밍 규칙이 있다면 업데이트
        if (request.getNamingRules() != null) {
            project.updateNamingRules(projectMapper.toNamingRules(request.getNamingRules()));
        }
        
        ProjectResponse response = projectMapper.toResponse(project);
        return created(response, "프로젝트가 성공적으로 생성되었습니다.");
    }

    @Operation(
        summary = "프로젝트 수정",
        description = "기존 프로젝트의 정보를 수정합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
        @Parameter(description = "프로젝트 ID", required = true)
        @PathVariable String id,
        @Parameter(description = "프로젝트 수정 요청", required = true)
        @Valid @RequestBody UpdateProjectRequest request
    ) {
        try {
            UUID projectId = UUID.fromString(id);
            Project project = projectService.updateProject(projectMapper.toCommand(projectId, request));
            
            // 네이밍 규칙이 있다면 업데이트
            if (request.getNamingRules() != null) {
                project.updateNamingRules(projectMapper.toNamingRules(request.getNamingRules()));
            }
            
            ProjectResponse response = projectMapper.toResponse(project);
            return success(response, "프로젝트가 성공적으로 수정되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("프로젝트를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("프로젝트", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 프로젝트 ID입니다: " + id);
        }
    }

    @Operation(
        summary = "프로젝트 삭제",
        description = "프로젝트와 관련된 모든 데이터를 삭제합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "삭제 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
        @Parameter(description = "프로젝트 ID", required = true)
        @PathVariable String id
    ) {
        try {
            UUID projectId = UUID.fromString(id);
            projectService.deleteProject(projectId);
            return deleted();
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("프로젝트를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("프로젝트", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 프로젝트 ID입니다: " + id);
        }
    }
}