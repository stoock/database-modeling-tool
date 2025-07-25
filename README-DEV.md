# Database Modeling Tool - 개발 환경 가이드

## 🚀 빠른 시작 (Windows 11 + Podman)

### 전체 개발 환경 시작
```powershell
# 1. 개발 환경 시작 (데이터베이스 + 컨테이너)
.\scripts\start-dev.ps1

# 2. 백엔드 시작 (새 터미널)
.\scripts\start-backend.ps1

# 3. 프론트엔드 시작 (새 터미널)
.\scripts\start-frontend.ps1
```

### 개별 서비스 시작
```powershell
# 백엔드만 시작
.\scripts\start-backend.ps1

# 프론트엔드만 시작
.\scripts\start-frontend.ps1
```

## 📋 사전 요구사항

### 필수 소프트웨어
- **Windows 11** (WSL2 권장)
- **Podman** 4.0+ 
  ```powershell
  winget install RedHat.Podman
  ```
- **Java 17+** (OpenJDK 권장)
  ```powershell
  winget install Microsoft.OpenJDK.17
  ```
- **Node.js 18+** 
  ```powershell
  winget install OpenJS.NodeJS
  ```
- **Yarn** 
  ```powershell
  npm install -g yarn
  ```

### 선택사항
- **Git** (소스 코드 관리)
- **Visual Studio Code** (IDE)
- **Windows Terminal** (향상된 터미널 경험)

## 🐳 Podman 설정

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

## 🗄️ 데이터베이스 설정

### 자동 설정 (권장)
`start-dev.ps1` 스크립트가 자동으로 다음을 수행합니다:
- PostgreSQL 15 컨테이너 시작
- pgAdmin 컨테이너 시작
- 개발/테스트 데이터베이스 생성
- Flyway 마이그레이션 실행

### 수동 설정
```powershell
# PostgreSQL 컨테이너 시작
podman run -d \
  --name dbmodeling-postgres-dev \
  --network dbmodeling-network \
  -p 5432:5432 \
  -e POSTGRES_DB=dbmodeling_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -v dbmodeling-postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine

# pgAdmin 컨테이너 시작
podman run -d \
  --name dbmodeling-pgadmin-dev \
  --network dbmodeling-network \
  -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@dbmodeling.com \
  -e PGLADMIN_DEFAULT_PASSWORD=admin123 \
  -v dbmodeling-pgadmin-data:/var/lib/pgadmin \
  dpage/pgadmin4:latest
```

## 🌱 백엔드 개발

### 개발 서버 시작
```powershell
cd backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

### 테스트 실행
```powershell
# 단위 테스트
.\mvnw.cmd test

# 통합 테스트
.\mvnw.cmd verify

# 특정 테스트 클래스
.\mvnw.cmd test -Dtest=ProjectControllerTest
```

### 데이터베이스 마이그레이션
```powershell
# 마이그레이션 실행
.\mvnw.cmd flyway:migrate

# 마이그레이션 정보 확인
.\mvnw.cmd flyway:info

# 마이그레이션 롤백 (주의!)
.\mvnw.cmd flyway:clean
```

### API 문서
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/v3/api-docs

## ⚛️ 프론트엔드 개발

### 개발 서버 시작
```powershell
cd frontend
yarn dev
```

### 빌드 및 테스트
```powershell
# 개발 빌드
yarn build

# 프로덕션 빌드
yarn build:prod

# 단위 테스트
yarn test

# E2E 테스트
yarn test:e2e

# 타입 체크
yarn type-check
```

### 코드 품질
```powershell
# ESLint 검사
yarn lint

# ESLint 자동 수정
yarn lint:fix

# Prettier 포맷팅
yarn format
```

## 🔧 개발 도구

### 데이터베이스 관리
- **pgAdmin**: http://localhost:5050
  - 이메일: admin@dbmodeling.com
  - 비밀번호: admin123

### 컨테이너 관리
```powershell
# 실행 중인 컨테이너 확인
podman ps

# 컨테이너 로그 확인
podman logs dbmodeling-postgres-dev
podman logs dbmodeling-pgadmin-dev

# 컨테이너 내부 접속
podman exec -it dbmodeling-postgres-dev psql -U postgres -d dbmodeling_dev
```

### 환경 초기화
```powershell
# 개발 환경 중지
.\scripts\stop-dev.ps1

# 개발 환경 완전 초기화 (데이터 삭제)
.\scripts\reset-dev.ps1
```

## 🐛 문제 해결

### 진단 도구
```powershell
# 개발 환경 전체 진단
.\scripts\diagnose-dev.ps1

# 간단한 개발 환경 시작 (문제가 있을 때)
.\scripts\start-dev-simple.ps1
```

### 일반적인 문제

#### PowerShell 실행 정책 오류
```powershell
# 현재 사용자에 대해 실행 정책 변경 (관리자 권한 불필요)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 또는 일시적으로 우회
PowerShell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1
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
```

#### 포트 충돌
```powershell
# 포트 사용 확인
netstat -ano | findstr :5432
netstat -ano | findstr :8080
netstat -ano | findstr :5173
```

#### 데이터베이스 연결 실패
```powershell
# 컨테이너 상태 확인
podman ps -a

# 데이터베이스 로그 확인
podman logs dbmodeling-postgres-dev

# 수동 연결 테스트
podman exec -it dbmodeling-postgres-dev pg_isready -U postgres
```

#### Maven 빌드 오류
```powershell
# Maven 캐시 정리
.\mvnw.cmd clean

# 의존성 다시 다운로드
.\mvnw.cmd dependency:purge-local-repository
```

#### Node.js/Yarn 오류
```powershell
# 노드 모듈 재설치
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
yarn install
```

### 로그 위치
- **Spring Boot**: `backend/logs/`
- **Podman 컨테이너**: `podman logs <container-name>`
- **Vite**: 콘솔 출력

## 📚 추가 리소스

### 문서
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [React 공식 문서](https://react.dev/)
- [Podman 공식 문서](https://podman.io/docs)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

### 개발 가이드
- [Clean Architecture 가이드](docs/architecture.md)
- [API 설계 가이드](docs/api-design.md)
- [프론트엔드 컴포넌트 가이드](docs/frontend-components.md)
- [데이터베이스 스키마 가이드](docs/database-schema.md)

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성: `git checkout -b feature/amazing-feature`
3. 변경사항 커밋: `git commit -m 'Add amazing feature'`
4. 브랜치 푸시: `git push origin feature/amazing-feature`
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.