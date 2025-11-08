# 프론트엔드

MSSQL 데이터베이스 모델링 도구의 프론트엔드 애플리케이션입니다.

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+
- Yarn 1.22+
- 백엔드 API 서버 (http://localhost:8080)

### 설치 및 실행
```bash
# 의존성 설치
yarn install

# 개발 서버 실행 (http://localhost:5173)
yarn dev

# 프로덕션 빌드
yarn build

# 테스트 실행
yarn test
```

## 🛠️ 기술 스택

- React 19 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS + shadcn/ui
- Zustand (상태 관리)
- React Hook Form + Zod
- Axios (HTTP 클라이언트)
- @dnd-kit (드래그 앤 드롭)
- Vitest + React Testing Library

## ✨ 주요 기능

- **프로젝트 관리**: 생성, 수정, 삭제, 목록 조회
- **테이블 설계**: 실시간 명명 규칙 검증, 한글 설명 관리
- **컬럼 관리**: 27개 MSSQL 데이터 타입, 드래그 앤 드롭 순서 변경
- **인덱스 관리**: 클러스터드/논클러스터드, 복합 인덱스
- **검증 시스템**: 실시간 검증, 에러/경고 표시, 수정 제안
- **스키마 내보내기**: MSSQL DDL 스크립트 생성 및 다운로드

## 📝 스크립트

```bash
yarn dev          # 개발 서버 실행
yarn build        # 프로덕션 빌드
yarn preview      # 빌드 미리보기
yarn test         # 테스트 실행
yarn test:watch   # 테스트 watch 모드
yarn lint         # ESLint 검사
yarn type-check   # TypeScript 타입 체크
```

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── components/      # React 컴포넌트
│   │   ├── columns/     # 컬럼 관리
│   │   ├── export/      # 스키마 내보내기
│   │   ├── indexes/     # 인덱스 관리
│   │   ├── projects/    # 프로젝트 관리
│   │   ├── tables/      # 테이블 관리
│   │   ├── validation/  # 검증
│   │   ├── ui/          # shadcn/ui
│   │   └── common/      # 공통 컴포넌트
│   ├── pages/           # 페이지
│   ├── stores/          # Zustand 상태 관리
│   ├── hooks/           # 커스텀 훅
│   ├── lib/             # 유틸리티 및 API
│   ├── types/           # TypeScript 타입
│   └── styles/          # 스타일
├── docs/                # 문서
└── public/              # 정적 파일
```

## ⚙️ 환경 변수

`.env` 파일 설정:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🔑 주요 명명 규칙

- **테이블명**: PascalCase (예: `User`, `OrderItem`)
- **컬럼명**: snake_case (예: `user_id`, `created_at`)
- **PK 컬럼**: 테이블명 포함 필수 (예: `user_id`)
- **인덱스명**: `IDX__{테이블명}__{컬럼명}`

## ⌨️ 키보드 단축키

- `Ctrl+N`: 새 프로젝트 생성
- `Ctrl+E`: 스키마 내보내기
- `Esc`: 다이얼로그 닫기
- `Shift+?`: 단축키 도움말

## 📚 문서

상세 문서는 [docs](./docs/) 폴더를 참조하세요:

### 핵심 문서
- [컴포넌트 가이드](./docs/COMPONENTS.md) - 주요 컴포넌트 사용법
- [상태 관리](./docs/STATE_MANAGEMENT.md) - Zustand 스토어
- [API 클라이언트](./docs/API.md) - 백엔드 API 호출
- [검증 시스템](./docs/VALIDATION.md) - 명명 규칙 검증

### 참조 문서
- [유틸리티](./docs/LIB.md) - 공통 함수
- [타입 정의](./docs/TYPES.md) - TypeScript 타입

### 가이드
- [접근성](./docs/guides/ACCESSIBILITY.md)
- [성능 최적화](./docs/guides/PERFORMANCE_OPTIMIZATION.md)
- [에러 처리](./docs/guides/ERROR_HANDLING_ARCHITECTURE.md)

## 🌐 브라우저 호환성

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
