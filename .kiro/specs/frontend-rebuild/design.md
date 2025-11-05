# Design Document

## Overview

frontend-new 폴더에 React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui 기반의 간소화된 MSSQL 데이터베이스 모델링 도구를 구축합니다. 기존 복잡한 프론트엔드 대신 핵심 기능만 포함하여 빠르고 직관적인 사용자 경험을 제공합니다.

### 핵심 설계 원칙
- **최소주의**: 꼭 필요한 기능만 구현
- **단순성**: 복잡한 상태 관리 최소화
- **재사용성**: shadcn/ui 컴포넌트 활용
- **성능**: React 19의 최신 기능 활용
- **접근성**: ARIA 표준 준수

## Architecture

### 기술 스택
- **프레임워크**: React 19
- **언어**: TypeScript 5.x
- **빌드 도구**: Vite 5.x
- **스타일링**: Tailwind CSS 3.x
- **UI 컴포넌트**: shadcn/ui (Radix UI 기반)
- **상태 관리**: Zustand 4.x
- **HTTP 클라이언트**: Axios
- **폼 관리**: React Hook Form + Zod
- **라우팅**: React Router v6

### 폴더 구조
```
frontend-new/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui 컴포넌트
│   │   ├── projects/        # 프로젝트 관련 컴포넌트
│   │   ├── tables/          # 테이블 관련 컴포넌트
│   │   ├── columns/         # 컬럼 관련 컴포넌트
│   │   ├── indexes/         # 인덱스 관련 컴포넌트
│   │   └── validation/      # 검증 관련 컴포넌트
│   ├── pages/
│   │   ├── ProjectsPage.tsx      # 프로젝트 목록
│   │   └── ProjectDetailPage.tsx # 프로젝트 상세
│   ├── lib/
│   │   ├── api.ts           # API 클라이언트
│   │   ├── utils.ts         # 유틸리티 함수
│   │   └── validation.ts    # 검증 로직
│   ├── stores/
│   │   ├── projectStore.ts  # 프로젝트 상태
│   │   ├── tableStore.ts    # 테이블 상태
│   │   └── toastStore.ts    # 토스트 상태
│   ├── types/
│   │   └── index.ts         # 타입 정의
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── components.json          # shadcn/ui 설정
```

## Components and Interfaces

### 1. 프로젝트 관리 컴포넌트

#### ProjectsPage
프로젝트 목록을 표시하고 생성/삭제 기능을 제공합니다.

**Props**: 없음

**State**:
- `projects`: Project[]
- `isLoading`: boolean
- `error`: string | null

**주요 기능**:
- 프로젝트 목록 조회 및 표시
- 프로젝트 생성 다이얼로그 열기
- 프로젝트 삭제 확인 및 실행
- 프로젝트 선택 시 상세 페이지로 이동

#### CreateProjectDialog
프로젝트 생성 다이얼로그 컴포넌트입니다.

**Props**:
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `onSuccess`: () => void

**Form Fields**:
- `name`: string (필수)
- `description`: string (선택)

**Validation**:
- name: 1-100자, 필수
- description: 최대 500자


### 2. 테이블 관리 컴포넌트

#### ProjectDetailPage
선택된 프로젝트의 테이블 목록과 상세 정보를 표시합니다.

**Props**: 없음 (URL 파라미터에서 projectId 추출)

**State**:
- `project`: Project | null
- `tables`: Table[]
- `selectedTable`: Table | null
- `isLoading`: boolean

**Layout**:
- 좌측: 테이블 목록 (30%)
- 우측: 선택된 테이블의 컬럼/인덱스 (70%)

#### TableList
테이블 목록을 표시하고 선택/생성/삭제 기능을 제공합니다.

**Props**:
- `projectId`: string
- `tables`: Table[]
- `selectedTableId`: string | null
- `onSelectTable`: (tableId: string) => void
- `onTableCreated`: () => void
- `onTableDeleted`: () => void

**Features**:
- 테이블 목록 표시 (이름, 컬럼 수)
- 테이블 선택 하이라이트
- 테이블 생성 버튼
- 테이블 삭제 버튼 (각 항목)

#### CreateTableDialog
테이블 생성 다이얼로그 컴포넌트입니다.

**Props**:
- `projectId`: string
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `onSuccess`: () => void

**Form Fields**:
- `name`: string (필수, 대문자 검증)
- `description`: string (필수, 한글 설명)

**Validation**:
- name: 대문자 패턴 (예: USER, ORDER_ITEM), 실시간 검증
- description: 필수, 테이블명 그대로 복사 금지, 최대 500자

#### TableDetail
선택된 테이블의 컬럼과 인덱스를 탭으로 표시합니다.

**Props**:
- `table`: Table
- `onUpdate`: () => void

**Tabs**:
- 컬럼 (Columns)
- 인덱스 (Indexes)

### 3. 컬럼 관리 컴포넌트

#### ColumnList
테이블의 컬럼 목록을 표시하고 관리합니다.

**Props**:
- `tableId`: string
- `columns`: Column[]
- `onColumnCreated`: () => void
- `onColumnUpdated`: () => void
- `onColumnDeleted`: () => void

**Features**:
- 컬럼 목록 테이블 형태로 표시
- 컬럼 추가 버튼
- 컬럼 편집 버튼 (각 행)
- 컬럼 삭제 버튼 (각 행)
- 드래그 앤 드롭으로 순서 변경

**Table Columns**:
- 순서 (orderIndex)
- 컬럼명 (name)
- 한글명 (description 일부)
- 데이터 타입 (dataType)
- NULL 허용 (nullable)
- 기본키 (primaryKey)
- IDENTITY (identity)
- 액션 (편집/삭제)

#### CreateColumnDialog
컬럼 생성 다이얼로그 컴포넌트입니다.

**Props**:
- `tableId`: string
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `onSuccess`: () => void

**Form Fields**:
- `name`: string (필수, 대문자 검증)
- `description`: string (필수, "한글명 || 상세설명" 형식)
- `dataType`: MSSQLDataType (필수)
- `maxLength`: number (VARCHAR, NVARCHAR 등)
- `precision`: number (DECIMAL, NUMERIC)
- `scale`: number (DECIMAL, NUMERIC)
- `nullable`: boolean
- `primaryKey`: boolean
- `identity`: boolean (정수형만)
- `identitySeed`: number (IDENTITY 시)
- `identityIncrement`: number (IDENTITY 시)
- `defaultValue`: string (선택)

**Conditional Fields**:
- dataType이 VARCHAR/NVARCHAR/CHAR/NCHAR → maxLength 필수 표시
- dataType이 DECIMAL/NUMERIC → precision, scale 필수 표시
- dataType이 정수형 → identity 옵션 표시
- identity가 true → identitySeed, identityIncrement 표시
- primaryKey가 true → 테이블명+컬럼명 조합 검증 (단독명칭 금지)

**Validation**:
- name: 대문자 패턴 (예: USER_ID, REG_DT), 실시간 검증
- PK 컬럼명: 테이블명 포함 필수 (예: CLAIM_REQUEST_MAIL_NO)
- description: 필수, "한글명 || 상세설명" 형식 권장, 컬럼명 그대로 복사 금지
- maxLength: VARCHAR/NVARCHAR 필수, 1-8000 (VARCHAR), 1-4000 (NVARCHAR)
- precision: DECIMAL/NUMERIC 필수, 1-38
- scale: DECIMAL/NUMERIC 필수, 0-precision

**시스템 속성 자동 추가**:
- 테이블 생성 시 REG_ID, REG_DT, CHG_ID, CHG_DT 자동 추가 옵션 제공
- REG_ID: VARCHAR(25), NOT NULL
- REG_DT: DATETIME, NOT NULL, DEFAULT GETDATE()
- CHG_ID: VARCHAR(25), NULL
- CHG_DT: DATETIME, NULL

#### EditColumnDialog
컬럼 편집 다이얼로그 컴포넌트입니다.

**Props**:
- `column`: Column
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `onSuccess`: () => void

**Features**:
- CreateColumnDialog와 동일한 폼
- 기존 값으로 초기화

### 4. 인덱스 관리 컴포넌트

#### IndexList
테이블의 인덱스 목록을 표시하고 관리합니다.

**Props**:
- `tableId`: string
- `indexes`: Index[]
- `columns`: Column[]
- `onIndexCreated`: () => void
- `onIndexDeleted`: () => void

**Features**:
- 인덱스 목록 카드 형태로 표시
- 인덱스 추가 버튼
- 인덱스 삭제 버튼 (각 카드)

**Index Card**:
- 인덱스명
- 타입 (CLUSTERED/NONCLUSTERED)
- UNIQUE 여부
- 포함 컬럼 목록

#### CreateIndexDialog
인덱스 생성 다이얼로그 컴포넌트입니다.

**Props**:
- `tableId`: string
- `columns`: Column[]
- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `onSuccess`: () => void

**Form Fields**:
- `name`: string (필수, 명명 규칙 준수)
- `type`: 'CLUSTERED' | 'NONCLUSTERED' (필수)
- `unique`: boolean
- `columns`: { columnId: string, order: 'ASC' | 'DESC' }[] (필수)

**Features**:
- 복합 인덱스를 위한 다중 컬럼 선택
- 각 컬럼의 정렬 순서 선택
- 컬럼 순서 드래그 앤 드롭
- 인덱스명 자동 생성 제안

**Validation**:
- name: 명명 규칙 준수 필수
  - PK: PK__{테이블명}__{컬럼1}__{컬럼2}
  - Cluster: CIDX__{테이블명}__{컬럼1}
  - 일반: IDX__{테이블명}__{컬럼1}__{컬럼2}
- columns: 최소 1개 이상

**자동 생성 기능**:
- 선택한 컬럼과 타입에 따라 인덱스명 자동 제안
- 예: type=NONCLUSTERED, columns=[USER_ID] → IDX__USER__USER_ID

### 5. 검증 컴포넌트

#### ValidationBadge
명명 규칙 검증 결과를 표시하는 배지 컴포넌트입니다.

**Props**:
- `isValid`: boolean
- `message`: string
- `suggestion`: string | null

**Variants**:
- Valid: 초록색 체크 아이콘
- Invalid: 빨간색 경고 아이콘

#### ValidationPanel
프로젝트 전체의 검증 결과를 표시합니다.

**Props**:
- `projectId`: string

**Features**:
- 검증 실행 버튼
- 에러 목록 (심각도별 그룹화)
- 경고 목록
- 각 항목 클릭 시 해당 엔티티로 이동

**Validation Results**:
- 총 에러 수
- 총 경고 수
- 명명 규칙 준수율
- 상세 에러/경고 목록

**검증 규칙 (DB 스키마 가이드 기반)**:

1. **테이블명 검증**:
   - 대문자 사용 (예: USER, ORDER_ITEM)
   - 의미 있는 영문명 필수
   - Description(한글 설명) 필수
   - 테이블명을 그대로 Description에 복사 금지

2. **컬럼명 검증**:
   - 대문자 사용 (예: USER_ID, REG_DT)
   - PK 컬럼은 테이블명+컬럼명 조합 (예: CLAIM_REQUEST_MAIL_NO)
   - 단독명칭 금지 (ID, SEQ_NO, HIST_NO 등)
   - Description 형식: "한글명 || 상세설명" (예: "처리결과코드 || 0:성공, -100:실패")
   - 컬럼명을 그대로 Description에 복사 금지

3. **시스템 속성 검증**:
   - REG_ID (VARCHAR(25), NOT NULL) 필수
   - REG_DT (DATETIME, NOT NULL, DEFAULT GETDATE()) 필수
   - CHG_ID (VARCHAR(25), NULL) 필수
   - CHG_DT (DATETIME, NULL) 필수
   - CDC/최적성 테이블은 예외

4. **데이터 타입 검증**:
   - VARCHAR/NVARCHAR는 길이 필수 지정
   - 한글 저장 시 NVARCHAR 사용 권장
   - DECIMAL/NUMERIC은 precision, scale 필수

5. **인덱스명 검증**:
   - PK: PK__{테이블명}__{컬럼1}__{컬럼2}
   - Cluster: CIDX__{테이블명}__{컬럼1}
   - 일반: IDX__{테이블명}__{컬럼1}__{컬럼2}

6. **약어 사용 검증**:
   - 일관된 약어 사용 (CUSTOMER → CUST, HISTORY → HIST 등)
   - 프로젝트 내 약어 통일성 확인

**검증 결과 표시**:
- 에러: 필수 규칙 위반 (빨간색)
- 경고: 권장 사항 미준수 (노란색)
- 제안: 올바른 형식 예시 제공

### 6. 내보내기 컴포넌트

#### ExportDialog
스키마 내보내기 다이얼로그 컴포넌트입니다.

**Props**:
- `projectId`: string
- `open`: boolean
- `onOpenChange`: (open: boolean) => void

**Features**:
- SQL 스크립트 미리보기
- 구문 강조 (Prism.js 또는 highlight.js)
- 다운로드 버튼
- 클립보드 복사 버튼

**Export Options**:
- includeDropStatements: boolean
- includeComments: boolean (MS_Description 포함)
- includeIndexes: boolean
- includeConstraints: boolean

**SQL 생성 규칙**:
- 모든 객체명 대문자 사용
- Description은 sys.sp_addextendedproperty로 등록
- 시스템 속성 (REG_ID, REG_DT, CHG_ID, CHG_DT) 포함
- REG_DT DEFAULT GETDATE() 제약조건 추가
- PK 제약조건명: PK__{테이블명}__{컬럼명}
- 인덱스명: 명명 규칙 준수

## Data Models

### TypeScript 타입 정의

```typescript
// Project
interface Project {
  id: string;
  name: string;
  description: string;
  namingRules: NamingRules;
  createdAt: string;
  updatedAt: string;
}

interface NamingRules {
  tablePrefix?: string;
  tableSuffix?: string;
  tablePattern: string;
  columnPattern: string;
  indexPattern: string;
  enforceCase: 'PASCAL' | 'SNAKE' | 'CAMEL';
}

// Table
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

// Column
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

type MSSQLDataType =
  | 'BIGINT' | 'INT' | 'SMALLINT' | 'TINYINT'
  | 'DECIMAL' | 'NUMERIC' | 'FLOAT' | 'REAL'
  | 'VARCHAR' | 'NVARCHAR' | 'CHAR' | 'NCHAR' | 'TEXT' | 'NTEXT'
  | 'DATE' | 'TIME' | 'DATETIME' | 'DATETIME2' | 'TIMESTAMP'
  | 'BIT' | 'BINARY' | 'VARBINARY' | 'IMAGE'
  | 'UNIQUEIDENTIFIER' | 'XML' | 'JSON';

// Index
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

// Validation
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

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

type ValidationWarning = ValidationError;
```

## Error Handling

### API 에러 처리

**에러 타입**:
- Network Error: 네트워크 연결 실패
- 400 Bad Request: 잘못된 요청
- 404 Not Found: 리소스 없음
- 409 Conflict: 중복 등
- 500 Internal Server Error: 서버 오류

**처리 방법**:
1. Axios interceptor로 전역 에러 처리
2. 에러 메시지를 Toast로 표시
3. 특정 에러는 컴포넌트에서 개별 처리

**예시**:
```typescript
axios.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.error?.message || '오류가 발생했습니다';
    toast.error(message);
    return Promise.reject(error);
  }
);
```

### 폼 검증 에러

**Zod 스키마 사용**:
```typescript
const createTableSchema = z.object({
  name: z.string()
    .min(1, '테이블명을 입력하세요')
    .regex(/^[A-Z][a-zA-Z0-9]*$/, 'PascalCase 형식이어야 합니다'),
  description: z.string().max(500).optional()
});
```

**React Hook Form 통합**:
- zodResolver로 스키마 연결
- 에러 메시지를 폼 필드 아래 표시
- 실시간 검증 (onChange 또는 onBlur)

## Testing Strategy

### 단위 테스트 (Vitest)

**테스트 대상**:
- 유틸리티 함수 (validation.ts, utils.ts)
- Zustand 스토어 액션
- 커스텀 훅

**예시**:
```typescript
describe('validateTableName', () => {
  it('should validate PascalCase table name', () => {
    expect(validateTableName('User')).toBe(true);
    expect(validateTableName('users')).toBe(false);
  });
});
```

### 컴포넌트 테스트 (React Testing Library)

**테스트 대상**:
- 주요 컴포넌트 렌더링
- 사용자 인터랙션 (클릭, 입력)
- 조건부 렌더링

**예시**:
```typescript
describe('CreateProjectDialog', () => {
  it('should create project on submit', async () => {
    render(<CreateProjectDialog open={true} onOpenChange={vi.fn()} />);
    
    await userEvent.type(screen.getByLabelText('프로젝트명'), 'Test Project');
    await userEvent.click(screen.getByRole('button', { name: '생성' }));
    
    expect(mockApi.createProject).toHaveBeenCalled();
  });
});
```

### E2E 테스트 (선택사항)

**테스트 시나리오**:
- 프로젝트 생성 → 테이블 생성 → 컬럼 추가 → SQL 내보내기
- 명명 규칙 검증 플로우

## Performance Optimization

### React 최적화

1. **React.memo**: 불필요한 리렌더링 방지
   - TableList, ColumnList 등 목록 컴포넌트
   
2. **useMemo**: 계산 비용이 높은 값 캐싱
   - 필터링된 목록
   - 정렬된 데이터

3. **useCallback**: 함수 참조 안정화
   - 이벤트 핸들러
   - 자식 컴포넌트에 전달되는 콜백

### API 최적화

1. **디바운싱**: 실시간 검증 API 호출 최적화 (500ms)
2. **캐싱**: Zustand 스토어에 데이터 캐싱
3. **낙관적 업데이트**: UI 즉시 업데이트 후 API 호출

### 번들 최적화

1. **코드 스플리팅**: React.lazy로 페이지별 분리
2. **Tree Shaking**: 사용하지 않는 코드 제거
3. **Vite 최적화**: 자동 청크 분할

## Accessibility

### ARIA 레이블

- 모든 버튼에 aria-label 추가
- 폼 필드에 aria-describedby로 에러 메시지 연결
- 다이얼로그에 aria-labelledby, aria-describedby 추가

### 키보드 네비게이션

- Tab 키로 모든 인터랙티브 요소 접근
- Enter 키로 폼 제출
- Esc 키로 다이얼로그 닫기
- 화살표 키로 목록 탐색

### 색상 대비

- WCAG AA 기준 준수 (4.5:1)
- Tailwind CSS의 접근성 친화적 색상 사용

## Deployment Considerations

### 환경 변수

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 빌드 설정

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### 프로덕션 최적화

- Gzip 압축
- 정적 파일 캐싱
- CDN 활용 (선택사항)
