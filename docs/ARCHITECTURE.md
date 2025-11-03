# 아키텍처 문서

## 개요

MSSQL 데이터베이스 모델링 도구는 Clean Architecture 원칙을 따라 설계된 풀스택 웹 애플리케이션입니다. PostgreSQL을 백엔드 저장소로 사용하면서 MSSQL 스키마 생성을 목표로 하는 독특한 구조를 가지고 있습니다.

## 전체 시스템 아키텍처

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React Client  │ ◄──────────────► │  Spring Boot    │
│   (Frontend)    │                  │   (Backend)     │
└─────────────────┘                  └─────────────────┘
                                              │
                                              │ JPA/Hibernate
                                              ▼
                                     ┌─────────────────┐
                                     │   PostgreSQL    │
                                     │   (Storage)     │
                                     └─────────────────┘
                                              │
                                              │ SQL Generation
                                              ▼
                                     ┌─────────────────┐
                                     │  MSSQL Scripts  │
                                     │   (Output)      │
                                     └─────────────────┘
```

## 백엔드 아키텍처 (Clean Architecture)

### 계층 구조

```
┌─────────────────────────────────────────────────────────┐
│                 Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Controllers   │  │      DTOs       │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │    Services     │  │    Use Cases    │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  Domain Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │     Models      │  │   Repositories  │              │
│  │                 │  │  (Interfaces)   │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              Infrastructure Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   JPA Entities  │  │  Repository     │              │
│  │                 │  │ Implementations │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

#### 1. Domain Layer (도메인 계층)
- **Project**: 데이터베이스 모델링 프로젝트
- **Table**: 데이터베이스 테이블 정의
- **Column**: 테이블 컬럼 정의
- **Index**: 인덱스 정의
- **NamingRules**: 명명 규칙 정의

#### 2. Application Layer (애플리케이션 계층)
- **ProjectService**: 프로젝트 관리 비즈니스 로직
- **TableService**: 테이블 관리 비즈니스 로직
- **ValidationService**: 명명 규칙 검증
- **ExportService**: SQL 스크립트 생성

#### 3. Infrastructure Layer (인프라스트럭처 계층)
- **JPA Entities**: 데이터베이스 매핑
- **Repository Implementations**: 데이터 접근 구현
- **Configuration**: Spring Boot 설정

#### 4. Presentation Layer (프레젠테이션 계층)
- **REST Controllers**: HTTP API 엔드포인트
- **DTOs**: 데이터 전송 객체
- **Mappers**: DTO ↔ Command/Response 변환

**최근 개선사항:**
- TableController에서 Command 패턴 임시 우회 코드 제거
- `tableMapper.toCommand(projectUuid, request)` 정상 매핑 구조 완성
- Clean Architecture 계층 간 의존성 방향 완전 준수

## 프론트엔드 아키텍처

### 컴포넌트 구조

```
┌─────────────────────────────────────────────────────────┐
│                    App Component                         │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                 Feature Components                       │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ TableDesigner   │  │ ProjectManager  │              │
│  │                 │  │                 │              │
│  └─────────────────┘  └─────────────────┘              │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ValidationPanel  │  │  SchemaExport   │              │
│  │                 │  │                 │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                 State Management                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  Project Store  │  │  Table Store    │              │
│  │   (Zustand)     │  │   (Zustand)     │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Services                             │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   API Client    │  │   Validation    │              │
│  │    (Axios)      │  │    Service      │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 상태 관리 (Zustand)

```typescript
// Project Store
interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (project: CreateProjectRequest) => Promise<void>;
  updateProject: (id: string, project: UpdateProjectRequest) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

// Table Store
interface TableStore {
  tables: Table[];
  selectedTable: Table | null;
  
  // Actions
  addTable: (table: Table) => void;
  updateTable: (id: string, table: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  selectTable: (id: string) => void;
}
```

## 데이터베이스 설계

### PostgreSQL 스키마 (백엔드 저장소)

```sql
-- 프로젝트 테이블
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    naming_rules TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

-- 테이블 정의
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position_x DOUBLE PRECISION,
    position_y DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

-- 컬럼 정의
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
    default_value TEXT,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 정의
CREATE TABLE indexes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_unique BOOLEAN NOT NULL DEFAULT false,
    is_clustered BOOLEAN NOT NULL DEFAULT false,
    columns TEXT NOT NULL, -- JSON 배열
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### UUID 생성 전략

PostgreSQL 호환성을 위해 `GenerationType.AUTO` 전략을 사용합니다:

```java
@Entity
@Table(name = "projects")
public class ProjectEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    // ... 기타 필드
}
```

이 전략은 PostgreSQL의 `gen_random_uuid()` 함수를 활용하여 UUID를 생성합니다.

## API 설계

### RESTful API 구조

```
/api/projects
├── GET     /                    # 프로젝트 목록 조회
├── POST    /                    # 프로젝트 생성
├── GET     /{id}                # 프로젝트 상세 조회
├── PUT     /{id}                # 프로젝트 수정
├── DELETE  /{id}                # 프로젝트 삭제
└── POST    /{id}/export/sql     # SQL 스크립트 생성

/api/projects/{projectId}/tables
├── GET     /                    # 테이블 목록 조회
├── POST    /                    # 테이블 생성 ✅ Clean Architecture 완성
├── PUT     /{id}                # 테이블 수정
└── DELETE  /{id}                # 테이블 삭제

**구현 세부사항:**
```java
// TableController.createTable() - 완성된 구현
UUID projectUuid = UUID.fromString(projectId);
Table createdTable = tableService.createTable(tableMapper.toCommand(projectUuid, request));
TableResponse response = tableMapper.toResponse(createdTable);
```

/api/tables/{tableId}/columns
├── GET     /                    # 컬럼 목록 조회
├── POST    /                    # 컬럼 생성
├── PUT     /{id}                # 컬럼 수정
└── DELETE  /{id}                # 컬럼 삭제
```

### 에러 처리

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "name",
      "message": "테이블 이름은 PascalCase여야 합니다"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 보안 고려사항

### 입력 검증
- Bean Validation을 통한 서버 사이드 검증
- 클라이언트 사이드 실시간 검증
- SQL 인젝션 방지를 위한 파라미터화된 쿼리

### 데이터 무결성
- 외래키 제약조건
- 낙관적 잠금 (@Version)
- 트랜잭션 관리

## 성능 최적화

### 백엔드
- JPA N+1 문제 방지 (fetch join, @EntityGraph)
- 데이터베이스 인덱스 최적화
- 커넥션 풀 설정

### 프론트엔드
- React.memo를 통한 불필요한 리렌더링 방지
- 코드 스플리팅
- 이미지 최적화

## 배포 아키텍처

### 개발 환경
```
Docker Compose
├── PostgreSQL (개발용)
├── PostgreSQL (테스트용)
└── pgAdmin
```

### 프로덕션 환경 (예상)
```
Load Balancer
├── Frontend (Nginx + React)
└── Backend (Spring Boot)
    └── PostgreSQL (RDS)
```

## 모니터링 및 로깅

### 애플리케이션 로깅
- Logback을 통한 구조화된 로깅
- 요청/응답 로깅
- 에러 추적

### 메트릭스
- Spring Boot Actuator
- 데이터베이스 연결 상태
- API 응답 시간

이 아키텍처는 확장성, 유지보수성, 테스트 가능성을 고려하여 설계되었으며, Clean Architecture 원칙을 통해 비즈니스 로직과 기술적 관심사를 명확히 분리하고 있습니다.