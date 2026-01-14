# 🚨 CRITICAL FIX: Coming Soon Page Blocking API

## 📊 Diagnostic Results

**Problem Identified:**
```
Response Code: 404
Response: <!DOCTYPE html>...<title>Coming Soon</title>
```

**Root Cause:** Your Hostinger site has a "Coming Soon" or maintenance mode page that's blocking ALL requests, including API calls to `/serpifai_php/api_gateway.php`.

---

## ✅ Solution Options (Choose One)

### Option 1: Add .htaccess Exception (RECOMMENDED - 5 minutes)

**This allows API to work while keeping "Coming Soon" page for visitors.**

#### Step 1: Access cPanel File Manager
1. Login to Hostinger
2. Go to **cPanel** → **File Manager**
3. Navigate to `/public_html/`

#### Step 2: Find Existing .htaccess
Look for `.htaccess` file in `/public_html/`
- If it exists, edit it
- If not, create it

#### Step 3: Add API Exception

**Add this at the TOP of .htaccess:**

```apache
# ================================================================
# ALLOW API ACCESS (Even during maintenance mode)
# ================================================================

# Option A: Allow entire serpifai_php folder
<IfModule mod_rewrite.c>
    RewriteEngine On
    # Don't redirect API folder
    RewriteCond %{REQUEST_URI} ^/serpifai_php/ [NC]
    RewriteRule ^ - [L]
</IfModule>

# Option B: Allow specific PHP file
<Files "api_gateway.php">
    Require all granted
    Allow from all
    Satisfy Any
</Files>

# Option C: Allow directory
<Directory "/public_html/serpifai_php">
    Require all granted
    Allow from all
    Satisfy Any
</Directory>
```

**Save the file.**

#### Step 4: Test Immediately

Open browser and go to:
```
https://serpifai.com/serpifai_php/api_gateway.php
```

**Expected result:**
```json
{"success":false,"error":"Invalid request method"}
```

**If you see this JSON error = SUCCESS!** (The API is working, just needs POST request)

**If you still see "Coming Soon" = Try Option 2**

---

### Option 2: Check Hostinger Coming Soon Settings (2 minutes)

#### Step 1: Hostinger Control Panel
1. Login to Hostinger
2. Look for **"Coming Soon"** or **"Maintenance Mode"** settings
3. This might be under:
   - Website → Coming Soon
   - Website → Maintenance Mode
   - Website Settings

#### Step 2: Add Exception
Look for options like:
- "Exclude paths"
- "Whitelist URLs"
- "Bypass for specific folders"

Add: `/serpifai_php/`

#### Step 3: Alternative - Disable Temporarily
If you can't add exceptions:
1. Disable "Coming Soon" mode completely
2. Test if API works
3. Re-enable later with proper exceptions

---

### Option 3: Move API to Subdomain (10 minutes)

**Create a separate subdomain for API that bypasses Coming Soon.**

#### Step 1: Create Subdomain
1. cPanel → **Subdomains**
2. Create: `api.serpifai.com`
3. Document root: `/public_html/serpifai_php/`

#### Step 2: Update Gateway URL

In Apps Script, run:
```javascript
function UPDATE_GatewayToSubdomain() {
  const scriptProps = PropertiesService.getScriptProperties();
  scriptProps.setProperty('PHP_GATEWAY_URL', 'https://api.serpifai.com/api_gateway.php');
  Logger.log('✅ Gateway URL updated to subdomain');
}
```

#### Step 3: Test
```
https://api.serpifai.com/api_gateway.php
```

---

### Option 4: WordPress Plugin Override (If using WordPress)

If "Coming Soon" is from a WordPress plugin:

#### Step 1: Find the Plugin
- Login to WordPress admin
- Plugins → Installed Plugins
- Look for: "Coming Soon", "Maintenance Mode", "Under Construction"

#### Step 2: Configure Exclusions
Most plugins have settings like:
- **Exclude URLs**
- **Bypass for specific paths**
- **Whitelist pages**

Add: `/serpifai_php/*` or `/serpifai_php/api_gateway.php`

#### Step 3: Common Plugins Configuration

**SeedProd:**
1. SeedProd → Settings
2. "Bypass for logged in users" → Check
3. "Bypass URLs" → Add `/serpifai_php/`

**Coming Soon Page & Maintenance Mode:**
1. Settings → Coming Soon
2. "Exclude Pages" → Add custom URL
3. Enter: `/serpifai_php/api_gateway.php`

**WP Maintenance Mode:**
1. Settings → WP Maintenance Mode
2. "Exclude" → Add rule
3. URL: `/serpifai_php/*`

---

## 🧪 Verification Steps

### Test 1: Browser Test (1 minute)

Open in browser:
```
https://serpifai.com/serpifai_php/api_gateway.php
```

**✅ SUCCESS:** See JSON error like:
```json
{"success":false,"error":"Invalid request method"}
```

**❌ FAIL:** Still see "Coming Soon" HTML page

---

### Test 2: cURL Test (Advanced - 2 minutes)

If you have terminal access:

```bash
curl -X GET https://serpifai.com/serpifai_php/api_gateway.php
```

**✅ SUCCESS:** Returns JSON (even if error)
**❌ FAIL:** Returns HTML

---

### Test 3: POST Request Test (3 minutes)

Use cURL or Postman:

```bash
curl -X POST https://serpifai.com/serpifai_php/api_gateway.php \
  -H "Content-Type: application/json" \
  -d '{
    "license": "",
    "action": "verifyLicenseKey",
    "payload": {
      "licenseKey": "SERP-FAI-TEST-KEY-123456"
    }
  }'
```

**✅ SUCCESS:** Returns JSON (even if "license not found")
**❌ FAIL:** Returns HTML or 404

---

### Test 4: Apps Script Re-test (1 minute)

After fixing, run in Apps Script:
```javascript
TEST_ComprehensiveDiagnostics()
```

**Expected:** All tests pass ✅

---

## 📁 File Upload Verification

### Check Files Exist on Server

Via cPanel File Manager, verify:

```
/public_html/
└── serpifai_php/
    ├── api_gateway.php          ✅ Must exist
    ├── database.php             ✅ Must exist
    ├── config.php               ✅ Must exist (if using)
    └── handlers/
        ├── user_handler.php     ✅ Must exist
        ├── gemini_handler.php   (optional)
        └── serper_handler.php   (optional)
```

### Check File Permissions

All PHP files should have **644** permissions:
- Owner: Read + Write (6)
- Group: Read (4)
- Public: Read (4)

**To fix permissions:**
1. Right-click file in File Manager
2. **Change Permissions**
3. Set to: `644`
4. Check: "Owner Read, Write" + "Group Read" + "World Read"

---

## 🔍 Detailed .htaccess Example

**Complete .htaccess for /public_html/**

```apache
# ================================================================
# SERPIFAI API ACCESS
# ================================================================

<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Exclude serpifai_php from coming soon redirects
    RewriteCond %{REQUEST_URI} !^/serpifai_php/ [NC]
    RewriteCond %{REQUEST_URI} !^/serpifai_php/.*\.php$ [NC]
    
    # Your existing coming soon redirects here
    # RewriteRule ^(.*)$ /coming-soon.html [L,R=302]
</IfModule>

# Allow direct access to API files
<FilesMatch "^(api_gateway|database|config)\.php$">
    <IfModule mod_authz_core.c>
        Require all granted
    </IfModule>
    <IfModule !mod_authz_core.c>
        Allow from all
    </IfModule>
</FilesMatch>

# Allow access to entire serpifai_php directory
<Directory "/public_html/serpifai_php">
    Options -Indexes
    <IfModule mod_authz_core.c>
        Require all granted
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Allow from all
    </IfModule>
</Directory>
```

---

## ⚠️ Common Issues After Fix

### Issue 1: Still Getting 404

**Cause:** Files not uploaded or wrong path

**Fix:**
1. Verify exact path: `/public_html/serpifai_php/api_gateway.php`
2. Not: `/public_html/serpifai/serpifai_php/`
3. Not: `/home/username/serpifai_php/`

### Issue 2: .htaccess Not Working

**Cause:** Apache not allowing overrides

**Fix:** Contact Hostinger support to enable `.htaccess` for your domain

### Issue 3: Permission Denied

**Cause:** Wrong file permissions

**Fix:**
```bash
chmod 644 /public_html/serpifai_php/*.php
chmod 755 /public_html/serpifai_php/
```

### Issue 4: PHP Files Download Instead of Execute

**Cause:** PHP not configured for this directory

**Fix:**
Add to `.htaccess` in `/public_html/serpifai_php/`:
```apache
AddHandler application/x-httpd-php .php
```

---

## 🎯 Quick Fix Checklist

Before running diagnostic again:

- [ ] `.htaccess` updated with API exception
- [ ] Browser test shows JSON (not HTML)
- [ ] Files uploaded to `/public_html/serpifai_php/`
- [ ] File permissions set to 644
- [ ] PHP execution enabled
- [ ] Coming Soon plugin configured (if WordPress)

---

## 📞 After Applying Fix

### Run Diagnostic Again

```javascript
TEST_ComprehensiveDiagnostics()
```

### Expected Results After Fix:

```
TEST 2: Direct URL Accessibility Test
✅ URL is accessible (code 200 or 405)
✅ Response is JSON (API is working)

TEST 3: Gateway Connection (POST request)
✅ Gateway is responding with JSON

TEST 4: MySQL Connection Test
✅ MySQL connection successful! (if database configured)
OR
⚠️ License key not found (need to add test user)
```

---

## 🚀 Next Steps After API is Accessible

Once you see JSON responses (even errors), you need to:

1. **Configure Database** - Update `database.php` with MySQL credentials
2. **Create Users Table** - Run SQL to create schema
3. **Add Test User** - Insert test license key
4. **Re-run Diagnostic** - Should pass all tests

---

## 💡 Pro Tips

1. **Keep API Separate:** Always isolate API files from main website
2. **Use Subdomain:** Best practice - `api.serpifai.com`
3. **Monitor Logs:** Check PHP error logs in cPanel regularly
4. **Cache Issues:** Clear Hostinger cache after .htaccess changes
5. **Test First:** Always test in browser before Apps Script

---

## 📊 What Each Fix Does

| Fix | Pros | Cons | Recommended |
|-----|------|------|-------------|
| .htaccess Exception | Simple, fast | Requires Apache | ✅ YES |
| Hostinger Settings | Easy UI | May not exist | ✅ YES |
| Subdomain | Clean separation | Takes longer | ⭐ BEST |
| Plugin Settings | WordPress-specific | Plugin-dependent | ✅ YES (if WP) |

---

**🎯 IMMEDIATE ACTION: Add .htaccess exception or use subdomain, then re-run diagnostic!**
