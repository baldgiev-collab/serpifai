# 🚀 DEPLOYMENT CHECKLIST - Google Account Binding Security

## ⚠️ DEPLOY IMMEDIATELY - Security Fix

**Issue**: Same license key used by multiple Google accounts  
**Fix**: Bind each license to ONE Google account permanently  
**Severity**: HIGH - Prevents unauthorized license sharing  

---

## 📋 Deployment Steps (15 minutes)

### STEP 1: Database Migration (5 min) ⚡ CRITICAL
**Location**: Hostinger cPanel → phpMyAdmin

1. Login to https://hpanel.hostinger.com
2. Click "phpMyAdmin" in Advanced section
3. Select database: `u187453795_SrpAIDataGate`
4. Click "SQL" tab at top
5. Copy and paste this SQL:

```sql
-- Add google_account_email column
ALTER TABLE users 
ADD COLUMN google_account_email VARCHAR(255) NULL 
AFTER email
COMMENT 'Google account email that activated this license key';

-- Add index for fast lookup
CREATE INDEX idx_google_account ON users(google_account_email);
```

6. Click "Go" button
7. ✅ Verify success message: "2 rows affected"

**Verification**:
```sql
-- Check column was added
DESCRIBE users;
-- Should show google_account_email column

-- Check index was created
SHOW INDEX FROM users;
-- Should show idx_google_account index
```

---

### STEP 2: Upload PHP Files (3 min) 🐘

**Location**: Hostinger cPanel → File Manager

#### File 1: user_handler.php
1. Navigate to: `/public_html/serpifai_php/handlers/`
2. Right-click `user_handler.php` → Edit
3. Replace entire file content with code from:
   - **Local**: `c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\handlers\user_handler.php`
   - **GitHub**: https://github.com/baldgiev-collab/serpifai/blob/main/v6_saas/serpifai_php/handlers/user_handler.php
4. Save changes
5. ✅ Verify file size increased (added validation logic)

#### File 2: api_gateway.php
1. Navigate to: `/public_html/serpifai_php/`
2. Right-click `api_gateway.php` → Edit
3. Replace entire file content with code from:
   - **Local**: `c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\api_gateway.php`
   - **GitHub**: https://github.com/baldgiev-collab/serpifai/blob/main/v6_saas/serpifai_php/api_gateway.php
4. Save changes
5. ✅ Verify timestamp updated

---

### STEP 3: Deploy Apps Script (5 min) 📝

**Location**: Apps Script Editor

1. Open Google Apps Script Editor
2. Navigate to file: `UI_Settings.gs`
3. Replace entire file content with code from:
   - **Local**: `c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\apps_script\UI_Settings.gs`
   - **GitHub**: https://github.com/baldgiev-collab/serpifai/blob/main/v6_saas/apps_script/UI_Settings.gs
4. Save (Ctrl+S)
5. ✅ Verify "Last edited" timestamp updated

**Quick Copy Commands** (from local):
```powershell
# Open file in default editor
notepad "c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\apps_script\UI_Settings.gs"

# Copy to clipboard (if clip.exe available)
Get-Content "c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\apps_script\UI_Settings.gs" | clip
```

---

### STEP 4: Test Security (2 min) 🧪

#### Test A: Same Account (Should Work ✅)
1. Open Settings dialog
2. Current Google account should load normally
3. ✅ Shows account info and credits

#### Test B: Different Account (Should Block ❌)
1. Log out from Google account
2. Log in with different Google account (e.g., test account)
3. Open Settings dialog
4. Try to enter the same license key
5. ✅ Should show error: "License key is registered to a different Google account"

#### Test C: New License (Should Bind ✅)
1. Log in with Google account (metamindexplore@gmail.com)
2. Enter NEW license key (different from support@serpifai.com key)
3. ✅ Should save successfully
4. ✅ Check database: `google_account_email` = metamindexplore@gmail.com

**SQL Check**:
```sql
SELECT email, license_key, google_account_email 
FROM users 
WHERE license_key = 'SERP-FAI-TEST-KEY-123456';
```

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] **Database**: `google_account_email` column exists
- [ ] **Database**: Index `idx_google_account` created
- [ ] **PHP**: `user_handler.php` file modified (check timestamp)
- [ ] **PHP**: `api_gateway.php` file modified (check timestamp)
- [ ] **Apps Script**: `UI_Settings.gs` saved (check "Last edited")
- [ ] **Test A**: Same account loads normally
- [ ] **Test B**: Different account blocked
- [ ] **Test C**: New license binds to Google account
- [ ] **Logs**: Check PHP error log for "SECURITY ALERT" messages

---

## 📊 What Changed (Technical Summary)

### Database Schema
```sql
-- BEFORE
users: id, email, license_key, status, credits, created_at, last_login

-- AFTER
users: id, email, google_account_email, license_key, status, credits, created_at, last_login
--                 ^^^^^^^^^^^^^^^^^^^^ NEW COLUMN
```

### API Request Flow
```
BEFORE:
Apps Script → Server: {licenseKey: "SERP-FAI-..."}
Server → Database: SELECT ... WHERE license_key = ?
Response: {success: true, user: {...}}

AFTER:
Apps Script → Server: {licenseKey: "SERP-FAI-...", googleAccountEmail: "user@gmail.com"}
Server → Database: SELECT ... WHERE license_key = ? AND (google_account_email = ? OR google_account_email IS NULL)
Server Logic: IF mismatch → REJECT, ELSE → Allow + Bind if NULL
Response: {success: true/false, error_code: "GOOGLE_ACCOUNT_MISMATCH"}
```

### Security Logic
```php
// In user_handler.php
if ($user['google_account_email']) {
    // License already bound
    if ($user['google_account_email'] !== $googleAccountEmail) {
        // DIFFERENT account trying to use license
        return ERROR with code 'GOOGLE_ACCOUNT_MISMATCH';
    }
} else {
    // License not bound yet - BIND NOW
    UPDATE users SET google_account_email = ? WHERE id = ?;
}
```

---

## 🆘 Troubleshooting

### Error: "Cannot determine your Google account"
**Cause**: Session.getActiveUser().getEmail() returned empty  
**Fix**: User must be logged into Google account. Try:
1. Log out and log back into Google account
2. Clear browser cache
3. Try different browser

### Error: "Column 'google_account_email' doesn't exist"
**Cause**: SQL migration not run  
**Fix**: Re-run STEP 1 (Database Migration)

### Error: Still shows "support@serpifai.com" for different accounts
**Cause**: PHP files not uploaded or cached  
**Fix**: 
1. Clear browser cache (Ctrl+Shift+Del)
2. Re-upload PHP files
3. Check file timestamps in cPanel File Manager

### License key saved but not showing in different account
**Cause**: This is EXPECTED behavior (security working correctly)  
**Fix**: No fix needed - this is the security feature working as designed

---

## 📞 Support Scenarios

### User: "I entered the license key but it says it's registered to someone else"

**Check**:
1. Which Google account are they logged in as?
2. Which Google account originally activated the license?

**Solution**:
```sql
-- View current binding
SELECT email, license_key, google_account_email 
FROM users 
WHERE license_key = 'SERP-FAI-...';

-- Transfer license (admin only)
UPDATE users 
SET google_account_email = 'new@gmail.com' 
WHERE license_key = 'SERP-FAI-...';
```

### User: "I want to use the license on my new Google account"

**Solution**: Run admin override SQL:
```sql
-- Option 1: Transfer to new account
UPDATE users 
SET google_account_email = 'new@gmail.com' 
WHERE license_key = 'SERP-FAI-...';

-- Option 2: Unbind (let them re-activate)
UPDATE users 
SET google_account_email = NULL 
WHERE license_key = 'SERP-FAI-...';
```

---

## 📈 Monitoring

### View Security Alerts
```bash
# In cPanel Terminal or SSH
tail -f /home/u187453795/domains/serpifai.com/public_html/error_log | grep "SECURITY ALERT"
```

### Count Today's Attempts
```sql
-- View recent mismatch attempts from error log
SELECT COUNT(*) FROM error_log WHERE message LIKE '%SECURITY ALERT%' AND date = CURDATE();
```

### Audit Bindings
```sql
-- View all license key bindings
SELECT 
    email AS account_email,
    google_account_email AS bound_to,
    license_key,
    status,
    created_at
FROM users
WHERE google_account_email IS NOT NULL
ORDER BY created_at DESC;

-- View unbound licenses (vulnerable to binding by first user)
SELECT email, license_key, status
FROM users
WHERE google_account_email IS NULL
ORDER BY created_at DESC;
```

---

## ✅ Expected Behavior After Deployment

### Scenario 1: Existing User (support@serpifai.com)
- **Current State**: License key saved in UserProperties
- **After Deployment**: 
  - Opens Settings → Server checks google_account_email (currently NULL)
  - Server saves current Google account → Binds permanently
  - User sees normal account info
  - **Result**: Existing users auto-bind on first login ✅

### Scenario 2: New User (metamindexplore@gmail.com)
- **Action**: Enters license key "SERP-FAI-TEST-KEY-123456"
- **Server Check**: License exists? Yes. Already bound? No (NULL)
- **Server Action**: Saves metamindexplore@gmail.com to database
- **Result**: License now bound to metamindexplore@gmail.com ✅

### Scenario 3: Unauthorized User (serpifai@gmail.com)
- **Action**: Tries to enter same license key
- **Server Check**: License exists? Yes. Already bound? Yes (to metamindexplore@gmail.com)
- **Server Comparison**: serpifai@gmail.com ≠ metamindexplore@gmail.com
- **Server Response**: ERROR with code GOOGLE_ACCOUNT_MISMATCH
- **Result**: Access denied, security error shown ✅

---

## 🎯 Success Criteria

✅ Database migration completed (google_account_email column exists)  
✅ PHP files uploaded and verified  
✅ Apps Script deployed and saved  
✅ Test A passed (same account works)  
✅ Test B passed (different account blocked)  
✅ No console errors in browser  
✅ No PHP errors in error_log  

---

## 📅 Deployment Date: December 1, 2025
## 🔢 Version: v6.0.1 (Security Update)
## ⏱️ Estimated Time: 15 minutes
## 🚨 Priority: HIGH - Deploy immediately

---

## 📚 Documentation

Full details: [SECURITY_GOOGLE_ACCOUNT_BINDING.md](../SECURITY_GOOGLE_ACCOUNT_BINDING.md)

---

**Ready to deploy? Start with STEP 1 (Database Migration)** 👆
