package com.dbmodeling.domain.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 컬럼 도메인 모델 테스트
 */
class ColumnTest {

    @Test
    void 컬럼_생성_테스트() {
        // Given
        String name = "id";
        MSSQLDataType dataType = MSSQLDataType.BIGINT;
        Integer orderIndex = 1;

        // When
        Column column = new Column(name, dataType, orderIndex);

        // Then
        assertNotNull(column.getId());
        assertEquals(name, column.getName());
        assertEquals(dataType, column.getDataType());
        assertEquals(orderIndex, column.getOrderIndex());
        assertNotNull(column.getCreatedAt());
        assertNotNull(column.getUpdatedAt());
        assertTrue(column.isNullable());
        assertFalse(column.isPrimaryKey());
        assertFalse(column.isIdentity());
        assertEquals(1, column.getIdentitySeed());
        assertEquals(1, column.getIdentityIncrement());
    }

    @Test
    void 컬럼_정보_수정_테스트() {
        // Given
        Column column = new Column("원래이름", MSSQLDataType.INT, 1);
        String newName = "새이름";
        String newDescription = "새설명";
        MSSQLDataType newDataType = MSSQLDataType.NVARCHAR;

        // When
        column.updateColumn(newName, newDescription, newDataType);

        // Then
        assertEquals(newName, column.getName());
        assertEquals(newDescription, column.getDescription());
        assertEquals(newDataType, column.getDataType());
    }

    @Test
    void 데이터타입_속성_설정_테스트() {
        // Given
        Column column = new Column("name", MSSQLDataType.NVARCHAR, 1);
        Integer maxLength = 100;
        Integer precision = 18;
        Integer scale = 2;

        // When
        column.setDataTypeProperties(maxLength, precision, scale);

        // Then
        assertEquals(maxLength, column.getMaxLength());
        assertEquals(precision, column.getPrecision());
        assertEquals(scale, column.getScale());
    }

    @Test
    void 기본키_설정_테스트() {
        // Given
        Column column = new Column("id", MSSQLDataType.BIGINT, 1);

        // When
        column.setPrimaryKey(true);

        // Then
        assertTrue(column.isPrimaryKey());
        assertFalse(column.isNullable()); // 기본키는 자동으로 NOT NULL
    }

    @Test
    void 자동증가_속성_설정_테스트() {
        // Given
        Column column = new Column("id", MSSQLDataType.BIGINT, 1);
        Integer seed = 100;
        Integer increment = 10;

        // When
        column.setIdentityProperties(true, seed, increment);

        // Then
        assertTrue(column.isIdentity());
        assertEquals(seed, column.getIdentitySeed());
        assertEquals(increment, column.getIdentityIncrement());
    }

    @Test
    void 자동증가_기본값_설정_테스트() {
        // Given
        Column column = new Column("id", MSSQLDataType.BIGINT, 1);

        // When
        column.setIdentityProperties(true, null, null);

        // Then
        assertTrue(column.isIdentity());
        assertEquals(1, column.getIdentitySeed());
        assertEquals(1, column.getIdentityIncrement());
    }

    @Test
    void 기본키_NULL_허용_시_예외_발생_테스트() {
        // Given
        Column column = new Column("id", MSSQLDataType.BIGINT, 1);
        column.setPrimaryKey(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            column.setNullableWithValidation(true);
        });
    }

    @Test
    void 일반_컬럼_NULL_허용_설정_테스트() {
        // Given
        Column column = new Column("name", MSSQLDataType.NVARCHAR, 1);

        // When
        column.setNullableWithValidation(false);

        // Then
        assertFalse(column.isNullable());
    }

    @Test
    void 길이_필요한_데이터타입_확인_테스트() {
        // Given
        Column varcharColumn = new Column("name", MSSQLDataType.NVARCHAR, 1);
        Column intColumn = new Column("age", MSSQLDataType.INT, 2);

        // When & Then
        assertTrue(varcharColumn.requiresLength());
        assertFalse(intColumn.requiresLength());
    }

    @Test
    void 정밀도_필요한_데이터타입_확인_테스트() {
        // Given
        Column decimalColumn = new Column("price", MSSQLDataType.DECIMAL, 1);
        Column intColumn = new Column("age", MSSQLDataType.INT, 2);

        // When & Then
        assertTrue(decimalColumn.requiresPrecision());
        assertFalse(intColumn.requiresPrecision());
    }

    @Test
    void NVARCHAR_데이터타입_속성_테스트() {
        // Given
        MSSQLDataType dataType = MSSQLDataType.NVARCHAR;

        // When & Then
        assertTrue(dataType.requiresLength());
        assertFalse(dataType.requiresPrecision());
        assertFalse(dataType.requiresScale());
        assertTrue(dataType.canBePrimaryKey());
        assertFalse(dataType.supportsIdentity());
    }

    @Test
    void DECIMAL_데이터타입_속성_테스트() {
        // Given
        MSSQLDataType dataType = MSSQLDataType.DECIMAL;

        // When & Then
        assertFalse(dataType.requiresLength());
        assertTrue(dataType.requiresPrecision());
        assertTrue(dataType.requiresScale());
        assertTrue(dataType.canBePrimaryKey());
        assertTrue(dataType.supportsIdentity());
    }

    @Test
    void BIGINT_데이터타입_속성_테스트() {
        // Given
        MSSQLDataType dataType = MSSQLDataType.BIGINT;

        // When & Then
        assertFalse(dataType.requiresLength());
        assertFalse(dataType.requiresPrecision());
        assertFalse(dataType.requiresScale());
        assertTrue(dataType.canBePrimaryKey());
        assertTrue(dataType.supportsIdentity());
    }

    @Test
    void TEXT_데이터타입_기본키_불가_테스트() {
        // Given
        MSSQLDataType dataType = MSSQLDataType.TEXT;

        // When & Then
        assertFalse(dataType.canBePrimaryKey());
        assertFalse(dataType.supportsIdentity());
    }
}