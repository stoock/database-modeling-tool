# test-backend-simple.ps1 - 백엔드 간단 실행 테스트
# Database Modeling Tool - 백엔드 실행 가능 여부만 확인

# Set console encoding to UTF-8 for proper Korean display
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🔧 백엔드 간단 실행 테스트" -ForegroundColor Green
Write-Host "💻 컴파일 없이 Spring Boot 실행 시도" -ForegroundColor Cyan
Write-Host ""

# 현재 위치 저장
$originalLocation = Get-Location

try {
    # 프로젝트 루트 확인
    if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
        Write-Host "❌ 프로젝트 루트 디렉토리에서 실행해주세요" -ForegroundColor Red
        exit 1
    }

    # PostgreSQL 컨테이너 확인
    Write-Host "🔍 PostgreSQL 컨테이너 상태 확인..." -ForegroundColor Yellow
    try {
        $runningContainers = & podman ps --format "{{.Names}}" 2>$null
        $postgresRunning = $runningContainers | Select-String -Pattern "dbmodeling-postgres-dev" -Quiet
        
        if (-not $postgresRunning) {
            Write-Host "⚠️ PostgreSQL 컨테이너가 실행되지 않았습니다" -ForegroundColor Yellow
            Write-Host "   먼저 .\scripts\01-env-setup.ps1을 실행하세요" -ForegroundColor Yellow
            exit 1
        } else {
            Write-Host "✅ PostgreSQL 컨테이너 실행 중" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ 컨테이너 상태 확인 불가, 계속 진행합니다" -ForegroundColor Yellow
    }

    # 백엔드 디렉토리로 이동
    Set-Location backend
    
    Write-Host "🚀 Spring Boot 애플리케이션 실행 시도..." -ForegroundColor Cyan
    Write-Host "   ❗ 컴파일 오류가 있을 수 있습니다. Ctrl+C로 중지 가능" -ForegroundColor Yellow
    Write-Host ""
    
    # Spring Boot 실행 (컴파일 오류 무시하고 시도)
    .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev -Dmaven.test.skip=true

} catch {
    Write-Host "❌ 백엔드 실행 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 해결 방법:" -ForegroundColor White
    Write-Host "   1. Java 설치 확인: java -version" -ForegroundColor Gray
    Write-Host "   2. JAVA_HOME 환경변수 설정 확인" -ForegroundColor Gray
    Write-Host "   3. PostgreSQL 컨테이너 실행: .\scripts\01-env-setup.ps1" -ForegroundColor Gray
    Write-Host "   4. 컴파일 문제 해결 후 재시도" -ForegroundColor Gray
} finally {
    # 원래 위치로 복귀
    Set-Location $originalLocation
}

Write-Host ""