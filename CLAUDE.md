# CLAUDE.md

Claude Code AI 개발 어시스턴트 전용 가이드 파일입니다.

## 프로젝트 개요

**MSSQL 데이터베이스 모델링 도구** - 시각적 스키마 설계, MSSQL 전용 타입 지원, 실시간 검증, SQL 자동 생성 웹 플랫폼

### 핵심 기능
- 🎨 시각적 스키마 설계 (React Flow)
- 🔧 MSSQL 전용 데이터 타입 지원
- ⚡ 실시간 명명 규칙 검증
- 📤 SQL 스크립트 자동 생성

### 현재 상태
- ✅ 백엔드: Clean Architecture 4계층 완료
- ✅ 프론트엔드: 16.3단계 완료 (컬럼 관리)
- 🔄 다음: API 연동 및 에러 처리 (17단계)

## 아키텍처

### 스택
**백엔드**: Java 21 + Spring Boot 3.2.0 + PostgreSQL + Clean Architecture  
**프론트엔드**: React 19 + TypeScript + Vite + Tailwind CSS + Zustand  
**빌드**: Gradle 8.5+ (백엔드), Yarn (프론트엔드)  
**테스트**: JUnit 5 + Vitest + Playwright

## 빠른 시작

### 통합 실행 (권장)
```powershell
.\scripts\01-env-setup.ps1    # 환경 설정
.\scripts\02-run-app.ps1      # 앱 실행
```

### 개별 실행
```bash
# 백엔드 (Java 21 + Spring Boot)
cd backend && ./gradlew bootRunDev
# 백엔드 빌드
cd backend && ./gradlew build
# 백엔드 Gradle 데몬 중지
cd backend && ./gradlew --stop

# 프론트엔드 (React + Vite)
cd frontend && yarn dev
# 프론트엔드 빌드
cd frontend && yarn build
# 프론트엔드 포트 프로세스 중지
cd frontend && netstat -ano | findstr ":3000" | % {Stop-Process -Id ($_ -split "\s+")[-1] -Force -ErrorAction SilentlyContinue}
```

### 주요 접속
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080/api
- Swagger: http://localhost:8080/api/swagger-ui.html

## 구조

### 백엔드 (Clean Architecture)
```
domain/ → application/ → infrastructure/ → presentation/
도메인     유스케이스      데이터 접근       API 컨트롤러
```

### 프론트엔드 
```
components/TableDesigner → stores/Zustand → services/API
```

### 필수 요구사항
- Java 21, Node.js 18+, Docker
- PostgreSQL (포트 5432), pgAdmin (포트 5050)

## 핵심 가이드라인

### MSSQL 명명 규칙 (엄격 준수)
- **테이블**: PascalCase (`User`, `OrderItem`)
- **컬럼**: snake_case (`user_id`, `created_at`)
- **기본키**: 항상 `id` (BIGINT IDENTITY)
- **외래키**: `{테이블명}_id` 형식
- **인덱스**: `IX_{테이블명}_{컬럼명}`

### API 설계
- RESTful 설계, HTTP 상태 코드 적절 사용
- 에러 응답: `{"error": "message", "code": "ERROR_CODE"}`
- Bean Validation 적용, OpenAPI 문서화

### 성능 기준
- API 응답 500ms 이하
- JPA N+1 방지
- 테스트 커버리지 80% 이상

### 검증 명령어
```bash
# 프론트엔드
yarn lint && yarn type-check

# 백엔드  
./gradlew test
```

## 문서 참조
- 요구사항: `.kiro/specs/database-modeling-tool/requirements.md`
- 설계: `.kiro/specs/database-modeling-tool/design.md`
- 구현 계획: `.kiro/specs/database-modeling-tool/tasks.md`

## AI 어시스턴트 지침

### 언어 정책
- **모든 응답 한글로 제공** (custom.md 정책)
- 코드/명령어는 영어, 설명은 한글

### Kiro 문서 연동
- `.kiro/steering/custom.md`: 개발 규칙 및 명명 표준
- `.kiro/specs/`: 요구사항, 설계, 구현 계획 참조
- 파일 변경 시 자동 반영 (system-reminder 기반)