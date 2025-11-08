# ExportDialog 사용 가이드

## 빠른 시작

### 1. 기본 사용법

```tsx
import { useState } from 'react';
import { ExportDialog } from '@/components/export';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

function MyPage() {
  const [exportOpen, setExportOpen] = useState(false);
  const projectId = "project-123";
  const projectName = "My Database Project";
  
  return (
    <>
      <Button onClick={() => setExportOpen(true)}>
        <Download className="mr-2 h-4 w-4" />
        스키마 내보내기
      </Button>
      
      <ExportDialog
        projectId={projectId}
        projectName={projectName}
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
    </>
  );
}
```

### 2. ProjectDetailPage에서 사용 (이미 구현됨)

```tsx
// frontend-new/src/pages/ProjectDetailPage.tsx
const [exportDialogOpen, setExportDialogOpen] = useState(false);

// 헤더의 내보내기 버튼
<Button onClick={() => setExportDialogOpen(true)}>
  <Download className="mr-2 h-4 w-4" />
  스키마 내보내기
</Button>

// 페이지 하단에 다이얼로그
<ExportDialog
  projectId={projectId}
  projectName={selectedProject.name}
  open={exportDialogOpen}
  onOpenChange={setExportDialogOpen}
/>
```

## 사용자 워크플로우

### Step 1: 다이얼로그 열기
사용자가 "스키마 내보내기" 버튼을 클릭하면 다이얼로그가 열립니다.

### Step 2: 옵션 선택
```
☐ DROP 문 포함 (기존 객체 삭제)
☑ MS_Description 주석 포함 (권장)
☑ 인덱스 생성문 포함
☑ 제약조건 포함 (PK, DEFAULT 등)
```

### Step 3: SQL 생성
"SQL 생성" 버튼을 클릭하면:
1. 로딩 스피너 표시
2. 백엔드 API 호출
3. SQL 스크립트 미리보기 표시
4. DB 스키마 가이드 준수 확인 표시

### Step 4: 내보내기
두 가지 옵션:
- **클립보드 복사**: SQL을 클립보드에 복사
- **.sql 파일 다운로드**: 파일로 저장

## 생성되는 SQL 예시

### 기본 테이블 생성
```sql
-- 테이블 생성
CREATE TABLE USER (
  USER_ID BIGINT IDENTITY(1,1) NOT NULL,
  USER_NAME NVARCHAR(100) NOT NULL,
  EMAIL VARCHAR(255) NOT NULL,
  PHONE VARCHAR(20) NULL,
  REG_ID VARCHAR(25) NOT NULL,
  REG_DT DATETIME NOT NULL DEFAULT GETDATE(),
  CHG_ID VARCHAR(25) NULL,
  CHG_DT DATETIME NULL,
  CONSTRAINT PK__USER__USER_ID PRIMARY KEY CLUSTERED (USER_ID)
);
```

### 인덱스 생성
```sql
-- 인덱스 생성
CREATE NONCLUSTERED INDEX IDX__USER__EMAIL ON USER (EMAIL ASC);
CREATE NONCLUSTERED INDEX IDX__USER__PHONE ON USER (PHONE ASC);
```

### MS_Description 등록
```sql
-- 테이블 설명
EXEC sys.sp_addextendedproperty 
  @name = N'MS_Description',
  @value = N'사용자 || 시스템 사용자 정보',
  @level0type = N'SCHEMA', @level0name = N'dbo',
  @level1type = N'TABLE', @level1name = N'USER';

-- 컬럼 설명
EXEC sys.sp_addextendedproperty 
  @name = N'MS_Description',
  @value = N'사용자ID',
  @level0type = N'SCHEMA', @level0name = N'dbo',
  @level1type = N'TABLE', @level1name = N'USER',
  @level2type = N'COLUMN', @level2name = N'USER_ID';

EXEC sys.sp_addextendedproperty 
  @name = N'MS_Description',
  @value = N'사용자명',
  @level0type = N'SCHEMA', @level0name = N'dbo',
  @level1type = N'TABLE', @level1name = N'USER',
  @level2type = N'COLUMN', @level2name = N'USER_NAME';
```

### DROP 문 포함 시
```sql
-- 기존 객체 삭제
IF OBJECT_ID('USER', 'U') IS NOT NULL DROP TABLE USER;

-- 테이블 생성
CREATE TABLE USER (
  ...
);
```

## UI 컴포넌트 구조

```
┌─────────────────────────────────────────────────────────┐
│ SQL 스키마 내보내기                                      │
│ My Project 프로젝트의 데이터베이스 스키마를 MSSQL DDL... │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 내보내기 옵션                                        │ │
│ │                                                       │ │
│ │ ☐ DROP 문 포함 (기존 객체 삭제)                     │ │
│ │ ☑ MS_Description 주석 포함 (권장)                   │ │
│ │ ☑ 인덱스 생성문 포함                                │ │
│ │ ☑ 제약조건 포함 (PK, DEFAULT 등)                    │ │
│ │                                                       │ │
│ │ [SQL 생성]                                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ SQL 스크립트 미리보기                          150 줄    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ CREATE TABLE USER (                                  │ │
│ │   USER_ID BIGINT IDENTITY(1,1) NOT NULL,            │ │
│ │   USER_NAME NVARCHAR(100) NOT NULL,                 │ │
│ │   ...                                                │ │
│ │ );                                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ DB 스키마 가이드 준수 확인                           │ │
│ │ ✓ 모든 객체명 대문자 사용                           │ │
│ │ ✓ MS_Description으로 한글 설명 등록                │ │
│ │ ✓ 시스템 속성 컬럼 포함 (REG_ID, REG_DT...)        │ │
│ │ ✓ 명명 규칙 준수 (PK__, CIDX__, IDX__)             │ │
│ │ ✓ REG_DT DEFAULT GETDATE() 제약조건                │ │
│ │ ✓ 테이블 생성 → 인덱스 → 제약조건 → Description    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                [닫기] [클립보드 복사] [.sql 파일 다운로드] │
└─────────────────────────────────────────────────────────┘
```

## 상태별 UI

### 초기 상태 (SQL 미생성)
- 내보내기 옵션만 표시
- "SQL 생성" 버튼 활성화
- "클립보드 복사", ".sql 파일 다운로드" 버튼 비활성화

### SQL 생성 중
- "SQL 생성" 버튼에 스피너 표시
- 버튼 텍스트: "SQL 생성 중..."
- 모든 버튼 비활성화

### SQL 생성 완료
- SQL 미리보기 표시
- DB 스키마 가이드 준수 확인 표시
- "클립보드 복사", ".sql 파일 다운로드" 버튼 활성화

### 복사 중
- "클립보드 복사" 버튼에 스피너 표시
- 버튼 텍스트: "복사 중..."

### 다운로드 중
- ".sql 파일 다운로드" 버튼에 스피너 표시
- 버튼 텍스트: "다운로드 중..."

## 토스트 메시지

### 성공 메시지
- **SQL 생성 완료**: "SQL 스크립트가 생성되었습니다"
- **복사 완료**: "SQL 스크립트가 클립보드에 복사되었습니다"
- **다운로드 완료**: "SQL 파일이 다운로드되었습니다"

### 에러 메시지
- **SQL 생성 실패**: "SQL 스크립트 생성 중 오류가 발생했습니다"
- **복사 실패**: "클립보드 복사 중 오류가 발생했습니다"
- **다운로드 실패**: "파일 다운로드 중 오류가 발생했습니다"
- **SQL 미생성**: "먼저 SQL을 생성해주세요"

## 키보드 단축키

- **Tab**: 다음 요소로 이동
- **Shift + Tab**: 이전 요소로 이동
- **Enter**: 포커스된 버튼 클릭
- **Esc**: 다이얼로그 닫기
- **Space**: 체크박스 토글

## 접근성 (ARIA)

```tsx
// 버튼
<Button aria-label="SQL 스크립트 생성">SQL 생성</Button>
<Button aria-label="SQL 스크립트를 클립보드에 복사">클립보드 복사</Button>
<Button aria-label="SQL 스크립트를 파일로 다운로드">.sql 파일 다운로드</Button>

// 체크박스
<Checkbox id="includeDropStatements" aria-describedby="drop-desc" />
<Label htmlFor="includeDropStatements">DROP 문 포함</Label>

// 다이얼로그
<Dialog aria-labelledby="dialog-title" aria-describedby="dialog-description">
  <DialogTitle id="dialog-title">SQL 스키마 내보내기</DialogTitle>
  <DialogDescription id="dialog-description">
    프로젝트의 데이터베이스 스키마를 MSSQL DDL 스크립트로 내보냅니다
  </DialogDescription>
</Dialog>
```

## 반응형 디자인

### 데스크톱 (1024px+)
- 다이얼로그 너비: 최대 4xl (896px)
- 다이얼로그 높이: 최대 90vh
- SQL 미리보기 높이: 최대 384px (24rem)

### 태블릿 (768px - 1023px)
- 다이얼로그 너비: 화면의 90%
- 버튼 크기 유지

### 모바일 (< 768px)
- 다이얼로그 너비: 화면의 95%
- 버튼 전체 너비
- 폰트 크기 조정

## 성능 고려사항

### 메모리 관리
```tsx
// URL 객체 정리
URL.revokeObjectURL(url);
```

### 불필요한 렌더링 방지
```tsx
// 옵션 변경 시 SQL 초기화
const handleOptionChange = (key, value) => {
  setOptions(prev => ({ ...prev, [key]: value }));
  setSqlScript(''); // 기존 SQL 초기화
};
```

### 비동기 작업 중복 방지
```tsx
// 로딩 중 버튼 비활성화
<Button disabled={isGenerating || !sqlScript}>
  클립보드 복사
</Button>
```

## 문제 해결

### SQL이 생성되지 않음
1. 백엔드 API가 실행 중인지 확인
2. 프로젝트에 테이블이 있는지 확인
3. 네트워크 연결 확인
4. 브라우저 콘솔에서 에러 확인

### 클립보드 복사가 작동하지 않음
1. HTTPS 환경인지 확인 (localhost는 예외)
2. 브라우저 권한 확인
3. 브라우저 호환성 확인 (최신 브라우저 권장)

### 파일 다운로드가 작동하지 않음
1. 브라우저 팝업 차단 확인
2. 다운로드 폴더 권한 확인
3. 디스크 공간 확인

## 브라우저 호환성

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 추가 리소스

- [shadcn/ui Dialog 문서](https://ui.shadcn.com/docs/components/dialog)
- [Clipboard API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [Blob API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
