# Database Modeling Tool - 개발 환경 초기화 스크립트 (PowerShell for Windows 11 + Podman)

# Set console encoding to UTF-8 for proper Korean display
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🔄 Database Modeling Tool 개발 환경을 초기화합니다..." -ForegroundColor Yellow
Write-Host "⚠️  이 작업은 모든 개발 데이터를 삭제합니다!" -ForegroundColor Red

# 사용자 확인
$confirm = Read-Host "정말로 개발 환경을 초기화하시겠습니까? 모든 데이터가 삭제됩니다. (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ 초기화가 취소되었습니다." -ForegroundColor Yellow
    exit 0
}

Write-Host "🛑 모든 관련 컨테이너를 중지하고 제거합니다..." -ForegroundColor Red

# 컨테이너 중지 및 제거
$containers = @("dbmodeling-postgres-dev", "dbmodeling-pgadmin-dev")
foreach ($container in $containers) {
    try {
        Write-Host "   중지 중: $container" -ForegroundColor Gray
        podman stop $container 2>$null
        
        Write-Host "   제거 중: $container" -ForegroundColor Gray
        podman rm $container 2>$null
    } catch {
        Write-Host "   ⚠️  $container 처리 중 오류 (이미 제거되었을 수 있음)" -ForegroundColor Yellow
    }
}

# 볼륨 제거
Write-Host "💾 데이터 볼륨을 제거합니다..." -ForegroundColor Red
$volumes = @("dbmodeling-postgres-data", "dbmodeling-pgadmin-data")
foreach ($volume in $volumes) {
    try {
        Write-Host "   제거 중: $volume" -ForegroundColor Gray
        podman volume rm $volume 2>$null
    } catch {
        Write-Host "   ⚠️  $volume 제거 중 오류 (이미 제거되었을 수 있음)" -ForegroundColor Yellow
    }
}

# 네트워크 제거
Write-Host "🌐 네트워크를 제거합니다..." -ForegroundColor Red
try {
    podman network rm dbmodeling-network 2>$null
    Write-Host "   ✅ 네트워크 제거 완료" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  네트워크 제거 중 오류 (이미 제거되었을 수 있음)" -ForegroundColor Yellow
}

# 사용하지 않는 이미지 정리 (선택사항)
$cleanImages = Read-Host "사용하지 않는 이미지도 정리하시겠습니까? (y/N)"
if ($cleanImages -eq "y" -or $cleanImages -eq "Y") {
    Write-Host "🧹 사용하지 않는 이미지를 정리합니다..." -ForegroundColor Cyan
    try {
        podman image prune -f
        Write-Host "   ✅ 이미지 정리 완료" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  이미지 정리 중 오류 발생" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 개발 환경 초기화 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 다음 단계:" -ForegroundColor White
Write-Host "   개발 환경을 다시 시작하려면: .\scripts\start-dev.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 현재 상태 확인:" -ForegroundColor White
Write-Host "   - 컨테이너: podman ps -a" -ForegroundColor Gray
Write-Host "   - 볼륨: podman volume ls" -ForegroundColor Gray
Write-Host "   - 이미지: podman images" -ForegroundColor Gray
Write-Host "   - 네트워크: podman network ls" -ForegroundColor Gray
Write-Host ""