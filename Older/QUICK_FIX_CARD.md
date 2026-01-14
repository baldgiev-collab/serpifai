# ⚡ QUICK FIX REFERENCE - 3 Issues, 3 Solutions

## 🔴 ISSUE 1: PHP Returns 500 Error
```
Error: Response Code 500 with empty body
Missing: database.php, handlers/, apis/

FIX: Upload 3 directories to Hostinger
  → config/
  → handlers/
  → apis/

Then: Run TEST_PHPVersionDiagnostics()
```

## 🔴 ISSUE 2: Drive API Permission Denied
```
Error: Cannot call DriveApp - permission insufficient
Missing: OAuth scope for Drive API

FIX: Add this scope to Apps Script
  → https://www.googleapis.com/auth/drive

Then: Run TEST_CreateFolder()
```

## 🔴 ISSUE 3: No License Key
```
Error: No license key configured in Settings
Missing: License key in database

FIX: Add to MySQL database via Hostinger
  INSERT INTO users (email, license_key, status, credits, created_at)
  VALUES ('test@serpifai.com', 'SERP-FAI-TEST-KEY-123456', 'active', 1000, NOW());

Then: Run TEST_MySQLConnection()
```

---

## Quick Fix Checklist

- [ ] **Phase 1 (10 min):** Upload PHP files
  1. Get files from: `v6_saas/serpifai_php/`
  2. Upload to: Hostinger `/public_html/serpifai_php/`
  3. Set permissions: 644 (files), 755 (folders)
  4. Test: `TEST_PHPVersionDiagnostics()`

- [ ] **Phase 2 (5 min):** Add OAuth scope
  1. Open: Apps Script Project Settings
  2. Add: `https://www.googleapis.com/auth/drive`
  3. Re-authorize
  4. Test: `TEST_CreateFolder()`

- [ ] **Phase 3 (5 min):** Add License Key
  1. Hostinger MySQL: Insert test user
  2. Or: Settings → Add license key
  3. Test: `TEST_MySQLConnection()`

- [ ] **Phase 4 (2 min):** Verify All
  1. Run: `TEST_ComprehensiveDiagnostics()`
  2. Expected: All ✅

---

## Files to Upload (Copy these paths)

```
From Local:
- c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\config\
- c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\handlers\
- c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\apis\

To Hostinger:
- /public_html/serpifai_php/config/
- /public_html/serpifai_php/handlers/
- /public_html/serpifai_php/apis/
```

---

## Test Commands

Run in Apps Script Editor (execute in order):

```
1. TEST_PHPVersionDiagnostics()     → Check PHP setup
2. TEST_CheckPHPErrors()            → Check 500 error
3. TEST_CreateFolder()              → Check Drive permission
4. TEST_MySQLConnection()           → Check license key
5. TEST_ComprehensiveDiagnostics()  → Check everything
```

Success = All tests pass ✅

---

## Detailed Guides

- **HOSTINGER_UPLOAD_GUIDE.md** - Step by step file upload
- **THREE_CRITICAL_ISSUES_FIX.md** - Detailed fix for each issue
- **CRITICAL_ERROR_ANALYSIS.md** - Complete error breakdown

---

## File Structure

```
/public_html/serpifai_php/
├── api_gateway.php ✅ (exists)
├── .htaccess ✅ (exists)
├── health_check.php ⏳ (check)
├── config/
│   └── db_config.php ❌ UPLOAD THIS
├── handlers/
│   ├── user_handler.php ❌ UPLOAD THESE
│   ├── project_handler.php
│   ├── fetcher_handler.php
│   ├── content_handler.php
│   ├── competitor_handler.php
│   ├── sync_handler.php
│   └── workflow_handler.php
└── apis/
    ├── gemini_api.php ❌ UPLOAD THESE
    ├── serper_api.php
    ├── pagespeed_api.php
    └── openpagerank_api.php
```

---

## Expected After Fixes

| Test | Before | After |
|------|--------|-------|
| PHP Error | 500, empty | 200, JSON ✅ |
| Drive API | Permission denied | Folder created ✅ |
| MySQL | No user | User found ✅ |
| Overall | ❌ Blocked | ✅ Working |

---

Done? Then system is production-ready! 🚀
