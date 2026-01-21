# SerpifAI v7.1 Comprehensive Fix Summary

## Issues Addressed

### 1. ✅ Credit Costs Too Low (FIXED)
**Problem:** Stage 1 was only charging 5 credits despite using ~85K tokens (20K prompt + 65K response)

**Solution:** Updated `serpifai_php/config/db_config.php`:
```php
// Workflow stages - Increased costs based on actual Gemini token usage
'workflow_stage1' => 15,  // Market Position Analysis - ~85K total tokens
'workflow_stage2' => 20,  // Competitive Intelligence - ~90K total tokens
'workflow_stage3' => 25,  // Content Strategy - ~100K total tokens
'workflow_stage4' => 30,  // Technical Roadmap - ~110K total tokens
'workflow_stage5' => 40,  // Executive Summary - ~120K total tokens
```

### 2. ✅ Gemini Model Names Outdated (FIXED)
**Problem:** Code was defaulting to `gemini-2.5-flash` instead of latest `gemini-3-flash-preview`

**Files Updated:**
- `serpifai_php/upp_handler.php` - Line 360 default model
- `serpifai_php/apis/gemini_api.php` - Line 47 default model (already correct)
- `FET+DB/UniversalPersistenceProvider.gs` - Line 530 default model

### 3. ✅ PHP Timeout on Gemini API Calls (FIXED)
**Problem:** Gemini calls returning ~65K chars were timing out after 2 minutes (HTTP 500)

**Solution:** Added timeout settings to `serpifai_php/apis/gemini_api.php`:
```php
// V7.1 FIX: Extended timeouts for large Gemini responses (~65K chars = 90+ seconds)
curl_setopt($ch, CURLOPT_TIMEOUT, 300);         // 5 minute total timeout
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);   // 30 second connection timeout

// Increase PHP execution time for long Gemini calls
@set_time_limit(600);  // 10 minutes max execution time
```

### 4. ✅ SQL Error "Unknown column 'domain'" (FIXED - Previous Session)
**Problem:** INSERT INTO ai_analysis was trying to use non-existent 'domain' column

**Solution:** Already fixed in `serpifai_php/upp_handler.php` - removed domain from INSERT

---

## Files That Need to Be Uploaded to Server

1. **serpifai_php/config/db_config.php** - Credit costs increased
2. **serpifai_php/apis/gemini_api.php** - Timeout settings added
3. **serpifai_php/upp_handler.php** - Model default updated + domain column fix

Upload location: `serpifai.com/serpifai_php/`

---

## 🚨 CRITICAL: Browser Cache Fix Instructions

The browser is still serving the OLD sidebar code despite deployment. This is why HTTP 400 errors persist.

### Step-by-Step Cache Clear:

1. **Close ALL Google Sheets tabs** in your browser

2. **Clear browser cache** (one of these methods):
   
   **Option A - Chrome DevTools:**
   - Press F12 to open DevTools
   - Go to Network tab
   - Check "Disable cache"
   - Refresh the page with cache disabled
   
   **Option B - Hard Refresh:**
   - Press Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
   
   **Option C - Clear Cache for Google:**
   - Chrome Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Time range: "Last 24 hours"
   - Click Clear data

3. **Reopen Google Sheets** and launch the sidebar

4. **Verify Build Version:**
   - Open browser console (F12)
   - Look for: `SerpifAI v7.1 Build 2026-01-17-B`
   - If you see this message, the new code is loaded!

5. **If still seeing old code:**
   - Try incognito/private browsing mode
   - Or try a different browser temporarily

---

## Apps Script Deployment Reminder

After editing Apps Script code, remember to:
1. Save all files (Ctrl+S)
2. Click "Deploy" → "New deployment"
3. Copy the new deployment URL (if using web app)
4. For sidebar: Just save - no new deployment needed for library mode

---

## Testing Command

To test Stage 1 directly from Apps Script editor (bypasses browser):

1. Open Apps Script editor
2. Find `UI_Main.gs`
3. Look for function `testStage1Direct()`
4. Run it from the editor
5. Check the Execution log for results

---

## Technical Summary

### Payload Architecture (v7.1)
- UI sends **ultra-minimal payload** (4 fields only):
  - `stageNum`
  - `projectId`
  - `model`
  - `_fetchCompetitorDataFromMySQL: true`
  
- Server fetches competitor data from MySQL, not from browser
- This prevents HTTP 400 errors from payload size limits

### Database Schema
- Table: `ai_analysis`
- Columns: `job_token`, `project_id`, `analysis_type`, `model_used`, `analysis_json`, `analysis_text`, `data_json`, `data_size`, `created_at`

---

*Generated: 2025-01-17*
