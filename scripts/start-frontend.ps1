# Database Modeling Tool - 프론트엔드 시작 스크립트 (PowerShell for Windows 11)

Write-Host "⚛️  React 프론트엔드를 시작합니다..." -ForegroundColor Green

# 현재 위치 확인
$currentPath = Get-Location
if (-not (Test-Path "frontend")) {
    if (Test-Path "..\frontend") {
        Write-Host "📁 frontend 디렉토리로 이동합니다..." -ForegroundColor Yellow
        Set-Location frontend
    } else {
        Write-Host "❌ frontend 디렉토리를 찾을 수 없습니다." -ForegroundColor Red
        Write-Host "   프로젝트 루트 디렉토리에서 실행하세요." -ForegroundColor Yellow
        exit 1
    }
} else {
    Set-Location frontend
}

# Node.js 및 Yarn 확인
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 확인: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "   https://nodejs.org 에서 Node.js를 설치하세요." -ForegroundColor Yellow
    exit 1
}

try {
    $yarnVersion = yarn --version
    Write-Host "✅ Yarn 확인: v$yarnVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Yarn이 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "   다음 명령어로 설치하세요: npm install -g yarn" -ForegroundColor Yellow
    exit 1
}

# package.json 확인
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json을 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

# 의존성 설치 확인
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 의존성을 설치합니다..." -ForegroundColor Cyan
    yarn install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 의존성 설치 실패" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 의존성 설치 완료" -ForegroundColor Green
} else {
    Write-Host "✅ 의존성이 이미 설치되어 있습니다" -ForegroundColor Green
    
    # 의존성 업데이트 확인
    $updateDeps = Read-Host "의존성을 업데이트하시겠습니까? (y/N)"
    if ($updateDeps -eq "y" -or $updateDeps -eq "Y") {
        Write-Host "🔄 의존성을 업데이트합니다..." -ForegroundColor Cyan
        yarn install
        Write-Host "✅ 의존성 업데이트 완료" -ForegroundColor Green
    }
}

# 환경 변수 설정
$env:VITE_API_BASE_URL = "http://localhost:8080/api"
$env:VITE_NODE_ENV = "development"

Write-Host "⚙️  환경 설정:" -ForegroundColor Cyan
Write-Host "   - API URL: http://localhost:8080/api" -ForegroundColor Gray
Write-Host "   - 개발 모드: development" -ForegroundColor Gray

# 백엔드 연결 확인 (선택사항)
$checkBackend = Read-Host "백엔드 연결을 확인하시겠습니까? (y/N)"
if ($checkBackend -eq "y" -or $checkBackend -eq "Y") {
    Write-Host "🔍 백엔드 연결을 확인합니다..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET -TimeoutSec 5 2>$null
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ 백엔드 연결 확인 완료" -ForegroundColor Green
        } else {
            Write-Host "⚠️  백엔드가 응답하지 않습니다 (상태 코드: $($response.StatusCode))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  백엔드 연결 실패: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   백엔드가 실행 중인지 확인하세요: .\scripts\start-backend.ps1" -ForegroundColor Gray
    }
}

# Vite 개발 서버 시작
Write-Host ""
Write-Host "🚀 Vite 개발 서버를 시작합니다..." -ForegroundColor Green
Write-Host "   포트: 5173" -ForegroundColor Gray
Write-Host "   모드: development" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 브라우저에서 http://localhost:5173 을 열어주세요" -ForegroundColor Cyan
Write-Host "⏹️  중지하려면 Ctrl+C를 누르세요" -ForegroundColor Yellow
Write-Host ""

try {
    yarn dev
} catch {
    Write-Host "❌ 개발 서버 시작 실패: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # 원래 디렉토리로 복귀
    Set-Location $currentPath
}

Write-Host ""
Write-Host "👋 Vite 개발 서버가 종료되었습니다." -ForegroundColor Yellow