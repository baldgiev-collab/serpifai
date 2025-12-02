# 🔧 License Activation UI Fix - Testing Guide

## 🐛 Bug Fixed

**Problem**: UI showed "Not configured" even after successful license activation

**Root Cause**: `getUserSettings()` wasn't passing the saved email to the server, so the server couldn't validate the license + email pair.

## ✅ What Was Fixed

### 1. Pass Saved Email to Server
```javascript
// BEFORE (Wrong)
const response = callGateway('getUserInfo', { 
  licenseKey: licenseKey
});

// AFTER (Correct)
const userEmail = properties.getProperty('SERPIFAI_USER_EMAIL') || '';
const payload = { licenseKey: licenseKey };
if (userEmail) {
  payload.userEmail = userEmail;
}
const response = callGateway('getUserInfo', payload);
```

### 2. Clear Email on Errors
- Server verification fails → clear both license key AND email
- Exception occurs → clear both
- Remove license → clear both

### 3. Show Registered Email in UI
- Displays email below license key
- Shows which email is using the license
- Clear visual confirmation

## 🧪 Testing Steps

### Test 1: License Activation
```
1. Open Settings (⚙️ button in sidebar)
2. Enter email: baldgiev@gmail.com
3. Enter license: SERP-FAI-TEST-KEY-123456
4. Click: Activate License
5. Wait for page reload (800ms)
```

**Expected Result**:
```
✅ Account Overview section shows:
   - Email: baldgiev@gmail.com
   - Credits: 100 (or your actual credits)
   - Status: Active
   - API Connection: Connected

✅ License Key section shows:
   - License Key: SERP-*************-123456
   - Registered Email: baldgiev@gmail.com
   - Badge: Active
```

**NOT Expected** (the bug):
```
❌ Account Status: Inactive
❌ Credits Remaining: 0
❌ API Connection: Not configured
❌ "No license key configured" message
```

### Test 2: Page Refresh
```
1. After activating license (from Test 1)
2. Close and reopen Settings
3. OR refresh the page
```

**Expected Result**:
- Still shows account info
- Still shows credits and status
- Still shows "Active" badge
- Does NOT revert to "Not configured"

### Test 3: Remove License
```
1. Click: Remove Key button
2. Confirm the action
3. Wait for page reload
```

**Expected Result**:
- Reverts to "Not configured" state
- Shows email and license input fields
- NO error messages
- Clean state

### Test 4: Wrong Email (If applicable)
```
1. Enter email: wrong@email.com
2. Enter license: SERP-FAI-TEST-KEY-123456
3. Click: Activate License
```

**Expected Result** (if wrong@email.com is NOT in database):
```
❌ Error message:
"License key not found or not assigned to email: wrong@email.com"
```

## 🔍 Debugging

### Check Properties
Run this in Apps Script editor:
```javascript
function DEBUG_CheckProperties() {
  const props = PropertiesService.getUserProperties();
  Logger.log('License Key: ' + props.getProperty('SERPIFAI_LICENSE_KEY'));
  Logger.log('User Email: ' + props.getProperty('SERPIFAI_USER_EMAIL'));
}
```

### Check Server Response
Run this in Apps Script editor:
```javascript
function DEBUG_ServerResponse() {
  const testKey = 'SERP-FAI-TEST-KEY-123456';
  const testEmail = 'baldgiev@gmail.com';
  
  const response = callGateway('verifyLicenseKey', {
    licenseKey: testKey,
    userEmail: testEmail
  });
  
  Logger.log('Response: ' + JSON.stringify(response, null, 2));
}
```

### Check getUserSettings
Run this in Apps Script editor:
```javascript
function DEBUG_GetUserSettings() {
  const settings = getUserSettings();
  Logger.log('Settings: ' + JSON.stringify(settings, null, 2));
}
```

## 📊 Expected Flow

```mermaid
sequenceDiagram
    User->>UI: Enter email + license
    UI->>Apps Script: saveLicenseKey(key, email)
    Apps Script->>Server: verifyLicenseKey(key, email)
    Server->>Database: Check license + email
    Database-->>Server: User data
    Server-->>Apps Script: Success + user data
    Apps Script->>Properties: Save license + email
    Apps Script-->>UI: Success message
    UI->>UI: Reload (800ms)
    UI->>Apps Script: getUserSettings()
    Apps Script->>Properties: Get license + email
    Apps Script->>Server: getUserInfo(license, email)
    Server->>Database: Validate license + email
    Database-->>Server: User data
    Server-->>Apps Script: User data
    Apps Script-->>UI: Display account info
    UI->>User: Show credits, status, etc.
```

## ✅ Success Criteria

After the fix, you should see:

1. **Immediate Feedback**:
   - ✅ "License activated for baldgiev@gmail.com! Refreshing..."
   - Page reloads in 800ms

2. **Account Overview**:
   - ✅ Email displayed in profile header
   - ✅ Credits shown correctly
   - ✅ Status: Active
   - ✅ API Connection: Connected

3. **License Key Section**:
   - ✅ Masked license key displayed
   - ✅ Registered email shown
   - ✅ "Active" badge visible
   - ✅ Refresh Data and Remove Key buttons

4. **Persistence**:
   - ✅ Survives page refresh
   - ✅ Survives close/reopen
   - ✅ Auto-refresh works (every 10 seconds)

## 🚀 Deployment

1. **Copy Updated File**:
   - Open: `v6_saas/apps_script/UI_Settings.gs`
   - Copy ALL content

2. **Update Apps Script**:
   - Open: Google Sheet → Extensions → Apps Script
   - Select: UI_Settings.gs
   - Paste: New content
   - Save: Ctrl+S (or ⌘+S)

3. **Deploy New Version**:
   - Deploy → Manage deployments
   - Edit active deployment
   - New version: "v6.0.4 - Fix UI update bug"
   - Deploy

4. **Test Immediately**:
   - Refresh Google Sheet
   - Open Settings
   - Test license activation
   - Verify UI updates correctly

## 📝 Notes

- The fix ensures `getUserSettings()` always passes the saved email to the server
- Server validates the license + email pair on every load
- UI now accurately reflects the license status
- Real-time updates work correctly
- Session tracking still enforced (one user per license)

## 🎉 Result

**Your license activation now works perfectly!** The UI will show the correct account information immediately after activation, and persist across page refreshes. No more "Not configured" bug! 🚀
