import type { Column, MSSQLDataType, Table, Index } from '@/types';

// 명명 규칙 검증 결과 타입
export interface ValidationResult {
  isValid: boolean;
  message: string;
  suggestion?: string;
}

// 대문자 형식 검증 (PascalCase 또는 UPPER_SNAKE_CASE)
export function validateUpperCase(name: string): ValidationResult {
  // 빈 문자열 체크
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      message: '이름을 입력해주세요',
    };
  }

  // PascalCase 패턴 (예: User, OrderItem)
  const pascalCasePattern = /^[A-Z][a-zA-Z0-9]*$/;
  
  // UPPER_SNAKE_CASE 패턴 (예: USER_ID, ORDER_ITEM)
  const upperSnakeCasePattern = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;

  if (pascalCasePattern.test(name) || upperSnakeCasePattern.test(name)) {
    return {
      isValid: true,
      message: '올바른 형식입니다',
    };
  }

  // 소문자가 포함된 경우 제안
  if (/[a-z]/.test(name)) {
    const suggestion = name
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toUpperCase();
    
    return {
      isValid: false,
      message: '대문자 형식을 사용해야 합니다',
      suggestion: `예: ${suggestion}`,
    };
  }

  return {
    isValid: false,
    message: '대문자 형식을 사용해야 합니다 (예: USER, ORDER_ITEM)',
  };
}

// 테이블명 검증
export function validateTableName(name: string): ValidationResult {
  return validateUpperCase(name);
}

// 컬럼명 검증
export function validateColumnName(name: string): ValidationResult {
  return validateUpperCase(name);
}

// PK 컬럼명 검증 (테이블명 포함 여부)
export function validatePrimaryKeyColumnName(
  columnName: string,
  tableName: string
): ValidationResult {
  const upperCaseResult = validateUpperCase(columnName);
  if (!upperCaseResult.isValid) {
    return upperCaseResult;
  }

  // 단독명칭 금지 목록
  const forbiddenNames = ['ID', 'SEQ_NO', 'HIST_NO', 'NO', 'KEY'];
  
  if (forbiddenNames.includes(columnName.toUpperCase())) {
    return {
      isValid: false,
      message: '단독명칭은 사용할 수 없습니다',
      suggestion: `예: ${tableName}_${columnName}`,
    };
  }

  // 테이블명이 컬럼명에 포함되어 있는지 확인
  const tableNameUpper = tableName.toUpperCase();
  const columnNameUpper = columnName.toUpperCase();

  if (!columnNameUpper.includes(tableNameUpper)) {
    return {
      isValid: false,
      message: 'PK 컬럼명은 테이블명을 포함해야 합니다',
      suggestion: `예: ${tableName}_ID 또는 ${tableName}_NO`,
    };
  }

  return {
    isValid: true,
    message: '올바른 PK 컬럼명입니다',
  };
}

// Description 검증 (테이블)
export function validateTableDescription(
  description: string,
  tableName: string
): ValidationResult {
  if (!description || description.trim() === '') {
    return {
      isValid: false,
      message: 'Description은 필수입니다',
    };
  }

  // 테이블명을 그대로 복사했는지 확인
  if (description.trim().toUpperCase() === tableName.toUpperCase()) {
    return {
      isValid: false,
      message: '테이블명을 그대로 복사하지 마세요',
      suggestion: '의미 있는 한글 설명을 입력하세요',
    };
  }

  // 한글이 포함되어 있는지 확인
  const hasKorean = /[가-힣]/.test(description);
  if (!hasKorean) {
    return {
      isValid: false,
      message: '한글 설명을 포함해야 합니다',
      suggestion: '예: 사용자 정보, 주문 항목',
    };
  }

  return {
    isValid: true,
    message: '올바른 Description입니다',
  };
}

// Description 검증 (컬럼)
export function validateColumnDescription(
  description: string,
  columnName: string
): ValidationResult {
  if (!description || description.trim() === '') {
    return {
      isValid: false,
      message: 'Description은 필수입니다',
    };
  }

  // 컬럼명을 그대로 복사했는지 확인
  if (description.trim().toUpperCase() === columnName.toUpperCase()) {
    return {
      isValid: false,
      message: '컬럼명을 그대로 복사하지 마세요',
      suggestion: '의미 있는 한글 설명을 입력하세요',
    };
  }

  // 한글이 포함되어 있는지 확인
  const hasKorean = /[가-힣]/.test(description);
  if (!hasKorean) {
    return {
      isValid: false,
      message: '한글 설명을 포함해야 합니다',
      suggestion: '예: 사용자ID, 등록일시',
    };
  }

  // 권장 형식: "한글명 || 상세설명"
  const hasDetailFormat = description.includes('||');
  if (!hasDetailFormat && description.length > 20) {
    return {
      isValid: true,
      message: '올바른 Description입니다',
      suggestion: '상세 설명이 필요한 경우 "한글명 || 상세설명" 형식을 권장합니다',
    };
  }

  return {
    isValid: true,
    message: '올바른 Description입니다',
  };
}

// 데이터 타입별 필수 속성 검증
export function validateDataTypeProperties(
  dataType: MSSQLDataType,
  maxLength?: number,
  precision?: number,
  scale?: number
): ValidationResult {
  // VARCHAR, NVARCHAR, CHAR, NCHAR는 길이 필수
  if (['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR'].includes(dataType)) {
    if (!maxLength || maxLength <= 0) {
      return {
        isValid: false,
        message: `${dataType} 타입은 길이를 지정해야 합니다`,
        suggestion: dataType.startsWith('N') ? '예: 100 (최대 4000)' : '예: 100 (최대 8000)',
      };
    }

    const maxAllowed = dataType.startsWith('N') ? 4000 : 8000;
    if (maxLength > maxAllowed) {
      return {
        isValid: false,
        message: `${dataType} 타입의 최대 길이는 ${maxAllowed}입니다`,
      };
    }
  }

  // DECIMAL, NUMERIC은 precision과 scale 필수
  if (['DECIMAL', 'NUMERIC'].includes(dataType)) {
    if (!precision || precision <= 0) {
      return {
        isValid: false,
        message: `${dataType} 타입은 precision을 지정해야 합니다`,
        suggestion: '예: precision=18, scale=2',
      };
    }

    if (precision > 38) {
      return {
        isValid: false,
        message: 'precision은 최대 38까지 가능합니다',
      };
    }

    if (scale !== undefined && scale !== null) {
      if (scale < 0 || scale > precision) {
        return {
          isValid: false,
          message: 'scale은 0 이상이고 precision 이하여야 합니다',
        };
      }
    }
  }

  return {
    isValid: true,
    message: '올바른 데이터 타입 속성입니다',
  };
}

// 인덱스명 검증
export function validateIndexName(
  indexName: string,
  indexType: 'CLUSTERED' | 'NONCLUSTERED',
  isUnique: boolean,
  tableName: string
): ValidationResult {
  if (!indexName || indexName.trim() === '') {
    return {
      isValid: false,
      message: '인덱스명을 입력해주세요',
    };
  }

  // 대문자 검증
  const upperCaseResult = validateUpperCase(indexName);
  if (!upperCaseResult.isValid) {
    return upperCaseResult;
  }

  // 명명 규칙 검증
  let expectedPrefix = '';
  if (isUnique && indexType === 'CLUSTERED') {
    expectedPrefix = 'PK__';
  } else if (indexType === 'CLUSTERED') {
    expectedPrefix = 'CIDX__';
  } else {
    expectedPrefix = 'IDX__';
  }

  if (!indexName.startsWith(expectedPrefix)) {
    return {
      isValid: false,
      message: `${indexType === 'CLUSTERED' ? '클러스터드' : '논클러스터드'} 인덱스는 ${expectedPrefix} 접두사를 사용해야 합니다`,
      suggestion: `예: ${expectedPrefix}${tableName}__COLUMN_NAME`,
    };
  }

  // 테이블명 포함 여부 확인
  const tableNameUpper = tableName.toUpperCase();
  if (!indexName.toUpperCase().includes(tableNameUpper)) {
    return {
      isValid: false,
      message: '인덱스명에 테이블명을 포함해야 합니다',
      suggestion: `예: ${expectedPrefix}${tableName}__COLUMN_NAME`,
    };
  }

  return {
    isValid: true,
    message: '올바른 인덱스명입니다',
  };
}

// 인덱스명 자동 생성
export function generateIndexName(
  tableName: string,
  columnNames: string[],
  indexType: 'CLUSTERED' | 'NONCLUSTERED',
  isUnique: boolean
): string {
  let prefix = '';
  if (isUnique && indexType === 'CLUSTERED') {
    prefix = 'PK__';
  } else if (indexType === 'CLUSTERED') {
    prefix = 'CIDX__';
  } else {
    prefix = 'IDX__';
  }

  const columns = columnNames.join('__');
  return `${prefix}${tableName}__${columns}`;
}

// 시스템 속성 컬럼 검증
export function validateSystemColumns(columns: Column[]): ValidationResult {
  const requiredSystemColumns = ['REG_ID', 'REG_DT', 'CHG_ID', 'CHG_DT'];
  const existingColumnNames = columns.map(col => col.name.toUpperCase());

  const missingColumns = requiredSystemColumns.filter(
    name => !existingColumnNames.includes(name)
  );

  if (missingColumns.length > 0) {
    return {
      isValid: false,
      message: '시스템 속성 컬럼이 누락되었습니다',
      suggestion: `누락된 컬럼: ${missingColumns.join(', ')}`,
    };
  }

  // REG_DT의 DEFAULT 값 확인
  const regDtColumn = columns.find(col => col.name.toUpperCase() === 'REG_DT');
  if (regDtColumn && regDtColumn.defaultValue !== 'GETDATE()') {
    return {
      isValid: false,
      message: 'REG_DT 컬럼은 DEFAULT GETDATE()를 설정해야 합니다',
    };
  }

  return {
    isValid: true,
    message: '시스템 속성 컬럼이 올바르게 설정되었습니다',
  };
}

// 전체 테이블 검증
export function validateTable(table: Table, columns: Column[]): ValidationResult[] {
  const results: ValidationResult[] = [];

  // 테이블명 검증
  const tableNameResult = validateTableName(table.name);
  if (!tableNameResult.isValid) {
    results.push({
      ...tableNameResult,
      message: `[테이블명] ${tableNameResult.message}`,
    });
  }

  // Description 검증
  const descriptionResult = validateTableDescription(table.description, table.name);
  if (!descriptionResult.isValid) {
    results.push({
      ...descriptionResult,
      message: `[Description] ${descriptionResult.message}`,
    });
  }

  // 시스템 속성 컬럼 검증
  const systemColumnsResult = validateSystemColumns(columns);
  if (!systemColumnsResult.isValid) {
    results.push({
      ...systemColumnsResult,
      message: `[시스템 속성] ${systemColumnsResult.message}`,
    });
  }

  return results;
}

// 전체 컬럼 검증
export function validateColumn(
  column: Column,
  tableName: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // 컬럼명 검증
  const columnNameResult = validateColumnName(column.name);
  if (!columnNameResult.isValid) {
    results.push({
      ...columnNameResult,
      message: `[컬럼명] ${columnNameResult.message}`,
    });
  }

  // PK 컬럼명 검증
  if (column.primaryKey) {
    const pkResult = validatePrimaryKeyColumnName(column.name, tableName);
    if (!pkResult.isValid) {
      results.push({
        ...pkResult,
        message: `[PK 컬럼명] ${pkResult.message}`,
      });
    }
  }

  // Description 검증
  const descriptionResult = validateColumnDescription(column.description, column.name);
  if (!descriptionResult.isValid) {
    results.push({
      ...descriptionResult,
      message: `[Description] ${descriptionResult.message}`,
    });
  }

  // 데이터 타입 속성 검증
  const dataTypeResult = validateDataTypeProperties(
    column.dataType,
    column.maxLength,
    column.precision,
    column.scale
  );
  if (!dataTypeResult.isValid) {
    results.push({
      ...dataTypeResult,
      message: `[데이터 타입] ${dataTypeResult.message}`,
    });
  }

  return results;
}

// 전체 인덱스 검증
export function validateIndex(
  index: Index,
  tableName: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // 인덱스명 검증
  const indexNameResult = validateIndexName(
    index.name,
    index.type,
    index.unique,
    tableName
  );
  if (!indexNameResult.isValid) {
    results.push({
      ...indexNameResult,
      message: `[인덱스명] ${indexNameResult.message}`,
    });
  }

  // 컬럼 개수 검증
  if (index.columns.length === 0) {
    results.push({
      isValid: false,
      message: '[인덱스 컬럼] 최소 1개 이상의 컬럼을 선택해야 합니다',
    });
  }

  return results;
}

// 데이터 타입이 정수형인지 확인
export function isIntegerType(dataType: MSSQLDataType): boolean {
  return ['BIGINT', 'INT', 'SMALLINT', 'TINYINT'].includes(dataType);
}

// 데이터 타입이 길이를 필요로 하는지 확인
export function requiresLength(dataType: MSSQLDataType): boolean {
  return ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR'].includes(dataType);
}

// 데이터 타입이 precision/scale을 필요로 하는지 확인
export function requiresPrecisionScale(dataType: MSSQLDataType): boolean {
  return ['DECIMAL', 'NUMERIC'].includes(dataType);
}

// 데이터 타입이 IDENTITY를 지원하는지 확인
export function supportsIdentity(dataType: MSSQLDataType): boolean {
  return isIntegerType(dataType);
}
