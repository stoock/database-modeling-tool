# 테스트 가이드

## 개요

이 프로젝트는 Vitest와 React Testing Library를 사용하여 테스트를 작성합니다.

## 테스트 실행

```bash
# 모든 테스트 실행 (단일 실행)
npm test

# 워치 모드로 테스트 실행
npm run test:watch

# UI 모드로 테스트 실행
npm run test:ui
```

## 테스트 구조

### 유틸리티 함수 테스트
- `src/lib/validation.test.ts` - 명명 규칙 검증 함수 테스트
- `src/lib/utils.test.ts` - 유틸리티 함수 테스트

### 훅 테스트
- `src/hooks/useDebounce.test.ts` - 디바운스 훅 테스트

## 테스트 작성 가이드

### 유틸리티 함수 테스트

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from './myFunction'

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
```

### 훅 테스트

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMyHook } from './useMyHook'

describe('useMyHook', () => {
  it('should work correctly', async () => {
    const { result } = renderHook(() => useMyHook())
    
    expect(result.current).toBeDefined()
  })
})
```

## 테스트 커버리지

현재 구현된 테스트:
- ✅ 명명 규칙 검증 (23개 테스트)
- ✅ 유틸리티 함수 (17개 테스트)
- ✅ 디바운스 훅 (2개 테스트)

총 42개의 테스트가 통과하고 있습니다.

## 주의사항

- 테스트는 핵심 기능에 집중합니다
- 과도한 엣지 케이스 테스트는 피합니다
- 실제 기능을 검증하며, 모킹은 최소화합니다
