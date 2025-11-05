# 타입 정의

이 폴더는 프로젝트 전반에서 사용되는 TypeScript 타입 정의를 포함합니다.

## 주요 타입

### 도메인 모델

#### `Project`
데이터베이스 모델링 프로젝트
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  namingRules: NamingRules;
  createdAt: string;
  updatedAt: string;
}
```

#### `Table`
데이터베이스 테이블
```typescript
interface Table {
  id: string;
  projectId: string;
  name: string;
  description: string;
  positionX?: number;
  positionY?: number;
  createdAt: string;
  updatedAt: string;
}
```

#### `Column`
테이블 컬럼
```typescript
interface Column {
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
```

#### `Index`
테이블 인덱스
```typescript
interface Index {
  id: string;
  tableId: string;
  name: string;
  type: 'CLUSTERED' | 'NONCLUSTERED';
  unique: boolean;
  columns: IndexColumn[];
  createdAt: string;
  updatedAt: string;
}
```

### MSSQL 데이터 타입

27개의 MSSQL 데이터 타입을 지원합니다:

**정수형**: `BIGINT`, `INT`, `SMALLINT`, `TINYINT`

**실수형**: `DECIMAL`, `NUMERIC`, `FLOAT`, `REAL`

**문자열**: `VARCHAR`, `NVARCHAR`, `CHAR`, `NCHAR`, `TEXT`, `NTEXT`

**날짜/시간**: `DATE`, `TIME`, `DATETIME`, `DATETIME2`, `TIMESTAMP`

**이진**: `BIT`, `BINARY`, `VARBINARY`, `IMAGE`

**기타**: `UNIQUEIDENTIFIER`, `XML`, `JSON`

### 데이터 타입 카테고리

편의를 위해 타입별 배열을 제공합니다:
```typescript
MSSQL_INTEGER_TYPES: MSSQLDataType[]
MSSQL_DECIMAL_TYPES: MSSQLDataType[]
MSSQL_FLOAT_TYPES: MSSQLDataType[]
MSSQL_STRING_TYPES: MSSQLDataType[]
MSSQL_DATETIME_TYPES: MSSQLDataType[]
MSSQL_BINARY_TYPES: MSSQLDataType[]
MSSQL_OTHER_TYPES: MSSQLDataType[]
```

### API 타입

#### `ApiResponse<T>`
성공 응답
```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}
```

#### `ApiError`
에러 응답
```typescript
interface ApiError {
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}
```

#### `PaginatedResponse<T>`
페이지네이션 응답
```typescript
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

### Request 타입

각 엔티티에 대한 생성/수정 요청 타입:
- `CreateProjectRequest`, `UpdateProjectRequest`
- `CreateTableRequest`, `UpdateTableRequest`
- `CreateColumnRequest`, `UpdateColumnRequest`
- `CreateIndexRequest`
- `ReorderColumnsRequest`

### 검증 타입

#### `ValidationResult`
검증 결과
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

#### `ValidationError`
검증 에러/경고
```typescript
interface ValidationError {
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
```

#### `ValidationSummary`
검증 요약
```typescript
interface ValidationSummary {
  totalErrors: number;
  totalWarnings: number;
  complianceRate: number;
  lastValidated: string;
}
```

### 내보내기 타입

#### `ExportOptions`
스키마 내보내기 옵션
```typescript
interface ExportOptions {
  includeDropStatements: boolean;
  includeComments: boolean;
  includeIndexes: boolean;
  includeConstraints: boolean;
}
```

#### `ExportResult`
내보내기 결과
```typescript
interface ExportResult {
  sql: string;
  format: 'SQL' | 'JSON' | 'MARKDOWN';
  timestamp: string;
}
```

### 시스템 컬럼

#### `SystemColumn`
시스템 속성 컬럼 정의
```typescript
interface SystemColumn {
  name: string;
  description: string;
  dataType: MSSQLDataType;
  nullable: boolean;
  defaultValue?: string;
}
```

#### `SYSTEM_COLUMNS`
기본 시스템 컬럼 배열:
- `REG_ID`: 등록자ID (VARCHAR, NOT NULL)
- `REG_DT`: 등록일시 (DATETIME, NOT NULL, DEFAULT GETDATE())
- `CHG_ID`: 수정자ID (VARCHAR, NULL)
- `CHG_DT`: 수정일시 (DATETIME, NULL)

## 사용 예시

```typescript
import type { 
  Project, 
  Table, 
  Column, 
  MSSQLDataType,
  CreateColumnRequest,
  ValidationResult 
} from '@/types';

// 컬럼 생성 요청
const request: CreateColumnRequest = {
  tableId: 'table-123',
  name: 'USER_ID',
  description: '사용자ID',
  dataType: 'VARCHAR',
  maxLength: 50,
  nullable: false,
  primaryKey: true,
  identity: false,
  orderIndex: 1,
};

// 데이터 타입 확인
import { MSSQL_INTEGER_TYPES } from '@/types';

const isInteger = MSSQL_INTEGER_TYPES.includes(column.dataType);
```
