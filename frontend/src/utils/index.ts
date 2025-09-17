// 유틸리티 함수들

/**
 * 문자열을 PascalCase로 변환
 */
export const toPascalCase = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/_/g, '');
};

/**
 * 문자열을 snake_case로 변환
 */
export const toSnakeCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
};

/**
 * 문자열을 kebab-case로 변환
 */
export const toKebabCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
};

/**
 * UUID 생성 (임시용, 실제로는 서버에서 생성)
 */
export const generateTempId = (): string => {
  return 'temp_' + Math.random().toString(36).substr(2, 9);
};

/**
 * 날짜 포맷팅
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 디바운스 함수
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 깊은 복사
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 클래스명 조합 유틸리티
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * MSSQL 데이터 타입별 기본 설정 반환
 */
export const getDataTypeDefaults = (dataType: string) => {
  const defaults: Record<string, { maxLength?: number; precision?: number; scale?: number; isNullable?: boolean; defaultValue?: string }> = {
    'VARCHAR': { maxLength: 255, isNullable: true },
    'NVARCHAR': { maxLength: 255, isNullable: true },
    'CHAR': { maxLength: 10, isNullable: true },
    'NCHAR': { maxLength: 10, isNullable: true },
    'TEXT': { isNullable: true },
    'NTEXT': { isNullable: true },
    'INT': { isNullable: true },
    'BIGINT': { isNullable: true },
    'SMALLINT': { isNullable: true },
    'TINYINT': { isNullable: true },
    'BIT': { isNullable: true, defaultValue: '0' },
    'DECIMAL': { precision: 18, scale: 2, isNullable: true },
    'NUMERIC': { precision: 18, scale: 2, isNullable: true },
    'FLOAT': { isNullable: true },
    'REAL': { isNullable: true },
    'MONEY': { isNullable: true },
    'SMALLMONEY': { isNullable: true },
    'DATETIME': { isNullable: true },
    'DATETIME2': { isNullable: true },
    'SMALLDATETIME': { isNullable: true },
    'DATE': { isNullable: true },
    'TIME': { isNullable: true },
    'DATETIMEOFFSET': { isNullable: true },
    'TIMESTAMP': { isNullable: false },
    'BINARY': { maxLength: 50, isNullable: true },
    'VARBINARY': { maxLength: 255, isNullable: true },
    'IMAGE': { isNullable: true },
    'UNIQUEIDENTIFIER': { isNullable: true },
    'XML': { isNullable: true },
    'JSON': { isNullable: true },
  };

  return defaults[dataType] || { isNullable: true };
};

/**
 * 데이터 타입이 길이를 필요로 하는지 확인
 */
export const requiresLength = (dataType: string): boolean => {
  return ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'BINARY', 'VARBINARY'].includes(dataType);
};

/**
 * 데이터 타입이 정밀도를 필요로 하는지 확인
 */
export const requiresPrecision = (dataType: string): boolean => {
  return ['DECIMAL', 'NUMERIC'].includes(dataType);
};

/**
 * 데이터 타입이 자동증가를 지원하는지 확인
 */
export const supportsIdentity = (dataType: string): boolean => {
  return ['INT', 'BIGINT', 'SMALLINT', 'TINYINT'].includes(dataType);
};

/**
 * 로컬 스토리지 유틸리티
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  },
};

/**
 * 에러 메시지 한국어 변환
 */
export const translateErrorMessage = (error: string): string => {
  const translations: Record<string, string> = {
    'Network Error': '네트워크 오류가 발생했습니다.',
    'Request timeout': '요청 시간이 초과되었습니다.',
    'Server Error': '서버 오류가 발생했습니다.',
    'Unauthorized': '인증이 필요합니다.',
    'Forbidden': '접근 권한이 없습니다.',
    'Not Found': '요청한 리소스를 찾을 수 없습니다.',
    'Bad Request': '잘못된 요청입니다.',
  };

  return translations[error] || error;
};