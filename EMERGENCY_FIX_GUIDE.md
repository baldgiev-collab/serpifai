# 🚨 EMERGENCY FIX: "Unknown action: gemini:generate" Error

## 🔴 **Current Status**: Stage 1 FAILS - PHP backend missing Gemini handler

**Error in Console**:
```
GatewayError: Server error (500): Unknown action: gemini:generate
```

**Root Cause**: PHP files from security update (commit dfda980) NOT uploaded to Hostinger yet

---

## 📋 Step-by-Step Fix (15 Minutes Total)

### STEP 1: Check What's on Your Server (2 minutes)

**Via FTP/cPanel File Manager**, check these 2 files:

#### File 1: `serpifai.com/serpifai_php/api_gateway.php`
**Look for lines 260-261** (should contain):
```php
require_once __DIR__ . '/apis/gemini_api.php';
return handleGeminiAction($action, $payload);
```

**If MISSING** → You have OLD version, need to upload ✅  
**If PRESENT** → Already correct, skip to Step 3

---

#### File 2: `serpifai.com/serpifai_php/apis/gemini_api.php`
**Look for line 82** (should contain):
```php
function handleGeminiAction($action, $payload) {
```

**If MISSING** → You have OLD version, need to upload ✅  
**If PRESENT** → Already correct, skip to Step 3

---

### STEP 2: Upload PHP Files (5 minutes)

**Method A: FTP (Recommended)**

1. Open FileZilla (or your FTP client)
2. Connect to serpifai.com
3. Navigate to: `public_html/serpifai_php/`

**Upload File 1: api_gateway.php**
```
Local Path:  C:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\api_gateway.php
Remote Path: public_html/serpifai_php/api_gateway.php
Action:      OVERWRITE existing file
Size:        ~454 lines, 18-20 KB
```

**Upload File 2: gemini_api.php**
```
Local Path:  C:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\serpifai_php\apis\gemini_api.php
Remote Path: public_html/serpifai_php/apis/gemini_api.php
Action:      OVERWRITE existing file
Size:        ~198 lines, 7-8 KB
```

---

**Method B: cPanel File Manager**

1. Login to Hostinger cPanel
2. Click "File Manager"
3. Navigate to: `public_html/serpifai_php/`
4. For each file:
   - Right-click existing file → "Edit"
   - Select all (Ctrl+A) → Delete
   - Paste content from Git repo file
   - Click "Save Changes"

---

### STEP 3: Verify .env Configuration (2 minutes)

**Check if GEMINI_API_KEY is set**:

1. Via FTP/cPanel, open: `public_html/serpifai_php/config/db_config.php`
2. Look for:
   ```php
   define('GEMINI_API_KEY', 'YOUR_ACTUAL_KEY_HERE');
   ```

**If MISSING or empty**:
- Add your actual Gemini API key
- Get key from: https://aistudio.google.com/apikey

**Security Note**: Make sure this file is NOT publicly accessible (should be outside public_html or protected by .htaccess)

---

### STEP 4: Upload Apps Script Files (3 minutes)

1. Open Apps Script Editor: https://script.google.com/
2. Find your project in left sidebar

**Upload File 1: UI_Scripts_App.html**
```
Location: v6_saas/apps_script/UI_Scripts_App.html
Action:   Replace entire content (Ctrl+A → Delete → Paste → Ctrl+S)
Lines:    4,132 lines
Changes:  Lines 799-846 - Enhanced JSON extraction
```

**Upload File 2: UI_Components_Results.html**
```
Location: v6_saas/apps_script/UI_Components_Results.html
Action:   Replace entire content (Ctrl+A → Delete → Paste → Ctrl+S)
Lines:    465 lines (was 192)
Changes:  Complete elite layout redesign
```

3. Click **Save** (Ctrl+S)
4. **Deploy**: Deploy → Test deployments → Select latest

---

### STEP 5: Test Stage 1 (3 minutes)

1. Open your web app (refresh if already open: Ctrl+Shift+R)
2. Select project: "Stage1-Test" (or create new)
3. Select model: "Gemini 2.5 Flash"
4. Fill minimum Stage 1 fields:
   ```
   Brand Name:      TestCo
   Target Audience: Small business owners
   Audience Pains:  Limited budget, no expertise
   Audience Desired: More customers, growth
   Product/Service: Marketing software
   Core Topic:      Digital marketing
   Quarterly Goal:  Grow leads by 50%
   ```
5. Open browser console (F12 → Console tab)
6. Click "▶ Run Stage 1"
7. Wait 20-30 seconds

---

### STEP 6: Expected Results ✅

**Console Output (Success)**:
```javascript
=== CHART GENERATION DIAGNOSTIC ===
stageNum: 1 type: number
result structure: success,stage,json,report,timestamp,projectId
✅ dashboardCharts found in jsonData - data is already at correct level
✅ Stage 1 condition passed
✅ JSON data validation PASSED - calling generateStage1Charts()
   Chart count: 11

Creating Customer Frustrations chart with 5 items
✅ Canvas element found
✅ Customer Frustrations chart created
... (10 more charts)
✅ Charts created: 11
```

**UI Result**:
- Auto-switches to "Results" tab
- **LEFT PANEL (40%)**: Strategic analysis text with markdown formatting
- **RIGHT PANEL (60%)**: 11 animated charts in grid layout
- Charts have gradient backgrounds, hover effects, color badges

---

## 🔍 Diagnostic Commands (Run in Console)

### Test 1: Check Backend Response Structure
```javascript
// Run this in browser console AFTER Stage 1 completes
console.log('Full result object:', window.lastStageResult);
console.log('Has success?', window.lastStageResult?.success);
console.log('Has json?', window.lastStageResult?.json);
console.log('Has dashboardCharts?', window.lastStageResult?.json?.dashboardCharts);
```

### Test 2: Check Canvas Elements
```javascript
// Check if all 11 canvas elements exist
const canvasIds = [
  'chart-emotional-pains', 'chart-hidden-desires', 'chart-mindset-shifts',
  'chart-jtbd-impact', 'chart-competitor-gaps', 'chart-format-usage',
  'chart-brand-positioning', 'chart-value-proposition', 'chart-content-pillars',
  'chart-priority-matrix', 'chart-opportunity-gaps'
];

canvasIds.forEach(id => {
  const el = document.getElementById(id);
  console.log(`${id}: ${el ? '✅ Found' : '❌ Missing'}`);
});
```

### Test 3: Check Chart.js Loaded
```javascript
console.log('Chart.js version:', typeof Chart !== 'undefined' ? Chart.version : '❌ NOT LOADED');
```

### Test 4: Check Layout
```javascript
const layout = document.querySelector('.results-elite-layout');
console.log('Elite layout exists?', !!layout);
console.log('Grid columns:', layout ? window.getComputedStyle(layout).gridTemplateColumns : 'N/A');
```

---

## 🚨 Troubleshooting Scenarios

### Scenario A: Still Getting "Unknown action: gemini:generate"

**Cause**: PHP files not uploaded or cached

**Fix**:
1. Re-upload api_gateway.php and gemini_api.php
2. Check file timestamps on server (should be today)
3. Clear PHP opcache:
   - Via SSH: `php -r "opcache_reset();"`
   - Via cPanel: PHP Settings → Opcache → Reset
4. Hard refresh browser: Ctrl+Shift+F5

---

### Scenario B: "GEMINI_API_KEY not configured"

**Cause**: API key missing from db_config.php

**Fix**:
1. Edit: `serpifai_php/config/db_config.php`
2. Add line:
   ```php
   define('GEMINI_API_KEY', 'AIzaSy..._YOUR_ACTUAL_KEY');
   ```
3. Get key from: https://aistudio.google.com/apikey
4. Save file
5. Test again

---

### Scenario C: Charts Still Not Showing (No Console Errors)

**Cause**: UI_Components_Results.html old version or cached

**Fix**:
1. Check Apps Script Editor → UI_Components_Results.html
2. Verify line 13 contains: `<div class="results-elite-layout">`
3. Verify line 203-550 contains CSS styles block
4. If missing, re-paste entire file
5. Save → Deploy → Test again
6. Hard refresh: Ctrl+Shift+R

---

### Scenario D: Layout Broken (Charts Below Text)

**Cause**: CSS not loaded

**Fix**:
1. Check browser console for CSS errors
2. Verify UI_Components_Results.html has `<style>` block at line 203
3. Check styles apply:
   ```javascript
   const layout = document.querySelector('.results-elite-layout');
   console.log(window.getComputedStyle(layout).display); // Should be "grid"
   console.log(window.getComputedStyle(layout).gridTemplateColumns); // Should be "40% 60%"
   ```
4. If "display: block" → CSS not loaded, re-upload file

---

### Scenario E: Gemini API Returns Error 401/403

**Cause**: Invalid API key or quota exceeded

**Fix**:
1. Check API key is valid: https://aistudio.google.com/apikey
2. Check API quota: https://console.cloud.google.com/apis/
3. Verify key has Gemini API enabled
4. Try regenerating key
5. Update db_config.php with new key

---

## 📊 File Checklist (Before Testing)

### ✅ PHP Files (On Hostinger Server)

- [ ] `api_gateway.php` uploaded (lines 260-261 have handleGeminiAction call)
- [ ] `gemini_api.php` uploaded (line 82 has handleGeminiAction function)
- [ ] `db_config.php` has GEMINI_API_KEY defined with actual key
- [ ] File timestamps are TODAY (Dec 11, 2025)
- [ ] No PHP syntax errors (check server error logs)

### ✅ Apps Script Files

- [ ] `UI_Scripts_App.html` uploaded (line 813 has "dashboardCharts found" log)
- [ ] `UI_Components_Results.html` uploaded (line 13 has "results-elite-layout" div)
- [ ] Both files saved (Ctrl+S)
- [ ] New deployment created or test deployment refreshed
- [ ] No JavaScript syntax errors in console

### ✅ Browser State

- [ ] Hard refreshed (Ctrl+Shift+R)
- [ ] Console cleared (Ctrl+L in console)
- [ ] No old tabs open with cached version
- [ ] Chart.js library loaded (check console: `typeof Chart`)

---

## 🎯 Quick Fix Summary

**If you see "Unknown action: gemini:generate"**:
→ Upload these 2 PHP files to Hostinger NOW:
1. `api_gateway.php` (commit dfda980 or later)
2. `gemini_api.php` (commit dfda980 or later)

**If Stage 1 runs but no charts**:
→ Upload these 2 Apps Script files NOW:
1. `UI_Scripts_App.html` (commit 45213b7)
2. `UI_Components_Results.html` (commit 45213b7)

**Both issues?**:
→ Upload ALL 4 files in order above

---

## 📞 Still Stuck?

Run this diagnostic in browser console and send me the output:

```javascript
console.log('=== FULL DIAGNOSTIC ===');
console.log('1. Chart.js loaded?', typeof Chart !== 'undefined');
console.log('2. Elite layout exists?', !!document.querySelector('.results-elite-layout'));
console.log('3. Last result:', window.lastStageResult || 'No stage run yet');
console.log('4. Gateway URL:', typeof GATEWAY_URL !== 'undefined' ? GATEWAY_URL : 'Not defined');
console.log('5. All canvas elements:', [
  'chart-emotional-pains', 'chart-hidden-desires', 'chart-mindset-shifts',
  'chart-jtbd-impact', 'chart-competitor-gaps', 'chart-format-usage',
  'chart-brand-positioning', 'chart-value-proposition', 'chart-content-pillars',
  'chart-priority-matrix', 'chart-opportunity-gaps'
].map(id => ({id, exists: !!document.getElementById(id)})));
```

Then run Stage 1 again and send me the console output.

---

**Priority**: Upload the 2 PHP files FIRST (this fixes the 500 error), then upload 2 Apps Script files (this fixes the layout).

**Time**: 10-15 minutes total

**Result**: Stage 1 will work with elite UI and all 11 charts ✅
