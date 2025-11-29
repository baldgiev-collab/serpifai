# 🔒 SECURE DEPLOYMENT GUIDE - SerpifAI v6
## Maximum Security: Server-Side Validation Always Required

---

## 🎯 WHAT CHANGED - SECURITY FIRST

**OLD LOGIC (INSECURE):**
- ❌ Could save license key locally without server verification
- ❌ Could work "offline" without credit checks
- ❌ Credits could be bypassed
- ❌ License key validation was optional

**NEW LOGIC (SECURE):**
- ✅ **MUST** verify license key with server before saving
- ✅ **MUST** check credits with server before EVERY operation
- ✅ Invalid license keys automatically removed
- ✅ No offline mode - server connection required
- ✅ Zero trust: Validate everything server-side

---

## 📋 DEPLOYMENT STEPS

### Step 1: Set Script Property (CRITICAL)

1. Open Apps Script Editor
2. Click **Project Settings** (⚙️ gear icon on left)
3. Scroll to **Script Properties**
4. Click **Add script property**
5. Enter:
   - **Property:** `PHP_GATEWAY_URL`
   - **Value:** `https://serpifai.com/serpifai_php/api_gateway.php`
6. Click **Save script properties**

**Screenshot reference:**
```
Script Properties
┌─────────────────────────────────────────────────┐
│ Property: PHP_GATEWAY_URL                       │
│ Value: https://serpifai.com/serpifai_php/...   │
└─────────────────────────────────────────────────┘
```

### Step 2: Deploy Apps Script Code

```powershell
cd c:\Users\baldg\OneDrive\Documents\GitHub\serpifai
clasp push
```

**Files being deployed:**
- ✅ `UI_Settings.gs` - Secure license key management
- ✅ `UI_Gateway.gs` - Server validation enforced
- ✅ All other UI files

### Step 3: Verify PHP Files on Server

**Check files exist on Hostinger:**

```bash
https://serpifai.com/serpifai_php/api_gateway.php
```

**Directory structure should be:**
```
/public_html/
└── serpifai_php/
    ├── api_gateway.php          ← Main entry point
    ├── database.php             ← MySQL connection
    ├── config.php               ← API keys
    └── handlers/
        ├── user_handler.php     ← License/credit management
        ├── gemini_handler.php
        ├── serper_handler.php
        └── ...
```

### Step 4: Test Server Connection

**Test 1: Direct PHP Gateway**

Open browser and navigate to:
```
https://serpifai.com/serpifai_php/api_gateway.php
```

**Expected response:**
```json
{
  "success": false,
  "error": "Invalid request method"
}
```

If you see "coming soon" page instead, check `.htaccess` rules.

**Test 2: Apps Script Test Function**

In Apps Script Editor, run:
```javascript
TEST_MySQLConnection()
```

Check execution log (View → Logs):
```
=== TESTING MYSQL CONNECTION ===
MySQL connection successful!
Response: {
  "success": true,
  "user": {
    "email": "testuser@email.com",
    "credits": 100,
    "status": "active"
  }
}
```

### Step 5: Configure .htaccess (If Needed)

If your site shows "coming soon" but you need the API to work, add to `.htaccess`:

```apache
# Allow API access even when site is under construction
<Files "api_gateway.php">
    Order Allow,Deny
    Allow from all
    Satisfy Any
</Files>

# Or allow entire serpifai_php directory
<Directory /public_html/serpifai_php>
    Order Allow,Deny
    Allow from all
    Satisfy Any
</Directory>
```

---

## 🔐 SECURITY FEATURES IMPLEMENTED

### 1. License Key Verification (MANDATORY)

**Function:** `saveLicenseKey()`

```javascript
// OLD (INSECURE):
Save locally → Try server (optional)

// NEW (SECURE):
Verify with server → ONLY save if verified ✅
```

**Flow:**
1. User enters license key
2. **IMMEDIATELY** call server to verify
3. If server unreachable → **FAIL** (don't save)
4. If key invalid → **FAIL** (don't save)
5. If user inactive → **FAIL** (don't save)
6. **ONLY** save locally after server confirms valid

### 2. Credit Verification (EVERY OPERATION)

**Function:** `verifyCreditsBeforeOperation()`

**Call this BEFORE every API operation:**
```javascript
// Example usage:
function processWorkflow() {
  // Check credits FIRST
  const creditCheck = verifyCreditsBeforeOperation();
  
  if (!creditCheck.hasCredits) {
    return {
      success: false,
      message: creditCheck.message  // "No credits remaining"
    };
  }
  
  // Only proceed if credits available
  const result = callGateway('workflow:stage1', data);
  return result;
}
```

**What it does:**
1. Gets license key from local storage
2. **IMMEDIATELY** calls server to verify
3. Checks user status (must be 'active')
4. Checks credits (must be > 0)
5. If ANY check fails → Remove license key + return error

### 3. Invalid License Key Removal

**When license key is removed automatically:**
- Server returns 401 (authentication failed)
- User status is not 'active'
- Server unreachable during getUserSettings()
- Credits = 0 or user doesn't exist

**Code:**
```javascript
// In getUserSettings() and verifyCreditsBeforeOperation()
if (!response || !response.success) {
  // Remove invalid license key
  properties.deleteProperty('SERPIFAI_LICENSE_KEY');
  properties.deleteProperty('serpifai_license_key');
}
```

### 4. No Offline Mode

**OLD LOGIC:**
```javascript
try {
  callServer();
} catch (e) {
  return { success: true, warning: "Offline mode" }; // ❌ INSECURE
}
```

**NEW LOGIC:**
```javascript
try {
  callServer();  // REQUIRED
} catch (e) {
  return { success: false, error: e.message }; // ✅ SECURE
}
```

---

## 🧪 TESTING CHECKLIST

### Test 1: License Key Save (Valid)

**Steps:**
1. Open Google Sheet
2. Click ⚙️ Settings
3. Enter: `SERP-FAI-TEST-KEY-123456`
4. Click 💾 Save

**Expected:**
- ✅ Success message: "License key verified and activated!"
- ✅ Profile shows email, credits, status
- ✅ Key saved to PropertiesService

**If fails:**
- Check Script Property `PHP_GATEWAY_URL` is set
- Check MySQL has test key
- Check execution log for errors

### Test 2: License Key Save (Invalid)

**Steps:**
1. Settings → Enter: `FAKE-INVALID-KEY`
2. Click Save

**Expected:**
- ❌ Error: "License key verification failed"
- ❌ Key NOT saved locally
- ❌ No profile data shown

### Test 3: License Key Save (Server Down)

**Steps:**
1. Change Script Property to invalid URL: `https://fake.com/api.php`
2. Try to save license key

**Expected:**
- ❌ Error: "Cannot connect to server"
- ❌ Key NOT saved
- ❌ No offline mode

### Test 4: Credits Check Before Operation

**Steps:**
1. Save valid license key
2. Run workflow (or any operation)
3. Check execution log

**Expected log:**
```
Verifying credits with server before operation...
✅ Credits verified: 100 available
📡 Calling gateway: https://serpifai.com/...
✅ Gateway call successful
```

### Test 5: Zero Credits Behavior

**Steps:**
1. In MySQL, set user credits to 0:
```sql
UPDATE users SET credits = 0 WHERE license_key = 'SERP-FAI-TEST-KEY-123456';
```
2. Open Settings → Refresh Data

**Expected:**
- ⚠️ Credits show: 0
- ⚠️ Status may show warning
3. Try to run any operation

**Expected:**
- ❌ Error: "No credits remaining. Please purchase more credits."
- ❌ Operation blocked

### Test 6: Inactive Account

**Steps:**
1. In MySQL, set user status to 'suspended':
```sql
UPDATE users SET status = 'suspended' WHERE license_key = 'SERP-FAI-TEST-KEY-123456';
```
2. Settings → Refresh Data

**Expected:**
- ❌ License key automatically removed
- ❌ Error: "Account is suspended. Please contact support."

---

## 🚨 TROUBLESHOOTING

### Issue 1: "Cannot connect to server"

**Cause:** Gateway URL not accessible

**Solutions:**
1. Verify Script Property `PHP_GATEWAY_URL` is correct:
   ```
   https://serpifai.com/serpifai_php/api_gateway.php
   ```

2. Test direct access in browser - should see JSON error (not HTML)

3. Check `.htaccess` allows API access:
   ```apache
   <Files "api_gateway.php">
       Allow from all
   </Files>
   ```

4. Check Hostinger file permissions:
   ```bash
   chmod 644 api_gateway.php
   ```

### Issue 2: "License key verification failed"

**Cause:** Key doesn't exist in MySQL or user inactive

**Solutions:**
1. Check MySQL:
   ```sql
   SELECT * FROM users WHERE license_key = 'YOUR-KEY-HERE';
   ```

2. Verify user status = 'active':
   ```sql
   UPDATE users SET status = 'active' WHERE license_key = 'YOUR-KEY-HERE';
   ```

3. Add test user if missing:
   ```sql
   INSERT INTO users (email, license_key, status, credits) 
   VALUES ('test@email.com', 'SERP-FAI-TEST-KEY-123456', 'active', 100);
   ```

### Issue 3: "Coming Soon" page shown for API

**Cause:** Hostinger maintenance mode blocking API

**Solution:**
1. cPanel → File Manager → `/public_html/.htaccess`
2. Add exception:
   ```apache
   # Allow API even in maintenance
   RewriteCond %{REQUEST_URI} !^/serpifai_php/ [NC]
   # ... existing maintenance rules
   ```

### Issue 4: License Key Keeps Getting Removed

**Cause:** Server validation failing repeatedly

**Debug:**
1. Apps Script Editor → Run: `TEST_MySQLConnection()`
2. Check execution log for exact error
3. Verify database connection in `database.php`
4. Check MySQL user has permissions

### Issue 5: Credits Not Deducting

**Cause:** Credit deduction not implemented in PHP

**Solution:**
Check `user_handler.php` has `deductCredits()` being called:
```php
// After successful operation
$user->deductCredits($cost);
```

---

## 📊 MYSQL TABLE SETUP

**Verify `users` table structure:**

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
```

**Add test user:**

```sql
INSERT INTO users (email, license_key, status, credits) 
VALUES (
  'test@serpifai.com',
  'SERP-FAI-TEST-KEY-123456',
  'active',
  100
);
```

**Check user exists:**

```sql
SELECT license_key, email, status, credits, created_at 
FROM users 
WHERE license_key = 'SERP-FAI-TEST-KEY-123456';
```

---

## 🔄 UPDATING CODE

**After any code changes:**

1. **Deploy to Apps Script:**
   ```powershell
   clasp push
   ```

2. **Upload PHP files:**
   - cPanel → File Manager
   - Navigate to `/public_html/serpifai_php/`
   - Upload updated PHP files
   - Overwrite existing files

3. **Clear cache:**
   - Hard refresh Google Sheet: `Ctrl + Shift + R`
   - Clear Apps Script cache: Settings → Clear Cache

4. **Test:**
   - Run `TEST_MySQLConnection()`
   - Try saving license key
   - Check execution logs

---

## ✅ DEPLOYMENT VERIFICATION

**Before going live, verify:**

- [ ] Script Property `PHP_GATEWAY_URL` configured
- [ ] Apps Script code deployed: `clasp push`
- [ ] PHP files uploaded to `/public_html/serpifai_php/`
- [ ] MySQL `users` table exists
- [ ] Test user created in MySQL
- [ ] Direct API access works (returns JSON)
- [ ] `.htaccess` allows API access
- [ ] `TEST_MySQLConnection()` passes
- [ ] License key save works
- [ ] Invalid key rejected
- [ ] Server down blocks save (no offline mode)
- [ ] Credits verified before operations
- [ ] Zero credits blocks operations
- [ ] Inactive user blocks operations

---

## 🎯 SECURITY SUMMARY

**What's Protected:**
✅ License key validation (server-side only)
✅ Credit checks (every operation)
✅ Invalid keys auto-removed
✅ No offline/bypass mode
✅ User status enforcement (active only)
✅ Zero credits blocks usage

**Attack Vectors Prevented:**
❌ Cannot save fake license key locally
❌ Cannot bypass credit checks
❌ Cannot work offline to avoid validation
❌ Cannot use expired/inactive accounts
❌ Cannot manipulate local data

**Result:**
🔒 **100% server-side validation enforced**
🔒 **Zero trust architecture**
🔒 **No local bypass possible**

---

## 📞 SUPPORT

**If still having issues:**

1. Check execution log: Apps Script Editor → View → Logs
2. Check browser console: F12 → Console tab
3. Check server logs: cPanel → Error Log
4. Test direct API: `curl` or Postman
5. Verify MySQL connection

**Common errors and fixes:**
- "Cannot connect to server" → Check Script Property URL
- "License key verification failed" → Check MySQL has key
- "Coming soon" page → Update `.htaccess`
- "Credits = 0" → Update MySQL credits

---

**🚀 Ready to Deploy!**

Once all steps complete, your system will be fully secure with mandatory server validation.
