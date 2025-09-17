import type { Column, NamingRules } from '../types';

export interface ColumnValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ColumnValidationResult {
  isValid: boolean;
  errors: ColumnValidationError[];
  warnings: ColumnValidationError[];
}

/**
 * 컬럼 유효성 검사
 */
export const validateColumn = (
  column: Column,
  allColumns: Column[],
  namingRules?: NamingRules
): ColumnValidationResult => {
  const errors: ColumnValidationError[] = [];
  const warnings: ColumnValidationError[] = [];

  // 1. 기본 필드 검증
  if (!column.name || column.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: '컬럼명은 필수입니다.',
      severity: 'error',
    });
  }

  if (column.name && column.name.length > 128) {
    errors.push({
      field: 'name',
      message: '컬럼명은 128자를 초과할 수 없습니다.',
      severity: 'error',
    });
  }

  // 2. 컬럼명 중복 검사
  const duplicateColumns = allColumns.filter(
    c => c.id !== column.id && c.name.toLowerCase() === column.name.toLowerCase()
  );
  if (duplicateColumns.length > 0) {
    errors.push({
      field: 'name',
      message: `컬럼명 "${column.name}"이(가) 중복됩니다.`,
      severity: 'error',
      suggestion: `다른 이름을 사용하세요. 예: ${column.name}_2`,
    });
  }

  // 3. 데이터 타입별 검증
  switch (column.dataType) {
    case 'VARCHAR':
    case 'NVARCHAR':
    case 'CHAR':
    case 'NCHAR':
      if (!column.maxLength || column.maxLength <= 0) {
        errors.push({
          field: 'maxLength',
          message: `${column.dataType} 타입은 길이가 필요합니다.`,
          severity: 'error',
        });
      } else if (column.maxLength > 8000) {
        errors.push({
          field: 'maxLength',
          message: `${column.dataType} 타입의 최대 길이는 8000입니다.`,
          severity: 'error',
        });
      }
      break;

    case 'DECIMAL':
    case 'NUMERIC':
      if (!column.precision || column.precision <= 0) {
        errors.push({
          field: 'precision',
          message: `${column.dataType} 타입은 정밀도가 필요합니다.`,
          severity: 'error',
        });
      } else if (column.precision > 38) {
        errors.push({
          field: 'precision',
          message: `${column.dataType} 타입의 최대 정밀도는 38입니다.`,
          severity: 'error',
        });
      }

      if (column.scale !== undefined && column.scale < 0) {
        errors.push({
          field: 'scale',
          message: '소수점 자릿수는 0 이상이어야 합니다.',
          severity: 'error',
        });
      }

      if (column.precision && column.scale && column.scale > column.precision) {
        errors.push({
          field: 'scale',
          message: '소수점 자릿수는 정밀도보다 클 수 없습니다.',
          severity: 'error',
        });
      }
      break;

    case 'BINARY':
    case 'VARBINARY':
      if (!column.maxLength || column.maxLength <= 0) {
        errors.push({
          field: 'maxLength',
          message: `${column.dataType} 타입은 길이가 필요합니다.`,
          severity: 'error',
        });
      } else if (column.maxLength > 8000) {
        errors.push({
          field: 'maxLength',
          message: `${column.dataType} 타입의 최대 길이는 8000입니다.`,
          severity: 'error',
        });
      }
      break;
  }

  // 4. IDENTITY 검증
  if (column.identity) {
    if (!['INT', 'BIGINT', 'SMALLINT', 'TINYINT'].includes(column.dataType)) {
      errors.push({
        field: 'identity',
        message: 'IDENTITY는 정수 타입에서만 사용할 수 있습니다.',
        severity: 'error',
        suggestion: '데이터 타입을 INT, BIGINT, SMALLINT, TINYINT 중 하나로 변경하세요.',
      });
    }

    if (column.identitySeed !== undefined && column.identitySeed < 1) {
      errors.push({
        field: 'identitySeed',
        message: 'IDENTITY 시작값은 1 이상이어야 합니다.',
        severity: 'error',
      });
    }

    if (column.identityIncrement !== undefined && column.identityIncrement < 1) {
      errors.push({
        field: 'identityIncrement',
        message: 'IDENTITY 증가값은 1 이상이어야 합니다.',
        severity: 'error',
      });
    }
  }

  // 5. 기본키 검증
  if (column.primaryKey) {
    if (column.nullable) {
      errors.push({
        field: 'nullable',
        message: '기본키는 NULL을 허용할 수 없습니다.',
        severity: 'error',
      });
    }

    // 다른 기본키 컬럼이 있는지 확인
    const otherPrimaryKeys = allColumns.filter(
      c => c.id !== column.id && c.primaryKey
    );
    if (otherPrimaryKeys.length > 0) {
      warnings.push({
        field: 'primaryKey',
        message: '이미 다른 기본키 컬럼이 존재합니다. 복합 기본키를 만들고 있는지 확인하세요.',
        severity: 'warning',
      });
    }
  }

  // 6. 네이밍 규칙 검증
  if (namingRules && column.name) {
    const namingErrors = validateColumnNaming(column.name, namingRules);
    errors.push(...namingErrors);
  }

  // 7. 성능 관련 경고
  if (column.dataType === 'TEXT' || column.dataType === 'NTEXT') {
    warnings.push({
      field: 'dataType',
      message: `${column.dataType} 타입은 성능상 권장되지 않습니다.`,
      severity: 'warning',
      suggestion: 'VARCHAR(MAX) 또는 NVARCHAR(MAX) 사용을 고려하세요.',
    });
  }

  if (column.dataType === 'IMAGE') {
    warnings.push({
      field: 'dataType',
      message: 'IMAGE 타입은 더 이상 사용되지 않습니다.',
      severity: 'warning',
      suggestion: 'VARBINARY(MAX) 사용을 고려하세요.',
    });
  }

  // 8. 기본값 검증
  if (column.defaultValue && column.defaultValue.trim().length > 0) {
    const defaultValueErrors = validateDefaultValue(column.defaultValue, column.dataType);
    warnings.push(...defaultValueErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * 네이밍 규칙 검증
 */
const validateColumnNaming = (
  columnName: string,
  namingRules: NamingRules
): ColumnValidationError[] => {
  const errors: ColumnValidationError[] = [];

  // 패턴 검증
  if (namingRules.columnPattern) {
    try {
      const regex = new RegExp(namingRules.columnPattern);
      if (!regex.test(columnName)) {
        errors.push({
          field: 'name',
          message: `컬럼명이 네이밍 패턴을 만족하지 않습니다: ${namingRules.columnPattern}`,
          severity: 'error',
        });
      }
    } catch {
      console.warn('잘못된 네이밍 패턴:', namingRules.columnPattern);
    }
  }

  // 케이스 규칙 검증
  if (namingRules.enforceCase) {
    let expectedName = columnName;
    switch (namingRules.enforceCase) {
      case 'UPPER':
        expectedName = columnName.toUpperCase();
        break;
      case 'LOWER':
        expectedName = columnName.toLowerCase();
        break;
      case 'SNAKE':
        expectedName = columnName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
        break;
      case 'PASCAL':
        expectedName = columnName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
          .replace(/^([a-z])/, (_, letter) => letter.toUpperCase());
        break;
    }

    if (columnName !== expectedName) {
      errors.push({
        field: 'name',
        message: `컬럼명이 ${namingRules.enforceCase} 케이스 규칙을 만족하지 않습니다.`,
        severity: 'error',
        suggestion: `다음과 같이 변경하세요: ${expectedName}`,
      });
    }
  }

  return errors;
};

/**
 * 기본값 검증
 */
const validateDefaultValue = (
  defaultValue: string,
  dataType: string
): ColumnValidationError[] => {
  const warnings: ColumnValidationError[] = [];

  // 숫자 타입 검증
  if (['INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL'].includes(dataType)) {
    if (isNaN(Number(defaultValue))) {
      warnings.push({
        field: 'defaultValue',
        message: `${dataType} 타입의 기본값은 숫자여야 합니다.`,
        severity: 'warning',
      });
    }
  }

  // 날짜 타입 검증
  if (['DATETIME', 'DATETIME2', 'SMALLDATETIME', 'DATE'].includes(dataType)) {
    if (defaultValue !== 'GETDATE()' && defaultValue !== 'CURRENT_TIMESTAMP' && isNaN(Date.parse(defaultValue))) {
      warnings.push({
        field: 'defaultValue',
        message: `${dataType} 타입의 기본값은 유효한 날짜 또는 함수여야 합니다.`,
        severity: 'warning',
        suggestion: 'GETDATE() 또는 CURRENT_TIMESTAMP 사용을 고려하세요.',
      });
    }
  }

  // BIT 타입 검증
  if (dataType === 'BIT') {
    if (!['0', '1', 'TRUE', 'FALSE'].includes(defaultValue.toUpperCase())) {
      warnings.push({
        field: 'defaultValue',
        message: 'BIT 타입의 기본값은 0, 1, TRUE, FALSE 중 하나여야 합니다.',
        severity: 'warning',
      });
    }
  }

  return warnings;
};

/**
 * 테이블의 모든 컬럼 검증
 */
export const validateAllColumns = (
  columns: Column[],
  namingRules?: NamingRules
): { [columnId: string]: ColumnValidationResult } => {
  const results: { [columnId: string]: ColumnValidationResult } = {};

  columns.forEach(column => {
    results[column.id] = validateColumn(column, columns, namingRules);
  });

  return results;
};

/**
 * 컬럼 검증 결과 요약
 */
export const getValidationSummary = (
  validationResults: { [columnId: string]: ColumnValidationResult }
): {
  totalColumns: number;
  validColumns: number;
  totalErrors: number;
  totalWarnings: number;
} => {
  const results = Object.values(validationResults);
  
  return {
    totalColumns: results.length,
    validColumns: results.filter(r => r.isValid).length,
    totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
  };
};