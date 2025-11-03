# 기술 스택

## 프론트엔드
- **프레임워크**: React 19 with TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand (경량 상태 관리)
- **UI 컴포넌트**: Headless UI + React Hook Form
- **시각화**: React Flow (테이블 관계 다이어그램용)
- **테스팅**: Jest + React Testing Library
- **E2E 테스팅**: Playwright

## 백엔드
- **언어**: Java 17
- **프레임워크**: Spring Boot 3.x
- **아키텍처**: Clean Architecture (헥사고날 아키텍처)
- **데이터베이스**: PostgreSQL 15+
- **ORM**: Spring Data JPA + Hibernate
- **API 문서화**: OpenAPI/Swagger
- **테스팅**: JUnit 5 + Mockito + Spring Boot Test

## 개발 도구
- **패키지 매니저**: Yarn (프론트엔드), Gradle (백엔드)
- **빌드 도구**: Vite (프론트엔드), Spring Boot Gradle Plugin (백엔드)
- **코드 품질**: ESLint + Prettier (프론트엔드), SpotBugs + Checkstyle (백엔드)

## 주요 명령어

### 통합 실행 (권장)
```powershell
# 환경 설정 (PostgreSQL + pgAdmin 시작)
.\scripts\01-env-setup.ps1

# 애플리케이션 실행 (백엔드 + 프론트엔드)
.\scripts\02-run-app.ps1

# 헬스 체크
.\scripts\03-health-check.ps1

# 환경 중지
.\scripts\env-stop.ps1
```

### 프론트엔드 개발
```bash
# 의존성 설치
cd frontend && yarn install

# 개발 서버 시작 (http://localhost:3000)
yarn dev

# 간소화 버전 접속 (http://localhost:3000/simple)

# 테스트 실행
yarn test

# 타입 체크
yarn type-check

# 린트 검사
yarn lint

# 프로덕션 빌드
yarn build

# E2E 테스트 실행
yarn test:e2e
```

### 백엔드 개발
```bash
# 개발 모드 실행 (PostgreSQL 사용)
cd backend && ./gradlew bootRunDev

# H2 메모리 DB로 실행 (테스트용)
./gradlew bootRunH2

# 테스트 실행 (단위 테스트만)
./gradlew test

# 통합 테스트 실행
./gradlew integrationTest

# 애플리케이션 빌드
./gradlew build

# Gradle 데몬 중지
./gradlew --stop
```

### 데이터베이스 관리
```bash
# Flyway 마이그레이션 실행
cd backend && ./gradlew flywayMigrate

# Flyway 마이그레이션 정보 확인
./gradlew flywayInfo

# Flyway 마이그레이션 검증
./gradlew flywayValidate
```

## 데이터베이스 설정
```sql
-- 개발용 데이터베이스 생성
CREATE DATABASE dbmodeling_dev;

-- 테스트용 데이터베이스 생성
CREATE DATABASE dbmodeling_test;
```

## 아키텍처 원칙
- **Clean Architecture**: 관심사의 명확한 분리 (Domain → Application → Infrastructure → Presentation)
- **도메인 주도 설계**: 비즈니스 로직을 도메인 계층에 집중
- **RESTful API**: 적절한 HTTP 상태 코드와 표준 REST 규칙 준수
- **실시간 검증**: 즉각적인 사용자 피드백으로 오류 사전 방지
- **낙관적 잠금**: 동시 접근 제어를 통한 데이터 무결성 보장
- **타입 안정성**: TypeScript와 Java의 강타입 시스템 활용
- **컴포넌트 재사용**: 공통 컴포넌트 라이브러리를 통한 일관성 유지
- **상태 관리**: Zustand를 통한 경량 전역 상태 관리
- **API 캐싱**: 불필요한 네트워크 요청 최소화