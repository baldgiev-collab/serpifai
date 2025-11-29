#!/bin/bash

# SerpifAI Secure .env Deployment Script
# Deploys .env file to Hostinger WITHOUT committing to GitHub
# Run this script locally, never commit .env file!

set -e

echo "🔒 SerpifAI Secure .env Deployment"
echo "===================================="

# Configuration
HOSTINGER_USER="u187453795"
HOSTINGER_HOST="serpifai.com"
REMOTE_PATH="/public_html/serpifai_php/config/.env"
LOCAL_ENV_FILE="./v6_saas/serpifai_php/config/.env"

# Verify local .env exists
if [ ! -f "$LOCAL_ENV_FILE" ]; then
    echo "❌ Error: .env file not found at $LOCAL_ENV_FILE"
    exit 1
fi

echo "✓ Local .env file found"

# Verify .env is in .gitignore
if ! grep -q "^\.env$" .gitignore; then
    echo "⚠️  Warning: .env not in .gitignore. Adding it..."
    echo ".env" >> .gitignore
fi

# Check that .env is not staged in git
if git diff --cached --name-only | grep -q ".env"; then
    echo "❌ Error: .env file is staged in git! Removing..."
    git reset .env
    exit 1
fi

# Show what's in the .env file (obfuscated)
echo ""
echo "📋 Verifying .env contents:"
grep -E "^(GEMINI|SERPER|PAGE_SPEED|OPEN_PAGE)" "$LOCAL_ENV_FILE" | sed 's/=.*/=***REDACTED***/g'
echo ""

# Deploy to Hostinger via SCP
echo "🚀 Deploying to Hostinger..."
scp "$LOCAL_ENV_FILE" "${HOSTINGER_USER}@${HOSTINGER_HOST}:${REMOTE_PATH}"

if [ $? -eq 0 ]; then
    echo "✓ .env file uploaded successfully"
else
    echo "❌ Failed to upload .env file"
    exit 1
fi

# Set proper permissions (600 = read/write owner only)
echo "🔐 Setting permissions to 600..."
ssh "${HOSTINGER_USER}@${HOSTINGER_HOST}" "chmod 600 ${REMOTE_PATH}"

if [ $? -eq 0 ]; then
    echo "✓ Permissions set correctly (600)"
else
    echo "❌ Failed to set permissions"
    exit 1
fi

# Verify file is in place
echo "✅ Verifying deployment..."
ssh "${HOSTINGER_USER}@${HOSTINGER_HOST}" "ls -la ${REMOTE_PATH} | grep '.env'"

if [ $? -eq 0 ]; then
    echo "✓ File verified on server"
else
    echo "❌ File verification failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "🔒 Security Notes:"
echo "   • .env never committed to GitHub"
echo "   • .env only exists on Hostinger server"
echo "   • API keys secured with HMAC SHA256"
echo "   • Timestamp validation prevents replay attacks"
echo ""
echo "📝 Next steps:"
echo "   1. Test diagnostics: https://serpifai.com/serpifai_php/diagnostic_post.php"
echo "   2. Run comprehensive tests in Apps Script"
echo "   3. Verify all API calls work with new security layer"
