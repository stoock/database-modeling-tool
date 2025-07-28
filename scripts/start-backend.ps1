# Database Modeling Tool - 백엔드 시작 스크립트 (PowerShell for Windows 11)

# Set console encoding to UTF-8 for proper Korean display
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

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

# Java 환경 확인
$javaVersion = ""
try {
    $javaVersionOutput = & java -version 2>&1
    $javaVersionLine = $javaVersionOutput | Select-String "version" | Select-Object -First 1
    if ($javaVersionLine) {
        Write-Host "✅ Java 확인: $javaVersionLine" -ForegroundColor Green
        # Java 21+ 확인
        if ($javaVersionLine -match '"(\d+)\.') {
            $majorVersion = [int]$matches[1]
            if ($majorVersion -lt 21) {
                Write-Host "❌ Java 21 이상이 필요합니다 (현재: $majorVersion)" -ForegroundColor Red
                Write-Host "   Java 21을 설치하고 JAVA_HOME을 설정하세요." -ForegroundColor Yellow
                exit 1
            } else {
                Write-Host "   Java 버전: $majorVersion (✅ 요구사항 충족)" -ForegroundColor Green
            }
        } elseif ($javaVersionLine -match '"1\.(\d+)\.') {
            $legacyVersion = [int]$matches[1]
            Write-Host "❌ 레거시 Java 버전 감지: 1.$legacyVersion (Java 21+ 필요)" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Java를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "   Java 21을 설치하고 PATH에 추가하세요." -ForegroundColor Yellow
    exit 1
}

# JAVA_HOME 확인
if ($env:JAVA_HOME) {
    Write-Host "   JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray
    if (-not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
        Write-Host "⚠️  JAVA_HOME 경로가 올바르지 않습니다." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  JAVA_HOME 환경변수가 설정되지 않았습니다." -ForegroundColor Yellow
}

# Maven 래퍼(mvnw) 확인
$mavenWrapperExists = Test-Path "mvnw.cmd"
if ($mavenWrapperExists) {
    Write-Host "✅ Maven 래퍼(mvnw) 확인 완료" -ForegroundColor Green
} else {
    Write-Host "❌ Maven 래퍼(mvnw.cmd)를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "   backend 디렉토리에 mvnw.cmd 파일이 있는지 확인하세요." -ForegroundColor Yellow
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

# 포트 8080 사용 확인
Write-Host "🔌 포트 8080 사용 상태를 확인합니다..." -ForegroundColor Cyan
try {
    $portCheck = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($portCheck) {
        Write-Host "⚠️  포트 8080이 이미 사용 중입니다." -ForegroundColor Yellow
        $continueAnyway = Read-Host "계속 진행하시겠습니까? (y/N)"
        if ($continueAnyway -ne "y" -and $continueAnyway -ne "Y") {
            Write-Host "   포트를 사용 중인 프로세스를 확인하세요: netstat -ano | findstr :8080" -ForegroundColor Gray
            exit 1
        }
    } else {
        Write-Host "✅ 포트 8080 사용 가능" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  포트 상태 확인 실패, 계속 진행합니다..." -ForegroundColor Yellow
}

# 환경 변수 설정
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/dbmodeling_dev"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "postgres"

Write-Host ""
Write-Host "⚙️  환경 설정:" -ForegroundColor Cyan
Write-Host "   - Profile: dev" -ForegroundColor Gray
Write-Host "   - Database: localhost:5432/dbmodeling_dev" -ForegroundColor Gray
Write-Host "   - User: postgres" -ForegroundColor Gray

# 컴파일 및 테스트 (선택사항)
$runTests = Read-Host "테스트를 실행하시겠습니까? (y/N)"
if ($runTests -eq "y" -or $runTests -eq "Y") {
    Write-Host "🧪 테스트를 실행합니다..." -ForegroundColor Cyan
    
    # 테스트 환경 선택
    $testProfile = Read-Host "테스트 환경을 선택하세요 (1: PostgreSQL, 2: H2 인메모리) [기본값: 2]"
    
    if ($testProfile -eq "1") {
        Write-Host "   📊 PostgreSQL 테스트 데이터베이스 사용" -ForegroundColor Gray
        & .\mvnw.cmd test -Dspring.profiles.active=test -Dspring.test.database.replace=none
    } else {
        Write-Host "   💾 H2 인메모리 데이터베이스 사용" -ForegroundColor Gray
        & .\mvnw.cmd test -Dspring.profiles.active=test-h2
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 테스트 실패" -ForegroundColor Red
        Write-Host "   오류 로그를 확인하고 문제를 해결하세요." -ForegroundColor Yellow
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

# Maven 래퍼로 Spring Boot 애플리케이션 실행
Write-Host "🔧 Maven 래퍼로 애플리케이션을 실행합니다..." -ForegroundColor Cyan
try {
    $env:SPRING_PROFILES_ACTIVE = "dev"
    & .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev" "-Dspring-boot.run.jvmArguments=-Dfile.encoding=UTF-8"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 애플리케이션 시작 실패 (종료 코드: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "   다음을 확인하세요:" -ForegroundColor Yellow
        Write-Host "   - 포트 8080이 사용 중인지 확인" -ForegroundColor Gray
        Write-Host "   - 데이터베이스 연결 상태 확인" -ForegroundColor Gray
        Write-Host "   - Java 버전 및 JAVA_HOME 설정 확인" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "❌ 애플리케이션 시작 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   오류 세부 정보:" -ForegroundColor Yellow
    Write-Host "   $($_.Exception.ToString())" -ForegroundColor Gray
    exit 1
} finally {
    # 원래 디렉토리로 복귀
    Set-Location $currentPath
}

Write-Host ""
Write-Host "👋 Spring Boot 애플리케이션이 종료되었습니다." -ForegroundColor Yellow