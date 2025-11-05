// Project
export interface Project {
  id: string;
  name: string;
  description: string;
  namingRules: NamingRules;
  createdAt: string;
  updatedAt: string;
}

export interface NamingRules {
  tablePrefix?: string;
  tableSuffix?: string;
  tablePattern: string;
  columnPattern: string;
  indexPattern: string;
  enforceCase: 'PASCAL' | 'SNAKE' | 'CAMEL';
}

// Table
export interface Table {
  id: string;
  projectId: string;
  name: string;
  description: string;
  positionX?: number;
  positionY?: number;
  createdAt: string;
  updatedAt: string;
}

// Column
export interface Column {
  id: string;
  tableId: string;
  name: string;
  description: string;
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
  createdAt: string;
  updatedAt: string;
}

export type MSSQLDataType =
  | 'BIGINT' | 'INT' | 'SMALLINT' | 'TINYINT'
  | 'DECIMAL' | 'NUMERIC' | 'FLOAT' | 'REAL'
  | 'VARCHAR' | 'NVARCHAR' | 'CHAR' | 'NCHAR' | 'TEXT' | 'NTEXT'
  | 'DATE' | 'TIME' | 'DATETIME' | 'DATETIME2' | 'TIMESTAMP'
  | 'BIT' | 'BINARY' | 'VARBINARY' | 'IMAGE'
  | 'UNIQUEIDENTIFIER' | 'XML' | 'JSON';

// Index
export interface Index {
  id: string;
  tableId: string;
  name: string;
  type: 'CLUSTERED' | 'NONCLUSTERED';
  unique: boolean;
  columns: IndexColumn[];
  createdAt: string;
  updatedAt: string;
}

export interface IndexColumn {
  columnId: string;
  columnName: string;
  order: 'ASC' | 'DESC';
}

// Validation
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: string;
  severity: 'ERROR' | 'WARNING';
  entity: 'TABLE' | 'COLUMN' | 'INDEX';
  entityId: string;
  entityName: string;
  field?: string;
  message: string;
  expected?: string;
  actual?: string;
  suggestion?: string;
}

export type ValidationWarning = ValidationError;

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Request Types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  namingRules?: Partial<NamingRules>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  namingRules?: Partial<NamingRules>;
}

export interface CreateTableRequest {
  projectId: string;
  name: string;
  description: string;
  positionX?: number;
  positionY?: number;
}

export interface UpdateTableRequest {
  name?: string;
  description?: string;
  positionX?: number;
  positionY?: number;
}

export interface CreateColumnRequest {
  tableId: string;
  name: string;
  description: string;
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

export interface CreateIndexRequest {
  tableId: string;
  name: string;
  type: 'CLUSTERED' | 'NONCLUSTERED';
  unique: boolean;
  columns: {
    columnId: string;
    order: 'ASC' | 'DESC';
  }[];
}

export interface ReorderColumnsRequest {
  columnIds: string[];
}

// Export Options
export interface ExportOptions {
  includeDropStatements: boolean;
  includeComments: boolean;
  includeIndexes: boolean;
  includeConstraints: boolean;
}

export interface ExportResult {
  sql: string;
  format: 'SQL' | 'JSON' | 'MARKDOWN';
  timestamp: string;
}

// Validation Types
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'ERROR' | 'WARNING';
  enabled: boolean;
}

export interface ValidationSummary {
  totalErrors: number;
  totalWarnings: number;
  complianceRate: number;
  lastValidated: string;
}

// MSSQL Data Type Categories
export const MSSQL_INTEGER_TYPES: MSSQLDataType[] = ['BIGINT', 'INT', 'SMALLINT', 'TINYINT'];
export const MSSQL_DECIMAL_TYPES: MSSQLDataType[] = ['DECIMAL', 'NUMERIC'];
export const MSSQL_FLOAT_TYPES: MSSQLDataType[] = ['FLOAT', 'REAL'];
export const MSSQL_STRING_TYPES: MSSQLDataType[] = ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'TEXT', 'NTEXT'];
export const MSSQL_DATETIME_TYPES: MSSQLDataType[] = ['DATE', 'TIME', 'DATETIME', 'DATETIME2', 'TIMESTAMP'];
export const MSSQL_BINARY_TYPES: MSSQLDataType[] = ['BIT', 'BINARY', 'VARBINARY', 'IMAGE'];
export const MSSQL_OTHER_TYPES: MSSQLDataType[] = ['UNIQUEIDENTIFIER', 'XML', 'JSON'];

// System Columns
export interface SystemColumn {
  name: string;
  description: string;
  dataType: MSSQLDataType;
  nullable: boolean;
  defaultValue?: string;
}

export const SYSTEM_COLUMNS: SystemColumn[] = [
  {
    name: 'REG_ID',
    description: '등록자ID',
    dataType: 'VARCHAR',
    nullable: false,
  },
  {
    name: 'REG_DT',
    description: '등록일시',
    dataType: 'DATETIME',
    nullable: false,
    defaultValue: 'GETDATE()',
  },
  {
    name: 'CHG_ID',
    description: '수정자ID',
    dataType: 'VARCHAR',
    nullable: true,
  },
  {
    name: 'CHG_DT',
    description: '수정일시',
    dataType: 'DATETIME',
    nullable: true,
  },
];
