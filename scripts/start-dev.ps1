# Database Modeling Tool - 개발 환경 시작 스크립트 (PowerShell for Windows 11 + Podman)

# Set console encoding to UTF-8 for proper Korean display
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🚀 Database Modeling Tool 개발 환경을 시작합니다..." -ForegroundColor Green
Write-Host "💻 Windows 11 + Podman 환경" -ForegroundColor Cyan

# Podman 설치 확인
try {
    $podmanVersion = & podman --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Podman 확인: $podmanVersion" -ForegroundColor Green
    } else {
        throw "Podman 명령어 실행 실패"
    }
} catch {
    Write-Host "❌ Podman이 설치되지 않았거나 PATH에 없습니다." -ForegroundColor Red
    Write-Host "   다음 중 하나를 시도하세요:" -ForegroundColor Yellow
    Write-Host "   1. winget install RedHat.Podman" -ForegroundColor Yellow
    Write-Host "   2. Podman Desktop 설치: https://podman-desktop.io/" -ForegroundColor Yellow
    Write-Host "   3. PATH 환경변수에 Podman 경로 추가" -ForegroundColor Yellow
    exit 1
}

# 환경 변수 로드
if (Test-Path ".env.dev") {
    Write-Host "📋 개발 환경 변수를 로드합니다..." -ForegroundColor Yellow
    Get-Content ".env.dev" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "⚠️ .env.dev 파일이 없습니다. 기본 설정을 사용합니다." -ForegroundColor Yellow
}

# Podman 네트워크 생성 (존재하지 않는 경우)
Write-Host "🌐 Podman 네트워크를 확인합니다..." -ForegroundColor Cyan
try {
    $networkList = & podman network ls --format "{{.Name}}" 2>$null
    $networkExists = $networkList | Select-String -Pattern "dbmodeling-network" -Quiet
    
    if (-not $networkExists) {
        Write-Host "   네트워크 생성 중..." -ForegroundColor Gray
        & podman network create dbmodeling-network 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 네트워크 'dbmodeling-network' 생성 완료" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 네트워크 생성 실패, 기본 네트워크 사용" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ 네트워크 'dbmodeling-network' 이미 존재" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ 네트워크 확인 실패, 기본 네트워크 사용" -ForegroundColor Yellow
}

# PostgreSQL 컨테이너 시작
Write-Host "🐘 PostgreSQL 컨테이너를 시작합니다..." -ForegroundColor Cyan
try {
    $runningContainers = & podman ps --format "{{.Names}}" 2>$null
    $postgresRunning = $runningContainers | Select-String -Pattern "dbmodeling-postgres-dev" -Quiet
    
    if (-not $postgresRunning) {
        Write-Host "   PostgreSQL 이미지를 다운로드하고 컨테이너를 시작합니다..." -ForegroundColor Gray
        
        # 네트워크 옵션을 조건부로 추가
        $networkOption = ""
        if ($networkExists) {
            $networkOption = "--network dbmodeling-network"
        }
        
        $podmanCmd = "podman run -d --name dbmodeling-postgres-dev $networkOption -p 5432:5432 -e POSTGRES_DB=dbmodeling_dev -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_INITDB_ARGS=`"--encoding=UTF-8 --locale=C`" -v dbmodeling-postgres-data:/var/lib/postgresql/data postgres:15-alpine"
        
        Invoke-Expression $podmanCmd 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL 컨테이너 시작 완료" -ForegroundColor Green
        } else {
            Write-Host "❌ PostgreSQL 컨테이너 시작 실패" -ForegroundColor Red
            Write-Host "   수동으로 확인하세요: podman logs dbmodeling-postgres-dev" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "✅ PostgreSQL 컨테이너가 이미 실행 중입니다" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ PostgreSQL 컨테이너 시작 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# pgAdmin 컨테이너 시작
Write-Host "🔧 pgAdmin 컨테이너를 시작합니다..." -ForegroundColor Cyan
try {
    $runningContainers = & podman ps --format "{{.Names}}" 2>$null
    $pgadminRunning = $runningContainers | Select-String -Pattern "dbmodeling-pgadmin-dev" -Quiet
    
    if (-not $pgadminRunning) {
        Write-Host "   pgAdmin 이미지를 다운로드하고 컨테이너를 시작합니다..." -ForegroundColor Gray
        
        # 네트워크 옵션을 조건부로 추가
        $networkOption = ""
        if ($networkExists) {
            $networkOption = "--network dbmodeling-network"
        }
        
        $podmanCmd = "podman run -d --name dbmodeling-pgadmin-dev $networkOption -p 5050:80 -e PGADMIN_DEFAULT_EMAIL=admin@dbmodeling.com -e PGADMIN_DEFAULT_PASSWORD=admin123 -e PGADMIN_CONFIG_SERVER_MODE=False -v dbmodeling-pgadmin-data:/var/lib/pgadmin dpage/pgadmin4:latest"
        
        Invoke-Expression $podmanCmd 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ pgAdmin 컨테이너 시작 완료" -ForegroundColor Green
        } else {
            Write-Host "⚠️ pgAdmin 컨테이너 시작 실패 (선택사항이므로 계속 진행)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ pgAdmin 컨테이너가 이미 실행 중입니다" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ pgAdmin 컨테이너 시작 중 오류 발생 (선택사항이므로 계속 진행)" -ForegroundColor Yellow
}

# 데이터베이스 연결 대기
Write-Host "⏳ 데이터베이스 연결을 기다립니다..." -ForegroundColor Yellow
$timeout = 60
$counter = 0

do {
    if ($counter -ge $timeout) {
        Write-Host "❌ 데이터베이스 연결 시간 초과" -ForegroundColor Red
        Write-Host "   컨테이너 로그를 확인하세요: podman logs dbmodeling-postgres-dev" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "   데이터베이스 연결 대기 중... ($counter/$timeout)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
    $counter += 2
    
    try {
        $null = & podman exec dbmodeling-postgres-dev pg_isready -U postgres -d dbmodeling_dev 2>$null
        $isReady = $LASTEXITCODE -eq 0
    } catch {
        $isReady = $false
    }
} while (-not $isReady)

Write-Host "✅ 데이터베이스가 준비되었습니다!" -ForegroundColor Green

# 테스트 데이터베이스도 생성
Write-Host "🧪 테스트 데이터베이스를 생성합니다..." -ForegroundColor Cyan
try {
    $null = & podman exec dbmodeling-postgres-dev psql -U postgres -c "CREATE DATABASE dbmodeling_test;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 테스트 데이터베이스 생성 완료" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ 테스트 데이터베이스가 이미 존재합니다" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ℹ️ 테스트 데이터베이스 생성 중 오류 (이미 존재할 수 있음)" -ForegroundColor Yellow
}

# 백엔드 디렉토리로 이동
if (-not (Test-Path "backend")) {
    Write-Host "❌ backend 디렉토리를 찾을 수 없습니다. 프로젝트 루트에서 실행하세요." -ForegroundColor Red
    exit 1
}

Set-Location backend

# Maven Wrapper 확인 및 생성
if (-not (Test-Path "mvnw.cmd")) {
    Write-Host "⚠️ Maven Wrapper가 없습니다. 생성을 시도합니다..." -ForegroundColor Yellow
    
    # Maven Wrapper가 없는 경우 다운로드 시도
    try {
        Write-Host "   Maven Wrapper JAR 다운로드 중..." -ForegroundColor Gray
        $wrapperDir = ".mvn\wrapper"
        $wrapperJar = "$wrapperDir\maven-wrapper.jar"
        
        if (-not (Test-Path $wrapperDir)) {
            New-Item -ItemType Directory -Path $wrapperDir -Force | Out-Null
        }
        
        if (-not (Test-Path $wrapperJar)) {
            $wrapperUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
            Invoke-WebRequest -Uri $wrapperUrl -OutFile $wrapperJar -UseBasicParsing
            Write-Host "✅ Maven Wrapper JAR 다운로드 완료" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Maven Wrapper 설정 실패. Maven이 설치되지 않았을 수 있습니다." -ForegroundColor Red
        Write-Host "   다음을 확인하세요:" -ForegroundColor Yellow
        Write-Host "   1. JAVA_HOME 환경변수 설정" -ForegroundColor Yellow
        Write-Host "   2. Java 21+ 설치 확인" -ForegroundColor Yellow
        exit 1
    }
}

# JAVA_HOME 확인
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    Write-Host "❌ JAVA_HOME이 설정되지 않았거나 올바르지 않습니다." -ForegroundColor Red
    Write-Host "   Java 21+을 설치하고 JAVA_HOME을 설정하세요." -ForegroundColor Yellow
    exit 1
} else {
    $javaVersion = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1 | Select-String "version" | ForEach-Object { $_.ToString() }
    Write-Host "✅ Java 확인: $javaVersion" -ForegroundColor Green
}

# Flyway 마이그레이션 실행
Write-Host "🔄 데이터베이스 마이그레이션을 실행합니다..." -ForegroundColor Cyan
try {
    & .\mvnw.cmd flyway:migrate `
        "-Dflyway.url=jdbc:postgresql://localhost:5432/dbmodeling_dev" `
        "-Dflyway.user=postgres" `
        "-Dflyway.password=postgres" `
        "-Dflyway.locations=classpath:db/migration"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 데이터베이스 마이그레이션 완료" -ForegroundColor Green
    } else {
        Write-Host "⚠️ 마이그레이션에서 경고가 발생했지만 계속 진행합니다" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 마이그레이션 실행 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   수동으로 마이그레이션을 실행하세요." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 개발 환경 설정이 완료되었습니다!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 접속 정보:" -ForegroundColor White
Write-Host "   - PostgreSQL: localhost:5432 (postgres/postgres)" -ForegroundColor Cyan
Write-Host "   - pgAdmin: http://localhost:5050 (admin@dbmodeling.com / admin123)" -ForegroundColor Cyan
Write-Host "   - 개발 DB: dbmodeling_dev" -ForegroundColor Cyan
Write-Host "   - 테스트 DB: dbmodeling_test" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 다음 단계:" -ForegroundColor White
Write-Host "   1. 백엔드 시작: .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev" -ForegroundColor Yellow
Write-Host "   2. 프론트엔드 시작: cd ..\frontend && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "🛠️ 유용한 명령어:" -ForegroundColor White
Write-Host "   - 컨테이너 상태 확인: podman ps" -ForegroundColor Gray
Write-Host "   - 컨테이너 로그 확인: podman logs dbmodeling-postgres-dev" -ForegroundColor Gray
Write-Host "   - 컨테이너 중지: podman stop dbmodeling-postgres-dev dbmodeling-pgadmin-dev" -ForegroundColor Gray
Write-Host "   - 컨테이너 제거: podman rm dbmodeling-postgres-dev dbmodeling-pgadmin-dev" -ForegroundColor Gray
Write-Host ""