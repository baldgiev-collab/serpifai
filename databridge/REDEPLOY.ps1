# 🚀 QUICK REDEPLOY SCRIPT
# Run this to push all DataBridge files and redeploy

# Navigate to databridge folder
Set-Location "c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\databridge"

Write-Host "=" -ForegroundColor Cyan
Write-Host "🔄 Pushing all files to Google Apps Script..." -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan

# Push all files
clasp push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Files pushed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Deploying as Web App..." -ForegroundColor Cyan
    
    # Deploy
    clasp deploy --description "Complete DataBridge with Workflows - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Current deployments:" -ForegroundColor Cyan
        clasp deployments
        
        Write-Host ""
        Write-Host "=" -ForegroundColor Green
        Write-Host "✅ REDEPLOY COMPLETE!" -ForegroundColor Green
        Write-Host "=" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Check the deployment URL above" -ForegroundColor White
        Write-Host "2. If URL changed, update ENDPOINTS.DATABRIDGE in ui/Code.gs" -ForegroundColor White
        Write-Host "3. Run QUICK_TEST_UI() in your Google Sheet" -ForegroundColor White
        Write-Host "4. Should now see: ✅ SUCCESS! Stage 1 is working!" -ForegroundColor White
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        Write-Host "Try manually via Apps Script editor:" -ForegroundColor Yellow
        Write-Host "1. Go to https://script.google.com" -ForegroundColor White
        Write-Host "2. Open DataBridge project" -ForegroundColor White
        Write-Host "3. Deploy → Manage deployments → Edit → Deploy" -ForegroundColor White
    }
} else {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "1. Not logged in - Run: clasp login" -ForegroundColor White
    Write-Host "2. Wrong directory - Make sure you're in databridge folder" -ForegroundColor White
    Write-Host "3. No internet connection" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to close..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
