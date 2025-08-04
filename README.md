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
- **프레임워크**: React 19.1.0 + TypeScript 5.8.3
- **빌드 도구**: Vite 7.0.4
- **패키지 매니저**: Yarn (yarn.lock 기반 의존성 관리)
- **상태 관리**: Zustand 5.0.6
- **스타일링**: Tailwind CSS 4.1.11
- **UI 컴포넌트**: Headless UI 2.2.4 + React Hook Form 7.60.0
- **시각화**: React Flow 11.11.4 (테이블 관계 다이어그램용)
- **테스팅**: Vitest 1.0.0 + React Testing Library, Playwright 1.40.0 (E2E)

### 백엔드
- **언어**: Java 21
- **프레임워크**: Spring Boot 3.2.0
- **빌드 도구**: Gradle 8.5+ (./gradlew)
- **아키텍처**: Clean Architecture (헥사고날 아키텍처)
- **데이터베이스**: PostgreSQL 15+ (개발), H2 (테스트)
- **ORM**: Spring Data JPA + Hibernate
- **마이그레이션**: Flyway
- **API 문서화**: OpenAPI/Swagger
- **테스팅**: JUnit 5 + Mockito + Spring Boot Test

## 프로젝트 구조

```
database-modeling-tool/
├── frontend/                    # React 애플리케이션
│   ├── src/
│   │   ├── components/         # UI 컴포넌트
│   │   ├── stores/             # Zustand 상태 관리
│   │   ├── services/           # API 클라이언트
│   │   └── types/              # TypeScript 타입 정의
│   ├── package.json
│   └── yarn.lock
├── backend/                     # Spring Boot 애플리케이션
│   ├── src/main/java/com/dbmodeling/
│   │   ├── domain/             # 도메인 모델 및 비즈니스 로직
│   │   ├── application/        # 유스케이스 및 애플리케이션 서비스
│   │   ├── infrastructure/     # 데이터베이스 및 외부 시스템 연동
│   │   └── presentation/       # REST API 컨트롤러
│   ├── build.gradle
│   └── gradlew
├── scripts/                     # 개발 스크립트 (PowerShell)
├── docker/                      # Docker 설정
└── .kiro/                       # Kiro IDE 설정
    ├── specs/                   # 기능 명세서
    └── steering/                # AI 어시스턴트 가이드
```

## 개발 상태

### 백엔드 (완료)
- ✅ 도메인 계층 (Project, Table, Column, Index, NamingRules)
- ✅ 애플리케이션 계층 (유스케이스, 애플리케이션 서비스)
- ✅ 인프라 계층 (JPA 엔티티, 리포지토리, 외부 연동)
- ✅ MSSQL 스키마 생성 엔진 (SqlGeneratorService, SchemaExportService)
- ✅ 검증 엔진 (ValidationService)
- ✅ Flyway 마이그레이션 및 H2/PostgreSQL 지원

### 프론트엔드 (16.3단계까지 완료)
- ✅ 프로젝트 관리 (생성, 편집, 삭제)
- ✅ 테이블 설계 캔버스 (React Flow 기반)
- ✅ 컬럼 관리 인터페이스 (MSSQL 데이터 타입 지원)
- ✅ 인덱스 관리 (클러스터드/논클러스터드)
- ✅ 실시간 명명 규칙 검증
- ✅ 자동 저장 및 변경사항 추적
- ✅ 반응형 UI (Tailwind CSS)

### 현재 작업 상태
- 🔄 API 연동 및 에러 처리 완성 (17단계)
- ⚠️ 알려진 이슈: 백엔드 테스트 일부 실패 (115/351개)
- ⚠️ 자동 저장 기능 임시 비활성화 (무한 렌더링 방지)

### 최근 수정 사항
- ✅ React useEffect 무한 렌더링 오류 해결
- ✅ CORS 설정 업데이트 (포트 3000, 3001, 3002, 5173 지원)
- ✅ 영어 로그 메시지 적용 (한글 깨짐 해결)
- ✅ 포트 관리 프로세스 개선

## 빠른 시작

### 통합 개발 환경 시작 (권장)
```powershell
# 1단계: 개발 환경 설정
.\scripts\01-env-setup.ps1

# 2단계: 애플리케이션 실행
.\scripts\02-run-app.ps1

# 선택사항: 시스템 상태 확인
.\scripts\03-health-check.ps1
```

### 개별 서비스 실행

#### 백엔드 (Spring Boot)
```bash
cd backend

# 개발 프로파일로 실행
./gradlew bootRunDev

# H2 테스트 환경 실행
./gradlew bootRunH2

# 빌드 (테스트 제외)
./gradlew build -x test
```

#### 프론트엔드 (React + Vite)
```bash
cd frontend

# 개발 서버 시작 (포트 3000)
yarn dev

# 타입 체크
yarn type-check

# 린트 검사
yarn lint
```

### 접속 정보
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **pgAdmin**: http://localhost:5050 (Podman Compose로 실행)

## 기여하기

이 프로젝트는 Kiro IDE를 사용하여 개발되고 있으며, 체계적인 스펙 기반 개발 방법론을 따릅니다.

## 라이선스

MIT License