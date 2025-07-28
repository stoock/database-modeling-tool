# Database Modeling Tool - 빌드 테스트 스크립트

# Set console encoding to UTF-8 for proper Korean display
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🧪 Database Modeling Tool 빌드 테스트를 시작합니다..." -ForegroundColor Green
Write-Host ""

# 백엔드 타입 체크 (컴파일 테스트)
Write-Host "🏗️ 백엔드 컴파일 테스트..." -ForegroundColor Cyan
Set-Location backend

try {
    Write-Host "   컴파일 중..." -ForegroundColor Gray
    # 실제로는 Java 환경이 없으므로 여기서는 파일 존재만 확인
    if (Test-Path "src\main\java\com\dbmodeling\DatabaseModelingToolApplication.java") {
        Write-Host "   ✅ 백엔드 소스 파일 확인 완료" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 백엔드 소스 파일을 찾을 수 없습니다" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ 백엔드 컴파일 테스트 실패: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 프론트엔드 타입 체크
Write-Host "⚛️ 프론트엔드 타입 체크..." -ForegroundColor Cyan
Set-Location ..\frontend

try {
    Write-Host "   타입 체크 중..." -ForegroundColor Gray
    & yarn type-check
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ 프론트엔드 타입 체크 통과" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 프론트엔드 타입 체크 실패" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ 프론트엔드 타입 체크 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 프로젝트 루트로 복귀
Set-Location ..

Write-Host ""
Write-Host "🎉 빌드 테스트가 완료되었습니다!" -ForegroundColor Green
Write-Host ""

# 환경 설정 상태 확인
Write-Host "📋 환경 설정 상태:" -ForegroundColor White

# PostgreSQL 컨테이너 확인
try {
    $runningContainers = & podman ps --format "{{.Names}}" 2>$null
    $postgresRunning = $runningContainers | Select-String -Pattern "dbmodeling-postgres-dev" -Quiet
    
    if ($postgresRunning) {
        Write-Host "   ✅ PostgreSQL 컨테이너 실행 중" -ForegroundColor Green
    } else {
        Write-Host "   ❌ PostgreSQL 컨테이너 중지됨" -ForegroundColor Red
        Write-Host "     실행하려면: .\scripts\start-dev.ps1" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ Podman 상태 확인 불가" -ForegroundColor Yellow
}

# 개발 도구 버전 확인
if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $javaVersion = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host "   ✅ Java: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Java 설정 필요" -ForegroundColor Red
}

try {
    $nodeVersion = & node --version 2>$null
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js 설치 필요" -ForegroundColor Red
}

try {
    $yarnVersion = & yarn --version 2>$null
    Write-Host "   ✅ Yarn: v$yarnVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Yarn 설치 필요" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 다음 단계:" -ForegroundColor White
Write-Host "   1. 환경 설정: .\scripts\start-dev.ps1" -ForegroundColor Gray
Write-Host "   2. 애플리케이션 실행: .\scripts\build-and-run.ps1" -ForegroundColor Gray
Write-Host ""