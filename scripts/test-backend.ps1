# Database Modeling Tool - 백엔드 테스트 실행 스크립트 (PowerShell for Windows 11)

# Set console encoding to UTF-8 for proper Korean display
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🧪 Database Modeling Tool 백엔드 테스트를 실행합니다..." -ForegroundColor Green

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

# 테스트 환경 선택
Write-Host ""
Write-Host "🔧 테스트 환경을 선택하세요:" -ForegroundColor Cyan
Write-Host "   1. PostgreSQL (실제 데이터베이스)" -ForegroundColor White
Write-Host "   2. H2 인메모리 (빠른 테스트)" -ForegroundColor White
Write-Host "   3. 모든 테스트 (PostgreSQL + H2)" -ForegroundColor White
$testChoice = Read-Host "선택 [기본값: 2]"

if ([string]::IsNullOrEmpty($testChoice)) {
    $testChoice = "2"
}

Write-Host ""

# PostgreSQL 테스트
if ($testChoice -eq "1" -or $testChoice -eq "3") {
    Write-Host "📊 PostgreSQL 테스트 환경에서 테스트를 실행합니다..." -ForegroundColor Cyan
    
    # 데이터베이스 연결 확인
    try {
        $dbCheck = podman exec dbmodeling-postgres-dev pg_isready -U postgres -d dbmodeling_test 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ 테스트 데이터베이스가 실행되지 않았습니다." -ForegroundColor Red
            Write-Host "   먼저 개발 환경을 시작하세요: .\scripts\start-dev.ps1" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "✅ PostgreSQL 테스트 데이터베이스 연결 확인 완료" -ForegroundColor Green
    } catch {
        Write-Host "❌ PostgreSQL 연결 확인 실패" -ForegroundColor Red
        Write-Host "   Podman 컨테이너가 실행 중인지 확인하세요: podman ps" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "🏃 PostgreSQL 테스트 실행 중..." -ForegroundColor Yellow
    & .\mvnw.cmd test -Dspring.profiles.active=test -Dspring.test.database.replace=none
    
    $postgresqlTestResult = $LASTEXITCODE
    if ($postgresqlTestResult -eq 0) {
        Write-Host "✅ PostgreSQL 테스트 성공!" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL 테스트 실패" -ForegroundColor Red
    }
    Write-Host ""
}

# H2 테스트
if ($testChoice -eq "2" -or $testChoice -eq "3") {
    Write-Host "💾 H2 인메모리 데이터베이스에서 테스트를 실행합니다..." -ForegroundColor Cyan
    Write-Host "🏃 H2 테스트 실행 중..." -ForegroundColor Yellow
    
    & .\mvnw.cmd test -Dspring.profiles.active=test-h2
    
    $h2TestResult = $LASTEXITCODE
    if ($h2TestResult -eq 0) {
        Write-Host "✅ H2 테스트 성공!" -ForegroundColor Green
    } else {
        Write-Host "❌ H2 테스트 실패" -ForegroundColor Red
    }
    Write-Host ""
}

# 결과 요약
Write-Host "📊 테스트 결과 요약:" -ForegroundColor White
if ($testChoice -eq "1") {
    if ($postgresqlTestResult -eq 0) {
        Write-Host "   PostgreSQL: ✅ 성공" -ForegroundColor Green
    } else {
        Write-Host "   PostgreSQL: ❌ 실패" -ForegroundColor Red
    }
} elseif ($testChoice -eq "2") {
    if ($h2TestResult -eq 0) {
        Write-Host "   H2 인메모리: ✅ 성공" -ForegroundColor Green
    } else {
        Write-Host "   H2 인메모리: ❌ 실패" -ForegroundColor Red
    }
} else {
    if ($postgresqlTestResult -eq 0) {
        Write-Host "   PostgreSQL: ✅ 성공" -ForegroundColor Green
    } else {
        Write-Host "   PostgreSQL: ❌ 실패" -ForegroundColor Red
    }
    if ($h2TestResult -eq 0) {
        Write-Host "   H2 인메모리: ✅ 성공" -ForegroundColor Green
    } else {
        Write-Host "   H2 인메모리: ❌ 실패" -ForegroundColor Red
    }
}

Write-Host ""

# 전체 결과 판정
if ($testChoice -eq "1") {
    $overallResult = $postgresqlTestResult
} elseif ($testChoice -eq "2") {
    $overallResult = $h2TestResult
} else {
    $overallResult = [Math]::Max($postgresqlTestResult, $h2TestResult)
}

if ($overallResult -eq 0) {
    Write-Host "🎉 모든 테스트가 성공적으로 완료되었습니다!" -ForegroundColor Green
} else {
    Write-Host "⚠️  일부 테스트가 실패했습니다." -ForegroundColor Yellow
    Write-Host "   로그를 확인하여 문제를 해결하세요." -ForegroundColor Gray
}

Write-Host ""
Write-Host "💡 유용한 명령어:" -ForegroundColor White
Write-Host "   - 특정 테스트 클래스 실행: .\mvnw.cmd test -Dtest=클래스명" -ForegroundColor Gray
Write-Host "   - 테스트 커버리지 확인: .\mvnw.cmd jacoco:report" -ForegroundColor Gray
Write-Host "   - 통합 테스트만 실행: .\mvnw.cmd verify -DskipUnitTests" -ForegroundColor Gray

# 원래 디렉토리로 복귀
Set-Location $currentPath

exit $overallResult