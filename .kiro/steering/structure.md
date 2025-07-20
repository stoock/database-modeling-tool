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
├── components/
│   ├── TableDesigner/           # 메인 디자인 캔버스 컴포넌트
│   │   ├── TableCanvas.tsx      # React Flow 캔버스
│   │   ├── TableNode.tsx        # 개별 테이블 노드
│   │   └── RelationshipLine.tsx # 테이블 관계선
│   ├── ColumnEditor/            # 컬럼 관리
│   │   ├── ColumnList.tsx       # 컬럼 목록
│   │   ├── ColumnForm.tsx       # 컬럼 편집 폼
│   │   └── DataTypeSelector.tsx # MSSQL 데이터 타입 선택기
│   ├── IndexManager/            # 인덱스 관리
│   │   ├── IndexList.tsx        # 인덱스 목록
│   │   └── IndexForm.tsx        # 인덱스 생성/편집
│   ├── ValidationPanel/         # 명명 규칙 및 검증
│   │   ├── NamingRules.tsx      # 규칙 설정
│   │   └── ValidationResults.tsx # 검증 피드백
│   └── SchemaExport/            # SQL 생성 및 내보내기
│       ├── SqlPreview.tsx       # SQL 스크립트 미리보기
│       └── ExportOptions.tsx    # 내보내기 설정
├── services/
│   ├── api.ts                   # API 클라이언트
│   ├── validation.ts            # 클라이언트 측 검증
│   └── sqlGenerator.ts          # SQL 생성 유틸리티
├── stores/                      # Zustand 상태 관리
│   ├── projectStore.ts          # 프로젝트 상태
│   ├── tableStore.ts            # 테이블 상태
│   └── validationStore.ts       # 검증 상태
├── types/                       # TypeScript 타입 정의
└── utils/                       # 유틸리티 함수
```

## 백엔드 구조 (클린 아키텍처)
```
backend/src/main/java/com/dbmodeling/
├── presentation/                # 프레젠테이션 계층
│   ├── controller/              # REST API 컨트롤러
│   │   ├── ProjectController.java
│   │   ├── TableController.java
│   │   ├── ColumnController.java
│   │   ├── IndexController.java
│   │   └── ExportController.java
│   └── dto/                     # 데이터 전송 객체
│       ├── request/             # 요청 DTO
│       └── response/            # 응답 DTO
├── application/                 # 애플리케이션 계층
│   ├── service/                 # 애플리케이션 서비스
│   │   ├── ProjectService.java
│   │   ├── TableService.java
│   │   ├── ValidationService.java
│   │   └── ExportService.java
│   ├── usecase/                 # 유스케이스 구현
│   │   ├── CreateProjectUseCase.java
│   │   ├── UpdateTableUseCase.java
│   │   └── GenerateSchemaUseCase.java
│   └── port/                    # 포트 인터페이스
│       ├── in/                  # 인바운드 포트 (유스케이스)
│       └── out/                 # 아웃바운드 포트 (리포지토리)
├── domain/                      # 도메인 계층
│   ├── model/                   # 도메인 모델
│   │   ├── Project.java
│   │   ├── Table.java
│   │   ├── Column.java
│   │   ├── Index.java
│   │   └── NamingRules.java
│   ├── service/                 # 도메인 서비스
│   │   ├── SqlGeneratorService.java
│   │   └── ValidationDomainService.java
│   └── repository/              # 리포지토리 인터페이스
│       ├── ProjectRepository.java
│       ├── TableRepository.java
│       └── ColumnRepository.java
└── infrastructure/              # 인프라스트럭처 계층
    ├── persistence/             # 데이터 영속성
    │   ├── entity/              # JPA 엔티티
    │   ├── repository/          # JPA 리포지토리 구현
    │   └── mapper/              # 엔티티-도메인 매퍼
    ├── config/                  # 설정 클래스
    │   ├── DatabaseConfig.java
    │   ├── SwaggerConfig.java
    │   └── ValidationConfig.java
    └── external/                # 외부 통합
        └── mssql/
            ├── MSSQLTypeMapper.java
            └── SchemaGenerator.java
```

## 주요 아키텍처 패턴

### 클린 아키텍처 계층
- **프레젠테이션**: API 인터페이스를 위한 컨트롤러와 DTO
- **애플리케이션**: 유스케이스와 애플리케이션 서비스
- **도메인**: 비즈니스 로직과 도메인 모델
- **인프라스트럭처**: 외부 관심사 (데이터베이스, 외부 API)

### 명명 규칙
- **Java**: 클래스는 PascalCase, 메서드/변수는 camelCase
- **TypeScript**: 컴포넌트/타입은 PascalCase, 함수/변수는 camelCase
- **파일**: 컴포넌트 파일은 kebab-case, 클래스 파일은 PascalCase
- **데이터베이스**: 테이블과 컬럼은 snake_case

### 파일 구성 원칙
- 기술적 계층보다는 기능/도메인별로 그룹화
- 관련 컴포넌트들을 가까이 배치
- 계층 간 관심사를 명확히 분리
- 깔끔한 임포트를 위한 인덱스 파일 사용
- 모듈 전반에 걸쳐 일관된 디렉토리 구조 유지