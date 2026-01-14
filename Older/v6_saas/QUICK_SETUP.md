# ⚡ QUICK SETUP - 5 Minutes to Secure System

## 🎯 CRITICAL: Set Script Property First

### Option 1: Manual Setup (Recommended)

1. **Open Apps Script Editor:**
   - Open your Google Sheet
   - Extensions → Apps Script

2. **Configure Script Property:**
   - Click ⚙️ **Project Settings** (left sidebar)
   - Scroll to **Script Properties**
   - Click **+ Add script property**
   - Enter:
     - **Property:** `PHP_GATEWAY_URL`
     - **Value:** `https://serpifai.com/serpifai_php/api_gateway.php`
   - Click **Save script properties**

3. **Done!** Your system is now configured.

---

### Option 2: Script Setup (Alternative)

Run this function in Apps Script Editor:

```javascript
function SETUP_ConfigureGateway() {
  const scriptProps = PropertiesService.getScriptProperties();
  
  scriptProps.setProperty('PHP_GATEWAY_URL', 'https://serpifai.com/serpifai_php/api_gateway.php');
  
  Logger.log('✅ Gateway URL configured!');
  Logger.log('Gateway: ' + scriptProps.getProperty('PHP_GATEWAY_URL'));
  
  return 'Setup complete! Gateway configured.';
}
```

**To run:**
1. Apps Script Editor
2. Paste function above
3. Click Run ▶️
4. Check logs: View → Logs

---

## ✅ VERIFY SETUP

### Quick Test

Run this in Apps Script Editor:

```javascript
function TEST_QuickVerification() {
  Logger.log('=== QUICK VERIFICATION TEST ===\n');
  
  // 1. Check Script Property
  const scriptProps = PropertiesService.getScriptProperties();
  const gatewayUrl = scriptProps.getProperty('PHP_GATEWAY_URL');
  
  Logger.log('1. Gateway URL: ' + (gatewayUrl || '❌ NOT SET'));
  
  if (!gatewayUrl) {
    Logger.log('\n⚠️ SETUP REQUIRED: Set PHP_GATEWAY_URL in Script Properties');
    return 'Setup required';
  }
  
  // 2. Test MySQL Connection
  Logger.log('\n2. Testing MySQL connection...');
  try {
    const response = callGateway('verifyLicenseKey', { 
      licenseKey: 'SERP-FAI-TEST-KEY-123456' 
    });
    
    if (response && response.success) {
      Logger.log('✅ MySQL connection successful!');
      Logger.log('   User: ' + response.user.email);
      Logger.log('   Credits: ' + response.user.credits);
      Logger.log('   Status: ' + response.user.status);
    } else {
      Logger.log('❌ MySQL connection failed: ' + (response.error || 'Unknown error'));
    }
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
  }
  
  Logger.log('\n=== TEST COMPLETE ===');
  return 'Check logs above for results';
}
```

**Expected output:**
```
=== QUICK VERIFICATION TEST ===

1. Gateway URL: https://serpifai.com/serpifai_php/api_gateway.php

2. Testing MySQL connection...
📡 Calling gateway: https://serpifai.com/serpifai_php/api_gateway.php
🎯 Action: verifyLicenseKey
🔑 Has license key: true
📥 Response code: 200
📄 Response: {"success":true,"user":{...}}
✅ Gateway call successful
✅ MySQL connection successful!
   User: testuser@email.com
   Credits: 100
   Status: active

=== TEST COMPLETE ===
```

---

## 🚨 TROUBLESHOOTING

### "Gateway URL: ❌ NOT SET"

**Solution:** You haven't set the Script Property yet.
- Project Settings → Script Properties → Add:
  - Property: `PHP_GATEWAY_URL`
  - Value: `https://serpifai.com/serpifai_php/api_gateway.php`

### "MySQL connection failed"

**Possible causes:**

1. **PHP files not uploaded to Hostinger**
   - Upload all files in `serpifai_php/` folder
   - Path: `/public_html/serpifai_php/`

2. **Database not configured**
   - Create `users` table in MySQL
   - Add test user (see SECURE_DEPLOYMENT_GUIDE.md)

3. **Coming soon page blocking API**
   - Update `.htaccess` to allow API access
   - See SECURE_DEPLOYMENT_GUIDE.md for details

4. **Database credentials wrong**
   - Check `serpifai_php/database.php`
   - Verify MySQL username, password, database name

---

## 📋 DEPLOYMENT CHECKLIST

Before testing with users:

- [ ] Script Property `PHP_GATEWAY_URL` configured
- [ ] Apps Script deployed: ✅ (Already done with `clasp push`)
- [ ] PHP files uploaded to Hostinger
- [ ] MySQL `users` table created
- [ ] Test user added to MySQL
- [ ] `.htaccess` configured (if site is "coming soon")
- [ ] Quick verification test passes

---

## 🎯 NEXT STEPS

1. **Set Script Property** (2 minutes)
   - Project Settings → Script Properties → Add URL

2. **Test License Key Save** (1 minute)
   - Open Google Sheet
   - Click ⚙️ Settings
   - Enter: `SERP-FAI-TEST-KEY-123456`
   - Click Save
   - Should see: "✅ License key verified and activated!"

3. **Verify Security** (1 minute)
   - Try invalid key → Should reject
   - Try with server down → Should reject
   - Check execution logs show server validation

4. **Ready!** 🚀
   - System now requires server validation for everything
   - No offline mode possible
   - Credits enforced server-side

---

## 🔒 SECURITY CONFIRMED

Once setup complete, your system will:
✅ Require server validation for license keys
✅ Check credits before every operation
✅ Block usage with zero credits
✅ Auto-remove invalid license keys
✅ Prevent all offline bypass attempts

**Result:** Fully secure, server-validated system with zero trust architecture.

---

**Need help?** See full guide: `SECURE_DEPLOYMENT_GUIDE.md`
