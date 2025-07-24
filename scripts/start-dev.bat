@echo off
setlocal enabledelayedexpansion

echo 🚀 Database Modeling Tool 개발 환경을 시작합니다...

REM 환경 변수 로드
if exist .env.dev (
    echo 📋 개발 환경 변수를 로드합니다...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env.dev") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
) else (
    echo ⚠️  .env.dev 파일이 없습니다. 기본 설정을 사용합니다.
)

REM Docker 컨테이너 시작
echo 🐳 Docker 컨테이너를 시작합니다...
docker-compose up -d postgres-dev pgadmin

REM 데이터베이스 연결 대기
echo ⏳ 데이터베이스 연결을 기다립니다...
set timeout=30
set counter=0

:wait_loop
docker exec dbmodeling-postgres-dev pg_isready -U postgres -d dbmodeling_dev >nul 2>&1
if %errorlevel% equ 0 goto db_ready

if %counter% geq %timeout% (
    echo ❌ 데이터베이스 연결 시간 초과
    exit /b 1
)

echo    데이터베이스 연결 대기 중... (%counter%/%timeout%)
timeout /t 1 /nobreak >nul
set /a counter+=1
goto wait_loop

:db_ready
echo ✅ 데이터베이스가 준비되었습니다!

REM Flyway 마이그레이션 실행
echo 🔄 데이터베이스 마이그레이션을 실행합니다...
cd backend
call mvnw.cmd flyway:migrate ^
    -Dflyway.url=jdbc:postgresql://localhost:5432/dbmodeling_dev ^
    -Dflyway.user=postgres ^
    -Dflyway.password=postgres

REM Spring Boot 애플리케이션 시작
echo 🌱 Spring Boot 애플리케이션을 시작합니다...
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev

echo 🎉 개발 환경이 성공적으로 시작되었습니다!
echo.
echo 📍 접속 정보:
echo    - 백엔드 API: http://localhost:8080/api
echo    - Swagger UI: http://localhost:8080/api/swagger-ui.html
echo    - pgAdmin: http://localhost:5050 (admin@dbmodeling.com / admin123)
echo.

pause