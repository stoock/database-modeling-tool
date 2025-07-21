package com.dbmodeling.presentation.controller;

import com.dbmodeling.application.service.ColumnService;
import com.dbmodeling.domain.model.Column;
import com.dbmodeling.presentation.dto.request.CreateColumnRequest;
import com.dbmodeling.presentation.dto.request.UpdateColumnRequest;
import com.dbmodeling.presentation.dto.response.ApiResponse;
import com.dbmodeling.presentation.dto.response.ColumnResponse;
import com.dbmodeling.presentation.exception.ResourceNotFoundException;
import com.dbmodeling.presentation.mapper.ColumnMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 컬럼 관리 REST API 컨트롤러
 * 테이블 컬럼의 CRUD 작업을 처리합니다.
 */
@RestController
@RequestMapping(ApiConstants.API_BASE_PATH)
@Tag(name = "컬럼 관리", description = "테이블 컬럼 관리 API")
public class ColumnController extends BaseController {

    private final ColumnService columnService;
    private final ColumnMapper columnMapper;

    public ColumnController(ColumnService columnService, ColumnMapper columnMapper) {
        this.columnService = columnService;
        this.columnMapper = columnMapper;
    }

    @Operation(
        summary = "테이블의 컬럼 목록 조회",
        description = "특정 테이블에 속한 모든 컬럼을 조회합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "테이블을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping(ApiConstants.TABLES_PATH + "/{tableId}" + ApiConstants.COLUMNS_PATH)
    public ResponseEntity<ApiResponse<List<ColumnResponse>>> getColumnsByTable(
        @Parameter(description = "테이블 ID", required = true)
        @PathVariable String tableId
    ) {
        try {
            UUID tableUuid = UUID.fromString(tableId);
            List<Column> columns = columnService.getColumnsByTableId(tableUuid);
            List<ColumnResponse> responses = columns.stream()
                .map(columnMapper::toResponse)
                .collect(Collectors.toList());
            return success(responses, "컬럼 목록을 성공적으로 조회했습니다.");
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("유효하지 않은 테이블 ID입니다: " + tableId);
        }
    }

    @Operation(
        summary = "컬럼 상세 조회",
        description = "특정 컬럼의 상세 정보를 조회합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "컬럼을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping(ApiConstants.COLUMNS_PATH + "/{id}")
    public ResponseEntity<ApiResponse<ColumnResponse>> getColumn(
        @Parameter(description = "컬럼 ID", required = true)
        @PathVariable String id
    ) {
        try {
            UUID columnId = UUID.fromString(id);
            Column column = columnService.getColumnById(columnId);
            ColumnResponse response = columnMapper.toResponse(column);
            return success(response, "컬럼을 성공적으로 조회했습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("컬럼을 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("컬럼", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 컬럼 ID입니다: " + id);
        }
    }

    @Operation(
        summary = "컬럼 생성",
        description = "테이블에 새로운 컬럼을 생성합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "생성 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "테이블을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping(ApiConstants.TABLES_PATH + "/{tableId}" + ApiConstants.COLUMNS_PATH)
    public ResponseEntity<ApiResponse<ColumnResponse>> createColumn(
        @Parameter(description = "테이블 ID", required = true)
        @PathVariable String tableId,
        @Parameter(description = "컬럼 생성 요청", required = true)
        @Valid @RequestBody CreateColumnRequest request
    ) {
        try {
            UUID tableUuid = UUID.fromString(tableId);
            Column column = columnMapper.toEntity(request);
            column.setTableId(tableUuid);
            
            Column createdColumn = columnService.createColumn(column);
            ColumnResponse response = columnMapper.toResponse(createdColumn);
            return created(response, "컬럼이 성공적으로 생성되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("테이블을 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("테이블", tableId);
            }
            if (e.getMessage().contains("지원하지 않는 데이터 타입")) {
                throw new IllegalArgumentException(e.getMessage());
            }
            throw new ResourceNotFoundException("유효하지 않은 테이블 ID입니다: " + tableId);
        }
    }

    @Operation(
        summary = "컬럼 수정",
        description = "기존 컬럼의 정보를 수정합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "컬럼을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping(ApiConstants.COLUMNS_PATH + "/{id}")
    public ResponseEntity<ApiResponse<ColumnResponse>> updateColumn(
        @Parameter(description = "컬럼 ID", required = true)
        @PathVariable String id,
        @Parameter(description = "컬럼 수정 요청", required = true)
        @Valid @RequestBody UpdateColumnRequest request
    ) {
        try {
            UUID columnId = UUID.fromString(id);
            Column existingColumn = columnService.getColumnById(columnId);
            
            columnMapper.updateEntity(existingColumn, request);
            Column updatedColumn = columnService.updateColumn(existingColumn);
            
            ColumnResponse response = columnMapper.toResponse(updatedColumn);
            return success(response, "컬럼이 성공적으로 수정되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("컬럼을 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("컬럼", id);
            }
            if (e.getMessage().contains("지원하지 않는 데이터 타입")) {
                throw new IllegalArgumentException(e.getMessage());
            }
            throw new ResourceNotFoundException("유효하지 않은 컬럼 ID입니다: " + id);
        }
    }

    @Operation(
        summary = "컬럼 삭제",
        description = "컬럼을 삭제합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "삭제 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "컬럼을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping(ApiConstants.COLUMNS_PATH + "/{id}")
    public ResponseEntity<Void> deleteColumn(
        @Parameter(description = "컬럼 ID", required = true)
        @PathVariable String id
    ) {
        try {
            UUID columnId = UUID.fromString(id);
            columnService.deleteColumn(columnId);
            return deleted();
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("컬럼을 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("컬럼", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 컬럼 ID입니다: " + id);
        }
    }

    @Operation(
        summary = "컬럼 순서 변경",
        description = "테이블 내에서 컬럼의 순서를 변경합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "순서 변경 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "컬럼을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PatchMapping(ApiConstants.COLUMNS_PATH + "/{id}/order")
    public ResponseEntity<ApiResponse<ColumnResponse>> updateColumnOrder(
        @Parameter(description = "컬럼 ID", required = true)
        @PathVariable String id,
        @Parameter(description = "새로운 순서", required = true)
        @RequestParam int newOrder
    ) {
        try {
            UUID columnId = UUID.fromString(id);
            Column updatedColumn = columnService.updateColumnOrder(columnId, newOrder);
            ColumnResponse response = columnMapper.toResponse(updatedColumn);
            return success(response, "컬럼 순서가 성공적으로 변경되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("컬럼을 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("컬럼", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 컬럼 ID입니다: " + id);
        }
    }
}