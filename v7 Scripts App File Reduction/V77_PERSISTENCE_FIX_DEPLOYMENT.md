# V7.7 Stage 1 Persistence Fix - Deployment Guide

## Root Cause Analysis

The "No Stage 1 results in database" error occurred because:

1. **Missing UNIQUE KEY**: The `ai_analysis` table had no UNIQUE KEY on `(project_id, analysis_type)`, so `ON DUPLICATE KEY UPDATE` never triggered - data was inserted but couldn't be found later.

2. **No fallback table**: Only `ai_analysis` was used, with no backup persistence.

3. **Incomplete logging**: Difficult to diagnose where persistence failed.

---

## Fixes Applied (Local Files)

### 1. PHP `serpifai_php/upp_handler.php`

**Function: `saveWorkflowStageResult` (lines 351-510)**
- ✅ Added UNIQUE KEY `uk_project_stage (project_id, analysis_type)` for proper upsert behavior
- ✅ Enhanced logging with `════` separators for easy log reading  
- ✅ Dual-table persistence: saves to BOTH `ai_analysis` AND `job_results` as backup
- ✅ Column migrations: auto-adds `project_id`, `analysis_json`, `analysis_text`, `data_size` columns
- ✅ Explicit error handling with rowCount checks

**Function: `getWorkflowStageResults` (lines 737-865)**
- ✅ Enhanced logging with visual separators
- ✅ Better error messages showing exactly what query parameters were used
- ✅ Fallback to `job_results` table if `ai_analysis` fails

### 2. Apps Script `FET+DB/UniversalPersistenceProvider.gs`

**Function: `UPP_saveToJobResults` (previously fixed)**
- ✅ Added `project_id` parameter to gateway call

---

## 🚨 CRITICAL: Deployment Steps

### Step 1: Upload PHP File to Server

The PHP changes are LOCAL only. You MUST upload the modified file to your server:

```bash
# From your local machine, upload to your server:
scp "c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v7 Scripts App File Reduction\serpifai_php\upp_handler.php" user@serpifai.com:/path/to/serpifai_php/

# OR use your preferred FTP/SFTP client to upload:
# Local: serpifai_php/upp_handler.php
# Remote: /var/www/serpifai.com/serpifai_php/upp_handler.php
```

### Step 2: Deploy Apps Script Changes

```bash
cd "c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v7 Scripts App File Reduction"
clasp push
```

### Step 3: Test Stage 1 Workflow

1. Open the SerpifAI sidebar
2. Select a project from the dropdown
3. Select a Gemini 3 model
4. Run Stage 1
5. Check the Apps Script execution logs for:
   - `💾 Stage 1 MySQL persistence: ✅ SUCCESS`
   - `Bytes written: X`
6. After completion, check PHP error logs for:
   - `[UPP] 💾 saveWorkflowStageResult called`
   - `[UPP] ✅ ai_analysis INSERT result: affected=X`
   - `[UPP] ✅ job_results BACKUP INSERT: affected=X`

---

## Verification Queries (MySQL)

After running Stage 1, verify data was saved:

```sql
-- Check ai_analysis table
SELECT id, project_id, analysis_type, data_size, created_at 
FROM ai_analysis 
WHERE analysis_type LIKE 'WORKFLOW_STAGE_%'
ORDER BY created_at DESC 
LIMIT 5;

-- Check job_results backup table
SELECT id, project_id, result_type, created_at 
FROM job_results 
WHERE result_type LIKE 'WORKFLOW_STAGE_%'
ORDER BY created_at DESC 
LIMIT 5;

-- Verify UNIQUE KEY exists
SHOW INDEX FROM ai_analysis WHERE Key_name = 'uk_project_stage';
```

---

## If Hydration Still Fails

Check the PHP error log for these messages:

1. **On Save**:
   - `[UPP] 💾 saveWorkflowStageResult called` - Function was called
   - `[UPP] ✅ ai_analysis INSERT result: affected=1 or 2` - Insert succeeded
   - `[UPP] ✅ job_results BACKUP INSERT: affected=1 or 2` - Backup succeeded

2. **On Load**:
   - `[UPP] 📖 getWorkflowStageResults called` - Hydration started
   - `[UPP] ✅ HYDRATION SUCCESS: Found Stage 1` - Data found
   - OR `[UPP] ❌ HYDRATION FAIL: No results for stage 1` - Data not found

If you see `HYDRATION FAIL`, compare:
- The `project_id` shown in the save logs
- The `project_id` shown in the hydration logs
- They MUST match exactly

---

## Architecture After Fix

```
┌─────────────────────────────────────────────────────────────────┐
│                    STAGE 1 PERSISTENCE FLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  UI_Main.gs                                                     │
│    └── runWorkflowStage()                                       │
│          └── DB_WF_runStage1Strategy(mergedData)               │
│                └── DB_Workflow_Stage1(projectData)             │
│                      │                                          │
│                      ├── Gemini API call                        │
│                      │                                          │
│                      └── UPP_commit({                           │
│                            type: 'workflow_stage',              │
│                            domain: projectId,                   │
│                            jobToken: transactionId,             │
│                            payload: { stage: 1, json, report }  │
│                          })                                     │
│                                │                                │
│                                ▼                                │
│  UniversalPersistenceProvider.gs                                │
│    └── UPP_saveWorkflowStage()                                  │
│          └── callGateway('upp_save_workflow_stage', {...})     │
│                                │                                │
│                                ▼                                │
│  PHP: upp_handler.php                                           │
│    └── saveWorkflowStageResult()                                │
│          │                                                      │
│          ├── ALTER TABLE (add columns & UNIQUE KEY)            │
│          │                                                      │
│          ├── INSERT INTO ai_analysis                            │
│          │     ON DUPLICATE KEY UPDATE                          │
│          │                                                      │
│          └── INSERT INTO job_results (BACKUP)                   │
│                ON DUPLICATE KEY UPDATE                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    HYDRATION FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  UI: hydrateStage1FromDatabase(projectId)                       │
│    └── loadStageResultsMeta(projectId, 1)                       │
│          └── callGateway('job_get_results', {...})             │
│                                │                                │
│                                ▼                                │
│  PHP: upp_handler.php                                           │
│    └── getWorkflowStageResults()                                │
│          │                                                      │
│          ├── SELECT FROM ai_analysis (PRIORITY 1)               │
│          │     WHERE project_id = ? AND analysis_type = ?       │
│          │                                                      │
│          └── SELECT FROM job_results (FALLBACK)                 │
│                WHERE project_id = ? AND result_type = ?         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files Modified

| File | Status | Location |
|------|--------|----------|
| `serpifai_php/upp_handler.php` | ⚠️ NEEDS UPLOAD | Line 351-510, 737-865 |
| `FET+DB/UniversalPersistenceProvider.gs` | ✅ Ready for clasp push | Line 419-460 |

---

## Version History

- **V7.7** (Current): Complete persistence fix with UNIQUE KEY and dual-table persistence
- **V7.6**: Added project_id to job_results saves  
- **V7.5**: HTTP 400 fix (removed duplicate runStage function)
- **V7.4**: Pointer-only responses from runWorkflowStage
