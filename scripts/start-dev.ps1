# Database Modeling Tool - 개발 환경 시작 스크립트 (PowerShell)

Write-Host "🚀 Database Modeling Tool 개발 환경을 시작합니다..." -ForegroundColor Green

# 환경 변수 로드
if (Test-Path ".env.dev") {
    Write-Host "📋 개발 환경 변수를 로드합니다..." -ForegroundColor Yellow
    Get-Content ".env.dev" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "⚠️  .env.dev 파일이 없습니다. 기본 설정을 사용합니다." -ForegroundColor Yellow
}

# Docker 컨테이너 시작
Write-Host "🐳 Docker 컨테이너를 시작합니다..." -ForegroundColor Cyan
docker-compose up -d postgres-dev pgadmin

# 데이터베이스 연결 대기
Write-Host "⏳ 데이터베이스 연결을 기다립니다..." -ForegroundColor Yellow
$timeout = 30
$counter = 0

do {
    if ($counter -ge $timeout) {
        Write-Host "❌ 데이터베이스 연결 시간 초과" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "   데이터베이스 연결 대기 중... ($counter/$timeout)" -ForegroundColor Gray
    Start-Sleep -Seconds 1
    $counter++
    
    $result = docker exec dbmodeling-postgres-dev pg_isready -U postgres -d dbmodeling_dev 2>$null
} while ($LASTEXITCODE -ne 0)

Write-Host "✅ 데이터베이스가 준비되었습니다!" -ForegroundColor Green

# Flyway 마이그레이션 실행
Write-Host "🔄 데이터베이스 마이그레이션을 실행합니다..." -ForegroundColor Cyan
Set-Location backend
& .\mvnw.cmd flyway:migrate `
    "-Dflyway.url=jdbc:postgresql://localhost:5432/dbmodeling_dev" `
    "-Dflyway.user=postgres" `
    "-Dflyway.password=postgres"

# Spring Boot 애플리케이션 시작
Write-Host "🌱 Spring Boot 애플리케이션을 시작합니다..." -ForegroundColor Green
& .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"

Write-Host "🎉 개발 환경이 성공적으로 시작되었습니다!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 접속 정보:" -ForegroundColor White
Write-Host "   - 백엔드 API: http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "   - Swagger UI: http://localhost:8080/api/swagger-ui.html" -ForegroundColor Cyan
Write-Host "   - pgAdmin: http://localhost:5050 (admin@dbmodeling.com / admin123)" -ForegroundColor Cyan
Write-Host ""