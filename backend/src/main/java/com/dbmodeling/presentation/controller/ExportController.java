package com.dbmodeling.presentation.controller;

import com.dbmodeling.application.service.ExportService;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.presentation.dto.request.ExportRequest;
import com.dbmodeling.presentation.dto.response.ApiResponse;
import com.dbmodeling.presentation.dto.response.ExportResponse;
import com.dbmodeling.presentation.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 스키마 내보내기 REST API 컨트롤러
 * MSSQL 스키마 생성 및 내보내기를 처리합니다.
 */
@RestController
@RequestMapping(ApiConstants.API_BASE_PATH)
@Tag(name = "스키마 내보내기", description = "MSSQL 스키마 생성 및 내보내기 API")
public class ExportController extends BaseController {

    private final ExportService exportService;
    private final ProjectRepository projectRepository;

    public ExportController(ExportService exportService, ProjectRepository projectRepository) {
        this.exportService = exportService;
        this.projectRepository = projectRepository;
    }

    @Operation(
        summary = "스키마 미리보기",
        description = "프로젝트의 MSSQL 스키마를 미리보기 형태로 생성합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "생성 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping(ApiConstants.PROJECTS_PATH + "/{projectId}" + ApiConstants.EXPORT_PATH + "/preview")
    public ResponseEntity<ApiResponse<ExportResponse>> previewSchema(
        @Parameter(description = "프로젝트 ID", required = true)
        @PathVariable String projectId,
        @Parameter(description = "내보내기 옵션")
        @Valid @RequestBody(required = false) ExportRequest request
    ) {
        try {
            UUID projectUuid = UUID.fromString(projectId);
            Project project = projectRepository.findById(projectUuid)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트", projectId));
            
            if (request == null) {
                request = new ExportRequest();
            }
            
            ExportResponse response = generateExportResponse(project, request);
            return success(response, "스키마 미리보기가 성공적으로 생성되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("프로젝트를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("프로젝트", projectId);
            }
            throw new ResourceNotFoundException("유효하지 않은 프로젝트 ID입니다: " + projectId);
        }
    }

    @Operation(
        summary = "SQL 스크립트 생성",
        description = "프로젝트의 MSSQL DDL 스크립트를 생성합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "생성 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping(ApiConstants.PROJECTS_PATH + "/{projectId}" + ApiConstants.EXPORT_PATH + "/sql")
    public ResponseEntity<ApiResponse<ExportResponse>> generateSql(
        @Parameter(description = "프로젝트 ID", required = true)
        @PathVariable String projectId,
        @Parameter(description = "내보내기 옵션")
        @Valid @RequestBody(required = false) ExportRequest request
    ) {
        try {
            UUID projectUuid = UUID.fromString(projectId);
            Project project = projectRepository.findById(projectUuid)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트", projectId));
            
            if (request == null) {
                request = new ExportRequest();
                request.setFormat("SQL");
            }
            
            ExportResponse response = generateExportResponse(project, request);
            return success(response, "SQL 스크립트가 성공적으로 생성되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("프로젝트를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("프로젝트", projectId);
            }
            throw new ResourceNotFoundException("유효하지 않은 프로젝트 ID입니다: " + projectId);
        }
    }

    @Operation(
        summary = "스키마 다운로드",
        description = "프로젝트의 MSSQL 스키마를 파일로 다운로드합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "다운로드 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping(ApiConstants.PROJECTS_PATH + "/{projectId}" + ApiConstants.EXPORT_PATH + "/download")
    public ResponseEntity<byte[]> downloadSchema(
        @Parameter(description = "프로젝트 ID", required = true)
        @PathVariable String projectId,
        @Parameter(description = "내보내기 옵션")
        @Valid @RequestBody(required = false) ExportRequest request
    ) {
        try {
            UUID projectUuid = UUID.fromString(projectId);
            Project project = projectRepository.findById(projectUuid)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트", projectId));
            
            if (request == null) {
                request = new ExportRequest();
            }
            
            ExportResponse exportResponse = generateExportResponse(project, request);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(exportResponse.getContentType()));
            headers.setContentDispositionFormData("attachment", exportResponse.getFileName());
            headers.setContentLength(exportResponse.getFileSize());
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(exportResponse.getContent().getBytes());
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("프로젝트를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("프로젝트", projectId);
            }
            throw new ResourceNotFoundException("유효하지 않은 프로젝트 ID입니다: " + projectId);
        }
    }

    @Operation(
        summary = "지원되는 내보내기 형식 조회",
        description = "지원되는 모든 내보내기 형식과 설명을 조회합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping(ApiConstants.EXPORT_PATH + "/formats")
    public ResponseEntity<ApiResponse<Object>> getSupportedFormats() {
        Object formats = java.util.Map.of(
            "SQL", java.util.Map.of(
                "description", "MSSQL DDL 스크립트",
                "contentType", "application/sql",
                "extension", ".sql"
            ),
            "MARKDOWN", java.util.Map.of(
                "description", "마크다운 문서",
                "contentType", "text/markdown",
                "extension", ".md"
            ),
            "HTML", java.util.Map.of(
                "description", "HTML 문서",
                "contentType", "text/html",
                "extension", ".html"
            ),
            "JSON", java.util.Map.of(
                "description", "JSON 스키마",
                "contentType", "application/json",
                "extension", ".json"
            ),
            "CSV", java.util.Map.of(
                "description", "CSV 테이블 정의",
                "contentType", "text/csv",
                "extension", ".csv"
            )
        );
        
        return success(formats, "지원되는 내보내기 형식을 성공적으로 조회했습니다.");
    }

    /**
     * ExportResponse 생성 로직
     */
    private ExportResponse generateExportResponse(Project project, ExportRequest request) {
        String content;
        String fileName;
        String contentType;
        UUID projectId = project.getId();
        
        switch (request.getFormat().toUpperCase()) {
            case "SQL":
                // ExportRequest를 SchemaGenerationOptions로 변환
                com.dbmodeling.domain.model.SchemaGenerationOptions options = 
                    new com.dbmodeling.domain.model.SchemaGenerationOptions();
                options.setIncludeDropStatements(request.isIncludeDropStatements());
                options.setIncludeComments(request.isIncludeComments());
                options.setIncludeIndexes(request.isIncludeIndexes());
                options.setIncludeConstraints(request.isIncludeConstraints());
                options.setIncludeExistenceChecks(false);
                options.setGenerateBatchScript(false);
                
                if (request.isIncludeValidation()) {
                    content = exportService.generateSqlScriptWithValidation(projectId);
                } else {
                    content = exportService.generateSqlScript(projectId, options);
                }
                fileName = project.getName().replaceAll("[^a-zA-Z0-9]", "_") + "_schema.sql";
                contentType = ApiConstants.CONTENT_TYPE_SQL;
                break;
            case "MARKDOWN":
                content = exportService.generateDocumentation(projectId);
                fileName = project.getName().replaceAll("[^a-zA-Z0-9]", "_") + "_schema.md";
                contentType = "text/markdown";
                break;
            case "HTML":
                content = exportService.generateHtmlDocumentation(projectId);
                fileName = project.getName().replaceAll("[^a-zA-Z0-9]", "_") + "_schema.html";
                contentType = "text/html";
                break;
            case "JSON":
                content = exportService.generateJsonSchema(projectId);
                fileName = project.getName().replaceAll("[^a-zA-Z0-9]", "_") + "_schema.json";
                contentType = ApiConstants.CONTENT_TYPE_JSON;
                break;
            case "CSV":
                content = exportService.generateCsvTableList(projectId);
                fileName = project.getName().replaceAll("[^a-zA-Z0-9]", "_") + "_schema.csv";
                contentType = ApiConstants.CONTENT_TYPE_CSV;
                break;
            default:
                throw new IllegalArgumentException("지원하지 않는 내보내기 형식입니다: " + request.getFormat());
        }
        
        ExportResponse response = new ExportResponse(request.getFormat(), content, fileName, contentType);
        response.setTableCount(project.getTables() != null ? project.getTables().size() : 0);
        response.setIndexCount(project.getTables() != null ? 
            project.getTables().stream()
                .mapToInt(table -> table.getIndexes() != null ? table.getIndexes().size() : 0)
                .sum() : 0);
        
        return response;
    }
}