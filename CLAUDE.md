# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

MSSQL 데이터베이스 모델링 도구 - 테이블 생성부터 스키마 내보내기까지 완전한 데이터베이스 모델링 라이프사이클을 지원하는 웹 기반 플랫폼입니다.

## 아키텍처

### 백엔드 (Spring Boot)
- **Clean Architecture** (헥사고날 아키텍처) 패턴 적용
- Java 21, Spring Boot 3.2.0, PostgreSQL
- 도메인 계층과 애플리케이션 계층 완전 분리
- JPA/Hibernate를 통한 데이터 영속성
- Flyway를 통한 데이터베이스 마이그레이션

### 프론트엔드 (React)
- React 19 + TypeScript
- Zustand를 통한 상태 관리
- Tailwind CSS 스타일링
- React Flow를 통한 데이터베이스 다이어그램 시각화

## 주요 개발 명령어

### 백엔드
```bash
# 백엔드 디렉토리로 이동
cd backend

# Spring Boot 애플리케이션 실행
./mvnw spring-boot:run

# 테스트 실행
./mvnw test

# Flyway 마이그레이션
./mvnw flyway:migrate
```

### 프론트엔드
```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 개발 서버 실행
npm run dev
# 또는
yarn dev

# 빌드
npm run build

# 타입 체크
npm run type-check

# 린트
npm run lint

# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e
```

### 통합 개발 환경
```bash
# Windows
scripts/start-dev.bat

# Linux/Mac
scripts/start-dev.sh
```

## 코드 구조

### 백엔드 계층 구조
- `domain/`: 도메인 모델과 비즈니스 로직
- `application/`: 유스케이스와 애플리케이션 서비스
- `infrastructure/`: 데이터베이스, 외부 시스템 연동
- `presentation/`: REST API 컨트롤러와 DTO

### 프론트엔드 구조
- `components/`: 재사용 가능한 React 컴포넌트들
- `stores/`: Zustand 상태 관리 스토어
- `services/`: API 호출과 비즈니스 로직
- `types/`: TypeScript 타입 정의
- `utils/`: 유틸리티 함수들

## 개발 환경 설정

### 필수 요구사항
- Java 21
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (Docker로 실행)

### 프록시 설정
프론트엔드 개발 서버는 포트 3000에서 실행되며, `/api` 경로를 백엔드 포트 8080으로 프록시합니다.

### 데이터베이스
- 개발: PostgreSQL (Docker)
- 테스트: H2 (인메모리)

## 테스트 전략

### 백엔드
- 단위 테스트: JUnit 5 + Mockito
- 통합 테스트: Spring Boot Test + TestContainers
- 도메인 로직과 리포지토리 계층에 대한 포괄적 테스트 커버리지

### 프론트엔드
- 단위 테스트: Vitest + React Testing Library
- E2E 테스트: Playwright

## 중요 개발 고려사항

### 아키텍처 준수
- Clean Architecture 패턴을 엄격히 준수
- 도메인 계층은 외부 의존성 없이 순수 비즈니스 로직만 포함
- 의존성 방향은 항상 외부에서 내부로 (Dependency Rule)

### 데이터베이스 설계
- MSSQL 타겟 스키마 생성을 위한 PostgreSQL 백엔드 설계
- Flyway를 통한 점진적 마이그레이션 관리
- 엔티티와 도메인 모델 분리

### 상태 관리
- Zustand를 통한 경량 상태 관리
- 컴포넌트별 로컬 상태와 글로벌 상태 적절히 분리

### API 설계
- RESTful API 원칙 준수
- OpenAPI/Swagger를 통한 API 문서화
- 일관된 응답 형식 (ApiResponse wrapper)