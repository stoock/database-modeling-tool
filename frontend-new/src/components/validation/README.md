# Validation Components

명명 규칙 검증 관련 컴포넌트들입니다.

## ValidationBadge

실시간 검증 결과를 표시하는 배지 컴포넌트입니다.

### Props

- `result`: ValidationResult | null - 검증 결과 객체
- `className`: string (optional) - 추가 CSS 클래스

### 사용 예시

```tsx
import { ValidationBadge } from '@/components/validation';
import { validateTableName } from '@/lib/validation';

function TableForm() {
  const [name, setName] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const handleNameChange = (value: string) => {
    setName(value);
    const result = validateTableName(value);
    setValidationResult(result);
  };

  return (
    <div>
      <input value={name} onChange={(e) => handleNameChange(e.target.value)} />
      <ValidationBadge result={validationResult} />
    </div>
  );
}
```

## ValidationPanel

프로젝트 전체의 명명 규칙 검증 결과를 표시하는 패널 컴포넌트입니다.

### Props

- `projectId`: string - 검증할 프로젝트 ID
- `onNavigateToEntity`: (entityType, entityId) => void (optional) - 엔티티 클릭 시 호출되는 콜백

### 기능

1. **검증 실행**: 버튼 클릭으로 프로젝트 전체 검증 수행
2. **검증 결과 요약**: 에러 수, 경고 수, 준수율 표시
3. **에러/경고 그룹화**: 엔티티별로 그룹화하여 표시
4. **상세 정보**: 각 항목의 메시지, 제안, 예상/실제 값 표시
5. **엔티티 이동**: 항목 클릭 시 해당 엔티티로 이동

### 검증 결과 구조

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
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

### 준수율 계산

- 에러는 가중치 2, 경고는 가중치 1로 계산
- 준수율 = (1 - 총 가중치 / 최대 가중치) × 100
- 80% 이상: 초록색 (우수)
- 50-79%: 노란색 (보통)
- 50% 미만: 빨간색 (개선 필요)

### 사용 예시

```tsx
import { ValidationPanel } from '@/components/validation';

function ProjectDetailPage() {
  const projectId = 'project-123';

  const handleNavigate = (entityType, entityId) => {
    // 해당 엔티티로 스크롤 또는 페이지 이동
    console.log(`Navigate to ${entityType} ${entityId}`);
  };

  return (
    <div>
      <h1>프로젝트 상세</h1>
      <ValidationPanel 
        projectId={projectId} 
        onNavigateToEntity={handleNavigate}
      />
    </div>
  );
}
```

### 검증 규칙

ValidationPanel은 다음 규칙들을 검증합니다:

1. **테이블명 검증**
   - 대문자 형식 (PascalCase 또는 UPPER_SNAKE_CASE)
   - Description 필수 및 테이블명 복사 금지

2. **컬럼명 검증**
   - 대문자 형식
   - PK 컬럼은 테이블명 포함 필수
   - 단독명칭 금지 (ID, SEQ_NO 등)
   - Description 필수 및 컬럼명 복사 금지

3. **시스템 속성 검증**
   - REG_ID, REG_DT, CHG_ID, CHG_DT 필수
   - REG_DT는 DEFAULT GETDATE() 설정 필수

4. **데이터 타입 검증**
   - VARCHAR/NVARCHAR는 길이 필수
   - DECIMAL/NUMERIC은 precision, scale 필수

5. **인덱스명 검증**
   - 명명 규칙 준수 (PK__, CIDX__, IDX__ 접두사)
   - 테이블명 포함 필수

### 스타일링

- 에러: 빨간색 (red-500, red-600)
- 경고: 노란색 (yellow-500, yellow-600)
- 성공: 초록색 (green-500, green-600)
- 카드 형태로 표시
- 섹션별 접기/펼치기 기능
- 호버 효과로 클릭 가능 표시

### API 연동

ValidationPanel은 다음 API를 사용합니다:

```typescript
// 프로젝트 전체 검증
POST /api/projects/{projectId}/validate

// 응답 형식
{
  "valid": boolean,
  "errors": ValidationError[],
  "warnings": ValidationWarning[]
}
```

### 접근성

- 키보드 네비게이션 지원
- ARIA 레이블 적용
- 색상 대비 WCAG AA 준수
- 스크린 리더 지원
