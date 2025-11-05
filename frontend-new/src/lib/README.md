# 유틸리티 라이브러리

이 폴더는 프로젝트 전반에서 사용되는 유틸리티 함수와 검증 로직을 포함합니다.

## 파일 구조

### `utils.ts`
공통 유틸리티 함수 모음

**주요 기능:**
- **날짜 포맷**: `formatDate`, `formatDateShort`, `formatDateTime`
- **에러 처리**: `getErrorMessage`, `isApiError`
- **문자열 변환**: `truncate`, `capitalize`, `toPascalCase`, `toSnakeCase`
- **디바운스**: `debounce` (500ms 권장)
- **배열 조작**: `reorder`, `groupBy`
- **숫자 포맷**: `formatNumber`, `clamp`
- **객체 조작**: `omit`, `pick`
- **로컬 스토리지**: `getLocalStorage`, `setLocalStorage`, `removeLocalStorage`

### `validation.ts`
MSSQL 데이터베이스 명명 규칙 검증 함수

**주요 기능:**
- **대문자 검증**: `validateUpperCase` - PascalCase 또는 UPPER_SNAKE_CASE
- **테이블명 검증**: `validateTableName`
- **컬럼명 검증**: `validateColumnName`, `validatePrimaryKeyColumnName`
- **Description 검증**: `validateTableDescription`, `validateColumnDescription`
- **데이터 타입 검증**: `validateDataTypeProperties`
- **인덱스명 검증**: `validateIndexName`, `generateIndexName`
- **시스템 속성 검증**: `validateSystemColumns`
- **전체 검증**: `validateTable`, `validateColumn`, `validateIndex`

**헬퍼 함수:**
- `isIntegerType`: 정수형 타입 확인
- `requiresLength`: 길이 필요 여부 확인
- `requiresPrecisionScale`: precision/scale 필요 여부 확인
- `supportsIdentity`: IDENTITY 지원 여부 확인

### `api.ts`
API 클라이언트 (별도 구현 필요)

## 사용 예시

### 날짜 포맷
```typescript
import { formatDate, formatDateTime } from '@/lib/utils';

const date = formatDate('2024-01-15T10:30:00Z');
// 출력: 2024. 01. 15. 10:30
```

### 명명 규칙 검증
```typescript
import { validateTableName, validateColumnName } from '@/lib/validation';

const result = validateTableName('USER');
// { isValid: true, message: '올바른 형식입니다' }

const pkResult = validatePrimaryKeyColumnName('ID', 'USER');
// { isValid: false, message: '단독명칭은 사용할 수 없습니다', suggestion: '예: USER_ID' }
```

### 디바운스
```typescript
import { debounce } from '@/lib/utils';

const debouncedValidation = debounce((value: string) => {
  // 검증 로직
}, 500);
```

### 인덱스명 자동 생성
```typescript
import { generateIndexName } from '@/lib/validation';

const indexName = generateIndexName('USER', ['USER_ID'], 'NONCLUSTERED', false);
// 출력: IDX__USER__USER_ID
```

## 검증 규칙

### 테이블명
- 대문자 형식 (PascalCase 또는 UPPER_SNAKE_CASE)
- 예: `USER`, `ORDER_ITEM`

### 컬럼명
- 대문자 형식 (PascalCase 또는 UPPER_SNAKE_CASE)
- PK 컬럼은 테이블명 포함 필수
- 단독명칭 금지 (ID, SEQ_NO, HIST_NO 등)
- 예: `USER_ID`, `REG_DT`

### Description
- 필수 입력
- 한글 포함 필수
- 테이블명/컬럼명 그대로 복사 금지
- 권장 형식: "한글명 || 상세설명"

### 인덱스명
- PK: `PK__{테이블명}__{컬럼명}`
- Clustered: `CIDX__{테이블명}__{컬럼명}`
- 일반: `IDX__{테이블명}__{컬럼명}`

### 시스템 속성
모든 테이블에 필수:
- `REG_ID` (VARCHAR(25), NOT NULL)
- `REG_DT` (DATETIME, NOT NULL, DEFAULT GETDATE())
- `CHG_ID` (VARCHAR(25), NULL)
- `CHG_DT` (DATETIME, NULL)
