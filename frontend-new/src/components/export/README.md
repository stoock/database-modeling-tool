# Export Components

SQL 스키마 내보내기 기능을 제공하는 컴포넌트입니다.

## ExportDialog

프로젝트의 데이터베이스 스키마를 MSSQL DDL 스크립트로 내보내는 다이얼로그 컴포넌트입니다.

### 주요 기능

1. **내보내기 옵션 선택**
   - DROP 문 포함 여부
   - MS_Description 주석 포함 여부
   - 인덱스 생성문 포함 여부
   - 제약조건 포함 여부

2. **SQL 스크립트 생성**
   - 백엔드 API를 호출하여 MSSQL DDL 생성
   - 실시간 미리보기 제공
   - 구문 강조 표시

3. **다운로드 및 복사**
   - .sql 파일로 다운로드
   - 클립보드에 복사

4. **DB 스키마 가이드 준수 확인**
   - 대문자 사용
   - MS_Description 등록
   - 시스템 속성 컬럼 포함
   - 명명 규칙 준수
   - 올바른 DDL 순서

### Props

```typescript
interface ExportDialogProps {
  projectId: string;        // 프로젝트 ID
  projectName: string;      // 프로젝트 이름 (파일명에 사용)
  open: boolean;            // 다이얼로그 열림 상태
  onOpenChange: (open: boolean) => void;  // 상태 변경 핸들러
}
```

### 사용 예시

```tsx
import { useState } from 'react';
import { ExportDialog } from '@/components/export';
import { Button } from '@/components/ui/button';

function MyComponent() {
  const [exportOpen, setExportOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setExportOpen(true)}>
        스키마 내보내기
      </Button>
      
      <ExportDialog
        projectId="project-123"
        projectName="My Project"
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
    </>
  );
}
```

### 생성되는 SQL 스크립트 형식

```sql
-- DROP 문 (옵션)
IF OBJECT_ID('USER', 'U') IS NOT NULL DROP TABLE USER;

-- 테이블 생성
CREATE TABLE USER (
  USER_ID BIGINT IDENTITY(1,1) NOT NULL,
  USER_NAME NVARCHAR(100) NOT NULL,
  EMAIL VARCHAR(255) NOT NULL,
  REG_ID VARCHAR(25) NOT NULL,
  REG_DT DATETIME NOT NULL DEFAULT GETDATE(),
  CHG_ID VARCHAR(25) NULL,
  CHG_DT DATETIME NULL,
  CONSTRAINT PK__USER__USER_ID PRIMARY KEY CLUSTERED (USER_ID)
);

-- 인덱스 생성 (옵션)
CREATE NONCLUSTERED INDEX IDX__USER__EMAIL ON USER (EMAIL ASC);

-- MS_Description 등록 (옵션)
EXEC sys.sp_addextendedproperty 
  @name = N'MS_Description',
  @value = N'사용자 || 시스템 사용자 정보',
  @level0type = N'SCHEMA', @level0name = N'dbo',
  @level1type = N'TABLE', @level1name = N'USER';

EXEC sys.sp_addextendedproperty 
  @name = N'MS_Description',
  @value = N'사용자ID',
  @level0type = N'SCHEMA', @level0name = N'dbo',
  @level1type = N'TABLE', @level1name = N'USER',
  @level2type = N'COLUMN', @level2name = N'USER_ID';
```

### DB 스키마 가이드 준수 사항

생성된 SQL 스크립트는 다음 규칙을 준수합니다:

1. **대문자 사용**: 모든 테이블명, 컬럼명, 인덱스명은 대문자
2. **MS_Description**: 한글 설명을 sys.sp_addextendedproperty로 등록
3. **시스템 속성**: REG_ID, REG_DT, CHG_ID, CHG_DT 포함
4. **DEFAULT 제약조건**: REG_DT에 GETDATE() 기본값
5. **명명 규칙**:
   - PK: `PK__{테이블명}__{컬럼명}`
   - Clustered Index: `CIDX__{테이블명}__{컬럼명}`
   - Index: `IDX__{테이블명}__{컬럼명}`
6. **DDL 순서**: 테이블 생성 → 인덱스 → 제약조건 → Description

### API 엔드포인트

```
POST /api/projects/{projectId}/export/sql
```

**Request Body:**
```json
{
  "includeDropStatements": false,
  "includeComments": true,
  "includeIndexes": true,
  "includeConstraints": true
}
```

**Response:**
```json
{
  "sql": "CREATE TABLE ...",
  "format": "SQL",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 에러 처리

- API 호출 실패 시 토스트 메시지로 에러 표시
- 클립보드 복사 실패 시 에러 메시지 표시
- 파일 다운로드 실패 시 에러 메시지 표시

### 접근성

- 키보드 네비게이션 지원 (Tab, Enter, Esc)
- ARIA 레이블 적용
- 스크린 리더 호환

### 스타일링

- Tailwind CSS 사용
- shadcn/ui 컴포넌트 활용
- 반응형 디자인 (모바일/데스크톱)
- 다크 모드 지원 (SQL 미리보기)

### 성능 최적화

- 옵션 변경 시 기존 SQL 초기화로 불필요한 렌더링 방지
- 로딩 상태 표시로 사용자 피드백 제공
- 비동기 작업 중 버튼 비활성화로 중복 요청 방지
