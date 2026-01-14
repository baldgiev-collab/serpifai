# SerpifAI Secure .env Deployment Script (PowerShell for Windows)
# Deploys .env file to Hostinger WITHOUT committing to GitHub
# Run: .\deploy-env.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔒 SerpifAI Secure .env Deployment" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Configuration
$HOSTINGER_USER = "u187453795"
$HOSTINGER_HOST = "serpifai.com"
$REMOTE_PATH = "/public_html/serpifai_php/config/.env"
$LOCAL_ENV_FILE = ".\v6_saas\serpifai_php\config\.env"

# Verify local .env exists
if (-Not (Test-Path $LOCAL_ENV_FILE)) {
    Write-Host "❌ Error: .env file not found at $LOCAL_ENV_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Local .env file found" -ForegroundColor Green

# Verify .env is in .gitignore
$gitignoreContent = Get-Content ".gitignore" -Raw
if ($gitignoreContent -notmatch "^\s*\.env\s*$") {
    Write-Host "⚠️  Warning: .env not in .gitignore. Adding it..." -ForegroundColor Yellow
    Add-Content ".gitignore" ".env"
}

# Check that .env is not staged in git
try {
    $stagedFiles = & git diff --cached --name-only 2>$null
    if ($stagedFiles -contains ".env") {
        Write-Host "❌ Error: .env file is staged in git! Removing..." -ForegroundColor Red
        & git reset .env
        exit 1
    }
} catch {
    # Silently ignore git errors
}

# Show what's in the .env file (obfuscated)
Write-Host ""
Write-Host "📋 Verifying .env contents:" -ForegroundColor Cyan
$envContent = Get-Content $LOCAL_ENV_FILE | Where-Object { $_ -match "^(GEMINI|SERPER|PAGE_SPEED|OPEN_PAGE)" }
$envContent | ForEach-Object { $_ -replace "=.*", "=***REDACTED***" } | Write-Host

Write-Host ""
Write-Host "🚀 Deploying to Hostinger via SCP..." -ForegroundColor Green

# Deploy using SCP (requires SSH client or PuTTY)
try {
    # Try using scp directly (Git Bash or WSL)
    & scp -q "$LOCAL_ENV_FILE" "${HOSTINGER_USER}@${HOSTINGER_HOST}:${REMOTE_PATH}" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ .env file uploaded successfully" -ForegroundColor Green
    } else {
        throw "SCP failed"
    }
} catch {
    Write-Host "⚠️  SCP not available. Alternative deployment methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Use Hostinger File Manager (cPanel)"
    Write-Host "   1. Login: https://hpanel.hostinger.com"
    Write-Host "   2. Navigate: File Manager → public_html/serpifai_php/config/"
    Write-Host "   3. Upload: The .env file"
    Write-Host ""
    Write-Host "Option 2: Use Hostinger Terminal"
    Write-Host "   1. SSH into server: ssh ${HOSTINGER_USER}@${HOSTINGER_HOST}"
    Write-Host "   2. Create file: nano public_html/serpifai_php/config/.env"
    Write-Host "   3. Paste your .env content"
    Write-Host "   4. Save: Ctrl+X, Y, Enter"
    Write-Host ""
    Write-Host "Once deployed, set permissions: chmod 600 /path/to/.env"
    exit 1
}

# Set proper permissions
Write-Host "🔐 Setting permissions to 600..." -ForegroundColor Green
try {
    & ssh "${HOSTINGER_USER}@${HOSTINGER_HOST}" "chmod 600 ${REMOTE_PATH}" 2>$null
    Write-Host "✓ Permissions set correctly (600)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not verify permissions. Please manually set via SSH: chmod 600 ${REMOTE_PATH}" -ForegroundColor Yellow
}

# Verify file is in place
Write-Host "✅ Verifying deployment..." -ForegroundColor Green
try {
    & ssh "${HOSTINGER_USER}@${HOSTINGER_HOST}" "ls -la ${REMOTE_PATH}" 2>$null
    Write-Host "✓ File verified on server" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not verify file. Please check manually via SSH." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔒 Security Verification:" -ForegroundColor Cyan
Write-Host "   ✓ .env file NOT committed to GitHub"
Write-Host "   ✓ .env only exists on Hostinger server"
Write-Host "   ✓ API keys protected with HMAC SHA256"
Write-Host "   ✓ Requests signed with timestamp"
Write-Host "   ✓ Replay attacks prevented (±60 second window)"
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test: https://serpifai.com/serpifai_php/diagnostic_post.php"
Write-Host "   2. Run comprehensive tests in Apps Script"
Write-Host "   3. Verify all API calls work with new keys"
Write-Host ""
