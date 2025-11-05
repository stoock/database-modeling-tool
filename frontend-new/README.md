# Frontend-New - MSSQL 데이터베이스 모델링 도구

React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui 기반의 간소화된 MSSQL 데이터베이스 모델링 도구 프론트엔드입니다.

## 기술 스택

- **프레임워크**: React 19 with TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui (Radix UI 기반)
- **상태 관리**: Zustand
- **HTTP 클라이언트**: Axios
- **라우팅**: React Router v6

## 설치 및 실행

### 의존성 설치

```bash
npm install
```

### 개발 서버 시작

```bash
npm run dev
```

개발 서버는 http://localhost:3001 에서 실행됩니다.

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
VITE_API_BASE_URL=http://localhost:8080/api
```

## 프로젝트 구조

```
frontend-new/
├── src/
│   ├── components/
│   │   └── ui/              # shadcn/ui 컴포넌트
│   ├── pages/               # 페이지 컴포넌트
│   ├── lib/                 # 유틸리티 및 API 클라이언트
│   ├── stores/              # Zustand 상태 관리
│   ├── types/               # TypeScript 타입 정의
│   ├── App.tsx              # 메인 앱 컴포넌트
│   ├── main.tsx             # 엔트리 포인트
│   └── index.css            # 글로벌 스타일
├── public/                  # 정적 파일
├── index.html               # HTML 템플릿
├── vite.config.ts           # Vite 설정
├── tailwind.config.js       # Tailwind CSS 설정
├── tsconfig.json            # TypeScript 설정
└── package.json             # 프로젝트 메타데이터
```

## 주요 기능

- 프로젝트 관리 (생성, 조회, 수정, 삭제)
- 테이블 설계 (MSSQL 전용 데이터 타입 지원)
- 컬럼 관리 (27개 MSSQL 데이터 타입)
- 인덱스 관리 (클러스터드/논클러스터드)
- 명명 규칙 검증 (실시간 피드백)
- SQL 스키마 내보내기

## 개발 가이드

### shadcn/ui 컴포넌트 추가

이미 설치된 컴포넌트:
- Button
- Input
- Select
- Dialog
- Toast
- Card
- Tabs

### API 호출

`src/lib/api.ts`의 `apiClient`를 사용하여 API를 호출합니다:

```typescript
import apiClient from '@/lib/api';

const response = await apiClient.get('/projects');
```

### 상태 관리

Zustand 스토어를 사용하여 전역 상태를 관리합니다:

```typescript
import { useProjectStore } from '@/stores/projectStore';

const { projects, setProjects } = useProjectStore();
```

## 라이선스

MIT
