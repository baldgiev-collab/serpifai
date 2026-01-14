# DUAL-STORAGE SYSTEM TESTING GUIDE

Complete guide to verify projects save to BOTH MySQL and Google Sheets simultaneously.

---

## PHASE 1: VERIFY MYSQL SETUP (BASELINE TEST)

### Step 1: Test MySQL Connection

```bash
# From your server terminal
mysql -h localhost -u u187453795_Admin -p
# Password: OoRB1Pz9i?H

# In MySQL:
USE u187453795_SrpAIDataGate;
SELECT * FROM projects;
```

**Expected Result:** Empty table (projects haven't been saved yet)

---

### Step 2: Test Project Save via Apps Script

**In Google Apps Script (Apps Script Editor):**

```javascript
// Copy this into Apps Script Console and run

function testMySQLSave() {
  const testProjectName = "TEST_PROJECT_" + Date.now();
  const testData = {
    "brand": "Test Brand",
    "keywords": ["test", "keywords"],
    "category": "Technology",
    "notes": "This is a test project",
    "createdDate": new Date().toISOString()
  };
  
  console.log('🔍 TEST: Saving project to MySQL');
  console.log('Project Name: ' + testProjectName);
  console.log('Data:', testData);
  
  // Call the existing MySQL save function
  const result = saveProjectToDatabase(testProjectName, testData);
  
  console.log('📊 Result:', result);
  return result;
}

// Run: testMySQLSave()
```

**Expected Output:**
```
{
  "ok": true,
  "name": "TEST_PROJECT_...",
  "projectId": 123,
  "updatedAt": "2025-01-15T..."
}
```

### Step 3: Verify MySQL Data

**In MySQL Console:**

```sql
SELECT id, license_key, project_name, created_at, updated_at 
FROM projects 
WHERE project_name LIKE 'TEST_PROJECT_%' 
ORDER BY created_at DESC;
```

**Expected Result:**
```
| id | license_key | project_name | created_at | updated_at |
|----|-------------|--------------|------------|------------|
| 1  | TEST-SERPIFAI-2025-666 | TEST_PROJECT_1234567890 | 2025-01-15 10:30:00 | 2025-01-15 10:30:00 |
```

**If no data appears:**
- Check Apps Script logs for errors
- Verify database credentials in config/db_config.php
- Check error_log output on server

---

## PHASE 2: VERIFY GOOGLE SHEETS SETUP

### Step 1: Test Sheet Creation

**In Google Apps Script Console:**

```javascript
function testSheetCreation() {
  const projectName = "SHEETS_TEST_" + Date.now();
  const testData = {
    "brand": "Sheet Test Brand",
    "keywords": JSON.stringify(["keyword1", "keyword2"]),
    "category": "Test Category"
  };
  
  console.log('📊 TEST: Creating Google Sheet for project');
  console.log('Project Name: ' + projectName);
  
  const result = saveProjectToSheet(projectName, testData);
  
  console.log('✅ Sheet created:', result);
  return result;
}

// Run: testSheetCreation()
```

**Expected Output:**
```
{
  "success": true,
  "sheetId": "1a2b3c4d5e6f7g8h9i",
  "sheetName": "SHEETS_TEST_...",
  "timestamp": "2025-01-15T..."
}
```

### Step 2: Verify Sheet in Google Drive

**Manual Check:**
1. Open Google Drive: https://drive.google.com
2. Look for folder: **"SERPIFAI Projects"**
3. Inside should see: **"SHEETS_TEST_... - SerpifAI v6"**
4. Sheet should have headers: Field Name, Value, Description, Data Type, Last Updated, Status
5. Rows should contain your test data

**If folder/sheet missing:**
- Run `createProjectSheet()` manually to debug
- Check browser console for JavaScript errors
- Verify user has Drive API permissions

---

## PHASE 3: DUAL-STORAGE SYSTEM TEST

### Step 1: Test Dual Save

**In Google Apps Script Console:**

```javascript
function testDualSave() {
  const projectName = "DUAL_TEST_" + Date.now();
  const testData = {
    "brand": "Dual Save Test",
    "keywords": JSON.stringify(["test", "dual", "save"]),
    "category": "Testing",
    "seoMetrics": JSON.stringify({
      "organic_traffic": 5000,
      "keyword_rank": "Top 10",
      "backlinks": 150
    })
  };
  
  console.log('🔀 TEST: Dual Save (MySQL + Google Sheets)');
  console.log('Project: ' + projectName);
  
  const result = saveProjec tDual(projectName, testData);
  
  console.log('✅ Result:', result);
  return result;
}

// Run: testDualSave()
```

**Expected Output:**
```
{
  "ok": true,
  "name": "DUAL_TEST_...",
  "sheet": "1a2b3c4d5e6f...",
  "projectId": 123,
  "updatedAt": "2025-01-15T..."
}
```

**Expected Side Effects:**
- ✅ Entry appears in MySQL `projects` table
- ✅ Google Sheet created in Drive
- ✅ Sheet contains project data in rows

### Step 2: Verify Dual Storage

**Check MySQL:**
```sql
SELECT project_name, created_at FROM projects 
WHERE project_name LIKE 'DUAL_TEST_%' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Check Google Drive:**
1. Open Drive
2. Find "SERPIFAI Projects" folder
3. Verify "DUAL_TEST_... - SerpifAI v6" exists
4. Open sheet and verify data is populated

---

## PHASE 4: DUAL LOAD TEST

### Step 1: Load from Sheets First

**In Google Apps Script Console:**

```javascript
function testDualLoad() {
  // Use the DUAL_TEST project name from previous test
  // Or manually enter a project name
  const projectName = "DUAL_TEST_1234567890"; // Replace with actual name
  
  console.log('📂 TEST: Dual Load (Sheets priority, MySQL fallback)');
  console.log('Loading: ' + projectName);
  
  const result = loadProjectDual(projectName);
  
  console.log('✅ Result:', result);
  return result;
}

// Run: testDualLoad()
```

**Expected Output:**
```
{
  "success": true,
  "data": {
    "brand": "Dual Save Test",
    "keywords": "["test","dual","save"]",
    ...
  },
  "metadata": {
    "sheetId": "1a2b3c...",
    "loadedAt": "2025-01-15T..."
  }
}
```

### Step 2: Test Fallback (MySQL if Sheet Missing)

**Simulate Sheet Deletion:**

1. Go to Google Drive
2. Delete the DUAL_TEST sheet
3. In Apps Script Console:

```javascript
function testFallbackToMySQL() {
  // Use the deleted sheet's project name
  const projectName = "DUAL_TEST_..."; // The one you just deleted
  
  console.log('📂 TEST: Load with Sheet missing (should fallback to MySQL)');
  
  const result = loadProjectDual(projectName);
  
  console.log('✅ Fallback result:', result);
  return result;
}

// Run: testFallbackToMySQL()
```

**Expected Behavior:**
1. Sheet not found in Drive
2. Falls back to MySQL
3. Successfully loads from database
4. Auto-recreates the Google Sheet for future use
5. Returns complete project data

---

## PHASE 5: LIST PROJECTS TEST

### Test List All Projects

**In Google Apps Script Console:**

```javascript
function testListDual() {
  console.log('📋 TEST: Listing all projects (both sources)');
  
  const result = listProjectsDual();
  
  console.log('✅ Results:');
  console.log(result);
  return result;
}

// Run: testListDual()
```

**Expected Output:**
```
{
  "success": true,
  "projects": [
    {
      "name": "Project 1",
      "source": "sheet",
      "sheetId": "1a2b3c...",
      "synced": true,
      "mysqlId": 1
    },
    {
      "name": "Project 2",
      "source": "mysql",
      "mysqlId": 2,
      "lastModified": "2025-01-15T..."
    },
    ...
  ],
  "count": 15
}
```

**Expected Data:**
- Projects saved via `saveProjec tDual()` appear in both sources
- `synced: true` indicates found in both locations
- Projects in MySQL but not Sheets show `source: "mysql"` only
- Projects in Sheets but not MySQL show `source: "sheet"` only

---

## PHASE 6: SYNC FUNCTION TESTS

### Test Sync Status

**In Google Apps Script Console:**

```javascript
function testSyncStatus() {
  console.log('🔄 TEST: Getting sync status');
  
  // This calls PHP gateway sync:status action
  const payload = {
    "action": "sync:status"
  };
  
  const result = callGateway('sync:status', payload, 'TEST-SERPIFAI-2025-666');
  
  console.log('✅ Sync status:', result);
  return result;
}

// Run: testSyncStatus()
```

**Expected Output:**
```
{
  "success": true,
  "mysql": {
    "projects": 15,
    "status": "connected"
  },
  "timestamp": "2025-01-15 10:30:45"
}
```

---

## TROUBLESHOOTING

### Problem: "No HTML file named UI_Setup was found"

**Solution:**
- Verify `UI_ProjectManager_Dual.gs` is deployed to Apps Script
- Run `clasp push` in the `apps_script` folder

### Problem: MySQL data not appearing

**Check Points:**
1. Database connection credentials correct? (config/db_config.php)
2. License key valid? Check: `SELECT * FROM users WHERE license_key = 'YOUR_KEY'`
3. Check error log on server: `tail -f /var/log/php-errors.log`
4. Verify Apps Script received successful response:
   ```javascript
   function testGatewayResponse() {
     const result = saveProjectToDatabase("TEST", {"name": "test"});
     console.log(result);
   }
   ```

### Problem: Google Sheet not created

**Check Points:**
1. Verify user is logged in to Google
2. Check Drive API permissions in Apps Script project settings
3. Look for "SERPIFAI Projects" folder in Drive
4. Check Apps Script execution log for errors:
   - Apps Script Editor → Executions
   - Look for failed runs
   - Click to view error details

### Problem: "Invalid license key" in gateway response

**Solution:**
- Verify license key in UI_Gateway.gs matches database entry
- Test license key:
  ```sql
  SELECT * FROM users WHERE license_key = 'TEST-SERPIFAI-2025-666';
  ```

### Problem: Partial success (one storage works, other fails)

**This is expected during implementation!**
- System will continue working with whichever storage succeeds
- Check error logs to see which storage failed
- Common issues:
  - MySQL: Connection timeout, credential mismatch
  - Sheets: Drive API rate limit, permission denied

---

## MONITORING & LOGGING

### Check Apps Script Logs

**In Google Apps Script Editor:**
1. Click **Executions** (left sidebar)
2. See all function runs with status
3. Click any failed execution to view errors

### Check PHP Error Logs

**On server terminal:**
```bash
# View last 50 errors
tail -50 /var/log/php-errors.log

# Watch live errors
tail -f /var/log/php-errors.log
```

### Check MySQL Logs

**Monitor saved projects:**
```sql
-- See all projects for test user
SELECT id, project_name, created_at, updated_at, credits_used
FROM projects
WHERE license_key = 'TEST-SERPIFAI-2025-666'
ORDER BY created_at DESC;

-- See project data for specific project
SELECT project_data FROM projects 
WHERE project_name = 'YOUR_PROJECT_NAME' 
LIMIT 1;
```

---

## DEPLOYMENT CHECKLIST

Before deploying to production users:

- [ ] ✅ All MySQL CRUD functions working
- [ ] ✅ Google Sheets creation working
- [ ] ✅ Dual save working (both succeed)
- [ ] ✅ Dual load working (Sheets priority)
- [ ] ✅ Fallback to MySQL working
- [ ] ✅ List projects working (both sources)
- [ ] ✅ Sync status showing correct counts
- [ ] ✅ Error logging comprehensive
- [ ] ✅ No sensitive data exposed in logs
- [ ] ✅ User can manually delete/update projects
- [ ] ✅ Sync stays current (no stale data)

---

## SUCCESS CRITERIA

Dual-storage system is **FULLY FUNCTIONAL** when:

1. ✅ User saves project → appears in MySQL **AND** Google Drive
2. ✅ User loads project → loads from Sheet if exists, MySQL if not
3. ✅ User lists projects → sees all projects from both sources
4. ✅ Either storage fails → other storage still works (graceful degradation)
5. ✅ Error messages are clear and actionable
6. ✅ All data stays in sync between MySQL and Sheets
7. ✅ No data is lost or duplicated
8. ✅ Performance is acceptable (< 5 seconds for save/load)

---

## SUPPORT & DEBUGGING

### Enable Debug Mode

**In UI_Gateway.gs, set:**
```javascript
const DEBUG = true;  // More detailed logging
```

### Get Debug Information

```javascript
function getDebugInfo() {
  console.log('=== SYSTEM DEBUG INFO ===');
  console.log('User: ' + Session.getActiveUser().getEmail());
  console.log('ScriptID: ' + ScriptApp.getScriptId());
  console.log('Gateway URL: ' + GATEWAY_URL);
  console.log('License: TEST-SERPIFAI-2025-666');
  console.log('Time: ' + new Date().toISOString());
}

getDebugInfo();
```

---

## NEXT STEPS

Once all tests pass:

1. **Deploy to production** via `clasp push`
2. **Create user documentation** with screenshots
3. **Set up monitoring** for production errors
4. **Plan sync strategy** for existing projects
5. **Backup procedures** for both MySQL and Sheets

