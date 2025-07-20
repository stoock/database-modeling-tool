package com.dbmodeling.domain.model;

/**
 * MSSQL 데이터 타입 열거형
 * MSSQL에서 지원하는 데이터 타입들을 정의
 */
public enum MSSQLDataType {
    // 문자열 타입
    CHAR("CHAR", true, false, false),
    VARCHAR("VARCHAR", true, false, false),
    NCHAR("NCHAR", true, false, false),
    NVARCHAR("NVARCHAR", true, false, false),
    TEXT("TEXT", false, false, false),
    NTEXT("NTEXT", false, false, false),
    
    // 숫자 타입
    TINYINT("TINYINT", false, false, false),
    SMALLINT("SMALLINT", false, false, false),
    INT("INT", false, false, false),
    BIGINT("BIGINT", false, false, false),
    DECIMAL("DECIMAL", false, true, true),
    NUMERIC("NUMERIC", false, true, true),
    FLOAT("FLOAT", false, true, false),
    REAL("REAL", false, false, false),
    MONEY("MONEY", false, false, false),
    SMALLMONEY("SMALLMONEY", false, false, false),
    
    // 날짜/시간 타입
    DATE("DATE", false, false, false),
    TIME("TIME", false, true, false),
    DATETIME("DATETIME", false, false, false),
    DATETIME2("DATETIME2", false, true, false),
    SMALLDATETIME("SMALLDATETIME", false, false, false),
    DATETIMEOFFSET("DATETIMEOFFSET", false, true, false),
    
    // 이진 타입
    BINARY("BINARY", true, false, false),
    VARBINARY("VARBINARY", true, false, false),
    IMAGE("IMAGE", false, false, false),
    
    // 기타 타입
    BIT("BIT", false, false, false),
    UNIQUEIDENTIFIER("UNIQUEIDENTIFIER", false, false, false),
    XML("XML", false, false, false),
    JSON("JSON", false, false, false);

    private final String sqlName;
    private final boolean requiresLength;
    private final boolean requiresPrecision;
    private final boolean requiresScale;

    MSSQLDataType(String sqlName, boolean requiresLength, boolean requiresPrecision, boolean requiresScale) {
        this.sqlName = sqlName;
        this.requiresLength = requiresLength;
        this.requiresPrecision = requiresPrecision;
        this.requiresScale = requiresScale;
    }

    public String getSqlName() {
        return sqlName;
    }

    public boolean requiresLength() {
        return requiresLength;
    }

    public boolean requiresPrecision() {
        return requiresPrecision;
    }

    public boolean requiresScale() {
        return requiresScale;
    }

    /**
     * 데이터 타입에 따른 SQL 문자열 생성
     */
    public String toSqlString(Integer length, Integer precision, Integer scale) {
        StringBuilder sql = new StringBuilder(sqlName);
        
        if (requiresLength && length != null) {
            sql.append("(").append(length).append(")");
        } else if (requiresPrecision && precision != null) {
            sql.append("(").append(precision);
            if (requiresScale && scale != null) {
                sql.append(",").append(scale);
            }
            sql.append(")");
        }
        
        return sql.toString();
    }

    /**
     * 자동증가(IDENTITY) 지원 여부 확인
     */
    public boolean supportsIdentity() {
        return this == TINYINT || this == SMALLINT || this == INT || this == BIGINT ||
               this == DECIMAL || this == NUMERIC;
    }

    /**
     * 기본키로 사용 가능한 타입인지 확인
     */
    public boolean canBePrimaryKey() {
        return this != TEXT && this != NTEXT && this != IMAGE && this != XML;
    }
}