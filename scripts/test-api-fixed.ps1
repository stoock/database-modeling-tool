# API Test Script
$baseUrl = "http://localhost:8080/api"
$passCount = 0
$failCount = 0

function Test-Api {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`nTest: $Name" -ForegroundColor Cyan
    Write-Host "  $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json; charset=utf-8"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "  PASS - Status: $($response.StatusCode)" -ForegroundColor Green
            $script:passCount++
            return @{
                Success = $true
                StatusCode = $response.StatusCode
                Content = $response.Content | ConvertFrom-Json
            }
        } else {
            Write-Host "  FAIL - Expected: $ExpectedStatus, Got: $($response.StatusCode)" -ForegroundColor Red
            $script:failCount++
            return @{
                Success = $false
                StatusCode = $response.StatusCode
            }
        }
    } catch {
        Write-Host "  FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:failCount++
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Project Tests
Write-Host "`n1. Project API Tests" -ForegroundColor Yellow

$result = Test-Api -Name "Get Projects" -Method GET -Url "$baseUrl/projects"

$newProject = @{
    name = "Test Project $(Get-Date -Format 'yyyyMMddHHmmss')"
    description = "Test project description"
    namingRules = @{
        enforceCase = "PASCAL"
        tablePattern = "^[A-Z][a-zA-Z0-9]*$"
        columnPattern = "^[a-z][a-z0-9_]*$"
    }
}
$result = Test-Api -Name "Create Project" -Method POST -Url "$baseUrl/projects" -Body $newProject -ExpectedStatus 201
$projectId = $result.Content.data.id

$result = Test-Api -Name "Get Project" -Method GET -Url "$baseUrl/projects/$projectId"

$updateProject = @{
    name = "Updated Test Project"
    description = "Updated description"
}
$result = Test-Api -Name "Update Project" -Method PUT -Url "$baseUrl/projects/$projectId" -Body $updateProject

# 2. Table Tests
Write-Host "`n2. Table API Tests" -ForegroundColor Yellow

$result = Test-Api -Name "Get Tables" -Method GET -Url "$baseUrl/projects/$projectId/tables"

$newTable = @{
    name = "TestUser"
    description = "Test user table"
    positionX = 100
    positionY = 100
}
$result = Test-Api -Name "Create Table" -Method POST -Url "$baseUrl/projects/$projectId/tables" -Body $newTable -ExpectedStatus 201
$tableId = $result.Content.data.id

$result = Test-Api -Name "Get Table" -Method GET -Url "$baseUrl/tables/$tableId"

$updateTable = @{
    name = "UpdatedTestUser"
    description = "Updated table description"
    positionX = 200
    positionY = 200
}
$result = Test-Api -Name "Update Table" -Method PUT -Url "$baseUrl/tables/$tableId" -Body $updateTable

# 3. Column Tests
Write-Host "`n3. Column API Tests" -ForegroundColor Yellow

$result = Test-Api -Name "Get Columns" -Method GET -Url "$baseUrl/tables/$tableId/columns"

$newColumn1 = @{
    name = "id"
    description = "User ID"
    dataType = "BIGINT"
    isPrimaryKey = $true
    isIdentity = $true
    isNullable = $false
    orderIndex = 1
}
$result = Test-Api -Name "Create Column (ID)" -Method POST -Url "$baseUrl/tables/$tableId/columns" -Body $newColumn1 -ExpectedStatus 201

$newColumn2 = @{
    name = "username"
    description = "Username"
    dataType = "NVARCHAR"
    maxLength = 50
    isNullable = $false
    orderIndex = 2
}
$result = Test-Api -Name "Create Column (Username)" -Method POST -Url "$baseUrl/tables/$tableId/columns" -Body $newColumn2 -ExpectedStatus 201
$columnId2 = $result.Content.data.id

$newColumn3 = @{
    name = "email"
    description = "Email"
    dataType = "NVARCHAR"
    maxLength = 255
    isNullable = $false
    orderIndex = 3
}
$result = Test-Api -Name "Create Column (Email)" -Method POST -Url "$baseUrl/tables/$tableId/columns" -Body $newColumn3 -ExpectedStatus 201
$columnId3 = $result.Content.data.id

$updateColumn = @{
    name = "email_address"
    description = "Email address"
    dataType = "NVARCHAR"
    maxLength = 320
}
$result = Test-Api -Name "Update Column" -Method PUT -Url "$baseUrl/columns/$columnId3" -Body $updateColumn

# 4. Index Tests
Write-Host "`n4. Index API Tests" -ForegroundColor Yellow

$result = Test-Api -Name "Get Indexes" -Method GET -Url "$baseUrl/tables/$tableId/indexes"

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
$result = Test-Api -Name "Create Index" -Method POST -Url "$baseUrl/tables/$tableId/indexes" -Body $newIndex -ExpectedStatus 201
$indexId = $result.Content.data.id

$updateIndex = @{
    name = "IX_TestUser_Username_Updated"
    type = "NONCLUSTERED"
    isUnique = $true
}
$result = Test-Api -Name "Update Index" -Method PUT -Url "$baseUrl/indexes/$indexId" -Body $updateIndex

# 5. Validation Tests
Write-Host "`n5. Validation API Tests" -ForegroundColor Yellow

$result = Test-Api -Name "Validate Project" -Method POST -Url "$baseUrl/projects/$projectId/validation/all"

# 6. Export Tests
Write-Host "`n6. Export API Tests" -ForegroundColor Yellow

$exportSqlOptions = @{
    format = "SQL"
    includeComments = $true
    includeIndexes = $true
}
$result = Test-Api -Name "Export SQL" -Method POST -Url "$baseUrl/projects/$projectId/export/preview" -Body $exportSqlOptions

$exportJsonOptions = @{
    format = "JSON"
}
$result = Test-Api -Name "Export JSON" -Method POST -Url "$baseUrl/projects/$projectId/export/preview" -Body $exportJsonOptions

$exportMarkdownOptions = @{
    format = "MARKDOWN"
}
$result = Test-Api -Name "Export Markdown" -Method POST -Url "$baseUrl/projects/$projectId/export/preview" -Body $exportMarkdownOptions

# 7. Delete Tests
Write-Host "`n7. Delete API Tests" -ForegroundColor Yellow

$result = Test-Api -Name "Delete Index" -Method DELETE -Url "$baseUrl/indexes/$indexId" -ExpectedStatus 204

$result = Test-Api -Name "Delete Column" -Method DELETE -Url "$baseUrl/columns/$columnId3" -ExpectedStatus 204

$result = Test-Api -Name "Delete Table" -Method DELETE -Url "$baseUrl/tables/$tableId" -ExpectedStatus 204

$result = Test-Api -Name "Delete Project" -Method DELETE -Url "$baseUrl/projects/$projectId" -ExpectedStatus 204

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$totalTests = $passCount + $failCount
$passRate = if ($totalTests -gt 0) { [math]::Round(($passCount / $totalTests) * 100, 2) } else { 0 }

Write-Host "`nTotal: $totalTests" -ForegroundColor White
Write-Host "Pass: $passCount" -ForegroundColor Green
Write-Host "Fail: $failCount" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

if ($failCount -eq 0) {
    Write-Host "`n[SUCCESS] All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n[WARNING] Some tests failed." -ForegroundColor Yellow
    exit 1
}
