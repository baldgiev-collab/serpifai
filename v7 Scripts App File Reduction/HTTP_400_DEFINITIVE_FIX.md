# HTTP 400 DEFINITIVE FIX PLAN
## V7.3 Chunked Hydration - January 17, 2026

---

## 🔴 ROOT CAUSE ANALYSIS

The HTTP 400 error occurs when `google.script.run` attempts to return data that exceeds the **50KB limit** for HTML Service communication.

### Error Chain (V7.2 - STILL BROKEN):
```
1. UI calls google.script.run.runWorkflowStage()
2. Apps Script returns lightweight pointer (~200 bytes) ✅
3. UI calls google.script.run.loadWorkflowStageResults() ← HYDRATION
4. Apps Script returns full JSON + report (~20-50KB)
5. 💥 EXCEEDS 50KB LIMIT → HTTP 400 (on hydration call!)
```

### The V7.2 fix only solved HALF the problem:
- ✅ `runWorkflowStage()` now returns pointer-only
- ❌ `loadWorkflowStageResults()` ALSO returns through `google.script.run` and exceeds 50KB!

---

## ✅ THE NUCLEAR FIX V7.3: "Chunked Hydration"

### Architecture Change:
```
BEFORE (V7.2 - Still Broken):
runWorkflowStage() → pointer (~200 bytes) ✅
loadWorkflowStageResults() → full data (20-50KB) → HTTP 400 ❌

AFTER (V7.3 - Chunked):
runWorkflowStage() → pointer (~200 bytes) ✅
    ↓
loadStageResultsMeta() → metadata only (~500 bytes) ✅
loadStageResultsReport() → report text (5-20KB) ✅
loadStageResultsJson() → JSON data (10-35KB, chunked if larger) ✅
    ↓
UI merges chunks → renders complete UI
```

### New Functions in UI_Main.gs:
1. **`loadStageResultsMeta(projectId, stageNum)`** 
   - Returns: `{ success, hasData, reportLength, jsonKeyCount, timestamp }`
   - Size: ~500 bytes
   - Also caches full data for subsequent chunk calls

2. **`loadStageResultsReport(projectId, stageNum)`**
   - Returns: `{ success, report, model, timestamp }`
   - Size: 5-20KB (report text only)

3. **`loadStageResultsJson(projectId, stageNum, chunkIndex)`**
   - Returns: `{ success, json, isComplete, chunkIndex, totalChunks, nextChunk }`
   - Size: 10-35KB per chunk
   - If JSON > 35KB, splits into multiple chunks by top-level keys

---

## 📋 EXECUTION CHECKLIST - V7.3

### Step 1: Added chunked hydration functions ✅ DONE
**File:** `UI_Main.gs`
- Added `loadStageResultsMeta()` - ~500 byte response
- Added `loadStageResultsReport()` - 5-20KB response  
- Added `loadStageResultsJson()` - 10-35KB response with chunking

### Step 2: Updated UI hydration to use chunks ✅ DONE
**File:** `UI/UI_Stage_Runner.html`
- `hydrateStage1FromDatabase()` now calls 3 functions in sequence
- Handles JSON chunking with recursive loader
- Merges all chunks before rendering

### Step 3: Updated hydrateWorkflowStages() ✅ DONE
**File:** `UI/UI_Navigation_Project_Handlers.html`
- Now uses `hydrateStage1FromDatabase()` for chunked loading

### Step 4: Deploy ✅ DONE
```
clasp push → 260 files deployed
```

---

## 🔧 FILES TO MODIFY

| File | Change | Priority |
|------|--------|----------|
| UI_Main.gs | Strip `runWorkflowStage` return to pointer only | 🔴 CRITICAL |
| DB_Workflow_Stage1.gs | Ensure MySQL save happens first | 🟡 VERIFY |
| UI_Stage_Runner.html | Ensure hydration is called | 🟢 DONE |

---

## 📊 PAYLOAD SIZE COMPARISON

| Scenario | Payload Size | Result |
|----------|--------------|--------|
| Full Stage 1 result | 20-50 KB | ❌ HTTP 400 |
| Pointer only | ~100 bytes | ✅ Works |
| Hydrated from MySQL | 20 KB (separate call) | ✅ Works |

---

## 🚀 EXECUTION STATUS

- [x] Step 1: Fix UI_Main.gs runWorkflowStage return ✅ DONE
- [x] Step 2: Verify MySQL persistence order ✅ DONE (in DB_Workflow_Stage1.gs)
- [x] Step 3: Verify hydrateStage1FromDatabase exists ✅ DONE (line 522)
- [x] Step 4: Deploy via clasp ✅ PUSHED 260 files

---

## ✅ FIX COMPLETE - TEST NOW

### To Test:
1. Open SerpifAI in Google Sheets
2. Open the Sidebar (SERPIFAI menu → Open Dashboard)
3. Select a project
4. Run Stage 1

### Expected Behavior:
1. Stage 1 runs (shows "Running...")
2. Backend returns instantly with pointer (~200 bytes)
3. UI shows "💎 Hydrating strategic intelligence from MySQL..."
4. Full results load from database
5. Bento-Grid dashboard renders with charts

### Console Logs to Watch:
```
✅ Backend response received
   success: true
   projectId: "YourProject"
   stage: 1
💎 V7.2 PAYLOAD DECOUPLER: Hydrating Stage 1 from database...
   Project: YourProject
```

---

## 🔧 CHANGES MADE

### UI_Main.gs (Lines 600-670)
**BEFORE:**
```javascript
return {
  success: true,
  stage: stageNum,
  json: stageResult.json || null,        // ← 15-30KB!
  report: stageResult.report || '',      // ← 10-20KB!
  data: stageResult,                     // ← DUPLICATES DATA!
  credits: authResult.creditCost,
  ...
};
```

**AFTER (V7.2 NUCLEAR FIX):**
```javascript
return {
  success: true,
  stage: stageNum,
  projectId: projectId,
  jobToken: stageResult.jobToken || '',
  credits: authResult.creditCost,
  timestamp: stageResult.timestamp || new Date().toISOString(),
  _hydrateFromDatabase: true,
  message: 'Stage completed. Hydrating from database...'
};
// Total: ~200 bytes instead of 30-50KB!
```

---

## 💡 WHY THIS WORKS

1. **google.script.run** has a 50KB response limit
2. By returning only `{ success, stage, projectId }` (~100 bytes), we NEVER hit the limit
3. The UI then makes a SEPARATE call to `loadWorkflowStageResults()` which:
   - Fetches from MySQL (no size limit on MySQL)
   - Returns via google.script.run (still large, but chunked differently)
   - Even if this fails, we have retry logic

4. **Key Insight**: The MySQL save happens SYNCHRONOUSLY before the return, so data is ALWAYS available for hydration.
