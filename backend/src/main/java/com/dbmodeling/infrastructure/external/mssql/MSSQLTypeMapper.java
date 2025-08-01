package com.dbmodeling.infrastructure.external.mssql;

import com.dbmodeling.domain.model.MSSQLDataType;
import com.dbmodeling.domain.model.Column;
import org.springframework.stereotype.Component;

/**
 * MSSQL 데이터 타입 매핑 및 변환을 담당하는 클래스
 * 도메인 모델의 데이터 타입을 MSSQL 호환 문자열로 변환
 */
@Component
public class MSSQLTypeMapper {

    /**
     * 컬럼 정보를 기반으로 MSSQL 데이터 타입 문자열 생성
     */
    public String mapToSqlType(Column column) {
        if (column.getDataType() == null) {
            throw new IllegalArgumentException("컬럼의 데이터 타입이 설정되지 않았습니다.");
        }

        MSSQLDataType dataType = column.getDataType();
        return dataType.toSqlString(
            column.getMaxLength(),
            column.getPrecision(),
            column.getScale()
        );
    }

    /**
     * 데이터 타입별 기본 속성 검증
     */
    public ValidationResult validateColumnDataType(Column column) {
        ValidationResult result = new ValidationResult();
        MSSQLDataType dataType = column.getDataType();

        if (dataType == null) {
            result.addError("데이터 타입이 설정되지 않았습니다.");
            return result;
        }

        // 길이 검증
        if (dataType.requiresLength()) {
            if (column.getMaxLength() == null || column.getMaxLength() <= 0) {
                result.addError(dataType.getSqlName() + " 타입은 길이 설정이 필요합니다.");
            } else {
                validateLength(dataType, column.getMaxLength(), result);
            }
        }

        // 정밀도 검증
        if (dataType.requiresPrecision()) {
            if (column.getPrecision() == null || column.getPrecision() <= 0) {
                result.addError(dataType.getSqlName() + " 타입은 정밀도 설정이 필요합니다.");
            } else {
                validatePrecision(dataType, column.getPrecision(), result);
            }
        }

        // 스케일 검증
        if (dataType.requiresScale()) {
            if (column.getScale() == null || column.getScale() < 0) {
                result.addError(dataType.getSqlName() + " 타입은 스케일 설정이 필요합니다.");
            } else if (column.getPrecision() != null && column.getScale() > column.getPrecision()) {
                result.addError("스케일은 정밀도보다 클 수 없습니다.");
            }
        }

        // 자동증가 검증
        if (column.isIdentity() && !dataType.supportsIdentity()) {
            result.addError(dataType.getSqlName() + " 타입은 자동증가(IDENTITY)를 지원하지 않습니다.");
        }

        // 기본키 검증
        if (column.isPrimaryKey() && !dataType.canBePrimaryKey()) {
            result.addError(dataType.getSqlName() + " 타입은 기본키로 사용할 수 없습니다.");
        }

        // 기본값 검증
        if (column.getDefaultValue() != null && !column.getDefaultValue().trim().isEmpty()) {
            validateDefaultValue(column, result);
        }

        return result;
    }

    /**
     * 데이터 타입별 길이 제한 검증
     */
    private void validateLength(MSSQLDataType dataType, Integer length, ValidationResult result) {
        switch (dataType) {
            case CHAR, NCHAR -> {
                if (length > 8000) {
                    result.addError(dataType.getSqlName() + "의 최대 길이는 8000입니다.");
                }
            }
            case VARCHAR -> {
                if (length > 8000 && length != -1) { // -1은 MAX를 의미
                    result.addError("VARCHAR의 최대 길이는 8000입니다. 더 큰 값이 필요하면 VARCHAR(MAX)를 사용하세요.");
                }
            }
            case NVARCHAR -> {
                if (length > 4000 && length != -1) { // -1은 MAX를 의미
                    result.addError("NVARCHAR의 최대 길이는 4000입니다. 더 큰 값이 필요하면 NVARCHAR(MAX)를 사용하세요.");
                }
            }
            case BINARY, VARBINARY -> {
                if (length > 8000 && length != -1) {
                    result.addError(dataType.getSqlName() + "의 최대 길이는 8000입니다.");
                }
            }
        }
    }

    /**
     * 데이터 타입별 정밀도 제한 검증
     */
    private void validatePrecision(MSSQLDataType dataType, Integer precision, ValidationResult result) {
        switch (dataType) {
            case DECIMAL, NUMERIC -> {
                if (precision < 1 || precision > 38) {
                    result.addError(dataType.getSqlName() + "의 정밀도는 1~38 범위여야 합니다.");
                }
            }
            case FLOAT -> {
                if (precision < 1 || precision > 53) {
                    result.addError("FLOAT의 정밀도는 1~53 범위여야 합니다.");
                }
            }
            case TIME, DATETIME2, DATETIMEOFFSET -> {
                if (precision < 0 || precision > 7) {
                    result.addError(dataType.getSqlName() + "의 정밀도는 0~7 범위여야 합니다.");
                }
            }
        }
    }

    /**
     * 기본값 검증
     */
    private void validateDefaultValue(Column column, ValidationResult result) {
        String defaultValue = column.getDefaultValue().trim();
        MSSQLDataType dataType = column.getDataType();

        // 기본적인 형식 검증
        switch (dataType) {
            case TINYINT, SMALLINT, INT, BIGINT -> {
                try {
                    Long.parseLong(defaultValue);
                } catch (NumberFormatException e) {
                    result.addError("숫자 타입의 기본값은 유효한 숫자여야 합니다.");
                }
            }
            case DECIMAL, NUMERIC, FLOAT, REAL, MONEY, SMALLMONEY -> {
                try {
                    Double.parseDouble(defaultValue);
                } catch (NumberFormatException e) {
                    result.addError("소수 타입의 기본값은 유효한 숫자여야 합니다.");
                }
            }
            case BIT -> {
                if (!defaultValue.equals("0") && !defaultValue.equals("1")) {
                    result.addError("BIT 타입의 기본값은 0 또는 1이어야 합니다.");
                }
            }
            case CHAR, VARCHAR, NCHAR, NVARCHAR, TEXT, NTEXT -> {
                if (!defaultValue.startsWith("'") || !defaultValue.endsWith("'")) {
                    result.addWarning("문자열 타입의 기본값은 작은따옴표로 감싸는 것이 좋습니다.");
                }
            }
        }
    }

    /**
     * 데이터 타입 호환성 검사
     */
    public boolean isCompatibleType(MSSQLDataType fromType, MSSQLDataType toType) {
        if (fromType == toType) {
            return true;
        }

        // 숫자 타입 간 호환성
        if (isNumericType(fromType) && isNumericType(toType)) {
            return true;
        }

        // 문자열 타입 간 호환성
        if (isStringType(fromType) && isStringType(toType)) {
            return true;
        }

        // 날짜/시간 타입 간 호환성
        if (isDateTimeType(fromType) && isDateTimeType(toType)) {
            return true;
        }

        return false;
    }

    private boolean isNumericType(MSSQLDataType type) {
        return switch (type) {
            case TINYINT, SMALLINT, INT, BIGINT, DECIMAL, NUMERIC, FLOAT, REAL, MONEY, SMALLMONEY -> true;
            default -> false;
        };
    }

    private boolean isStringType(MSSQLDataType type) {
        return switch (type) {
            case CHAR, VARCHAR, NCHAR, NVARCHAR, TEXT, NTEXT -> true;
            default -> false;
        };
    }

    private boolean isDateTimeType(MSSQLDataType type) {
        return switch (type) {
            case DATE, TIME, DATETIME, DATETIME2, SMALLDATETIME, DATETIMEOFFSET -> true;
            default -> false;
        };
    }

    /**
     * 검증 결과 클래스
     */
    public static class ValidationResult {
        private final java.util.List<String> errors = new java.util.ArrayList<>();
        private final java.util.List<String> warnings = new java.util.ArrayList<>();

        public void addError(String message) {
            errors.add(message);
        }

        public void addWarning(String message) {
            warnings.add(message);
        }

        public boolean hasErrors() {
            return !errors.isEmpty();
        }

        public boolean hasWarnings() {
            return !warnings.isEmpty();
        }

        public java.util.List<String> getErrors() {
            return new java.util.ArrayList<>(errors);
        }

        public java.util.List<String> getWarnings() {
            return new java.util.ArrayList<>(warnings);
        }

        public boolean isValid() {
            return errors.isEmpty();
        }
    }
}