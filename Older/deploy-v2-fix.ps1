# Quick Push to Apps Script
# Run from: C:\Users\baldg\OneDrive\Documents\GitHub\serpifai

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DEPLOYING FETCHER FIX V2 TO APPS SCRIPT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📁 Navigating to apps_script directory..." -ForegroundColor Yellow
Set-Location "v6_saas\apps_script"

Write-Host "📤 Pushing files with clasp..." -ForegroundColor Yellow
clasp push --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ FILES DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Open Apps Script Editor:" -ForegroundColor White
    Write-Host "   https://script.google.com" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Select function: DIAG_testFullCompetitorWorkflow" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Click Run (▶️)" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Expected results (~40-50s):" -ForegroundColor White
    Write-Host "   ✅ toptal.com: Success (3-5s)" -ForegroundColor Green
    Write-Host "   ✅ globant.com: Success (8-10s, HTML truncated)" -ForegroundColor Green
    Write-Host "   ✅ turing.com: Success (8-10s, HTML truncated)" -ForegroundColor Green
    Write-Host ""
    Write-Host "5. Look for in logs:" -ForegroundColor White
    Write-Host "   '⚠️  HTML truncated: 800000 → 100000 bytes'" -ForegroundColor Yellow
    Write-Host "   '✅ Success'" -ForegroundColor Green
    Write-Host "   'Has metadata: true'" -ForegroundColor Green
    Write-Host "   'Title: [actual website title]'" -ForegroundColor Green
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ DEPLOYMENT FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "1. Not logged in to clasp - run: clasp login" -ForegroundColor White
    Write-Host "2. Wrong directory - ensure .clasp.json exists" -ForegroundColor White
    Write-Host "3. Permission issues - check Google account access" -ForegroundColor White
    Write-Host ""
}

# Return to root
Set-Location ..\..
