# ═══════════════════════════════════════════════════════════════════════════
# ELITE HYBRID FETCHER - DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════════════════════════
# Automates deployment of Elite Hybrid Competitor Data Fetcher v7.0
# ═══════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 ELITE HYBRID FETCHER - DEPLOYMENT WIZARD" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: Pre-Deployment Checks
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "STEP 1: Pre-Deployment Checks" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray

$baseDir = "c:\Users\baldg\OneDrive\Documents\GitHub\serpifai"
$phpApiDir = "$baseDir\v6_saas\serpifai_php\apis"
$phpConfigDir = "$baseDir\v6_saas\serpifai_php\config"
$appsScriptDir = "$baseDir\v6_saas\apps_script"

# Check file existence
$filesToCheck = @(
    @{Path="$appsScriptDir\FT_EliteCompetitorFetcher.gs"; Name="Elite Fetcher (Apps Script)"},
    @{Path="$appsScriptDir\DB_COMP_EliteOrchestrator.gs"; Name="Orchestrator (Apps Script)"},
    @{Path="$phpApiDir\google_search_api.php"; Name="Google Search API (PHP)"},
    @{Path="$baseDir\v6_saas\serpifai_php\api_gateway.php"; Name="API Gateway (PHP)"}
)

$allFilesExist = $true
foreach ($file in $filesToCheck) {
    if (Test-Path $file.Path) {
        Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($file.Name) - NOT FOUND" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

if (-not $allFilesExist) {
    Write-Host "❌ ERROR: Some files are missing. Cannot proceed." -ForegroundColor Red
    Write-Host "   Please ensure all files are created first." -ForegroundColor Yellow
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: Check Environment Configuration
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "STEP 2: Environment Configuration Check" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray

$envFile = "$phpConfigDir\.env"
if (Test-Path $envFile) {
    Write-Host "  ✅ .env file found" -ForegroundColor Green
    
    $envContent = Get-Content $envFile -Raw
    
    # Check for required keys
    $requiredKeys = @(
        "GEMINI_API_KEY",
        "PAGE_SPEED_API_KEY",
        "SERPER_API_KEY",
        "OPEN_PAGERANK_API_KEY"
    )
    
    $missingKeys = @()
    foreach ($key in $requiredKeys) {
        if ($envContent -match "$key=.+") {
            Write-Host "  ✅ $key configured" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $key missing" -ForegroundColor Red
            $missingKeys += $key
        }
    }
    
    # Check for Google Search Engine ID (optional but recommended)
    if ($envContent -match "GOOGLE_SEARCH_ENGINE_ID=.+") {
        Write-Host "  ✅ GOOGLE_SEARCH_ENGINE_ID configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  GOOGLE_SEARCH_ENGINE_ID missing (Custom Search will fail)" -ForegroundColor Yellow
        Write-Host "     Create at: https://programmablesearchengine.google.com/" -ForegroundColor Gray
        
        $addSearchEngineId = Read-Host "  Do you want to add GOOGLE_SEARCH_ENGINE_ID now? (y/n)"
        if ($addSearchEngineId -eq 'y' -or $addSearchEngineId -eq 'Y') {
            $searchEngineId = Read-Host "  Enter your Search Engine ID"
            if ($searchEngineId) {
                Add-Content -Path $envFile -Value "`nGOOGLE_SEARCH_ENGINE_ID=$searchEngineId"
                Write-Host "  ✅ Added GOOGLE_SEARCH_ENGINE_ID to .env" -ForegroundColor Green
            }
        }
    }
    
    Write-Host ""
    
    if ($missingKeys.Count -gt 0) {
        Write-Host "❌ ERROR: Missing required API keys: $($missingKeys -join ', ')" -ForegroundColor Red
        Write-Host "   Please add these keys to .env file before deploying." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "  ❌ .env file not found at: $envFile" -ForegroundColor Red
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: Summary and Confirmation
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "STEP 3: Deployment Summary" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Files ready for deployment:" -ForegroundColor Cyan
Write-Host "  📄 FT_EliteCompetitorFetcher.gs (NEW - 450 lines)" -ForegroundColor White
Write-Host "  📄 DB_COMP_EliteOrchestrator.gs (UPDATED)" -ForegroundColor White
Write-Host "  📄 google_search_api.php (NEW - 150 lines)" -ForegroundColor White
Write-Host "  📄 api_gateway.php (UPDATED)" -ForegroundColor White
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  ✅ All 4 API keys configured" -ForegroundColor Green
Write-Host "  ✅ Environment file ready" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Upload PHP files to server (google_search_api.php, api_gateway.php)" -ForegroundColor White
Write-Host "  2. Deploy Apps Script files (FT_EliteCompetitorFetcher.gs, DB_COMP_EliteOrchestrator.gs)" -ForegroundColor White
Write-Host "  3. Create new Apps Script deployment" -ForegroundColor White
Write-Host "  4. Test with TEST_eliteFetcher() function" -ForegroundColor White
Write-Host "  5. Run full competitor analysis" -ForegroundColor White
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: Generate Upload Commands
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "STEP 4: Server Upload Commands" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Copy these commands to upload files via FTP/SSH:" -ForegroundColor Cyan
Write-Host ""

$serverPath = "public_html/serpifai_php"

Write-Host "# Upload Google Search API handler" -ForegroundColor Gray
Write-Host "scp '$phpApiDir\google_search_api.php' user@serpifai.com:$serverPath/apis/" -ForegroundColor White
Write-Host ""

Write-Host "# Upload updated API Gateway" -ForegroundColor Gray
Write-Host "scp '$baseDir\v6_saas\serpifai_php\api_gateway.php' user@serpifai.com:$serverPath/" -ForegroundColor White
Write-Host ""

Write-Host "# Verify .env file (already on server)" -ForegroundColor Gray
Write-Host "ssh user@serpifai.com 'cat $serverPath/config/.env | grep -E \"(GEMINI|PAGE_SPEED|SERPER|OPEN_PAGERANK|GOOGLE_SEARCH)\"'" -ForegroundColor White
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 5: Apps Script Deployment Instructions
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "STEP 5: Apps Script Deployment Instructions" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""
Write-Host "1. Open Apps Script Editor:" -ForegroundColor Cyan
Write-Host "   https://script.google.com/home/projects/1ccoF_sOZRHtmee-M9h-MZ5AZMS44tq2SpZYf5TJvRMErBOIEM489tpY3" -ForegroundColor White
Write-Host ""
Write-Host "2. Create new file: FT_EliteCompetitorFetcher.gs" -ForegroundColor Cyan
Write-Host "   - Click '+' next to Files" -ForegroundColor Gray
Write-Host "   - Name: FT_EliteCompetitorFetcher" -ForegroundColor Gray
Write-Host "   - Copy content from: $appsScriptDir\FT_EliteCompetitorFetcher.gs" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Update file: DB_COMP_EliteOrchestrator.gs" -ForegroundColor Cyan
Write-Host "   - Open existing file" -ForegroundColor Gray
Write-Host "   - Replace fetchAllCompetitorData() function" -ForegroundColor Gray
Write-Host "   - Copy content from: $appsScriptDir\DB_COMP_EliteOrchestrator.gs" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Save all files (Ctrl+S)" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Deploy new version:" -ForegroundColor Cyan
Write-Host "   - Click 'Deploy' → 'New deployment'" -ForegroundColor Gray
Write-Host "   - Type: 'Web app'" -ForegroundColor Gray
Write-Host "   - Description: 'v7 Elite Hybrid Fetcher - Real Competitor Data'" -ForegroundColor Gray
Write-Host "   - Execute as: 'Me'" -ForegroundColor Gray
Write-Host "   - Who has access: 'Anyone'" -ForegroundColor Gray
Write-Host "   - Click 'Deploy'" -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 6: Testing Instructions
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "STEP 6: Testing Instructions" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""
Write-Host "After deployment, run these tests:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Test individual fetcher:" -ForegroundColor White
Write-Host "   - In Apps Script, run: TEST_eliteFetcher()" -ForegroundColor Gray
Write-Host "   - Check logs for '5/5 stages successful'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test full analysis:" -ForegroundColor White
Write-Host "   - Open competitor analysis interface" -ForegroundColor Gray
Write-Host "   - Click 'Analyze 6 Competitors'" -ForegroundColor Gray
Write-Host "   - Check console for detailed logs" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verify results:" -ForegroundColor White
Write-Host "   - Each competitor should have UNIQUE values" -ForegroundColor Gray
Write-Host "   - NOT all 45 authority, 343.7K traffic" -ForegroundColor Gray
Write-Host "   - fetchSuccess: true for all" -ForegroundColor Gray
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 7: Documentation Links
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "STEP 7: Documentation" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Complete guides available:" -ForegroundColor Cyan
Write-Host "  📖 Deployment Guide:  ELITE_HYBRID_FETCHER_DEPLOYMENT.md" -ForegroundColor White
Write-Host "  📖 Testing Guide:     ELITE_HYBRID_TESTING_GUIDE.md" -ForegroundColor White
Write-Host "  📖 Implementation:    ELITE_HYBRID_IMPLEMENTATION_SUMMARY.md" -ForegroundColor White
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# COMPLETION
# ═══════════════════════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ PRE-DEPLOYMENT CHECKS COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "All files ready! Follow the steps above to deploy." -ForegroundColor Green
Write-Host "See documentation for detailed instructions." -ForegroundColor Gray
Write-Host ""

# Open documentation folder
$openDocs = Read-Host "Open documentation folder? (y/n)"
if ($openDocs -eq 'y' -or $openDocs -eq 'Y') {
    Start-Process "explorer.exe" -ArgumentList $baseDir
}

Write-Host ""
Write-Host "Good luck! 🚀" -ForegroundColor Cyan
Write-Host ""
