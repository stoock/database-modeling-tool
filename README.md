# MSSQL 데이터베이스 모델링 도구

MSSQL 데이터베이스 스키마의 직관적인 설계와 관리를 가능하게 하는 웹 기반 데이터베이스 모델링 플랫폼입니다.

## 프로젝트 개요

이 도구는 테이블 생성부터 스키마 내보내기까지 완전한 데이터베이스 모델링 라이프사이클을 지원합니다.

### 핵심 기능
- 드래그 앤 드롭 인터페이스를 통한 시각적 데이터베이스 스키마 설계
- MSSQL 전용 데이터 타입 지원 및 검증
- 인덱스 관리 (클러스터드/논클러스터드, 복합 인덱스)
- 실시간 피드백을 통한 명명 규칙 검증
- MSSQL 배포를 위한 SQL 스크립트 생성
- PostgreSQL 백엔드를 통한 프로젝트 영속성

## 기술 스택

### 프론트엔드
- **프레임워크**: React 19 with TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand (경량 상태 관리)
- **UI 컴포넌트**: Headless UI + React Hook Form
- **시각화**: React Flow (테이블 관계 다이어그램용)
- **테스팅**: Jest + React Testing Library

### 백엔드
- **언어**: Java 17
- **프레임워크**: Spring Boot 3.x
- **아키텍처**: Clean Architecture (헥사고날 아키텍처)
- **데이터베이스**: PostgreSQL 15+
- **ORM**: Spring Data JPA + Hibernate
- **API 문서화**: OpenAPI/Swagger
- **테스팅**: JUnit 5 + Mockito + Spring Boot Test

## 프로젝트 구조

```
database-modeling-tool/
├── frontend/                    # React 애플리케이션 (예정)
├── backend/                     # Spring Boot 애플리케이션
├── docs/                        # 프로젝트 문서
├── docker/                      # Docker 설정 (예정)
└── .kiro/                       # Kiro IDE 설정
    ├── specs/                   # 기능 명세서
    └── steering/                # AI 어시스턴트 가이드
```

## 개발 상태

현재 백엔드의 도메인 계층, 애플리케이션 계층, 인프라스트럭처 계층이 구현 완료되었습니다.

### 완료된 기능
- ✅ 도메인 모델 (Project, Table, Column, Index, NamingRules)
- ✅ 데이터 영속성 (JPA 엔티티, 리포지토리)
- ✅ 애플리케이션 서비스 (ProjectService, TableService, IndexService)
- ✅ MSSQL 스키마 생성 엔진 (SqlGeneratorService, SchemaExportService)
- ✅ 검증 엔진 (ValidationDomainService)
- ✅ 포괄적인 단위 테스트 및 통합 테스트

### 진행 예정
- 🔄 REST API 컨트롤러 구현
- 🔄 프론트엔드 React 애플리케이션 개발
- 🔄 E2E 테스트 구현

## 빠른 시작

### 백엔드 실행

```bash
cd backend
./mvnw spring-boot:run
```

### 테스트 실행

```bash
cd backend
./mvnw test
```

## 기여하기

이 프로젝트는 Kiro IDE를 사용하여 개발되고 있으며, 체계적인 스펙 기반 개발 방법론을 따릅니다.

## 라이선스

MIT License