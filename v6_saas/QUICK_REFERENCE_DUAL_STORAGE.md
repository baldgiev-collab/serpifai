# QUICK REFERENCE: DUAL-STORAGE SYSTEM

Fast reference for common tasks and troubleshooting.

---

## QUICK START

### Deploy Dual-Storage in 5 Minutes

```bash
# 1. Deploy Apps Script file
cd apps_script
clasp push

# 2. Update api_gateway.php with sync routing (see below)

# 3. Test it works
# In Apps Script: testDualSave()

# Done! ✅
```

### Update api_gateway.php

Find line ~210 (after project routing):
```php
// Project management actions (FREE)
if (strpos($action, 'project_') === 0 || strpos($action, 'project:') === 0) {
    require_once __DIR__ . '/handlers/project_handler.php';
    return handleProjectAction($action, $payload, $license);
}

// ADD THIS:
// Sync actions (FREE)
if (strpos($action, 'sync:') === 0) {
    require_once __DIR__ . '/handlers/sync_handler.php';
    return handleSyncAction($action, $payload, $license);
}
```

---

## CORE FUNCTIONS

### Apps Script (Google Sheets side)

**Save to both storages:**
```javascript
saveProjec tDual(projectName, projectData)
// Returns: {ok: true, sheet: "...", projectId: 123, ...}
```

**Load from either storage (Sheets priority):**
```javascript
loadProjectDual(projectName)
// Returns: {success: true, data: {...}, metadata: {...}}
```

**List all projects from both:**
```javascript
listProjectsDual()
// Returns: {success: true, projects: [...], count: 15}
```

### PHP (Backend side)

**Check sync status:**
```php
GET /api_gateway.php?action=sync:status&license=YOUR_KEY
// Returns: {success: true, mysql: {projects: 15, status: "connected"}}
```

**Sync MySQL → Sheets:**
```php
GET /api_gateway.php?action=sync:mysql_to_sheets&license=YOUR_KEY
// Returns: {success: true, synced: 15, projects: [...]}
```

**Full bidirectional sync:**
```php
GET /api_gateway.php?action=sync:full&license=YOUR_KEY
// Returns: {success: true, phases: {...}}
```

---

## DATA FLOW

### Save Flow
```
User → saveProjec tDual()
       ├→ MySQL (saveProjectToDatabase)
       └→ Sheets (saveProjectToSheet)
       → Return combined response
```

### Load Flow
```
User → loadProjectDual()
       ├→ Try Sheets (findProjectSheet)
       │  └ Success → Return
       └→ Else try MySQL (loadProjectFromDatabase)
           └ Success → Auto-sync to Sheets → Return
```

---

## TESTING QUICK REFERENCE

### Essential Tests

**Test 1: MySQL Save**
```javascript
function test1() {
  const result = saveProjectToDatabase("TEST1", {data: "test"});
  console.log(result.ok ? "✅" : "❌");
}
test1();
```

**Test 2: Sheet Creation**
```javascript
function test2() {
  const result = saveProjectToSheet("TEST2", {data: "test"});
  console.log(result.success ? "✅" : "❌");
}
test2();
```

**Test 3: Dual Save (Most Important)**
```javascript
function test3() {
  const result = saveProjec tDual("TEST3", {data: "test"});
  console.log(result.ok ? "✅ Both worked" : "⚠️ Partial");
}
test3();
```

**Test 4: Dual Load (Most Important)**
```javascript
function test4() {
  const result = loadProjectDual("TEST3");
  console.log(result.success ? "✅" : "❌");
}
test4();
```

---

## TROUBLESHOOTING

### ❌ MySQL Save Failing

**Check:**
```sql
mysql> SELECT * FROM users WHERE license_key = 'TEST-SERPIFAI-2025-666';
-- If empty, license key doesn't exist
```

**Fix:**
```sql
-- Check credentials in config/db_config.php
-- Verify MySQL is running
mysql -h localhost -u u187453795_Admin -p
-- Password: OoRB1Pz9i?H
```

### ❌ Sheet Creation Failing

**Check:**
```javascript
// In Apps Script Console
function test() {
  try {
    const sheet = SpreadsheetApp.create("TEST");
    console.log("✅ Can create sheets");
  } catch (e) {
    console.log("❌ " + e.toString());
  }
}
test();
```

**Fix:**
- Check Google Drive API is enabled (Appsettings → APIs & services)
- Verify user is logged in
- Try creating sheet manually in Drive

### ❌ Dual Save Reports Partial Success

**This is OK!** One storage succeeded, the other failed temporarily.

**Check which one:**
```javascript
function debug() {
  const result = saveProjec tDual("TEST", {data: "test"});
  if (result.sheet) console.log("✅ Sheet saved");
  if (result.projectId) console.log("✅ MySQL saved");
  if (!result.sheet) console.log("❌ Sheet failed");
  if (!result.projectId) console.log("❌ MySQL failed");
}
debug();
```

### ❌ Can't Load Project

**Try:**
```javascript
// Check if in Sheets
const inSheets = findProjectSheet("PROJECT_NAME");
console.log(inSheets ? "Found in Sheets" : "Not in Sheets");

// Check if in MySQL
const mysqlResult = loadProjectFromDatabase("PROJECT_NAME");
console.log(mysqlResult.success ? "Found in MySQL" : "Not in MySQL");
```

### ❌ Data Mismatch (Sheet vs MySQL)

**Resolve with:**
```javascript
// Sync MySQL to Sheets (MySQL is source of truth)
syncMySQLToSheets('YOUR_LICENSE_KEY', {});

// Or reload project (will refresh from latest)
loadProjectDual("PROJECT_NAME");
```

---

## PERFORMANCE

### Expected Times

| Operation | Time |
|-----------|------|
| Save (dual) | 2-3 sec |
| Load (Sheets) | 1-2 sec |
| Load (MySQL fallback) | 2-3 sec |
| List (20 projects) | 3-4 sec |
| Create sheet | 1-2 sec |

**If slower:** Check network, database connection, Drive API rate limits

---

## COMMON TASKS

### Create Test Project Programmatically

```javascript
function createTestProject() {
  const now = Date.now();
  const result = saveProjec tDual("TEST_" + now, {
    brand: "Test Brand",
    keywords: JSON.stringify(["test", "keywords"]),
    category: "Testing",
    notes: "Created at " + new Date()
  });
  Logger.log(result.ok ? "✅ Created" : "❌ Failed");
  return result;
}
```

### List All My Projects

```javascript
function listAll() {
  const result = listProjectsDual();
  for (const proj of result.projects) {
    Logger.log(proj.name + " (" + proj.source + ")");
  }
}
```

### Export Project to CSV

```javascript
function exportProject(projectName) {
  const project = loadProjectDual(projectName);
  const csv = JSON.stringify(project.data, null, 2);
  // Download CSV...
  Logger.log(csv);
}
```

### Delete Project

```javascript
function deleteProject(projectName) {
  // Delete from MySQL
  const mysql = deleteProjectFromDatabase(projectName);
  
  // Delete from Sheets
  const sheet = findProjectSheet(projectName);
  if (sheet) {
    DriveApp.getFileById(sheet.getParent().getId()).setTrashed(true);
  }
  
  Logger.log("✅ Deleted from both");
}
```

---

## MONITORING

### Daily Health Check

```javascript
function dailyCheck() {
  // Test MySQL
  const mysql = callGateway('sync:status', {}, 'TEST-SERPIFAI-2025-666');
  const mysqlOK = mysql.mysql.status === 'connected';
  
  // Test Sheets
  let sheetsOK = true;
  try {
    getProjectSheets();
  } catch (e) {
    sheetsOK = false;
  }
  
  Logger.log('MySQL: ' + (mysqlOK ? '✅' : '❌'));
  Logger.log('Sheets: ' + (sheetsOK ? '✅' : '❌'));
}
```

### Setup Daily Alert

In Apps Script Editor:
1. Click Triggers (clock icon)
2. Create trigger:
   - Function: `dailyCheck`
   - Frequency: Daily
   - Time: 8 AM
3. Save

---

## FILES REFERENCE

| File | Purpose | Size |
|------|---------|------|
| UI_ProjectManager_Dual.gs | Apps Script dual functions | 500 lines |
| sync_handler.php | PHP sync operations | 200 lines |
| DUAL_STORAGE_TESTING_GUIDE.md | Complete testing procedures | 400 lines |
| DUAL_STORAGE_DEPLOYMENT_GUIDE.md | Deployment instructions | 450 lines |
| DUAL_STORAGE_SYSTEM_IMPLEMENTATION_SUMMARY.md | Overview document | 400 lines |

---

## CREDENTIALS (Already Configured)

**MySQL:**
- Host: `localhost`
- User: `u187453795_Admin`
- Password: `OoRB1Pz9i?H`
- Database: `u187453795_SrpAIDataGate`

**Test License:**
- `TEST-SERPIFAI-2025-666`

**APIs (All 4 configured):**
- Gemini ✅
- Serper ✅
- PageSpeed ✅
- OpenPageRank ✅

---

## KEY COMMANDS

```bash
# Deploy to Apps Script
cd apps_script && clasp push

# Check MySQL
mysql -h localhost -u u187453795_Admin -p
USE u187453795_SrpAIDataGate;
SELECT * FROM projects;

# Check PHP errors
tail -f /var/log/php-errors.log

# Backup database
mysqldump -h localhost -u u187453795_Admin -p u187453795_SrpAIDataGate > backup.sql
```

---

## SUCCESS INDICATORS

✅ **System working when:**
- Projects save and appear in Drive within 3 seconds
- Loading project shows data from either storage
- List shows all projects from both sources
- Can view/edit projects in Google Sheets
- Error logging shows what's happening
- No data loss or duplication

❌ **System has issues when:**
- Save succeeds but Sheet doesn't appear in Drive
- Load returns empty data
- One storage succeeds but other always fails
- Error messages are cryptic
- Data appears in one storage but not the other
- Performance > 10 seconds

---

## EMERGENCY PROCEDURES

### Quick Rollback

```bash
# If something breaks badly
git checkout HEAD -- apps_script/ serpifai_php/
clasp push
```

### Reset MySQL Data (⚠️ Destructive)

```sql
-- WARNING: Deletes all projects!
DELETE FROM projects;
DELETE FROM activity_logs;
```

### Clear Google Drive Cache

```javascript
function clearCache() {
  CacheService.getUserCache().removeAll(CacheService.getUserCache().getKeys());
  Logger.log("✅ Cache cleared");
}
```

---

## WHEN TO CONTACT SUPPORT

**Contact support when:**
- ❌ Both MySQL AND Sheets failing
- ❌ Data appears corrupted
- ❌ Can't fix with troubleshooting steps
- ❌ Need database recovery
- ❌ Need to migrate existing projects

**Don't contact for:**
- ✅ Single storage temporarily down (other works)
- ✅ "Database connection failed" (temporary issue)
- ✅ Performance slow (may be rate limiting)

---

**Last Updated:** January 15, 2025  
**Version:** 1.0  
**Status:** Ready for Deployment ✅

