# Requirements Document

## Introduction

기존 frontend 폴더는 유지하고, 새로운 frontend-new 폴더에 백엔드 API를 활용하여 핵심 기능만 포함한 간소화된 MSSQL 데이터베이스 모델링 도구 프론트엔드를 새로 구축합니다. React 19 + TypeScript + Tailwind CSS + shadcn/ui 기반으로 직관적이고 빠른 사용자 경험을 제공하며, 명명 규칙 검증을 통해 데이터베이스 설계 품질을 보장합니다.

## Glossary

- **System**: 새로운 간소화 프론트엔드 애플리케이션
- **User**: 데이터베이스 설계자 또는 개발자
- **Project**: 데이터베이스 모델링 작업 단위
- **Table**: 데이터베이스 테이블 정의
- **Column**: 테이블의 컬럼 정의 (MSSQL 데이터 타입 포함)
- **Index**: 테이블 인덱스 정의 (클러스터드/논클러스터드)
- **Naming Rule**: 테이블/컬럼 명명 규칙 (PascalCase, snake_case 등)
- **Validation Feedback**: 명명 규칙 위반 시 실시간 피드백
- **DDL Script**: SQL 데이터 정의 언어 스크립트
- **Backend API**: 기존 Spring Boot 백엔드 REST API
- **shadcn/ui**: Radix UI 기반의 재사용 가능한 컴포넌트 라이브러리

## Requirements

### Requirement 1: 프로젝트 관리

**User Story:** 데이터베이스 설계자로서, 여러 데이터베이스 모델링 프로젝트를 생성하고 관리하여 작업을 체계적으로 구성하고 싶습니다.

#### Acceptance Criteria

1. WHEN User가 프로젝트 생성 버튼을 클릭하면, THE System SHALL 프로젝트 이름과 설명을 입력받는 모달을 표시한다
2. WHEN User가 유효한 프로젝트 정보를 제출하면, THE System SHALL Backend API를 호출하여 프로젝트를 생성하고 성공 메시지를 표시한다
3. THE System SHALL 모든 프로젝트 목록을 카드 형태로 표시하고 각 프로젝트의 이름, 설명, 생성일을 보여준다
4. WHEN User가 프로젝트를 선택하면, THE System SHALL 해당 프로젝트의 상세 화면으로 이동하고 테이블 목록을 로드한다
5. WHEN User가 프로젝트 삭제 버튼을 클릭하면, THE System SHALL 확인 다이얼로그를 표시하고 확인 시 Backend API를 호출하여 프로젝트를 삭제한다

### Requirement 2: 테이블 설계

**User Story:** 데이터베이스 설계자로서, 프로젝트 내에서 테이블을 생성하고 관리하여 데이터베이스 구조를 정의하고 싶습니다.

#### Acceptance Criteria

1. WHEN User가 프로젝트를 선택하면, THE System SHALL 해당 프로젝트의 모든 테이블을 목록 형태로 표시한다
2. WHEN User가 테이블 추가 버튼을 클릭하면, THE System SHALL 테이블 이름과 Description을 입력받는 폼을 표시한다
3. WHEN User가 테이블 이름을 입력하면, THE System SHALL 대문자 형식을 실시간으로 검증하고 위반 시 경고 메시지를 표시한다
4. WHEN User가 Description을 입력하면, THE System SHALL 테이블명 복사 여부를 검증하고 경고한다
5. WHEN User가 유효한 테이블 정보를 제출하면, THE System SHALL Backend API를 호출하여 테이블을 생성하고 테이블 목록을 갱신한다
6. WHEN User가 테이블을 선택하면, THE System SHALL 해당 테이블의 컬럼 목록을 표시한다
7. WHEN User가 테이블 삭제 버튼을 클릭하면, THE System SHALL 확인 다이얼로그를 표시하고 확인 시 Backend API를 호출하여 테이블을 삭제한다

### Requirement 3: 컬럼 관리

**User Story:** 데이터베이스 설계자로서, 테이블에 컬럼을 추가하고 MSSQL 데이터 타입을 설정하여 상세한 테이블 구조를 정의하고 싶습니다.

#### Acceptance Criteria

1. WHEN User가 테이블을 선택하면, THE System SHALL 해당 테이블의 모든 컬럼을 순서대로 표시한다
2. WHEN User가 컬럼 추가 버튼을 클릭하면, THE System SHALL 컬럼 이름, Description, 데이터 타입, 제약조건을 입력받는 폼을 표시한다
3. THE System SHALL 27개의 MSSQL 데이터 타입을 선택 가능하도록 제공한다
4. WHEN User가 VARCHAR 또는 NVARCHAR 타입을 선택하면, THE System SHALL 길이 입력 필드를 필수로 표시한다
5. WHEN User가 DECIMAL 또는 NUMERIC 타입을 선택하면, THE System SHALL 정밀도와 스케일 입력 필드를 필수로 표시한다
6. WHEN User가 정수형 타입을 선택하면, THE System SHALL IDENTITY 옵션을 선택 가능하도록 제공한다
7. WHEN User가 컬럼 이름을 입력하면, THE System SHALL 대문자 형식을 실시간으로 검증하고 위반 시 경고 메시지를 표시한다
8. WHEN User가 PK 컬럼을 생성하면, THE System SHALL 테이블명 포함 여부를 검증하고 단독명칭 사용 시 경고한다
9. WHEN User가 Description을 입력하면, THE System SHALL 한글명 또는 한글명과 상세설명 형식을 권장한다
10. THE System SHALL 테이블 생성 시 시스템 속성 컬럼 자동 추가 옵션을 제공한다
11. WHEN User가 유효한 컬럼 정보를 제출하면, THE System SHALL Backend API를 호출하여 컬럼을 생성하고 컬럼 목록을 갱신한다
12. WHEN User가 컬럼을 선택하면, THE System SHALL 컬럼 정보를 수정할 수 있는 폼을 표시한다
13. WHEN User가 컬럼 삭제 버튼을 클릭하면, THE System SHALL 확인 다이얼로그를 표시하고 확인 시 Backend API를 호출하여 컬럼을 삭제한다
14. THE System SHALL 컬럼의 순서를 드래그 앤 드롭으로 변경할 수 있도록 지원한다

### Requirement 4: 인덱스 관리

**User Story:** 데이터베이스 설계자로서, 테이블에 인덱스를 추가하고 관리하여 쿼리 성능을 최적화하고 싶습니다.

#### Acceptance Criteria

1. WHEN User가 테이블을 선택하면, THE System SHALL 해당 테이블의 모든 인덱스를 목록으로 표시한다
2. WHEN User가 인덱스 추가 버튼을 클릭하면, THE System SHALL 인덱스 이름, 타입, 컬럼 선택을 입력받는 폼을 표시한다
3. THE System SHALL 클러스터드와 논클러스터드 인덱스 타입을 선택 가능하도록 제공한다
4. THE System SHALL 복합 인덱스를 위해 여러 컬럼을 선택할 수 있도록 지원한다
5. THE System SHALL 선택한 타입과 컬럼에 따라 인덱스명을 자동으로 제안한다
6. THE System SHALL 인덱스명이 명명 규칙을 준수하는지 검증한다
7. WHEN User가 유효한 인덱스 정보를 제출하면, THE System SHALL Backend API를 호출하여 인덱스를 생성하고 인덱스 목록을 갱신한다
8. WHEN User가 인덱스 삭제 버튼을 클릭하면, THE System SHALL 확인 다이얼로그를 표시하고 확인 시 Backend API를 호출하여 인덱스를 삭제한다

### Requirement 5: 명명 규칙 검증

**User Story:** 데이터베이스 설계자로서, 테이블과 컬럼 이름이 DB 스키마 가이드의 명명 규칙을 준수하는지 실시간으로 확인하여 일관되고 표준화된 데이터베이스 설계를 유지하고 싶습니다.

#### Acceptance Criteria

1. THE System SHALL 테이블 이름은 대문자 형식을 따르는지 검증한다
2. THE System SHALL 컬럼 이름은 대문자 형식을 따르는지 검증한다
3. THE System SHALL PK 컬럼은 테이블명과 컬럼명 조합을 포함하는지 검증한다
4. THE System SHALL 단독명칭 사용을 금지한다
5. THE System SHALL 테이블 Description이 필수이며 테이블명 복사가 아닌지 검증한다
6. THE System SHALL 컬럼 Description이 필수이며 한글명 또는 한글명과 상세설명 형식인지 검증한다
7. THE System SHALL 인덱스명이 명명 규칙을 준수하는지 검증한다
8. THE System SHALL VARCHAR와 NVARCHAR 타입에 길이가 지정되었는지 검증한다
9. THE System SHALL DECIMAL과 NUMERIC 타입에 precision과 scale이 지정되었는지 검증한다
10. THE System SHALL 시스템 속성 컬럼이 포함되었는지 검증한다
11. WHEN User가 테이블 또는 컬럼 이름을 입력하면, THE System SHALL 500밀리초 디바운스 후 명명 규칙을 검증한다
12. WHEN 명명 규칙 위반이 감지되면, THE System SHALL 입력 필드 아래에 빨간색 경고 메시지를 표시한다
13. WHEN 명명 규칙을 준수하면, THE System SHALL 입력 필드 아래에 초록색 확인 메시지를 표시한다
14. THE System SHALL 명명 규칙 위반 시 올바른 형식의 예시를 제공한다
15. THE System SHALL 프로젝트 전체의 명명 규칙 준수율을 대시보드에 표시한다
16. WHEN User가 검증 결과를 클릭하면, THE System SHALL 해당 테이블 또는 컬럼으로 이동한다

### Requirement 6: SQL 스키마 내보내기

**User Story:** 데이터베이스 설계자로서, 설계한 데이터베이스 스키마를 DB 스키마 가이드를 준수하는 MSSQL DDL 스크립트로 내보내어 실제 데이터베이스에 적용하고 싶습니다.

#### Acceptance Criteria

1. WHEN User가 프로젝트를 선택하면, THE System SHALL 스키마 내보내기 버튼을 표시한다
2. WHEN User가 스키마 내보내기 버튼을 클릭하면, THE System SHALL Backend API를 호출하여 MSSQL DDL 스크립트를 생성한다
3. THE System SHALL 생성된 DDL 스크립트를 구문 강조와 함께 미리보기로 표시한다
4. THE System SHALL 모든 객체명을 대문자로 생성한다
5. THE System SHALL 테이블과 컬럼의 Description을 sys.sp_addextendedproperty로 등록한다
6. THE System SHALL 시스템 속성 컬럼을 포함한다
7. THE System SHALL REG_DT에 DEFAULT GETDATE 제약조건을 추가한다
8. THE System SHALL PK 제약조건명을 명명 규칙에 따라 생성한다
9. THE System SHALL 인덱스명을 명명 규칙에 따라 생성한다
10. THE System SHALL 테이블 생성, 인덱스 생성, 제약조건 추가, Description 등록 순서로 DDL을 생성한다
11. WHEN User가 다운로드 버튼을 클릭하면, THE System SHALL DDL 스크립트를 .sql 파일로 다운로드한다
12. WHEN User가 클립보드 복사 버튼을 클릭하면, THE System SHALL DDL 스크립트를 클립보드에 복사하고 성공 메시지를 표시한다

### Requirement 7: 사용자 인터페이스

**User Story:** 데이터베이스 설계자로서, 직관적이고 반응성 있는 인터페이스를 통해 빠르게 작업하고 싶습니다.

#### Acceptance Criteria

1. THE System SHALL shadcn/ui 컴포넌트를 사용하여 일관된 디자인 시스템을 적용한다
2. THE System SHALL Tailwind CSS를 사용하여 스타일링을 구현한다
3. THE System SHALL 모든 API 호출 중 로딩 스피너를 표시한다
4. WHEN API 호출이 실패하면, THE System SHALL shadcn/ui Toast 컴포넌트로 에러를 표시한다
5. WHEN API 호출이 성공하면, THE System SHALL shadcn/ui Toast 컴포넌트로 성공을 표시한다
6. THE System SHALL shadcn/ui Dialog 컴포넌트를 사용하여 모달을 구현한다
7. THE System SHALL shadcn/ui Button, Input, Select 컴포넌트를 사용하여 폼을 구성한다
8. THE System SHALL 모바일과 데스크톱 화면 크기에 반응하는 레이아웃을 제공한다
9. THE System SHALL 키보드 단축키를 지원하여 마우스 없이 작업할 수 있도록 한다
10. THE System SHALL ARIA 레이블을 사용하여 접근성을 보장한다
11. THE System SHALL 모든 폼 입력에 대해 클라이언트 측 검증을 수행한다

### Requirement 8: 상태 관리 및 성능

**User Story:** 개발자로서, 효율적인 상태 관리와 최적화된 성능을 통해 원활한 사용자 경험을 제공하고 싶습니다.

#### Acceptance Criteria

1. THE System SHALL Zustand를 사용하여 전역 상태를 관리한다
2. THE System SHALL 프로젝트, 테이블, 컬럼 데이터를 별도의 스토어로 분리한다
3. THE System SHALL React.memo를 사용하여 불필요한 리렌더링을 방지한다
4. THE System SHALL API 응답을 캐싱하여 중복 요청을 최소화한다
5. THE System SHALL 디바운싱을 사용하여 실시간 검증의 API 호출을 최적화한다
6. WHEN 대량의 컬럼이 있을 때, THE System SHALL 가상 스크롤링을 사용하여 렌더링 성능을 유지한다
7. THE System SHALL 코드 스플리팅을 적용하여 초기 로딩 시간을 단축한다
