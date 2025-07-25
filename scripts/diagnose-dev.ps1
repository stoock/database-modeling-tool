# Database Modeling Tool - 개발 환경 진단 스크립트 (PowerShell for Windows 11)

Write-Host "🔍 Database Modeling Tool 개발 환경을 진단합니다..." -ForegroundColor Cyan
Write-Host ""

# 시스템 정보
Write-Host "💻 시스템 정보:" -ForegroundColor White
Write-Host "   OS: $([System.Environment]::OSVersion.VersionString)" -ForegroundColor Gray
Write-Host "   PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host "   현재 경로: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Podman 확인
Write-Host "🐳 Podman 상태:" -ForegroundColor White
try {
    $podmanVersion = & podman --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Podman 설치됨: $podmanVersion" -ForegroundColor Green
        
        # Podman 시스템 정보
        try {
            $podmanInfo = & podman system info --format json 2>$null | ConvertFrom-Json
            Write-Host "   📊 Podman 정보:" -ForegroundColor Gray
            Write-Host "      - Version: $($podmanInfo.version.Version)" -ForegroundColor Gray
            Write-Host "      - OS: $($podmanInfo.host.os)" -ForegroundColor Gray
            Write-Host "      - Architecture: $($podmanInfo.host.arch)" -ForegroundColor Gray
        } catch {
            Write-Host "   ⚠️  Podman 시스템 정보 조회 실패" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Podman 명령어 실행 실패" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Podman이 설치되지 않았거나 PATH에 없습니다" -ForegroundColor Red
    Write-Host "      설치 방법: winget install RedHat.Podman" -ForegroundColor Yellow
}
Write-Host ""

# 포트 사용 확인
Write-Host "🔌 포트 사용 상태:" -ForegroundColor White
$ports = @(5432, 8080, 5173, 5050)
foreach ($port in $ports) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "   ⚠️  포트 $port 사용 중" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ 포트 $port 사용 가능" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ❓ 포트 $port 상태 확인 실패" -ForegroundColor Gray
    }
}
Write-Host ""

# 컨테이너 상태 확인
Write-Host "📦 컨테이너 상태:" -ForegroundColor White
try {
    $containers = & podman ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
    if ($LASTEXITCODE -eq 0 -and $containers) {
        $containers | ForEach-Object {
            if ($_ -match "dbmodeling-") {
                Write-Host "   $($_)" -ForegroundColor Cyan
            }
        }
        
        # 실행 중인 컨테이너만 표시
        $runningContainers = & podman ps --format "{{.Names}}" 2>$null
        if ($runningContainers) {
            Write-Host "   실행 중인 컨테이너:" -ForegroundColor Gray
            $runningContainers | Where-Object { $_ -match "dbmodeling-" } | ForEach-Object {
                Write-Host "      - $_" -ForegroundColor Green
            }
        } else {
            Write-Host "   실행 중인 컨테이너 없음" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   컨테이너 없음" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ 컨테이너 상태 확인 실패: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 볼륨 상태 확인
Write-Host "💾 볼륨 상태:" -ForegroundColor White
try {
    $volumes = & podman volume ls --format "{{.Name}}" 2>$null
    if ($LASTEXITCODE -eq 0 -and $volumes) {
        $dbVolumes = $volumes | Where-Object { $_ -match "dbmodeling-" }
        if ($dbVolumes) {
            $dbVolumes | ForEach-Object {
                Write-Host "   ✅ $_" -ForegroundColor Green
            }
        } else {
            Write-Host "   볼륨 없음" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   볼륨 없음" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ 볼륨 상태 확인 실패" -ForegroundColor Red
}
Write-Host ""

# 네트워크 상태 확인
Write-Host "🌐 네트워크 상태:" -ForegroundColor White
try {
    $networks = & podman network ls --format "{{.Name}}" 2>$null
    if ($LASTEXITCODE -eq 0 -and $networks) {
        $dbNetwork = $networks | Where-Object { $_ -eq "dbmodeling-network" }
        if ($dbNetwork) {
            Write-Host "   ✅ dbmodeling-network 존재" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  dbmodeling-network 없음" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   네트워크 정보 없음" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ 네트워크 상태 확인 실패" -ForegroundColor Red
}
Write-Host ""

# 프로젝트 구조 확인
Write-Host "📁 프로젝트 구조:" -ForegroundColor White
$requiredDirs = @("backend", "frontend", "scripts")
$requiredFiles = @(".env.dev", "README-DEV.md")

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   ✅ $dir/ 디렉토리 존재" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dir/ 디렉토리 없음" -ForegroundColor Red
    }
}

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file 파일 존재" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $file 파일 없음" -ForegroundColor Yellow
    }
}
Write-Host ""

# Java 확인 (백엔드용)
Write-Host "☕ Java 환경:" -ForegroundColor White
try {
    $javaVersion = & java -version 2>&1 | Select-Object -First 1
    Write-Host "   ✅ Java 설치됨: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Java가 설치되지 않았거나 PATH에 없습니다" -ForegroundColor Red
    Write-Host "      설치 방법: winget install Microsoft.OpenJDK.17" -ForegroundColor Yellow
}

# Maven Wrapper 확인
if (Test-Path "backend/mvnw.cmd") {
    Write-Host "   ✅ Maven Wrapper 존재" -ForegroundColor Green
} else {
    Write-Host "   ❌ Maven Wrapper 없음" -ForegroundColor Red
}
Write-Host ""

# Node.js 확인 (프론트엔드용)
Write-Host "🟢 Node.js 환경:" -ForegroundColor White
try {
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Node.js 설치됨: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Node.js 명령어 실행 실패" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Node.js가 설치되지 않았거나 PATH에 없습니다" -ForegroundColor Red
    Write-Host "      설치 방법: winget install OpenJS.NodeJS" -ForegroundColor Yellow
}

try {
    $yarnVersion = & yarn --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Yarn 설치됨: v$yarnVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Yarn 명령어 실행 실패" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Yarn이 설치되지 않았습니다" -ForegroundColor Red
    Write-Host "      설치 방법: npm install -g yarn" -ForegroundColor Yellow
}

if (Test-Path "frontend/package.json") {
    Write-Host "   ✅ package.json 존재" -ForegroundColor Green
} else {
    Write-Host "   ❌ package.json 없음" -ForegroundColor Red
}
Write-Host ""

# 권장 사항
Write-Host "💡 권장 사항:" -ForegroundColor White
Write-Host "   1. 모든 필수 소프트웨어가 설치되어 있는지 확인하세요" -ForegroundColor Yellow
Write-Host "   2. 포트 충돌이 있다면 해당 프로세스를 종료하세요" -ForegroundColor Yellow
Write-Host "   3. 문제가 지속되면 .\scripts\reset-dev.ps1 로 환경을 초기화하세요" -ForegroundColor Yellow
Write-Host ""

Write-Host "🎯 다음 단계:" -ForegroundColor White
Write-Host "   문제가 없다면: .\scripts\start-dev.ps1" -ForegroundColor Green
Write-Host "   문제가 있다면: 위의 ❌ 항목들을 먼저 해결하세요" -ForegroundColor Yellow
Write-Host ""