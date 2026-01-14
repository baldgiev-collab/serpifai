# 🔒 TOP-TIER API KEY SECURITY GUIDE

## How We Knew API Key Was Banned

**Google's error message told us:**
```
"Your API key was reported as leaked. Please use another API key."
```

Google automatically scans:
- Public GitHub repositories
- Commit history (even deleted commits)
- Public paste sites (Pastebin, Gist, etc.)
- Web crawlers indexing exposed files

When they detect an API key, they **immediately disable it** and notify you.

## Why Keys Get Leaked

1. **Committed to Git** - Most common cause
   - `.env` files accidentally committed
   - Keys hardcoded in source code
   - Old commits with keys (even if later removed)

2. **Public Repositories** - Your repo is public on GitHub
   - Anyone can see commit history
   - Automated bots scan for API keys 24/7

3. **Documentation** - Keys in README or guide files

4. **Error Logs** - Keys appear in error messages/logs

## ✅ TOP-TIER SaaS API KEY PROTECTION

### 1. Environment Variables (.env) - ✅ YOU'RE DOING THIS

**Local .env** (already updated):
```env
GEMINI_API_KEY=AIzaSyC5B-Hp4WhMSDeMJ-s7TzyYoKkP6Roej3A
```

**Server .env** (update on Hostinger):
- Location: `public_html/serpifai_php/config/.env`
- Permissions: **644** (rw-r--r--) - readable by PHP, not publicly accessible
- **NEVER commit this file to Git**

### 2. .gitignore - ✅ CRITICAL

Your `.gitignore` should have:
```
# Environment variables
.env
.env.*
*.env

# Never commit secrets
*_key*
*_secret*
*api_key*
```

### 3. Google Cloud API Key Restrictions - 🚨 DO THIS NOW

**Go to**: https://console.cloud.google.com/apis/credentials

**Click on your new API key** → Edit:

**A. Application Restrictions:**
- Select: **"HTTP referrers (web sites)"**
- Add allowed domains:
  ```
  serpifai.com/*
  *.serpifai.com/*
  https://serpifai.com/*
  https://*.serpifai.com/*
  ```
- This prevents key use from other domains

**B. API Restrictions:**
- Select: **"Restrict key"**
- Choose ONLY: **"Generative Language API"**
- This prevents key from calling other Google APIs

**C. Quota & Rate Limits:**
- Set daily quotas to prevent abuse
- Monitor usage in Cloud Console

### 4. Additional Server-Side Protection

**A. File Permissions** (on Hostinger):
```bash
chmod 644 .env           # Read-only for others
chmod 755 config/        # Directory accessible
chmod 600 .env           # Even more restrictive (owner only)
```

**B. .htaccess Protection** (in `config/` folder):
Create `config/.htaccess`:
```apache
# Deny access to .env files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

# Deny access to all files starting with .
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```

**C. PHP Protection** (already implemented in `db_config.php`):
- Loads from `$_ENV` (not hardcoded)
- Never logs actual key values
- Never returns keys in API responses

### 5. Key Rotation Strategy

**For Production SaaS:**
- Rotate API keys every 90 days
- Use separate keys for dev/staging/production
- Monitor key usage in Google Cloud Console
- Set up alerts for unusual activity

**Different keys per environment:**
```env
# Development
GEMINI_API_KEY=dev_key_here

# Production
GEMINI_API_KEY=prod_key_here
```

### 6. Secret Management (Enterprise Level)

**For scaling beyond this:**
- **Google Secret Manager** - Store keys in Google Cloud
- **HashiCorp Vault** - Enterprise secret management
- **AWS Secrets Manager** - If using AWS
- **Azure Key Vault** - If using Azure

### 7. Monitoring & Alerts

**Set up in Google Cloud Console:**
- API usage alerts (spike detection)
- Quota alerts (approaching limits)
- Error rate monitoring
- Geographic anomaly detection

### 8. Code-Level Protection

**Never do this:**
```php
❌ define('GEMINI_API_KEY', 'AIzaSy...');  // Hardcoded
❌ $key = "AIzaSy...";                      // In code
❌ error_log("Key: " . $apiKey);            // Logged
```

**Always do this:**
```php
✅ define('GEMINI_API_KEY', $_ENV['GEMINI_API_KEY']);
✅ error_log('Key length: ' . strlen($apiKey));  // Log length, not value
✅ Never return keys in API responses
```

### 9. Git Security Best Practices

**Check commit history for leaked keys:**
```bash
git log -S "AIzaSy" --all
```

**Remove keys from Git history** (if found):
```bash
# Use BFG Repo Cleaner or git filter-branch
bfg --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**After cleaning:**
```bash
git push origin --force --all
```

### 10. Public Repository Considerations

**Your repo is PUBLIC** - Extra precautions:

1. **Never commit** `.env` files (already in `.gitignore`)
2. **Use example files** with placeholders:
   - `.env.example` (safe to commit):
     ```env
     GEMINI_API_KEY=your_key_here
     DB_PASS=your_password_here
     ```
3. **Sanitize all commits** before pushing
4. **Review PRs** carefully for exposed secrets
5. **Use GitHub Secret Scanning** (free for public repos)

## ✅ IMMEDIATE ACTIONS FOR YOU

### Step 1: Update Server .env (NOW)
1. Hostinger cPanel → File Manager
2. Navigate to `public_html/serpifai_php/config/.env`
3. Click **Edit**
4. Change line 6:
   ```env
   GEMINI_API_KEY=AIzaSyC5B-Hp4WhMSDeMJ-s7TzyYoKkP6Roej3A
   ```
5. **Save**

### Step 2: Secure API Key in Google Cloud (NOW)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on new API key
3. Add **HTTP referrer restrictions**: `serpifai.com/*`
4. Add **API restrictions**: Only "Generative Language API"
5. **Save**

### Step 3: Add .htaccess Protection (OPTIONAL)
Create `public_html/serpifai_php/config/.htaccess`:
```apache
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

### Step 4: Test Everything
Run `TEST_PHPBackend` in Apps Script

**Expected:**
```
✅ Response code: 200
✅ Gemini response: "Hello!..."
```

## 🎯 SECURITY CHECKLIST

- ✅ API key in `.env` file (not hardcoded)
- ✅ `.env` in `.gitignore`
- ✅ Local `.env` updated with new key
- ⏳ **Server `.env` updated** ← DO THIS NOW
- ⏳ **Google Cloud restrictions added** ← DO THIS NOW
- ⏳ `.htaccess` protection (optional but recommended)
- ✅ Never log actual key values
- ✅ Never return keys in API responses
- ✅ File permissions set to 644

## WHY THIS MATTERS

**Without protection:**
- Bots scrape keys in < 24 hours
- Unauthorized API usage drains quotas
- Costs skyrocket from abuse
- Google disables keys automatically
- Service downtime for customers

**With protection:**
- Keys only work from your domain
- Keys only call allowed APIs
- Usage monitored and capped
- Abuse prevented before it happens
- 99.9% uptime maintained

---

**Time to secure:** 5 minutes now saves hours of headaches later! 🔒
