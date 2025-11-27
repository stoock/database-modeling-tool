# API 호출 오류 수정 및 대문자 자동 입력 기능 추가

## 수정 날짜
2024-11-28

## 문제점
1. **테이블/컬럼 생성 API 호출 오류**: 프론트엔드와 백엔드 간 필드명 불일치
2. **대문자 입력 불편**: 테이블명, 컬럼명, 인덱스명 입력 시 수동으로 대문자 변환 필요

## 해결 방법

### 1. API 필드명 매핑 수정 (`frontend/src/lib/api.ts`)

#### 테이블 생성 API
- `addSystemColumns` 필드 제거 (백엔드에서 지원하지 않음)
- 테이블명 자동 대문자 변환

#### 컬럼 생성 API
프론트엔드 → 백엔드 필드명 매핑:
- `nullable` → `isNullable`
- `primaryKey` → `isPrimaryKey`
- `identity` → `isIdentity`

#### 컬럼 수정 API
- 동일한 필드명 매핑 적용
- undefined 값 처리 개선

### 2. 자동 대문자 변환 기능 추가

#### 테이블명 입력 (`CreateTableDialog.tsx`)
```typescript
<Input
  style={{ textTransform: 'uppercase' }}
  onChange={(e) => {
    const upperValue = e.target.value.toUpperCase();
    e.target.value = upperValue;
  }}
/>
```

#### 컬럼명 입력 (`CreateColumnDialog.tsx`, `EditColumnDialog.tsx`)
```typescript
<Input
  value={name}
  onChange={(e) => setName(e.target.value.toUpperCase())}
  style={{ textTransform: 'uppercase' }}
/>
```

#### 인덱스명 입력 (`CreateIndexDialog.tsx`)
```typescript
<Input
  value={name}
  onChange={(e) => setName(e.target.value.toUpperCase())}
  style={{ textTransform: 'uppercase' }}
/>
```

## 수정된 파일 목록

1. `frontend/src/lib/api.ts`
   - `createTable()`: addSystemColumns 필드 제거
   - `createColumn()`: 필드명 매핑 추가
   - `updateColumn()`: 필드명 매핑 추가

2. `frontend/src/components/tables/CreateTableDialog.tsx`
   - 테이블명 자동 대문자 변환
   - 제출 시 대문자 변환 적용

3. `frontend/src/components/columns/CreateColumnDialog.tsx`
   - 컬럼명 입력 시 자동 대문자 변환
   - 제출 시 대문자 변환 적용

4. `frontend/src/components/columns/EditColumnDialog.tsx`
   - 컬럼명 입력 시 자동 대문자 변환
   - 제출 시 대문자 변환 적용

5. `frontend/src/components/indexes/CreateIndexDialog.tsx`
   - 인덱스명 입력 시 자동 대문자 변환

## 테스트 방법

### 1. 테이블 생성 테스트
```
1. 프로젝트 선택
2. "테이블 추가" 버튼 클릭
3. 테이블명 입력 (소문자로 입력해도 자동으로 대문자로 표시됨)
   예: "user" → "USER"
4. Description 입력
5. "생성" 버튼 클릭
6. 테이블이 정상적으로 생성되는지 확인
```

### 2. 컬럼 생성 테스트
```
1. 테이블 선택
2. "컬럼 추가" 버튼 클릭
3. 컬럼명 입력 (소문자로 입력해도 자동으로 대문자로 표시됨)
   예: "user_id" → "USER_ID"
4. Description, 데이터 타입 등 입력
5. "생성" 버튼 클릭
6. 컬럼이 정상적으로 생성되는지 확인
```

### 3. 인덱스 생성 테스트
```
1. 테이블 선택
2. "인덱스" 탭 클릭
3. "인덱스 추가" 버튼 클릭
4. 인덱스명 입력 (소문자로 입력해도 자동으로 대문자로 표시됨)
   예: "idx_user_id" → "IDX_USER_ID"
5. 컬럼 선택 및 설정
6. "인덱스 생성" 버튼 클릭
7. 인덱스가 정상적으로 생성되는지 확인
```

## 기대 효과

1. **API 호출 오류 해결**: 프론트엔드와 백엔드 간 필드명 불일치로 인한 오류 제거
2. **사용자 경험 개선**: 대문자 입력을 위한 Caps Lock 사용 불필요
3. **일관성 향상**: 모든 입력 필드에서 자동 대문자 변환 적용
4. **오류 감소**: 명명 규칙 위반 가능성 감소

## 주의사항

- 기존에 생성된 데이터는 영향을 받지 않습니다
- 백엔드 API는 변경되지 않았으며, 프론트엔드에서만 필드명 매핑을 수행합니다
- 대문자 변환은 입력 시점에 즉시 적용되어 사용자가 실시간으로 확인할 수 있습니다
