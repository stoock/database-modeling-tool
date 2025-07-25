# Database Modeling Tool - 간단한 개발 환경 시작 스크립트

Write-Host "🚀 Database Modeling Tool 개발 환경을 시작합니다..." -ForegroundColor Green

# 실행 정책 확인
$executionPolicy = Get-ExecutionPolicy
if ($executionPolicy -eq "Restricted") {
    Write-Host "❌ PowerShell 실행 정책이 제한되어 있습니다." -ForegroundColor Red
    Write-Host "   다음 명령어를 관리자 권한으로 실행하세요:" -ForegroundColor Yellow
    Write-Host "   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
    exit 1
}

# 기본 명령어 확인
$commands = @("podman", "java", "node")
foreach ($cmd in $commands) {
    try {
        $null = Get-Command $cmd -ErrorAction Stop
        Write-Host "✅ $cmd 명령어 사용 가능" -ForegroundColor Green
    } catch {
        Write-Host "❌ $cmd 명령어를 찾을 수 없습니다" -ForegroundColor Red
        Write-Host "   진단 스크립트를 실행하세요: .\scripts\diagnose-dev.ps1" -ForegroundColor Yellow
        exit 1
    }
}

# PostgreSQL 컨테이너 시작 (간단 버전)
Write-Host "🐘 PostgreSQL 컨테이너를 시작합니다..." -ForegroundColor Cyan

# 기존 컨테이너 확인
$existingContainer = podman ps -a --filter "name=dbmodeling-postgres-dev" --format "{{.Names}}" 2>$null
if ($existingContainer) {
    Write-Host "   기존 컨테이너 발견, 시작합니다..." -ForegroundColor Gray
    podman start dbmodeling-postgres-dev 2>$null
} else {
    Write-Host "   새 컨테이너를 생성합니다..." -ForegroundColor Gray
    podman run -d --name dbmodeling-postgres-dev -p 5432:5432 -e POSTGRES_DB=dbmodeling_dev -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgres:15-alpine 2>$null
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL 컨테이너 시작 완료" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL 컨테이너 시작 실패" -ForegroundColor Red
    Write-Host "   수동으로 확인하세요: podman ps -a" -ForegroundColor Yellow
    exit 1
}

# 데이터베이스 연결 대기 (간단 버전)
Write-Host "⏳ 데이터베이스 연결을 기다립니다..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

do {
    Start-Sleep -Seconds 2
    $attempt++
    Write-Host "   시도 $attempt/$maxAttempts..." -ForegroundColor Gray
    
    $ready = podman exec dbmodeling-postgres-dev pg_isready -U postgres 2>$null
    $isReady = $LASTEXITCODE -eq 0
    
} while (-not $isReady -and $attempt -lt $maxAttempts)

if ($isReady) {
    Write-Host "✅ 데이터베이스 연결 성공!" -ForegroundColor Green
} else {
    Write-Host "❌ 데이터베이스 연결 시간 초과" -ForegroundColor Red
    Write-Host "   컨테이너 로그 확인: podman logs dbmodeling-postgres-dev" -ForegroundColor Yellow
    exit 1
}

# 테스트 데이터베이스 생성
Write-Host "🧪 테스트 데이터베이스를 생성합니다..." -ForegroundColor Cyan
podman exec dbmodeling-postgres-dev psql -U postgres -c "CREATE DATABASE dbmodeling_test;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 테스트 데이터베이스 생성 완료" -ForegroundColor Green
} else {
    Write-Host "ℹ️  테스트 데이터베이스가 이미 존재합니다" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 기본 개발 환경 설정 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 접속 정보:" -ForegroundColor White
Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor Cyan
Write-Host "   - 사용자: postgres" -ForegroundColor Cyan
Write-Host "   - 비밀번호: postgres" -ForegroundColor Cyan
Write-Host "   - 개발 DB: dbmodeling_dev" -ForegroundColor Cyan
Write-Host "   - 테스트 DB: dbmodeling_test" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 다음 단계:" -ForegroundColor White
Write-Host "   1. 백엔드 시작: .\scripts\start-backend.ps1" -ForegroundColor Yellow
Write-Host "   2. 프론트엔드 시작: .\scripts\start-frontend.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "🛠️  유용한 명령어:" -ForegroundColor White
Write-Host "   - 컨테이너 상태: podman ps" -ForegroundColor Gray
Write-Host "   - 컨테이너 로그: podman logs dbmodeling-postgres-dev" -ForegroundColor Gray
Write-Host "   - 컨테이너 중지: podman stop dbmodeling-postgres-dev" -ForegroundColor Gray
Write-Host ""