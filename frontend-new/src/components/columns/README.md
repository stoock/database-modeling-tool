# 컬럼 관리 컴포넌트

테이블의 컬럼 목록을 표시하고 관리하는 컴포넌트입니다.

## 컴포넌트

### ColumnList

테이블의 컬럼 목록을 테이블 형태로 표시하고, 드래그 앤 드롭으로 순서를 변경할 수 있습니다.

**Props:**
- `tableId`: string - 테이블 ID
- `columns`: Column[] - 컬럼 목록
- `onColumnCreated`: () => void - 컬럼 생성 버튼 클릭 시 호출
- `onColumnUpdated`: () => void - 컬럼 수정 완료 시 호출
- `onColumnDeleted`: () => void - 컬럼 삭제 완료 시 호출
- `onEditColumn`: (column: Column) => void - 컬럼 편집 버튼 클릭 시 호출
- `onDeleteColumn`: (column: Column) => void - 컬럼 삭제 버튼 클릭 시 호출

**기능:**
- 컬럼 목록을 테이블 형태로 표시
- 순서, 컬럼명, 한글명, 데이터 타입, NULL 허용, PK, IDENTITY 정보 표시
- 드래그 앤 드롭으로 컬럼 순서 변경
- 컬럼 편집/삭제 버튼 제공
- 컬럼이 없을 때 안내 메시지 표시

**사용 예시:**
```tsx
import { ColumnList } from '@/components/columns';

function TableDetail() {
  const [columns, setColumns] = useState<Column[]>([]);

  const handleColumnCreated = () => {
    // 컬럼 생성 다이얼로그 열기
  };

  const handleColumnUpdated = () => {
    // 컬럼 목록 새로고침
    loadColumns();
  };

  const handleEditColumn = (column: Column) => {
    // 컬럼 편집 다이얼로그 열기
  };

  const handleDeleteColumn = (column: Column) => {
    // 컬럼 삭제 확인 다이얼로그 열기
  };

  return (
    <ColumnList
      tableId={tableId}
      columns={columns}
      onColumnCreated={handleColumnCreated}
      onColumnUpdated={handleColumnUpdated}
      onColumnDeleted={handleColumnUpdated}
      onEditColumn={handleEditColumn}
      onDeleteColumn={handleDeleteColumn}
    />
  );
}
```

### SortableRow

드래그 가능한 컬럼 행 컴포넌트입니다. ColumnList 내부에서 사용됩니다.

**Props:**
- `column`: Column - 컬럼 정보
- `index`: number - 컬럼 순서 (0부터 시작)
- `onEdit`: () => void - 편집 버튼 클릭 시 호출
- `onDelete`: () => void - 삭제 버튼 클릭 시 호출

**기능:**
- 드래그 핸들 제공 (GripVertical 아이콘)
- 컬럼 정보 표시
- PK 배지 표시
- NULL 허용 여부 체크/X 아이콘으로 표시
- IDENTITY 정보 표시 (seed, increment 포함)
- 편집/삭제 버튼 제공

## 드래그 앤 드롭

`@dnd-kit` 라이브러리를 사용하여 구현되었습니다.

**특징:**
- 마우스와 키보드 모두 지원
- 드래그 중 시각적 피드백 제공 (투명도 변경)
- 낙관적 업데이트로 즉각적인 UI 반응
- 서버 API 호출 실패 시 자동 롤백

**순서 변경 프로세스:**
1. 사용자가 컬럼을 드래그하여 새 위치에 드롭
2. 로컬 상태 즉시 업데이트 (낙관적 업데이트)
3. 서버에 순서 변경 API 호출
4. 성공 시: 토스트 메시지 표시
5. 실패 시: 원래 순서로 롤백 및 에러 메시지 표시

## 데이터 타입 표시

컬럼의 데이터 타입을 다음과 같이 표시합니다:

- `VARCHAR(100)` - 길이 포함
- `NVARCHAR(50)` - 길이 포함
- `DECIMAL(18, 2)` - 정밀도와 스케일 포함
- `INT` - 기본 타입
- `DATETIME` - 기본 타입

## IDENTITY 표시

IDENTITY 속성을 다음과 같이 표시합니다:

- `-` - IDENTITY 아님
- `Yes` - IDENTITY이지만 seed/increment 정보 없음
- `(1, 1)` - seed=1, increment=1

## 스타일링

Tailwind CSS를 사용하여 스타일링되었습니다.

**색상:**
- PK 배지: 파란색 (blue-100, blue-800)
- NULL 허용: 초록색 체크 (green-600)
- NULL 불가: 빨간색 X (red-600)
- 삭제 버튼: 빨간색 (red-600, red-700)
- 드래그 중: 파란색 배경 (blue-50)

## 접근성

- 드래그 핸들에 키보드 네비게이션 지원
- 버튼에 title 속성으로 툴팁 제공
- 시각적 피드백으로 상태 변화 명확히 표시

## 향후 개선 사항

- Task 10: CreateColumnDialog 통합
- Task 12: EditColumnDialog 통합
- Task 13: DeleteColumnDialog 통합
- 가상 스크롤링 (대량 컬럼 처리)
- 컬럼 필터링 및 검색
- 컬럼 복사/붙여넣기
