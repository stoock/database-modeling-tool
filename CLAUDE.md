# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

MSSQL 데이터베이스 모델링 도구 - 드래그 앤 드롭 인터페이스를 통한 시각적 데이터베이스 스키마 설계와 MSSQL 전용 데이터 타입 지원, 실시간 명명 규칙 검증, SQL 스크립트 자동 생성을 제공하는 웹 기반 플랫폼입니다.

### 핵심 기능
- 시각적 데이터베이스 스키마 설계 (React Flow 기반)
- MSSQL 전용 데이터 타입 지원 및 검증
- 클러스터드/논클러스터드 인덱스 관리
- 실시간 명명 규칙 검증 및 피드백
- MSSQL 배포용 SQL 스크립트 자동 생성
- PostgreSQL 백엔드를 통한 프로젝트 영속성

### 현재 개발 상태
- 백엔드: 도메인 계층, 애플리케이션 계층, 인프라 계층 완료
- 프론트엔드: 16.3단계까지 완료 (컬럼 관리 인터페이스 완성)
- 다음 단계: API 연동 및 에러 처리 완성 (17단계)

## 아키텍처

### 백엔드 (Clean Architecture)
- **언어/프레임워크**: Java 21, Spring Boot 3.2.0
- **빌드 도구**: Maven (./mvnw)
- **데이터베이스**: PostgreSQL 15+ (개발), H2 (테스트)
- **아키텍처 패턴**: Clean Architecture (헥사고날 아키텍처)
- **ORM**: Spring Data JPA + Hibernate
- **마이그레이션**: Flyway
- **API 문서**: OpenAPI/Swagger

### 프론트엔드 (React)
- **프레임워크**: React 19.1.0 + TypeScript 5.8.3
- **빌드 도구**: Vite 7.0.4
- **패키지 매니저**: Yarn (yarn.lock 기반 의존성 관리)
- **상태 관리**: Zustand 5.0.6
- **스타일링**: Tailwind CSS 4.1.11
- **UI 컴포넌트**: Headless UI 2.2.4 + React Hook Form 7.60.0
- **다이어그램**: React Flow 11.11.4 (테이블 관계 시각화)
- **테스팅**: Vitest 1.0.0 + React Testing Library, Playwright 1.40.0 (E2E)

## 개발 명령어

### 통합 개발 환경 시작
```powershell
# [01단계] 개발 환경 설정
.\scripts\01-env-setup.ps1

# [02단계] 애플리케이션 실행
.\scripts\02-run-app.ps1

# [진단] 시스템 상태 확인 (선택사항)
.\scripts\03-health-check.ps1
```

### 개발 스크립트 전체 목록

#### 🚀 **핵심 실행 스크립트 (순서대로 실행)**
| 파일명 | 기능 | 용도 |
|--------|------|------|
| `01-env-setup.ps1` | 개발 환경 설정 | PostgreSQL + 의존성 + 마이그레이션 |
| `02-run-app.ps1` | 애플리케이션 실행 | 백엔드 + 프론트엔드 통합 실행 |
| `03-health-check.ps1` | 시스템 진단 (100점 평가) | 환경 상태 확인 (선택사항) |

#### 🛠️ **관리 스크립트**
| 파일명 | 기능 | 용도 |
|--------|------|------|
| `env-stop.ps1` | 개발 환경 중지 | 컨테이너 정리 |
| `env-reset.ps1` | 개발 환경 초기화 | 전체 데이터 삭제 |

#### 🧪 **테스트 스크립트**
| 파일명 | 기능 | 용도 |
|--------|------|------|
| `test-build.ps1` | 빌드 검증 | 실행 없이 빌드만 테스트 |
| `test-backend.ps1` | 백엔드 테스트 | 단위 테스트 실행 |

### 백엔드 개발
```bash
cd backend

# Spring Boot 애플리케이션 실행 (개발 프로파일)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 테스트 실행
./mvnw test

# 통합 테스트 실행
./mvnw verify

# Flyway 마이그레이션 실행
./mvnw flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/dbmodeling_dev
```

### 프론트엔드 개발
```bash
cd frontend

# 개발 서버 실행 (포트 3000, 백엔드 프록시 설정됨)
yarn dev

# 빌드
yarn build

# 타입 체크
yarn type-check

# 린트
yarn lint

# 단위 테스트
yarn test

# E2E 테스트
yarn test:e2e
```

### Docker 환경 관리
```bash
# 개발 환경 시작 (PostgreSQL + pgAdmin)
docker-compose up -d

# 데이터베이스 연결 확인
docker exec -it dbmodeling-postgres-dev psql -U postgres -d dbmodeling_dev -c "SELECT version();"

# 환경 정리
docker-compose down -v
```

## 프로젝트 구조

### 백엔드 Clean Architecture 계층
```
backend/src/main/java/com/dbmodeling/
├── presentation/          # API 컨트롤러, DTO
├── application/           # 유스케이스, 애플리케이션 서비스
├── domain/               # 도메인 모델, 비즈니스 로직
└── infrastructure/       # 데이터베이스, 외부 시스템 연동
```

### 프론트엔드 컴포넌트 구조
```
frontend/src/
├── components/
│   ├── TableDesigner/    # 메인 설계 캔버스
│   ├── ColumnEditor/     # 컬럼 관리
│   ├── IndexManager/     # 인덱스 관리
│   ├── ValidationPanel/  # 명명 규칙 검증
│   └── SchemaExport/     # SQL 생성 및 내보내기
├── stores/              # Zustand 상태 관리
├── services/            # API 클라이언트
└── types/               # TypeScript 타입 정의
```

## 개발 환경 설정

### 필수 요구사항
- Java 21
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (Docker로 실행)

### 데이터베이스 설정
- **개발**: PostgreSQL (포트 5432)
- **테스트**: PostgreSQL (포트 5433) 또는 H2 (인메모리)
- **pgAdmin**: http://localhost:5050 (admin@dbmodeling.com / admin123)

### 프록시 설정
프론트엔드 개발 서버(3000) → 백엔드 API(8080) 자동 프록시 설정됨

## 개발 가이드라인

### MSSQL 명명 규칙 (custom.md 기준 - 엄격히 준수)
- **테이블명**: 단수형 PascalCase (`User`, `OrderItem`)
- **컬럼명**: snake_case (`user_id`, `created_at`)
- **기본키**: 항상 `id` (BIGINT IDENTITY)
- **외래키**: `{참조테이블명}_id` 형식
- **인덱스**: `IX_{테이블명}_{컬럼명}` (`IX_User_Email`)
- **제약조건**: `{타입}_{테이블명}_{컬럼명}` (`FK_Order_UserId`)
- **감사 컬럼**: 모든 테이블에 `created_at`, `updated_at` 필수
- **MSSQL 데이터 타입**: `NVARCHAR`, `BIGINT`, `DATETIME2`, `DECIMAL(18,2)` 우선 사용

### Clean Architecture 원칙
- **Domain**: 비즈니스 로직, 외부 의존성 없음
- **Application**: 유스케이스, 도메인 조율, 트랜잭션 관리
- **Infrastructure**: 데이터 접근, 외부 통합
- **Presentation**: API 컨트롤러, DTO

### API 설계 원칙
- RESTful 설계 (GET, POST, PUT, DELETE)
- HTTP 상태 코드: 200/201/400/404/500 적절히 사용
- 일관된 에러 응답: `{"error": "message", "code": "ERROR_CODE"}`
- Bean Validation으로 클라이언트/서버 양쪽 검증
- 글로벌 예외 핸들러로 일관된 응답
- OpenAPI/Swagger 자동 문서화

### UI/UX 가이드라인
- **실시간 피드백**: 빨간색(오류), 노란색(경고), 초록색(성공)
- **React Flow**: 테이블 노드와 관계선 시각화
- **즉시 검증**: 입력 시 실시간 명명 규칙 검증
- **반응형 디자인**: Tailwind CSS 활용

## 테스트 전략

### 백엔드
- **단위 테스트**: JUnit 5 + Mockito (도메인/서비스 계층)
- **통합 테스트**: Spring Boot Test (API 엔드포인트)
- **테스트 데이터**: @Sql 스크립트 활용
- **커버리지 목표**: 80% 이상

### 프론트엔드
- **단위 테스트**: Vitest 1.0.0 + React Testing Library 14.1.0
- **E2E 테스트**: Playwright 1.40.0 (주요 사용자 플로우)
- **테스트 실행**: `yarn test` (단위), `yarn test:e2e` (E2E)

## 성능 고려사항

### 최적화 목표
- API 응답 시간 500ms 이하 목표
- JPA N+1 문제 방지 (fetch join, @EntityGraph 활용)
- 프론트엔드 코드 스플리팅 적용
- 대용량 데이터 페이지네이션

### 보안 요구사항
- 파라미터화된 쿼리로 SQL 인젝션 방지
- 민감 정보 로깅 금지
- CORS 정책 설정

## 주요 접속 정보

### 개발 환경
- **백엔드 API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **프론트엔드**: http://localhost:3000
- **pgAdmin**: http://localhost:5050

### 프로젝트 문서 위치
- **요구사항**: `.kiro/specs/database-modeling-tool/requirements.md`
- **설계 문서**: `.kiro/specs/database-modeling-tool/design.md`
- **구현 계획**: `.kiro/specs/database-modeling-tool/tasks.md`
- **Docker 가이드**: `docker/README.md`

## 린트 및 타입 체크

### 프론트엔드
```bash
# 린트 검사 및 수정
yarn lint

# 타입 체크
yarn type-check
```

### 백엔드
코드 수정 후 반드시 테스트 실행:
```bash
./mvnw test
```

## 언어 정책
- **모든 응답은 한글로 제공** (custom.md 정책)
- 프로그램 설치 전 기존 설치 상태 및 버전 호환성 확인 필수

## Kiro 프로젝트 문서 동적 반영 지침

### 📋 **Kiro 문서 구조 모니터링**
Claude Code 인스턴스는 `.kiro/` 디렉토리의 md 파일 변경사항을 지속적으로 모니터링하고 반영해야 합니다:

#### **1. 실시간 변경 감지**
- **system-reminder**를 통한 파일 변경 알림 수신 시 즉시 대응
- 변경된 파일의 내용을 재확인하고 CLAUDE.md 업데이트 필요성 판단
- 사용자에게 변경 사실을 별도로 언급하지 않음 (이미 인지하고 있음)

#### **2. 주요 모니터링 대상 파일**
```
.kiro/specs/database-modeling-tool/
├── requirements.md     # 요구사항 변경 → 프로젝트 개요 업데이트
├── design.md          # 설계 변경 → 아키텍처 섹션 업데이트  
└── tasks.md           # 진행상황 → 현재 개발 상태 업데이트

.kiro/steering/
├── custom.md          # 개발 가이드 → 전체 지침 업데이트
├── tech.md            # 기술 스택 → 아키텍처 섹션 업데이트
├── structure.md       # 구조 변경 → 프로젝트 구조 업데이트
└── product.md         # 제품 정보 → 프로젝트 개요 업데이트
```

#### **3. 자동 반영 프로세스**
1. **변경 감지**: system-reminder 또는 사용자 요청으로 파일 변경 인지
2. **영향 분석**: 변경된 내용이 CLAUDE.md의 어느 섹션에 영향을 주는지 판단
3. **우선순위 결정**: 
   - **High**: custom.md, tasks.md (개발 지침, 진행상황)
   - **Medium**: requirements.md, design.md (요구사항, 설계)
   - **Low**: tech.md, structure.md, product.md (기술 정보)
4. **선택적 업데이트**: 변경된 부분만 정확히 반영하여 일관성 유지
5. **검증**: 업데이트 후 전체 문서의 논리적 일관성 확인

#### **4. 업데이트 규칙**
- **즉시 반영**: custom.md의 명명 규칙, 아키텍처 원칙 변경
- **단계별 반영**: tasks.md의 진행상황은 체크박스 상태에 따라 "현재 개발 상태" 업데이트
- **버전 동기화**: tech.md의 기술 스택 변경 시 정확한 버전 정보 반영
- **충돌 해결**: 여러 파일 간 상충하는 정보가 있을 경우 custom.md > requirements.md > design.md 순서로 우선순위 적용

#### **5. 변경 사항 추적**
- 각 Kiro 문서 변경 시점과 반영 내용을 내부적으로 추적
- 사용자의 명시적 요청 없이는 변경 사실을 언급하지 않음
- 대화 세션 내에서 동일한 변경사항에 대한 중복 반영 방지

### 🔄 **최신 Kiro 지침 (custom.md 기준)**
- **프로젝트 규칙**: 모든 응답/코멘트 한글 작성, 즉시 실행 가능 코드 제공
- **명명 규칙**: MSSQL 특화 규칙 엄격 준수 (테이블 PascalCase, 컬럼 snake_case)
- **아키텍처**: Clean Architecture 4계층 구조 준수
- **성능 기준**: API 응답 500ms 이하, JPA N+1 방지
- **품질 표준**: 단위/통합/E2E 테스트 필수

이 지침에 따라 Kiro 문서 변경 시 자동으로 관련 섹션을 업데이트하여 항상 최신 상태를 유지합니다.