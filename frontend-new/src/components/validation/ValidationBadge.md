# ValidationBadge 컴포넌트

## 개요
실시간 검증 결과를 시각적으로 표시하는 배지 컴포넌트입니다. 폼 필드의 유효성 검증 결과를 사용자에게 즉각적으로 피드백합니다.

## 기능
- ✅ Valid/Invalid 상태 표시 (초록색/빨간색)
- 💬 에러 메시지 표시
- 💡 수정 제안 표시
- 🎨 일관된 디자인 시스템

## 사용법

```tsx
import { ValidationBadge } from '@/components/validation/ValidationBadge';
import { validateTableName } from '@/lib/validation';

function MyForm() {
  const [name, setName] = useState('');
  const [validation, setValidation] = useState(null);

  useEffect(() => {
    if (name) {
      const result = validateTableName(name);
      setValidation(result);
    }
  }, [name]);

  return (
    <div>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <ValidationBadge result={validation} />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| result | ValidationResult \| null | Yes | 검증 결과 객체 |
| className | string | No | 추가 CSS 클래스 |

## ValidationResult 타입

```typescript
interface ValidationResult {
  isValid: boolean;      // 검증 통과 여부
  message: string;       // 검증 메시지
  suggestion?: string;   // 수정 제안 (선택)
}
```

## 통합된 컴포넌트

ValidationBadge는 다음 폼 컴포넌트에 통합되어 있습니다:

1. **CreateTableDialog** - 테이블 생성 시 테이블명과 Description 검증
2. **CreateColumnDialog** - 컬럼 생성 시 컬럼명, Description, 데이터 타입 검증
3. **EditColumnDialog** - 컬럼 수정 시 동일한 검증
4. **CreateIndexDialog** - 인덱스 생성 시 인덱스명 검증

## 검증 규칙

### 테이블명 검증
- 대문자 형식 (PascalCase 또는 UPPER_SNAKE_CASE)
- 예: `USER`, `ORDER_ITEM`

### 컬럼명 검증
- 대문자 형식
- PK 컬럼은 테이블명 포함 필수
- 단독명칭 금지 (ID, SEQ_NO 등)
- 예: `USER_ID`, `ORDER_ITEM_NO`

### Description 검증
- 필수 입력
- 한글 포함 필수
- 테이블명/컬럼명 그대로 복사 금지
- 권장 형식: "한글명 || 상세설명"

### 인덱스명 검증
- 명명 규칙 준수
  - PK: `PK__{테이블명}__{컬럼명}`
  - Cluster: `CIDX__{테이블명}__{컬럼명}`
  - 일반: `IDX__{테이블명}__{컬럼명}`

## 디자인

### Valid 상태
- 초록색 체크 아이콘 (CheckCircle2)
- 초록색 텍스트 (text-green-600)
- 확인 메시지 표시

### Invalid 상태
- 빨간색 경고 아이콘 (AlertCircle)
- 빨간색 텍스트 (text-red-600)
- 에러 메시지 표시
- 회색 제안 텍스트 (text-gray-500)

## 접근성
- 아이콘과 텍스트를 함께 제공하여 색맹 사용자도 구분 가능
- flex-shrink-0으로 아이콘이 찌그러지지 않도록 보장
- 명확한 메시지로 스크린 리더 사용자 지원

## 성능
- 500ms 디바운스로 불필요한 검증 호출 최소화
- null 체크로 불필요한 렌더링 방지
- 경량 컴포넌트로 빠른 렌더링

## 요구사항 충족
- ✅ 5.12: 명명 규칙 위반 시 빨간색 경고 메시지 표시
- ✅ 5.13: 명명 규칙 준수 시 초록색 확인 메시지 표시
- ✅ 5.14: 명명 규칙 위반 시 올바른 형식의 예시 제공
