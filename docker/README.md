# Database Modeling Tool - Docker 개발 환경

이 디렉토리는 Database Modeling Tool의 로컬 개발 환경을 위한 Docker 설정을 포함합니다.

## 구성 요소

### PostgreSQL 데이터베이스
- **개발용**: `postgres-dev` (포트 5432)
- **테스트용**: `postgres-test` (포트 5433)

### pgAdmin
- **웹 인터페이스**: http://localhost:5050
- **로그인**: admin@dbmodeling.com / admin123

## 사용 방법

### 1. 개발 환경 시작
```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스만 시작
docker-compose up -d postgres-dev
```

### 2. 데이터베이스 연결 확인
```bash
# 개발 데이터베이스 연결 테스트
docker exec -it dbmodeling-postgres-dev psql -U postgres -d dbmodeling_dev -c "SELECT version();"

# 테스트 데이터베이스 연결 테스트
docker exec -it dbmodeling-postgres-test psql -U postgres -d dbmodeling_test -c "SELECT version();"
```

### 3. 개발 환경 정리
```bash
# 서비스 중지
docker-compose down

# 데이터까지 완전 삭제
docker-compose down -v
```

## 데이터베이스 스키마

### 개발 환경
- Flyway 마이그레이션이 자동으로 실행됩니다
- 샘플 데이터가 포함됩니다
- DDL 변경 시 `hibernate.ddl-auto=update` 설정으로 자동 반영

### 테스트 환경
- 각 테스트 실행 시 스키마가 새로 생성됩니다
- Flyway는 비활성화되어 있습니다
- `hibernate.ddl-auto=create-drop` 설정 사용

## 포트 정보

| 서비스 | 포트 | 설명 |
|--------|------|------|
| postgres-dev | 5432 | 개발용 PostgreSQL |
| postgres-test | 5433 | 테스트용 PostgreSQL |
| pgadmin | 5050 | 데이터베이스 관리 도구 |

## 환경 변수

개발 환경 설정은 `.env.dev` 파일에서 관리됩니다:

```bash
# 개발 환경으로 애플리케이션 실행
export $(cat .env.dev | xargs) && ./mvnw spring-boot:run

# 또는 IDE에서 환경 변수 설정
```

## 트러블슈팅

### 포트 충돌
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep :5432

# 다른 PostgreSQL 서비스 중지
sudo systemctl stop postgresql
```

### 데이터베이스 초기화
```bash
# 볼륨 삭제 후 재시작
docker-compose down -v
docker-compose up -d
```

### 권한 문제
```bash
# 컨테이너 내부에서 권한 확인
docker exec -it dbmodeling-postgres-dev psql -U postgres -c "\du"
```