# API Test Script
$baseUrl = "http://localhost:8080/api"
$passCount = 0
$failCount = 0

function Test-Api {
    param($Name, $Method, $Url, $Body = $null, $ExpectedStatus = 200)
    
    Write-Host "`nTest: $Name" -ForegroundColor Cyan
    Write-Host "  $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
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
                Content = ($response.Content | ConvertFrom-Json)
            }
        } else {
            Write-Host "  FAIL - Expected: $ExpectedStatus, Got: $($response.StatusCode)" -ForegroundColor Red
            $script:failCount++
            return @{ Success = $false }
        }
    } catch {
        Write-Host "  FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:failCount++
        return @{ Success = $false }
    }
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "API Test Suite" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# 1. Project Tests
Write-Host "`n[1] Project API Tests" -ForegroundColor Yellow

$r = Test-Api "Get Projects" GET "$baseUrl/projects"

$newProject = @{
    name = "Test Project $(Get-Date -Format 'yyyyMMddHHmmss')"
    description = "Test project"
}
$r = Test-Api "Create Project" POST "$baseUrl/projects" $newProject 201
$projectId = $r.Content.data.id

$r = Test-Api "Get Project" GET "$baseUrl/projects/$projectId"

$updateProject = @{
    name = "Updated Test Project"
    description = "Updated description"
}
$r = Test-Api "Update Project" PUT "$baseUrl/projects/$projectId" $updateProject

# 2. Table Tests
Write-Host "`n[2] Table API Tests" -ForegroundColor Yellow

$r = Test-Api "Get Tables" GET "$baseUrl/projects/$projectId/tables"

$newTable = @{
    name = "TestTable"
    description = "Test table"
    positionX = 100
    positionY = 100
}
$r = Test-Api "Create Table" POST "$baseUrl/projects/$projectId/tables" $newTable 201
$tableId = $r.Content.data.id

$r = Test-Api "Get Table" GET "$baseUrl/tables/$tableId"

$updateTable = @{
    name = "UpdatedTable"
    description = "Updated table"
}
$r = Test-Api "Update Table" PUT "$baseUrl/tables/$tableId" $updateTable

# 3. Column Tests
Write-Host "`n[3] Column API Tests" -ForegroundColor Yellow

$r = Test-Api "Get Columns" GET "$baseUrl/tables/$tableId/columns"

$newColumn = @{
    name = "id"
    description = "ID column"
    dataType = "BIGINT"
    isPrimaryKey = $true
    isIdentity = $true
    isNullable = $false
}
$r = Test-Api "Create Column" POST "$baseUrl/tables/$tableId/columns" $newColumn 201
$columnId = $r.Content.data.id

$updateColumn = @{
    name = "user_id"
    description = "User ID"
    dataType = "BIGINT"
}
$r = Test-Api "Update Column" PUT "$baseUrl/columns/$columnId" $updateColumn

# 4. Index Tests
Write-Host "`n[4] Index API Tests" -ForegroundColor Yellow

$r = Test-Api "Get Indexes" GET "$baseUrl/tables/$tableId/indexes"

$newIndex = @{
    name = "IX_Test"
    type = "NONCLUSTERED"
    isUnique = $true
    columns = @(@{ columnId = $columnId; order = "ASC" })
}
$r = Test-Api "Create Index" POST "$baseUrl/tables/$tableId/indexes" $newIndex 201
$indexId = $r.Content.data.id

# 5. Validation Tests
Write-Host "`n[5] Validation API Tests" -ForegroundColor Yellow

$r = Test-Api "Validate Project" POST "$baseUrl/projects/$projectId/validate"

# 6. Export Tests
Write-Host "`n[6] Export API Tests" -ForegroundColor Yellow

$exportOpts = @{ includeComments = $true }
$r = Test-Api "Export SQL" POST "$baseUrl/projects/$projectId/export/sql" $exportOpts
$r = Test-Api "Export JSON" POST "$baseUrl/projects/$projectId/export/json"
$r = Test-Api "Export Markdown" POST "$baseUrl/projects/$projectId/export/markdown"

# 7. Delete Tests
Write-Host "`n[7] Delete API Tests" -ForegroundColor Yellow

$r = Test-Api "Delete Index" DELETE "$baseUrl/indexes/$indexId" $null 204
$r = Test-Api "Delete Column" DELETE "$baseUrl/columns/$columnId" $null 204
$r = Test-Api "Delete Table" DELETE "$baseUrl/tables/$tableId" $null 204
$r = Test-Api "Delete Project" DELETE "$baseUrl/projects/$projectId" $null 204

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$total = $passCount + $failCount
Write-Host "Total: $total" -ForegroundColor White
Write-Host "Pass: $passCount" -ForegroundColor Green
Write-Host "Fail: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "`nAll tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome tests failed." -ForegroundColor Yellow
    exit 1
}
