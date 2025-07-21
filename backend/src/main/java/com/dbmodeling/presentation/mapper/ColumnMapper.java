package com.dbmodeling.presentation.mapper;

import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.MSSQLDataType;
import com.dbmodeling.presentation.dto.request.CreateColumnRequest;
import com.dbmodeling.presentation.dto.request.UpdateColumnRequest;
import com.dbmodeling.presentation.dto.response.ColumnResponse;
import org.springframework.stereotype.Component;

/**
 * 컬럼 DTO 매퍼
 * 도메인 모델과 DTO 간의 변환을 담당합니다.
 */
@Component
public class ColumnMapper {

    /**
     * Column 도메인 모델을 ColumnResponse로 변환
     */
    public ColumnResponse toResponse(Column column) {
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
     * CreateColumnRequest를 Column 도메인 모델로 변환
     */
    public Column toEntity(CreateColumnRequest request) {
        Column column = new Column();
        column.setName(request.getName());
        column.setDescription(request.getDescription());
        
        // 데이터 타입 변환
        try {
            column.setDataType(MSSQLDataType.valueOf(request.getDataType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("지원하지 않는 데이터 타입입니다: " + request.getDataType());
        }
        
        column.setMaxLength(request.getMaxLength());
        column.setPrecision(request.getPrecision());
        column.setScale(request.getScale());
        column.setNullable(request.getIsNullable() != null ? request.getIsNullable() : true);
        column.setPrimaryKey(request.getIsPrimaryKey() != null ? request.getIsPrimaryKey() : false);
        column.setIdentity(request.getIsIdentity() != null ? request.getIsIdentity() : false);
        column.setIdentitySeed(request.getIdentitySeed() != null ? request.getIdentitySeed() : 1);
        column.setIdentityIncrement(request.getIdentityIncrement() != null ? request.getIdentityIncrement() : 1);
        column.setDefaultValue(request.getDefaultValue());
        column.setOrderIndex(request.getOrderIndex());
        
        return column;
    }

    /**
     * UpdateColumnRequest로 기존 Column 업데이트
     */
    public void updateEntity(Column column, UpdateColumnRequest request) {
        if (request.getName() != null) {
            column.setName(request.getName());
        }
        if (request.getDescription() != null) {
            column.setDescription(request.getDescription());
        }
        if (request.getDataType() != null) {
            try {
                column.setDataType(MSSQLDataType.valueOf(request.getDataType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("지원하지 않는 데이터 타입입니다: " + request.getDataType());
            }
        }
        if (request.getMaxLength() != null) {
            column.setMaxLength(request.getMaxLength());
        }
        if (request.getPrecision() != null) {
            column.setPrecision(request.getPrecision());
        }
        if (request.getScale() != null) {
            column.setScale(request.getScale());
        }
        if (request.getIsNullable() != null) {
            column.setNullable(request.getIsNullable());
        }
        if (request.getIsPrimaryKey() != null) {
            column.setPrimaryKey(request.getIsPrimaryKey());
        }
        if (request.getIsIdentity() != null) {
            column.setIdentity(request.getIsIdentity());
        }
        if (request.getIdentitySeed() != null) {
            column.setIdentitySeed(request.getIdentitySeed());
        }
        if (request.getIdentityIncrement() != null) {
            column.setIdentityIncrement(request.getIdentityIncrement());
        }
        if (request.getDefaultValue() != null) {
            column.setDefaultValue(request.getDefaultValue());
        }
        if (request.getOrderIndex() != null) {
            column.setOrderIndex(request.getOrderIndex());
        }
    }
}