---
inclusion: always
---

# MSSQL 데이터베이스 모델링 도구 - 개발 가이드

## 프로젝트 규칙
- 모든 응답과 코멘트는 한글로 작성
- 설치 전 기존 버전 호환성 확인 필수
- 코드 작성 시 즉시 실행 가능한 형태로 제공

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
- 데이터 타입: `NVARCHAR`, `BIGINT`, `DATETIME2`, `DECIMAL(18,2)` 우선
- 모든 테이블에 `created_at`, `updated_at` 감사 컬럼 필수
- 클러스터드 인덱스는 기본키에 자동 적용

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
- 실시간 피드백: 빨간색(오류), 노란색(경고), 초록색(성공)
- React Flow로 테이블 관계 시각화
- 입력 시 즉시 명명 규칙 검증
- Tailwind CSS 활용한 반응형 디자인

## 성능 및 품질 기준
- API 응답 시간 500ms 이하 목표
- JPA N+1 문제 방지 (fetch join, @EntityGraph 활용)
- 프론트엔드 코드 스플리팅 적용
- 단위/통합/E2E 테스트 필수

## 개발 도구 활용
- **테스팅**: JUnit 5 + Mockito (백엔드), Jest + RTL (프론트엔드)
- **E2E**: Playwright로 주요 플로우 검증
- **API 문서**: OpenAPI/Swagger 자동 생성