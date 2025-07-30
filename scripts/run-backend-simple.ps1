# run-backend-simple.ps1 - H2 백엔드 간단 실행

Write-Host "Backend H2 Test Starting..." -ForegroundColor Green

$originalLocation = Get-Location

if (-not (Test-Path "backend")) {
    Write-Host "Error: Run from project root" -ForegroundColor Red
    exit 1
}

Set-Location backend

Write-Host "Java Check..." -ForegroundColor Yellow
java -version

Write-Host "Maven Wrapper Test..." -ForegroundColor Yellow
.\mvnw.cmd --version

Write-Host "Starting Spring Boot with H2..." -ForegroundColor Cyan
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=test-h2 -Dmaven.test.skip=true

Set-Location $originalLocation
Write-Host "Backend test completed" -ForegroundColor Green