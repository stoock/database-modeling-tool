# 02-run-app.ps1 - 애플리케이션 빌드 및 실행 스크립트
# Database Modeling Tool - 백엔드+프론트엔드 안전한 실행

# Set console encoding to UTF-8 for proper Korean display
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🚀 [02단계] 애플리케이션 빌드 및 실행" -ForegroundColor Green
Write-Host "💻 백엔드 + 프론트엔드 통합 실행" -ForegroundColor Cyan
Write-Host ""

# 현재 위치 저장
$originalLocation = Get-Location

# 에러 핸들링 함수
function Handle-Error {
    param($message)
    Write-Host "❌ $message" -ForegroundColor Red
    Set-Location $originalLocation
    exit 1
}

# 사전 요구사항 확인
Write-Host "🔍 사전 요구사항 확인..." -ForegroundColor Cyan

if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Handle-Error "프로젝트 루트 디렉토리에서 실행해주세요"
}

# PostgreSQL 컨테이너 확인
try {
    $runningContainers = & podman ps --format "{{.Names}}" 2>$null
    $postgresRunning = $runningContainers | Select-String -Pattern "dbmodeling-postgres-dev" -Quiet
    
    if (-not $postgresRunning) {
        Write-Host "⚠️ PostgreSQL 컨테이너가 실행되지 않았습니다" -ForegroundColor Yellow
        Write-Host "   먼저 .\scripts\start-dev.ps1을 실행하세요" -ForegroundColor Yellow
        Handle-Error "데이터베이스가 준비되지 않았습니다"
    } else {
        Write-Host "✅ PostgreSQL 컨테이너 실행 중" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ 컨테이너 상태 확인 불가, 계속 진행합니다" -ForegroundColor Yellow
}

# 백엔드 검증
Write-Host "🏗️ 백엔드 검증..." -ForegroundColor Cyan
Set-Location backend

if (-not (Test-Path "mvnw.cmd")) {
    Handle-Error "Maven Wrapper를 찾을 수 없습니다"
}

if (-not (Test-Path "src\main\java\com\dbmodeling\DatabaseModelingToolApplication.java")) {
    Handle-Error "백엔드 메인 클래스를 찾을 수 없습니다"
}

Write-Host "✅ 백엔드 소스 파일 검증 완료" -ForegroundColor Green

# 프론트엔드 검증  
Write-Host "⚛️ 프론트엔드 검증..." -ForegroundColor Cyan
Set-Location ..\frontend

if (-not (Test-Path "package.json")) {
    Handle-Error "package.json을 찾을 수 없습니다"
}

# 의존성 확인
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 프론트엔드 의존성 설치 중..." -ForegroundColor Gray
    & yarn install --silent
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "프론트엔드 의존성 설치 실패"
    }
}

# 타입 체크
Write-Host "🔍 프론트엔드 타입 체크..." -ForegroundColor Gray
& yarn type-check
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 프론트엔드 타입 체크 통과" -ForegroundColor Green
} else {
    Write-Host "⚠️ 프론트엔드 타입 체크 경고 (계속 진행)" -ForegroundColor Yellow
}

# 프로젝트 루트로 복귀
Set-Location $originalLocation

Write-Host ""
Write-Host "🎉 빌드 검증 완료!" -ForegroundColor Green
Write-Host ""

# 실행 방법 안내
Write-Host "🚀 수동 실행 방법:" -ForegroundColor White
Write-Host ""

Write-Host "1️⃣ 백엔드 시작 (새 터미널):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣ 프론트엔드 시작 (새 터미널):" -ForegroundColor Yellow  
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   yarn dev" -ForegroundColor Gray
Write-Host ""

Write-Host "📱 접속 정보:" -ForegroundColor White
Write-Host "   - 프론트엔드: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - 백엔드 API: http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "   - Swagger UI: http://localhost:8080/api/swagger-ui.html" -ForegroundColor Cyan
Write-Host ""

# 자동 실행 옵션
Write-Host "🤖 자동 실행을 시도하시겠습니까? (y/N)" -ForegroundColor Yellow
$autoRun = Read-Host

if ($autoRun -eq "y" -or $autoRun -eq "Y") {
    Write-Host ""
    Write-Host "🚀 자동 실행 시작..." -ForegroundColor Green
    
    # 백엔드 시작 (백그라운드)
    Write-Host "🏗️ 백엔드 서버 시작 중..." -ForegroundColor Cyan
    $backendProcess = Start-Process powershell -ArgumentList "-Command", "cd '$($originalLocation.Path)\backend'; .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev" -PassThru
    
    # 잠시 대기
    Start-Sleep -Seconds 5
    
    # 프론트엔드 시작 (포그라운드)
    Write-Host "⚛️ 프론트엔드 서버 시작 중..." -ForegroundColor Cyan
    Write-Host "   프론트엔드 서버를 중지하려면 Ctrl+C를 누르세요" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        Set-Location frontend
        & yarn dev
    } finally {
        # 정리
        Set-Location $originalLocation
        if ($backendProcess -and -not $backendProcess.HasExited) {
            Write-Host "🛑 백엔드 서버 종료 중..." -ForegroundColor Yellow
            Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "👋 서버가 종료되었습니다" -ForegroundColor Green
    }
} else {
    Write-Host "👍 수동 실행 방법을 따라 진행하세요" -ForegroundColor Green
}

Write-Host ""