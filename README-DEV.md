# Database Modeling Tool - 개발 환경 가이드

## 🚀 빠른 시작

### 통합 개발 환경 시작 (권장)
```powershell
# 단계별 실행 - 순서대로 실행해주세요

# 1단계: 개발 환경 설정 (PostgreSQL + 의존성 + 마이그레이션)
.\scripts\01-env-setup.ps1

# 2단계: 애플리케이션 실행 (백엔드 + 프론트엔드 통합 실행)
.\scripts\02-run-app.ps1

# 선택사항: 시스템 진단 (100점 평가)
.\scripts\03-health-check.ps1
```

### 개별 서비스 시작
```powershell
# 백엔드만 시작 (Gradle 기반)
cd backend
.\gradlew bootRunDev

# 프론트엔드만 시작 (Vite + Yarn)
cd frontend
yarn dev
```

### 문제 해결 및 환경 관리
```powershell
# 개발 환경 중지
.\scripts\env-stop.ps1

# 개발 환경 초기화 (전체 데이터 삭제)
.\scripts\env-reset.ps1

# 빌드 검증 (실행 없이 빌드만 테스트)
.\scripts\test-build.ps1
```

## 📋 사전 요구사항

### 필수 소프트웨어
- **Java 21+** (Amazon Corretto 권장)
  ```powershell
  winget install Amazon.Corretto.21
  ```
- **Node.js 18+** 
  ```powershell
  winget install OpenJS.NodeJS
  ```
- **Yarn** 
  ```powershell
  npm install -g yarn
  ```
- **Podman** 4.0+ (컨테이너 환경용)
  ```powershell
  winget install RedHat.Podman
  ```
- **Gradle 8.5+** (Wrapper 포함 - 별도 설치 불필요)

### 선택사항
- **Git** (소스 코드 관리)
- **Visual Studio Code** (IDE) 
- **Windows Terminal** (향상된 터미널 경험)
- **pgAdmin** (데이터베이스 관리 UI - Podman으로 제공)

## 🐳 Podman 설정 및 확인

### Podman 설치 확인
```powershell
podman --version
podman info
```

### Podman Machine 초기화 (필요한 경우)
```powershell
podman machine init
podman machine start
```

### Podman 상태 확인
```powershell
# Podman 시스템 정보 확인
podman system info

# 실행 중인 컨테이너 확인
podman ps -a
```

## 🗄️ 데이터베이스 설정

### 자동 설정 (권장)
`01-env-setup.ps1` 스크립트가 자동으로 다음을 수행합니다:
- PostgreSQL 15 컨테이너 시작
- pgAdmin 컨테이너 시작
- 개발/테스트 데이터베이스 생성
- Flyway 마이그레이션 실행

### 수동 설정

#### Podman Compose 사용 (권장)
```powershell
# 전체 개발 환경 시작 (PostgreSQL + pgAdmin)
podman-compose up -d

# 개발 데이터베이스만 시작
podman-compose up -d postgres-dev

# 상태 확인
podman-compose ps

# 로그 확인
podman-compose logs postgres-dev
```

#### 개별 컨테이너 실행
```powershell
# 네트워크 생성 (처음에만)
podman network create dbmodeling-network

# PostgreSQL 컨테이너 시작
podman run -d `
  --name dbmodeling-postgres-dev `
  --network dbmodeling-network `
  -p 5432:5432 `
  -e POSTGRES_DB=dbmodeling_dev `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -v dbmodeling-postgres-data:/var/lib/postgresql/data `
  postgres:15-alpine

# pgAdmin 컨테이너 시작
podman run -d `
  --name dbmodeling-pgadmin `
  --network dbmodeling-network `
  -p 5050:80 `
  -e PGADMIN_DEFAULT_EMAIL=admin@dbmodeling.com `
  -e PGLADMIN_DEFAULT_PASSWORD=admin123 `
  -v dbmodeling-pgadmin-data:/var/lib/pgadmin `
  dpage/pgadmin4:latest
```

## 🌱 백엔드 개발 (Gradle 기반)

### 개발 서버 시작
```powershell
cd backend

# 개발 프로파일로 실행 (PostgreSQL 연결)
.\gradlew bootRunDev

# H2 테스트 환경으로 실행 (인메모리 DB)
.\gradlew bootRunH2

# IDE에서 실행: IntelliJ IDEA, VS Code + Java Extension Pack
```

### 테스트 및 빌드
```powershell
# 단위 테스트
.\gradlew test

# 린트 및 포맷 검사
.\gradlew checkstyleMain

# 전체 빌드 (테스트 포함)
.\gradlew build

# 전체 빌드 (테스트 제외 - 개발시 권장)
.\gradlew build -x test

# 특정 테스트 클래스
.\gradlew test --tests "*ValidationServiceTest*"
```

### 데이터베이스 마이그레이션 (Flyway)
```powershell
# 마이그레이션 실행
.\gradlew flywayMigrate -Pflyway.url=jdbc:postgresql://localhost:5432/dbmodeling_dev

# 마이그레이션 정보 확인
.\gradlew flywayInfo

# 마이그레이션 초기화 (주의! 모든 데이터 삭제)
.\gradlew flywayClean
```

### 알려진 이슈
- ⚠️ **테스트 실패**: 115/351개 테스트 실패 (주로 ValidationService 관련)
- 해결방안: 개발 시 `-x test` 플래그 사용으로 빌드만 수행

### API 문서
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/v3/api-docs

## ⚛️ 프론트엔드 개발 (React + Vite + Yarn)

### 개발 서버 시작
```powershell
cd frontend

# 개발 서버 시작 (포트 3000, 백엔드 프록시 설정됨)
yarn dev

# 포트 충돌 시 프로세스 종료 후 재시작
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows 에서 PID 확인 후 종료
netstat -ano | findstr ":3000" | % {Stop-Process -Id ($_ -split "\s+")[-1] -Force -ErrorAction SilentlyContinue}
```

### 빌드 및 테스트
```powershell
# 개발 빌드
yarn build

# 단위 테스트 (Vitest)
yarn test

# E2E 테스트 (Playwright)
yarn test:e2e

# 타입 체크
yarn type-check

# 커버리지 리포트
yarn test:coverage
```

### 코드 품질 및 린팅
```powershell
# ESLint 검사
yarn lint

# ESLint 자동 수정
yarn lint:fix

# Prettier 포맷팅
yarn format
```

### 알려진 이슈 및 해결사항
- ✅ **React 무한 렌더링 해결**: useAutoSave 훅 의존성 배열 수정
- ✅ **CORS 오류 해결**: 백엔드에서 포트 3000, 3001, 3002, 5173 지원
- ✅ **한글 로그 깨짐 해결**: 모든 로그 메시지 영어로 전환
- ⚠️ **자동 저장 비활성화**: 무한 렌더링 방지를 위해 임시 비활성화

## 🔧 개발 도구

### 데이터베이스 관리
- **개발DB**: PostgreSQL 15 (localhost:5432)
- **테스트DB**: H2 인메모리 (백엔드 bootRunH2 사용)
- **pgAdmin**: http://localhost:5050 (Podman으로 실행시)
  - 이메일: admin@dbmodeling.com  
  - 비밀번호: admin123

### 컨테이너 관리 (Podman)
```powershell
# 실행 중인 컨테이너 확인
podman ps

# 컨테이너 로그 확인
podman logs dbmodeling-postgres-dev
podman logs dbmodeling-pgadmin-dev

# 데이터베이스 직접 접속
podman exec -it dbmodeling-postgres-dev psql -U postgres -d dbmodeling_dev

# 데이터베이스 연결 테스트
podman exec -it dbmodeling-postgres-dev pg_isready -U postgres
```

### 환경 초기화 및 관리 스크립트
```powershell
# 개발 환경 중지
.\scripts\env-stop.ps1

# 개발 환경 완전 초기화 (모든 데이터 삭제)
.\scripts\env-reset.ps1

# 빌드 검증 (실행 없이 빌드만 테스트)
.\scripts\test-build.ps1

# 백엔드 단위 테스트
.\scripts\test-backend.ps1
```

### Podman Compose 직접 관리
```powershell
# 전체 환경 시작
podman-compose up -d

# 전체 환경 중지
podman-compose down

# 전체 환경 중지 + 볼륨 삭제 (데이터 완전 삭제)
podman-compose down -v

# 특정 서비스만 재시작
podman-compose restart postgres-dev
```

## 🐛 문제 해결

### 사용 가능한 스크립트

| 파일명 | 기능 | 용도 |
|--------|------|------|
| `01-env-setup.ps1` | 개발 환경 설정 | PostgreSQL + 의존성 + 마이그레이션 |
| `02-run-app.ps1` | 애플리케이션 실행 | 백엔드 + 프론트엔드 통합 실행 |
| `03-health-check.ps1` | 시스템 진단 (100점 평가) | 환경 상태 확인 (선택사항) |
| `env-stop.ps1` | 개발 환경 중지 | 컨테이너 정리 |
| `env-reset.ps1` | 개발 환경 초기화 | 전체 데이터 삭제 |
| `test-build.ps1` | 빌드 검증 | 실행 없이 빌드만 테스트 |
| `test-backend.ps1` | 백엔드 테스트 | 단위 테스트 실행 |

### 진단 도구
```powershell
# 개발 환경 전체 진단
.\scripts\03-health-check.ps1
```

### 일반적인 문제

#### PowerShell 실행 정책 오류
```powershell
# 현재 사용자에 대해 실행 정책 변경 (관리자 권한 불필요)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 또는 일시적으로 우회
PowerShell -ExecutionPolicy Bypass -File .\scripts\01-env-setup.ps1
```

#### Podman 연결 오류
```powershell
# Podman 버전 확인
podman --version

# Podman 시스템 정보 확인
podman system info

# Podman 서비스 재시작 (필요한 경우)
podman machine stop
podman machine start

# 컨테이너 정리
podman system prune -f
```

#### 포트 충돌 및 프로세스 관리
```powershell
# 주요 포트 사용 현황 확인
netstat -ano | findstr :3000   # 프론트엔드
netstat -ano | findstr :8080   # 백엔드 API
netstat -ano | findstr :5432   # PostgreSQL
netstat -ano | findstr :5050   # pgAdmin

# 특정 포트 프로세스 종료 (예: 포트 3000)
for /f "tokens=5" %a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %a
```

#### 데이터베이스 연결 실패
```powershell
# Podman 컨테이너 상태 확인
podman ps -a

# PostgreSQL 컨테이너 로그 확인
podman logs dbmodeling-postgres-dev

# 데이터베이스 연결 테스트
podman exec -it dbmodeling-postgres-dev pg_isready -U postgres

# 수동 데이터베이스 연결
podman exec -it dbmodeling-postgres-dev psql -U postgres -d dbmodeling_dev
```

#### Gradle 빌드 오류
```powershell
# Gradle 캐시 정리
.\gradlew clean

# 의존성 새로고침
.\gradlew --refresh-dependencies

# Gradle 데몬 중지 및 재시작
.\gradlew --stop
.\gradlew build

# 테스트 실패 시 개발용 빌드
.\gradlew build -x test
```

#### Node.js/Yarn 오류
```powershell
# 노드 모듈 재설치
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
yarn install
```

### 로그 위치 및 디버깅
- **Spring Boot**: 콘솔 출력 (`backend/logs/` 디렉토리 생성 예정)
- **Podman 컨테이너**: `podman logs <container-name>`
- **React + Vite**: 콘솔 출력 (브라우저 개발자 도구)
- **네트워크 요청**: 브라우저 Network 탭에서 API 호출 확인

## 📚 추가 리소스

### 문서
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [React 공식 문서](https://react.dev/)
- [Podman 공식 문서](https://podman.io/docs)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

### 주요 접속 정보
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **H2 콘솔** (bootRunH2 사용시): http://localhost:8080/h2-console
- **pgAdmin**: http://localhost:5050 (Podman 환경)

### 개발 가이드 및 문서
- **프로젝트 문서**: `.kiro/specs/database-modeling-tool/`
- **개발 설정**: `CLAUDE.md`
- **MSSQL 명명 규칙**: `.kiro/steering/custom.md`
- **Clean Architecture**: 백엔드 4계층 구조 (domain/application/infrastructure/presentation)

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성: `git checkout -b feature/amazing-feature`
3. 변경사항 커밋: `git commit -m 'Add amazing feature'`
4. 브랜치 푸시: `git push origin feature/amazing-feature`
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.