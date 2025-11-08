# 검증 시스템

MSSQL 데이터베이스 명명 규칙 검증 시스템입니다.

## 명명 규칙

### 테이블명
- **형식**: PascalCase 또는 UPPER_SNAKE_CASE
- **예시**: `User`, `OrderItem`, `USER`, `ORDER_ITEM`
- **검증**: `validateTableName(name)`

### 컬럼명
- **형식**: PascalCase 또는 UPPER_SNAKE_CASE
- **예시**: `UserId`, `CreatedAt`, `USER_ID`, `CREATED_AT`
- **검증**: `validateColumnName(name)`

### PK 컬럼명
- **규칙**: 테이블명 포함 필수
- **단독명칭 금지**: `ID`, `SEQ_NO`, `HIST_NO`
- **예시**: `USER_ID` (O), `ID` (X)
- **검증**: `validatePrimaryKeyColumnName(name, tableName)`

### Description
- **필수**: 한글 포함 필수
- **금지**: 테이블명/컬럼명 그대로 복사
- **권장**: "한글명 || 상세설명"
- **검증**: `validateTableDescription(desc, name)`

### 인덱스명
- **PK**: `PK__{테이블명}__{컬럼명}`
- **Clustered**: `CIDX__{테이블명}__{컬럼명}`
- **일반**: `IDX__{테이블명}__{컬럼명}`
- **자동 생성**: `generateIndexName(tableName, columns, type, unique)`

## 검증 함수

### validateTableName
```typescript
function validateTableName(name: string): ValidationResult {
  // PascalCase 또는 UPPER_SNAKE_CASE 검증
}
```

### validateColumnName
```typescript
function validateColumnName(name: string): ValidationResult {
  // PascalCase 또는 UPPER_SNAKE_CASE 검증
}
```

### validatePrimaryKeyColumnName
```typescript
function validatePrimaryKeyColumnName(
  name: string,
  tableName: string
): ValidationResult {
  // 테이블명 포함 여부 검증
  // 단독명칭 금지 검증
}
```

### validateDataTypeProperties
```typescript
function validateDataTypeProperties(
  dataType: MSSQLDataType,
  maxLength?: number,
  precision?: number,
  scale?: number
): ValidationResult {
  // 데이터 타입별 속성 검증
}
```

## 실시간 검증

### 디바운스
500ms 디바운스로 입력 중 검증을 최적화합니다.

```typescript
import { debounce } from '@/lib/utils';

const debouncedValidation = debounce((value: string) => {
  const result = validateTableName(value);
  setValidationResult(result);
}, 500);
```

### 사용 예시
```typescript
import { validateTableName } from '@/lib/validation';

function TableNameInput() {
  const [name, setName] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // 실시간 검증
    const result = validateTableName(value);
    setValidation(result);
  };
  
  return (
    <div>
      <input value={name} onChange={handleChange} />
      {validation && !validation.isValid && (
        <p className="text-red-600">{validation.message}</p>
      )}
      {validation?.suggestion && (
        <p className="text-blue-600">제안: {validation.suggestion}</p>
      )}
    </div>
  );
}
```

## 시스템 속성

모든 테이블에 필수 시스템 컬럼:

```typescript
const SYSTEM_COLUMNS = [
  {
    name: 'REG_ID',
    description: '등록자ID',
    dataType: 'VARCHAR',
    maxLength: 25,
    nullable: false,
  },
  {
    name: 'REG_DT',
    description: '등록일시',
    dataType: 'DATETIME',
    nullable: false,
    defaultValue: 'GETDATE()',
  },
  {
    name: 'CHG_ID',
    description: '수정자ID',
    dataType: 'VARCHAR',
    maxLength: 25,
    nullable: true,
  },
  {
    name: 'CHG_DT',
    description: '수정일시',
    dataType: 'DATETIME',
    nullable: true,
  },
];
```

## 검증 결과 타입

```typescript
interface ValidationResult {
  isValid: boolean;
  message: string;
  suggestion?: string;
}

interface ValidationError {
  type: string;
  severity: 'ERROR' | 'WARNING';
  entity: 'TABLE' | 'COLUMN' | 'INDEX';
  entityId: string;
  entityName: string;
  field?: string;
  message: string;
  expected?: string;
  actual?: string;
  suggestion?: string;
}
```

## 헬퍼 함수

### isIntegerType
정수형 타입 확인
```typescript
isIntegerType(dataType: MSSQLDataType): boolean
```

### requiresLength
길이 필요 여부 확인
```typescript
requiresLength(dataType: MSSQLDataType): boolean
```

### requiresPrecisionScale
precision/scale 필요 여부 확인
```typescript
requiresPrecisionScale(dataType: MSSQLDataType): boolean
```

### supportsIdentity
IDENTITY 지원 여부 확인
```typescript
supportsIdentity(dataType: MSSQLDataType): boolean
```
