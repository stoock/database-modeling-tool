// 기본 타입 정의
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 프로젝트 관련 타입
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  namingRules: NamingRules;
  tables: Table[];
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  namingRules?: NamingRules;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  namingRules?: NamingRules;
}

// 테이블 관련 타입
export interface Table extends BaseEntity {
  projectId: string;
  name: string;
  description?: string;
  positionX: number;
  positionY: number;
  columns: Column[];
  indexes: Index[];
}

export interface CreateTableRequest {
  name: string;
  description?: string;
  positionX?: number;
  positionY?: number;
}

export interface UpdateTableRequest {
  name?: string;
  description?: string;
  positionX?: number;
  positionY?: number;
}

// 컬럼 관련 타입
export interface Column extends BaseEntity {
  tableId: string;
  name: string;
  description?: string;
  dataType: MSSQLDataType;
  maxLength?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  primaryKey: boolean;
  identity: boolean;
  identitySeed?: number;
  identityIncrement?: number;
  defaultValue?: string;
  orderIndex: number;
}

export interface CreateColumnRequest {
  name: string;
  description?: string;
  dataType: MSSQLDataType;
  maxLength?: number;
  precision?: number;
  scale?: number;
  nullable?: boolean;
  primaryKey?: boolean;
  identity?: boolean;
  identitySeed?: number;
  identityIncrement?: number;
  defaultValue?: string;
  orderIndex: number;
}

export interface UpdateColumnRequest {
  name?: string;
  description?: string;
  dataType?: MSSQLDataType;
  maxLength?: number;
  precision?: number;
  scale?: number;
  nullable?: boolean;
  primaryKey?: boolean;
  identity?: boolean;
  identitySeed?: number;
  identityIncrement?: number;
  defaultValue?: string;
  orderIndex?: number;
}

// 인덱스 관련 타입
export interface Index extends BaseEntity {
  tableId: string;
  name: string;
  type: IndexType;
  isUnique: boolean;
  columns: IndexColumn[];
}

export interface IndexColumn {
  columnId: string;
  order: SortOrder;
}

export interface CreateIndexRequest {
  name: string;
  type: IndexType;
  isUnique?: boolean;
  columns: IndexColumn[];
}

export interface UpdateIndexRequest {
  name?: string;
  type?: IndexType;
  isUnique?: boolean;
  columns?: IndexColumn[];
}

// 네이밍 규칙 타입 (백엔드와 일치)
export interface NamingRules {
  tablePrefix?: string;
  tableSuffix?: string;
  tablePattern?: string;
  columnPattern?: string;
  indexPattern?: string;
  enforceCase?: CaseType;
  
  // SQL Server 특화 규칙
  enforceUpperCase?: boolean;
  recommendAuditColumns?: boolean;
  requireDescription?: boolean;
  enforceTableColumnNaming?: boolean;
  enforceConstraintNaming?: boolean;
  abbreviationRules?: string;
}

// 검증 관련 타입
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// 스키마 내보내기 타입
export interface ExportRequest {
  format: ExportFormat;
  includeComments?: boolean;
  includeIndexes?: boolean;
  includeConstraints?: boolean;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// 열거형 타입
export type MSSQLDataType = 
  | 'BIGINT'
  | 'INT'
  | 'SMALLINT'
  | 'TINYINT'
  | 'BIT'
  | 'DECIMAL'
  | 'NUMERIC'
  | 'MONEY'
  | 'SMALLMONEY'
  | 'FLOAT'
  | 'REAL'
  | 'DATETIME'
  | 'DATETIME2'
  | 'SMALLDATETIME'
  | 'DATE'
  | 'TIME'
  | 'DATETIMEOFFSET'
  | 'TIMESTAMP'
  | 'CHAR'
  | 'VARCHAR'
  | 'TEXT'
  | 'NCHAR'
  | 'NVARCHAR'
  | 'NTEXT'
  | 'BINARY'
  | 'VARBINARY'
  | 'IMAGE'
  | 'UNIQUEIDENTIFIER'
  | 'XML'
  | 'JSON';

export type IndexType = 'CLUSTERED' | 'NONCLUSTERED';

export type SortOrder = 'ASC' | 'DESC';

export type CaseType = 'UPPER' | 'LOWER' | 'PASCAL' | 'SNAKE';

export type ExportFormat = 'SQL' | 'MARKDOWN' | 'HTML' | 'JSON' | 'CSV';

// React Flow 관련 타입
export interface TableNodeData {
  table: Table;
  isSelected: boolean;
}

export interface RelationshipEdgeData {
  sourceColumnId: string;
  targetColumnId: string;
  type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
}