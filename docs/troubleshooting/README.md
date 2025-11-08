# 문제 해결 가이드

프로젝트 사용 중 발생할 수 있는 일반적인 문제와 해결 방법을 정리한 문서입니다.

## 📋 목차

1. [Windows 한글 인코딩 문제](./windows-encoding.md)
2. 데이터베이스 연결 문제 (작성 예정)
3. 포트 충돌 문제 (작성 예정)
4. 빌드 오류 (작성 예정)

## 🔥 자주 발생하는 문제

### 1. Windows에서 한글 로그 깨짐

**증상**: 백엔드 실행 시 한글이 `??PostgreSQL ?곗씠?곕쿋?댁뒪` 처럼 깨져 보임

**해결**: [Windows 한글 인코딩 문제 해결 가이드](./windows-encoding.md) 참고

**빠른 해결**:
```powershell
# 콘솔 인코딩을 UTF-8로 변경
chcp 65001

# 환경 변수 설정
$env:JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8"
$env:GRADLE_OPTS = "-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8"

# 백엔드 실행
cd backend
./gradlew bootRunDev
```

### 2. 포트 8080 이미 사용 중

**증상**: `Port 8080 was already in use` 오류

**해결**:
```powershell
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :8080

# 프로세스 종료 (PID는 위 명령어 결과에서 확인)
taskkill /F /PID [PID번호]
```

### 3. PostgreSQL 연결 실패

**증상**: `데이터베이스 연결에 실패했습니다` 메시지

**해결**:
```powershell
# Docker 컨테이너 상태 확인
docker ps

# 컨테이너가 없으면 시작
.\scripts\01-env-setup.ps1
```

### 4. Gradle 빌드 실패

**증상**: `BUILD FAILED` 오류

**해결**:
```powershell
cd backend

# Gradle 캐시 정리
./gradlew clean

# Gradle 데몬 중지
./gradlew --stop

# 다시 빌드
./gradlew build
```

### 5. 프론트엔드 의존성 오류

**증상**: `Module not found` 또는 `Cannot find module` 오류

**해결**:
```bash
cd frontend

# node_modules 삭제
rm -rf node_modules

# yarn.lock 삭제 (선택사항)
rm yarn.lock

# 의존성 재설치
yarn install
```

## 🆘 추가 도움이 필요한 경우

1. **GitHub Issues**: 프로젝트 저장소의 Issues 탭에서 검색하거나 새 이슈 생성
2. **로그 확인**: 오류 발생 시 전체 로그를 확인하여 근본 원인 파악
3. **환경 확인**: Java, Node.js, Docker 버전이 요구사항을 만족하는지 확인

## 📚 관련 문서

- [README.md](../../README.md) - 프로젝트 개요 및 빠른 시작
- [기술 스택](.kiro/steering/tech.md) - 사용된 기술 상세 정보
- [프로젝트 구조](.kiro/steering/structure.md) - 디렉토리 구조 설명
