package com.dbmodeling.domain.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * MSSQL 데이터 타입 테스트
 */
class MSSQLDataTypeTest {

    @Test
    void 문자열_타입_속성_테스트() {
        // Given & When & Then
        assertTrue(MSSQLDataType.CHAR.requiresLength());
        assertTrue(MSSQLDataType.VARCHAR.requiresLength());
        assertTrue(MSSQLDataType.NCHAR.requiresLength());
        assertTrue(MSSQLDataType.NVARCHAR.requiresLength());
        
        assertFalse(MSSQLDataType.TEXT.requiresLength());
        assertFalse(MSSQLDataType.NTEXT.requiresLength());
        
        // 문자열 타입은 정밀도/스케일 불필요
        assertFalse(MSSQLDataType.NVARCHAR.requiresPrecision());
        assertFalse(MSSQLDataType.NVARCHAR.requiresScale());
    }

    @Test
    void 숫자_타입_속성_테스트() {
        // Given & When & Then
        assertFalse(MSSQLDataType.INT.requiresLength());
        assertFalse(MSSQLDataType.BIGINT.requiresLength());
        assertFalse(MSSQLDataType.SMALLINT.requiresLength());
        assertFalse(MSSQLDataType.TINYINT.requiresLength());
        
        // DECIMAL과 NUMERIC은 정밀도 필요
        assertTrue(MSSQLDataType.DECIMAL.requiresPrecision());
        assertTrue(MSSQLDataType.DECIMAL.requiresScale());
        assertTrue(MSSQLDataType.NUMERIC.requiresPrecision());
        assertTrue(MSSQLDataType.NUMERIC.requiresScale());
        
        // FLOAT는 정밀도만 필요
        assertTrue(MSSQLDataType.FLOAT.requiresPrecision());
        assertFalse(MSSQLDataType.FLOAT.requiresScale());
    }

    @Test
    void 날짜시간_타입_속성_테스트() {
        // Given & When & Then
        assertFalse(MSSQLDataType.DATE.requiresLength());
        assertFalse(MSSQLDataType.DATE.requiresPrecision());
        
        assertTrue(MSSQLDataType.TIME.requiresPrecision());
        assertFalse(MSSQLDataType.TIME.requiresScale());
        
        assertTrue(MSSQLDataType.DATETIME2.requiresPrecision());
        assertFalse(MSSQLDataType.DATETIME2.requiresScale());
        
        assertFalse(MSSQLDataType.DATETIME.requiresPrecision());
    }

    @Test
    void 이진_타입_속성_테스트() {
        // Given & When & Then
        assertTrue(MSSQLDataType.BINARY.requiresLength());
        assertTrue(MSSQLDataType.VARBINARY.requiresLength());
        assertFalse(MSSQLDataType.IMAGE.requiresLength());
    }

    @Test
    void 자동증가_지원_타입_테스트() {
        // Given & When & Then
        assertTrue(MSSQLDataType.TINYINT.supportsIdentity());
        assertTrue(MSSQLDataType.SMALLINT.supportsIdentity());
        assertTrue(MSSQLDataType.INT.supportsIdentity());
        assertTrue(MSSQLDataType.BIGINT.supportsIdentity());
        assertTrue(MSSQLDataType.DECIMAL.supportsIdentity());
        assertTrue(MSSQLDataType.NUMERIC.supportsIdentity());
        
        assertFalse(MSSQLDataType.NVARCHAR.supportsIdentity());
        assertFalse(MSSQLDataType.DATETIME.supportsIdentity());
        assertFalse(MSSQLDataType.BIT.supportsIdentity());
    }

    @Test
    void 기본키_사용_가능_타입_테스트() {
        // Given & When & Then
        assertTrue(MSSQLDataType.INT.canBePrimaryKey());
        assertTrue(MSSQLDataType.BIGINT.canBePrimaryKey());
        assertTrue(MSSQLDataType.NVARCHAR.canBePrimaryKey());
        assertTrue(MSSQLDataType.UNIQUEIDENTIFIER.canBePrimaryKey());
        
        // 대용량 타입들은 기본키 불가
        assertFalse(MSSQLDataType.TEXT.canBePrimaryKey());
        assertFalse(MSSQLDataType.NTEXT.canBePrimaryKey());
        assertFalse(MSSQLDataType.IMAGE.canBePrimaryKey());
        assertFalse(MSSQLDataType.XML.canBePrimaryKey());
    }

    @Test
    void SQL_문자열_생성_길이_포함_테스트() {
        // Given
        MSSQLDataType dataType = MSSQLDataType.NVARCHAR;
        Integer length = 100;

        // When
        String sqlString = dataType.toSqlString(length, null, null);

        // Then
        assertEquals("NVARCHAR(100)", sqlString);
    }

    @Test
    void SQL_문자열_생성_정밀도_포함_테스트() {
        // Given
        MSSQLDataType dataType = MSSQLDataType.DECIMAL;
        Integer precision = 18;
        Integer scale = 2;

        // When
        String sqlString = dataType.toSqlString(null, precision, scale);

        // Then
        assertEquals("DECIMAL(18,2)", sqlString);
    }

    @Test
    void SQL_문자열_생성_정밀도만_포함_테스트() {
        // Given
        MSSQLDataType dataType = MSSQLDataType.FLOAT;
        Integer precision = 24;

        // When
        String sqlString = dataType.toSqlString(null, precision, null);

        // Then
        assertEquals("FLOAT(24)", sqlString);
    }

    @Test
    void SQL_문자열_생성_매개변수_없음_테스트() {
        // Given
        MSSQLDataType dataType = MSSQLDataType.INT;

        // When
        String sqlString = dataType.toSqlString(null, null, null);

        // Then
        assertEquals("INT", sqlString);
    }

    @Test
    void SQL_문자열_생성_TIME_정밀도_테스트() {
        // Given
        MSSQLDataType dataType = MSSQLDataType.TIME;
        Integer precision = 7;

        // When
        String sqlString = dataType.toSqlString(null, precision, null);

        // Then
        assertEquals("TIME(7)", sqlString);
    }

    @Test
    void SQL_문자열_생성_DATETIME2_정밀도_테스트() {
        // Given
        MSSQLDataType dataType = MSSQLDataType.DATETIME2;
        Integer precision = 3;

        // When
        String sqlString = dataType.toSqlString(null, precision, null);

        // Then
        assertEquals("DATETIME2(3)", sqlString);
    }

    @Test
    void SQL_이름_확인_테스트() {
        // Given & When & Then
        assertEquals("NVARCHAR", MSSQLDataType.NVARCHAR.getSqlName());
        assertEquals("BIGINT", MSSQLDataType.BIGINT.getSqlName());
        assertEquals("DECIMAL", MSSQLDataType.DECIMAL.getSqlName());
        assertEquals("DATETIME2", MSSQLDataType.DATETIME2.getSqlName());
        assertEquals("UNIQUEIDENTIFIER", MSSQLDataType.UNIQUEIDENTIFIER.getSqlName());
    }

    @Test
    void 모든_문자열_타입_길이_필요_확인_테스트() {
        // Given
        MSSQLDataType[] lengthRequiredTypes = {
            MSSQLDataType.CHAR, MSSQLDataType.VARCHAR,
            MSSQLDataType.NCHAR, MSSQLDataType.NVARCHAR,
            MSSQLDataType.BINARY, MSSQLDataType.VARBINARY
        };

        // When & Then
        for (MSSQLDataType type : lengthRequiredTypes) {
            assertTrue(type.requiresLength(), type + "는 길이가 필요해야 합니다");
        }
    }

    @Test
    void 모든_정수_타입_자동증가_지원_확인_테스트() {
        // Given
        MSSQLDataType[] identityTypes = {
            MSSQLDataType.TINYINT, MSSQLDataType.SMALLINT,
            MSSQLDataType.INT, MSSQLDataType.BIGINT,
            MSSQLDataType.DECIMAL, MSSQLDataType.NUMERIC
        };

        // When & Then
        for (MSSQLDataType type : identityTypes) {
            assertTrue(type.supportsIdentity(), type + "는 자동증가를 지원해야 합니다");
        }
    }

    @Test
    void 대용량_타입_기본키_불가_확인_테스트() {
        // Given
        MSSQLDataType[] nonPrimaryKeyTypes = {
            MSSQLDataType.TEXT, MSSQLDataType.NTEXT,
            MSSQLDataType.IMAGE, MSSQLDataType.XML
        };

        // When & Then
        for (MSSQLDataType type : nonPrimaryKeyTypes) {
            assertFalse(type.canBePrimaryKey(), type + "는 기본키로 사용할 수 없어야 합니다");
        }
    }
}