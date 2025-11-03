/**
 * 컬럼 관련 타입 정의
 */

export interface Column {
  id: string;
  tableId: string;
  name: string;
  dataType: MSSQLDataType;
  length?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  defaultValue?: string;
  description?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export type MSSQLDataType =
  // 문자열 타입
  | 'NVARCHAR'
  | 'VARCHAR'
  | 'NCHAR'
  | 'CHAR'
  | 'TEXT'
  | 'NTEXT'
  // 숫자 타입
  | 'BIGINT'
  | 'INT'
  | 'SMALLINT'
  | 'TINYINT'
  | 'DECIMAL'
  | 'NUMERIC'
  | 'FLOAT'
  | 'REAL'
  // 날짜/시간 타입
  | 'DATETIME2'
  | 'DATETIME'
  | 'DATE'
  | 'TIME'
  | 'DATETIMEOFFSET'
  // 기타 타입
  | 'BIT'
  | 'UNIQUEIDENTIFIER'
  | 'XML'
  | 'JSON';

export interface CreateColumnRequest {
  name: string;
  dataType: MSSQLDataType;
  length?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  defaultValue?: string;
  description?: string;
}

export interface UpdateColumnRequest {
  name?: string;
  dataType?: MSSQLDataType;
  length?: number;
  precision?: number;
  scale?: number;
  nullable?: boolean;
  defaultValue?: string;
  description?: string;
}

// 데이터 타입 그룹
export const DATA_TYPE_GROUPS = {
  STRING: ['NVARCHAR', 'VARCHAR', 'NCHAR', 'CHAR', 'TEXT', 'NTEXT'],
  NUMBER: ['BIGINT', 'INT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL'],
  DATETIME: ['DATETIME2', 'DATETIME', 'DATE', 'TIME', 'DATETIMEOFFSET'],
  OTHER: ['BIT', 'UNIQUEIDENTIFIER', 'XML', 'JSON'],
} as const;

// 길이가 필요한 데이터 타입
export const TYPES_WITH_LENGTH = ['NVARCHAR', 'VARCHAR', 'NCHAR', 'CHAR'];

// 정밀도가 필요한 데이터 타입
export const TYPES_WITH_PRECISION = ['DECIMAL', 'NUMERIC'];
