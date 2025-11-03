# 심플 프론트엔드 구현 문서

## 개요

기존 백엔드 API를 활용하여 MSSQL 데이터베이스 모델링 도구의 필수 기능만을 제공하는 심플한 프론트엔드입니다. 복잡한 시각화나 고급 기능을 배제하고, 테이블과 컬럼 관리, 스키마 내보내기 등 핵심 기능에 집중합니다.

## 설계 원칙

- **심플함**: 복잡한 드래그 앤 드롭이나 시각화 없이 테이블/폼 기반 UI
- **반응성**: 모든 화면 크기에서 사용 가능한 반응형 디자인
- **즉시성**: 실시간 검증과 즉각적인 피드백
- **타입 안정성**: TypeScript를 활용한 타입 안전성 보장

## 기술 스택

- **React 19**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 유틸리티 우선 스타일링
- **Zustand**: 경량 상태 관리
- **Axios**: HTTP 클라이언트
- **React Router**: 클라이언트 사이드 라우팅

## 구현 현황

### ✅ 완료된 항목

#### 1. TypeScript 타입 정의 (일부)
- **project.ts** (완료)
  - `Project`: 프로젝트 전체 정보
  - `ProjectSummary`: 프로젝트 목록용 요약 정보
  - `NamingRules`: 명명 규칙 설정
  - `CaseType`: 대소문자 규칙 타입 (UPPER, LOWER, PASCAL, SNAKE)
  - `CreateProjectRequest`: 프로젝트 생성 요청 DTO
  - `UpdateProjectRequest`: 프로젝트 수정 요청 DTO

#### 2. 공통 컴포넌트 (일부)
- **Button.tsx**: 기본 버튼 컴포넌트
- **Modal.tsx**: 모달 다이얼로그 컴포넌트

### 🔄 진행 중인 항목

#### TypeScript 타입 정의
- **table.ts**: 테이블 관련 타입
- **column.ts**: 컬럼 관련 타입 (일부 완료)
- **index.ts**: 인덱스 관련 타입
- **api.ts**: API 응답 공통 타입

#### API 서비스
- **api.ts**: Axios 인스턴스 및 인터셉터
- **projectService.ts**: 프로젝트 CRUD API
- **tableService.ts**: 테이블 CRUD API
- **columnService.ts**: 컬럼 CRUD API
- **indexService.ts**: 인덱스 CRUD API
- **exportService.ts**: 스키마 내보내기 API
- **validationService.ts**: 명명 규칙 검증 API

#### Zustand 스토어
- **projectStore.ts**: 프로젝트 상태 관리
- **tableStore.ts**: 테이블 상태 관리
- **uiStore.ts**: UI 상태 관리 (모달, 로딩 등)

### 📋 예정된 항목

#### 페이지 컴포넌트
- **ProjectListPage**: 프로젝트 목록 페이지
- **ProjectDetailPage**: 프로젝트 상세 및 테이블 목록 페이지
- **TableDetailPage**: 테이블 상세 및 컬럼/인덱스 관리 페이지

#### 기능 컴포넌트
- **ProjectList**: 프로젝트 카드 목록
- **ProjectForm**: 프로젝트 생성/수정 폼
- **TableList**: 테이블 목록 테이블
- **TableForm**: 테이블 생성/수정 폼
- **ColumnList**: 컬럼 목록 테이블
- **ColumnForm**: 컬럼 생성/수정 폼
- **DataTypeSelector**: MSSQL 데이터 타입 선택기
- **IndexList**: 인덱스 목록 테이블
- **IndexForm**: 인덱스 생성 폼
- **ExportDialog**: 스키마 내보내기 다이얼로그
- **SqlPreview**: SQL 스크립트 미리보기

## 프로젝트 타입 상세

### Project 인터페이스
```typescript
interface Project {
  id: string;                    // UUID
  name: string;                  // 프로젝트명 (필수)
  description?: string;          // 프로젝트 설명 (선택)
  namingRules?: NamingRules;     // 명명 규칙 (선택)
  createdAt: string;             // 생성일시 (ISO 8601)
  updatedAt: string;             // 수정일시 (ISO 8601)
}
```

### ProjectSummary 인터페이스
```typescript
interface ProjectSummary {
  id: string;                    // UUID
  name: string;                  // 프로젝트명
  description?: string;          // 프로젝트 설명
  tableCount: number;            // 테이블 개수
  createdAt: string;             // 생성일시
  updatedAt: string;             // 수정일시
}
```

### NamingRules 인터페이스
```typescript
interface NamingRules {
  tablePrefix?: string;          // 테이블명 접두사
  tableSuffix?: string;          // 테이블명 접미사
  tablePattern?: string;         // 테이블명 정규식 패턴
  columnPattern?: string;        // 컬럼명 정규식 패턴
  indexPattern?: string;         // 인덱스명 정규식 패턴
  enforceCase?: CaseType;        // 대소문자 규칙
}
```

### CaseType
```typescript
type CaseType = 'UPPER' | 'LOWER' | 'PASCAL' | 'SNAKE';
```

- **UPPER**: 모두 대문자 (예: USER_TABLE)
- **LOWER**: 모두 소문자 (예: user_table)
- **PASCAL**: 파스칼 케이스 (예: UserTable)
- **SNAKE**: 스네이크 케이스 (예: user_table)

### CreateProjectRequest
```typescript
interface CreateProjectRequest {
  name: string;                  // 프로젝트명 (필수)
  description?: string;          // 프로젝트 설명 (선택)
  namingRules?: NamingRules;     // 명명 규칙 (선택)
}
```

### UpdateProjectRequest
```typescript
interface UpdateProjectRequest {
  name?: string;                 // 프로젝트명 (선택)
  description?: string;          // 프로젝트 설명 (선택)
  namingRules?: NamingRules;     // 명명 규칙 (선택)
}
```

## API 엔드포인트 매핑

### 프로젝트 API
```
GET    /api/projects              → projectService.getAll()
POST   /api/projects              → projectService.create(CreateProjectRequest)
GET    /api/projects/{id}         → projectService.getById(id)
PUT    /api/projects/{id}         → projectService.update(id, UpdateProjectRequest)
DELETE /api/projects/{id}         → projectService.delete(id)
```

### 테이블 API
```
GET    /api/projects/{projectId}/tables  → tableService.getByProjectId(projectId)
POST   /api/projects/{projectId}/tables  → tableService.create(projectId, CreateTableRequest)
GET    /api/tables/{id}                  → tableService.getById(id)
PUT    /api/tables/{id}                  → tableService.update(id, UpdateTableRequest)
DELETE /api/tables/{id}                  → tableService.delete(id)
```

### 컬럼 API
```
GET    /api/tables/{tableId}/columns  → columnService.getByTableId(tableId)
POST   /api/tables/{tableId}/columns  → columnService.create(tableId, CreateColumnRequest)
PUT    /api/columns/{id}              → columnService.update(id, UpdateColumnRequest)
DELETE /api/columns/{id}              → columnService.delete(id)
```

### 인덱스 API
```
GET    /api/tables/{tableId}/indexes  → indexService.getByTableId(tableId)
POST   /api/tables/{tableId}/indexes  → indexService.create(tableId, CreateIndexRequest)
DELETE /api/indexes/{id}              → indexService.delete(id)
```

### 내보내기 API
```
POST   /api/projects/{projectId}/export/preview   → exportService.preview(projectId, options)
POST   /api/projects/{projectId}/export/download  → exportService.download(projectId, options)
```

### 검증 API
```
POST   /api/projects/{projectId}/validation      → validationService.validateName(projectId, name, type)
POST   /api/projects/{projectId}/validation/all  → validationService.validateProject(projectId)
```

## 라우팅 구조

```
/                                    → ProjectListPage (프로젝트 목록)
/projects/:projectId                 → ProjectDetailPage (프로젝트 상세 + 테이블 목록)
/projects/:projectId/tables/:tableId → TableDetailPage (테이블 상세 + 컬럼/인덱스 관리)
```

## 상태 관리 전략

### projectStore
- 프로젝트 목록 (`projects: ProjectSummary[]`)
- 현재 선택된 프로젝트 (`currentProject: Project | null`)
- 로딩 상태 (`loading: boolean`)
- 에러 상태 (`error: string | null`)
- CRUD 액션 (fetchProjects, createProject, updateProject, deleteProject)

### tableStore
- 테이블 목록 (`tables: TableSummary[]`)
- 현재 선택된 테이블 (`currentTable: Table | null`)
- 로딩 상태 (`loading: boolean`)
- 에러 상태 (`error: string | null`)
- CRUD 액션 (fetchTables, createTable, updateTable, deleteTable)
- 컬럼 관리 액션 (createColumn, updateColumn, deleteColumn)
- 인덱스 관리 액션 (createIndex, deleteIndex)

### uiStore
- 모달 상태 (`modals: { projectForm: boolean, tableForm: boolean, ... }`)
- 모달 제어 액션 (openModal, closeModal, closeAllModals)

## 개발 가이드

### 타입 정의 작성 규칙
1. 모든 API 응답 타입은 백엔드 DTO와 일치해야 함
2. 선택적 필드는 `?`로 명시
3. 날짜는 ISO 8601 문자열 형식 사용
4. ID는 UUID 문자열 타입 사용

### 컴포넌트 작성 규칙
1. 함수형 컴포넌트 사용
2. Props 인터페이스 명시적 정의
3. Tailwind CSS 클래스 사용
4. 재사용 가능한 컴포넌트는 common 디렉토리에 배치

### API 서비스 작성 규칙
1. Axios 인스턴스 사용
2. 타입 안전한 응답 처리
3. 에러 처리 일관성 유지
4. 로딩 상태 관리

## 다음 단계

1. **타입 정의 완성**: table.ts, column.ts, index.ts, api.ts
2. **API 서비스 구현**: 모든 서비스 파일 작성
3. **Zustand 스토어 구현**: 상태 관리 로직 작성
4. **공통 컴포넌트 완성**: Input, Table, LoadingSpinner, ErrorMessage
5. **페이지 컴포넌트 구현**: 3개 주요 페이지 작성
6. **기능 컴포넌트 구현**: 프로젝트, 테이블, 컬럼, 인덱스 관련 컴포넌트
7. **라우팅 설정**: React Router 설정
8. **통합 테스트**: 전체 플로우 테스트

## 참고 문서

- [Requirements Document](.kiro/specs/simple-frontend/requirements.md)
- [Design Document](.kiro/specs/simple-frontend/design.md)
- [Implementation Tasks](.kiro/specs/simple-frontend/tasks.md)
- [Frontend README](../frontend/README.md)
