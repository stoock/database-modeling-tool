---
inclusion: always
---

# MSSQL 데이터베이스 모델링 도구 - 개발 가이드

## 프로젝트 규칙
- **언어**: 모든 응답과 코멘트는 한글로 작성 (코드 제외)
- **호환성**: 설치 전 기존 버전 호환성 확인 필수
- **실행 가능성**: 코드 작성 시 즉시 실행 가능한 형태로 제공
- **문서화**: 주요 변경사항은 관련 문서에 즉시 반영
- **테스트**: 새로운 기능 추가 시 단위 테스트 작성 권장
- **커밋 메시지**: 명확하고 구체적인 커밋 메시지 작성

## 명명 규칙 (엄격히 준수)

### 데이터베이스
- **테이블**: 단수형 PascalCase (`User`, `OrderItem`)
- **컬럼**: snake_case (`user_id`, `created_at`)
- **기본키**: 항상 `id` (BIGINT IDENTITY)
- **외래키**: `{참조테이블명}_id` 형식
- **인덱스**: `IX_{테이블명}_{컬럼명}`
- **제약조건**: `{타입}_{테이블명}_{컬럼명}`

### 코드
- **Java 클래스**: PascalCase
- **Java 메서드/변수**: camelCase
- **TypeScript 컴포넌트**: PascalCase
- **TypeScript 함수/변수**: camelCase
- **파일명**: kebab-case (컴포넌트 제외)

## MSSQL 특화 요구사항
- **데이터 타입**: 27개 MSSQL 전용 타입 지원
  - 문자열: `NVARCHAR`, `VARCHAR`, `NCHAR`, `CHAR`, `TEXT`, `NTEXT`
  - 정수: `BIGINT`, `INT`, `SMALLINT`, `TINYINT`
  - 실수: `DECIMAL`, `NUMERIC`, `FLOAT`, `REAL`
  - 날짜/시간: `DATE`, `TIME`, `DATETIME`, `DATETIME2`, `TIMESTAMP`
  - 기타: `BIT`, `BINARY`, `VARBINARY`, `IMAGE`, `UNIQUEIDENTIFIER`, `XML`, `JSON`
- **IDENTITY**: 정수형 타입에서만 사용 가능, 자동 증가 설정
- **DECIMAL/NUMERIC**: 정밀도(precision)와 스케일(scale) 지정 필수
- **감사 컬럼**: 모든 테이블에 `created_at`, `updated_at` 권장
- **클러스터드 인덱스**: 기본키에 자동 적용
- **네이밍**: 테이블은 PascalCase, 컬럼은 snake_case 권장 (사용자 정의 가능)

## 아키텍처 패턴 (Clean Architecture)
- **Domain**: 순수 비즈니스 로직, 외부 의존성 없음
- **Application**: 유스케이스 구현, 트랜잭션 관리
- **Infrastructure**: 데이터 접근, 외부 시스템 연동
- **Presentation**: REST API, DTO 변환

### 코드 구성 원칙
- 기능별 패키지 구조 (계층별보다 우선)
- 포트-어댑터 패턴으로 의존성 역전
- DTO와 도메인 모델 명확히 분리

## API 설계 표준
- HTTP 상태 코드: 200/201/400/404/500 적절히 사용
- 에러 응답: `{"error": "message", "code": "ERROR_CODE"}`
- Bean Validation으로 클라이언트/서버 양쪽 검증
- 글로벌 예외 핸들러로 일관된 응답

## UI/UX 가이드라인
- **실시간 피드백**: 빨간색(오류), 노란색(경고), 초록색(성공), 파란색(정보)
- **색상 시스템**: Tailwind CSS 색상 팔레트 활용
  - 프로젝트: 파란색 (blue-500)
  - 테이블: 초록색 (green-500)
  - 컬럼: 보라색 (purple-500)
  - 검증: 노란색 (yellow-500)
  - 내보내기: 인디고 (indigo-500)
- **레이아웃**: 원페이지 대시보드로 모든 기능 통합
- **인라인 편집**: ERD 스타일 20-column 그리드로 빠른 편집
- **키보드 네비게이션**: Tab/Enter/Esc 지원으로 마우스 없이 작업 가능
- **반응형 디자인**: Tailwind CSS 활용한 모바일/데스크톱 대응
- **로딩 상태**: 스피너와 스켈레톤 UI로 로딩 피드백
- **에러 처리**: 토스트 메시지와 인라인 에러 표시
- **접근성**: ARIA 레이블과 키보드 접근성 준수

## 성능 및 품질 기준
- **API 응답 시간**: 500ms 이하 목표
- **JPA 최적화**: N+1 문제 방지 (fetch join, @EntityGraph 활용)
- **쿼리 최적화**: 인덱스 활용 및 불필요한 조인 제거
- **프론트엔드 최적화**:
  - 코드 스플리팅 적용
  - React.memo와 useMemo로 불필요한 리렌더링 방지
  - 가상 스크롤링으로 대량 데이터 처리
  - API 호출 디바운싱 및 캐싱
- **테스트 커버리지**: 80% 이상 목표
- **테스트 종류**:
  - 단위 테스트: JUnit 5 + Mockito (백엔드), Vitest (프론트엔드)
  - 통합 테스트: Spring Boot Test (백엔드)
  - E2E 테스트: Playwright (프론트엔드)
- **코드 품질**:
  - ESLint + Prettier (프론트엔드)
  - SpotBugs + Checkstyle (백엔드)
  - SonarQube 정적 분석 권장

## 개발 도구 활용
- **백엔드 테스팅**:
  - JUnit 5: 단위 테스트 프레임워크
  - Mockito: 모킹 라이브러리
  - Spring Boot Test: 통합 테스트
  - H2: 인메모리 테스트 데이터베이스
- **프론트엔드 테스팅**:
  - Vitest: 단위 테스트 프레임워크 (Jest 대체)
  - React Testing Library: 컴포넌트 테스트
  - Playwright: E2E 테스트
  - jsdom: DOM 시뮬레이션
- **API 문서화**:
  - OpenAPI/Swagger: 자동 API 문서 생성
  - 접속: http://localhost:8080/api/swagger-ui.html
- **빌드 도구**:
  - Gradle 8.5+: 백엔드 빌드 및 의존성 관리
  - Vite: 프론트엔드 빌드 및 개발 서버
  - Yarn: 프론트엔드 패키지 관리
- **데이터베이스 마이그레이션**:
  - Flyway: 버전 관리 및 마이그레이션
- **개발 환경**:
  - Docker Compose: PostgreSQL + pgAdmin 로컬 환경
  - PowerShell 스크립트: 통합 실행 및 관리