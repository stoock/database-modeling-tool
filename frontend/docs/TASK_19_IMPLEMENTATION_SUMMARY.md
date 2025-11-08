# Task 19: 에러 처리 및 토스트 구현 완료

## 구현 개요

Task 19 "에러 처리 및 토스트"가 성공적으로 완료되었습니다. 전역 에러 핸들러, Toast 컴포넌트 통합, 성공/에러 메시지 표시, 네트워크 에러 처리가 모두 구현되었습니다.

## 구현된 기능

### 1. 전역 에러 핸들러 (`errorHandler.ts`)

**위치**: `frontend-new/src/lib/errorHandler.ts`

**주요 기능**:
- 9가지 에러 타입 정의 (NETWORK, VALIDATION, NOT_FOUND, CONFLICT, SERVER, UNAUTHORIZED, FORBIDDEN, TIMEOUT, UNKNOWN)
- HTTP 상태 코드별 에러 메시지 매핑 (400, 401, 403, 404, 409, 422, 500, 502, 503, 504)
- Axios 에러 파싱 및 변환
- 일반 에러 파싱
- 검증 에러 포맷팅
- 재시도 가능 에러 식별
- 사용자 친화적 메시지 생성
- 개발 환경 에러 로깅

**에러 타입**:
```typescript
enum ErrorType {
  NETWORK = 'NETWORK',           // 네트워크 연결 오류
  VALIDATION = 'VALIDATION',     // 검증 오류
  NOT_FOUND = 'NOT_FOUND',       // 리소스 없음
  CONFLICT = 'CONFLICT',         // 중복 데이터
  SERVER = 'SERVER',             // 서버 오류
  UNAUTHORIZED = 'UNAUTHORIZED', // 인증 필요
  FORBIDDEN = 'FORBIDDEN',       // 접근 거부
  TIMEOUT = 'TIMEOUT',           // 타임아웃
  UNKNOWN = 'UNKNOWN',           // 알 수 없는 오류
}
```

### 2. Toast 컴포넌트 개선

**위치**: `frontend-new/src/components/ui/toast.tsx`

**개선 사항**:
- `success` 변형 추가 (초록색 배경)
- `warning` 변형 추가 (노란색 배경)
- 기존 `default`, `destructive` 변형 유지
- 다크 모드 지원

**Toast 변형**:
- `default`: 일반 정보 (회색)
- `success`: 성공 메시지 (초록색)
- `warning`: 경고 메시지 (노란색)
- `destructive`: 에러 메시지 (빨간색)

### 3. Toast 설정 개선

**위치**: `frontend-new/src/components/ui/use-toast.ts`

**개선 사항**:
- Toast 제한을 1개에서 5개로 증가
- 자동 제거 시간을 1000초에서 5초로 조정
- 여러 토스트 동시 표시 가능

### 4. API 클라이언트 에러 처리 개선

**위치**: `frontend-new/src/lib/api.ts`

**개선 사항**:
- 응답 인터셉터에 고급 에러 처리 통합
- `parseAxiosError`로 에러 파싱
- `logError`로 개발 환경 로깅
- `getUserFriendlyMessage`로 사용자 친화적 메시지 생성
- 자동 토스트 표시

**처리 흐름**:
1. API 에러 발생
2. 인터셉터가 에러 캐치
3. 에러 파싱 및 타입 식별
4. 개발 환경에서 콘솔 로깅
5. 사용자 친화적 메시지 생성
6. 토스트로 에러 표시

### 5. React 에러 바운더리

**위치**: `frontend-new/src/components/common/ErrorBoundary.tsx`

**주요 기능**:
- React 컴포넌트 트리에서 발생하는 에러 캐치
- 사용자 친화적 폴백 UI 표시
- 개발 환경에서 에러 상세 정보 표시
- "다시 시도" 및 "페이지 새로고침" 버튼 제공
- 커스텀 폴백 UI 지원

**폴백 UI 구성**:
- 에러 아이콘 (AlertCircle)
- 에러 제목 및 설명
- 개발 모드에서 에러 스택 트레이스
- 복구 액션 버튼

### 6. 네트워크 상태 모니터링

**위치**: `frontend-new/src/components/common/NetworkStatus.tsx`

**주요 기능**:
- 온라인/오프라인 상태 자동 감지
- 상태 변경 시 토스트 알림
- 오프라인 상태 표시 배지
- `useNetworkStatus` 훅 제공

**NetworkStatus 컴포넌트**:
- 오프라인 시 화면 하단에 배지 표시
- 온라인 복구 시 성공 토스트
- 오프라인 전환 시 경고 토스트

**useNetworkStatus 훅**:
```typescript
const isOnline = useNetworkStatus();
```

### 7. 비동기 에러 처리 훅

**위치**: `frontend-new/src/hooks/useAsyncError.ts`

**제공 훅**:

#### `useAsyncError`
기본 에러 처리 함수 제공:
```typescript
const handleError = useAsyncError();

try {
  await someOperation();
} catch (error) {
  handleError(error, '커스텀 메시지');
}
```

#### `useAsyncWrapper`
비동기 함수를 래핑하여 자동 에러 처리:
```typescript
const wrapAsync = useAsyncWrapper();

const handleSubmit = wrapAsync(
  async (data) => {
    await createProject(data);
  },
  {
    errorMessage: '프로젝트 생성 실패',
    onError: (error) => {
      // 추가 처리
    }
  }
);
```

### 8. App.tsx 통합

**위치**: `frontend-new/src/App.tsx`

**통합 내용**:
- `ErrorBoundary`로 전체 앱 래핑
- `NetworkStatus` 컴포넌트 추가
- 기존 `Toaster` 유지

**구조**:
```typescript
<ErrorBoundary>
  <BrowserRouter>
    <Routes>...</Routes>
    <Toaster />
    <NetworkStatus />
  </BrowserRouter>
</ErrorBoundary>
```

## 생성된 파일

1. **`frontend-new/src/lib/errorHandler.ts`** (새로 생성)
   - 에러 타입 정의
   - 에러 파싱 및 변환 함수
   - 유틸리티 함수

2. **`frontend-new/src/components/common/ErrorBoundary.tsx`** (새로 생성)
   - React 에러 바운더리 컴포넌트
   - 폴백 UI

3. **`frontend-new/src/components/common/NetworkStatus.tsx`** (새로 생성)
   - 네트워크 상태 모니터링 컴포넌트
   - useNetworkStatus 훅

4. **`frontend-new/src/hooks/useAsyncError.ts`** (새로 생성)
   - useAsyncError 훅
   - useAsyncWrapper 훅

5. **`frontend-new/src/components/common/index.ts`** (새로 생성)
   - 공통 컴포넌트 export

6. **`frontend-new/src/lib/errorHandler.test.ts`** (새로 생성)
   - 에러 핸들러 단위 테스트

7. **`frontend-new/src/lib/ERROR_HANDLING_GUIDE.md`** (새로 생성)
   - 에러 처리 시스템 가이드 문서

## 수정된 파일

1. **`frontend-new/src/components/ui/toast.tsx`**
   - success, warning 변형 추가

2. **`frontend-new/src/components/ui/use-toast.ts`**
   - Toast 제한 및 제거 시간 조정

3. **`frontend-new/src/lib/api.ts`**
   - 고급 에러 처리 통합
   - errorHandler 유틸리티 사용

4. **`frontend-new/src/App.tsx`**
   - ErrorBoundary 추가
   - NetworkStatus 추가

## 에러 처리 흐름

### API 에러 처리
```
API 호출 → 에러 발생 → Axios 인터셉터 캐치 → 에러 파싱 → 로깅 → 토스트 표시
```

### React 컴포넌트 에러 처리
```
컴포넌트 에러 → ErrorBoundary 캐치 → 로깅 → 폴백 UI 표시
```

### 네트워크 에러 처리
```
네트워크 상태 변경 → NetworkStatus 감지 → 토스트 알림 → 배지 표시
```

## HTTP 상태 코드 매핑

| 코드 | 타입 | 제목 | 메시지 |
|-----|------|------|--------|
| 400 | VALIDATION | 잘못된 요청 | 요청 데이터를 확인해주세요 |
| 401 | UNAUTHORIZED | 인증 필요 | 로그인이 필요합니다 |
| 403 | FORBIDDEN | 접근 거부 | 이 작업을 수행할 권한이 없습니다 |
| 404 | NOT_FOUND | 리소스 없음 | 요청한 리소스를 찾을 수 없습니다 |
| 409 | CONFLICT | 중복 데이터 | 이미 존재하는 데이터입니다 |
| 422 | VALIDATION | 검증 실패 | 입력 데이터가 유효하지 않습니다 |
| 500 | SERVER | 서버 오류 | 서버에서 오류가 발생했습니다 |
| 502 | SERVER | 게이트웨이 오류 | 서버 연결에 문제가 있습니다 |
| 503 | SERVER | 서비스 이용 불가 | 서비스를 일시적으로 사용할 수 없습니다 |
| 504 | TIMEOUT | 타임아웃 | 요청 시간이 초과되었습니다 |

## 사용 예제

### 1. 기본 API 호출 (자동 에러 처리)
```typescript
import { createProject } from '@/lib/api';

// 에러는 자동으로 처리되고 토스트로 표시됨
const project = await createProject({ name: 'New Project' });
```

### 2. 커스텀 에러 처리
```typescript
import { useAsyncError } from '@/hooks/useAsyncError';

const handleError = useAsyncError();

try {
  await someOperation();
} catch (error) {
  handleError(error, '작업 실행 중 오류가 발생했습니다');
}
```

### 3. 비동기 작업 래퍼
```typescript
import { useAsyncWrapper } from '@/hooks/useAsyncError';

const wrapAsync = useAsyncWrapper();

const handleSubmit = wrapAsync(
  async (data) => {
    await createProject(data);
  },
  {
    errorMessage: '프로젝트 생성에 실패했습니다'
  }
);
```

### 4. 네트워크 상태 확인
```typescript
import { useNetworkStatus } from '@/components/common/NetworkStatus';

const isOnline = useNetworkStatus();

if (!isOnline) {
  return <div>오프라인 상태입니다</div>;
}
```

### 5. 직접 토스트 표시
```typescript
import { useToastStore } from '@/stores/toastStore';

const { success, error, warning, info } = useToastStore();

success('성공', '작업이 완료되었습니다');
error('오류', '작업 실행 중 오류가 발생했습니다');
warning('경고', '이 작업은 되돌릴 수 없습니다');
info('알림', '새로운 업데이트가 있습니다');
```

## 테스트

**테스트 파일**: `frontend-new/src/lib/errorHandler.test.ts`

**테스트 커버리지**:
- ✅ parseAxiosError: 서버 응답 에러 파싱
- ✅ parseAxiosError: 네트워크 에러 처리
- ✅ parseAxiosError: 검증 에러 처리
- ✅ parseError: Axios 에러 처리
- ✅ parseError: 일반 Error 객체 처리
- ✅ parseError: 문자열 에러 처리
- ✅ formatValidationErrors: 검증 에러 포맷팅
- ✅ isRetryableError: 재시도 가능 에러 식별
- ✅ getUserFriendlyMessage: 사용자 친화적 메시지 생성

## 요구사항 충족

### Requirements 7.3: 로딩 및 에러 상태
✅ **완료**: 
- 전역 에러 핸들러 구현
- API 인터셉터로 자동 에러 처리
- 토스트로 에러 메시지 표시
- ErrorBoundary로 React 에러 캐치

### Requirements 7.4: 성공 메시지
✅ **완료**:
- Toast 컴포넌트에 success 변형 추가
- API 성공 시 자동 토스트 표시
- useToastStore의 success 메서드 활용

## 추가 기능

### 1. 네트워크 모니터링
- 온라인/오프라인 상태 자동 감지
- 상태 변경 시 알림
- 오프라인 배지 표시

### 2. 개발자 도구
- 개발 환경에서 상세 에러 로깅
- ErrorBoundary에서 컴포넌트 스택 표시
- 에러 정보 콘솔 그룹화

### 3. 재시도 로직 지원
- 재시도 가능한 에러 식별
- 사용자에게 재시도 안내 메시지

### 4. 검증 에러 상세 표시
- 서버 검증 에러 자동 포맷팅
- 필드별 에러 메시지 표시

## 문서화

**가이드 문서**: `frontend-new/src/lib/ERROR_HANDLING_GUIDE.md`

**포함 내용**:
- 에러 처리 시스템 개요
- 에러 타입 설명
- 사용 방법 및 예제
- HTTP 상태 코드 매핑
- 모범 사례
- 네트워크 상태 모니터링
- 재시도 로직

## 다음 단계

Task 19가 완료되었습니다. 다음 작업을 진행할 수 있습니다:

- **Task 20**: 접근성 및 키보드 네비게이션
- **Task 21**: 성능 최적화
- **Task 22**: 테스트 작성
- **Task 23**: 문서화 및 README

## 참고 사항

1. **자동 에러 처리**: 대부분의 API 에러는 자동으로 처리되므로 try-catch가 필요 없습니다
2. **커스텀 메시지**: 특정 상황에서 커스텀 메시지가 필요한 경우 `useAsyncError` 또는 `useAsyncWrapper` 사용
3. **네트워크 의존 기능**: `useNetworkStatus`로 온라인 상태 확인 후 실행
4. **에러 로깅**: 개발 환경에서만 콘솔에 로깅되며, 프로덕션에서는 에러 리포팅 서비스 연동 가능
5. **Toast 제한**: 최대 5개까지 동시 표시 가능
