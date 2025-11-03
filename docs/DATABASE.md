# 데이터베이스 설계 문서

## 개요

MSSQL 데이터베이스 모델링 도구는 PostgreSQL을 백엔드 저장소로 사용하면서 MSSQL 스키마 생성을 목표로 하는 독특한 구조를 가지고 있습니다.

## 데이터베이스 전략

### 백엔드 저장소: PostgreSQL
- **목적**: 프로젝트, 테이블, 컬럼 정의 등 메타데이터 저장
- **버전**: PostgreSQL 15+
- **특징**: UUID 기본키, JSON 지원, 트랜잭션 안정성

### 타겟 출력: MSSQL
- **목적**: 최종 스키마 배포 대상
- **지원 버전**: SQL Server 2019+
- **특징**: NVARCHAR, BIGINT IDENTITY, 클러스터드 인덱스

## PostgreSQL 스키마 설계

### 1. 프로젝트 테이블 (projects)

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    naming_rules TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

-- 인덱스
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_created_at ON projects(created_at);
```

**필드 설명:**
- `id`: UUID 기본키 (GenerationType.AUTO 전략 사용)
- `name`: 프로젝트 명 (유니크 제약조건)
- `description`: 프로젝트 설명
- `naming_rules`: JSON 형태의 명명 규칙 설정
- `version`: 낙관적 잠금을 위한 버전 필드

### 2. 테이블 정의 (tables)

```sql
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position_x DOUBLE PRECISION DEFAULT 0,
    position_y DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

-- 인덱스
CREATE INDEX idx_tables_project_id ON tables(project_id);
CREATE INDEX idx_tables_name ON tables(name);
CREATE UNIQUE INDEX idx_tables_project_name ON tables(project_id, name);
```

**필드 설명:**
- `project_id`: 프로젝트 외래키 (CASCADE 삭제)
- `position_x`, `position_y`: React Flow 캔버스에서의 위치
- 프로젝트 내에서 테이블명 유니크 제약조건

### 3. 컬럼 정의 (columns)

```sql
CREATE TABLE columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    data_type VARCHAR(100) NOT NULL,
    max_length INTEGER,
    precision_value INTEGER,
    scale_value INTEGER,
    is_nullable BOOLEAN NOT NULL DEFAULT true,
    is_primary_key BOOLEAN NOT NULL DEFAULT false,
    is_foreign_key BOOLEAN NOT NULL DEFAULT false,
    foreign_table_id UUID REFERENCES tables(id),
    foreign_column_id UUID REFERENCES columns(id),
    default_value TEXT,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_columns_table_id ON columns(table_id);
CREATE INDEX idx_columns_order ON columns(table_id, order_index);
CREATE UNIQUE INDEX idx_columns_table_name ON columns(table_id, name);
```

**필드 설명:**
- `data_type`: MSSQL 데이터 타입 (NVARCHAR, BIGINT, DATETIME2 등)
- `max_length`: 문자열 타입의 최대 길이
- `precision_value`, `scale_value`: DECIMAL 타입의 정밀도
- `foreign_table_id`, `foreign_column_id`: 외래키 참조 정보
- `order_index`: 컬럼 순서

### 4. 인덱스 정의 (indexes)

```sql
CREATE TABLE indexes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_unique BOOLEAN NOT NULL DEFAULT false,
    is_clustered BOOLEAN NOT NULL DEFAULT false,
    columns JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_indexes_table_id ON indexes(table_id);
CREATE UNIQUE INDEX idx_indexes_table_name ON indexes(table_id, name);
```

**필드 설명:**
- `is_clustered`: MSSQL 클러스터드 인덱스 여부
- `columns`: 인덱스 구성 컬럼 정보 (JSON 배열)

**JSON 구조 예시:**
```json
[
  {
    "columnId": "uuid-1",
    "columnName": "user_id",
    "sortOrder": "ASC"
  },
  {
    "columnId": "uuid-2", 
    "columnName": "created_at",
    "sortOrder": "DESC"
  }
]
```

## UUID 생성 전략

### PostgreSQL 호환성 개선

기존 `GenerationType.UUID`에서 `GenerationType.AUTO`로 변경:

```java
// 변경 전
@GeneratedValue(strategy = GenerationType.UUID)
private UUID id;

// 변경 후 (현재)
@GeneratedValue(strategy = GenerationType.AUTO)
private UUID id;
```

**변경 이유:**
- PostgreSQL의 `gen_random_uuid()` 함수 활용
- 데이터베이스 레벨에서 UUID 생성으로 성능 향상
- 다양한 PostgreSQL 버전과의 호환성 개선

## MSSQL 데이터 타입 매핑

### 지원하는 MSSQL 데이터 타입

| MSSQL 타입 | PostgreSQL 저장 | 설명 |
|------------|----------------|------|
| NVARCHAR(n) | VARCHAR(100) | 유니코드 문자열 |
| VARCHAR(n) | VARCHAR(100) | ASCII 문자열 |
| NCHAR(n) | VARCHAR(100) | 고정길이 유니코드 |
| CHAR(n) | VARCHAR(100) | 고정길이 ASCII |
| NTEXT | VARCHAR(100) | 긴 유니코드 텍스트 |
| TEXT | VARCHAR(100) | 긴 ASCII 텍스트 |
| BIGINT | VARCHAR(100) | 64비트 정수 |
| INT | VARCHAR(100) | 32비트 정수 |
| SMALLINT | VARCHAR(100) | 16비트 정수 |
| TINYINT | VARCHAR(100) | 8비트 정수 |
| DECIMAL(p,s) | VARCHAR(100) | 고정소수점 |
| NUMERIC(p,s) | VARCHAR(100) | 고정소수점 |
| FLOAT | VARCHAR(100) | 부동소수점 |
| REAL | VARCHAR(100) | 단정밀도 부동소수점 |
| DATETIME2 | VARCHAR(100) | 날짜시간 |
| DATETIME | VARCHAR(100) | 날짜시간 (레거시) |
| DATE | VARCHAR(100) | 날짜 |
| TIME | VARCHAR(100) | 시간 |
| BIT | VARCHAR(100) | 불린 |
| UNIQUEIDENTIFIER | VARCHAR(100) | UUID |

### 데이터 타입 검증 규칙

```typescript
interface DataTypeValidation {
  type: string;
  maxLength?: number;
  precision?: number;
  scale?: number;
  allowNull: boolean;
}

const MSSQL_TYPE_RULES: Record<string, DataTypeValidation> = {
  'NVARCHAR': { 
    type: 'NVARCHAR', 
    maxLength: 4000, 
    allowNull: true 
  },
  'BIGINT': { 
    type: 'BIGINT', 
    allowNull: true 
  },
  'DECIMAL': { 
    type: 'DECIMAL', 
    precision: 38, 
    scale: 38, 
    allowNull: true 
  }
  // ... 기타 타입들
};
```

## 명명 규칙 검증

### 데이터베이스 객체 명명 규칙

```json
{
  "tableNaming": {
    "case": "PascalCase",
    "pattern": "^[A-Z][a-zA-Z0-9]*$",
    "maxLength": 128,
    "reservedWords": ["User", "Order", "Group"]
  },
  "columnNaming": {
    "case": "snake_case", 
    "pattern": "^[a-z][a-z0-9_]*$",
    "maxLength": 128,
    "reservedWords": ["id", "created_at", "updated_at"]
  },
  "indexNaming": {
    "pattern": "^IX_[A-Z][a-zA-Z0-9]*_[a-z][a-z0-9_]*$",
    "example": "IX_User_email"
  }
}
```

### 필수 감사 컬럼

모든 테이블에 자동으로 추가되는 컬럼:

```sql
-- MSSQL 출력 시 자동 추가
created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
```

## 데이터베이스 마이그레이션

### Flyway 마이그레이션 스크립트

```sql
-- V1__Create_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    naming_rules TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

-- 트리거 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 성능 최적화

### 인덱스 전략

```sql
-- 복합 인덱스 (프로젝트별 테이블 조회)
CREATE INDEX idx_tables_project_created ON tables(project_id, created_at);

-- 부분 인덱스 (기본키 컬럼만)
CREATE INDEX idx_columns_primary_key ON columns(table_id) 
WHERE is_primary_key = true;

-- JSON 인덱스 (명명 규칙 검색)
CREATE INDEX idx_projects_naming_rules_gin ON projects 
USING GIN (naming_rules jsonb_path_ops);
```

### 쿼리 최적화

```java
// N+1 문제 방지
@Query("SELECT p FROM ProjectEntity p LEFT JOIN FETCH p.tables t LEFT JOIN FETCH t.columns WHERE p.id = :id")
Optional<ProjectEntity> findByIdWithTablesAndColumns(@Param("id") UUID id);

// 페이징 처리
@Query("SELECT p FROM ProjectEntity p ORDER BY p.createdAt DESC")
Page<ProjectEntity> findAllOrderByCreatedAtDesc(Pageable pageable);
```

## 백업 및 복구

### 개발 환경 백업

```bash
# 데이터베이스 덤프
docker exec dbmodeling-postgres-dev pg_dump -U postgres dbmodeling_dev > backup.sql

# 복구
docker exec -i dbmodeling-postgres-dev psql -U postgres dbmodeling_dev < backup.sql
```

### 프로덕션 백업 전략

```bash
# 자동 백업 스크립트
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U postgres -d dbmodeling_prod > $BACKUP_DIR/dbmodeling_$(date +%H%M%S).sql

# 7일 이상 된 백업 삭제
find /backups -type d -mtime +7 -exec rm -rf {} \;
```

## 모니터링

### 데이터베이스 메트릭스

```sql
-- 테이블 크기 모니터링
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 활성 연결 수
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- 느린 쿼리 모니터링
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

이 데이터베이스 설계는 확장성과 성능을 고려하여 구성되었으며, PostgreSQL의 강력한 기능들을 활용하면서도 MSSQL 출력을 위한 메타데이터를 효율적으로 저장할 수 있도록 설계되었습니다.