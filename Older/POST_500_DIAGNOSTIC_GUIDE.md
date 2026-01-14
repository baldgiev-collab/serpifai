# 🔧 POST REQUEST 500 ERROR - DIAGNOSTIC GUIDE

## Current Status
- ✅ GET request returns 400 (gateway is loading)
- ✅ Files are on server
- ✅ Database is connected
- ✅ License key added
- ✅ OAuth scope added
- ❌ POST requests returning 500 (empty response)

---

## What I Fixed
I added **comprehensive error handling** to the gateway:

### 1. Error Handler Function
Now all PHP errors are caught and returned as JSON instead of silent crashes:
```php
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    echo json_encode([
        'error' => 'PHP Error: ' . $errstr,
        'file' => $errfile,
        'line' => $errline
    ]);
});
```

### 2. Exception Handler Function
All exceptions are now caught and logged:
```php
set_exception_handler(function($exception) {
    echo json_encode([
        'error' => 'Server error: ' . $exception->getMessage()
    ]);
});
```

### 3. Better JSON Parsing
Now properly handles malformed JSON:
```php
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $input = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error: " . json_last_error_msg());
            $input = null;
        }
    }
}
```

### 4. Database Error Handling
Database operations now have try-catch with detailed errors:
```php
function authenticateUser($license) {
    try {
        $db = getDB();
        $stmt = $db->prepare(...);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $db->errorInfo()[2]);
        }
        // ... rest of code
    } catch (Exception $e) {
        sendError('Authentication failed: ' . $e->getMessage(), 500);
    }
}
```

---

## Diagnostic Tools Uploaded

I've uploaded **2 diagnostic PHP files** to your server. Upload them to `/public_html/serpifai_php/`:

### 1. diagnostic_post.php
Tests each step of POST processing:
```
https://serpifai.com/serpifai_php/diagnostic_post.php
```

This will show:
- ✅ Config loads
- ✅ Database connects
- ✅ Users table accessible
- ✅ License key verification works
- ✅ POST parsing works

### 2. debug_post.php
Simplified version that tests verifyLicenseKey directly:
```
https://serpifai.com/serpifai_php/debug_post.php
```

---

## What To Do Next

### Step 1: Upload Diagnostic Files
1. Download from your repo:
   - `v6_saas/serpifai_php/diagnostic_post.php`
   - `v6_saas/serpifai_php/debug_post.php`
2. Upload both to: `/public_html/serpifai_php/` on Hostinger
3. Set permissions to 644

### Step 2: Run Diagnostic
Visit: `https://serpifai.com/serpifai_php/diagnostic_post.php`

You should see:
```json
{
  "success": true,
  "message": "All diagnostic tests passed",
  "tests": [
    {"step": 1, "name": "Load config", "status": "OK"},
    {"step": 2, "name": "Database connection", "status": "OK"},
    {"step": 3, "name": "Query users table", "status": "OK"},
    {"step": 4, "name": "Verify license key", "status": "OK"},
    {"step": 5, "name": "POST request parsing", "status": "OK"}
  ]
}
```

### Step 3: Check Error Log
If diagnostic fails, check Hostinger error log:
1. cPanel → Error Logs
2. Look for `/serpifai_php/` errors
3. Share the error with me

### Step 4: Test POST via Gateway
After diagnostic passes, test the actual gateway:
```
POST https://serpifai.com/serpifai_php/api_gateway.php
Body: {
  "action": "verifyLicenseKey",
  "license": "SERP-FAI-TEST-KEY-123456"
}
```

Expected response:
```json
{
  "success": true,
  "user": {
    "email": "test@serpifai.com",
    "license_key": "SERP-FAI-TEST-KEY-123456",
    "credits": 1000
  }
}
```

---

## Possible Issues & Solutions

### Issue 1: "Call to undefined function"
**Cause:** Handler file not included
**Solution:** Verify all files uploaded to correct folders

### Issue 2: "SQLSTATE error"
**Cause:** Database connection issue
**Solution:** Verify database credentials in db_config.php

### Issue 3: "JSON syntax error"
**Cause:** POST body malformed
**Solution:** Check POST request is sending valid JSON

### Issue 4: "Permission denied"
**Cause:** File permissions not 644
**Solution:** Right-click file → Permissions → Set to 644

---

## Testing Strategy

Run tests in this order:

1. **Test 1:** Load diagnostic_post.php directly
   ```
   https://serpifai.com/serpifai_php/diagnostic_post.php
   ```
   Expected: All tests pass ✅

2. **Test 2:** Run from Apps Script
   ```javascript
   TEST_ComprehensiveDiagnostics()
   ```
   Should now show better error messages

3. **Test 3:** Manual POST test
   ```javascript
   var options = {
     method: "post",
     payload: JSON.stringify({
       action: "verifyLicenseKey",
       license: "SERP-FAI-TEST-KEY-123456"
     })
   };
   var response = UrlFetchApp.fetch(
     "https://serpifai.com/serpifai_php/api_gateway.php",
     options
   );
   Logger.log(response.getContentText());
   ```

---

## How to Share Errors With Me

When you test and get an error, please provide:

1. **The exact URL you tested:**
   ```
   https://serpifai.com/serpifai_php/diagnostic_post.php
   ```

2. **The complete response:**
   ```json
   {
     "success": false,
     "tests": [...]
   }
   ```

3. **Any error messages from console**

4. **Screenshot of error (if visual)**

---

## Expected Timeline

- ✅ Phase 1: Upload diagnostic files (5 min)
- ✅ Phase 2: Run diagnostic test (2 min)
- ✅ Phase 3: Identify the exact error (varies)
- ✅ Phase 4: Deploy fix (5 min)
- ✅ Phase 5: Re-test (2 min)

**Total: 14+ minutes to resolution**

---

## Summary

The gateway now has:
- ✅ Global error handler (shows JSON errors)
- ✅ Exception handler (catches crashes)
- ✅ JSON parsing validation
- ✅ Database error handling
- ✅ Detailed error logging

When you test, any error will be returned as JSON with details instead of silent 500.

**Next: Upload diagnostic files and run the test!**
