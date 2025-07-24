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

### 프론트엔드 개발
```bash
# 의존성 설치
yarn install

# 개발 서버 시작
yarn dev

# 테스트 실행
yarn test

# 프로덕션 빌드
yarn build

# E2E 테스트 실행
yarn test:e2e
```

### 백엔드 개발
```bash
# 애플리케이션 실행
./mvnw spring-boot:run

# 테스트 실행
./mvnw test

# 애플리케이션 빌드
./mvnw clean package

# 통합 테스트 실행
./mvnw verify
```

## 데이터베이스 설정
```sql
-- 개발용 데이터베이스 생성
CREATE DATABASE dbmodeling_dev;

-- 테스트용 데이터베이스 생성
CREATE DATABASE dbmodeling_test;
```

## 아키텍처 원칙
- 관심사의 명확한 분리를 통한 클린 아키텍처
- 비즈니스 로직을 위한 도메인 주도 설계
- 적절한 HTTP 상태 코드를 사용한 RESTful API 설계
- 즉각적인 사용자 피드백을 통한 실시간 검증
- 동시 접근 제어를 위한 낙관적 잠금