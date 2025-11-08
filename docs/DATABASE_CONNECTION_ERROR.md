# PostgreSQL 연결 오류 처리

## 개요

개발 환경에서 PostgreSQL이 실행되지 않을 때 명확한 오류 메시지를 제공하여 빠른 문제 해결을 지원합니다.

## 오류 감지 시점

### 1. 애플리케이션 시작 시

애플리케이션이 시작되면 자동으로 데이터베이스 연결을 확인하고 로그에 상태를 출력합니다.

**성공 시:**
```
✅ PostgreSQL 데이터베이스 연결 성공
📊 데이터베이스 URL: jdbc:postgresql://localhost:5432/dbmodeling_dev
```

**실패 시:**
```
❌ PostgreSQL 데이터베이스 연결 실패!
💡 해결 방법:
   1. Docker 컨테이너 실행: docker-compose up -d
   2. 또는 스크립트 실행: .\scripts\01-env-setup.ps1
   3. PostgreSQL 상태 확인: docker ps
오류 상세: Connection refused
```

### 2. 헬스 체크 API

`GET /api/health` 엔드포인트를 통해 실시간으로 데이터베이스 연결 상태를 확인할 수 있습니다.

**정상 응답 (200 OK):**
```json
{
  "status": "UP",
  "timestamp": "2024-01-15T10:30:00",
  "service": "Database Modeling Tool API",
  "version": "1.0.0",
  "database": "UP"
}
```

**오류 응답 (503 Service Unavailable):**
```json
{
  "status": "DEGRADED",
  "timestamp": "2024-01-15T10:30:00",
  "service": "Database Modeling Tool API",
  "version": "1.0.0",
  "database": "DOWN",
  "message": "PostgreSQL 데이터베이스에 연결할 수 없습니다. Docker 컨테이너가 실행 중인지 확인하세요.",
  "hint": "실행 명령: docker-compose up -d 또는 .\\scripts\\01-env-setup.ps1"
}
```

### 3. 프론트엔드 에러 처리

프론트엔드에서는 503 상태 코드를 받으면 사용자에게 명확한 안내 메시지를 표시합니다:

**에러 메시지:**
```
서비스 이용 불가
데이터베이스 연결에 실패했습니다. PostgreSQL이 실행 중인지 확인해주세요.
```

이 메시지는 `frontend/src/lib/errorHandler.ts`에서 관리되며, 사용자가 즉시 문제를 파악하고 해결할 수 있도록 구체적인 안내를 제공합니다.

## 연결 설정

### application-dev.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dbmodeling_dev
    username: postgres
    password: postgres
    hikari:
      connection-timeout: 5000        # 5초 내 연결 실패 시 오류
      validation-timeout: 3000        # 3초 내 검증 실패 시 오류
      initialization-fail-timeout: -1 # 초기화 실패 시 즉시 오류
```

## 에러 메시지 체계

### 백엔드 (API 응답)
- **503 Service Unavailable**: 데이터베이스 연결 실패 시 반환
- **응답 본문**: 상세한 오류 정보와 해결 방법 힌트 포함

### 프론트엔드 (사용자 메시지)
- **에러 핸들러**: `frontend/src/lib/errorHandler.ts`에서 중앙 집중식 관리
- **503 에러**: "데이터베이스 연결에 실패했습니다. PostgreSQL이 실행 중인지 확인해주세요."
- **네트워크 에러**: "백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (http://localhost:8080)"
- **토스트 알림**: 사용자에게 시각적 피드백 제공

## 문제 해결 가이드

### 1. PostgreSQL 컨테이너 시작

```powershell
# 방법 1: Docker Compose 직접 실행
cd docker
docker-compose up -d

# 방법 2: 통합 스크립트 실행 (권장)
.\scripts\01-env-setup.ps1
```

### 2. PostgreSQL 상태 확인

```powershell
# 컨테이너 실행 상태 확인
docker ps

# PostgreSQL 로그 확인
docker logs postgres-db

# PostgreSQL 접속 테스트
docker exec -it postgres-db psql -U postgres -d dbmodeling_dev
```

### 3. 포트 충돌 확인

```powershell
# 5432 포트 사용 중인 프로세스 확인
netstat -ano | findstr :5432
```

### 4. 데이터베이스 재시작

```powershell
# 컨테이너 재시작
docker-compose restart postgres

# 또는 완전히 재생성
docker-compose down
docker-compose up -d
```

## 에러 처리 아키텍처

### 계층별 책임

**백엔드 (Spring Boot)**
- `HealthController`: 헬스 체크 엔드포인트 제공
- `DatabaseConnectionChecker`: 애플리케이션 시작 시 연결 검증
- `GlobalExceptionHandler`: 데이터베이스 예외를 503 응답으로 변환

**프론트엔드 (React)**
- `errorHandler.ts`: 중앙 집중식 에러 파싱 및 변환
- `toastStore.ts`: 사용자 알림 상태 관리
- API 클라이언트: Axios 인터셉터로 에러 자동 처리

### 에러 타입 분류

```typescript
ErrorType.NETWORK    // 네트워크 연결 실패 (백엔드 서버 미실행)
ErrorType.SERVER     // 서버 오류 (503: 데이터베이스 연결 실패)
ErrorType.TIMEOUT    // 요청 시간 초과
ErrorType.VALIDATION // 입력 데이터 검증 실패
ErrorType.NOT_FOUND  // 리소스 없음
ErrorType.CONFLICT   // 데이터 충돌
```

## 개발 팁

### 헬스 체크 활용

개발 중 주기적으로 헬스 체크 API를 호출하여 데이터베이스 연결 상태를 모니터링할 수 있습니다.

```bash
# curl 사용
curl http://localhost:8080/api/health

# PowerShell 사용
Invoke-RestMethod -Uri http://localhost:8080/api/health
```

### 자동 재연결

HikariCP는 연결 풀을 관리하며, 일시적인 연결 끊김 시 자동으로 재연결을 시도합니다.
- `connection-timeout`: 5초
- `validation-timeout`: 3초
- 최대 재시도: 자동 (HikariCP 기본 동작)

### 로그 레벨 조정

더 상세한 데이터베이스 연결 로그가 필요한 경우:

```yaml
logging:
  level:
    com.zaxxer.hikari: DEBUG
    org.postgresql: DEBUG
```

## 참고 자료

- [HikariCP 설정 가이드](https://github.com/brettwooldridge/HikariCP#configuration-knobs-baby)
- [PostgreSQL JDBC 드라이버](https://jdbc.postgresql.org/documentation/)
- [Spring Boot 데이터소스 설정](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#application-properties.data)
