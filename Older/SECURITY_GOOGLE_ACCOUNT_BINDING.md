# 🔒 SECURITY UPDATE: Google Account Binding

## Critical Security Issue Fixed

**Problem**: Multiple Google accounts could use the same license key, allowing unauthorized license sharing.

**Solution**: Implemented Google Account Binding - each license key is now permanently tied to ONE Google account.

---

## How It Works

### 1. First Activation
- User enters license key from any Google account
- Server validates license key in MySQL database
- **Server saves the Google account email to database** (binds license to this account)
- User can now use all features

### 2. Subsequent Logins
- User opens Settings dialog
- Apps Script sends: `license_key + google_account_email`
- **Server validates BOTH license key AND Google account email**
- If mismatch → Reject access, remove local license key
- If match → Allow access

### 3. Unauthorized Access Attempt
- Different Google account tries to use same license key
- Server detects: `google_account_email in database ≠ requesting Google account`
- Server returns error: `GOOGLE_ACCOUNT_MISMATCH`
- Apps Script shows security error and removes license key
- User sees: "This license is registered to: original@account.com"

---

## Database Changes

### SQL Migration Required

```sql
-- Add google_account_email column
ALTER TABLE users 
ADD COLUMN google_account_email VARCHAR(255) NULL 
AFTER email
COMMENT 'Google account email that activated this license key';

-- Add index for fast lookup
CREATE INDEX idx_google_account ON users(google_account_email);
```

**Run this in phpMyAdmin:**
1. Login to Hostinger cPanel → phpMyAdmin
2. Select database: `u187453795_SrpAIDataGate`
3. Click "SQL" tab
4. Paste the SQL above
5. Click "Go"

File location: `v6_saas/php_backend/database_migrations/add_google_account_binding.sql`

---

## Code Changes

### 1. PHP Backend (`user_handler.php`)

**Modified**: `UserHandler::verifyLicenseKey($licenseKey, $googleAccountEmail = null)`

- **New parameter**: `$googleAccountEmail` (optional for backward compatibility)
- **Binding logic**: If `google_account_email` is NULL in database → save current Google account
- **Validation logic**: If `google_account_email` exists → compare with requesting account
- **Error code**: Returns `GOOGLE_ACCOUNT_MISMATCH` if accounts don't match
- **Security logging**: Logs all mismatch attempts to PHP error log

```php
// Key security check
if ($user['google_account_email']) {
    if ($user['google_account_email'] !== $googleAccountEmail) {
        error_log('SECURITY ALERT: License ' . $licenseKey . ' attempted by ' . $googleAccountEmail . ' but bound to ' . $user['google_account_email']);
        return [
            'success' => false,
            'error' => 'License key is registered to a different Google account',
            'error_code' => 'GOOGLE_ACCOUNT_MISMATCH',
            'bound_to' => $user['google_account_email']
        ];
    }
}
```

### 2. PHP Gateway (`api_gateway.php`)

**Modified**: `handleUserAction($action, $payload, $license)`

- Extracts `googleAccountEmail` from payload
- Passes to `UserHandler::verifyLicenseKey()` and `UserHandler::getUserInfo()`

```php
$googleAccountEmail = $payload['googleAccountEmail'] ?? null;
return UserHandler::verifyLicenseKey($payload['licenseKey'] ?? $license, $googleAccountEmail);
```

### 3. Apps Script (`UI_Settings.gs`)

**Modified**: `saveLicenseKey(licenseKey)`

- Gets Google account: `Session.getActiveUser().getEmail()`
- Sends to server: `{licenseKey: key, googleAccountEmail: email}`
- Handles mismatch error with detailed user-friendly message
- Shows binding confirmation in success message

**Modified**: `getUserSettings()`

- Gets Google account on every load
- Sends with every request for validation
- Detects mismatch and removes license key
- Shows security error in UI

### 4. UI Security Warning

New visual alert shown when Google account mismatch detected:

```
🔒 SECURITY ERROR: License Key Mismatch
This license is registered to: original@gmail.com
You are logged in as: different@gmail.com

⚠️ Each license key can only be used by ONE Google account.

What to do:
• Log in with the correct Google account
• Contact support@serpifai.com to transfer license
• Purchase a separate license for this account
```

---

## Deployment Steps

### Step 1: Deploy Database Migration ✅
```bash
# Run SQL in phpMyAdmin (see above)
# File: v6_saas/php_backend/database_migrations/add_google_account_binding.sql
```

### Step 2: Upload PHP Files 🚀
```bash
# Upload to Hostinger via cPanel File Manager:
# 1. handlers/user_handler.php (updated validation)
# 2. api_gateway.php (updated parameter passing)
```

### Step 3: Deploy Apps Script 📝
```bash
# Copy updated code to Apps Script Editor:
# 1. UI_Settings.gs (updated getUserSettings and saveLicenseKey)
```

### Step 4: Test Security 🧪

**Test Case 1: New License Activation**
1. Log in as: `user1@gmail.com`
2. Enter license key: `SERP-FAI-TEST-KEY-123456`
3. Expected: ✅ Success, license bound to `user1@gmail.com`

**Test Case 2: Same Account Re-Login**
1. Close and reopen Settings
2. Expected: ✅ Shows account info immediately

**Test Case 3: Different Account Attempt**
1. Log out from Google account
2. Log in as: `user2@gmail.com`
3. Try to enter same license key
4. Expected: ❌ Error: "License key is registered to a different Google account"

**Test Case 4: Different Account Opens Settings**
1. Log in as: `user2@gmail.com`
2. Open Settings (if previous session had license key saved)
3. Expected: ❌ Security error shown, license key removed

---

## Security Benefits

### ✅ Prevents License Sharing
- One license = One Google account (permanent binding)
- Cannot use same license from multiple accounts
- Enforced at server level (cannot be bypassed)

### ✅ Audit Trail
- Every mismatch attempt logged to PHP error log
- Format: `SECURITY ALERT: License X attempted by Y but bound to Z`
- Can track unauthorized access attempts

### ✅ User-Friendly Errors
- Clear explanation of what went wrong
- Actionable solutions provided
- Contact information for support

### ✅ Graceful Degradation
- If Google account email not available → Shows generic error
- If server unreachable → Shows connection error
- No crashes or undefined behavior

---

## Admin Override (Optional)

To transfer a license key to a different Google account:

```sql
-- Option 1: Transfer to new Google account
UPDATE users 
SET google_account_email = 'new@gmail.com' 
WHERE license_key = 'SERP-FAI-XXXX-XXXX';

-- Option 2: Unbind (allow re-binding)
UPDATE users 
SET google_account_email = NULL 
WHERE license_key = 'SERP-FAI-XXXX-XXXX';
```

**When to use:**
- User legitimately changed Google accounts
- Accidental activation from wrong account
- Account migration scenarios

**Security**: Only admins with database access can perform transfers.

---

## Testing Checklist

- [ ] SQL migration executed successfully
- [ ] `google_account_email` column exists in users table
- [ ] Index `idx_google_account` created
- [ ] PHP files uploaded to Hostinger
- [ ] Apps Script code deployed
- [ ] Test Case 1: New activation works
- [ ] Test Case 2: Same account re-login works
- [ ] Test Case 3: Different account activation blocked
- [ ] Test Case 4: Different account auto-logout works
- [ ] Security errors show user-friendly messages
- [ ] Mismatch attempts logged to PHP error log

---

## Error Codes

| Code | Meaning | User Action |
|------|---------|-------------|
| `GOOGLE_ACCOUNT_MISMATCH` | License bound to different Google account | Log in with correct account or contact support |
| `Invalid or inactive license key` | License key not found or status ≠ 'active' | Check license key or contact support |
| `Database error` | MySQL connection failed | Contact support - server issue |

---

## Support Scenarios

### User: "I can't use my license key from my new Google account"

**Response:**
> Your license key is bound to your original Google account for security. To transfer your license to your new account:
> 1. Email support@serpifai.com with:
>    - Your license key
>    - Original Google account email
>    - New Google account email
> 2. We'll transfer it within 24 hours

### User: "It says my license is registered to someone else"

**Response:**
> This is a security feature. Each license can only be used by ONE Google account. Possible reasons:
> 1. You're logged into the wrong Google account
> 2. Someone else is using your license key
> 3. You need to log in with the account you first activated the license with
>
> Check which Google account you're using, or contact support@serpifai.com

---

## Technical Notes

### Session.getActiveUser().getEmail()

**When it works:**
- User is logged into a Google account
- Apps Script has permission to access email
- Script is running in user context (not as web app)

**When it fails:**
- User not logged in (returns empty string)
- Anonymous mode (returns empty string)
- Permission denied (throws error)

**Fallback**: If cannot get email, show generic error and don't save license key.

### Performance Impact

- **Negligible**: One additional parameter in API call
- **Database**: Indexed lookup on `google_account_email` (O(log n))
- **Storage**: +255 bytes per user (VARCHAR(255))

### Backward Compatibility

- **Existing users**: `google_account_email` = NULL initially
- **First login after update**: Google account saved automatically
- **No data migration needed**: Binding happens on first use

---

## Monitoring

### PHP Error Log Location
`/home/u187453795/domains/serpifai.com/public_html/error_log`

### Log Format
```
[01-Dec-2025 12:34:56 UTC] SECURITY ALERT: License key SERP-FAI-TEST-KEY-123456 attempted by hacker@gmail.com but bound to legit@gmail.com
```

### Monitoring Commands (cPanel)
```bash
# View last 50 security alerts
tail -n 50 error_log | grep "SECURITY ALERT"

# Count mismatch attempts today
grep "SECURITY ALERT" error_log | grep "$(date +%d-%b-%Y)" | wc -l

# List all attempted mismatches
grep "SECURITY ALERT" error_log | awk '{print $NF}'
```

---

## Date: December 1, 2025
## Version: v6.0.1 (Security Update)
## Status: ✅ READY FOR DEPLOYMENT
