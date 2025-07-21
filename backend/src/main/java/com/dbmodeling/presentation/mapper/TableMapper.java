package com.dbmodeling.presentation.mapper;

import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.Index;
import com.dbmodeling.domain.model.Table;
import com.dbmodeling.presentation.dto.request.CreateTableRequest;
import com.dbmodeling.presentation.dto.request.UpdateTableRequest;
import com.dbmodeling.presentation.dto.response.ColumnResponse;
import com.dbmodeling.presentation.dto.response.IndexSummaryResponse;
import com.dbmodeling.presentation.dto.response.TableResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 테이블 DTO 매퍼
 * 도메인 모델과 DTO 간의 변환을 담당합니다.
 */
@Component
public class TableMapper {

    /**
     * Table 도메인 모델을 TableResponse로 변환
     */
    public TableResponse toResponse(Table table) {
        return new TableResponse(
            table.getId().toString(),
            table.getProjectId().toString(),
            table.getName(),
            table.getDescription(),
            table.getPositionX(),
            table.getPositionY(),
            toColumnResponses(table.getColumns()),
            toIndexSummaryResponses(table.getIndexes()),
            table.getCreatedAt(),
            table.getUpdatedAt()
        );
    }

    /**
     * CreateTableRequest를 Table 도메인 모델로 변환
     */
    public Table toEntity(CreateTableRequest request) {
        Table table = new Table();
        table.setName(request.getName());
        table.setDescription(request.getDescription());
        table.setPositionX(request.getPositionX() != null ? request.getPositionX() : 0);
        table.setPositionY(request.getPositionY() != null ? request.getPositionY() : 0);
        return table;
    }

    /**
     * UpdateTableRequest로 기존 Table 업데이트
     */
    public void updateEntity(Table table, UpdateTableRequest request) {
        if (request.getName() != null) {
            table.setName(request.getName());
        }
        if (request.getDescription() != null) {
            table.setDescription(request.getDescription());
        }
        if (request.getPositionX() != null) {
            table.setPositionX(request.getPositionX());
        }
        if (request.getPositionY() != null) {
            table.setPositionY(request.getPositionY());
        }
    }

    /**
     * Column 리스트를 ColumnResponse 리스트로 변환
     */
    private List<ColumnResponse> toColumnResponses(List<Column> columns) {
        if (columns == null) {
            return List.of();
        }
        
        return columns.stream()
            .map(this::toColumnResponse)
            .collect(Collectors.toList());
    }

    /**
     * Column 도메인 모델을 ColumnResponse로 변환
     */
    private ColumnResponse toColumnResponse(Column column) {
        ColumnResponse response = new ColumnResponse();
        response.setId(column.getId().toString());
        response.setTableId(column.getTableId().toString());
        response.setName(column.getName());
        response.setDescription(column.getDescription());
        response.setDataType(column.getDataType().name());
        response.setMaxLength(column.getMaxLength());
        response.setPrecision(column.getPrecision());
        response.setScale(column.getScale());
        response.setNullable(column.isNullable());
        response.setPrimaryKey(column.isPrimaryKey());
        response.setIdentity(column.isIdentity());
        response.setIdentitySeed(column.getIdentitySeed());
        response.setIdentityIncrement(column.getIdentityIncrement());
        response.setDefaultValue(column.getDefaultValue());
        response.setOrderIndex(column.getOrderIndex());
        response.setCreatedAt(column.getCreatedAt());
        response.setUpdatedAt(column.getUpdatedAt());
        return response;
    }

    /**
     * Index 리스트를 IndexSummaryResponse 리스트로 변환
     */
    private List<IndexSummaryResponse> toIndexSummaryResponses(List<Index> indexes) {
        if (indexes == null) {
            return List.of();
        }
        
        return indexes.stream()
            .map(this::toIndexSummaryResponse)
            .collect(Collectors.toList());
    }

    /**
     * Index 도메인 모델을 IndexSummaryResponse로 변환
     */
    private IndexSummaryResponse toIndexSummaryResponse(Index index) {
        IndexSummaryResponse response = new IndexSummaryResponse();
        response.setId(index.getId().toString());
        response.setTableId(index.getTableId().toString());
        response.setName(index.getName());
        response.setType(index.getType().name());
        response.setUnique(index.isUnique());
        
        // 인덱스 컬럼 정보 변환
        List<IndexSummaryResponse.IndexColumnInfo> columnInfos = index.getColumns().stream()
            .map(indexColumn -> new IndexSummaryResponse.IndexColumnInfo(
                indexColumn.getColumnId().toString(),
                indexColumn.getColumnName(), // 실제로는 Column 엔티티에서 가져와야 함
                indexColumn.getOrder().name()
            ))
            .collect(Collectors.toList());
        response.setColumns(columnInfos);
        
        response.setCreatedAt(index.getCreatedAt());
        response.setUpdatedAt(index.getUpdatedAt());
        return response;
    }
}