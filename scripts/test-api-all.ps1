# test-api-all.ps1 - 백엔드 API 전체 테스트 스크립트
# Database Modeling Tool - 모든 REST API 엔드포인트 테스트

$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$baseUrl = "http://localhost:8080/api"
$passCount = 0
$failCount = 0

function Test-ApiEndpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`n테스트: $Name" -ForegroundColor Cyan
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json; charset=utf-8"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            Write-Host "   Body: $($params.Body)" -ForegroundColor Gray
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "   PASS - Status: $($response.StatusCode)" -ForegroundColor Green
            $script:passCount++
            return @{
                Success = $true
                StatusCode = $response.StatusCode
                Content = $response.Content | ConvertFrom-Json
            }
        } else {
            Write-Host "   FAIL - Expected: $ExpectedStatus, Got: $($response.StatusCode)" -ForegroundColor Red
            $script:failCount++
            return @{
                Success = $false
                StatusCode = $response.StatusCode
                Content = $response.Content
            }
        }
    } catch {
        Write-Host "   FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:failCount++
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "     Database Modeling Tool - API 전체 테스트              " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ============================================================================
# 1. 프로젝트 API 테스트
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "1. 프로젝트 API 테스트" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 1.1 프로젝트 목록 조회
$result = Test-ApiEndpoint -Name "프로젝트 목록 조회" -Method GET -Url "$baseUrl/projects"

# 1.2 프로젝트 생성
$newProject = @{
    name = "API Test Project $(Get-Date -Format 'yyyyMMddHHmmss')"
    description = "API 테스트용 프로젝트"
    namingRules = @{
        enforceCase = "PASCAL"
        tablePattern = "^[A-Z][a-zA-Z0-9]*$"
        columnPattern = "^[a-z][a-z0-9_]*$"
    }
}
$result = Test-ApiEndpoint -Name "프로젝트 생성" -Method POST -Url "$baseUrl/projects" -Body $newProject -ExpectedStatus 201
$projectId = $result.Content.data.id

# 1.3 프로젝트 상세 조회
$result = Test-ApiEndpoint -Name "프로젝트 상세 조회" -Method GET -Url "$baseUrl/projects/$projectId"

# 1.4 프로젝트 수정
$updateProject = @{
    name = "Updated API Test Project"
    description = "수정된 프로젝트 설명"
}
$result = Test-ApiEndpoint -Name "프로젝트 수정" -Method PUT -Url "$baseUrl/projects/$projectId" -Body $updateProject

# ============================================================================
# 2. 테이블 API 테스트
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "2. 테이블 API 테스트" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 2.1 테이블 목록 조회
$result = Test-ApiEndpoint -Name "테이블 목록 조회" -Method GET -Url "$baseUrl/projects/$projectId/tables"

# 2.2 테이블 생성
$newTable = @{
    name = "TestUser"
    description = "테스트 사용자 테이블"
    positionX = 100
    positionY = 100
}
$result = Test-ApiEndpoint -Name "테이블 생성" -Method POST -Url "$baseUrl/projects/$projectId/tables" -Body $newTable -ExpectedStatus 201
$tableId = $result.Content.data.id

# 2.3 테이블 상세 조회
$result = Test-ApiEndpoint -Name "테이블 상세 조회" -Method GET -Url "$baseUrl/tables/$tableId"

# 2.4 테이블 수정
$updateTable = @{
    name = "UpdatedTestUser"
    description = "수정된 테이블 설명"
    positionX = 200
    positionY = 200
}
$result = Test-ApiEndpoint -Name "테이블 수정" -Method PUT -Url "$baseUrl/tables/$tableId" -Body $updateTable

# ============================================================================
# 3. 컬럼 API 테스트
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "3. 컬럼 API 테스트" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 3.1 컬럼 목록 조회
$result = Test-ApiEndpoint -Name "컬럼 목록 조회" -Method GET -Url "$baseUrl/tables/$tableId/columns"

# 3.2 컬럼 생성 - ID (기본키)
$newColumn1 = @{
    name = "id"
    description = "사용자 ID"
    dataType = "BIGINT"
    isPrimaryKey = $true
    isIdentity = $true
    isNullable = $false
}
$result = Test-ApiEndpoint -Name "컬럼 생성 (ID)" -Method POST -Url "$baseUrl/tables/$tableId/columns" -Body $newColumn1 -ExpectedStatus 201

# 3.3 컬럼 생성 - Username
$newColumn2 = @{
    name = "username"
    description = "사용자명"
    dataType = "NVARCHAR"
    maxLength = 50
    isNullable = $false
}
$result = Test-ApiEndpoint -Name "컬럼 생성 (Username)" -Method POST -Url "$baseUrl/tables/$tableId/columns" -Body $newColumn2 -ExpectedStatus 201
$columnId2 = $result.Content.data.id

# 3.4 컬럼 생성 - Email
$newColumn3 = @{
    name = "email"
    description = "이메일"
    dataType = "NVARCHAR"
    maxLength = 255
    isNullable = $false
}
$result = Test-ApiEndpoint -Name "컬럼 생성 (Email)" -Method POST -Url "$baseUrl/tables/$tableId/columns" -Body $newColumn3 -ExpectedStatus 201
$columnId3 = $result.Content.data.id

# 3.5 컬럼 수정
$updateColumn = @{
    name = "email_address"
    description = "이메일 주소"
    dataType = "NVARCHAR"
    maxLength = 320
}
$result = Test-ApiEndpoint -Name "컬럼 수정" -Method PUT -Url "$baseUrl/columns/$columnId3" -Body $updateColumn

# ============================================================================
# 4. 인덱스 API 테스트
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "4. 인덱스 API 테스트" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 4.1 인덱스 목록 조회
$result = Test-ApiEndpoint -Name "인덱스 목록 조회" -Method GET -Url "$baseUrl/tables/$tableId/indexes"

# 4.2 인덱스 생성
$newIndex = @{
    name = "IX_TestUser_Username"
    type = "NONCLUSTERED"
    isUnique = $true
    columns = @(
        @{
            columnId = $columnId2
            order = "ASC"
        }
    )
}
$result = Test-ApiEndpoint -Name "인덱스 생성" -Method POST -Url "$baseUrl/tables/$tableId/indexes" -Body $newIndex -ExpectedStatus 201
$indexId = $result.Content.data.id

# 4.3 인덱스 수정
$updateIndex = @{
    name = "IX_TestUser_Username_Updated"
    type = "NONCLUSTERED"
    isUnique = $true
}
$result = Test-ApiEndpoint -Name "인덱스 수정" -Method PUT -Url "$baseUrl/indexes/$indexId" -Body $updateIndex

# ============================================================================
# 5. 검증 API 테스트
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "5. 검증 API 테스트" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 5.1 프로젝트 검증
$result = Test-ApiEndpoint -Name "프로젝트 검증" -Method POST -Url "$baseUrl/projects/$projectId/validate"

# ============================================================================
# 6. 내보내기 API 테스트
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "6. 내보내기 API 테스트" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 6.1 SQL 스크립트 생성
$exportOptions = @{
    includeDropStatements = $false
    includeComments = $true
    includeIndexes = $true
}
$result = Test-ApiEndpoint -Name "SQL 스크립트 생성" -Method POST -Url "$baseUrl/projects/$projectId/export/sql" -Body $exportOptions

# 6.2 JSON 형식 내보내기
$result = Test-ApiEndpoint -Name "JSON 형식 내보내기" -Method POST -Url "$baseUrl/projects/$projectId/export/json"

# 6.3 Markdown 문서 생성
$result = Test-ApiEndpoint -Name "Markdown 문서 생성" -Method POST -Url "$baseUrl/projects/$projectId/export/markdown"

# ============================================================================
# 7. 삭제 API 테스트 (역순)
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "7. 삭제 API 테스트" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 7.1 인덱스 삭제
$result = Test-ApiEndpoint -Name "인덱스 삭제" -Method DELETE -Url "$baseUrl/indexes/$indexId" -ExpectedStatus 204

# 7.2 컬럼 삭제
$result = Test-ApiEndpoint -Name "컬럼 삭제" -Method DELETE -Url "$baseUrl/columns/$columnId3" -ExpectedStatus 204

# 7.3 테이블 삭제
$result = Test-ApiEndpoint -Name "테이블 삭제" -Method DELETE -Url "$baseUrl/tables/$tableId" -ExpectedStatus 204

# 7.4 프로젝트 삭제
$result = Test-ApiEndpoint -Name "프로젝트 삭제" -Method DELETE -Url "$baseUrl/projects/$projectId" -ExpectedStatus 204

# ============================================================================
# 테스트 결과 요약
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "테스트 결과 요약" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$totalTests = $passCount + $failCount
$passRate = if ($totalTests -gt 0) { [math]::Round(($passCount / $totalTests) * 100, 2) } else { 0 }

Write-Host "`n총 테스트: $totalTests" -ForegroundColor White
Write-Host "성공: $passCount" -ForegroundColor Green
Write-Host "실패: $failCount" -ForegroundColor Red
Write-Host "성공률: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

if ($failCount -eq 0) {
    Write-Host "`n[SUCCESS] All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n[WARNING] Some tests failed." -ForegroundColor Yellow
    exit 1
}
