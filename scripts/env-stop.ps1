# Database Modeling Tool - 개발 환경 중지 스크립트 (PowerShell for Windows 11 + Podman)

# Set console encoding to UTF-8 for proper Korean display
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🛑 Database Modeling Tool 개발 환경을 중지합니다..." -ForegroundColor Yellow

# 실행 중인 컨테이너 확인
try {
    $runningContainers = & podman compose ps --format "{{.Names}}" 2>$null
    
    if (-not $runningContainers -or $runningContainers.Count -eq 0) {
        Write-Host "ℹ️  실행 중인 개발 환경 컨테이너가 없습니다." -ForegroundColor Cyan
        exit 0
    }
    
    Write-Host "📋 실행 중인 컨테이너:" -ForegroundColor Cyan
    $runningContainers | ForEach-Object {
        Write-Host "   - $_" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ 컨테이너 상태 확인 실패" -ForegroundColor Yellow
}

# 컨테이너 중지
Write-Host "⏹️  컨테이너를 중지합니다..." -ForegroundColor Yellow
try {
    & podman compose stop 2>$null
    Write-Host "✅ 컨테이너 중지 완료" -ForegroundColor Green
} catch {
    Write-Host "⚠️  일부 컨테이너 중지 중 오류 발생 (이미 중지되었을 수 있음)" -ForegroundColor Yellow
}

# 사용자에게 컨테이너 제거 여부 확인
$removeContainers = Read-Host "컨테이너를 완전히 제거하시겠습니까? (y/N)"
if ($removeContainers -eq "y" -or $removeContainers -eq "Y") {
    Write-Host "🗑️  컨테이너를 제거합니다..." -ForegroundColor Red
    try {
        & podman compose down 2>$null
        Write-Host "✅ 컨테이너 제거 완료" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  일부 컨테이너 제거 중 오류 발생" -ForegroundColor Yellow
    }
    
    # 볼륨 제거 여부 확인
    $removeVolumes = Read-Host "데이터 볼륨도 제거하시겠습니까? (데이터가 모두 삭제됩니다) (y/N)"
    if ($removeVolumes -eq "y" -or $removeVolumes -eq "Y") {
        Write-Host "💾 데이터 볼륨을 제거합니다..." -ForegroundColor Red
        try {
            & podman compose down -v 2>$null
            Write-Host "✅ 볼륨 제거 완료" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  일부 볼륨 제거 중 오류 발생" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🎉 개발 환경 중지 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "🛠️  유용한 명령어:" -ForegroundColor White
Write-Host "   - 모든 컨테이너 확인: podman ps -a" -ForegroundColor Gray
Write-Host "   - 볼륨 확인: podman volume ls" -ForegroundColor Gray
Write-Host "   - 네트워크 확인: podman network ls" -ForegroundColor Gray
Write-Host ""