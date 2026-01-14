# Quick Deployment Checklist

## ✅ Files Updated (Local Workspace)

- [x] `v6_saas/apps_script/FT_FetchSingle.gs` - Headers, robots.txt, returnHtml option
- [x] `v6_saas/apps_script/FT_FullSnapshot.gs` - Pass options through
- [x] `v6_saas/apps_script/DB_COMP_EliteOrchestrator.gs` - Fetch options, API always-on
- [x] `v6_saas/apps_script/DIAGNOSTIC_COMPETITOR_ANALYSIS.gs` - Production options

## 📋 Deployment Steps

### 1. Open Apps Script Editor
- Go to: https://script.google.com
- Find your SerpifAI project
- OR find it from Google Sheets: Tools > Script editor

### 2. Copy Each File (4 files total)

**File 1: FT_FetchSingle.gs**
- In Apps Script, find "FT_FetchSingle.gs" in file list (left sidebar)
- Select ALL content (Ctrl+A)
- Copy content from: `v6_saas/apps_script/FT_FetchSingle.gs` in your local workspace
- Paste into Apps Script editor
- Click Save (💾)

**File 2: FT_FullSnapshot.gs**
- Find "FT_FullSnapshot.gs"
- Select ALL content (Ctrl+A)
- Copy from: `v6_saas/apps_script/FT_FullSnapshot.gs`
- Paste
- Save

**File 3: DB_COMP_EliteOrchestrator.gs**
- Find "DB_COMP_EliteOrchestrator.gs"
- Select ALL content (Ctrl+A)
- Copy from: `v6_saas/apps_script/DB_COMP_EliteOrchestrator.gs`
- Paste
- Save

**File 4: DIAGNOSTIC_COMPETITOR_ANALYSIS.gs**
- Find "DIAGNOSTIC_COMPETITOR_ANALYSIS.gs"
- Select ALL content (Ctrl+A)
- Copy from: `v6_saas/apps_script/DIAGNOSTIC_COMPETITOR_ANALYSIS.gs`
- Paste
- Save

### 3. Run Diagnostic Test

1. Click function dropdown at top (currently shows "Select function")
2. Scroll to find: `DIAG_testFullCompetitorWorkflow`
3. Click Run (▶️ button)
4. If prompted for authorization:
   - Click "Review Permissions"
   - Choose your Google account
   - Click "Advanced" > "Go to [Project] (unsafe)"
   - Click "Allow"
5. Wait ~60-90 seconds for execution
6. Check "Execution log" tab at bottom

### 4. Interpret Results

**✅ SUCCESS looks like:**
```
STAGE 2: DATA FETCHING TEST (FT_fullSnapshot)
   [1/3] toptal.com
      ✅ Success
   [2/3] globant.com
      ✅ Success
   [3/3] turing.com
      ✅ Success

STAGE 3: API ENRICHMENT TEST
   [1/3] toptal.com
      ✅ Serper
      ✅ PageSpeed
      ✅ OpenPageRank

STAGE 7: GEMINI ANALYSIS TEST
   ✅ JSON parsed successfully: 15 categories
```

**❌ FAILURE looks like:**
```
STAGE 2: DATA FETCHING TEST
   [1/3] toptal.com
      ❌ Failed: HTTP 403
   [2/3] globant.com
      ❌ Failed: Argument too large
```

### 5. Share Results

Copy the entire execution log and share it so we can:
- Verify fetchers are working
- Confirm APIs are populating
- Check Gemini is receiving real data
- Identify any remaining issues

---

## ⚡ Quick Test Command

In Apps Script:
1. Function dropdown → `DIAG_testFullCompetitorWorkflow`
2. Run (▶️)
3. Wait ~60s
4. Copy execution log

---

## 🚨 Troubleshooting

**Error: "Cannot find function DIAG_testFullCompetitorWorkflow"**
- Make sure you copied DIAGNOSTIC_COMPETITOR_ANALYSIS.gs
- Check file is saved (no red dot on file name)
- Try refreshing page

**Error: "Authorization required"**
- Click "Review Permissions"
- This is normal for first run
- Grant access to your account

**Error: "Exceeded maximum execution time"**
- Test took longer than 6 minutes (Apps Script limit)
- Likely means fetchers are hanging
- Check which stage failed in log

**No errors but log is empty**
- Make sure "Execution log" tab is selected (bottom)
- Not "Logs" tab
- Try View > Execution Transcript

---

## Next Steps After Testing

### If Test Passes (All ✅):
→ Move to UI implementation (Steps 6-10)
→ I'll guide you through fixing the UI loop and implementing 15 tabs

### If Test Fails (Some ❌):
→ Share the execution log
→ I'll diagnose remaining issues and provide targeted fixes

