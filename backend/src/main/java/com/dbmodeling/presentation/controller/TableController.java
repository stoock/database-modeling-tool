package com.dbmodeling.presentation.controller;

import com.dbmodeling.application.service.BatchProcessingService;
import com.dbmodeling.application.service.TableService;
import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.Table;
import com.dbmodeling.presentation.dto.request.CreateTableRequest;
import com.dbmodeling.presentation.dto.request.UpdateTableRequest;
import com.dbmodeling.presentation.dto.response.ApiResponse;
import com.dbmodeling.presentation.dto.response.ColumnResponse;
import com.dbmodeling.presentation.dto.response.TableResponse;
import com.dbmodeling.presentation.dto.response.TableSummaryResponse;
import com.dbmodeling.presentation.exception.ResourceNotFoundException;
import com.dbmodeling.presentation.mapper.ColumnMapper;
import com.dbmodeling.presentation.mapper.TableMapper;
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
 * 테이블 관리 REST API 컨트롤러
 * 데이터베이스 테이블의 CRUD 작업을 처리합니다.
 */
@RestController
@RequestMapping(ApiConstants.API_BASE_PATH)
@Tag(name = "테이블 관리", description = "데이터베이스 테이블 관리 API")
public class TableController extends BaseController {

    private final TableService tableService;
    private final BatchProcessingService batchProcessingService;
    private final TableMapper tableMapper;
    private final ColumnMapper columnMapper;

    public TableController(
            TableService tableService, 
            BatchProcessingService batchProcessingService,
            TableMapper tableMapper,
            ColumnMapper columnMapper) {
        this.tableService = tableService;
        this.batchProcessingService = batchProcessingService;
        this.tableMapper = tableMapper;
        this.columnMapper = columnMapper;
    }

    @Operation(
        summary = "프로젝트의 테이블 목록 조회",
        description = "특정 프로젝트에 속한 모든 테이블의 요약 정보를 조회합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping(ApiConstants.PROJECTS_PATH + "/{projectId}" + ApiConstants.TABLES_PATH)
    public ResponseEntity<ApiResponse<List<TableSummaryResponse>>> getTablesByProject(
        @Parameter(description = "프로젝트 ID", required = true)
        @PathVariable String projectId
    ) {
        try {
            UUID projectUuid = UUID.fromString(projectId);
            List<Table> tables = tableService.getTablesByProjectId(projectUuid);
            List<TableSummaryResponse> responses = tables.stream()
                .map(table -> new TableSummaryResponse(
                    table.getId().toString(),
                    table.getName(),
                    table.getDescription(),
                    table.getColumns() != null ? table.getColumns().size() : 0,
                    table.getIndexes() != null ? table.getIndexes().size() : 0,
                    table.getPositionX(),
                    table.getPositionY(),
                    table.getCreatedAt(),
                    table.getUpdatedAt()
                ))
                .collect(Collectors.toList());
            return success(responses, "테이블 목록을 성공적으로 조회했습니다.");
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("유효하지 않은 프로젝트 ID입니다: " + projectId);
        }
    }

    @Operation(
        summary = "테이블 상세 조회",
        description = "특정 테이블의 상세 정보를 조회합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "테이블을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping(ApiConstants.TABLES_PATH + "/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> getTable(
        @Parameter(description = "테이블 ID", required = true)
        @PathVariable String id
    ) {
        try {
            UUID tableId = UUID.fromString(id);
            Table table = tableService.getTableById(tableId);
            TableResponse response = tableMapper.toResponse(table);
            return success(response, "테이블을 성공적으로 조회했습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("테이블을 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("테이블", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 테이블 ID입니다: " + id);
        }
    }

    @Operation(
        summary = "테이블 생성",
        description = "프로젝트에 새로운 테이블을 생성합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "생성 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping(ApiConstants.PROJECTS_PATH + "/{projectId}" + ApiConstants.TABLES_PATH)
    public ResponseEntity<ApiResponse<TableResponse>> createTable(
        @Parameter(description = "프로젝트 ID", required = true)
        @PathVariable String projectId,
        @Parameter(description = "테이블 생성 요청", required = true)
        @Valid @RequestBody CreateTableRequest request
    ) {
        try {
            UUID projectUuid = UUID.fromString(projectId);
            Table table = tableMapper.toEntity(request);
            table.setProjectId(projectUuid);
            
            Table createdTable = tableService.createTable(table);
            TableResponse response = tableMapper.toResponse(createdTable);
            return created(response, "테이블이 성공적으로 생성되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("프로젝트를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("프로젝트", projectId);
            }
            throw new ResourceNotFoundException("유효하지 않은 프로젝트 ID입니다: " + projectId);
        }
    }

    @Operation(
        summary = "테이블 수정",
        description = "기존 테이블의 정보를 수정합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "테이블을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping(ApiConstants.TABLES_PATH + "/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
        @Parameter(description = "테이블 ID", required = true)
        @PathVariable String id,
        @Parameter(description = "테이블 수정 요청", required = true)
        @Valid @RequestBody UpdateTableRequest request
    ) {
        try {
            UUID tableId = UUID.fromString(id);
            Table existingTable = tableService.getTableById(tableId);
            
            tableMapper.updateEntity(existingTable, request);
            Table updatedTable = tableService.updateTable(existingTable);
            
            TableResponse response = tableMapper.toResponse(updatedTable);
            return success(response, "테이블이 성공적으로 수정되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("테이블을 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("테이블", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 테이블 ID입니다: " + id);
        }
    }

    @Operation(
        summary = "테이블 삭제",
        description = "테이블과 관련된 모든 데이터를 삭제합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "삭제 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "테이블을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping(ApiConstants.TABLES_PATH + "/{id}")
    public ResponseEntity<Void> deleteTable(
        @Parameter(description = "테이블 ID", required = true)
        @PathVariable String id
    ) {
        try {
            UUID tableId = UUID.fromString(id);
            tableService.deleteTable(tableId);
            return deleted();
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("테이블을 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("테이블", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 테이블 ID입니다: " + id);
        }
    }

    /**
     * 컬럼 순서 일괄 업데이트 (배치 처리)
     */
    @Operation(
        summary = "컬럼 순서 일괄 업데이트",
        description = "테이블의 컬럼 순서를 일괄적으로 업데이트합니다. 성능 최적화를 위해 배치 처리됩니다."
    )
    @PutMapping(ApiConstants.TABLES_PATH + "/{tableId}/columns/reorder")
    public ResponseEntity<ApiResponse<List<ColumnResponse>>> updateColumnOrder(
        @Parameter(description = "테이블 ID", required = true)
        @PathVariable String tableId,
        @Parameter(description = "컬럼 순서 업데이트 요청", required = true)
        @Valid @RequestBody ColumnOrderUpdateRequest request
    ) {
        try {
            UUID tableUuid = UUID.fromString(tableId);
            
            List<BatchProcessingService.ColumnOrderUpdate> updates = request.getUpdates().stream()
                .map(update -> new BatchProcessingService.ColumnOrderUpdate(
                    update.getColumnId(), 
                    update.getOrderIndex()
                ))
                .collect(Collectors.toList());
            
            List<Column> updatedColumns = batchProcessingService.updateColumnOrderBatch(
                tableId, updates);
            
            List<ColumnResponse> responses = updatedColumns.stream()
                .map(columnMapper::toResponse)
                .collect(Collectors.toList());
            
            return success(responses, "컬럼 순서가 성공적으로 업데이트되었습니다.");
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("유효하지 않은 테이블 ID입니다: " + tableId);
        }
    }

    /**
     * 컬럼 순서 업데이트 요청 DTO
     */
    public static class ColumnOrderUpdateRequest {
        private List<ColumnOrderUpdate> updates;

        public List<ColumnOrderUpdate> getUpdates() { return updates; }
        public void setUpdates(List<ColumnOrderUpdate> updates) { this.updates = updates; }

        public static class ColumnOrderUpdate {
            private String columnId;
            private Integer orderIndex;

            public String getColumnId() { return columnId; }
            public void setColumnId(String columnId) { this.columnId = columnId; }
            public Integer getOrderIndex() { return orderIndex; }
            public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
        }
    }
}