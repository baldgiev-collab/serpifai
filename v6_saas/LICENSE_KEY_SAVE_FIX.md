# 🔧 License Key Save Fix - Step by Step

## Problem Summary

License key `SERP-FAI-TEST-KEY-123456` cannot be saved, and Settings UI shows "No license key configured" even though the key exists in MySQL.

## Root Causes Found

1. ❌ **Gateway URL not configured** - Using placeholder `https://yourdomain.com/serpifai_php/api_gateway.php`
2. ❌ **User actions blocked** - Gateway required license key to verify license key (chicken-egg problem)
3. ❌ **Missing logging** - No debug output to diagnose issues

## Fixes Applied

### Fix 1: Allow User Actions Without License Key

**File:** `UI_Gateway.gs`

**Changed:**
```javascript
// Before: Required license key for ALL actions
if (!licenseKey) {
  throw new GatewayError('No license key configured...');
}

// After: Allow user management actions without license key
const userActions = ['verifyLicenseKey', 'getUserInfo', 'check_status'];
const isUserAction = userActions.includes(action);

if (!licenseKey && !isUserAction) {
  throw new GatewayError('No license key configured...');
}
```

### Fix 2: PHP Gateway Bypasses Auth for User Actions

**File:** `api_gateway.php`

**Changed:**
```php
// Before: Required license key immediately
if (empty($license)) {
    sendError('Missing license key', 400);
}

// After: Check if user action first
$userActions = ['verifyLicenseKey', 'getUserInfo', 'check_status'];
$isUserAction = in_array($action, $userActions);

if ($isUserAction) {
    $result = handleUserAction($action, $payload, $license);
    sendJSON($result);
}
```

### Fix 3: Added Extensive Logging

**File:** `UI_Settings.gs`

Added logging to:
- `saveLicenseKey()` - Track every step
- `callGateway()` - Log URL, action, response
- New test functions: `TEST_VerifyLicenseKey()`, `TEST_MySQLConnection()`

---

## Step-by-Step Setup Guide

### Step 1: Configure Gateway URL (CRITICAL!)

The gateway URL must point to your actual Hostinger domain.

**Option A: Use Script Properties (Recommended)**

1. Open Apps Script Editor
2. Go to: **Project Settings** (⚙️ icon)
3. Scroll to: **Script Properties**
4. Click: **Add script property**
5. Enter:
   - **Property:** `PHP_GATEWAY_URL`
   - **Value:** `https://YOUR-DOMAIN.com/serpifai_php/api_gateway.php`
6. Click **Save**

**Replace `YOUR-DOMAIN.com` with your actual Hostinger domain!**

Examples:
- `https://serpifai.com/serpifai_php/api_gateway.php`
- `https://mywebsite.online/serpifai_php/api_gateway.php`
- `https://baldgiev.com/serpifai_php/api_gateway.php`

**Option B: Hardcode in UI_Gateway.gs**

Edit `UI_Gateway.gs` line 11:
```javascript
// Before:
GATEWAY_URL: 'https://yourdomain.com/serpifai_php/api_gateway.php',

// After:
GATEWAY_URL: 'https://YOUR-DOMAIN.com/serpifai_php/api_gateway.php',
```

---

### Step 2: Verify MySQL Data

Run this SQL query to confirm your test license key exists:

```sql
USE serpifai_db;

SELECT * FROM users WHERE license_key = 'SERP-FAI-TEST-KEY-123456';
```

**Expected output:**
```
id | email               | license_key                  | status | credits | created_at          | last_login
1  | testuser@email.com  | SERP-FAI-TEST-KEY-123456     | active | 100     | 2025-11-28 10:00:00 | NULL
```

**If table doesn't exist:**
```sql
CREATE TABLE users (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  license_key VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(32) DEFAULT 'active',
  credits INT(11) DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  total_credits_used INT(11) DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (email, license_key, status, credits)
VALUES ('testuser@email.com', 'SERP-FAI-TEST-KEY-123456', 'active', 100);
```

---

### Step 3: Deploy Updated Code

```powershell
cd c:\Users\baldg\OneDrive\Documents\GitHub\serpifai
clasp push
```

**Files being deployed:**
- ✅ `UI_Gateway.gs` (bypass auth for user actions)
- ✅ `UI_Settings.gs` (enhanced logging + test functions)
- ✅ `UI_Scripts_App.html` (wider modal)

---

### Step 4: Upload PHP Files to Hostinger

Upload these files via FTP or Hostinger File Manager:

1. **api_gateway.php** → `/public_html/serpifai_php/api_gateway.php`
2. **handlers/user_handler.php** → `/public_html/serpifai_php/handlers/user_handler.php`

**Verify file structure:**
```
/public_html/
  └── serpifai_php/
      ├── api_gateway.php          ← Updated
      ├── config/
      │   └── db_config.php
      └── handlers/
          └── user_handler.php     ← Updated
```

---

### Step 5: Test Gateway Connection

**Run test function in Apps Script:**

1. Open Apps Script Editor
2. Select function: `TEST_MySQLConnection`
3. Click **Run** (▶️)
4. Click **View** → **Logs**

**Expected output:**
```
=== TESTING MYSQL CONNECTION ===
MySQL connection successful!
Response: {
  "success": true,
  "message": "License key verified",
  "user": {
    "id": 1,
    "email": "testuser@email.com",
    "license_key": "SERP-FAI-TEST-KEY-123456",
    "status": "active",
    "credits": 100,
    "created_at": "2025-11-28 10:00:00",
    "last_login": null
  }
}

✅ User found in database:
  Email: testuser@email.com
  Credits: 100
  Status: active
  Created: 2025-11-28 10:00:00
```

**If you see errors:**
- Check gateway URL is correct
- Verify MySQL credentials in `db_config.php`
- Check Hostinger PHP error logs

---

### Step 6: Test Full License Key Flow

**Run complete test:**

1. Select function: `TEST_VerifyLicenseKey`
2. Click **Run** (▶️)
3. Check logs

**Expected output:**
```
=== TESTING LICENSE KEY VERIFICATION ===
Test key: SERP-FAI-TEST-KEY-123456

1. Testing callGateway...
Response: {
  "success": true,
  "message": "License key verified",
  "user": { ... }
}

2. Testing saveLicenseKey...
Save result: {
  "success": true,
  "message": "License key saved and verified successfully!"
}

3. Testing getUserSettings...
Settings: {
  "licenseKey": "SERP-FAI-TEST-KEY-123456",
  "hasLicenseKey": true,
  "email": "testuser@email.com",
  "credits": 100,
  "status": "active",
  ...
}

=== TEST COMPLETE ===
```

---

### Step 7: Test in Settings UI

1. Open Google Sheet
2. Refresh page (F5)
3. Click **⚙️ Settings** button
4. You should see:
   - **Profile header** with email
   - **Credits: 100**
   - **Status: Active**
   - **Member since** date

**If you still see "No license key configured":**
- The test functions saved it, so click **🔄 Refresh Data**
- OR enter the license key manually and click **💾 Save**

---

## Troubleshooting

### Issue: "Invalid JSON response from gateway"

**Cause:** Gateway URL is wrong or PHP has errors

**Fix:**
1. Test gateway URL in browser:
   ```
   https://YOUR-DOMAIN.com/serpifai_php/api_gateway.php
   ```
2. Should see:
   ```json
   {"error":"Missing action","status":400}
   ```
3. If 404 error, check file path on Hostinger
4. If 500 error, check PHP error logs

---

### Issue: "Missing license key"

**Cause:** Gateway URL not configured

**Fix:**
1. Check Script Properties has `PHP_GATEWAY_URL`
2. OR edit `UI_Gateway.gs` line 11 with real URL
3. Redeploy: `clasp push`

---

### Issue: "User not found or inactive"

**Cause:** License key not in MySQL or status != 'active'

**Fix:**
```sql
-- Check if exists
SELECT * FROM users WHERE license_key = 'SERP-FAI-TEST-KEY-123456';

-- If not found, insert
INSERT INTO users (email, license_key, status, credits)
VALUES ('testuser@email.com', 'SERP-FAI-TEST-KEY-123456', 'active', 100);

-- If status is wrong, update
UPDATE users SET status = 'active' WHERE license_key = 'SERP-FAI-TEST-KEY-123456';
```

---

### Issue: License Key Saves But UI Shows "No license key configured"

**Cause:** `getUserSettings()` not reading from properties

**Fix:**
1. Run test: `TEST_VerifyLicenseKey`
2. Check logs show license key is saved
3. Refresh Settings UI
4. If still not showing, manually clear and re-save

---

### Issue: "Could not verify license key with server"

**Cause:** Gateway connection failed

**Check:**
1. Gateway URL correct?
   ```javascript
   Logger.log(PropertiesService.getScriptProperties().getProperty('PHP_GATEWAY_URL'));
   ```
2. Hostinger PHP running?
   - Check Hostinger hPanel → PHP version
   - Should be PHP 7.4 or 8.x
3. MySQL connection working?
   - Check `db_config.php` has correct credentials

---

## Quick Verification Checklist

Before testing, verify:

- [ ] MySQL table `users` exists
- [ ] Test license key in database: `SERP-FAI-TEST-KEY-123456`
- [ ] User status is `active`
- [ ] User has credits (100)
- [ ] Gateway URL configured (Script Properties or UI_Gateway.gs)
- [ ] PHP files uploaded to Hostinger
- [ ] `api_gateway.php` accessible via browser
- [ ] `db_config.php` has correct MySQL credentials
- [ ] Apps Script code deployed (`clasp push`)
- [ ] Google Sheet refreshed (F5)

---

## Expected Behavior After Fix

### When Settings Opens:
1. **With saved license key:**
   - Shows profile header with email
   - Shows credits: 100
   - Shows status: Active
   - Shows member since date
   - Shows masked license key
   - Shows Refresh and Remove buttons

2. **Without license key:**
   - Shows "No license key configured" message
   - Shows input field
   - Shows Save button

### When Saving License Key:
1. User enters: `SERP-FAI-TEST-KEY-123456`
2. Clicks: **💾 Save License Key**
3. Shows: "Saving license key..."
4. After 2 seconds: "✅ License key saved and verified successfully!"
5. Modal reloads automatically
6. Now shows profile with all user data

---

## Testing Commands

### Test in Apps Script Editor:

```javascript
// Test 1: Check gateway connection
TEST_MySQLConnection()

// Test 2: Test full verification flow
TEST_VerifyLicenseKey()

// Test 3: Check current settings
getUserSettings()

// Test 4: Manually test save
saveLicenseKey('SERP-FAI-TEST-KEY-123456')
```

### Test via cURL (Direct PHP):

```bash
curl -X POST https://YOUR-DOMAIN.com/serpifai_php/api_gateway.php \
  -H "Content-Type: application/json" \
  -d '{
    "license": "",
    "action": "verifyLicenseKey",
    "payload": {
      "licenseKey": "SERP-FAI-TEST-KEY-123456"
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "License key verified",
  "user": {
    "id": 1,
    "email": "testuser@email.com",
    "license_key": "SERP-FAI-TEST-KEY-123456",
    "status": "active",
    "credits": 100
  }
}
```

---

## Summary of Changes

### Apps Script Files:
- ✅ `UI_Gateway.gs` - Allow user actions without license key
- ✅ `UI_Settings.gs` - Enhanced logging, added test functions
- ✅ Test functions: `TEST_VerifyLicenseKey()`, `TEST_MySQLConnection()`

### PHP Files:
- ✅ `api_gateway.php` - Bypass authentication for user actions
- ✅ `handlers/user_handler.php` - Already correct

### Configuration:
- ⚙️ Script Property: `PHP_GATEWAY_URL` = Your actual domain
- ⚙️ MySQL: Test user with license key

---

## Next Steps

1. **Configure Gateway URL** (most important!)
2. **Deploy code:** `clasp push`
3. **Upload PHP** files to Hostinger
4. **Run test:** `TEST_MySQLConnection()` in Apps Script
5. **Open Settings** UI and test

After configuration, license key save should work perfectly!

