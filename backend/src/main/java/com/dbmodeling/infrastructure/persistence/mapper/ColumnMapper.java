package com.dbmodeling.infrastructure.persistence.mapper;

import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.MSSQLDataType;
import com.dbmodeling.infrastructure.persistence.entity.ColumnEntity;
import org.springframework.stereotype.Component;

/**
 * 컬럼 Entity-Domain 매퍼
 */
@Component
public class ColumnMapper {
    
    /**
     * Entity를 Domain으로 변환
     */
    public Column toDomain(ColumnEntity entity) {
        if (entity == null) {
            return null;
        }
        
        Column column = new Column();
        column.setId(entity.getId());
        column.setTableId(entity.getTable() != null ? entity.getTable().getId() : null);
        column.setName(entity.getName());
        column.setDescription(entity.getDescription());
        column.setDataType(parseDataType(entity.getDataType()));
        column.setMaxLength(entity.getMaxLength());
        column.setPrecision(entity.getPrecision());
        column.setScale(entity.getScale());
        column.setNullable(entity.getIsNullable());
        column.setPrimaryKey(entity.getIsPrimaryKey());
        column.setIdentity(entity.getIsIdentity());
        column.setIdentitySeed(entity.getIdentitySeed());
        column.setIdentityIncrement(entity.getIdentityIncrement());
        column.setDefaultValue(entity.getDefaultValue());
        column.setOrderIndex(entity.getOrderIndex());
        column.setCreatedAt(entity.getCreatedAt());
        column.setUpdatedAt(entity.getUpdatedAt());
        
        return column;
    }
    
    /**
     * Domain을 Entity로 변환
     */
    public ColumnEntity toEntity(Column domain) {
        if (domain == null) {
            return null;
        }
        
        ColumnEntity entity = new ColumnEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setDataType(serializeDataType(domain.getDataType()));
        entity.setMaxLength(domain.getMaxLength());
        entity.setPrecision(domain.getPrecision());
        entity.setScale(domain.getScale());
        entity.setIsNullable(domain.isNullable());
        entity.setIsPrimaryKey(domain.isPrimaryKey());
        entity.setIsIdentity(domain.isIdentity());
        entity.setIdentitySeed(domain.getIdentitySeed());
        entity.setIdentityIncrement(domain.getIdentityIncrement());
        entity.setDefaultValue(domain.getDefaultValue());
        entity.setOrderIndex(domain.getOrderIndex());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        
        return entity;
    }
    
    /**
     * 기존 Entity 업데이트
     */
    public void updateEntity(ColumnEntity entity, Column domain) {
        if (entity == null || domain == null) {
            return;
        }
        
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setDataType(serializeDataType(domain.getDataType()));
        entity.setMaxLength(domain.getMaxLength());
        entity.setPrecision(domain.getPrecision());
        entity.setScale(domain.getScale());
        entity.setIsNullable(domain.isNullable());
        entity.setIsPrimaryKey(domain.isPrimaryKey());
        entity.setIsIdentity(domain.isIdentity());
        entity.setIdentitySeed(domain.getIdentitySeed());
        entity.setIdentityIncrement(domain.getIdentityIncrement());
        entity.setDefaultValue(domain.getDefaultValue());
        entity.setOrderIndex(domain.getOrderIndex());
        entity.setUpdatedAt(domain.getUpdatedAt());
    }
    
    /**
     * 문자열을 MSSQLDataType으로 파싱
     */
    private MSSQLDataType parseDataType(String dataTypeString) {
        if (dataTypeString == null || dataTypeString.trim().isEmpty()) {
            return MSSQLDataType.NVARCHAR;
        }
        
        try {
            return MSSQLDataType.valueOf(dataTypeString.toUpperCase());
        } catch (IllegalArgumentException e) {
            // 파싱 실패 시 기본값 반환
            return MSSQLDataType.NVARCHAR;
        }
    }
    
    /**
     * MSSQLDataType을 문자열로 직렬화
     */
    private String serializeDataType(MSSQLDataType dataType) {
        return dataType != null ? dataType.name() : MSSQLDataType.NVARCHAR.name();
    }
}