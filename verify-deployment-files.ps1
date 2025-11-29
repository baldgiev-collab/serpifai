# ═══════════════════════════════════════════════════════════════════════════
# VERIFY ALL FILES READY FOR DEPLOYMENT
# ═══════════════════════════════════════════════════════════════════════════
# Run this script to verify all 70 files exist before deployment
# ═══════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SERPIFAI v6 DEPLOYMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$baseDir = "v6_saas\apps_script"
$missing = @()
$present = @()

# Define all required files
$requiredFiles = @{
    "Core Files (3)" = @(
        "UI_Core.gs",
        "UI_Handler.gs",
        "MAIN_Router.gs"
    )
    "Configuration Files (2)" = @(
        "DB_Config.gs",
        "FT_Config.gs"
    )
    "Helper Files (2)" = @(
        "DB_HELPERS_Helpers.gs",
        "FT_Compliance.gs"
    )
    "Fetcher Core (3)" = @(
        "FT_FetchSingle.gs",
        "FT_FetchMulti.gs",
        "FT_ForensicExtractors.gs"
    )
    "Fetcher Extractors (4)" = @(
        "FT_ExtractMetadata.gs",
        "FT_ExtractSchema.gs",
        "FT_ExtractLinks.gs",
        "FT_ExtractImages.gs"
    )
    "Fetcher Orchestration (1)" = @(
        "FT_FullSnapshot.gs"
    )
    "DataBridge Core (5)" = @(
        "DB_CacheManager.gs",
        "DB_Deployment.gs",
        "DB_CE_ContentEngine.gs",
        "DB_BULK_BulkEngine.gs",
        "DB_BL_Backlinks.gs"
    )
    "DataBridge AI (4)" = @(
        "DB_AI_GeminiClient.gs",
        "DB_AI_PromptBuilder.gs",
        "DB_AI_ReasoningTools.gs",
        "DB_AI_InputSuggestions.gs"
    )
    "DataBridge APIs (5)" = @(
        "DB_APIS_FetcherClient.gs",
        "DB_APIS_SerperAPI.gs",
        "DB_APIS_PageSpeedAPI.gs",
        "DB_APIS_SearchConsoleAPI.gs",
        "DB_APIS_OpenPageRankAPI.gs"
    )
    "DataBridge Competitor (2)" = @(
        "DB_COMP_Main.gs",
        "DB_COMP_Categories.gs"
    )
    "Routers (2)" = @(
        "DB_Router.gs",
        "FT_Router.gs"
    )
    "UI HTML Core (4)" = @(
        "UI_Dashboard.html",
        "UI_Data_Mapper.html",
        "UI_Scripts_App.html",
        "UI_Scripts_API.html"
    )
    "UI HTML Components (11)" = @(
        "UI_Components_Header.html",
        "UI_Components_Sidebar.html",
        "UI_Components_Modal.html",
        "UI_Components_Toast.html",
        "UI_Components_Competitors.html",
        "UI_Components_Overview.html",
        "UI_Components_ProjectManager.html",
        "UI_Components_QA.html",
        "UI_Components_Results.html",
        "UI_Components_Scoring.html",
        "UI_Components_Workflow.html"
    )
    "UI HTML Charts (3)" = @(
        "UI_Charts_Competitor.html",
        "UI_Charts_Diagnostic.html",
        "UI_Charts_Overview.html"
    )
    "UI HTML Styles (3)" = @(
        "UI_Styles_Theme.html",
        "UI_Styles_Global.html",
        "UI_Styles_DataBadges.html"
    )
    "UI HTML Other (3)" = @(
        "UI_Scripts_Utils.html",
        "UI_Scripts_Charts.html",
        "UI_Metrics_Engine.html"
    )
}

Write-Host "📂 Checking files in: $baseDir`n" -ForegroundColor Yellow

$totalFiles = 0
$foundFiles = 0

foreach ($category in $requiredFiles.Keys | Sort-Object) {
    $files = $requiredFiles[$category]
    $totalFiles += $files.Count
    
    Write-Host "📁 $category" -ForegroundColor Cyan
    
    foreach ($file in $files) {
        $filePath = Join-Path $baseDir $file
        
        if (Test-Path $filePath) {
            $fileInfo = Get-Item $filePath
            $size = [math]::Round($fileInfo.Length / 1KB, 2)
            Write-Host "  ✅ $file" -ForegroundColor Green -NoNewline
            Write-Host " ($size KB)" -ForegroundColor Gray
            $present += $file
            $foundFiles++
        } else {
            Write-Host "  ❌ MISSING: $file" -ForegroundColor Red
            $missing += $file
        }
    }
    Write-Host ""
}

# Summary
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Total Files Required: $totalFiles" -ForegroundColor White
Write-Host "Files Found: " -NoNewline -ForegroundColor White
Write-Host "$foundFiles" -ForegroundColor Green
Write-Host "Files Missing: " -NoNewline -ForegroundColor White
Write-Host "$($missing.Count)" -ForegroundColor $(if ($missing.Count -eq 0) { "Green" } else { "Red" })

$percentage = [math]::Round(($foundFiles / $totalFiles) * 100, 1)
Write-Host "Completion: $percentage%" -ForegroundColor $(if ($percentage -eq 100) { "Green" } else { "Yellow" })

if ($missing.Count -eq 0) {
    Write-Host "`n✅ ALL FILES PRESENT - READY FOR DEPLOYMENT!" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Read: DEPLOY_ALL_FILES_TO_APPS_SCRIPT.md" -ForegroundColor White
    Write-Host "   2. Open: https://script.google.com/home/projects/1ccoF_sOZRHtmee-M9h-MZ5AZMS44tq2SpZYf5TJvRMErBOIEM489tpY3/edit" -ForegroundColor White
    Write-Host "   3. Copy files in order (Core → Config → Helpers → Modules → Routers)" -ForegroundColor White
    Write-Host "   4. Set Script Properties (GEMINI_API_KEY)" -ForegroundColor White
    Write-Host "   5. Deploy as Web App" -ForegroundColor White
    Write-Host "   6. Test in Google Sheets" -ForegroundColor White
} else {
    Write-Host "`n⚠️  MISSING FILES - CANNOT DEPLOY YET" -ForegroundColor Yellow -BackgroundColor DarkYellow
    Write-Host "`nMissing Files:" -ForegroundColor Red
    foreach ($file in $missing) {
        Write-Host "  • $file" -ForegroundColor Red
    }
    Write-Host "`n💡 Create missing files before deploying." -ForegroundColor Yellow
}

Write-Host "`n═══════════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Check documentation files
Write-Host "📚 Documentation Files:" -ForegroundColor Cyan
$docFiles = @(
    "GOOGLE_TOS_COMPLIANCE_ANALYSIS.md",
    "COMPLETE_ARCHITECTURE_INTEGRATION.md",
    "DEPLOY_ALL_FILES_TO_APPS_SCRIPT.md",
    "FETCHER_ELITE_COMPLETE.md",
    "COMPLETE_SYSTEM_SUMMARY.md"
)

foreach ($doc in $docFiles) {
    if (Test-Path $doc) {
        Write-Host "  ✅ $doc" -ForegroundColor Green
    } else {
        Write-Host "  ❌ MISSING: $doc" -ForegroundColor Red
    }
}

Write-Host "`n═══════════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Size analysis
Write-Host "📊 Size Analysis:" -ForegroundColor Cyan
$totalSize = 0
Get-ChildItem -Path $baseDir -File | ForEach-Object {
    $totalSize += $_.Length
}
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host "  Total Size: $totalSizeMB MB" -ForegroundColor White

# Count by extension
$gsFiles = (Get-ChildItem -Path $baseDir -Filter "*.gs" -File).Count
$htmlFiles = (Get-ChildItem -Path $baseDir -Filter "*.html" -File).Count
Write-Host "  .gs Files: $gsFiles" -ForegroundColor White
Write-Host "  .html Files: $htmlFiles" -ForegroundColor White

Write-Host ""
Write-Host "Target Project ID: 1ccoF_sOZRHtmee-M9h-MZ5AZMS44tq2SpZYf5TJvRMErBOIEM489tpY3" -ForegroundColor Cyan
Write-Host ""

# Exit code
if ($missing.Count -eq 0) {
    exit 0
} else {
    exit 1
}
