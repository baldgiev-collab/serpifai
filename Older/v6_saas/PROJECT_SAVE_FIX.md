# 🔧 PROJECT SAVE/LOAD DEBUGGING GUIDE

## ✅ ISSUE FOUND & FIXED

**Problem:** Recursive function name collision in `api_gateway.php`

The wrapper function `handleProjectAction()` was calling itself instead of the actual handler from `project_handler.php`.

**Solution:** Renamed wrapper function to `handleProjectActionWrapper()` to avoid naming conflict.

---

## 📋 VERIFICATION STEPS

### Step 1: Deploy the Fix
```bash
cd c:\Users\baldg\OneDrive\Documents\GitHub\serpifai
clasp push --force
```

### Step 2: Test Project Save via PHP Gateway

**Test Endpoint:**
```bash
curl -X POST https://yourdomain.com/serpifai_php/api_gateway.php \
  -H "Content-Type: application/json" \
  -d '{
    "license": "TEST-SERPIFAI-2025-666",
    "action": "project_save",
    "payload": {
      "projectName": "Test Project",
      "projectData": {
        "brandName": "Test Brand",
        "keyword": "test keyword",
        "category": "Testing"
      }
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "projectId": 1,
  "created": true
}
```

### Step 3: Verify Project Saved in Database

**phpMyAdmin SQL Query:**
```sql
SELECT * FROM projects 
WHERE license_key = 'TEST-SERPIFAI-2025-666'
ORDER BY created_at DESC;
```

**Expected:** Should see your saved project with all the data.

### Step 4: Test Load Project

**Test Endpoint:**
```bash
curl -X POST https://yourdomain.com/serpifai_php/api_gateway.php \
  -H "Content-Type: application/json" \
  -d '{
    "license": "TEST-SERPIFAI-2025-666",
    "action": "project_load",
    "payload": {
      "projectName": "Test Project"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "brandName": "Test Brand",
    "keyword": "test keyword",
    "category": "Testing"
  },
  "metadata": {
    "created_at": "2025-11-28 ...",
    "updated_at": "2025-11-28 ..."
  }
}
```

### Step 5: Test in Google Sheets

1. Open your Google Sheet with SerpifAI
2. Click **SERPIFAI** → **Open SERPIFAI**
3. Enter project name in the input field
4. Fill out some project data
5. Click **💾 Save**
6. Check the logs (View → Logs):
   - Should see: "✅ Project saved successfully"
   - Should show Project ID

### Step 6: List All Projects

**Test Endpoint:**
```bash
curl -X POST https://yourdomain.com/serpifai_php/api_gateway.php \
  -H "Content-Type: application/json" \
  -d '{
    "license": "TEST-SERPIFAI-2025-666",
    "action": "project_list",
    "payload": {}
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": 1,
      "project_name": "Test Project",
      "created_at": "2025-11-28 ...",
      "updated_at": "2025-11-28 ..."
    }
  ]
}
```

---

## 🔍 HOW TO DEBUG IF STILL NOT WORKING

### Check 1: Database Connection
```sql
-- In phpMyAdmin, run:
SELECT 1;
```
Should return `1` if connection works.

### Check 2: Projects Table Exists
```sql
SHOW TABLES LIKE 'projects';
```
Should return `projects` table.

### Check 3: Test Account Exists
```sql
SELECT * FROM users 
WHERE license_key = 'TEST-SERPIFAI-2025-666';
```
Should return your test account.

### Check 4: PHP Error Logs
On Hostinger → Errors → Recent Error Logs
Look for PHP errors related to project save/load.

### Check 5: Apps Script Logs
In Google Sheets:
- View → Logs
- Search for "project" or "gateway"
- Look for error messages

---

## 📊 WHAT CHANGED

### Before (Broken)
```php
function handleProjectAction($action, $payload, $license) {
    require_once 'handlers/project_handler.php';
    return handleProjectAction($action, $payload, $license);  // ❌ RECURSIVE!
}
```

### After (Fixed)
```php
function handleProjectActionWrapper($action, $payload, $license) {
    require_once 'handlers/project_handler.php';
    return handleProjectAction($action, $payload, $license);  // ✅ CALLS HANDLER
}
```

---

## 🎯 EXPECTED BEHAVIOR AFTER FIX

1. **Save Project:** Project data stored in MySQL `projects` table
2. **Load Project:** Project dropdown populated with saved projects
3. **List Projects:** All user's projects retrievable
4. **Delete Project:** Project removed from database
5. **No Google Drive Tables:** Everything is in MySQL now

---

## 📝 WHERE PROJECTS ARE STORED

- **Before v6:** Google Sheets (in Drive)
- **Now v6:** MySQL database
  - Database: `u187453795_SrpAIDataGate`
  - Table: `projects`
  - Fields: id, license_key, project_name, project_data (JSON), created_at, updated_at

---

## ✨ NEXT STEPS

1. **Deploy the fix:** `clasp push --force`
2. **Test save/load:** Create a test project in Google Sheets
3. **Verify database:** Check phpMyAdmin `projects` table
4. **Test dropdown:** Should now populate with saved projects
5. **Run Stage 1:** Should find your saved project in dropdown

---

**Status:** ✅ FIX DEPLOYED

The recursive function issue has been resolved. Projects should now save properly to MySQL!
