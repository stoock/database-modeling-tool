# Database Modeling Tool - Development Environment Diagnostics Script

# Set console encoding to UTF-8 for proper Korean display
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🔍 Database Modeling Tool 개발 환경 진단을 시작합니다..." -ForegroundColor Green
Write-Host ""

$issues = @()
$warnings = @()

# 1. 시스템 요구사항 확인
Write-Host "💻 시스템 요구사항 확인" -ForegroundColor Cyan

# Windows 버전 확인
$osVersion = [System.Environment]::OSVersion.Version
Write-Host "   OS: Windows $($osVersion.Major).$($osVersion.Minor)" -ForegroundColor Gray
if ($osVersion.Major -lt 10) {
    $issues += "Windows 10 이상이 권장됩니다"
}

# PowerShell 버전 확인
$psVersion = $PSVersionTable.PSVersion
Write-Host "   PowerShell: $($psVersion.Major).$($psVersion.Minor)" -ForegroundColor Gray
if ($psVersion.Major -lt 5) {
    $issues += "PowerShell 5.0 이상이 필요합니다"
}

Write-Host ""

# 2. Java 환경 확인
Write-Host "☕ Java 환경 확인" -ForegroundColor Cyan

if ($env:JAVA_HOME) {
    Write-Host "   JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray
    
    if (Test-Path "$env:JAVA_HOME\bin\java.exe") {
        try {
            $javaVersionOutput = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1
            $javaVersionLine = $javaVersionOutput | Select-String "version" | Select-Object -First 1
            Write-Host "   Java 버전: $javaVersionLine" -ForegroundColor Gray
            
            # Java 21+ 확인
            if ($javaVersionLine -match '"(\d+)\.') {
                $majorVersion = [int]$matches[1]
                if ($majorVersion -lt 21) {
                    $warnings += "Java 21 이상이 권장됩니다 (현재: $majorVersion)"
                }
            }
            
            Write-Host "   ✅ Java 실행 가능" -ForegroundColor Green
        } catch {
            $issues += "Java 실행 실패: $($_.Exception.Message)"
        }
    } else {
        $issues += "JAVA_HOME 경로에 java.exe가 없습니다"
    }
} else {
    $issues += "JAVA_HOME 환경변수가 설정되지 않았습니다"
}

Write-Host ""

# 3. Podman 환경 확인
Write-Host "🐳 Podman 환경 확인" -ForegroundColor Cyan

try {
    $podmanVersion = & podman --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Podman 버전: $podmanVersion" -ForegroundColor Gray
        Write-Host "   ✅ Podman 사용 가능" -ForegroundColor Green
    } else {
        $issues += "Podman 명령어 실행 실패"
    }
} catch {
    $issues += "Podman이 설치되지 않았거나 PATH에 없습니다"
}

Write-Host ""

# 4. Node.js 환경 확인
Write-Host "🟢 Node.js 환경 확인" -ForegroundColor Cyan

try {
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Node.js 버전: $nodeVersion" -ForegroundColor Gray
        
        # Node.js 18+ 확인
        if ($nodeVersion -match "v(\d+)\.") {
            $nodeMajorVersion = [int]$matches[1]
            if ($nodeMajorVersion -lt 18) {
                $warnings += "Node.js 18 이상이 권장됩니다 (현재: $nodeMajorVersion)"
            }
        }
        
        Write-Host "   ✅ Node.js 사용 가능" -ForegroundColor Green
    } else {
        $warnings += "Node.js 명령어 실행 실패"
    }
} catch {
    $warnings += "Node.js가 설치되지 않았거나 PATH에 없습니다"
}

try {
    $npmVersion = & npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   NPM 버전: $npmVersion" -ForegroundColor Gray
        Write-Host "   ✅ NPM 사용 가능" -ForegroundColor Green
    } else {
        $warnings += "NPM 명령어 실행 실패"
    }
} catch {
    $warnings += "NPM이 설치되지 않았거나 PATH에 없습니다"
}

Write-Host ""

# 5. 프로젝트 구조 확인
Write-Host "📁 프로젝트 구조 확인" -ForegroundColor Cyan

$requiredDirs = @("backend", "frontend", "scripts")
$requiredFiles = @("backend\pom.xml", "frontend\package.json", "scripts\start-dev.ps1")

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   ✅ $dir 디렉토리 존재" -ForegroundColor Green
    } else {
        $issues += "$dir 디렉토리가 없습니다"
    }
}

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file 파일 존재" -ForegroundColor Green
    } else {
        $issues += "$file 파일이 없습니다"
    }
}

# Maven 설치 확인
try {
    $mavenVersion = & mvn --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Maven 설치됨: $($mavenVersion[0])" -ForegroundColor Green
    } else {
        throw "Maven 실행 실패"
    }
} catch {
    $warnings += "시스템 Maven이 설치되지 않았습니다. IDE 빌드 도구 사용을 권장합니다."
}

Write-Host ""

# 6. 실행 중인 컨테이너 확인
Write-Host "📦 실행 중인 컨테이너 확인" -ForegroundColor Cyan

try {
    $runningContainers = & podman ps --format "{{.Names}}" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $dbContainerRunning = $runningContainers | Select-String -Pattern "dbmodeling-postgres-dev" -Quiet
        $pgadminContainerRunning = $runningContainers | Select-String -Pattern "dbmodeling-pgadmin-dev" -Quiet
        
        if ($dbContainerRunning) {
            Write-Host "   ✅ PostgreSQL 컨테이너 실행 중" -ForegroundColor Green
        } else {
            Write-Host "   ⏸️ PostgreSQL 컨테이너 중지됨" -ForegroundColor Yellow
        }
        
        if ($pgadminContainerRunning) {
            Write-Host "   ✅ pgAdmin 컨테이너 실행 중" -ForegroundColor Green
        } else {
            Write-Host "   ⏸️ pgAdmin 컨테이너 중지됨" -ForegroundColor Yellow
        }
        
        if (-not $dbContainerRunning -and -not $pgadminContainerRunning) {
            Write-Host "   ℹ️ 컨테이너가 실행되지 않았습니다. start-dev.ps1 스크립트로 시작하세요." -ForegroundColor Cyan
        }
    } else {
        $warnings += "컨테이너 상태 확인 실패"
    }
} catch {
    $warnings += "Podman 컨테이너 조회 실패"
}

Write-Host ""

# 7. 진단 결과 요약
Write-Host "📊 진단 결과 요약" -ForegroundColor Cyan

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 모든 환경 설정이 정상입니다!" -ForegroundColor Green
    Write-Host "scripts\start-dev.ps1을 실행하여 개발 환경을 시작할 수 있습니다." -ForegroundColor Cyan
} else {
    if ($issues.Count -gt 0) {
        Write-Host "❌ 해결해야 할 문제:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "   - $issue" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️ 주의사항:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   - $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "💡 권장 사항:" -ForegroundColor Cyan
    if ($issues -contains "JAVA_HOME 환경변수가 설정되지 않았습니다") {
        Write-Host "   1. Oracle JDK 21+ 또는 OpenJDK 21+ 설치" -ForegroundColor White
        Write-Host "   2. JAVA_HOME 환경변수 설정" -ForegroundColor White
    }
    if ($issues -match "Podman") {
        Write-Host "   1. Podman Desktop 설치: https://podman-desktop.io/" -ForegroundColor White
        Write-Host "   2. 또는 winget install RedHat.Podman" -ForegroundColor White
    }
    if ($warnings -match "Node.js") {
        Write-Host "   1. Node.js 18+ 설치: https://nodejs.org/" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🛠️ 도움말:" -ForegroundColor White
Write-Host "   환경 설정 가이드: README-DEV.md" -ForegroundColor Gray
Write-Host "   개발 환경 시작: scripts\start-dev.ps1" -ForegroundColor Gray
Write-Host "   진단 재실행: scripts\diagnose-env.ps1" -ForegroundColor Gray