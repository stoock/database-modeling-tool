# 테이블 관리 컴포넌트

테이블 목록 표시, 생성, 삭제 기능을 제공하는 컴포넌트들입니다.

## 컴포넌트

### TableList

테이블 목록을 표시하고 선택, 생성, 삭제 기능을 제공합니다.

**Props:**
- `projectId`: 프로젝트 ID
- `tables`: 테이블 목록
- `selectedTableId`: 선택된 테이블 ID
- `onSelectTable`: 테이블 선택 핸들러
- `onTableCreated`: 테이블 생성 완료 핸들러
- `onTableDeleted`: 테이블 삭제 완료 핸들러

**기능:**
- 테이블 목록 표시 (카드 형태)
- 선택된 테이블 하이라이트 (파란색 테두리)
- 테이블 추가 버튼
- 테이블 삭제 버튼 (각 카드)
- 빈 상태 표시

### CreateTableDialog

테이블 생성 다이얼로그 컴포넌트입니다.

**Props:**
- `projectId`: 프로젝트 ID
- `open`: 다이얼로그 열림 상태
- `onOpenChange`: 다이얼로그 상태 변경 핸들러
- `onSuccess`: 생성 성공 핸들러

**기능:**
- 테이블명 입력 (대문자 검증)
- Description 입력 (한글 설명 필수)
- 실시간 명명 규칙 검증 (500ms 디바운스)
- 검증 결과 표시 (ValidationBadge)
- React Hook Form + Zod 검증

**검증 규칙:**
- 테이블명: 대문자 형식 (PascalCase 또는 UPPER_SNAKE_CASE)
- Description: 필수, 한글 포함, 테이블명 그대로 복사 금지

### DeleteTableDialog

테이블 삭제 확인 다이얼로그 컴포넌트입니다.

**Props:**
- `table`: 삭제할 테이블
- `open`: 다이얼로그 열림 상태
- `onOpenChange`: 다이얼로그 상태 변경 핸들러
- `onConfirm`: 삭제 확인 핸들러

**기능:**
- 삭제할 테이블 정보 표시
- 경고 메시지 표시
- 삭제 확인 버튼

## 사용 예시

```typescript
import { TableList } from '@/components/tables';

function ProjectDetailPage() {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const { tables, fetchTablesByProject } = useTableStore();

  const handleTableCreated = () => {
    fetchTablesByProject(projectId);
  };

  const handleTableDeleted = () => {
    setSelectedTableId(null);
    fetchTablesByProject(projectId);
  };

  return (
    <TableList
      projectId={projectId}
      tables={tables}
      selectedTableId={selectedTableId}
      onSelectTable={setSelectedTableId}
      onTableCreated={handleTableCreated}
      onTableDeleted={handleTableDeleted}
    />
  );
}
```

## 의존성

- React Hook Form: 폼 관리
- Zod: 스키마 검증
- Zustand: 상태 관리
- shadcn/ui: UI 컴포넌트
- lucide-react: 아이콘

## 관련 파일

- `src/lib/validation.ts`: 명명 규칙 검증 함수
- `src/hooks/useDebounce.ts`: 디바운스 훅
- `src/stores/tableStore.ts`: 테이블 상태 관리
- `src/components/validation/ValidationBadge.tsx`: 검증 결과 표시
