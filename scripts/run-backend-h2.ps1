# run-backend-h2.ps1 - H2 데이터베이스로 백엔드 독립 실행
# Database Modeling Tool - PostgreSQL 없이 H2로 백엔드 실행

$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🚀 H2 데이터베이스로 백엔드 독립 실행" -ForegroundColor Green
Write-Host "💾 PostgreSQL 의존성 없이 인메모리 DB 사용" -ForegroundColor Cyan
Write-Host ""

$originalLocation = Get-Location

try {
    if (-not (Test-Path "backend")) {
        Write-Host "❌ 프로젝트 루트 디렉토리에서 실행해주세요" -ForegroundColor Red
        exit 1
    }

    Set-Location backend
    
    Write-Host "🔧 환경 검증..." -ForegroundColor Yellow
    
    try {
        $javaVersion = & java -version 2>&1 | Select-String "version"
        Write-Host "✅ Java 확인됨" -ForegroundColor Green
    } catch {
        Write-Host "❌ Java가 설치되지 않았습니다" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path "gradlew.bat")) {
        Write-Host "❌ Gradle Wrapper를 찾을 수 없습니다" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Gradle Wrapper 확인됨" -ForegroundColor Green
    Write-Host ""
    Write-Host "🏗️ Spring Boot 애플리케이션 실행..." -ForegroundColor Cyan
    Write-Host "   프로파일: test-h2 (H2 인메모리 데이터베이스)" -ForegroundColor Gray
    Write-Host "   포트: 8080" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🔄 Spring Boot 실행 중... (Ctrl+C로 중지)" -ForegroundColor Yellow
    .\gradlew.bat bootRunH2

} catch {
    Write-Host "❌ 백엔드 실행 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 해결 방법:" -ForegroundColor White
    Write-Host "   1. Java 21이 설치되어 있는지 확인" -ForegroundColor Gray
    Write-Host "   2. 프로젝트 루트 디렉토리에서 실행" -ForegroundColor Gray
    Write-Host "   3. 포트 8080이 사용 중이 아닌지 확인" -ForegroundColor Gray
} finally {
    Set-Location $originalLocation
}

Write-Host ""
Write-Host "✨ 백엔드 실행 완료" -ForegroundColor Green