# 인덱스 관리 컴포넌트

이 디렉토리는 테이블 인덱스 관리와 관련된 컴포넌트를 포함합니다.

## 컴포넌트

### IndexList
테이블의 인덱스 목록을 카드 형태로 표시하고 관리하는 컴포넌트입니다.

**주요 기능:**
- 인덱스 목록을 카드 형태로 표시
- 인덱스 정보 표시 (이름, 타입, UNIQUE, 컬럼 목록)
- 인덱스 삭제 버튼
- 빈 상태 처리 (인덱스가 없을 때)
- 인덱스 추가 버튼

**Props:**
- `tableId`: 테이블 ID
- `tableName`: 테이블 이름
- `indexes`: 인덱스 목록
- `columns`: 컬럼 목록 (컬럼 이름 표시용)
- `onIndexCreated`: 인덱스 생성 후 콜백
- `onIndexDeleted`: 인덱스 삭제 후 콜백
- `onCreateIndex`: 인덱스 생성 다이얼로그 열기 콜백

**UI 특징:**
- 카드 형태로 인덱스 정보 표시
- 클러스터드/논클러스터드 타입 배지
- UNIQUE 인덱스 배지
- 컬럼 순서 및 정렬 방향 표시 (ASC/DESC)
- 반응형 그리드 레이아웃 (모바일: 1열, 데스크톱: 2열)

### DeleteIndexDialog
인덱스 삭제 확인 다이얼로그 컴포넌트입니다.

**주요 기능:**
- 삭제할 인덱스 정보 표시
- 삭제 확인 및 경고 메시지
- 삭제 진행 중 로딩 상태 표시
- 삭제 후 콜백 실행

**Props:**
- `index`: 삭제할 인덱스 객체
- `open`: 다이얼로그 열림 상태
- `onOpenChange`: 다이얼로그 상태 변경 핸들러
- `onSuccess`: 삭제 성공 후 콜백

**UI 특징:**
- 경고 아이콘 및 빨간색 테마
- 인덱스 상세 정보 표시 (이름, 타입, 컬럼)
- 성능 영향 경고 메시지
- 취소/삭제 버튼

## 사용 예시

```tsx
import { IndexList } from '@/components/indexes';

function TableDetailPage() {
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);

  const handleIndexCreated = () => {
    // 인덱스 목록 새로고침
    loadIndexes();
  };

  const handleIndexDeleted = () => {
    // 인덱스 목록 새로고침
    loadIndexes();
  };

  const handleCreateIndex = () => {
    // 인덱스 생성 다이얼로그 열기
    setIsCreateDialogOpen(true);
  };

  return (
    <IndexList
      tableId={tableId}
      tableName={tableName}
      indexes={indexes}
      columns={columns}
      onIndexCreated={handleIndexCreated}
      onIndexDeleted={handleIndexDeleted}
      onCreateIndex={handleCreateIndex}
    />
  );
}
```

## 다음 단계 (Task 15)

- CreateIndexDialog 컴포넌트 구현
- 인덱스명 자동 생성 기능
- 복합 인덱스 컬럼 선택 UI
- 드래그 앤 드롭으로 컬럼 순서 변경
- 명명 규칙 검증 통합

## 요구사항 매핑

이 컴포넌트는 다음 요구사항을 충족합니다:

- **Requirement 4.1**: 테이블의 모든 인덱스를 목록으로 표시
- **Requirement 4.8**: 인덱스 삭제 버튼 및 확인 다이얼로그

## 기술 스택

- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui (Card, Button, Dialog)
- lucide-react (아이콘)
