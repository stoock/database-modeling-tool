# test-api-all.ps1 - 諛깆뿏??API ?꾩껜 ?뚯뒪???ㅽ겕由쏀듃
# Database Modeling Tool - 紐⑤뱺 REST API ?붾뱶?ъ씤???뚯뒪??

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
    
    Write-Host "`n?뚯뒪?? $Name" -ForegroundColor Cyan
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
Write-Host "     Database Modeling Tool - API ?꾩껜 ?뚯뒪??             " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ============================================================================
# 1. ?꾨줈?앺듃 API ?뚯뒪??
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "1. ?꾨줈?앺듃 API ?뚯뒪?? -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 1.1 ?꾨줈?앺듃 紐⑸줉 議고쉶
$result = Test-ApiEndpoint -Name "?꾨줈?앺듃 紐⑸줉 議고쉶" -Method GET -Url "$baseUrl/projects"

# 1.2 ?꾨줈?앺듃 ?앹꽦
$newProject = @{
    name = "API Test Project $(Get-Date -Format 'yyyyMMddHHmmss')"
    description = "API ?뚯뒪?몄슜 ?꾨줈?앺듃"
    namingRules = @{
        enforceCase = "PASCAL"
        tablePattern = "^[A-Z][a-zA-Z0-9]*$"
        columnPattern = "^[a-z][a-z0-9_]*$"
    }
}
$result = Test-ApiEndpoint -Name "?꾨줈?앺듃 ?앹꽦" -Method POST -Url "$baseUrl/projects" -Body $newProject -ExpectedStatus 201
$projectId = $result.Content.data.id

# 1.3 ?꾨줈?앺듃 ?곸꽭 議고쉶
$result = Test-ApiEndpoint -Name "?꾨줈?앺듃 ?곸꽭 議고쉶" -Method GET -Url "$baseUrl/projects/$projectId"

# 1.4 ?꾨줈?앺듃 ?섏젙
$updateProject = @{
    name = "Updated API Test Project"
    description = "?섏젙???꾨줈?앺듃 ?ㅻ챸"
}
$result = Test-ApiEndpoint -Name "?꾨줈?앺듃 ?섏젙" -Method PUT -Url "$baseUrl/projects/$projectId" -Body $updateProject

# ============================================================================
# 2. ?뚯씠釉?API ?뚯뒪??
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "2. ?뚯씠釉?API ?뚯뒪?? -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 2.1 ?뚯씠釉?紐⑸줉 議고쉶
$result = Test-ApiEndpoint -Name "?뚯씠釉?紐⑸줉 議고쉶" -Method GET -Url "$baseUrl/projects/$projectId/tables"

# 2.2 ?뚯씠釉??앹꽦
$newTable = @{
    name = "TestUser"
    description = "?뚯뒪???ъ슜???뚯씠釉?
    positionX = 100
    positionY = 100
}
$result = Test-ApiEndpoint -Name "?뚯씠釉??앹꽦" -Method POST -Url "$baseUrl/projects/$projectId/tables" -Body $newTable -ExpectedStatus 201
$tableId = $result.Content.data.id

# 2.3 ?뚯씠釉??곸꽭 議고쉶
$result = Test-ApiEndpoint -Name "?뚯씠釉??곸꽭 議고쉶" -Method GET -Url "$baseUrl/tables/$tableId"

# 2.4 ?뚯씠釉??섏젙
$updateTable = @{
    name = "UpdatedTestUser"
    description = "?섏젙???뚯씠釉??ㅻ챸"
    positionX = 200
    positionY = 200
}
$result = Test-ApiEndpoint -Name "?뚯씠釉??섏젙" -Method PUT -Url "$baseUrl/tables/$tableId" -Body $updateTable

# ============================================================================
# 3. 而щ읆 API ?뚯뒪??
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "3. 而щ읆 API ?뚯뒪?? -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 3.1 而щ읆 紐⑸줉 議고쉶
$result = Test-ApiEndpoint -Name "而щ읆 紐⑸줉 議고쉶" -Method GET -Url "$baseUrl/tables/$tableId/columns"

# 3.2 而щ읆 ?앹꽦 - ID (湲곕낯??
$newColumn1 = @{
    name = "id"
    description = "?ъ슜??ID"
    dataType = "BIGINT"
    isPrimaryKey = $true
    isIdentity = $true
    isNullable = $false
}
$result = Test-ApiEndpoint -Name "而щ읆 ?앹꽦 (ID)" -Method POST -Url "$baseUrl/tables/$tableId/columns" -Body $newColumn1 -ExpectedStatus 201

# 3.3 而щ읆 ?앹꽦 - Username
$newColumn2 = @{
    name = "username"
    description = "?ъ슜?먮챸"
    dataType = "NVARCHAR"
    maxLength = 50
    isNullable = $false
}
$result = Test-ApiEndpoint -Name "而щ읆 ?앹꽦 (Username)" -Method POST -Url "$baseUrl/tables/$tableId/columns" -Body $newColumn2 -ExpectedStatus 201
$columnId2 = $result.Content.data.id

# 3.4 而щ읆 ?앹꽦 - Email
$newColumn3 = @{
    name = "email"
    description = "?대찓??
    dataType = "NVARCHAR"
    maxLength = 255
    isNullable = $false
}
$result = Test-ApiEndpoint -Name "而щ읆 ?앹꽦 (Email)" -Method POST -Url "$baseUrl/tables/$tableId/columns" -Body $newColumn3 -ExpectedStatus 201
$columnId3 = $result.Content.data.id

# 3.5 而щ읆 ?섏젙
$updateColumn = @{
    name = "email_address"
    description = "?대찓??二쇱냼"
    dataType = "NVARCHAR"
    maxLength = 320
}
$result = Test-ApiEndpoint -Name "而щ읆 ?섏젙" -Method PUT -Url "$baseUrl/columns/$columnId3" -Body $updateColumn

# ============================================================================
# 4. ?몃뜳??API ?뚯뒪??
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "4. ?몃뜳??API ?뚯뒪?? -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 4.1 ?몃뜳??紐⑸줉 議고쉶
$result = Test-ApiEndpoint -Name "?몃뜳??紐⑸줉 議고쉶" -Method GET -Url "$baseUrl/tables/$tableId/indexes"

# 4.2 ?몃뜳???앹꽦
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
$result = Test-ApiEndpoint -Name "?몃뜳???앹꽦" -Method POST -Url "$baseUrl/tables/$tableId/indexes" -Body $newIndex -ExpectedStatus 201
$indexId = $result.Content.data.id

# 4.3 ?몃뜳???섏젙
$updateIndex = @{
    name = "IX_TestUser_Username_Updated"
    type = "NONCLUSTERED"
    isUnique = $true
}
$result = Test-ApiEndpoint -Name "?몃뜳???섏젙" -Method PUT -Url "$baseUrl/indexes/$indexId" -Body $updateIndex

# ============================================================================
# 5. 寃利?API ?뚯뒪??
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "5. 寃利?API ?뚯뒪?? -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 5.1 ?꾨줈?앺듃 寃利?
$result = Test-ApiEndpoint -Name "?꾨줈?앺듃 寃利? -Method POST -Url "$baseUrl/projects/$projectId/validate"

# ============================================================================
# 6. ?대낫?닿린 API ?뚯뒪??
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "6. ?대낫?닿린 API ?뚯뒪?? -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 6.1 SQL ?ㅽ겕由쏀듃 ?앹꽦
$exportOptions = @{
    includeDropStatements = $false
    includeComments = $true
    includeIndexes = $true
}
$result = Test-ApiEndpoint -Name "SQL ?ㅽ겕由쏀듃 ?앹꽦" -Method POST -Url "$baseUrl/projects/$projectId/export/sql" -Body $exportOptions

# 6.2 JSON ?뺤떇 ?대낫?닿린
$result = Test-ApiEndpoint -Name "JSON ?뺤떇 ?대낫?닿린" -Method POST -Url "$baseUrl/projects/$projectId/export/json"

# 6.3 Markdown 臾몄꽌 ?앹꽦
$result = Test-ApiEndpoint -Name "Markdown 臾몄꽌 ?앹꽦" -Method POST -Url "$baseUrl/projects/$projectId/export/markdown"

# ============================================================================
# 7. ??젣 API ?뚯뒪??(??닚)
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "7. ??젣 API ?뚯뒪?? -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# 7.1 ?몃뜳????젣
$result = Test-ApiEndpoint -Name "?몃뜳????젣" -Method DELETE -Url "$baseUrl/indexes/$indexId" -ExpectedStatus 204

# 7.2 而щ읆 ??젣
$result = Test-ApiEndpoint -Name "而щ읆 ??젣" -Method DELETE -Url "$baseUrl/columns/$columnId3" -ExpectedStatus 204

# 7.3 ?뚯씠釉???젣
$result = Test-ApiEndpoint -Name "?뚯씠釉???젣" -Method DELETE -Url "$baseUrl/tables/$tableId" -ExpectedStatus 204

# 7.4 ?꾨줈?앺듃 ??젣
$result = Test-ApiEndpoint -Name "?꾨줈?앺듃 ??젣" -Method DELETE -Url "$baseUrl/projects/$projectId" -ExpectedStatus 204

# ============================================================================
# ?뚯뒪??寃곌낵 ?붿빟
# ============================================================================
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "?뚯뒪??寃곌낵 ?붿빟" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$totalTests = $passCount + $failCount
$passRate = if ($totalTests -gt 0) { [math]::Round(($passCount / $totalTests) * 100, 2) } else { 0 }

Write-Host "`n珥??뚯뒪?? $totalTests" -ForegroundColor White
Write-Host "?깃났: $passCount" -ForegroundColor Green
Write-Host "?ㅽ뙣: $failCount" -ForegroundColor Red
Write-Host "?깃났瑜? $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

if ($failCount -eq 0) {
    Write-Host "`n[SUCCESS] All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n[WARNING] Some tests failed." -ForegroundColor Yellow
    exit 1
}
