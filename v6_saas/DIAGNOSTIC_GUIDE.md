# 🔍 Diagnostic & Fix Guide

## ⚡ Quick Start - Run Diagnostics Now

### Step 1: Open Apps Script Editor
1. Open your Google Sheet
2. **Extensions** → **Apps Script**

### Step 2: Run Comprehensive Diagnostic
1. In the function dropdown (top), select: **`TEST_ComprehensiveDiagnostics`**
2. Click **Run** ▶️
3. Grant permissions if asked
4. Wait for completion (30-60 seconds)

### Step 3: View Results
1. Click **View** → **Logs** (or Ctrl+Enter)
2. Read the detailed diagnostic report

---

## 📊 What the Diagnostic Tests

The `TEST_ComprehensiveDiagnostics()` function performs 5 comprehensive tests:

### Test 1: Script Properties Configuration ⚙️
- **Checks:** Is `PHP_GATEWAY_URL` configured?
- **Auto-fix:** Yes - automatically configures if missing
- **Pass:** Gateway URL is set to `https://serpifai.com/serpifai_php/api_gateway.php`

### Test 2: Direct URL Accessibility 🌐
- **Checks:** Can we reach the gateway URL?
- **Tests:** HTTP GET request to gateway
- **Detects:** "Coming soon" pages, redirects, HTML responses
- **Pass:** Gateway returns JSON (not HTML)

### Test 3: Gateway Connection (POST) 📡
- **Checks:** Does gateway accept POST requests with JSON?
- **Tests:** Sends proper API request structure
- **Detects:** .htaccess blocking, CORS issues, PHP errors
- **Pass:** Gateway responds with valid JSON

### Test 4: MySQL Connection 🗄️
- **Checks:** Can gateway connect to MySQL database?
- **Tests:** License key verification query
- **Detects:** Database connection issues, missing tables
- **Pass:** MySQL returns user data

### Test 5: callGateway Function 🔧
- **Checks:** Does our helper function work correctly?
- **Tests:** Full end-to-end call through Apps Script function
- **Pass:** callGateway returns valid response

---

## 📋 Understanding Results

### ✅ All Tests Pass
```
🎉 ALL TESTS PASSED!
   Your system is fully configured and ready to use.
```
**Action:** You're done! Try saving a license key in Settings.

### ⚠️ Some Tests Fail
The diagnostic will show specific errors and recommendations for each failure.

---

## 🔧 Common Issues & Fixes

### Issue 1: Script Property Not Configured
**Symptoms:**
```
❌ PHP_GATEWAY_URL is NOT configured
```

**Fix:**
The diagnostic auto-configures this. If it fails, run manually:
```javascript
SETUP_ConfigureGateway()
```

Or set manually:
1. Project Settings → Script Properties
2. Add: `PHP_GATEWAY_URL` = `https://serpifai.com/serpifai_php/api_gateway.php`

---

### Issue 2: URL Not Accessible
**Symptoms:**
```
❌ Cannot access URL
Response Code: 404
```

**Possible Causes:**
1. PHP files not uploaded to Hostinger
2. Wrong directory path
3. File permissions incorrect

**Fix:**
1. Upload all files from `serpifai_php/` folder
2. Path should be: `/public_html/serpifai_php/api_gateway.php`
3. Set permissions: `chmod 644 *.php`

**Verify in browser:**
Open: `https://serpifai.com/serpifai_php/api_gateway.php`
Should see: `{"success":false,"error":"Invalid request method"}`

---

### Issue 3: Receiving HTML Instead of JSON
**Symptoms:**
```
⚠️ WARNING: Receiving HTML page instead of JSON
This might be a "coming soon" page
```

**Cause:** Site maintenance mode or .htaccess redirect

**Fix - Option A (Recommended):** Update `.htaccess`
```apache
# Add to /public_html/.htaccess

# Allow API access even during maintenance
<Files "api_gateway.php">
    Allow from all
    Satisfy Any
</Files>

# Or allow entire serpifai_php directory
<Directory /public_html/serpifai_php>
    Allow from all
    Satisfy Any
</Directory>
```

**Fix - Option B:** Disable maintenance mode temporarily
1. cPanel → File Manager
2. Find `.htaccess` or maintenance plugin
3. Disable redirect for `serpifai_php` folder

---

### Issue 4: Gateway Not Responding Correctly
**Symptoms:**
```
❌ Response is not valid JSON
```

**Possible Causes:**
1. PHP syntax error
2. Missing dependencies
3. .htaccess blocking POST requests

**Fix:**
1. Check PHP error logs:
   - cPanel → Error Log
   - Look for recent errors

2. Test PHP file directly:
   ```bash
   # SSH into server
   php /path/to/public_html/serpifai_php/api_gateway.php
   ```

3. Check .htaccess isn't blocking:
   ```apache
   # Ensure these are NOT in .htaccess:
   # deny from all
   # Require all denied
   ```

---

### Issue 5: MySQL Connection Failed
**Symptoms:**
```
⚠️ Gateway working but MySQL not connecting
Error: Database connection failed
```

**Fix:**
1. Check `serpifai_php/database.php` configuration:
   ```php
   define('DB_HOST', 'localhost');      // Usually localhost
   define('DB_NAME', 'your_db_name');   // Your MySQL database name
   define('DB_USER', 'your_db_user');   // MySQL username
   define('DB_PASS', 'your_password');  // MySQL password
   ```

2. Verify database exists:
   - cPanel → phpMyAdmin
   - Check database name matches

3. Test MySQL connection in phpMyAdmin:
   ```sql
   SELECT 1; -- Should return 1
   ```

---

### Issue 6: Test License Key Not Found
**Symptoms:**
```
⚠️ MySQL working but test license key not found
Error: License key not found in database
```

**Fix:** Add test user to database

**Via phpMyAdmin:**
1. cPanel → phpMyAdmin
2. Select your database
3. Run SQL:
   ```sql
   CREATE TABLE IF NOT EXISTS `users` (
     `id` INT(11) AUTO_INCREMENT PRIMARY KEY,
     `email` VARCHAR(255) NOT NULL,
     `license_key` VARCHAR(64) UNIQUE NOT NULL,
     `status` VARCHAR(32) DEFAULT 'active',
     `credits` INT(11) DEFAULT 100,
     `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
     `last_login` DATETIME,
     `total_credits_used` INT(11) DEFAULT 0,
     `updated_at` DATETIME ON UPDATE CURRENT_TIMESTAMP
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
   
   INSERT INTO users (email, license_key, status, credits) 
   VALUES ('test@serpifai.com', 'SERP-FAI-TEST-KEY-123456', 'active', 100);
   ```

**Via SSH:**
```bash
mysql -u username -p database_name << EOF
INSERT INTO users (email, license_key, status, credits) 
VALUES ('test@serpifai.com', 'SERP-FAI-TEST-KEY-123456', 'active', 100);
EOF
```

---

## 🧪 Additional Test Functions

### Quick Configuration
```javascript
SETUP_ConfigureGateway()
```
Auto-configures the gateway URL.

### Quick Verification
```javascript
TEST_QuickVerification()
```
Faster test (only checks essentials).

### MySQL Connection Only
```javascript
TEST_MySQLConnection()
```
Tests just the database connection.

### License Key Verification
```javascript
TEST_VerifyLicenseKey()
```
Tests full license key save/verify flow.

---

## 📞 Troubleshooting Workflow

### 1. Run Diagnostic
```javascript
TEST_ComprehensiveDiagnostics()
```

### 2. Check Results
Read the log output carefully. Note which tests pass/fail.

### 3. Follow Recommendations
The diagnostic provides specific fixes for each failure.

### 4. Apply Fixes
Make the recommended changes (upload files, configure database, etc.)

### 5. Re-run Diagnostic
Run `TEST_ComprehensiveDiagnostics()` again to verify fixes.

### 6. Repeat Until All Pass
Keep fixing issues until you see:
```
🎉 ALL TESTS PASSED!
```

---

## ✅ Success Checklist

Before testing in the UI, ensure:

- [ ] `TEST_ComprehensiveDiagnostics()` shows all tests passing
- [ ] Gateway URL configured
- [ ] PHP files uploaded and accessible
- [ ] MySQL database configured
- [ ] Test user exists in database
- [ ] No .htaccess conflicts

---

## 🚀 After All Tests Pass

1. **Open Google Sheet**
2. **Click ⚙️ Settings button**
3. **Enter license key:** `SERP-FAI-TEST-KEY-123456`
4. **Click Save**
5. **Should see:** "✅ License key verified and activated!"

---

## 📊 Interpreting Diagnostic Output

### Good Output Example:
```
═══════════════════════════════════════════════════════
🔍 COMPREHENSIVE DIAGNOSTIC TEST
═══════════════════════════════════════════════════════

TEST 1: Script Properties Configuration
─────────────────────────────────────────
✅ PHP_GATEWAY_URL is configured
   URL: https://serpifai.com/serpifai_php/api_gateway.php

TEST 2: Direct URL Accessibility Test
─────────────────────────────────────────
✅ URL is accessible (code 200)
✅ Response is JSON (API is working)

TEST 3: Gateway Connection (POST request)
─────────────────────────────────────────
✅ Gateway is responding with JSON

TEST 4: MySQL Connection Test
─────────────────────────────────────────
✅ MySQL connection successful!
   User Email: test@serpifai.com
   Credits: 100
   Status: active

TEST 5: callGateway Function Test
─────────────────────────────────────────
✅ callGateway() working correctly

═══════════════════════════════════════════════════════
📊 DIAGNOSTIC SUMMARY
═══════════════════════════════════════════════════════

Test Results:
  Script Property Configured: ✅
  Gateway URL Accessible: ✅
  Gateway Responding: ✅
  MySQL Connected: ✅
  Test License Key Found: ✅

🎉 ALL TESTS PASSED!
   Your system is fully configured and ready to use.
```

### Bad Output Example (with fixes):
```
TEST 2: Direct URL Accessibility Test
─────────────────────────────────────────
Response Code: 404
❌ Unexpected response code: 404

💡 RECOMMENDATIONS
═══════════════════════════════════════════════════════

❌ Gateway URL not accessible:
   1. Check if PHP files uploaded to: /public_html/serpifai_php/
   2. Verify file permissions (644 for PHP files)
   3. Check if domain serpifai.com is active
```

---

## 🆘 Still Having Issues?

If diagnostic doesn't resolve your issue:

1. **Copy full diagnostic log**
2. **Check PHP error logs** (cPanel → Error Log)
3. **Verify all credentials** in `database.php`
4. **Test direct PHP access** in browser
5. **Check file permissions** on server

**Files to verify exist:**
- `/public_html/serpifai_php/api_gateway.php`
- `/public_html/serpifai_php/database.php`
- `/public_html/serpifai_php/config.php`
- `/public_html/serpifai_php/handlers/user_handler.php`

---

**Run `TEST_ComprehensiveDiagnostics()` now to get started!** 🚀
