# 🚨 DEPLOYMENT CHECKLIST - Fix buildEliteJSONPrompt Error

## Problem Summary
**Error:** `ReferenceError: buildEliteJSONPrompt is not defined`  
**Root Cause:** Function name has SPACE in it (line 17): `function buildElite JSONPrompt` instead of `function buildEliteJSONPrompt`  
**File:** `DB_COMP_ElitePrompt.gs`  
**Status:** Fixed locally, needs deployment

---

## ✅ Step-by-Step Fix

### **Step 1: Verify Local Fix**
✅ **DONE** - Line 17 corrected to: `function buildEliteJSONPrompt(competitorData, yourDomain, projectContext) {`

### **Step 2: Deploy to Apps Script** (REQUIRED - NOT YET DONE)

#### **Option A: Manual Copy/Paste (Recommended)**
1. Open Apps Script Editor
   - In Google Sheet: **Extensions** → **Apps Script**
   
2. Find the file `DB_COMP_ElitePrompt.gs` in left sidebar
   - If you don't see it, click **+** → **Script** and name it exactly: `DB_COMP_ElitePrompt`
   
3. Replace ALL content with the fixed version:
   - Copy the ENTIRE fixed file from your local: `c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\apps_script\DB_COMP_ElitePrompt.gs`
   - Paste into Apps Script Editor (replace everything)
   
4. **SAVE** (Ctrl+S or disk icon)

5. **CRITICAL:** Refresh the deployment
   - Apps Script doesn't auto-refresh cached code
   - You must either:
     - **A) Create NEW deployment:**
       - Click **Deploy** → **New deployment**
       - Type: **Web app**
       - Execute as: **Me**
       - Who has access: **Anyone**
       - Click **Deploy**
       - Copy new URL
       - Update `PHP_GATEWAY_URL` in Script Properties if needed
     
     - **B) OR: Just reload the sheet:**
       - Close the Google Sheet tab
       - Re-open from Drive
       - This forces Apps Script to reload

#### **Option B: Use clasp (If Configured)**
```powershell
cd "c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\v6_saas\apps_script"
clasp push
```

### **Step 3: Verify Deployment**

Run this diagnostic in Apps Script Editor:

1. Open **Apps Script Editor**
2. Select function: `DIAG_checkLoadedFunctions`
3. Click **Run** (▶️)
4. Check **Execution log** (View → Logs)
5. Look for:
   ```json
   "buildEliteJSONPrompt": {
     "exists": true,
     "type": "function",
     "canCall": true
   }
   ```

If still shows `exists: false`, the fix **hasn't been deployed yet**.

### **Step 4: Test Function Directly**

In Apps Script Editor:
1. Select function: `DIAG_testBuildEliteJSONPrompt`
2. Click **Run** (▶️)
3. Should see: `✅ Function call successful!`

If you see error, deployment didn't work.

### **Step 5: Test Full Analysis**

1. Go to Google Sheet
2. Click **Competitor Analysis** button
3. Enter competitors
4. Click **Analyze**
5. Should work without "function not defined" error

---

## 🔍 Diagnostic Commands

### Check if function exists:
```javascript
DIAG_checkLoadedFunctions()
```

### Test function call:
```javascript
DIAG_testBuildEliteJSONPrompt()
```

### List project files:
```javascript
DIAG_listProjectFiles()
```

---

## 🚨 Common Issues

### Issue 1: Function still not found after saving
**Cause:** Apps Script caching  
**Fix:** Close sheet completely and re-open from Drive

### Issue 2: File doesn't exist in Apps Script
**Cause:** File never created or deleted  
**Fix:** Create new file named exactly `DB_COMP_ElitePrompt.gs` and paste content

### Issue 3: Different error after fix
**Cause:** Multiple issues  
**Fix:** Check execution log for new error, likely missing another function

---

## 📝 Files to Deploy

1. ✅ **DB_COMP_ElitePrompt.gs** - Fixed function name (line 17)
2. ✅ **DIAG_CheckFunctions.gs** - New diagnostic file
3. ✅ **competitor_handler.php** - Fixed PDO syntax (upload to server)

---

## 🎯 Expected Result After Fix

```
[1/5] 📋 Collecting competitor URLs... ✅
[2/5] 🎯 Collecting project context... ✅
[3/5] 🔑 Verifying license key... ✅ (5711 credits)
[4/5] ⏳ Showing loading state... ✅
[5/5] 📡 Calling backend API... ✅

📥 Gateway response: {success: true, transactionId: 127, creditCost: 100}
🎨 Rendering 15-tab UI...
✅ Analysis complete!
```

---

## ✅ Deployment Verification Checklist

- [ ] Opened Apps Script Editor
- [ ] Found/Created `DB_COMP_ElitePrompt.gs` file
- [ ] Pasted fixed content (function buildEliteJSONPrompt without space)
- [ ] Saved file (Ctrl+S)
- [ ] Ran `DIAG_checkLoadedFunctions()` → shows `exists: true`
- [ ] Ran `DIAG_testBuildEliteJSONPrompt()` → shows `success: true`
- [ ] Closed and re-opened Google Sheet
- [ ] Tested competitor analysis button → works!

---

**Next Steps:** Run the deployment (Step 2) and report back the results of the diagnostic functions (Step 3).
