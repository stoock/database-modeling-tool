# 컴포넌트 가이드

## 주요 컴포넌트

### ProjectsPage
프로젝트 목록을 표시하고 새 프로젝트를 생성하는 페이지입니다.

**기능:**
- 프로젝트 카드 그리드 표시
- 새 프로젝트 생성 다이얼로그
- 프로젝트 삭제 확인 다이얼로그
- 프로젝트 클릭 시 상세 페이지로 이동

### ProjectDetailPage
선택된 프로젝트의 테이블 목록과 상세 정보를 표시하는 페이지입니다.

**레이아웃:**
- 좌측: 테이블 목록 (30%)
- 우측: 테이블 상세 (70%)

**기능:**
- 테이블 목록 표시 및 선택
- 테이블 생성/수정/삭제
- 컬럼 관리
- 인덱스 관리
- 검증 결과 표시
- 스키마 내보내기

### ColumnList
테이블의 컬럼 목록을 표시하고 드래그 앤 드롭으로 순서를 변경할 수 있습니다.

**Props:**
- `tableId`: string - 테이블 ID
- `columns`: Column[] - 컬럼 목록
- `onColumnCreated`: () => void
- `onColumnUpdated`: () => void
- `onColumnDeleted`: () => void

**기능:**
- 컬럼 목록 테이블 표시
- 드래그 앤 드롭 순서 변경
- PK, NULL, IDENTITY 정보 표시
- 컬럼 편집/삭제 버튼

### CreateColumnDialog
새 컬럼을 생성하는 다이얼로그입니다.

**기능:**
- 27개 MSSQL 데이터 타입 지원
- 실시간 검증
- 조건부 필드 (maxLength, precision, scale, identity)
- 자동 규칙 적용 (PK→NOT NULL)

### IndexList
테이블의 인덱스 목록을 표시하고 관리합니다.

**기능:**
- 인덱스 목록 표시
- 클러스터드/논클러스터드 구분
- UNIQUE 제약조건 표시
- 인덱스 생성/삭제

### ValidationPanel
프로젝트의 명명 규칙 준수 여부를 검증하고 결과를 표시합니다.

**기능:**
- 검증 요약 (에러/경고 개수, 준수율)
- 에러/경고 그룹화 표시
- 수정 제안 제공
- 엔티티별 필터링

### ExportDialog
프로젝트의 스키마를 MSSQL DDL 스크립트로 내보냅니다.

**기능:**
- SQL 미리보기
- 내보내기 옵션 설정
- 클립보드 복사
- .sql 파일 다운로드

## 공통 컴포넌트

### ErrorBoundary
React 에러를 캐치하고 폴백 UI를 표시합니다.

### KeyboardShortcutsHelp
키보드 단축키 도움말을 표시합니다.

### NetworkStatus
네트워크 상태를 모니터링하고 오프라인 시 배지를 표시합니다.

## UI 컴포넌트 (shadcn/ui)

- Button
- Card
- Checkbox
- Dialog
- Input
- Label
- Select
- Tabs
- Toast

자세한 사용법은 [shadcn/ui 문서](https://ui.shadcn.com/)를 참조하세요.
