# FORBIDDEN ERROR FIX GUIDE

## Problem
Server returns "Forbidden" (HTTP 403) instead of JSON response.

**Error Message:**
```
GatewayError: Invalid JSON response from gateway (length: 10): Forbidden
```

## Root Cause
Your `.htaccess` file has security rules blocking legitimate API requests from Google Apps Script.

## The Blocking Rules

**File:** `serpifai_php/.htaccess` (Lines 15-21)

```apache
# Protect against SQL injection
RewriteCond %{QUERY_STRING} (\<|%3C).*script.*(\>|%3E) [NC,OR]
RewriteCond %{QUERY_STRING} GLOBALS(=|\[|\%[0-9A-Z]{0,2}) [OR]
RewriteCond %{QUERY_STRING} _REQUEST(=|\[|\%[0-9A-Z]{0,2})
RewriteRule ^(.*)$ - [F,L]
```

**Problem:** These rules check the QUERY_STRING (URL parameters) for dangerous patterns, but your API uses POST with JSON body. However, the rules are too aggressive and might be blocking based on other request characteristics.

## Solution Options

### Option 1: Test Without .htaccess (FASTEST - DO THIS FIRST)

**Step 1:** Upload the diagnostic test file I just created:

**File:** `test_forbidden.php`
**Upload to:** `https://serpifai.com/serpifai_php/test_forbidden.php`

**Step 2:** Test in browser:
```
https://serpifai.com/serpifai_php/test_forbidden.php
```

**Expected Result:**
```json
{
  "success": true,
  "message": "PHP is executing successfully!",
  "timestamp": "2025-12-17 15:50:11",
  "server": {
    "php_version": "8.2.x",
    "request_method": "GET",
    ...
  }
}
```

**If you still get "Forbidden"**, the issue is at the server/firewall level, not your code.

### Option 2: Temporarily Rename .htaccess

**Via cPanel File Manager:**
1. Go to: `public_html/serpifai_php/`
2. Find: `.htaccess`
3. Right-click → Rename → `.htaccess.backup`
4. Test: `https://serpifai.com/serpifai_php/api_gateway.php`

**Via FTP:**
```bash
# Connect to your server
mv /path/to/serpifai_php/.htaccess /path/to/serpifai_php/.htaccess.backup
```

**Via SSH:**
```bash
cd /home/YOUR_USERNAME/public_html/serpifai_php/
mv .htaccess .htaccess.backup
```

**Test API Gateway:**
```bash
curl -X POST https://serpifai.com/serpifai_php/api_gateway.php \
  -H "Content-Type: application/json" \
  -d '{"license":"test","action":"check_status","payload":{}}'
```

**Expected:** JSON response (even if error about license)

### Option 3: Fix .htaccess Rules (RECOMMENDED)

Replace the aggressive security rules with safer ones:

**OLD (Lines 15-21):**
```apache
# Protect against SQL injection
RewriteCond %{QUERY_STRING} (\<|%3C).*script.*(\>|%3E) [NC,OR]
RewriteCond %{QUERY_STRING} GLOBALS(=|\[|\%[0-9A-Z]{0,2}) [OR]
RewriteCond %{QUERY_STRING} _REQUEST(=|\[|\%[0-9A-Z]{0,2})
RewriteRule ^(.*)$ - [F,L]
```

**NEW (Safer - only blocks actual dangerous patterns):**
```apache
# Protect against SQL injection (QUERY_STRING only, not POST body)
RewriteCond %{QUERY_STRING} (union.*select|select.*from|insert.*into|delete.*from|drop.*table) [NC]
RewriteRule ^(.*)$ - [F,L]
```

### Option 4: Whitelist API Gateway

Add this **BEFORE** the security rules (around line 10):

```apache
# Allow API Gateway to bypass security checks
RewriteCond %{REQUEST_URI} ^/serpifai_php/api_gateway\.php$ [NC]
RewriteRule ^ - [L]
```

This tells Apache: "If the request is for `api_gateway.php`, skip all remaining rules."

## Full Fixed .htaccess

<details>
<summary>Click to see complete fixed .htaccess file</summary>

```apache
# SerpifAI v6 - Apache Configuration
# Security & Performance Optimizations

# Enable Rewrite Engine
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /serpifai_php/
    
    # Allow API Gateway to bypass security checks
    RewriteCond %{REQUEST_URI} ^/serpifai_php/api_gateway\.php$ [NC]
    RewriteRule ^ - [L]
    
    # Allow test files
    RewriteCond %{REQUEST_URI} ^/serpifai_php/test_.*\.php$ [NC]
    RewriteRule ^ - [L]
    
    # Block direct access to config folder
    RewriteRule ^config/.*$ - [F,L]
    
    # Block direct access to database folder
    RewriteRule ^database/.*$ - [F,L]
    
    # Protect against SQL injection (safer rules)
    RewriteCond %{QUERY_STRING} (union.*select|select.*from|insert.*into|delete.*from|drop.*table) [NC]
    RewriteRule ^(.*)$ - [F,L]
    
    # Handle preflight OPTIONS requests
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>

# Protect sensitive files
<FilesMatch "\.(sql|log|md|json|env|ini|bak)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Protect config directory
<DirectoryMatch "^.*/config.*">
    Order Allow,Deny
    Deny from all
</DirectoryMatch>

# Protect database directory
<DirectoryMatch "^.*/database.*">
    Order Allow,Deny
    Deny from all
</DirectoryMatch>

# Enable CORS for API gateway
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "POST, GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Compression for performance
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/json application/javascript
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType application/json "access plus 0 seconds"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Prevent directory listing
Options -Indexes

# PHP settings
<IfModule mod_php7.c>
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 60
    php_value max_input_time 60
    php_flag display_errors Off
    php_flag log_errors On
</IfModule>
```

</details>

## Deployment Steps

### Quick Test (5 minutes)

1. **Upload test file:**
   - Upload `test_forbidden.php` to `serpifai_php/` folder
   - Visit: `https://serpifai.com/serpifai_php/test_forbidden.php`
   - Should show JSON with "success": true

2. **If test file works but API doesn't:**
   - The issue is specifically with `.htaccess` rules
   - Proceed to Option 3 or 4 above

3. **If test file also shows "Forbidden":**
   - Issue is ModSecurity or server firewall
   - Contact hosting support to whitelist your domain
   - Ask them to check ModSecurity logs

### Permanent Fix (10 minutes)

1. **Backup current .htaccess:**
   ```bash
   cp .htaccess .htaccess.original
   ```

2. **Replace with fixed version** (see above)

3. **Test API:**
   ```bash
   curl -X POST https://serpifai.com/serpifai_php/api_gateway.php \
     -H "Content-Type: application/json" \
     -d '{"license":"test","action":"check_status","payload":{}}'
   ```

4. **If working, test from Apps Script:**
   - Open your app
   - Click "Analyze Competitors"
   - Check browser console for success

## Verification

**Success Indicators:**
- ✅ `test_forbidden.php` returns JSON
- ✅ API Gateway returns JSON (even if "invalid license" error)
- ✅ Browser console shows proper error messages (not "Forbidden")
- ✅ Competitor analysis completes successfully

**Still Broken:**
- ❌ Test file returns "Forbidden" → Server/firewall issue
- ❌ API returns empty response → PHP errors (check error logs)
- ❌ API returns "Invalid license" → License key issue (separate from this)

## ModSecurity Check (If Needed)

If renaming `.htaccess` still shows "Forbidden", check ModSecurity:

**Via SSH:**
```bash
# Check if ModSecurity is enabled
apachectl -M | grep security

# Check recent blocks (if you have access)
tail -100 /var/log/modsec_audit.log | grep Forbidden
```

**Via cPanel:**
1. Go to: Security → ModSecurity
2. Check if enabled
3. Look for recent blocks matching `api_gateway.php`
4. Add rule to whitelist:
   ```apache
   SecRule REQUEST_URI "@streq /serpifai_php/api_gateway.php" \
       "id:1000,phase:1,pass,nolog,ctl:ruleEngine=Off"
   ```

**Via Hosting Support:**
Email your hosting provider:
```
Subject: Please whitelist api_gateway.php from ModSecurity

Hi,

I'm getting "Forbidden" errors on this URL:
https://serpifai.com/serpifai_php/api_gateway.php

This is a legitimate API endpoint receiving POST requests with JSON.

Can you please:
1. Check ModSecurity logs for blocks on this URL
2. Whitelist this file from ModSecurity rules
3. Confirm the file permissions are correct (644)

Thank you!
```

## Expected Result After Fix

**Before:**
```
❌ Gateway response: "Forbidden"
❌ Length: 10 characters (plain text)
```

**After:**
```json
✅ Gateway response: {
  "success": false,
  "error": "Invalid license key"
}
✅ Length: 50+ characters (valid JSON)
```

Even if the license is invalid, you should get **JSON**, not "Forbidden".

## Next Steps

1. **First:** Upload `test_forbidden.php` and test it
2. **If test works:** Fix `.htaccess` (Option 3 or 4)
3. **If test fails:** Contact hosting support about ModSecurity
4. **After fixed:** Retry competitor analysis

## Files to Upload

1. `test_forbidden.php` → `serpifai_php/` folder
2. Updated `.htaccess` → Replace existing one

Let me know which option you choose and I can guide you through it!
