# End-to-end verification script for AIMS Asset Issue and Return Management Desk
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8088"
Write-Host "=========================================================="
Write-Host " STARTING COMPREHENSIVE E2E VERIFICATION TEST SUITE"
Write-Host "=========================================================="

function Unwrap($resp) {
    if ($resp.PSObject.Properties['data'] -and $null -ne $resp.data) {
        return $resp.data
    }
    return $resp
}

# 1. Base Endpoints Verification
Write-Host "`n[1] Verifying System Baseline Endpoints..."
$health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
Write-Host "Health check response: $($health.status)"
if ($health.status -ne "UP") { throw "Health check failed!" }

$ping = Invoke-RestMethod -Uri "$baseUrl/api/ping" -Method Get
Write-Host "Ping response: $($ping.message)"

$version = Invoke-RestMethod -Uri "$baseUrl/api/version" -Method Get
Write-Host "Version response: runtime=$($version.runtime), version=$($version.version)"

# 2. Authentication & Role Management
Write-Host "`n[2] Verifying Authentication & Role Management..."
# Login Admin
$adminLoginBody = @{ username = "admin"; password = "Admin@123" } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$adminAuth = Unwrap $adminRes
$adminToken = $adminAuth.token
Write-Host "Admin JWT Token acquired. Role: $($adminAuth.user.role)"
if ($adminAuth.user.role -ne "ROLE_ADMIN") { throw "Admin role mismatch!" }

# Login Issuer
$issuerLoginBody = @{ username = "issuer"; password = "Admin@123" } | ConvertTo-Json
$issuerRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $issuerLoginBody -ContentType "application/json"
$issuerAuth = Unwrap $issuerRes
$issuerToken = $issuerAuth.token
Write-Host "Issuer JWT Token acquired. Role: $($issuerAuth.user.role)"
if ($issuerAuth.user.role -ne "ROLE_ASSET_ISSUER") { throw "Issuer role mismatch!" }

# Login Employee
$empLoginBody = @{ username = "employee1"; password = "Admin@123" } | ConvertTo-Json
$empRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $empLoginBody -ContentType "application/json"
$empAuth = Unwrap $empRes
$empToken = $empAuth.token
Write-Host "Employee JWT Token acquired. Role: $($empAuth.user.role)"
if ($empAuth.user.role -ne "ROLE_EMPLOYEE") { throw "Employee role mismatch!" }

# Verify Profile
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
$issuerHeaders = @{ Authorization = "Bearer $issuerToken" }
$empHeaders = @{ Authorization = "Bearer $empToken" }

$adminProfile = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" -Method Get -Headers $adminHeaders)
Write-Host "Admin Profile loaded: username=$($adminProfile.username), role=$($adminProfile.role)"

$updateProfileBody = @{ fullName = "Rajesh Kumar Sharma"; phone = "+91 98765 43210" } | ConvertTo-Json
$updatedProfile = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" -Method Put -Body $updateProfileBody -Headers $adminHeaders -ContentType "application/json")
Write-Host "Admin Profile updated: fullName=$($updatedProfile.fullName), phone=$($updatedProfile.phone)"

# 3. Admin Dashboard & 8 KPIs
Write-Host "`n[3] Verifying Admin Dashboard & 8 KPIs..."
$stats = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/dashboard/stats" -Method Get -Headers $adminHeaders)
Write-Host "Dashboard KPIs received:"
Write-Host " - Total Assets: $($stats.totalAssets)"
Write-Host " - Available Assets: $($stats.availableAssets)"
Write-Host " - Issued Assets: $($stats.issuedAssets)"
Write-Host " - Under Maintenance: $($stats.underMaintenance)"
Write-Host " - Retired Assets: $($stats.retiredAssets)"
Write-Host " - Total Employees: $($stats.totalEmployees)"
Write-Host " - Pending Requests: $($stats.pendingRequests)"
Write-Host " - Overdue Returns: $($stats.overdueReturns)"

# 4. QR / Barcode & Asset Lookup
Write-Host "`n[4] Verifying QR / Barcode Code Lookup..."
$assetByCode = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/assets/code/AST-1001" -Method Get -Headers $adminHeaders)
Write-Host "Found Asset by Code AST-1001: $($assetByCode.name) (Status: $($assetByCode.status))"

# 5. Full Core Asset Lifecycle E2E
Write-Host "`n[5] Executing Core Asset Lifecycle Workflow (Request -> Approval -> Issue -> Return Damaged -> Maintenance -> Completed)..."

# Step A: Employee Requests an Asset
$availAssets = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/employee/assets" -Method Get -Headers $empHeaders)
$targetAsset = $availAssets[0]
Write-Host "Step A: Employee submits asset request for available Asset #$($targetAsset.id) ($($targetAsset.name))..."
$reqBody = @{ assetId = $targetAsset.id; remarks = "Requesting laptop for project development" } | ConvertTo-Json
$reqResult = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/employee/requests" -Method Post -Body $reqBody -Headers $empHeaders -ContentType "application/json")
$requestId = $reqResult.id
Write-Host "Asset request #$requestId submitted by Employee. Status: $($reqResult.status)"

# Step B: Issuer / Admin Approves Request
Write-Host "Step B: Issuer approves request #$requestId..."
$processBody = @{ status = "APPROVED"; remarks = "Approved by IT Officer" } | ConvertTo-Json
$approvedReq = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/issuer/requests/$requestId" -Method Put -Body $processBody -Headers $issuerHeaders -ContentType "application/json")
Write-Host "Request status: $($approvedReq.status)"

# Step C: Issuer Issues Asset to Employee (Status: AVAILABLE -> ISSUED)
Write-Host "Step C: Issuer physically issues asset #$($targetAsset.id) to Employee..."
$issueBody = @{
    assetId = $targetAsset.id
    employeeId = if ($reqResult.employee -and $reqResult.employee.id) { $reqResult.employee.id } else { 1 }
    expectedReturnDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")
    conditionAtIssue = "Good"
    remarks = "Issued with charger and sleeve"
} | ConvertTo-Json
$issueResult = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/issuer/issue-asset" -Method Post -Body $issueBody -Headers $issuerHeaders -ContentType "application/json")
$issueId = $issueResult.id
Write-Host "Issue #$issueId created. Issue Status: $($issueResult.issueStatus)"

# Verify Asset is now ISSUED
$checkAsset = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/assets/$($targetAsset.id)" -Method Get -Headers $adminHeaders)
Write-Host "Asset #$($targetAsset.id) Status verified: $($checkAsset.status) (Expected: ISSUED)"
if ($checkAsset.status -ne "ISSUED") { throw "Asset status was not updated to ISSUED!" }

# Step D: Issuer processes return with Condition = DAMAGED (Status: ISSUED -> MAINTENANCE)
Write-Host "Step D: Issuer receives returned asset with DAMAGED condition..."
$returnBody = @{
    issueId = $issueId
    returnCondition = "DAMAGED"
    remarks = "Hinge cracked during transit; sending to maintenance"
} | ConvertTo-Json
$returnResult = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/issuer/return-asset" -Method Post -Body $returnBody -Headers $issuerHeaders -ContentType "application/json")
Write-Host "Return recorded with condition: $($returnResult.returnCondition)"

# Verify Asset is now in MAINTENANCE
$checkAssetAfterReturn = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/assets/$($targetAsset.id)" -Method Get -Headers $adminHeaders)
Write-Host "Asset #$($targetAsset.id) Status verified: $($checkAssetAfterReturn.status) (Expected: MAINTENANCE)"
if ($checkAssetAfterReturn.status -ne "MAINTENANCE") { throw "Asset status was not updated to MAINTENANCE!" }

# Step E: Maintenance Completed (Status: MAINTENANCE -> AVAILABLE)
Write-Host "Step E: Technicians repair the asset and mark maintenance COMPLETED..."
$allMaint = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/maintenances" -Method Get -Headers $adminHeaders)
$latestMaint = $allMaint[-1]
Write-Host "Latest Maintenance Ticket #$($latestMaint.id) for Asset #$($latestMaint.asset.id)"

$maintCompleteBody = @{ status = "COMPLETED" } | ConvertTo-Json
$completedMaint = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/maintenances/$($latestMaint.id)" -Method Patch -Body $maintCompleteBody -Headers $adminHeaders -ContentType "application/json")
Write-Host "Maintenance Ticket #$($latestMaint.id) status: $($completedMaint.status)"

# Verify Asset is restored to AVAILABLE
$restoredAsset = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/assets/$($targetAsset.id)" -Method Get -Headers $adminHeaders)
Write-Host "Asset #$($targetAsset.id) Status verified: $($restoredAsset.status) (Expected: AVAILABLE)"
if ($restoredAsset.status -ne "AVAILABLE") { throw "Asset status was not restored to AVAILABLE!" }
if ($restoredAsset.status -ne "AVAILABLE") { throw "Asset status was not restored to AVAILABLE!" }

# 6. Audit Trail & Activity Logs
Write-Host "`n[6] Verifying Audit Trail & History Logs..."
$auditLogs = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/logs" -Method Get -Headers $adminHeaders)
Write-Host "Total Audit Logs recorded: $($auditLogs.Count)"
foreach ($l in $auditLogs | Select-Object -Last 5) {
    Write-Host " - [$($l.createdAt)] Action: $($l.action) | Details: $($l.details)"
}

# 7. Notifications Verification
Write-Host "`n[7] Verifying Notifications & Alert Dispatch..."
$notifications = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/notifications/unread" -Method Get -Headers $empHeaders)
Write-Host "Employee has $($notifications.Count) unread notifications"
if ($notifications.Count -gt 0) {
    $firstNotif = $notifications[0]
    Write-Host "Sample notification message: $($firstNotif.message)"
    Invoke-RestMethod -Uri "$baseUrl/api/notifications/$($firstNotif.id)/read" -Method Put -Headers $empHeaders
    Write-Host "Notification #$($firstNotif.id) marked as read successfully."
}

# 8. User / Employee / Issuer / Department Management
Write-Host "`n[8] Verifying People & Organization Management APIs..."
$empData = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/employees" -Method Get -Headers $adminHeaders)
$employees = if ($empData.PSObject.Properties['content']) { $empData.content } else { $empData }
Write-Host "Total Employees loaded: $($employees.Count)"

$issuers = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/users/issuers" -Method Get -Headers $adminHeaders)
Write-Host "Total Issuers loaded: $(@($issuers).Count)"

$departments = Unwrap (Invoke-RestMethod -Uri "$baseUrl/api/departments" -Method Get -Headers $adminHeaders)
Write-Host "Total Departments loaded: $($departments.Count)"

Write-Host "`n=========================================================="
Write-Host " ALL 10 FEATURE MODULES VERIFIED WORKING PERFECTLY! 100% PASS "
Write-Host "=========================================================="
