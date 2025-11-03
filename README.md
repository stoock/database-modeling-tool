# MSSQL 데이터베이스 모델링 도구

시각적 스키마 설계, MSSQL 전용 타입 지원, 실시간 검증, SQL 자동 생성을 제공하는 웹 기반 데이터베이스 모델링 플랫폼입니다.

## 🚀 핵심 기능

- 🎨 **시각적 스키마 설계**: React Flow 기반 드래그 앤 드롭 인터페이스
- 🔧 **MSSQL 전용 지원**: NVARCHAR, BIGINT, DATETIME2 등 MSSQL 데이터 타입 완벽 지원
- ⚡ **실시간 검증**: 명명 규칙 위반 즉시 감지 및 수정 제안
- 📤 **SQL 자동 생성**: MSSQL 배포용 CREATE TABLE 스크립트 생성
- 📊 **인덱스 관리**: 클러스터드/논클러스터드 인덱스 설계
- 💾 **프로젝트 영속성**: PostgreSQL 백엔드를 통한 프로젝트 저장

## 🏗️ 아키텍처

### 기술 스택
- **백엔드**: Java 17 + Spring Boot 3.x + PostgreSQL 15+
- **프론트엔드**: React 19 + TypeScript + Vite + Tailwind CSS
- **상태 관리**: Zustand
- **시각화**: React Flow (테이블 관계 다이어그램)
- **빌드 도구**: Gradle (백엔드), Yarn (프론트엔드)
- **테스트**: JUnit 5 + Mockito + Vitest + Playwright

### Clean Architecture 구조 (완전 구현)
```
Domain Layer (도메인)
    ↓
Application Layer (유스케이스)
    ↓
Infrastructure Layer (데이터 접근)
    ↓
Presentation Layer (API 컨트롤러)
```

**아키텍처 특징:**
- 헥사고날 아키텍처 기반 Clean Architecture 구현
- 포트-어댑터 패턴으로 의존성 역전 원칙 준수
- 도메인 주도 설계(DDD)로 비즈니스 로직 중심 구조
- 계층 간 명확한 관심사 분리

## 🚀 빠른 시작

### 필수 요구사항
- Java 17+
- Node.js 18+
- Yarn 패키지 매니저
- Docker & Docker Compose
- PostgreSQL 15+ (Docker로 자동 설치)

### 1. 통합 실행 (권장)
```powershell
# 환경 설정 및 Docker 컨테이너 시작
.\scripts\01-env-setup.ps1

# 백엔드 + 프론트엔드 동시 실행
.\scripts\02-run-app.ps1
```

### 2. 개별 실행

**백엔드 실행 (포트 8080)**
```bash
cd backend
./gradlew bootRun
# 또는 Windows에서
gradlew.bat bootRun
```

**프론트엔드 실행 (포트 3000)**
```bash
cd frontend
yarn install
yarn dev
```

### 3. 접속 URL
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **pgAdmin**: http://localhost:5050 (admin@dbmodeling.com / admin123)

## 📋 주요 API 엔드포인트

### 프로젝트 관리
```http
GET    /api/projects          # 프로젝트 목록 조회
POST   /api/projects          # 프로젝트 생성
GET    /api/projects/{id}     # 프로젝트 상세 조회
PUT    /api/projects/{id}     # 프로젝트 수정
DELETE /api/projects/{id}     # 프로젝트 삭제
```

### 테이블 관리
```http
GET    /api/projects/{projectId}/tables     # 테이블 목록 조회
POST   /api/projects/{projectId}/tables     # 테이블 생성
PUT    /api/tables/{id}                     # 테이블 수정
DELETE /api/tables/{id}                     # 테이블 삭제
GET    /api/tables/{id}                     # 테이블 상세 조회
```

### 컬럼 관리
```http
POST   /api/tables/{tableId}/columns        # 컬럼 추가
PUT    /api/columns/{id}                    # 컬럼 수정
DELETE /api/columns/{id}                    # 컬럼 삭제
```

### 인덱스 관리
```http
POST   /api/tables/{tableId}/indexes        # 인덱스 생성
PUT    /api/indexes/{id}                    # 인덱스 수정
DELETE /api/indexes/{id}                    # 인덱스 삭제
```

### SQL 생성
```http
POST   /api/projects/{id}/export/sql        # MSSQL 스크립트 생성
```

## 🎯 MSSQL 명명 규칙

### 데이터베이스 객체
- **테이블**: PascalCase (`User`, `OrderItem`)
- **컬럼**: snake_case (`user_id`, `created_at`)
- **기본키**: 항상 `id` (BIGINT IDENTITY)
- **외래키**: `{참조테이블명}_id` 형식
- **인덱스**: `IX_{테이블명}_{컬럼명}`
- **제약조건**: `{타입}_{테이블명}_{컬럼명}`

### 감사 컬럼 (필수)
모든 테이블에 다음 컬럼이 자동 추가됩니다:
- `created_at DATETIME2 NOT NULL`
- `updated_at DATETIME2 NOT NULL`

## 🔧 개발 환경 설정

### 데이터베이스 설정
PostgreSQL 백엔드는 Docker Compose로 자동 설정됩니다:
- **개발용**: `localhost:5432/dbmodeling_dev`
- **테스트용**: `localhost:5433/dbmodeling_test`

### UUID 생성 전략
프로젝트 엔티티는 PostgreSQL 호환성을 위해 `GenerationType.AUTO` 전략을 사용합니다:
```java
@Id
@GeneratedValue(strategy = GenerationType.AUTO)
private UUID id;
```

### 환경 변수
```bash
# .env.dev (개발 환경)
SPRING_PROFILES_ACTIVE=dev
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/dbmodeling_dev
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# .env.test (테스트 환경)
SPRING_PROFILES_ACTIVE=test
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/dbmodeling_test
```

## 🧪 테스트

### 백엔드 테스트
```bash
cd backend
./gradlew test                    # 단위 테스트
./gradlew build                   # 전체 빌드 및 테스트

# Windows에서
gradlew.bat test
gradlew.bat build
```

### 프론트엔드 테스트
```bash
cd frontend
yarn test                         # 단위 테스트 (Vitest)
yarn test:e2e                     # E2E 테스트 (Playwright)
yarn lint                         # ESLint 코드 품질 검사
yarn build                        # 프로덕션 빌드
```

### 성능 기준
- API 응답 시간: 500ms 이하
- 테스트 커버리지: 80% 이상
- JPA N+1 문제 방지 (fetch join, @EntityGraph 활용)

## 📁 프로젝트 구조

### 백엔드 (Clean Architecture)
```
backend/src/main/java/com/dbmodeling/
├── domain/                      # 도메인 계층
│   ├── model/                   # 도메인 모델
│   ├── service/                 # 도메인 서비스
│   └── repository/              # 리포지토리 인터페이스
├── application/                 # 애플리케이션 계층
│   ├── service/                 # 애플리케이션 서비스
│   ├── usecase/                 # 유스케이스 구현
│   └── port/                    # 포트 인터페이스
├── infrastructure/              # 인프라스트럭처 계층
│   ├── persistence/             # 데이터 영속성
│   ├── config/                  # 설정 클래스
│   └── external/                # 외부 통합
└── presentation/                # 프레젠테이션 계층
    ├── controller/              # REST API 컨트롤러
    └── dto/                     # 데이터 전송 객체
```

### 프론트엔드
```
frontend/src/
├── components/                  # React 컴포넌트
│   ├── TableDesigner/           # 테이블 설계 캔버스
│   ├── ValidationPanel/         # 검증 패널
│   ├── SchemaExport/            # 스키마 내보내기
│   └── ProjectManager/          # 프로젝트 관리
├── stores/                      # Zustand 상태 관리
├── services/                    # API 클라이언트
├── types/                       # TypeScript 타입 정의
└── utils/                       # 유틸리티 함수
```

## 🛠️ 유용한 스크립트

### 개발 환경 관리
```powershell
.\scripts\01-env-setup.ps1       # 초기 환경 설정
.\scripts\02-run-app.ps1         # 애플리케이션 실행
.\scripts\03-health-check.ps1    # 헬스 체크
.\scripts\env-stop.ps1           # 환경 중지
.\scripts\env-reset.ps1          # 환경 초기화
```

### 테스트 및 빌드
```powershell
.\scripts\test-backend.ps1       # 백엔드 테스트
.\scripts\test-build.ps1         # 전체 빌드 테스트
.\scripts\run-backend-h2.ps1     # H2 데이터베이스로 백엔드 실행
```

## 🐛 트러블슈팅

### 포트 충돌 해결
**Windows:**
```powershell
# 포트 사용 확인
netstat -ano | findstr :5432
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# 프로세스 종료 (PID 확인 후)
taskkill /PID <프로세스ID> /F
```

**Linux/Mac:**
```bash
# PostgreSQL 포트 확인
netstat -tulpn | grep :5432

# 프로세스 종료
sudo systemctl stop postgresql
```

### 데이터베이스 초기화
```bash
# Docker 볼륨 삭제 후 재시작
docker-compose down -v
docker-compose up -d

# 또는 스크립트 사용
.\scripts\env-reset.ps1
```

### Gradle 빌드 문제
```bash
cd backend
./gradlew --stop                 # Gradle 데몬 중지
./gradlew clean build            # 클린 빌드

# Windows에서
gradlew.bat --stop
gradlew.bat clean build
```

### Yarn 의존성 문제
```bash
cd frontend
rm -rf node_modules yarn.lock    # 의존성 삭제
yarn install                     # 재설치

# Windows에서
rmdir /s /q node_modules
del yarn.lock
yarn install
```

## 📚 추가 문서

- [프론트엔드 가이드](frontend/README.md)
- [Docker 환경 설정](docker/README.md)
- [API 문서](http://localhost:8080/api/swagger-ui.html)

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.