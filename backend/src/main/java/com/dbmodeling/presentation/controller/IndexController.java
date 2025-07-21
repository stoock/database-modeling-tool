package com.dbmodeling.presentation.controller;

import com.dbmodeling.application.service.IndexService;
import com.dbmodeling.domain.model.Index;
import com.dbmodeling.domain.model.IndexColumn;
import com.dbmodeling.presentation.dto.request.CreateIndexRequest;
import com.dbmodeling.presentation.dto.request.UpdateIndexRequest;
import com.dbmodeling.presentation.dto.response.ApiResponse;
import com.dbmodeling.presentation.dto.response.IndexResponse;
import com.dbmodeling.presentation.dto.response.IndexSummaryResponse;
import com.dbmodeling.presentation.exception.ResourceNotFoundException;
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
 * 인덱스 관리 REST API 컨트롤러
 * 데이터베이스 인덱스의 CRUD 작업을 처리합니다.
 */
@RestController
@RequestMapping(ApiConstants.API_BASE_PATH)
@Tag(name = "인덱스 관리", description = "데이터베이스 인덱스 관리 API")
public class IndexController extends BaseController {

    private final IndexService indexService;

    public IndexController(IndexService indexService) {
        this.indexService = indexService;
    }

    @Operation(
        summary = "테이블의 인덱스 목록 조회",
        description = "특정 테이블에 속한 모든 인덱스를 조회합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "테이블을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping(ApiConstants.TABLES_PATH + "/{tableId}" + ApiConstants.INDEXES_PATH)
    public ResponseEntity<ApiResponse<List<IndexSummaryResponse>>> getIndexesByTable(
        @Parameter(description = "테이블 ID", required = true)
        @PathVariable String tableId
    ) {
        try {
            UUID tableUuid = UUID.fromString(tableId);
            List<Index> indexes = indexService.getIndexesByTableId(tableUuid);
            List<IndexSummaryResponse> responses = indexes.stream()
                .map(this::toIndexSummaryResponse)
                .collect(Collectors.toList());
            return success(responses, "인덱스 목록을 성공적으로 조회했습니다.");
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("유효하지 않은 테이블 ID입니다: " + tableId);
        }
    }

    @Operation(
        summary = "인덱스 상세 조회",
        description = "특정 인덱스의 상세 정보를 조회합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "인덱스를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping(ApiConstants.INDEXES_PATH + "/{id}")
    public ResponseEntity<ApiResponse<IndexResponse>> getIndex(
        @Parameter(description = "인덱스 ID", required = true)
        @PathVariable String id
    ) {
        try {
            UUID indexId = UUID.fromString(id);
            Index index = indexService.getIndexById(indexId);
            IndexResponse response = toIndexResponse(index);
            return success(response, "인덱스를 성공적으로 조회했습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("인덱스를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("인덱스", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 인덱스 ID입니다: " + id);
        }
    }

    @Operation(
        summary = "인덱스 생성",
        description = "테이블에 새로운 인덱스를 생성합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "생성 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "테이블을 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping(ApiConstants.TABLES_PATH + "/{tableId}" + ApiConstants.INDEXES_PATH)
    public ResponseEntity<ApiResponse<IndexResponse>> createIndex(
        @Parameter(description = "테이블 ID", required = true)
        @PathVariable String tableId,
        @Parameter(description = "인덱스 생성 요청", required = true)
        @Valid @RequestBody CreateIndexRequest request
    ) {
        try {
            UUID tableUuid = UUID.fromString(tableId);
            Index index = toIndexEntity(request);
            index.setTableId(tableUuid);
            
            Index createdIndex = indexService.createIndex(index);
            IndexResponse response = toIndexResponse(createdIndex);
            return created(response, "인덱스가 성공적으로 생성되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("테이블을 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("테이블", tableId);
            }
            throw new ResourceNotFoundException("유효하지 않은 테이블 ID입니다: " + tableId);
        }
    }

    @Operation(
        summary = "인덱스 수정",
        description = "기존 인덱스의 정보를 수정합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "인덱스를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping(ApiConstants.INDEXES_PATH + "/{id}")
    public ResponseEntity<ApiResponse<IndexResponse>> updateIndex(
        @Parameter(description = "인덱스 ID", required = true)
        @PathVariable String id,
        @Parameter(description = "인덱스 수정 요청", required = true)
        @Valid @RequestBody UpdateIndexRequest request
    ) {
        try {
            UUID indexId = UUID.fromString(id);
            Index existingIndex = indexService.getIndexById(indexId);
            
            updateIndexEntity(existingIndex, request);
            Index updatedIndex = indexService.updateIndex(existingIndex);
            
            IndexResponse response = toIndexResponse(updatedIndex);
            return success(response, "인덱스가 성공적으로 수정되었습니다.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("인덱스를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("인덱스", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 인덱스 ID입니다: " + id);
        }
    }

    @Operation(
        summary = "인덱스 삭제",
        description = "인덱스를 삭제합니다."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "삭제 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "인덱스를 찾을 수 없음"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping(ApiConstants.INDEXES_PATH + "/{id}")
    public ResponseEntity<Void> deleteIndex(
        @Parameter(description = "인덱스 ID", required = true)
        @PathVariable String id
    ) {
        try {
            UUID indexId = UUID.fromString(id);
            indexService.deleteIndex(indexId);
            return deleted();
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("인덱스를 찾을 수 없습니다")) {
                throw new ResourceNotFoundException("인덱스", id);
            }
            throw new ResourceNotFoundException("유효하지 않은 인덱스 ID입니다: " + id);
        }
    }

    // 매퍼 메서드들
    private IndexSummaryResponse toIndexSummaryResponse(Index index) {
        IndexSummaryResponse response = new IndexSummaryResponse();
        response.setId(index.getId().toString());
        response.setTableId(index.getTableId().toString());
        response.setName(index.getName());
        response.setType(index.getType().name());
        response.setUnique(index.isUnique());
        
        List<IndexSummaryResponse.IndexColumnInfo> columnInfos = index.getColumns().stream()
            .map(indexColumn -> new IndexSummaryResponse.IndexColumnInfo(
                indexColumn.getColumnId().toString(),
                indexColumn.getColumnName(),
                indexColumn.getOrder().name()
            ))
            .collect(Collectors.toList());
        response.setColumns(columnInfos);
        
        response.setCreatedAt(index.getCreatedAt());
        response.setUpdatedAt(index.getUpdatedAt());
        return response;
    }

    private IndexResponse toIndexResponse(Index index) {
        List<IndexSummaryResponse.IndexColumnInfo> columnInfos = index.getColumns().stream()
            .map(indexColumn -> new IndexSummaryResponse.IndexColumnInfo(
                indexColumn.getColumnId().toString(),
                indexColumn.getColumnName(),
                indexColumn.getOrder().name()
            ))
            .collect(Collectors.toList());

        return new IndexResponse(
            index.getId().toString(),
            index.getTableId().toString(),
            index.getName(),
            index.getType().name(),
            index.isUnique(),
            columnInfos,
            index.getCreatedAt(),
            index.getUpdatedAt()
        );
    }

    private Index toIndexEntity(CreateIndexRequest request) {
        Index index = new Index();
        index.setName(request.getName());
        index.setType(Index.IndexType.valueOf(request.getType()));
        index.setUnique(request.getIsUnique() != null ? request.getIsUnique() : false);
        
        List<IndexColumn> indexColumns = request.getColumns().stream()
            .map(columnRequest -> {
                IndexColumn indexColumn = new IndexColumn();
                indexColumn.setColumnId(UUID.fromString(columnRequest.getColumnId()));
                indexColumn.setOrder(IndexColumn.SortOrder.valueOf(columnRequest.getOrder()));
                return indexColumn;
            })
            .collect(Collectors.toList());
        index.setColumns(indexColumns);
        
        return index;
    }

    private void updateIndexEntity(Index index, UpdateIndexRequest request) {
        if (request.getName() != null) {
            index.setName(request.getName());
        }
        if (request.getType() != null) {
            index.setType(Index.IndexType.valueOf(request.getType()));
        }
        if (request.getIsUnique() != null) {
            index.setUnique(request.getIsUnique());
        }
        if (request.getColumns() != null) {
            List<IndexColumn> indexColumns = request.getColumns().stream()
                .map(columnRequest -> {
                    IndexColumn indexColumn = new IndexColumn();
                    indexColumn.setColumnId(UUID.fromString(columnRequest.getColumnId()));
                    indexColumn.setOrder(IndexColumn.SortOrder.valueOf(columnRequest.getOrder()));
                    return indexColumn;
                })
                .collect(Collectors.toList());
            index.setColumns(indexColumns);
        }
    }
}