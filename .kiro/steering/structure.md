# 프로젝트 구조

## 루트 디렉토리 구조
```
database-modeling-tool/
├── frontend/                    # React 애플리케이션
├── backend/                     # Spring Boot 애플리케이션
├── docs/                        # 프로젝트 문서
├── docker/                      # Docker 설정
└── .kiro/                       # Kiro IDE 설정
    ├── specs/                   # 기능 명세서
    └── steering/                # AI 어시스턴트 가이드
```

## 프론트엔드 구조 (React + TypeScript)
```
frontend/src/
├── pages/
│   ├── SimpleDashboard.tsx      # 간소화 원페이지 대시보드 (메인)
│   └── SchemaExportPage.tsx     # 스키마 내보내기 전용 페이지
├── components/
│   ├── Simple/                  # 간소화 버전 컴포넌트 (주요 사용)
│   │   ├── ProjectSection.tsx   # 프로젝트 관리 (헤더 통합)
│   │   ├── TableSection.tsx     # 테이블 관리 (수평 스크롤)
│   │   ├── ColumnEditor.tsx     # ERD 스타일 컬럼 편집기 (20-column)
│   │   ├── ValidationSection.tsx # 검증 결과 표시
│   │   └── ExportSection.tsx    # 스키마 내보내기
│   ├── TableDesigner/           # 메인 디자인 캔버스 컴포넌트
│   │   ├── TableCanvas.tsx      # React Flow 캔버스
│   │   ├── TableNode.tsx        # 개별 테이블 노드
│   │   ├── TableEditModal.tsx   # 테이블 편집 모달
│   │   ├── ColumnAddModal.tsx   # 컬럼 추가 모달
│   │   ├── ColumnEditModal.tsx  # 컬럼 편집 모달
│   │   └── RelationshipLine.tsx # 테이블 관계선
│   ├── ColumnEditor/            # 컬럼 관리
│   │   ├── ColumnList.tsx       # 컬럼 목록
│   │   ├── ColumnForm.tsx       # 컬럼 편집 폼
│   │   ├── ColumnManager.tsx    # 컬럼 관리자
│   │   └── DataTypeSelector.tsx # MSSQL 데이터 타입 선택기
│   ├── IndexManager/            # 인덱스 관리
│   │   ├── IndexList.tsx        # 인덱스 목록
│   │   ├── IndexForm.tsx        # 인덱스 생성/편집
│   │   ├── IndexPerformancePanel.tsx # 성능 분석
│   │   └── IndexSqlPreview.tsx  # SQL 미리보기
│   ├── ValidationPanel/         # 명명 규칙 및 검증
│   │   ├── NamingRules.tsx      # 규칙 설정
│   │   ├── NamingRulesPanel.tsx # 규칙 패널
│   │   ├── ValidationResults.tsx # 검증 피드백
│   │   ├── ValidationDashboard.tsx # 검증 대시보드
│   │   └── ValidationGuide.tsx  # 검증 가이드
│   ├── SchemaExport/            # SQL 생성 및 내보내기
│   │   ├── SqlPreview.tsx       # SQL 스크립트 미리보기
│   │   ├── ExportOptions.tsx    # 내보내기 설정
│   │   ├── ExportHistory.tsx    # 내보내기 히스토리
│   │   ├── SchemaDocumentation.tsx # 스키마 문서화
│   │   └── SchemaExportPanel.tsx # 내보내기 패널
│   ├── ProjectManager/          # 프로젝트 관리
│   │   ├── ProjectList.tsx      # 프로젝트 목록
│   │   ├── ProjectSelector.tsx  # 프로젝트 선택기
│   │   ├── ProjectCreateModal.tsx # 프로젝트 생성 모달
│   │   └── ProjectMetadata.tsx  # 프로젝트 메타데이터
│   ├── Dashboard/               # 대시보드 컴포넌트
│   │   ├── DashboardLayout.tsx  # 레이아웃
│   │   ├── DashboardHeader.tsx  # 헤더
│   │   ├── DashboardMain.tsx    # 메인
│   │   └── WelcomeScreen.tsx    # 환영 화면
│   ├── ChangeTracker/           # 변경사항 추적
│   │   ├── ChangeIndicator.tsx  # 변경 표시
│   │   ├── AutoSaveSettings.tsx # 자동 저장 설정
│   │   ├── SaveFeedback.tsx     # 저장 피드백
│   │   └── UnsavedChangesDialog.tsx # 미저장 경고
│   └── common/                  # 공통 컴포넌트
│       ├── Button.tsx           # 버튼
│       ├── Input.tsx            # 입력
│       ├── Select.tsx           # 선택
│       ├── Modal.tsx            # 모달
│       ├── Toast.tsx            # 토스트
│       ├── LoadingSpinner.tsx   # 로딩
│       └── ErrorMessage.tsx     # 에러 메시지
├── services/
│   ├── api.ts                   # API 클라이언트
│   ├── cachedApi.ts             # 캐시된 API 클라이언트
│   ├── validation.ts            # 클라이언트 측 검증
│   └── sqlGenerator.ts          # SQL 생성 유틸리티
├── stores/                      # Zustand 상태 관리
│   ├── projectStore.ts          # 프로젝트 상태
│   ├── tableStore.ts            # 테이블 상태
│   ├── validationStore.ts       # 검증 상태
│   └── toastStore.ts            # 토스트 상태
├── hooks/                       # 커스텀 훅
│   ├── useAutoSave.ts           # 자동 저장
│   ├── useDebounce.ts           # 디바운스
│   ├── useKeyboardShortcuts.ts  # 키보드 단축키
│   ├── useRealTimeValidation.ts # 실시간 검증
│   └── useUnsavedChanges.ts     # 미저장 변경사항
├── types/                       # TypeScript 타입 정의
│   └── index.ts                 # 통합 타입 정의
├── utils/                       # 유틸리티 함수
│   ├── columnValidation.ts      # 컬럼 검증
│   ├── indexUtils.ts            # 인덱스 유틸
│   ├── changeTracker.ts         # 변경 추적
│   └── exportHistory.ts         # 내보내기 히스토리
└── e2e/                         # E2E 테스트
    ├── full-workflow.spec.ts    # 전체 워크플로우
    ├── project-management.spec.ts # 프로젝트 관리
    ├── table-designer.spec.ts   # 테이블 디자이너
    ├── schema-export.spec.ts    # 스키마 내보내기
    └── validation.spec.ts       # 검증
```

## 백엔드 구조 (클린 아키텍처)
```
backend/src/main/java/com/dbmodeling/
├── presentation/                # 프레젠테이션 계층
│   ├── controller/              # REST API 컨트롤러
│   │   ├── ProjectController.java      # 프로젝트 CRUD
│   │   ├── TableController.java        # 테이블 CRUD
│   │   ├── ColumnController.java       # 컬럼 CRUD
│   │   ├── IndexController.java        # 인덱스 CRUD
│   │   ├── ValidationController.java   # 검증 API
│   │   ├── ExportController.java       # 스키마 내보내기
│   │   ├── HealthController.java       # 헬스 체크
│   │   ├── PerformanceController.java  # 성능 모니터링
│   │   └── BaseController.java         # 공통 컨트롤러
│   ├── dto/                     # 데이터 전송 객체
│   │   ├── request/             # 요청 DTO
│   │   └── response/            # 응답 DTO
│   ├── mapper/                  # DTO-Domain 매퍼
│   │   ├── ProjectMapper.java
│   │   ├── TableMapper.java
│   │   └── ColumnMapper.java
│   └── exception/               # 예외 처리
│       ├── GlobalExceptionHandler.java
│       ├── BusinessException.java
│       └── ResourceNotFoundException.java
├── application/                 # 애플리케이션 계층
│   ├── service/                 # 애플리케이션 서비스
│   │   ├── ProjectService.java         # 프로젝트 비즈니스 로직
│   │   ├── TableService.java           # 테이블 비즈니스 로직
│   │   ├── ColumnService.java          # 컬럼 비즈니스 로직
│   │   ├── IndexService.java           # 인덱스 비즈니스 로직
│   │   ├── ValidationService.java      # 검증 비즈니스 로직
│   │   ├── ExportService.java          # 내보내기 비즈니스 로직
│   │   └── BatchProcessingService.java # 배치 처리
│   └── port/                    # 포트 인터페이스
│       ├── in/                  # 인바운드 포트 (유스케이스)
│       └── out/                 # 아웃바운드 포트 (리포지토리)
├── domain/                      # 도메인 계층
│   ├── model/                   # 도메인 모델
│   │   ├── Project.java                # 프로젝트 도메인
│   │   ├── Table.java                  # 테이블 도메인
│   │   ├── Column.java                 # 컬럼 도메인
│   │   ├── Index.java                  # 인덱스 도메인
│   │   ├── NamingRules.java            # 네이밍 규칙 도메인
│   │   ├── MSSQLDataType.java          # MSSQL 데이터 타입
│   │   └── SchemaGenerationOptions.java # 스키마 생성 옵션
│   ├── service/                 # 도메인 서비스
│   │   ├── SqlGeneratorService.java    # SQL 생성 서비스
│   │   ├── ValidationDomainService.java # 검증 도메인 서비스
│   │   └── SchemaExportService.java    # 스키마 내보내기 서비스
│   └── repository/              # 리포지토리 인터페이스
│       ├── ProjectRepository.java
│       ├── TableRepository.java
│       ├── ColumnRepository.java
│       └── IndexRepository.java
└── infrastructure/              # 인프라스트럭처 계층
    ├── persistence/             # 데이터 영속성
    │   ├── entity/              # JPA 엔티티
    │   │   ├── ProjectEntity.java
    │   │   ├── TableEntity.java
    │   │   ├── ColumnEntity.java
    │   │   └── IndexEntity.java
    │   ├── repository/          # JPA 리포지토리 구현
    │   │   ├── JpaProjectRepository.java
    │   │   ├── JpaTableRepository.java
    │   │   ├── JpaColumnRepository.java
    │   │   └── JpaIndexRepository.java
    │   └── mapper/              # 엔티티-도메인 매퍼
    │       ├── ProjectEntityMapper.java
    │       ├── TableEntityMapper.java
    │       └── ColumnEntityMapper.java
    ├── config/                  # 설정 클래스
    │   ├── DatabaseConfig.java             # 데이터베이스 설정
    │   ├── SwaggerConfig.java              # API 문서 설정
    │   ├── WebConfig.java                  # 웹 설정 (CORS 등)
    │   ├── JpaConfig.java                  # JPA 설정
    │   ├── CacheConfig.java                # 캐시 설정
    │   ├── PerformanceMonitoringConfig.java # 성능 모니터링
    │   ├── DatabaseOptimizationConfig.java  # DB 최적화
    │   └── DataInitializationConfig.java    # 초기 데이터
    └── external/                # 외부 통합
        └── mssql/
            ├── MSSQLTypeMapper.java        # MSSQL 타입 매핑
            └── SchemaGenerator.java        # 스키마 생성기

backend/src/main/resources/
├── db/migration/                # Flyway 마이그레이션
│   ├── V1__create_initial_tables.sql
│   ├── V2__add_indexes_and_constraints.sql
│   └── V3__insert_initial_data.sql
├── application.yml              # 기본 설정
├── application-dev.yml          # 개발 환경 설정
├── application-test.yml         # 테스트 환경 설정
├── application-test-h2.yml      # H2 테스트 설정
└── application-prod.yml         # 프로덕션 설정
```

## 주요 아키텍처 패턴

### 클린 아키텍처 계층
- **프레젠테이션**: API 인터페이스를 위한 컨트롤러와 DTO
- **애플리케이션**: 유스케이스와 애플리케이션 서비스
- **도메인**: 비즈니스 로직과 도메인 모델
- **인프라스트럭처**: 외부 관심사 (데이터베이스, 외부 API)

### 명명 규칙
- **Java 클래스**: PascalCase (예: `ProjectService`, `TableEntity`)
- **Java 메서드/변수**: camelCase (예: `createProject`, `tableName`)
- **Java 패키지**: lowercase (예: `com.dbmodeling.domain.model`)
- **TypeScript 컴포넌트/타입**: PascalCase (예: `SimpleDashboard`, `Column`)
- **TypeScript 함수/변수**: camelCase (예: `handleAddColumn`, `selectedTable`)
- **React 컴포넌트 파일**: PascalCase.tsx (예: `ColumnEditor.tsx`)
- **일반 파일**: kebab-case (예: `api-client.ts`, `column-validation.ts`)
- **PostgreSQL 테이블**: snake_case (예: `projects`, `table_columns`)
- **PostgreSQL 컬럼**: snake_case (예: `project_id`, `created_at`)
- **MSSQL 테이블**: PascalCase (예: `User`, `OrderItem`) - 사용자 정의 가능
- **MSSQL 컬럼**: snake_case (예: `user_id`, `created_at`) - 사용자 정의 가능

### 파일 구성 원칙
- **계층 분리**: Clean Architecture의 4계층을 명확히 분리 (Domain, Application, Infrastructure, Presentation)
- **기능별 그룹화**: 관련 기능을 가까이 배치 (예: Simple/ 폴더에 간소화 버전 컴포넌트 집중)
- **공통 컴포넌트**: 재사용 가능한 컴포넌트는 common/ 폴더에 집중
- **인덱스 파일**: 각 폴더에 index.ts를 두어 깔끔한 임포트 지원
- **타입 정의**: types/ 폴더에 통합 타입 정의 관리
- **테스트 파일**: 구현 파일과 같은 위치에 .test.ts 또는 .spec.ts로 배치
- **E2E 테스트**: e2e/ 폴더에 별도 관리
- **설정 파일**: 루트 레벨에 설정 파일 배치 (tsconfig.json, vite.config.ts 등)