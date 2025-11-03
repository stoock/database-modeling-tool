# Design Document

## Overview

심플한 MSSQL 데이터베이스 모델링 도구 프론트엔드는 React 19 + TypeScript 기반의 SPA(Single Page Application)입니다. 기존 백엔드 API를 활용하여 필수 기능만을 제공하며, 복잡한 시각화 대신 테이블 기반의 직관적인 UI를 제공합니다.

### 핵심 설계 원칙
- **심플함**: 복잡한 드래그 앤 드롭이나 시각화 없이 테이블/폼 기반 UI
- **반응성**: 모든 화면 크기에서 사용 가능한 반응형 디자인
- **즉시성**: 실시간 검증과 즉각적인 피드백
- **타입 안정성**: TypeScript를 활용한 타입 안전성 보장

## Architecture

### 전체 구조

```
frontend/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── common/          # 공통 컴포넌트 (Button, Input, Modal 등)
│   │   ├── project/         # 프로젝트 관련 컴포넌트
│   │   ├── table/           # 테이블 관련 컴포넌트
│   │   ├── column/          # 컬럼 관련 컴포넌트
│   │   ├── index/           # 인덱스 관련 컴포넌트
│   │   └── export/          # 내보내기 관련 컴포넌트
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── ProjectListPage.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   └── TableDetailPage.tsx
│   ├── services/            # API 통신 로직
│   │   ├── api.ts           # Axios 인스턴스 및 공통 설정
│   │   ├── projectService.ts
│   │   ├── tableService.ts
│   │   ├── columnService.ts
│   │   ├── indexService.ts
│   │   ├── exportService.ts
│   │   └── validationService.ts
│   ├── stores/              # Zustand 상태 관리
│   │   ├── projectStore.ts
│   │   ├── tableStore.ts
│   │   └── uiStore.ts
│   ├── types/               # TypeScript 타입 정의
│   │   ├── project.ts
│   │   ├── table.ts
│   │   ├── column.ts
│   │   ├── index.ts
│   │   └── api.ts
│   ├── utils/               # 유틸리티 함수
│   │   ├── validation.ts
│   │   └── format.ts
│   ├── hooks/               # 커스텀 React 훅
│   │   ├── useApi.ts
│   │   └── useValidation.ts
│   ├── App.tsx              # 루트 컴포넌트
│   └── main.tsx             # 엔트리 포인트
```

### 라우팅 구조

```
/ (루트)
├── /projects (프로젝트 목록)
├── /projects/:projectId (프로젝트 상세 - 테이블 목록)
└── /projects/:projectId/tables/:tableId (테이블 상세 - 컬럼/인덱스 관리)
```

## Components and Interfaces

### 1. 공통 컴포넌트

#### Button
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}
```

#### Input
```typescript
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  onBlur?: () => void;
}
```

#### Modal
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### Table
```typescript
interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

interface ColumnDef<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  width?: string;
}
```

### 2. 프로젝트 컴포넌트

#### ProjectList
- 프로젝트 목록을 카드 형태로 표시
- 각 카드에 프로젝트명, 설명, 테이블 수, 생성일 표시
- "새 프로젝트" 버튼 제공

#### ProjectForm
- 프로젝트 생성/수정 폼
- 필드: 이름(필수), 설명(선택)
- 실시간 유효성 검증

### 3. 테이블 컴포넌트

#### TableList
- 프로젝트의 테이블 목록을 테이블 형태로 표시
- 컬럼: 테이블명, 설명, 컬럼 수, 인덱스 수, 작업
- 각 행 클릭 시 테이블 상세 페이지로 이동

#### TableForm
- 테이블 생성/수정 폼
- 필드: 이름(필수), 설명(선택)
- 네이밍 규칙 실시간 검증

### 4. 컬럼 컴포넌트

#### ColumnList
- 테이블의 컬럼 목록을 테이블 형태로 표시
- 컬럼: 순서, 컬럼명, 데이터 타입, NULL 허용, 기본값, 작업
- 드래그 앤 드롭 없이 순서 변경 버튼 제공

#### ColumnForm
- 컬럼 생성/수정 폼
- 필드:
  - 컬럼명(필수)
  - 데이터 타입(필수, 드롭다운)
  - 길이/정밀도(데이터 타입에 따라 표시)
  - NULL 허용(체크박스)
  - 기본값(선택)
  - 설명(선택)
- 네이밍 규칙 실시간 검증

#### DataTypeSelector
- MSSQL 데이터 타입 선택 드롭다운
- 그룹화: 문자열, 숫자, 날짜/시간, 기타
- 타입별 추가 옵션 표시 (예: NVARCHAR → 길이 입력)

### 5. 인덱스 컴포넌트

#### IndexList
- 테이블의 인덱스 목록을 테이블 형태로 표시
- 컬럼: 인덱스명, 타입, UNIQUE, 컬럼, 작업

#### IndexForm
- 인덱스 생성/수정 폼
- 필드:
  - 인덱스명(필수)
  - 타입(CLUSTERED/NONCLUSTERED, 라디오 버튼)
  - UNIQUE(체크박스)
  - 컬럼 선택(다중 선택, 순서 지정)

### 6. 내보내기 컴포넌트

#### ExportDialog
- 내보내기 옵션 선택 모달
- 형식 선택: SQL, Markdown, HTML, JSON, CSV
- 검증 포함 옵션(체크박스)
- 미리보기/다운로드 버튼

#### SqlPreview
- 생성된 SQL 스크립트 미리보기
- 코드 하이라이팅
- 복사 버튼

## Data Models

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  namingRules?: NamingRules;
  createdAt: string;
  updatedAt: string;
}

interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  tableCount: number;
  createdAt: string;
  updatedAt: string;
}

interface NamingRules {
  tablePrefix?: string;
  tableSuffix?: string;
  tablePattern?: string;
  columnPattern?: string;
  indexPattern?: string;
  enforceCase?: 'UPPER' | 'LOWER' | 'PASCAL' | 'SNAKE';
}
```

### Table
```typescript
interface Table {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  columns: Column[];
  indexes: Index[];
  createdAt: string;
  updatedAt: string;
}

interface TableSummary {
  id: string;
  name: string;
  description?: string;
  columnCount: number;
  indexCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### Column
```typescript
interface Column {
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

// MSSQL 데이터 타입
type MSSQLDataType = 
  | 'NVARCHAR' | 'VARCHAR' | 'NCHAR' | 'CHAR' | 'TEXT' | 'NTEXT'
  | 'BIGINT' | 'INT' | 'SMALLINT' | 'TINYINT' | 'DECIMAL' | 'NUMERIC' | 'FLOAT' | 'REAL'
  | 'DATETIME2' | 'DATETIME' | 'DATE' | 'TIME' | 'DATETIMEOFFSET'
  | 'BIT' | 'UNIQUEIDENTIFIER' | 'XML' | 'JSON';
```

### Index
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

interface IndexColumn {
  columnId: string;
  columnName: string;
  order: 'ASC' | 'DESC';
}
```

### Validation
```typescript
interface ValidationResult {
  valid: boolean;
  name: string;
  type: string;
  errors: ValidationError[];
  suggestion?: string;
}

interface ValidationError {
  code: string;
  message: string;
  detail?: string;
}
```

## State Management (Zustand)

### projectStore
```typescript
interface ProjectStore {
  projects: ProjectSummary[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}
```

### tableStore
```typescript
interface TableStore {
  tables: TableSummary[];
  currentTable: Table | null;
  loading: boolean;
  error: string | null;
  
  fetchTables: (projectId: string) => Promise<void>;
  fetchTable: (id: string) => Promise<void>;
  createTable: (projectId: string, data: CreateTableRequest) => Promise<Table>;
  updateTable: (id: string, data: UpdateTableRequest) => Promise<Table>;
  deleteTable: (id: string) => Promise<void>;
  
  // 컬럼 관리
  createColumn: (tableId: string, data: CreateColumnRequest) => Promise<Column>;
  updateColumn: (id: string, data: UpdateColumnRequest) => Promise<Column>;
  deleteColumn: (id: string) => Promise<void>;
  
  // 인덱스 관리
  createIndex: (tableId: string, data: CreateIndexRequest) => Promise<Index>;
  deleteIndex: (id: string) => Promise<void>;
}
```

### uiStore
```typescript
interface UIStore {
  modals: {
    projectForm: boolean;
    tableForm: boolean;
    columnForm: boolean;
    indexForm: boolean;
    exportDialog: boolean;
  };
  
  openModal: (modal: keyof UIStore['modals']) => void;
  closeModal: (modal: keyof UIStore['modals']) => void;
  closeAllModals: () => void;
}
```

## API Services

### API 클라이언트 설정
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 로딩 상태 관리
api.interceptors.request.use((config) => {
  // 로딩 시작
  return config;
});

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 에러 메시지 추출 및 표시
    const message = error.response?.data?.message || '요청 처리 중 오류가 발생했습니다.';
    throw new Error(message);
  }
);

export default api;
```

### Service 구조
각 서비스는 백엔드 API 엔드포인트를 호출하는 함수들을 제공합니다.

```typescript
// services/projectService.ts
export const projectService = {
  getAll: () => api.get<ApiResponse<ProjectSummary[]>>('/projects'),
  getById: (id: string) => api.get<ApiResponse<Project>>(`/projects/${id}`),
  create: (data: CreateProjectRequest) => api.post<ApiResponse<Project>>('/projects', data),
  update: (id: string, data: UpdateProjectRequest) => api.put<ApiResponse<Project>>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};
```

## Error Handling

### 에러 처리 전략
1. **API 에러**: Axios 인터셉터에서 일괄 처리
2. **유효성 검증 에러**: 폼 컴포넌트에서 개별 처리
3. **네트워크 에러**: 재시도 로직 및 사용자 알림

### 에러 표시
- **토스트 알림**: 일시적인 성공/실패 메시지
- **인라인 에러**: 폼 필드 아래 빨간색 메시지
- **에러 페이지**: 치명적인 에러 발생 시

## Testing Strategy

### 단위 테스트
- **컴포넌트**: React Testing Library
- **서비스**: Jest + MSW (Mock Service Worker)
- **스토어**: Zustand 테스트 유틸리티
- **유틸리티 함수**: Jest

### 테스트 우선순위
1. 핵심 비즈니스 로직 (서비스, 스토어)
2. 공통 컴포넌트 (Button, Input, Modal 등)
3. 폼 유효성 검증
4. API 통신 로직

### E2E 테스트
- Playwright를 사용한 주요 사용자 플로우 테스트
- 시나리오:
  1. 프로젝트 생성 → 테이블 추가 → 컬럼 추가 → 스키마 내보내기
  2. 네이밍 규칙 검증 플로우

## Performance Considerations

### 최적화 전략
1. **코드 스플리팅**: React.lazy를 사용한 페이지별 분할
2. **메모이제이션**: React.memo, useMemo, useCallback 활용
3. **가상 스크롤**: 대량 데이터 렌더링 시 react-window 사용
4. **디바운싱**: 검색/검증 입력 시 디바운스 적용

### 번들 크기 관리
- Tree shaking 활성화
- 불필요한 라이브러리 제거
- 이미지 최적화

## UI/UX Design

### 디자인 시스템
- **색상 팔레트**:
  - Primary: Blue (#3B82F6)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Danger: Red (#EF4444)
  - Neutral: Gray (#6B7280)

- **타이포그래피**:
  - 제목: font-bold text-2xl
  - 부제목: font-semibold text-lg
  - 본문: font-normal text-base
  - 캡션: font-normal text-sm

- **간격**:
  - 컴포넌트 간: space-y-4
  - 섹션 간: space-y-8
  - 페이지 패딩: p-6

### 반응형 브레이크포인트
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 접근성
- 모든 인터랙티브 요소에 키보드 접근 가능
- ARIA 레이블 적용
- 색상 대비 WCAG AA 준수

## Deployment

### 환경 변수
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 빌드 설정
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['zustand', 'axios'],
        },
      },
    },
  },
});
```

### 배포 전략
1. 개발 환경: Vite dev server
2. 프로덕션: Nginx 정적 파일 서빙
3. Docker 컨테이너화 (선택사항)
