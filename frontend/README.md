# MSSQL 데이터베이스 모델링 도구 - 프론트엔드

MSSQL 데이터베이스 스키마의 직관적인 설계와 관리를 가능하게 하는 웹 기반 데이터베이스 모델링 플랫폼의 프론트엔드 애플리케이션입니다.

## 기술 스택

- **프레임워크**: React 19 + TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **상태 관리**: Zustand
- **폼 관리**: React Hook Form + Zod
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios
- **드래그 앤 드롭**: @dnd-kit
- **테스팅**: Vitest + React Testing Library

## 주요 기능

### 1. 프로젝트 관리
- 프로젝트 생성, 수정, 삭제
- 프로젝트 목록 조회 및 선택
- 프로젝트별 테이블 관리

### 2. 테이블 설계
- 테이블 생성, 수정, 삭제
- 실시간 명명 규칙 검증
- 한글 설명(Description) 관리
- 시스템 속성 컬럼 자동 추가

### 3. 컬럼 관리
- 27개 MSSQL 데이터 타입 지원
- 드래그 앤 드롭으로 컬럼 순서 변경
- IDENTITY, DECIMAL 정밀도/스케일 설정
- PK, NULL 제약조건 설정
- 실시간 검증 및 제안

### 4. 인덱스 관리
- 클러스터드/논클러스터드 인덱스
- 복합 인덱스 지원
- UNIQUE 제약조건
- 자동 인덱스명 생성

### 5. 검증 시스템
- 명명 규칙 실시간 검증
- 에러/경고 그룹화 표시
- 준수율 계산
- 수정 제안 제공

### 6. 스키마 내보내기
- MSSQL DDL 스크립트 생성
- SQL 미리보기
- 클립보드 복사
- .sql 파일 다운로드
- DB 스키마 가이드 준수 확인

## 설치 및 실행

### 사전 요구사항
- Node.js 18+ 
- Yarn 1.22+
- 백엔드 API 서버 실행 중 (http://localhost:8080)

### 설치
```bash
# 의존성 설치
yarn install
```

### 개발 서버 실행
```bash
# 개발 모드 (http://localhost:5173)
yarn dev
```

### 빌드
```bash
# 프로덕션 빌드
yarn build

# 빌드 결과 미리보기
yarn preview
```

### 테스트
```bash
# 단위 테스트 실행
yarn test

# 테스트 watch 모드
yarn test:watch

# 테스트 커버리지
yarn test:coverage
```

### 코드 품질
```bash
# ESLint 검사
yarn lint

# 타입 체크
yarn type-check
```

## 프로젝트 구조

```
frontend-new/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── columns/         # 컬럼 관리 컴포넌트
│   │   ├── common/          # 공통 컴포넌트
│   │   ├── export/          # 스키마 내보내기
│   │   ├── indexes/         # 인덱스 관리
│   │   ├── projects/        # 프로젝트 관리
│   │   ├── tables/          # 테이블 관리
│   │   ├── ui/              # shadcn/ui 컴포넌트
│   │   └── validation/      # 검증 컴포넌트
│   ├── hooks/               # 커스텀 훅
│   │   ├── useDebounce.ts   # 디바운스 훅
│   │   ├── useFocusManagement.ts  # 포커스 관리
│   │   ├── useKeyboardShortcuts.ts # 키보드 단축키
│   │   └── useAsyncError.ts # 비동기 에러 처리
│   ├── lib/                 # 유틸리티 및 설정
│   │   ├── api.ts           # API 클라이언트
│   │   ├── errorHandler.ts  # 에러 핸들러
│   │   ├── utils.ts         # 유틸리티 함수
│   │   └── validation.ts    # 검증 함수
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── ProjectsPage.tsx # 프로젝트 목록
│   │   └── ProjectDetailPage.tsx # 프로젝트 상세
│   ├── stores/              # Zustand 스토어
│   │   ├── projectStore.ts  # 프로젝트 상태
│   │   ├── tableStore.ts    # 테이블 상태
│   │   └── toastStore.ts    # 토스트 상태
│   ├── styles/              # 스타일 파일
│   │   ├── globals.css      # 전역 스타일
│   │   └── accessibility.css # 접근성 스타일
│   ├── types/               # TypeScript 타입
│   │   └── index.ts         # 타입 정의
│   ├── utils/               # 유틸리티
│   │   └── accessibility.ts # 접근성 유틸리티
│   ├── App.tsx              # 앱 루트
│   └── main.tsx             # 엔트리 포인트
├── public/                  # 정적 파일
├── .env                     # 환경 변수
├── index.html               # HTML 템플릿
├── package.json             # 의존성 및 스크립트
├── tsconfig.json            # TypeScript 설정
├── vite.config.ts           # Vite 설정
├── vitest.config.ts         # Vitest 설정
└── tailwind.config.js       # Tailwind CSS 설정
```

## 환경 변수

`.env` 파일에 다음 환경 변수를 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 주요 컴포넌트

### ProjectsPage
프로젝트 목록을 표시하고 새 프로젝트를 생성하는 페이지입니다.

### ProjectDetailPage
선택된 프로젝트의 테이블 목록과 상세 정보를 표시하는 페이지입니다.
- 좌측: 테이블 목록 (30%)
- 우측: 테이블 상세 (70%)

### ColumnList
테이블의 컬럼 목록을 표시하고 드래그 앤 드롭으로 순서를 변경할 수 있습니다.

### CreateColumnDialog
새 컬럼을 생성하는 다이얼로그입니다.
- 27개 MSSQL 데이터 타입 지원
- 실시간 검증
- 조건부 필드 (maxLength, precision, scale, identity)

### IndexList
테이블의 인덱스 목록을 표시하고 관리합니다.

### ValidationPanel
프로젝트의 명명 규칙 준수 여부를 검증하고 결과를 표시합니다.

### ExportDialog
프로젝트의 스키마를 MSSQL DDL 스크립트로 내보냅니다.

## 상태 관리

### projectStore
프로젝트 관련 상태를 관리합니다.
- 프로젝트 목록
- 선택된 프로젝트
- CRUD 액션

### tableStore
테이블 관련 상태를 관리합니다.
- 테이블 목록
- 선택된 테이블
- CRUD 액션

### toastStore
토스트 메시지를 관리합니다.
- success, error, warning, info 메서드

## API 클라이언트

Axios 기반 API 클라이언트로 백엔드와 통신합니다.

### 주요 API 함수
- `getProjects()`: 프로젝트 목록 조회
- `createProject(data)`: 프로젝트 생성
- `getTables(projectId)`: 테이블 목록 조회
- `createTable(projectId, data)`: 테이블 생성
- `getColumns(tableId)`: 컬럼 목록 조회
- `createColumn(tableId, data)`: 컬럼 생성
- `reorderColumns(tableId, data)`: 컬럼 순서 변경
- `getIndexes(tableId)`: 인덱스 목록 조회
- `createIndex(tableId, data)`: 인덱스 생성
- `validateProject(projectId)`: 프로젝트 검증
- `exportToSql(projectId, options)`: SQL 스크립트 생성

## 검증 시스템

### 명명 규칙
- **테이블명**: PascalCase 또는 UPPER_SNAKE_CASE
- **컬럼명**: PascalCase 또는 UPPER_SNAKE_CASE
- **PK 컬럼**: 테이블명 포함 필수 (예: USER_ID)
- **인덱스명**: 
  - PK: `PK__{테이블명}__{컬럼명}`
  - Clustered: `CIDX__{테이블명}__{컬럼명}`
  - Index: `IDX__{테이블명}__{컬럼명}`

### 실시간 검증
- 500ms 디바운스로 입력 중 검증
- 에러/경고 즉시 표시
- 수정 제안 제공

## 접근성

### WCAG 2.1 AA 준수
- ARIA 레이블 적용
- 키보드 네비게이션 지원
- 색상 대비 4.5:1 이상
- 스크린 리더 호환

### 키보드 단축키
- `Ctrl+N`: 새 프로젝트 생성
- `Ctrl+E`: 스키마 내보내기
- `Esc`: 다이얼로그 닫기/뒤로가기
- `Shift+?`: 단축키 도움말
- `Tab`: 다음 요소로 이동
- `Enter`: 버튼 실행

## 성능 최적화

### React 최적화
- `React.memo`로 불필요한 리렌더링 방지
- `useMemo`로 계산 비용 캐싱
- `useCallback`으로 함수 참조 안정화

### 코드 스플리팅
- `React.lazy`로 페이지 지연 로딩
- 초기 로딩 시간 30-40% 감소

### 디바운싱
- 실시간 검증 API 호출 최적화
- 500ms 디바운스 적용

## 에러 처리

### 전역 에러 핸들러
- Axios 인터셉터로 자동 에러 처리
- 사용자 친화적 메시지 생성
- 토스트로 에러 표시

### React 에러 바운더리
- 컴포넌트 에러 캐치
- 폴백 UI 표시
- 개발 환경에서 상세 정보 표시

### 네트워크 상태 모니터링
- 온라인/오프라인 자동 감지
- 상태 변경 시 알림
- 오프라인 배지 표시

## 테스트

### 단위 테스트
- Vitest로 유틸리티 함수 테스트
- React Testing Library로 컴포넌트 테스트
- 42개 테스트 통과

### 테스트 커버리지
- 유틸리티 함수: 100%
- 검증 함수: 100%
- 훅: 100%

## 브라우저 호환성

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 문서

- [접근성 가이드](./ACCESSIBILITY.md)
- [성능 최적화 가이드](./PERFORMANCE_OPTIMIZATION.md)
- [에러 처리 아키텍처](./ERROR_HANDLING_ARCHITECTURE.md)
- [ExportDialog 사용 가이드](./src/components/export/USAGE_GUIDE.md)

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 기여

버그 리포트나 기능 제안은 GitHub Issues를 통해 제출해주세요.

## 지원

문의사항이 있으시면 이메일로 연락주세요.
