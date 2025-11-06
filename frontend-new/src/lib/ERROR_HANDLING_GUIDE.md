# 에러 처리 가이드

이 문서는 frontend-new 애플리케이션의 에러 처리 시스템에 대한 가이드입니다.

## 개요

애플리케이션은 다층 에러 처리 시스템을 사용합니다:

1. **전역 에러 바운더리**: React 컴포넌트 트리에서 발생하는 에러 캐치
2. **API 인터셉터**: HTTP 요청/응답 에러 처리
3. **에러 핸들러 유틸리티**: 에러 파싱 및 변환
4. **토스트 시스템**: 사용자에게 에러 메시지 표시
5. **네트워크 모니터**: 온라인/오프라인 상태 감지

## 에러 타입

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

## 사용 방법

### 1. API 호출 에러 처리

API 클라이언트는 자동으로 에러를 처리하고 토스트를 표시합니다:

```typescript
import { createProject } from '@/lib/api';

// 에러는 자동으로 처리됨
try {
  const project = await createProject({ name: 'New Project' });
} catch (error) {
  // 에러는 이미 토스트로 표시됨
  // 추가 처리가 필요한 경우에만 catch 블록 사용
}
```

### 2. 커스텀 에러 처리

`useAsyncError` 훅을 사용하여 커스텀 에러 처리:

```typescript
import { useAsyncError } from '@/hooks/useAsyncError';

function MyComponent() {
  const handleError = useAsyncError();
  
  const handleSubmit = async () => {
    try {
      await someOperation();
    } catch (error) {
      handleError(error, '작업 실행 중 오류가 발생했습니다');
    }
  };
}
```

### 3. 비동기 작업 래퍼

`useAsyncWrapper` 훅으로 에러 처리를 자동화:

```typescript
import { useAsyncWrapper } from '@/hooks/useAsyncError';

function MyComponent() {
  const wrapAsync = useAsyncWrapper();
  
  const handleSubmit = wrapAsync(
    async (data) => {
      await createProject(data);
    },
    {
      errorMessage: '프로젝트 생성에 실패했습니다',
      onError: (error) => {
        // 추가 에러 처리
        console.log('Custom error handling', error);
      }
    }
  );
}
```

### 4. 토스트 메시지 직접 표시

```typescript
import { useToastStore } from '@/stores/toastStore';

function MyComponent() {
  const { success, error, warning, info } = useToastStore();
  
  const handleAction = () => {
    // 성공 메시지
    success('성공', '작업이 완료되었습니다');
    
    // 에러 메시지
    error('오류', '작업 실행 중 오류가 발생했습니다');
    
    // 경고 메시지
    warning('경고', '이 작업은 되돌릴 수 없습니다');
    
    // 정보 메시지
    info('알림', '새로운 업데이트가 있습니다');
  };
}
```

## 토스트 변형

토스트는 4가지 변형을 지원합니다:

- **default**: 일반 정보 (회색)
- **success**: 성공 메시지 (초록색)
- **warning**: 경고 메시지 (노란색)
- **destructive**: 에러 메시지 (빨간색)

## 에러 바운더리

React 컴포넌트 에러는 전역 ErrorBoundary가 자동으로 캐치합니다:

```typescript
// App.tsx에 이미 적용됨
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

커스텀 폴백 UI를 제공할 수도 있습니다:

```typescript
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

## 네트워크 상태 모니터링

NetworkStatus 컴포넌트가 자동으로 온라인/오프라인 상태를 감지합니다:

```typescript
// App.tsx에 이미 적용됨
<NetworkStatus />
```

네트워크 상태를 확인하는 훅:

```typescript
import { useNetworkStatus } from '@/components/common/NetworkStatus';

function MyComponent() {
  const isOnline = useNetworkStatus();
  
  if (!isOnline) {
    return <div>오프라인 상태입니다</div>;
  }
  
  return <div>온라인 상태입니다</div>;
}
```

## HTTP 상태 코드 매핑

| 상태 코드 | 에러 타입 | 제목 | 메시지 |
|---------|----------|------|--------|
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

## 에러 로깅

개발 환경에서는 모든 에러가 콘솔에 자동으로 로깅됩니다:

```typescript
// 개발 환경에서만 로깅
if (import.meta.env.DEV) {
  console.group('🔴 Error Title');
  console.error('Message:', errorInfo.message);
  console.error('Type:', errorInfo.type);
  console.groupEnd();
}
```

프로덕션 환경에서는 에러 리포팅 서비스(Sentry, LogRocket 등)로 전송할 수 있습니다.

## 재시도 가능한 에러

다음 에러 타입은 재시도 가능한 것으로 간주됩니다:

- NETWORK
- TIMEOUT
- SERVER

재시도 가능 여부 확인:

```typescript
import { isRetryableError } from '@/lib/errorHandler';

if (isRetryableError(errorInfo)) {
  // 재시도 로직
}
```

## 검증 에러 처리

서버에서 검증 에러를 반환하는 경우, 상세 정보가 자동으로 포맷팅됩니다:

```typescript
// 서버 응답
{
  "error": {
    "message": "검증 실패",
    "code": "VALIDATION_ERROR",
    "details": {
      "name": ["이름은 필수입니다", "이름은 100자 이하여야 합니다"],
      "email": ["유효한 이메일 주소를 입력하세요"]
    }
  }
}

// 토스트 메시지
// 제목: "검증 실패"
// 내용: "검증 실패\n\nname: 이름은 필수입니다, 이름은 100자 이하여야 합니다\nemail: 유효한 이메일 주소를 입력하세요"
```

## 모범 사례

1. **API 호출은 try-catch로 감싸지 않아도 됨**: 인터셉터가 자동 처리
2. **커스텀 에러 메시지가 필요한 경우**: `useAsyncError` 또는 `useAsyncWrapper` 사용
3. **사용자 액션 성공 시**: 명시적으로 성공 토스트 표시
4. **중요한 에러**: 추가 로깅이나 리포팅 구현
5. **네트워크 의존적 기능**: `useNetworkStatus`로 상태 확인

## 예제

### 프로젝트 생성 with 에러 처리

```typescript
import { useState } from 'react';
import { useAsyncWrapper } from '@/hooks/useAsyncError';
import { createProject } from '@/lib/api';
import { useToastStore } from '@/stores/toastStore';

function CreateProjectForm() {
  const [isLoading, setIsLoading] = useState(false);
  const wrapAsync = useAsyncWrapper();
  const { success } = useToastStore();
  
  const handleSubmit = wrapAsync(
    async (data) => {
      setIsLoading(true);
      try {
        const project = await createProject(data);
        success('프로젝트 생성 완료', `"${project.name}" 프로젝트가 생성되었습니다`);
        // 추가 로직...
      } finally {
        setIsLoading(false);
      }
    },
    {
      errorMessage: '프로젝트 생성에 실패했습니다'
    }
  );
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드 */}
    </form>
  );
}
```

### 네트워크 상태 확인

```typescript
import { useNetworkStatus } from '@/components/common/NetworkStatus';

function DataSyncButton() {
  const isOnline = useNetworkStatus();
  
  return (
    <button disabled={!isOnline}>
      {isOnline ? '데이터 동기화' : '오프라인'}
    </button>
  );
}
```
