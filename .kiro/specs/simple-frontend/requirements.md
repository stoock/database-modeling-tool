# Requirements Document

## Introduction

기존 백엔드 API를 활용하여 MSSQL 데이터베이스 모델링 도구의 필수 기능만을 제공하는 심플한 프론트엔드를 개발합니다. 복잡한 시각화나 고급 기능을 배제하고, 테이블과 컬럼 관리, 스키마 내보내기 등 핵심 기능에 집중합니다.

## Glossary

- **Frontend**: React 19 + TypeScript 기반의 웹 애플리케이션
- **Backend API**: 이미 구현된 Spring Boot REST API 서버
- **Project**: 데이터베이스 모델링 작업의 최상위 단위
- **Table**: 데이터베이스 테이블 정의
- **Column**: 테이블의 컬럼 정의
- **Index**: 테이블의 인덱스 정의
- **Schema Export**: MSSQL DDL 스크립트 생성 및 다운로드

## Requirements

### Requirement 1: 프로젝트 관리

**User Story:** 사용자로서, 데이터베이스 모델링 프로젝트를 생성하고 관리할 수 있어야 한다.

#### Acceptance Criteria

1. WHEN 사용자가 애플리케이션에 접속하면, THE Frontend SHALL 프로젝트 목록 페이지를 표시한다
2. WHEN 사용자가 "새 프로젝트" 버튼을 클릭하면, THE Frontend SHALL 프로젝트 생성 폼을 표시한다
3. WHEN 사용자가 프로젝트 이름과 설명을 입력하고 저장하면, THE Frontend SHALL POST /api/v1/projects 엔드포인트를 호출하여 프로젝트를 생성한다
4. WHEN 프로젝트 생성이 성공하면, THE Frontend SHALL 생성된 프로젝트의 상세 페이지로 이동한다
5. WHEN 사용자가 프로젝트 목록에서 프로젝트를 선택하면, THE Frontend SHALL 해당 프로젝트의 테이블 목록을 표시한다

### Requirement 2: 테이블 관리

**User Story:** 사용자로서, 프로젝트 내에서 데이터베이스 테이블을 생성하고 편집할 수 있어야 한다.

#### Acceptance Criteria

1. WHEN 사용자가 프로젝트 상세 페이지에서 "테이블 추가" 버튼을 클릭하면, THE Frontend SHALL 테이블 생성 폼을 표시한다
2. WHEN 사용자가 테이블 이름과 설명을 입력하고 저장하면, THE Frontend SHALL POST /api/v1/projects/{projectId}/tables 엔드포인트를 호출한다
3. WHEN 테이블 생성이 성공하면, THE Frontend SHALL 테이블 목록을 갱신하고 생성된 테이블을 표시한다
4. WHEN 사용자가 테이블을 선택하면, THE Frontend SHALL 해당 테이블의 컬럼 목록을 표시한다
5. WHEN 사용자가 테이블 삭제 버튼을 클릭하면, THE Frontend SHALL 확인 다이얼로그를 표시하고 DELETE /api/v1/tables/{id} 엔드포인트를 호출한다

### Requirement 3: 컬럼 관리

**User Story:** 사용자로서, 테이블에 컬럼을 추가하고 MSSQL 데이터 타입을 설정할 수 있어야 한다.

#### Acceptance Criteria

1. WHEN 사용자가 테이블 상세 페이지에서 "컬럼 추가" 버튼을 클릭하면, THE Frontend SHALL 컬럼 생성 폼을 표시한다
2. WHEN 사용자가 컬럼 생성 폼을 작성하면, THE Frontend SHALL 컬럼명, 데이터 타입, NULL 허용 여부, 기본값, 설명 입력 필드를 제공한다
3. WHEN 사용자가 데이터 타입 선택 필드를 클릭하면, THE Frontend SHALL MSSQL 데이터 타입 목록(NVARCHAR, BIGINT, DATETIME2, DECIMAL 등)을 표시한다
4. WHEN 사용자가 컬럼 정보를 입력하고 저장하면, THE Frontend SHALL POST /api/v1/tables/{tableId}/columns 엔드포인트를 호출한다
5. WHEN 컬럼 생성이 성공하면, THE Frontend SHALL 컬럼 목록을 갱신하고 생성된 컬럼을 표시한다
6. WHEN 사용자가 기존 컬럼을 클릭하면, THE Frontend SHALL 컬럼 편집 폼을 표시한다
7. WHEN 사용자가 컬럼 정보를 수정하고 저장하면, THE Frontend SHALL PUT /api/v1/columns/{id} 엔드포인트를 호출한다

### Requirement 4: 인덱스 관리

**User Story:** 사용자로서, 테이블에 인덱스를 추가하고 관리할 수 있어야 한다.

#### Acceptance Criteria

1. WHEN 사용자가 테이블 상세 페이지에서 "인덱스" 탭을 클릭하면, THE Frontend SHALL 해당 테이블의 인덱스 목록을 표시한다
2. WHEN 사용자가 "인덱스 추가" 버튼을 클릭하면, THE Frontend SHALL 인덱스 생성 폼을 표시한다
3. WHEN 사용자가 인덱스 생성 폼을 작성하면, THE Frontend SHALL 인덱스명, 타입(CLUSTERED/NONCLUSTERED), UNIQUE 여부, 컬럼 선택 필드를 제공한다
4. WHEN 사용자가 인덱스 정보를 입력하고 저장하면, THE Frontend SHALL POST /api/v1/tables/{tableId}/indexes 엔드포인트를 호출한다
5. WHEN 사용자가 인덱스 삭제 버튼을 클릭하면, THE Frontend SHALL DELETE /api/v1/indexes/{id} 엔드포인트를 호출한다

### Requirement 5: 스키마 내보내기

**User Story:** 사용자로서, 설계한 데이터베이스 스키마를 MSSQL DDL 스크립트로 내보낼 수 있어야 한다.

#### Acceptance Criteria

1. WHEN 사용자가 프로젝트 상세 페이지에서 "스키마 내보내기" 버튼을 클릭하면, THE Frontend SHALL 내보내기 옵션 다이얼로그를 표시한다
2. WHEN 사용자가 "미리보기" 버튼을 클릭하면, THE Frontend SHALL POST /api/v1/projects/{projectId}/export/preview 엔드포인트를 호출하고 SQL 스크립트를 표시한다
3. WHEN 사용자가 "다운로드" 버튼을 클릭하면, THE Frontend SHALL POST /api/v1/projects/{projectId}/export/download 엔드포인트를 호출하고 파일을 다운로드한다
4. WHEN 내보내기 형식 선택 필드가 표시되면, THE Frontend SHALL SQL, MARKDOWN, HTML, JSON, CSV 옵션을 제공한다
5. WHEN 사용자가 검증 포함 옵션을 선택하면, THE Frontend SHALL includeValidation 파라미터를 true로 설정하여 요청한다

### Requirement 6: 네이밍 규칙 검증

**User Story:** 사용자로서, 테이블과 컬럼 이름이 프로젝트의 네이밍 규칙을 준수하는지 확인할 수 있어야 한다.

#### Acceptance Criteria

1. WHEN 사용자가 테이블 또는 컬럼 이름을 입력하면, THE Frontend SHALL 입력 필드에서 포커스가 벗어날 때 POST /api/v1/projects/{projectId}/validation 엔드포인트를 호출한다
2. WHEN 네이밍 규칙 위반이 발견되면, THE Frontend SHALL 입력 필드 아래에 빨간색 오류 메시지를 표시한다
3. WHEN 네이밍 규칙을 준수하면, THE Frontend SHALL 입력 필드 아래에 초록색 체크 표시를 표시한다
4. WHEN 검증 결과에 제안 사항이 포함되면, THE Frontend SHALL 제안된 이름을 표시하고 적용 버튼을 제공한다
5. WHEN 사용자가 "프로젝트 전체 검증" 버튼을 클릭하면, THE Frontend SHALL POST /api/v1/projects/{projectId}/validation/all 엔드포인트를 호출하고 검증 결과를 표시한다

### Requirement 7: 사용자 인터페이스

**User Story:** 사용자로서, 직관적이고 반응형인 인터페이스를 통해 편리하게 작업할 수 있어야 한다.

#### Acceptance Criteria

1. THE Frontend SHALL Tailwind CSS를 사용하여 일관된 디자인을 제공한다
2. THE Frontend SHALL 모바일, 태블릿, 데스크톱 화면 크기에 반응하는 레이아웃을 제공한다
3. WHEN API 요청이 진행 중이면, THE Frontend SHALL 로딩 인디케이터를 표시한다
4. WHEN API 요청이 실패하면, THE Frontend SHALL 사용자에게 이해하기 쉬운 오류 메시지를 표시한다
5. WHEN 사용자가 데이터를 수정하면, THE Frontend SHALL 변경 사항을 즉시 화면에 반영한다

### Requirement 8: 상태 관리

**User Story:** 개발자로서, 애플리케이션 상태를 효율적으로 관리할 수 있어야 한다.

#### Acceptance Criteria

1. THE Frontend SHALL Zustand를 사용하여 전역 상태를 관리한다
2. THE Frontend SHALL 프로젝트, 테이블, 컬럼 데이터를 별도의 스토어로 분리하여 관리한다
3. WHEN API 응답을 받으면, THE Frontend SHALL 스토어를 업데이트하고 관련 컴포넌트를 리렌더링한다
4. THE Frontend SHALL API 호출 로직을 services 디렉토리에 분리하여 관리한다
5. THE Frontend SHALL TypeScript 타입 정의를 types 디렉토리에 분리하여 관리한다
