# 03-health-check.ps1 - 시스템 헬스체크 스크립트
# Database Modeling Tool - 개발 환경 상태 종합 진단 (100점 평가)

# Set console encoding to UTF-8 for proper Korean display
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🏥 [진단] 시스템 헬스체크 (100점 만점)" -ForegroundColor Green
Write-Host "🔍 개발 환경 상태를 종합적으로 점검합니다" -ForegroundColor Cyan
Write-Host ""

$healthScore = 0
$maxScore = 100
$issues = @()

# 1. 기본 디렉토리 구조 확인 (20점)
Write-Host "📁 프로젝트 구조 확인..." -ForegroundColor Cyan
$requiredDirs = @("backend", "frontend", "scripts")
$missingDirs = @()

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   ✅ $dir 디렉토리 존재" -ForegroundColor Green
        $healthScore += 6
    } else {
        Write-Host "   ❌ $dir 디렉토리 없음" -ForegroundColor Red
        $missingDirs += $dir
        $issues += "$dir 디렉토리가 없습니다"
    }
}

if ($missingDirs.Count -eq 0) {
    $healthScore += 2
}

# 2. 백엔드 환경 확인 (25점)
Write-Host "🏗️ 백엔드 환경 확인..." -ForegroundColor Cyan

# Java 확인
if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $javaVersion = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host "   ✅ Java: $javaVersion" -ForegroundColor Green
    $healthScore += 10
} else {
    Write-Host "   ❌ Java 설정 필요" -ForegroundColor Red
    $issues += "JAVA_HOME이 설정되지 않았거나 Java가 설치되지 않았습니다"
}

# Maven Wrapper 확인
if (Test-Path "backend\mvnw.cmd") {
    Write-Host "   ✅ Maven Wrapper 존재" -ForegroundColor Green
    $healthScore += 5
} else {
    Write-Host "   ❌ Maven Wrapper 없음" -ForegroundColor Red
    $issues += "backend/mvnw.cmd 파일이 없습니다"
}

# 백엔드 소스 확인
if (Test-Path "backend\src\main\java\com\dbmodeling\DatabaseModelingToolApplication.java") {
    Write-Host "   ✅ 백엔드 메인 클래스 존재" -ForegroundColor Green
    $healthScore += 10
} else {
    Write-Host "   ❌ 백엔드 메인 클래스 없음" -ForegroundColor Red
    $issues += "백엔드 메인 클래스가 없습니다"
}

# 3. 프론트엔드 환경 확인 (25점)
Write-Host "⚛️ 프론트엔드 환경 확인..." -ForegroundColor Cyan

# Node.js 확인
try {
    $nodeVersion = & node --version 2>$null
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
    $healthScore += 10
} catch {
    Write-Host "   ❌ Node.js 설치 필요" -ForegroundColor Red
    $issues += "Node.js가 설치되지 않았습니다"
}

# Yarn 확인
try {
    $yarnVersion = & yarn --version 2>$null
    Write-Host "   ✅ Yarn: v$yarnVersion" -ForegroundColor Green
    $healthScore += 5
} catch {
    Write-Host "   ❌ Yarn 설치 필요" -ForegroundColor Red
    $issues += "Yarn이 설치되지 않았습니다"
}

# package.json 확인
if (Test-Path "frontend\package.json") {
    Write-Host "   ✅ package.json 존재" -ForegroundColor Green
    $healthScore += 5
} else {
    Write-Host "   ❌ package.json 없음" -ForegroundColor Red
    $issues += "frontend/package.json 파일이 없습니다"
}

# node_modules 확인
if (Test-Path "frontend\node_modules") {
    Write-Host "   ✅ 의존성 설치됨" -ForegroundColor Green
    $healthScore += 5
} else {
    Write-Host "   ⚠️ 의존성 미설치" -ForegroundColor Yellow
    $issues += "프론트엔드 의존성이 설치되지 않았습니다 (yarn install 필요)"
}

# 4. 데이터베이스 환경 확인 (20점)
Write-Host "🐘 데이터베이스 환경 확인..." -ForegroundColor Cyan

# Podman/Docker 확인
try {
    $podmanVersion = & podman --version 2>$null
    Write-Host "   ✅ Podman: $podmanVersion" -ForegroundColor Green
    $healthScore += 10
    
    # PostgreSQL 컨테이너 확인
    try {
        $runningContainers = & podman ps --format "{{.Names}}" 2>$null
        $postgresRunning = $runningContainers | Select-String -Pattern "dbmodeling-postgres-dev" -Quiet
        
        if ($postgresRunning) {
            Write-Host "   ✅ PostgreSQL 컨테이너 실행 중" -ForegroundColor Green
            $healthScore += 10
        } else {
            Write-Host "   ⚠️ PostgreSQL 컨테이너 중지됨" -ForegroundColor Yellow
            $issues += "PostgreSQL 컨테이너가 실행되지 않았습니다 (.\scripts\start-dev.ps1 실행 필요)"
        }
    } catch {
        Write-Host "   ⚠️ 컨테이너 상태 확인 불가" -ForegroundColor Yellow
        $issues += "컨테이너 상태를 확인할 수 없습니다"
    }
} catch {
    Write-Host "   ❌ Podman/Docker 설치 필요" -ForegroundColor Red
    $issues += "Podman 또는 Docker가 설치되지 않았습니다"
}

# 5. 스크립트 및 설정 파일 확인 (10점)
Write-Host "📄 설정 파일 확인..." -ForegroundColor Cyan

$configFiles = @(
    "backend\pom.xml",
    "backend\src\main\resources\application.yml", 
    "backend\src\main\resources\application-dev.yml",
    "frontend\vite.config.ts",
    "scripts\start-dev.ps1"
)

$existingConfigs = 0
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $existingConfigs++
    }
}

$configScore = [math]::Round(($existingConfigs / $configFiles.Count) * 10)
$healthScore += $configScore
Write-Host "   ✅ 설정 파일: $existingConfigs/$($configFiles.Count) 개" -ForegroundColor Green

# 결과 출력
Write-Host ""
Write-Host "📊 헬스체크 결과" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$healthPercentage = [math]::Round(($healthScore / $maxScore) * 100)

if ($healthPercentage -ge 90) {
    $healthStatus = "🟢 우수"
    $healthColor = "Green"
} elseif ($healthPercentage -ge 70) {
    $healthStatus = "🟡 양호"  
    $healthColor = "Yellow"
} elseif ($healthPercentage -ge 50) {
    $healthStatus = "🟠 보통"
    $healthColor = "DarkYellow"
} else {
    $healthStatus = "🔴 위험"
    $healthColor = "Red"
}

Write-Host "전체 점수: $healthScore/$maxScore ($healthPercentage%) - $healthStatus" -ForegroundColor $healthColor

Write-Host ""
if ($issues.Count -gt 0) {
    Write-Host "⚠️ 발견된 문제점:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $issues.Count; $i++) {
        Write-Host "   $($i + 1). $($issues[$i])" -ForegroundColor Gray
    }
    Write-Host ""
}

# 권장사항 출력
Write-Host "💡 권장사항:" -ForegroundColor White

if ($healthPercentage -ge 90) {
    Write-Host "   🎉 시스템이 정상적으로 구성되었습니다!" -ForegroundColor Green
    Write-Host "   ✨ .\scripts\02-run-app.ps1 을 실행하여 개발을 시작하세요" -ForegroundColor Green
} elseif ($healthPercentage -ge 70) {
    Write-Host "   👍 대부분의 구성이 완료되었습니다" -ForegroundColor Yellow
    Write-Host "   🔧 몇 가지 문제를 해결한 후 개발을 시작하세요" -ForegroundColor Yellow
} else {
    Write-Host "   ⚙️ 기본 환경 설정이 필요합니다" -ForegroundColor Red
    Write-Host "   📋 위의 문제점들을 해결한 후 다시 확인하세요" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔄 다시 확인하려면: .\scripts\03-health-check.ps1" -ForegroundColor Gray
Write-Host ""