package com.dbmodeling.presentation.controller;

import com.dbmodeling.application.service.ValidationService;
import com.dbmodeling.domain.model.NamingRules;
import com.dbmodeling.domain.model.Project;
import com.dbmodeling.domain.repository.ProjectRepository;
import com.dbmodeling.presentation.dto.request.ValidationRequest;
import com.dbmodeling.presentation.dto.response.ApiResponse;
import com.dbmodeling.presentation.dto.response.ValidationResponse;
import com.dbmodeling.presentation.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * 네이밍 규칙 검증 REST API 컨트롤러
 * 테이블, 컬럼, 인덱스 이름의 네이밍 규칙 검증을 처리합니다.
 */
@RestController
@RequestMapping(ApiConstants.API_BASE_PATH)
@Tag(name = "검증", description = "네이밍 규칙 검증 API")
public class ValidationController extends BaseController {

    private final ValidationService validationService;
    private final ProjectRepository projectRepository;

    public ValidationController(ValidationService validationService, ProjectRepository projectRepository) {
        this.validationService = validationService;
        this.projectRepository = projectRepository;
    }

    @Operation(
        summary = "네이밍 규칙 검증",
        description = "프로젝트의 네이밍 규칙에 따라 이름을 검증합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "검증 완료"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping(ApiConstants.PROJECTS_PATH + "/{projectId}" + ApiConstants.VALIDATION_PATH)
    public ResponseEntity<ApiResponse<ValidationResponse>> validateNaming(
        @Parameter(description = "프로젝트 ID", required = true)
        @PathVariable String projectId,
        @Parameter(description = "검증 요청", required = true)
        @Valid @RequestBody ValidationRequest request
    ) {
        try {
            UUID projectUuid = UUID.fromString(projectId);
            Project project = projectRepository.findById(projectUuid)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트", projectId));
            
            ValidationResponse response = validateName(request.getName(), request.getType(), project.getNamingRules());
            return success(response, "네이밍 규칙 검증이 완료되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("프로젝트를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("프로젝트", projectId);
            }
            throw new ResourceNotFoundException("유효하지 않은 프로젝트 ID입니다: " + projectId);
        }
    }

    @Operation(
        summary = "프로젝트 전체 검증",
        description = "프로젝트의 모든 테이블, 컬럼, 인덱스 이름을 검증합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "검증 완료"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping(ApiConstants.PROJECTS_PATH + "/{projectId}" + ApiConstants.VALIDATION_PATH + "/all")
    public ResponseEntity<ApiResponse<List<ValidationResponse>>> validateProject(
        @Parameter(description = "프로젝트 ID", required = true)
        @PathVariable String projectId
    ) {
        try {
            UUID projectUuid = UUID.fromString(projectId);
            ValidationService.ValidationResult validationResult = validationService.validateProject(projectUuid);
            
            List<ValidationResponse> validationResponses = convertToValidationResponses(validationResult);
            
            long errorCount = validationResult.getErrors().size();
            
            String message = errorCount == 0 
                ? "모든 네이밍 규칙 검증이 성공했습니다."
                : String.format("총 %d개의 네이밍 규칙 위반이 발견되었습니다.", errorCount);
            
            return success(validationResponses, message);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("유효하지 않은 프로젝트 ID입니다: " + projectId);
        }
    }

    /**
     * 개별 이름 검증 로직
     */
    private ValidationResponse validateName(String name, String type, NamingRules namingRules) {
        List<ValidationResponse.ValidationError> errors = new ArrayList<>();
        String suggestion = null;
        
        if (namingRules == null) {
            return new ValidationResponse(true, name, type, errors, suggestion);
        }
        
        switch (type.toUpperCase()) {
            case "TABLE":
                validateTableName(name, namingRules, errors);
                suggestion = generateTableSuggestion(name, namingRules);
                break;
            case "COLUMN":
                validateColumnName(name, namingRules, errors);
                suggestion = generateColumnSuggestion(name, namingRules);
                break;
            case "INDEX":
                validateIndexName(name, namingRules, errors);
                suggestion = generateIndexSuggestion(name, namingRules);
                break;
            default:
                errors.add(new ValidationResponse.ValidationError(
                    "INVALID_TYPE",
                    "지원하지 않는 검증 타입입니다: " + type,
                    null
                ));
        }
        
        boolean isValid = errors.isEmpty();
        return new ValidationResponse(isValid, name, type, errors, suggestion);
    }

    private void validateTableName(String name, NamingRules rules, List<ValidationResponse.ValidationError> errors) {
        // 접두사 검증
        if (rules.getTablePrefix() != null && !name.startsWith(rules.getTablePrefix())) {
            errors.add(new ValidationResponse.ValidationError(
                "TABLE_PREFIX_VIOLATION",
                "테이블명이 필수 접두사로 시작하지 않습니다.",
                "접두사: " + rules.getTablePrefix()
            ));
        }
        
        // 접미사 검증
        if (rules.getTableSuffix() != null && !name.endsWith(rules.getTableSuffix())) {
            errors.add(new ValidationResponse.ValidationError(
                "TABLE_SUFFIX_VIOLATION",
                "테이블명이 필수 접미사로 끝나지 않습니다.",
                "접미사: " + rules.getTableSuffix()
            ));
        }
        
        // 패턴 검증
        if (rules.getTablePattern() != null && !Pattern.matches(rules.getTablePattern(), name)) {
            errors.add(new ValidationResponse.ValidationError(
                "TABLE_PATTERN_VIOLATION",
                "테이블명이 네이밍 패턴을 위반했습니다.",
                "패턴: " + rules.getTablePattern()
            ));
        }
        
        // 케이스 규칙 검증
        validateCaseRule(name, rules.getEnforceCase(), "TABLE", errors);
    }

    private void validateColumnName(String name, NamingRules rules, List<ValidationResponse.ValidationError> errors) {
        // 패턴 검증
        if (rules.getColumnPattern() != null && !Pattern.matches(rules.getColumnPattern(), name)) {
            errors.add(new ValidationResponse.ValidationError(
                "COLUMN_PATTERN_VIOLATION",
                "컬럼명이 네이밍 패턴을 위반했습니다.",
                "패턴: " + rules.getColumnPattern()
            ));
        }
        
        // 케이스 규칙 검증
        validateCaseRule(name, rules.getEnforceCase(), "COLUMN", errors);
    }

    private void validateIndexName(String name, NamingRules rules, List<ValidationResponse.ValidationError> errors) {
        // 패턴 검증
        if (rules.getIndexPattern() != null && !Pattern.matches(rules.getIndexPattern(), name)) {
            errors.add(new ValidationResponse.ValidationError(
                "INDEX_PATTERN_VIOLATION",
                "인덱스명이 네이밍 패턴을 위반했습니다.",
                "패턴: " + rules.getIndexPattern()
            ));
        }
        
        // 케이스 규칙 검증
        validateCaseRule(name, rules.getEnforceCase(), "INDEX", errors);
    }

    private void validateCaseRule(String name, NamingRules.CaseType caseType, String type, 
                                 List<ValidationResponse.ValidationError> errors) {
        if (caseType == null) return;
        
        switch (caseType) {
            case UPPER:
                if (!name.equals(name.toUpperCase())) {
                    errors.add(new ValidationResponse.ValidationError(
                        type + "_CASE_VIOLATION",
                        type.toLowerCase() + "명이 대문자 규칙을 위반했습니다.",
                        "모든 문자는 대문자여야 합니다."
                    ));
                }
                break;
            case LOWER:
                if (!name.equals(name.toLowerCase())) {
                    errors.add(new ValidationResponse.ValidationError(
                        type + "_CASE_VIOLATION",
                        type.toLowerCase() + "명이 소문자 규칙을 위반했습니다.",
                        "모든 문자는 소문자여야 합니다."
                    ));
                }
                break;
            case PASCAL:
                if (!Pattern.matches("^[A-Z][a-zA-Z0-9]*$", name)) {
                    errors.add(new ValidationResponse.ValidationError(
                        type + "_CASE_VIOLATION",
                        type.toLowerCase() + "명이 PascalCase 규칙을 위반했습니다.",
                        "첫 글자는 대문자, 나머지는 대소문자 조합이어야 합니다."
                    ));
                }
                break;
            case SNAKE:
                if (!Pattern.matches("^[a-z][a-z0-9_]*$", name)) {
                    errors.add(new ValidationResponse.ValidationError(
                        type + "_CASE_VIOLATION",
                        type.toLowerCase() + "명이 snake_case 규칙을 위반했습니다.",
                        "소문자와 언더스코어만 사용해야 합니다."
                    ));
                }
                break;
        }
    }

    private String generateTableSuggestion(String name, NamingRules rules) {
        String suggestion = name;
        
        // 접두사 추가
        if (rules.getTablePrefix() != null && !suggestion.startsWith(rules.getTablePrefix())) {
            suggestion = rules.getTablePrefix() + suggestion;
        }
        
        // 접미사 추가
        if (rules.getTableSuffix() != null && !suggestion.endsWith(rules.getTableSuffix())) {
            suggestion = suggestion + rules.getTableSuffix();
        }
        
        // 케이스 규칙 적용
        suggestion = applyCaseRule(suggestion, rules.getEnforceCase());
        
        return suggestion.equals(name) ? null : suggestion;
    }

    private String generateColumnSuggestion(String name, NamingRules rules) {
        return applyCaseRule(name, rules.getEnforceCase());
    }

    private String generateIndexSuggestion(String name, NamingRules rules) {
        return applyCaseRule(name, rules.getEnforceCase());
    }

    private String applyCaseRule(String name, NamingRules.CaseType caseType) {
        if (caseType == null) return name;
        
        switch (caseType) {
            case UPPER:
                return name.toUpperCase();
            case LOWER:
                return name.toLowerCase();
            case PASCAL:
                return toPascalCase(name);
            case SNAKE:
                return toSnakeCase(name);
            default:
                return name;
        }
    }

    private String toPascalCase(String name) {
        if (name == null || name.isEmpty()) return name;
        return Character.toUpperCase(name.charAt(0)) + name.substring(1).toLowerCase();
    }

    private String toSnakeCase(String name) {
        if (name == null || name.isEmpty()) return name;
        return name.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }
    
    /**
     * ValidationResult를 ValidationResponse 리스트로 변환
     */
    private List<ValidationResponse> convertToValidationResponses(ValidationService.ValidationResult result) {
        List<ValidationResponse> responses = new ArrayList<>();
        
        // 오류들을 ValidationResponse로 변환
        for (ValidationService.ValidationError error : result.getErrors()) {
            List<ValidationResponse.ValidationError> errors = new ArrayList<>();
            errors.add(new ValidationResponse.ValidationError(
                error.getErrorType().name(),
                error.getMessage(),
                error.getSuggestion()
            ));
            
            ValidationResponse response = new ValidationResponse(
                false, // 오류가 있으므로 valid = false
                error.getObjectName(),
                error.getObjectType(),
                errors,
                error.getSuggestion()
            );
            responses.add(response);
        }
        
        // 경고들을 ValidationResponse로 변환
        for (ValidationService.ValidationError warning : result.getWarnings()) {
            List<ValidationResponse.ValidationError> warnings = new ArrayList<>();
            warnings.add(new ValidationResponse.ValidationError(
                warning.getErrorType().name(),
                warning.getMessage(),
                warning.getSuggestion()
            ));
            
            ValidationResponse response = new ValidationResponse(
                true, // 경고는 valid = true로 처리
                warning.getObjectName(),
                warning.getObjectType(),
                warnings,
                warning.getSuggestion()
            );
            responses.add(response);
        }
        
        return responses;
    }
}