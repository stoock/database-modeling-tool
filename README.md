# MSSQL 데이터베이스 모델링 도구

웹 기반 MSSQL 데이터베이스 스키마 설계 및 관리 플랫폼

## 🎯 프로젝트 개요

MSSQL 데이터베이스 스키마의 직관적인 설계와 관리를 가능하게 하는 웹 기반 데이터베이스 모델링 플랫폼입니다. ERD 스타일의 빠른 편집 인터페이스와 실시간 검증 기능을 제공하여 효율적인 데이터베이스 설계를 지원합니다.

### 핵심 기능

- 🎨 **간소화 원페이지 UI**: 모든 기능이 한 화면에 통합된 직관적인 인터페이스
- ⚡ **ERD 스타일 편집**: 20-column 그리드 인라인 편집으로 exerd 수준의 편의성
- 🇰🇷 **한글 친화적**: 한글명과 영문명을 별도 관리하여 국내 환경에 최적화
- 🔧 **MSSQL 전문 지원**: IDENTITY, DECIMAL 정밀도/스케일 등 27개 데이터 타입
- ✅ **실시간 검증**: 명명 규칙 위반을 즉시 감지하여 오류 사전 방지
- 📤 **다중 형식 내보내기**: SQL, JSON, Markdown, HTML, CSV 지원
- 💾 **안정적인 저장**: PostgreSQL 기반 프로젝트 영속성

## 🏗️ 기술 스택

### 백엔드
- **언어**: Java 21
- **프레임워크**: Spring Boot 3.2.0
- **아키텍처**: Clean Architecture (헥사고날 아키텍처)
- **데이터베이스**: PostgreSQL 15+
- **ORM**: Spring Data JPA + Hibernate
- **빌드 도구**: Gradle 8.5+
- **API 문서**: OpenAPI/Swagger
- **테스팅**: JUnit 5 + Mockito + Spring Boot Test

### 프론트엔드
- **언어**: TypeScript
- **프레임워크**: React 19
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand
- **UI 컴포넌트**: Headless UI + React Hook Form
- **테스팅**: Vitest + React Testing Library + Playwright

## 🚀 빠른 시작

### 사전 요구사항

- Java 21
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (Docker로 자동 설치)

### 통합 실행 (권장)

```powershell
# 1. 환경 설정 (PostgreSQL + pgAdmin 시작)
.\scripts\01-env-setup.ps1

# 2. 애플리케이션 실행 (백엔드 + 프론트엔드)
.\scripts\02-run-app.ps1

# 3. 헬스 체크
.\scripts\03-health-check.ps1
```

### 개별 실행

#### 백엔드 실행
```bash
cd backend
./gradlew bootRunDev
```

#### 프론트엔드 실행
```bash
cd frontend
yarn install
yarn dev
```

### 접속 URL

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)

## 📁 프로젝트 구조

```
database-modeling-tool/
├── backend/                     # Spring Boot 백엔드
│   ├── src/main/java/com/dbmodeling/
│   │   ├── domain/              # 도메인 계층
│   │   ├── application/         # 애플리케이션 계층
│   │   ├── infrastructure/      # 인프라스트럭처 계층
│   │   └── presentation/        # 프레젠테이션 계층
│   └── src/main/resources/
│       ├── db/migration/        # Flyway 마이그레이션
│       └── application*.yml     # 설정 파일
├── frontend/                    # React 프론트엔드 (신규 버전)
│   ├── src/
│   │   ├── pages/               # 페이지 컴포넌트
│   │   │   └── Dashboard.tsx    # 메인 대시보드
│   │   ├── components/          # UI 컴포넌트
│   │   │   ├── project/         # 프로젝트 관리
│   │   │   ├── table/           # 테이블 관리
│   │   │   ├── column/          # 컬럼 관리
│   │   │   └── common/          # 공통 컴포넌트
│   │   ├── stores/              # Zustand 상태 관리
│   │   ├── services/            # API 클라이언트
│   │   └── types/               # TypeScript 타입
│   └── e2e/                     # E2E 테스트
├── simple-frontend/             # 간소화 버전 (레거시)
├── docker/                      # Docker 설정
│   ├── postgres/                # PostgreSQL 설정
│   └── pgadmin/                 # pgAdmin 설정
├── scripts/                     # 실행 스크립트
├── .kiro/                       # Kiro IDE 설정
│   ├── specs/                   # 기능 명세서
│   └── steering/                # AI 어시스턴트 가이드
└── docs/                        # 프로젝트 문서
```

## 📖 주요 문서

- [CLAUDE.md](CLAUDE.md) - AI 어시스턴트 전용 가이드
- [SIMPLE_DASHBOARD_TASKS.md](SIMPLE_DASHBOARD_TASKS.md) - 간소화 버전 진행상황
- [요구사항](.kiro/specs/database-modeling-tool/requirements.md) - 기능 요구사항
- [설계](.kiro/specs/database-modeling-tool/design.md) - 시스템 설계
- [구현 계획](.kiro/specs/database-modeling-tool/tasks.md) - 구현 태스크

## 🎨 주요 기능 상세

### 1. 프로젝트 관리
- 프로젝트 생성, 수정, 삭제
- 프로젝트별 테이블 그룹 관리
- 프로젝트 메타데이터 (이름, 설명, 생성일)

### 2. 테이블 디자이너
- 직관적인 테이블 생성 및 편집
- 한글명 + 영문명 이중 관리
- 테이블 설명 및 메타데이터
- 테이블 간 관계 시각화

### 3. 컬럼 편집기
- 인라인 편집으로 빠른 컬럼 관리
- 키보드 네비게이션 (Tab/Enter/Esc)
- 타입별 조건부 필드 (길이, 정밀도, 스케일)
- 자동 규칙 적용 (PK→NOT NULL, IDENTITY→기본값제거)

### 4. MSSQL 전문 기능
- 27개 MSSQL 데이터 타입 완전 지원
- IDENTITY 자동 증가 설정
- DECIMAL/NUMERIC 정밀도와 스케일
- 클러스터드/논클러스터드 인덱스
- 복합 인덱스 및 유니크 제약조건

### 5. 실시간 검증
- 네이밍 규칙 실시간 검증
- 명확한 오류 메시지와 수정 제안
- 데이터 타입 호환성 검사
- 제약조건 충돌 감지

### 6. 다중 형식 내보내기
- SQL: MSSQL DDL 스크립트
- JSON: 구조화된 스키마 데이터
- Markdown: 문서화된 스키마 설명
- HTML: 웹 기반 스키마 문서
- CSV: 스프레드시트 호환 형식

## 🧪 테스트

### 백엔드 테스트
```bash
cd backend

# 단위 테스트 실행
./gradlew test

# 통합 테스트 실행
./gradlew integrationTest

# 테스트 커버리지 리포트
./gradlew jacocoTestReport
```

### 프론트엔드 테스트
```bash
cd frontend

# 단위 테스트 실행
yarn test

# E2E 테스트 실행
yarn test:e2e

# 타입 체크
yarn type-check

# 린트 검사
yarn lint
```

## 🔧 개발 가이드

### 명명 규칙
- **Java 클래스**: PascalCase (예: `ProjectService`)
- **Java 메서드/변수**: camelCase (예: `createProject`)
- **TypeScript 컴포넌트**: PascalCase (예: `SimpleDashboard`)
- **TypeScript 함수/변수**: camelCase (예: `handleAddColumn`)
- **PostgreSQL 테이블/컬럼**: snake_case (예: `project_id`)
- **MSSQL 테이블**: PascalCase (예: `User`)
- **MSSQL 컬럼**: snake_case (예: `user_id`)

### Clean Architecture 계층
1. **Domain**: 순수 비즈니스 로직, 외부 의존성 없음
2. **Application**: 유스케이스 구현, 트랜잭션 관리
3. **Infrastructure**: 데이터 접근, 외부 시스템 연동
4. **Presentation**: REST API, DTO 변환

### API 설계 표준
- RESTful 설계 원칙 준수
- HTTP 상태 코드 적절 사용 (200/201/400/404/500)
- 에러 응답: `{"error": "message", "code": "ERROR_CODE"}`
- Bean Validation으로 입력 검증
- OpenAPI 문서화 필수

## 📊 현재 개발 상태

### 완료된 항목 ✅
- ✅ 백엔드 Clean Architecture 4계층 구조
- ✅ 도메인 모델 (Project, Table, Column, Index, NamingRules)
- ✅ JPA 엔티티 및 PostgreSQL 연동
- ✅ 애플리케이션 서비스 (Project, Table, Column, Validation, Export)
- ✅ REST API 컨트롤러 (CRUD + 검증 + 내보내기)
- ✅ MSSQL 스키마 생성 엔진
- ✅ OpenAPI/Swagger 문서화
- ✅ 프론트엔드 신규 버전 구조 설계
- ✅ 프로젝트 관리 기본 UI
- ✅ 테이블 관리 기본 UI
- ✅ 컬럼 편집 기본 UI

### 진행 중 🔄
- 🔄 프론트엔드 컴포넌트 구현
- 🔄 백엔드 API 연동
- 🔄 실시간 검증 로직 구현
- 🔄 스키마 내보내기 기능 구현

### 예정 📅
- 📅 MSSQL 전문 기능 UI 완성
- 📅 인덱스 관리 UI
- 📅 E2E 테스트 작성
- 📅 성능 최적화
- 📅 배포 환경 설정

## 🤝 기여 가이드

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성 (`feature/기능명`)
3. 코드 작성 및 테스트
4. 커밋 메시지 작성 (명확하고 구체적으로)
5. Pull Request 생성
6. 코드 리뷰 및 병합

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👥 팀

- **개발**: Database Modeling Tool Team
- **아키텍처**: Clean Architecture 기반 설계
- **AI 어시스턴트**: Claude (Anthropic)

## 📞 문의

프로젝트 관련 문의사항은 이슈를 통해 남겨주세요.

---

**Made with ❤️ using React 19, Spring Boot 3, and Clean Architecture**
