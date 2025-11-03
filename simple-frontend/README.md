# Simple Frontend - MSSQL 데이터베이스 모델링 도구

React 19 + TypeScript + Vite + Tailwind CSS로 구축된 심플한 데이터베이스 모델링 도구 프론트엔드입니다.

## 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구 및 개발 서버
- **Tailwind CSS** - 유틸리티 우선 스타일링
- **Zustand** - 경량 상태 관리
- **Axios** - HTTP 클라이언트
- **React Router** - 클라이언트 사이드 라우팅

## 시작하기

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:5173 에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 미리보기

```bash
npm run preview
```

## 환경 변수

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── common/          # 공통 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── project/         # 프로젝트 관련 컴포넌트 (예정)
│   ├── table/           # 테이블 관련 컴포넌트 (예정)
│   ├── column/          # 컬럼 관련 컴포넌트 (예정)
│   ├── index/           # 인덱스 관련 컴포넌트 (예정)
│   └── export/          # 내보내기 관련 컴포넌트 (예정)
├── pages/               # 페이지 컴포넌트
│   └── ProjectListPage.tsx
├── services/            # API 클라이언트
│   ├── api.ts
│   ├── projectService.ts
│   ├── tableService.ts
│   ├── columnService.ts
│   ├── indexService.ts
│   ├── exportService.ts
│   └── validationService.ts
├── stores/              # Zustand 상태 관리
│   ├── projectStore.ts
│   ├── tableStore.ts
│   └── uiStore.ts
├── types/               # TypeScript 타입 정의
│   ├── project.ts
│   ├── table.ts
│   ├── column.ts
│   ├── index.ts
│   └── api.ts
├── App.tsx              # 루트 컴포넌트
└── main.tsx             # 엔트리 포인트
```

## 구현 현황

### ✅ 완료된 항목

#### 1. 프로젝트 초기 설정
- Vite + React 19 + TypeScript 프로젝트 생성
- Tailwind CSS 설치 및 설정
- 필요한 의존성 설치 (zustand, axios, react-router-dom)
- 환경 변수 설정

#### 2. TypeScript 타입 정의
- `types/project.ts`: Project, ProjectSummary, NamingRules 타입
- `types/table.ts`: Table, TableSummary 타입
- `types/column.ts`: Column, MSSQLDataType 타입
- `types/index.ts`: Index, IndexColumn 타입
- `types/api.ts`: ApiResponse, 요청/응답 타입

#### 3. API 서비스
- `services/api.ts`: Axios 인스턴스 및 인터셉터
- `services/projectService.ts`: 프로젝트 CRUD API
- `services/tableService.ts`: 테이블 CRUD API
- `services/columnService.ts`: 컬럼 CRUD API
- `services/indexService.ts`: 인덱스 CRUD API
- `services/exportService.ts`: 스키마 내보내기 API
- `services/validationService.ts`: 명명 규칙 검증 API

#### 4. Zustand 스토어
- `stores/projectStore.ts`: 프로젝트 상태 관리
- `stores/tableStore.ts`: 테이블 상태 관리
- `stores/uiStore.ts`: UI 상태 관리 (모달)

#### 5. 공통 컴포넌트
- `Button`: 버튼 컴포넌트 (variant, size, loading 지원)
- `Input`: 입력 필드 컴포넌트 (label, error, validation 지원)
- `Modal`: 모달 다이얼로그 컴포넌트
- `LoadingSpinner`: 로딩 인디케이터
- `ErrorMessage`: 에러 메시지 표시

#### 6. 페이지
- `ProjectListPage`: 프로젝트 목록 페이지 (기본 구현)

### 🔄 진행 예정

#### 페이지 컴포넌트
- `ProjectDetailPage`: 프로젝트 상세 및 테이블 목록 페이지
- `TableDetailPage`: 테이블 상세 및 컬럼/인덱스 관리 페이지

#### 기능 컴포넌트
- `ProjectForm`: 프로젝트 생성/수정 폼
- `TableList`: 테이블 목록 테이블
- `TableForm`: 테이블 생성/수정 폼
- `ColumnList`: 컬럼 목록 테이블
- `ColumnForm`: 컬럼 생성/수정 폼
- `DataTypeSelector`: MSSQL 데이터 타입 선택기
- `IndexList`: 인덱스 목록 테이블
- `IndexForm`: 인덱스 생성 폼
- `ExportDialog`: 스키마 내보내기 다이얼로그
- `SqlPreview`: SQL 스크립트 미리보기

## 주요 기능

- 🎨 **프로젝트 관리**: 프로젝트 생성, 조회, 수정, 삭제
- 📋 **테이블 관리**: 테이블 생성, 조회, 수정, 삭제
- 📊 **컬럼 관리**: MSSQL 데이터 타입 지원, 컬럼 CRUD
- 🔑 **인덱스 관리**: 클러스터드/논클러스터드 인덱스 생성
- ✅ **실시간 검증**: 네이밍 규칙 검증 및 수정 제안
- 📤 **스키마 내보내기**: SQL, Markdown, HTML, JSON, CSV 형식 지원

## 개발 가이드

### 코드 스타일
- ESLint + Prettier 사용
- TypeScript strict 모드
- Tailwind CSS 클래스 사용

### 상태 관리
- Zustand로 전역 상태 관리
- 각 도메인별 스토어 분리 (project, table, ui)

### API 통신
- Axios 기반 API 클라이언트
- 타입 안전한 API 호출
- 에러 처리 및 인터셉터

## 라이선스

MIT
