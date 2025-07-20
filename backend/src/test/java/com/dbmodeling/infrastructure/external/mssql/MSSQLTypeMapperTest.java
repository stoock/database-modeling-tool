package com.dbmodeling.infrastructure.external.mssql;

import com.dbmodeling.domain.model.Column;
import com.dbmodeling.domain.model.MSSQLDataType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * MSSQLTypeMapper 테스트
 */
class MSSQLTypeMapperTest {

    private MSSQLTypeMapper typeMapper;

    @BeforeEach
    void setUp() {
        typeMapper = new MSSQLTypeMapper();
    }

    @Test
    void NVARCHAR_타입_매핑_테스트() {
        // Given
        Column column = new Column("name", MSSQLDataType.NVARCHAR, 1);
        column.setMaxLength(100);

        // When
        String sqlType = typeMapper.mapToSqlType(column);

        // Then
        assertEquals("NVARCHAR(100)", sqlType);
    }

    @Test
    void DECIMAL_타입_매핑_테스트() {
        // Given
        Column column = new Column("price", MSSQLDataType.DECIMAL, 1);
        column.setPrecision(18);
        column.setScale(2);

        // When
        String sqlType = typeMapper.mapToSqlType(column);

        // Then
        assertEquals("DECIMAL(18,2)", sqlType);
    }

    @Test
    void INT_타입_매핑_테스트() {
        // Given
        Column column = new Column("id", MSSQLDataType.INT, 1);

        // When
        String sqlType = typeMapper.mapToSqlType(column);

        // Then
        assertEquals("INT", sqlType);
    }

    @Test
    void 데이터타입_null_예외_테스트() {
        // Given
        Column column = new Column("test", null, 1);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            typeMapper.mapToSqlType(column);
        });
    }

    @Test
    void NVARCHAR_길이_필수_검증_테스트() {
        // Given
        Column column = new Column("name", MSSQLDataType.NVARCHAR, 1);
        // 길이 설정 안함

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("길이 설정이 필요"));
    }

    @Test
    void DECIMAL_정밀도_필수_검증_테스트() {
        // Given
        Column column = new Column("price", MSSQLDataType.DECIMAL, 1);
        // 정밀도 설정 안함

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("정밀도 설정이 필요"));
    }

    @Test
    void DECIMAL_스케일_필수_검증_테스트() {
        // Given
        Column column = new Column("price", MSSQLDataType.DECIMAL, 1);
        column.setPrecision(18);
        // 스케일 설정 안함

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("스케일 설정이 필요"));
    }

    @Test
    void 스케일이_정밀도보다_큰_경우_검증_테스트() {
        // Given
        Column column = new Column("price", MSSQLDataType.DECIMAL, 1);
        column.setPrecision(10);
        column.setScale(15); // 정밀도보다 큰 스케일

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("스케일은 정밀도보다 클 수 없습니다"));
    }

    @Test
    void 자동증가_지원하지_않는_타입_검증_테스트() {
        // Given
        Column column = new Column("name", MSSQLDataType.NVARCHAR, 1);
        column.setMaxLength(100);
        column.setIdentity(true); // NVARCHAR는 자동증가 지원 안함

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("자동증가(IDENTITY)를 지원하지 않습니다"));
    }

    @Test
    void 기본키_사용_불가_타입_검증_테스트() {
        // Given
        Column column = new Column("content", MSSQLDataType.TEXT, 1);
        column.setPrimaryKey(true); // TEXT는 기본키 사용 불가

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("기본키로 사용할 수 없습니다"));
    }

    @Test
    void NVARCHAR_길이_제한_검증_테스트() {
        // Given
        Column column = new Column("name", MSSQLDataType.NVARCHAR, 1);
        column.setMaxLength(5000); // 4000 초과

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("최대 길이는 4000"));
    }

    @Test
    void VARCHAR_길이_제한_검증_테스트() {
        // Given
        Column column = new Column("name", MSSQLDataType.VARCHAR, 1);
        column.setMaxLength(9000); // 8000 초과

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("최대 길이는 8000"));
    }

    @Test
    void DECIMAL_정밀도_범위_검증_테스트() {
        // Given
        Column column = new Column("price", MSSQLDataType.DECIMAL, 1);
        column.setPrecision(40); // 38 초과
        column.setScale(2);

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("정밀도는 1~38 범위"));
    }

    @Test
    void FLOAT_정밀도_범위_검증_테스트() {
        // Given
        Column column = new Column("value", MSSQLDataType.FLOAT, 1);
        column.setPrecision(60); // 53 초과

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("정밀도는 1~53 범위"));
    }

    @Test
    void TIME_정밀도_범위_검증_테스트() {
        // Given
        Column column = new Column("time_value", MSSQLDataType.TIME, 1);
        column.setPrecision(8); // 7 초과

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("정밀도는 0~7 범위"));
    }

    @Test
    void 정수_기본값_검증_성공_테스트() {
        // Given
        Column column = new Column("age", MSSQLDataType.INT, 1);
        column.setDefaultValue("25");

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertTrue(result.isValid());
    }

    @Test
    void 정수_기본값_검증_실패_테스트() {
        // Given
        Column column = new Column("age", MSSQLDataType.INT, 1);
        column.setDefaultValue("not_a_number");

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("유효한 숫자여야 합니다"));
    }

    @Test
    void 소수_기본값_검증_성공_테스트() {
        // Given
        Column column = new Column("price", MSSQLDataType.DECIMAL, 1);
        column.setPrecision(10);
        column.setScale(2);
        column.setDefaultValue("99.99");

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertTrue(result.isValid());
    }

    @Test
    void BIT_기본값_검증_성공_테스트() {
        // Given
        Column column = new Column("is_active", MSSQLDataType.BIT, 1);
        column.setDefaultValue("1");

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertTrue(result.isValid());
    }

    @Test
    void BIT_기본값_검증_실패_테스트() {
        // Given
        Column column = new Column("is_active", MSSQLDataType.BIT, 1);
        column.setDefaultValue("2"); // 0 또는 1이 아님

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertFalse(result.isValid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrors().get(0).contains("0 또는 1이어야 합니다"));
    }

    @Test
    void 문자열_기본값_경고_테스트() {
        // Given
        Column column = new Column("name", MSSQLDataType.NVARCHAR, 1);
        column.setMaxLength(100);
        column.setDefaultValue("default_name"); // 작은따옴표 없음

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertTrue(result.isValid()); // 오류는 아님
        assertTrue(result.hasWarnings());
        assertTrue(result.getWarnings().get(0).contains("작은따옴표로 감싸는 것이 좋습니다"));
    }

    @Test
    void 숫자_타입_호환성_테스트() {
        // When & Then
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.INT, MSSQLDataType.BIGINT));
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.DECIMAL, MSSQLDataType.FLOAT));
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.SMALLINT, MSSQLDataType.INT));
    }

    @Test
    void 문자열_타입_호환성_테스트() {
        // When & Then
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.VARCHAR, MSSQLDataType.NVARCHAR));
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.CHAR, MSSQLDataType.VARCHAR));
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.TEXT, MSSQLDataType.NTEXT));
    }

    @Test
    void 날짜시간_타입_호환성_테스트() {
        // When & Then
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.DATETIME, MSSQLDataType.DATETIME2));
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.DATE, MSSQLDataType.DATETIME));
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.TIME, MSSQLDataType.DATETIME2));
    }

    @Test
    void 서로_다른_카테고리_타입_비호환성_테스트() {
        // When & Then
        assertFalse(typeMapper.isCompatibleType(MSSQLDataType.INT, MSSQLDataType.NVARCHAR));
        assertFalse(typeMapper.isCompatibleType(MSSQLDataType.DATETIME, MSSQLDataType.BIGINT));
        assertFalse(typeMapper.isCompatibleType(MSSQLDataType.BIT, MSSQLDataType.VARCHAR));
    }

    @Test
    void 동일_타입_호환성_테스트() {
        // When & Then
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.INT, MSSQLDataType.INT));
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.NVARCHAR, MSSQLDataType.NVARCHAR));
        assertTrue(typeMapper.isCompatibleType(MSSQLDataType.DATETIME2, MSSQLDataType.DATETIME2));
    }

    @Test
    void 유효한_컬럼_검증_성공_테스트() {
        // Given
        Column column = new Column("user_id", MSSQLDataType.BIGINT, 1);
        column.setPrimaryKey(true);
        column.setIdentity(true);

        // When
        MSSQLTypeMapper.ValidationResult result = typeMapper.validateColumnDataType(column);

        // Then
        assertTrue(result.isValid());
        assertFalse(result.hasErrors());
        assertFalse(result.hasWarnings());
    }
}