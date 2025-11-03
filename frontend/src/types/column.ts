/**
 * 컬럼 관련 타입 정의
 */

export interface Column {
  id: string;
  tableId: string;
  name: string;
  dataType: string;
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

/**
 * MSSQL 데이터 타입
 */
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
  | 'MONEY'
  | 'SMALLMONEY'
  // 날짜/시간 타입
  | 'DATETIME2'
  | 'DATETIME'
  | 'DATE'
  | 'TIME'
  | 'DATETIMEOFFSET'
  | 'SMALLDATETIME'
  // 기타 타입
  | 'BIT'
  | 'UNIQUEIDENTIFIER'
  | 'XML'
  | 'JSON'
  | 'BINARY'
  | 'VARBINARY'
  | 'IMAGE';

/**
 * 데이터 타입 그룹
 */
export interface DataTypeGroup {
  label: string;
  types: {
    value: MSSQLDataType;
    label: string;
    requiresLength?: boolean;
    requiresPrecision?: boolean;
    requiresScale?: boolean;
  }[];
}

export const DATA_TYPE_GROUPS: DataTypeGroup[] = [
  {
    label: '문자열',
    types: [
      { value: 'NVARCHAR', label: 'NVARCHAR', requiresLength: true },
      { value: 'VARCHAR', label: 'VARCHAR', requiresLength: true },
      { value: 'NCHAR', label: 'NCHAR', requiresLength: true },
      { value: 'CHAR', label: 'CHAR', requiresLength: true },
      { value: 'TEXT', label: 'TEXT' },
      { value: 'NTEXT', label: 'NTEXT' },
    ],
  },
  {
    label: '숫자',
    types: [
      { value: 'BIGINT', label: 'BIGINT' },
      { value: 'INT', label: 'INT' },
      { value: 'SMALLINT', label: 'SMALLINT' },
      { value: 'TINYINT', label: 'TINYINT' },
      { value: 'DECIMAL', label: 'DECIMAL', requiresPrecision: true, requiresScale: true },
      { value: 'NUMERIC', label: 'NUMERIC', requiresPrecision: true, requiresScale: true },
      { value: 'FLOAT', label: 'FLOAT' },
      { value: 'REAL', label: 'REAL' },
      { value: 'MONEY', label: 'MONEY' },
      { value: 'SMALLMONEY', label: 'SMALLMONEY' },
    ],
  },
  {
    label: '날짜/시간',
    types: [
      { value: 'DATETIME2', label: 'DATETIME2' },
      { value: 'DATETIME', label: 'DATETIME' },
      { value: 'DATE', label: 'DATE' },
      { value: 'TIME', label: 'TIME' },
      { value: 'DATETIMEOFFSET', label: 'DATETIMEOFFSET' },
      { value: 'SMALLDATETIME', label: 'SMALLDATETIME' },
    ],
  },
  {
    label: '기타',
    types: [
      { value: 'BIT', label: 'BIT' },
      { value: 'UNIQUEIDENTIFIER', label: 'UNIQUEIDENTIFIER' },
      { value: 'XML', label: 'XML' },
      { value: 'JSON', label: 'JSON' },
      { value: 'BINARY', label: 'BINARY', requiresLength: true },
      { value: 'VARBINARY', label: 'VARBINARY', requiresLength: true },
      { value: 'IMAGE', label: 'IMAGE' },
    ],
  },
];

export interface CreateColumnRequest {
  name: string;
  dataType: string;
  length?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  defaultValue?: string;
  description?: string;
}

export interface UpdateColumnRequest {
  name?: string;
  dataType?: string;
  length?: number;
  precision?: number;
  scale?: number;
  nullable?: boolean;
  defaultValue?: string;
  description?: string;
}
