# Database Modeling Tool - 백엔드 시작 스크립트 (PowerShell for Windows 11)

Write-Host "🌱 Spring Boot 백엔드를 시작합니다..." -ForegroundColor Green

# 현재 위치 확인
$currentPath = Get-Location
if (-not (Test-Path "backend")) {
    if (Test-Path "..\backend") {
        Write-Host "📁 backend 디렉토리로 이동합니다..." -ForegroundColor Yellow
        Set-Location backend
    } else {
        Write-Host "❌ backend 디렉토리를 찾을 수 없습니다." -ForegroundColor Red
        Write-Host "   프로젝트 루트 디렉토리에서 실행하세요." -ForegroundColor Yellow
        exit 1
    }
} else {
    Set-Location backend
}

# Maven Wrapper 확인
if (-not (Test-Path "mvnw.cmd")) {
    Write-Host "❌ Maven Wrapper (mvnw.cmd)를 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

# 데이터베이스 연결 확인
Write-Host "🔍 데이터베이스 연결을 확인합니다..." -ForegroundColor Cyan
try {
    $dbCheck = podman exec dbmodeling-postgres-dev pg_isready -U postgres -d dbmodeling_dev 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 데이터베이스가 실행되지 않았습니다." -ForegroundColor Red
        Write-Host "   먼저 개발 환경을 시작하세요: .\scripts\start-dev.ps1" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ 데이터베이스 연결 확인 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ 데이터베이스 연결 확인 실패" -ForegroundColor Red
    Write-Host "   Podman 컨테이너가 실행 중인지 확인하세요: podman ps" -ForegroundColor Yellow
    exit 1
}

# 환경 변수 설정
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/dbmodeling_dev"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "postgres"

Write-Host "⚙️  환경 설정:" -ForegroundColor Cyan
Write-Host "   - Profile: dev" -ForegroundColor Gray
Write-Host "   - Database: localhost:5432/dbmodeling_dev" -ForegroundColor Gray
Write-Host "   - User: postgres" -ForegroundColor Gray

# 컴파일 및 테스트 (선택사항)
$runTests = Read-Host "테스트를 실행하시겠습니까? (y/N)"
if ($runTests -eq "y" -or $runTests -eq "Y") {
    Write-Host "🧪 테스트를 실행합니다..." -ForegroundColor Cyan
    & .\mvnw.cmd test -Dspring.profiles.active=test
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 테스트 실패" -ForegroundColor Red
        $continueAnyway = Read-Host "테스트가 실패했지만 계속 진행하시겠습니까? (y/N)"
        if ($continueAnyway -ne "y" -and $continueAnyway -ne "Y") {
            exit 1
        }
    } else {
        Write-Host "✅ 모든 테스트 통과" -ForegroundColor Green
    }
}

# Spring Boot 애플리케이션 시작
Write-Host ""
Write-Host "🚀 Spring Boot 애플리케이션을 시작합니다..." -ForegroundColor Green
Write-Host "   포트: 8080" -ForegroundColor Gray
Write-Host "   프로필: dev" -ForegroundColor Gray
Write-Host ""
Write-Host "⏹️  중지하려면 Ctrl+C를 누르세요" -ForegroundColor Yellow
Write-Host ""

try {
    & .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
} catch {
    Write-Host "❌ 애플리케이션 시작 실패: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # 원래 디렉토리로 복귀
    Set-Location $currentPath
}

Write-Host ""
Write-Host "👋 Spring Boot 애플리케이션이 종료되었습니다." -ForegroundColor Yellow