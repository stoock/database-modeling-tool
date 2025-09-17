# MSSQL 데이터베이스 모델링 도구 - Frontend

React + TypeScript + Vite + Tailwind CSS로 구축된 데이터베이스 모델링 도구의 프론트엔드입니다.

## 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구 및 개발 서버
- **Tailwind CSS** - 스타일링
- **Zustand** - 상태 관리
- **React Hook Form** - 폼 관리
- **React Flow** - 테이블 관계 다이어그램
- **Axios** - HTTP 클라이언트

## 개발 환경 설정

### 의존성 설치
```bash
yarn install
```

### 개발 서버 실행
```bash
yarn dev
```

### 프로덕션 빌드
```bash
yarn build
```

### 테스트 실행
```bash
yarn test
```

### E2E 테스트 실행
```bash
yarn test:e2e
```

## 주요 기능

- 🎨 **시각적 데이터베이스 설계**: 드래그 앤 드롭으로 테이블 배치
- 📋 **프로젝트 관리**: 프로젝트 생성, 편집, 삭제
- ✅ **실시간 검증**: 네이밍 규칙 검증 및 수정 제안
- 📤 **스키마 내보내기**: SQL, JSON, Markdown, HTML, CSV 형식 지원
- 📚 **문서화**: 자동 스키마 문서 생성

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── TableDesigner/   # 테이블 설계 캔버스
│   ├── ValidationPanel/ # 검증 패널
│   ├── SchemaExport/    # 스키마 내보내기
│   ├── ProjectManager/  # 프로젝트 관리
│   └── common/          # 공통 컴포넌트
├── stores/              # Zustand 상태 관리
├── services/            # API 클라이언트
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수
└── hooks/               # 커스텀 훅
```

## 환경 변수

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8080/api
```

## 개발 가이드

### 코드 스타일
- ESLint + Prettier 사용
- TypeScript strict 모드
- Tailwind CSS 클래스 사용

### 상태 관리
- Zustand로 전역 상태 관리
- Immer로 불변성 보장
- DevTools 지원

### API 통신
- Axios 기반 API 클라이언트
- 타입 안전한 API 호출
- 에러 처리 및 인터셉터
