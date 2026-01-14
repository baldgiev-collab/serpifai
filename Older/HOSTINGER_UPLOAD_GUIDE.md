# HOSTINGER UPLOAD GUIDE - Required PHP Files

## 🚨 CRITICAL: Files Missing on Server

The diagnostics show these files are missing on the server:
- ❌ database.php (or database connection file)
- ❌ config.php (or configuration file)

**What we have locally:**
```
v6_saas/serpifai_php/
├── api_gateway.php ✅ (exists on server)
├── config/
│   └── db_config.php ✅ (need to check if on server)
├── database/
│   └── schema.sql ✅ (database structure)
├── handlers/ ✅ (need to check)
├── apis/ ✅ (need to check)
├── .htaccess ✅ (need to verify)
└── health_check.php ✅ (need to check)
```

---

## Step 1: Identify What's Missing on Server

### Test Current Server State:
Run this in Apps Script to see what exists:
```javascript
TEST_PHPVersionDiagnostics()
```

**Current Result (from logs):**
```
Files in /serpifai_php/ directory:
   [No files found - check permissions]
```

This means the directory scan isn't working, but we know `api_gateway.php` is accessible (it returns 500).

---

## Step 2: What Needs to be Uploaded

### Critical Files (MUST UPLOAD):

1. **config/db_config.php** → Upload to: `/public_html/serpifai_php/config/db_config.php`
   - Contains: MySQL connection credentials
   - File location: `c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\config\db_config.php`

2. **api_gateway.php** → Already on server ✅
   - Location: `/public_html/serpifai_php/api_gateway.php`

3. **health_check.php** → Upload to: `/public_html/serpifai_php/health_check.php`
   - Location: `c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\health_check.php`

### Handler Files (Should Upload):

Upload entire `handlers/` directory:
```
handlers/
├── user_handler.php
├── project_handler.php
├── fetcher_handler.php
├── content_handler.php
├── competitor_handler.php
├── sync_handler.php
├── workflow_handler.php
└── project_cache_sync.php
```

### API Files (Should Upload):

Upload entire `apis/` directory:
```
apis/
├── gemini_api.php
├── serper_api.php
├── pagespeed_api.php
└── openpagerank_api.php
```

---

## Step 3: How to Upload to Hostinger

### Method 1: File Manager (Easiest)

1. Go to: https://hpanel.hostinger.com/
2. Click: File Manager
3. Navigate to: `/public_html/serpifai_php/`
4. Click: Upload button
5. Upload files:

**First, create the directories:**
```
Right-click → Create Folder → name it "config"
Right-click → Create Folder → name it "handlers"
Right-click → Create Folder → name it "apis"
```

**Then upload files into each:**
- Upload `db_config.php` into `config/` folder
- Upload handler files into `handlers/` folder
- Upload API files into `apis/` folder
- Upload `health_check.php` into root serpifai_php folder

### Method 2: FTP (If Easier)

Use: FileZilla or WinSCP
- Host: serpifai.com
- Username: u187453795
- Password: (from Hostinger)
- Port: 22 (SFTP) or 21 (FTP)

Upload directory structure to: `/public_html/serpifai_php/`

### Method 3: SSH (Command Line)

```bash
# SSH to Hostinger
ssh u187453795@serpifai.com

# Navigate to directory
cd /public_html/serpifai_php

# Upload files using scp
scp -r handlers/ user@serpifai.com:/public_html/serpifai_php/
scp -r apis/ user@serpifai.com:/public_html/serpifai_php/
scp -r config/ user@serpifai.com:/public_html/serpifai_php/
scp health_check.php user@serpifai.com:/public_html/serpifai_php/
```

---

## Step 4: Verify Upload Success

After uploading, test in Apps Script:

```javascript
// Test 1: Check PHP diagnostics
TEST_PHPVersionDiagnostics()
// Expected: Should see files in directory list

// Test 2: Check error details
TEST_CheckPHPErrors()
// Expected: Response code 200 (not 500)

// Test 3: Run comprehensive test
TEST_ComprehensiveDiagnostics()
// Expected: Gateway Responding: ✅
```

---

## Step 5: File Permissions

After uploading, ensure correct permissions:

```
Files:    644 (rw-r--r--)
Folders:  755 (rwxr-xr-x)
```

**In Hostinger File Manager:**
1. Right-click file → Properties
2. Set permissions to 644
3. Right-click folder → Properties
4. Set permissions to 755

---

## Checklist

### Upload Phase:
- [ ] Create `config/` folder
- [ ] Create `handlers/` folder
- [ ] Create `apis/` folder
- [ ] Upload `config/db_config.php`
- [ ] Upload all files in `handlers/`
- [ ] Upload all files in `apis/`
- [ ] Upload `health_check.php`

### Permissions Phase:
- [ ] Set files to 644
- [ ] Set folders to 755

### Verification Phase:
- [ ] Run `TEST_PHPVersionDiagnostics()`
- [ ] Run `TEST_CheckPHPErrors()`
- [ ] Run `TEST_ComprehensiveDiagnostics()`
- [ ] Check: Response Code 200 ✅

### Testing Phase:
- [ ] Run `TEST_MySQLConnection()`
- [ ] Run `TEST_QuickVerification()`
- [ ] All tests passing ✅

---

## Files Breakdown

### config/db_config.php
**Contains:** MySQL database connection settings
**Size:** Small (~200 bytes)
**Must-Have:** YES - Without this, PHP cannot connect to MySQL
**Local Path:** `c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\config\db_config.php`

### health_check.php
**Contains:** System health diagnostics
**Size:** Medium (~1KB)
**Must-Have:** OPTIONAL but recommended for debugging
**Local Path:** `c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\health_check.php`

### handlers/
**Contains:** Business logic for user, project, sync, etc.
**Files:** 8 files total
**Must-Have:** YES - Required for API functionality
**Local Path:** `c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\handlers/`

### apis/
**Contains:** External API integrations (Gemini, Serper, etc.)
**Files:** 4 files total
**Must-Have:** YES - Required for API calls
**Local Path:** `c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\apis/`

---

## Why 500 Error Happens Without These Files

```
api_gateway.php receives request
  ↓
Tries to include handlers
  ↓
Handler files not found ❌
  ↓
PHP throws error
  ↓
Error not displayed (display_errors = 0)
  ↓
Returns empty 500 response ❌
```

Once files are uploaded:
```
api_gateway.php receives request
  ↓
Includes handlers ✅
  ↓
Connects to MySQL ✅
  ↓
Processes request ✅
  ↓
Returns JSON response ✅
```

---

## After Upload - What to Expect

### Working System Symptoms:
- ✅ TEST_PHPVersionDiagnostics() returns 200
- ✅ Files listed in directory
- ✅ TEST_CheckPHPErrors() shows valid JSON
- ✅ MySQL connection successful
- ✅ License key verification working

### Broken System Symptoms:
- ❌ 500 error with empty response
- ❌ No files in directory
- ❌ "Cannot parse JSON" errors

---

## Next: After Files are Uploaded

1. Run diagnostics to verify upload
2. Add Google Drive OAuth scope (separate issue)
3. Add test license key to MySQL database
4. Test project save workflow

See: `CRITICAL_ERROR_ANALYSIS.md` for complete action plan.
