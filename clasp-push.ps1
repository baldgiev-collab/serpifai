# ═══════════════════════════════════════════════════════════════════════════
# PUSH ALL FILES TO APPS SCRIPT VIA CLASP
# ═══════════════════════════════════════════════════════════════════════════
# This script uses Google's clasp CLI to push all files to your Apps Script project
# 
# Prerequisites:
# 1. Node.js installed (https://nodejs.org/)
# 2. Clasp installed: npm install -g @google/clasp
# 3. Clasp authenticated: clasp login
# ═══════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CLASP DEPLOYMENT TO APPS SCRIPT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$scriptId = "1ccoF_sOZRHtmee-M9h-MZ5AZMS44tq2SpZYf5TJvRMErBOIEM489tpY3"
$sourceDir = "v6_saas\apps_script"

# Step 1: Check if clasp is installed
Write-Host "Step 1: Checking clasp installation..." -ForegroundColor Yellow
try {
    $claspVersion = clasp --version 2>$null
    Write-Host "  ✅ Clasp is installed: $claspVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Clasp is NOT installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To install clasp:" -ForegroundColor Yellow
    Write-Host "  1. Install Node.js: https://nodejs.org/" -ForegroundColor White
    Write-Host "  2. Run: npm install -g @google/clasp" -ForegroundColor White
    Write-Host "  3. Run: clasp login" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Step 2: Check if authenticated
Write-Host "`nStep 2: Checking clasp authentication..." -ForegroundColor Yellow
try {
    $whoami = clasp whoami 2>$null
    Write-Host "  ✅ Authenticated as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Not authenticated!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To authenticate:" -ForegroundColor Yellow
    Write-Host "  Run: clasp login" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Step 3: Create .clasp.json if it doesn't exist
Write-Host "`nStep 3: Setting up project configuration..." -ForegroundColor Yellow

$claspJsonPath = ".clasp.json"
$claspJson = @{
    scriptId = $scriptId
    rootDir = $sourceDir
}

# Check if .clasp.json exists
if (Test-Path $claspJsonPath) {
    Write-Host "  ⚠️  .clasp.json already exists" -ForegroundColor Yellow
    Write-Host "  Updating with correct scriptId..." -ForegroundColor Yellow
}

# Write .clasp.json
$claspJson | ConvertTo-Json | Set-Content $claspJsonPath -Encoding UTF8
Write-Host "  ✅ Created .clasp.json with scriptId: $scriptId" -ForegroundColor Green

# Step 4: Create .claspignore if it doesn't exist
Write-Host "`nStep 4: Creating .claspignore..." -ForegroundColor Yellow

$claspIgnorePath = ".claspignore"
$claspIgnoreContent = @"
**/**
!v6_saas/apps_script/**/*.gs
!v6_saas/apps_script/**/*.html
!appsscript.json
"@

$claspIgnoreContent | Set-Content $claspIgnorePath -Encoding UTF8
Write-Host "  ✅ Created .claspignore" -ForegroundColor Green

# Step 5: Check appsscript.json
Write-Host "`nStep 5: Checking appsscript.json..." -ForegroundColor Yellow

$appsScriptJsonPath = Join-Path $sourceDir "appsscript.json"

if (-not (Test-Path $appsScriptJsonPath)) {
    Write-Host "  ⚠️  appsscript.json not found, creating default..." -ForegroundColor Yellow
    
    $appsScriptJson = @{
        timeZone = "America/New_York"
        dependencies = @{
            enabledAdvancedServices = @()
        }
        exceptionLogging = "STACKDRIVER"
        runtimeVersion = "V8"
    }
    
    $appsScriptJson | ConvertTo-Json -Depth 10 | Set-Content $appsScriptJsonPath -Encoding UTF8
    Write-Host "  ✅ Created appsscript.json" -ForegroundColor Green
} else {
    Write-Host "  ✅ appsscript.json exists" -ForegroundColor Green
}

# Step 6: Count files to push
Write-Host "`nStep 6: Counting files to push..." -ForegroundColor Yellow

$gsFiles = (Get-ChildItem -Path $sourceDir -Filter "*.gs" -File).Count
$htmlFiles = (Get-ChildItem -Path $sourceDir -Filter "*.html" -File).Count
$totalFiles = $gsFiles + $htmlFiles

Write-Host "  📄 .gs files: $gsFiles" -ForegroundColor White
Write-Host "  📄 .html files: $htmlFiles" -ForegroundColor White
Write-Host "  📦 Total files: $totalFiles" -ForegroundColor Cyan

# Step 7: Push to Apps Script
Write-Host "`nStep 7: Pushing files to Apps Script..." -ForegroundColor Yellow
Write-Host "  This may take 1-2 minutes for $totalFiles files..." -ForegroundColor Gray

try {
    # Push files
    Write-Host ""
    clasp push --force
    Write-Host ""
    Write-Host "  ✅ Successfully pushed $totalFiles files!" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error pushing files: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify scriptId is correct" -ForegroundColor White
    Write-Host "  2. Ensure you have edit access to the project" -ForegroundColor White
    Write-Host "  3. Try: clasp login (to re-authenticate)" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Step 8: Open the project
Write-Host "`nStep 8: Opening Apps Script project..." -ForegroundColor Yellow

try {
    clasp open
    Write-Host "  ✅ Opened in browser" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Could not auto-open. Open manually:" -ForegroundColor Yellow
    Write-Host "  https://script.google.com/home/projects/$scriptId/edit" -ForegroundColor Cyan
}

# Summary
Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Files Pushed:" -ForegroundColor Yellow
Write-Host "  ✅ $gsFiles .gs files" -ForegroundColor Green
Write-Host "  ✅ $htmlFiles .html files" -ForegroundColor Green
Write-Host "  ✅ Total: $totalFiles files" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "  1. Open project in browser (should auto-open)" -ForegroundColor White
Write-Host "  2. Set Script Properties (Settings → Script Properties):" -ForegroundColor White
Write-Host "     - GEMINI_API_KEY = your_api_key" -ForegroundColor Gray
Write-Host "  3. Deploy as Web App (Deploy → New Deployment)" -ForegroundColor White
Write-Host "  4. Test in Google Sheets" -ForegroundColor White

Write-Host "`nProject URL:" -ForegroundColor Cyan
Write-Host "  https://script.google.com/home/projects/$scriptId/edit" -ForegroundColor White

Write-Host "`n================================================================`n" -ForegroundColor Cyan
