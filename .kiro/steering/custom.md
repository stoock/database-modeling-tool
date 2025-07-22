---
inclusion: always
---

항상 한글로 대답해줘

# MSSQL 데이터베이스 모델링 도구 - 프로젝트 규칙

## 핵심 제품 컨벤션

### 데이터베이스 설계 표준
- **테이블명**: 단수형 PascalCase (예: `User`, `OrderItem`)
- **컬럼명**: snake_case (예: `user_id`, `created_at`)
- **기본키**: 항상 `id` (BIGINT IDENTITY)
- **외래키**: `{참조테이블명}_id` 형식
- **필수 감사 컬럼**: 모든 테이블에 `created_at`, `updated_at` 포함

### MSSQL 특화 규칙
- **데이터 타입**: `NVARCHAR`, `BIGINT`, `DATETIME2`, `DECIMAL(18,2)` 사용
- **인덱스 명명**: `IX_{테이블명}_{컬럼명}` (예: `IX_User_Email`)
- **제약조건**: `{타입}_{테이블명}_{컬럼명}` (예: `FK_Order_UserId`, `CK_User_Status`)
- **클러스터드 인덱스**: 기본키에 자동 적용

## 아키텍처 패턴

### 클린 아키텍처 계층 분리
- **Domain**: 비즈니스 로직과 엔티티 (외부 의존성 없음)
- **Application**: 유스케이스와 서비스 (도메인 조율)
- **Infrastructure**: 데이터 접근과 외부 통합
- **Presentation**: API 컨트롤러와 DTO

### 코드 구성 원칙
- 기능별 패키지 구조 (계층별 구조보다 우선)
- 포트-어댑터 패턴으로 의존성 역전
- 도메인 모델은 순수 Java 객체로 유지
- 애플리케이션 서비스에서 트랜잭션 경계 관리

## 개발 표준

### API 설계
- RESTful 원칙 준수
- HTTP 상태 코드 정확히 사용 (200, 201, 400, 404, 500)
- 일관된 에러 응답 형식: `{"error": "message", "code": "ERROR_CODE"}`
- 요청/응답 DTO는 도메인 모델과 분리

### 검증 및 에러 처리
- 클라이언트와 서버 양쪽 검증 (Bean Validation 사용)
- 도메인 규칙 위반 시 명확한 비즈니스 예외 발생
- 글로벌 예외 핸들러로 일관된 에러 응답

### UI/UX 가이드라인
- **실시간 피드백**: 빨간색(오류), 노란색(경고), 초록색(성공)
- **React Flow**: 테이블 노드와 관계선 시각화
- **즉시 검증**: 사용자 입력 시 실시간 명명 규칙 검증
- **반응형 디자인**: Tailwind CSS로 모바일 친화적 구현

## 성능 및 보안

### 성능 최적화
- API 응답 시간 500ms 이하 유지
- JPA N+1 문제 방지 (fetch join, @EntityGraph 활용)
- 프론트엔드 코드 스플리팅과 지연 로딩
- 대용량 스키마 처리를 위한 페이지네이션

### 보안 요구사항
- 모든 API 엔드포인트 인증/인가 적용
- JPA 파라미터화된 쿼리로 SQL 인젝션 방지
- 민감 정보 로깅 금지
- CORS 정책 적절히 설정

## 테스팅 전략
- **단위 테스트**: 도메인 로직과 서비스 계층 (JUnit 5 + Mockito)
- **통합 테스트**: API 엔드포인트 (@SpringBootTest)
- **E2E 테스트**: 주요 사용자 플로우 (Playwright)
- **테스트 데이터**: @Sql 스크립트로 일관된 테스트 환경 구성

## E2E 테스트
너는 MCP를 사용할수 있어

Playwright 사용 예시
페이지 열기
{ "tool":"playwright-stealth","parameters":{"action":"playwright_navigate","url":"https://example.com"}} ,
로그인 버튼 클릭
{ "tool":"playwright-stealth","parameters":{"action":"playwright_click","selector":"#login-button"}} ,
검색어 입력 후 엔터
{ "tool":"playwright-stealth","parameters":{"action":"playwright_fill","selector":"input[name='q']","text":"MCP Server"}} ,
{ "tool":"playwright-stealth","parameters":{"action":"press","selector":"input[name='q']","key":"Enter"}} ,
페이지 스크린샷 저장
{ "tool":"playwright-stealth","parameters":{"action":"playwright_screenshot","path":"search-results.png"}} ,
콘솔 에러 로그 수집
{ "tool":"playwright-stealth","parameters":{"action":"playwright_console_logs"}} ,
네트워크 요청 내역 수집
{ "tool":"playwright-stealth","parameters":{"action":"getNetworkRequests"}} ,
JS 평가(페이지 타이틀 가져오기)
{ "tool":"playwright-stealth","parameters":{"action":"evaluate","expression":"document.title"}} ,
접근성 스냅샷(구조화된 DOM)
{ "tool":"playwright-stealth","parameters":{"action":"accessibilitySnapshot"}}
라이브러리 버전 조회
{ "tool": "context7", "parameters": {"query": "axios 최신 버전 알려줘"}}
패키지 목록 검색
{ "tool": "context7", "parameters": {"query": "lodash 사용법 예시"}}

1. playwright로 접속해 사이트 조사할 때에는 DOM 구조를 먼저 확인한 후, 그에 맞게 클릭, 내용 보기를 진행해줘. 그리고 특정 웹페이지가 나오면 먼저 텍스트 박스와 버튼이나 링크가 있는지 살펴보고 필요하면 이것저것 눌러서 진행해봐.