# QUICK FIX: Upload These 2 Files to Fix "Forbidden" Error
# Total time: 2 minutes

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "FORBIDDEN ERROR - QUICK FIX DEPLOYMENT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 WHAT YOU NEED TO DO:" -ForegroundColor White
Write-Host ""
Write-Host "   Upload these 2 files to your server:" -ForegroundColor Gray
Write-Host ""
Write-Host "   1️⃣  test_forbidden.php" -ForegroundColor Green
Write-Host "       → Upload to: serpifai_php/" -ForegroundColor Gray
Write-Host "       → Test at: https://serpifai.com/serpifai_php/test_forbidden.php" -ForegroundColor Gray
Write-Host ""
Write-Host "   2️⃣  .htaccess.fixed" -ForegroundColor Green
Write-Host "       → Rename current .htaccess to .htaccess.backup" -ForegroundColor Yellow
Write-Host "       → Upload .htaccess.fixed as .htaccess" -ForegroundColor Yellow
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 1: Test if PHP Execution Works" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📤 Upload: v6_saas\serpifai_php\test_forbidden.php" -ForegroundColor White
Write-Host "📍 To: serpifai_php/ folder on server" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Then visit: https://serpifai.com/serpifai_php/test_forbidden.php" -ForegroundColor White
Write-Host ""
Write-Host "✅ Expected Result:" -ForegroundColor Green
Write-Host '   {"success": true, "message": "PHP is executing successfully!"}' -ForegroundColor Gray
Write-Host ""
Write-Host "❌ If you see 'Forbidden':" -ForegroundColor Red
Write-Host "   → Issue is ModSecurity or server firewall" -ForegroundColor Gray
Write-Host "   → Contact hosting support" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 2: Fix .htaccess (If Test Works)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Via cPanel File Manager:" -ForegroundColor White
Write-Host ""
Write-Host "   1. Go to: public_html/serpifai_php/" -ForegroundColor Gray
Write-Host "   2. Find: .htaccess" -ForegroundColor Gray
Write-Host "   3. Right-click → Rename → .htaccess.backup" -ForegroundColor Yellow
Write-Host "   4. Upload: .htaccess.fixed" -ForegroundColor Gray
Write-Host "   5. Rename .htaccess.fixed → .htaccess" -ForegroundColor Yellow
Write-Host ""
Write-Host "Via FTP (FileZilla, etc):" -ForegroundColor White
Write-Host ""
Write-Host "   1. Connect to serpifai.com" -ForegroundColor Gray
Write-Host "   2. Navigate to: /serpifai_php/" -ForegroundColor Gray
Write-Host "   3. Download current .htaccess as backup" -ForegroundColor Gray
Write-Host "   4. Upload: .htaccess.fixed" -ForegroundColor Gray
Write-Host "   5. Rename .htaccess.fixed → .htaccess" -ForegroundColor Yellow
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 3: Test API Gateway" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open Apps Script and run competitor analysis:" -ForegroundColor White
Write-Host ""
Write-Host "   1. Click 'Analyze Competitors'" -ForegroundColor Gray
Write-Host "   2. Open browser console (F12)" -ForegroundColor Gray
Write-Host "   3. Look for response" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Success:" -ForegroundColor Green
Write-Host '   📥 Gateway response: {"success": true, "competitors": [...]}' -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Still issues? Check console for new error messages." -ForegroundColor Yellow
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "FILES READY TO UPLOAD:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$testFile = "c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\test_forbidden.php"
$htaccessFile = "c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\.htaccess.fixed"

if (Test-Path $testFile) {
    Write-Host "   ✅ test_forbidden.php" -ForegroundColor Green
    Write-Host "      Location: $testFile" -ForegroundColor Gray
    Write-Host "      Size: $((Get-Item $testFile).Length) bytes" -ForegroundColor Gray
} else {
    Write-Host "   ❌ test_forbidden.php NOT FOUND" -ForegroundColor Red
}

Write-Host ""

if (Test-Path $htaccessFile) {
    Write-Host "   ✅ .htaccess.fixed" -ForegroundColor Green
    Write-Host "      Location: $htaccessFile" -ForegroundColor Gray
    Write-Host "      Size: $((Get-Item $htaccessFile).Length) bytes" -ForegroundColor Gray
} else {
    Write-Host "   ❌ .htaccess.fixed NOT FOUND" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Full instructions: FORBIDDEN_ERROR_FIX.md" -ForegroundColor White
Write-Host ""
Write-Host "Ready to upload? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "Great! Open your FTP client or cPanel and upload the files." -ForegroundColor Green
    Write-Host ""
    Write-Host "After uploading, test here:" -ForegroundColor White
    Write-Host "   https://serpifai.com/serpifai_php/test_forbidden.php" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "No problem! Files are ready when you are." -ForegroundColor Gray
    Write-Host ""
}
