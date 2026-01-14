# SerpifAI v6 - Clasp Deployment Script
# Pushes all 67 files to Apps Script project

$scriptId = "1ccoF_sOZRHtmee-M9h-MZ5AZMS44tq2SpZYf5TJvRMErBOIEM489tpY3"
$rootDir = "v6_saas\apps_script"

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  SerpifAI v6 - Clasp Deployment" -ForegroundColor White
Write-Host "================================================================`n" -ForegroundColor Cyan

# Step 1: Check clasp installation
Write-Host "[1/8] Checking clasp installation..." -ForegroundColor Yellow
try {
    $claspVersion = clasp --version 2>&1
    Write-Host "  Clasp installed: $claspVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Clasp not found. Please install:" -ForegroundColor Red
    Write-Host "  npm install -g @google/clasp" -ForegroundColor White
    exit 1
}

# Step 2: Check authentication
Write-Host "`n[2/8] Checking authentication..." -ForegroundColor Yellow
$whoami = clasp whoami 2>&1
if ($whoami -match "Not logged in") {
    Write-Host "  ERROR: Not authenticated. Please run:" -ForegroundColor Red
    Write-Host "  clasp login" -ForegroundColor White
    exit 1
}
Write-Host "  Authenticated: $whoami" -ForegroundColor Green

# Step 3: Create .clasp.json
Write-Host "`n[3/8] Creating .clasp.json..." -ForegroundColor Yellow
$claspConfig = @{
    scriptId = $scriptId
    rootDir = $rootDir
} | ConvertTo-Json
Set-Content -Path ".clasp.json" -Value $claspConfig -Encoding UTF8
Write-Host "  Created .clasp.json with scriptId: $scriptId" -ForegroundColor Green

# Step 4: Create .claspignore
Write-Host "`n[4/8] Creating .claspignore..." -ForegroundColor Yellow
$claspIgnore = @"
**/**
!v6_saas/apps_script/**/*.gs
!v6_saas/apps_script/**/*.html
!appsscript.json
"@
Set-Content -Path ".claspignore" -Value $claspIgnore -Encoding UTF8
Write-Host "  Created .claspignore (include only .gs and .html files)" -ForegroundColor Green

# Step 5: Create appsscript.json if missing
Write-Host "`n[5/8] Checking appsscript.json..." -ForegroundColor Yellow
$appsscriptPath = "$rootDir\appsscript.json"
if (-not (Test-Path $appsscriptPath)) {
    $appsscript = @{
        timeZone = "America/New_York"
        runtimeVersion = "V8"
        exceptionLogging = "STACKDRIVER"
    } | ConvertTo-Json
    Set-Content -Path $appsscriptPath -Value $appsscript -Encoding UTF8
    Write-Host "  Created appsscript.json" -ForegroundColor Green
} else {
    Write-Host "  appsscript.json already exists" -ForegroundColor Green
}

# Step 6: Count files
Write-Host "`n[6/8] Counting files..." -ForegroundColor Yellow
$gsFiles = (Get-ChildItem "$rootDir\*.gs" -File).Count
$htmlFiles = (Get-ChildItem "$rootDir\*.html" -File).Count
$totalFiles = $gsFiles + $htmlFiles
Write-Host "  Found $gsFiles .gs files + $htmlFiles .html files = $totalFiles total" -ForegroundColor Green

# Step 7: Push to Apps Script
Write-Host "`n[7/8] Pushing to Apps Script..." -ForegroundColor Yellow
Write-Host "  This may take 1-2 minutes..." -ForegroundColor Gray
try {
    clasp push --force
    Write-Host "  SUCCESS: All $totalFiles files pushed!" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Push failed. Error: $_" -ForegroundColor Red
    exit 1
}

# Step 8: Open project
Write-Host "`n[8/8] Opening project in browser..." -ForegroundColor Yellow
try {
    clasp open
    Write-Host "  Project opened in browser" -ForegroundColor Green
} catch {
    Write-Host "  Could not open browser. Manual URL:" -ForegroundColor Yellow
    Write-Host "  https://script.google.com/home/projects/$scriptId/edit" -ForegroundColor White
}

# Success summary
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================================================`n" -ForegroundColor Cyan

Write-Host "Files Deployed: $totalFiles ($gsFiles .gs + $htmlFiles .html)" -ForegroundColor White
Write-Host "Project ID: $scriptId`n" -ForegroundColor White

Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Set Script Properties: Add GEMINI_API_KEY" -ForegroundColor White
Write-Host "  2. Deploy as Web App: Deploy > New Deployment > Web App" -ForegroundColor White
Write-Host "  3. Authorize: First run will ask for permissions" -ForegroundColor White
Write-Host "  4. Test in Google Sheets" -ForegroundColor White

Write-Host "`nProject URL:" -ForegroundColor Cyan
Write-Host "  https://script.google.com/home/projects/$scriptId/edit" -ForegroundColor White

Write-Host "`n================================================================`n" -ForegroundColor Cyan

exit 0
