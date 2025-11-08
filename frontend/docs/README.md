# 프론트엔드 문서

## 📖 핵심 문서 (필수)

개발에 필요한 핵심 참조 문서입니다.

### [API.md](./API.md)
백엔드 API 클라이언트 사용법
- API 함수 목록
- 에러 처리
- 사용 예시

### [COMPONENTS.md](./COMPONENTS.md)
주요 컴포넌트 가이드
- 페이지 컴포넌트
- 기능별 컴포넌트
- 공통 컴포넌트

### [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
Zustand 상태 관리
- projectStore
- tableStore
- toastStore
- 성능 최적화

### [VALIDATION.md](./VALIDATION.md)
검증 시스템
- 명명 규칙
- 검증 함수
- 실시간 검증

## 📚 참조 문서

### [LIB.md](./LIB.md)
유틸리티 라이브러리
- 날짜 포맷
- 문자열 변환
- 디바운스
- 로컬 스토리지

### [STORES.md](./STORES.md)
스토어 상세 문서 (STATE_MANAGEMENT.md와 중복)

### [TYPES.md](./TYPES.md)
TypeScript 타입 정의
- 도메인 모델
- MSSQL 데이터 타입
- API 타입
- 검증 타입

## 📘 가이드 (guides/)

고급 주제 및 베스트 프랙티스

### [ACCESSIBILITY.md](./guides/ACCESSIBILITY.md)
접근성 가이드
- WCAG 2.1 AA 준수
- 키보드 네비게이션
- ARIA 레이블

### [ERROR_HANDLING_ARCHITECTURE.md](./guides/ERROR_HANDLING_ARCHITECTURE.md)
에러 처리 아키텍처
- 전역 에러 핸들러
- React 에러 바운더리
- 네트워크 상태 모니터링

### [PERFORMANCE_OPTIMIZATION.md](./guides/PERFORMANCE_OPTIMIZATION.md)
성능 최적화 가이드
- React 최적화
- 코드 스플리팅
- 디바운싱

## 📦 아카이브 (archive/)

과거 구현 요약 문서 (참고용)

- TASK_18_CHECKLIST.md
- TASK_18_IMPLEMENTATION_SUMMARY.md
- TASK_19_IMPLEMENTATION_SUMMARY.md
- TASK_20_IMPLEMENTATION_SUMMARY.md
- TASK_21_IMPLEMENTATION_SUMMARY.md

## 🗂️ 문서 구조

```
docs/
├── README.md                    # 이 파일
├── API.md                       # ⭐ 핵심: API 클라이언트
├── COMPONENTS.md                # ⭐ 핵심: 컴포넌트 가이드
├── STATE_MANAGEMENT.md          # ⭐ 핵심: 상태 관리
├── VALIDATION.md                # ⭐ 핵심: 검증 시스템
├── LIB.md                       # 참조: 유틸리티
├── STORES.md                    # 참조: 스토어 상세
├── TYPES.md                     # 참조: 타입 정의
├── guides/                      # 가이드
│   ├── ACCESSIBILITY.md
│   ├── ERROR_HANDLING_ARCHITECTURE.md
│   └── PERFORMANCE_OPTIMIZATION.md
└── archive/                     # 아카이브
    └── TASK_*.md
```

## 🚀 빠른 참조

### 새 컴포넌트 만들기
→ [COMPONENTS.md](./COMPONENTS.md)

### API 호출하기
→ [API.md](./API.md)

### 상태 관리하기
→ [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)

### 검증 추가하기
→ [VALIDATION.md](./VALIDATION.md)

### 타입 정의 찾기
→ [TYPES.md](./TYPES.md)
