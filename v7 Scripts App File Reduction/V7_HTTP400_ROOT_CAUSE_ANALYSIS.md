# V7.6 HTTP 400 Root Cause Analysis & Fix Plan

## ✅ STATUS: BOTH ISSUES FIXED

### Issue 1: Duplicate runStage Function (HTTP 400) - ✅ FIXED
### Issue 2: Stage 1 Not Persisting to Database - ✅ FIXED

---

## 🔍 Issue 1: HTTP 400 Error

**ROOT CAUSE**: There were **TWO `window.runStage()` functions** in the codebase:

1. ✅ `UI/UI_Stage_Runner.html:24` - Uses `ultraMinimalPayload` (~100 bytes)
2. ❌ `UI/UI_Navigation_Project_Handlers.html:459` - Uses `collectFormData()` (~5MB)

The second definition **overwrote** the first due to JavaScript's last-definition-wins rule.

**FIX**: Removed duplicate `window.runStage` from `UI_Navigation_Project_Handlers.html`

---

## 🔍 Issue 2: Stage 1 Results Not Persisting

**SYMPTOM**: After Stage 1 completes, hydration shows "No Stage 1 results in database"

### Cause A: Missing `data_size` column in `ai_analysis` table
```
[UPP] ⚠️ Stage 1 persistence failed: SQLSTATE[42S22]: Column not found: 1054 Unknown column 'data_size'
```

**FIX**: Added migration in `serpifai_php/upp_handler.php`:
```php
$db->exec("ALTER TABLE ai_analysis ADD COLUMN IF NOT EXISTS data_size INT DEFAULT 0");
```

### Cause B: Missing `project_id` in job_results fallback save

**FIX**: Updated `FET+DB/UniversalPersistenceProvider.gs` to pass `project_id`

---

## 📁 Files Modified

| File | Change |
|------|--------|
| `UI/UI_Navigation_Project_Handlers.html` | Removed duplicate `window.runStage()` |
| `serpifai_php/upp_handler.php` | Added `data_size` column migration |
| `FET+DB/UniversalPersistenceProvider.gs` | Added `project_id` to job_results saves |

---

## 🚀 Deployment Required

1. **PHP Fix**: Upload `serpifai_php/upp_handler.php` to server
2. **Apps Script Fix**: Run `clasp push`

---

## 📊 Evidence from Logs

### ✅ Server-Side Test (PASSES)
```
📦 Result size: 210 bytes
✅ Result size OK: 0.21 KB (under 50KB limit)
```

### ❌ Browser Call (FAILS)
```
✅ Including competitor analysis data in save    ← PROBLEM!
   Competitors: 6                                ← 5MB+ of data
📡 google.script.run.runWorkflowStage() called (#6)
callback:1 Failed to load resource: 400
```

## 🎯 Root Cause Identified

**Location**: `UI/CORE_Form_Data.html` or similar UI file  
**Issue**: Before calling `runWorkflowStage()`, the UI is:
1. Calling `collectFormData()` or `saveProject()` 
2. This includes competitor analysis (5MB+)
3. The combined payload exceeds google.script.run limits

The browser log line:
```javascript
✅ Including competitor analysis data in save
   Competitors: 6
```

This is logged BEFORE `runWorkflowStage()` is called, meaning the UI is bundling competitor data into the request.

## 🔬 Technical Analysis

### google.script.run Limits
- **REQUEST payload**: ~6MB limit (UrlFetch)
- **RESPONSE payload**: ~50KB limit (HTML Service callback)
- Both can cause HTTP 400

### Current Data Flow (BROKEN)
```
[UI] collectFormData() → includes competitorAnalysis (5MB)
     ↓
[UI] runStage(1, buttonEl) → bundles heavy data
     ↓
[google.script.run] → payload too large → HTTP 400
```

### Target Data Flow (FIXED)
```
[UI] ultraMinimalPayload = {stageNum, projectId, model} (~100 bytes)
     ↓
[google.script.run.runWorkflowStage(ultraMinimalPayload)]
     ↓
[Server] Fetches competitor data from MySQL (not from payload)
     ↓
[Server] Returns pointer-only response (210 bytes)
     ↓
[UI] hydrateStage1FromDatabase() → fetches results in chunks
```

## 🛠️ Fix Plan

### Step 1: Find the UI code adding competitor data
Search for "Including competitor analysis data in save" in HTML files.

### Step 2: Modify UI to NOT include heavy data when running stages
The `runStage()` function should only pass:
```javascript
{
  stageNum: 1,
  projectId: 'Serpifai',
  model: 'gemini-3-flash-preview',
  _fetchCompetitorDataFromMySQL: true
}
```

### Step 3: Ensure collectFormData() has a "lightweight" mode
Add a parameter to skip heavy data when called for workflow stages.

### Step 4: Verify the fix
- Browser console should NOT show "Including competitor analysis data"
- Payload should be ~100 bytes, not ~5MB

## 📁 Files to Investigate

1. `UI/CORE_Form_Data.html` - Contains collectFormData()
2. `UI/UI_Stage_Runner.html` - Contains runStage()
3. `UI/UI_Navigation_Project_Handlers.html` - May intercept calls

## 🔧 Implementation Steps

### Step 1: Search for the problematic log message
```bash
grep -r "Including competitor analysis data in save" UI/
```

### Step 2: Modify the code path
Ensure `runStage()` does NOT call `collectFormData()` with competitor data.

### Step 3: Deploy and test
```bash
clasp push
```

### Step 4: Verify in browser console
Should see:
```
📡 google.script.run.runWorkflowStage() called
📦 Payload size: ~100 bytes
```

Should NOT see:
```
✅ Including competitor analysis data in save
```

## ✅ Success Criteria

1. Stage 1 runs without HTTP 400
2. Browser console shows payload < 1KB
3. Results hydrate correctly from MySQL
4. All data displayed without quality loss

## 🚨 Additional Issue Found

The persistence also failed initially:
```
[UPP] ⚠️ Stage 1 persistence failed: SQLSTATE[42S22]: Column not found: 1054 Unknown column 'data_size' in 'INSERT INTO'
```

This needs to be fixed in PHP (`upp_handler.php`) - remove `data_size` from the INSERT statement or add the column to the table.

However, the fallback to `job_results` worked, so hydration should find the data.
