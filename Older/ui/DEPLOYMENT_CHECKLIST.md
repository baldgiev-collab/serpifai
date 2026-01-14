# 🚀 UI Apps Script Deployment Checklist

## Problem Diagnosed
You were running UI tests **inside the DataBridge project**, which is why you got "runWorkflowStage not defined" errors. The UI and DataBridge must be **separate Apps Script projects**.

---

## ✅ Setup Steps

### 1️⃣ Create/Open Your UI Apps Script Project
- Open Google Sheets
- Go to **Extensions → Apps Script**
- This should be a **separate project** from DataBridge
- Project name should be something like "SERPIFAI UI" or "SERPIFAI Frontend"

### 2️⃣ Copy These Files to UI Project

Copy the following files from your local `ui/` folder to the Apps Script editor:

**Required Files:**
1. ✅ `Code.gs` - Main UI server code (already have this)
2. ✅ `workflow_connector.gs` - **THIS IS THE MISSING FILE!**
3. ✅ `test_ui_databridge.gs` - Test file (just created)
4. ✅ `index.html` - Main UI template
5. ✅ `style.css` - Styles
6. ✅ Other HTML partials if you have them

**Critical:** The `workflow_connector.gs` file contains:
- `runWorkflowStage()` function
- `testDataBridgeConnection()` function  
- `DATABRIDGE_ENDPOINT` constant

### 3️⃣ Verify DataBridge URL

In `workflow_connector.gs`, line 8 should have:
```javascript
const DATABRIDGE_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0KNvs9-KkswBlj8vmVkgh9hXKaw9I2sglrBeXQR8gaDk6P8RCWeN4QHU-fAdqXBtZ/exec';
```

This is your **NEW working deployment** (confirmed by your DataBridge tests passing).

### 4️⃣ Run Tests in UI Project

In the UI Apps Script project, run these functions:

1. **`verifyUIProjectSetup()`** - Check all required functions exist
   - Expected: All checks ✅
   
2. **`testDataBridgePing()`** - Test connection to DataBridge
   - Expected: `{"success":true,"message":"DataBridge is online"}`
   
3. **`testUIToDataBridgeFlow()`** - Full workflow test
   - Expected: Stage 1 completes with `json` and `report` fields

### 5️⃣ Deploy UI as Web App (Optional)

If you want to access the UI via URL:
- Click **Deploy → New deployment**
- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone** (or your preference)
- Click **Deploy**

---

## 🔍 Common Issues

### Issue 1: "runWorkflowStage is not defined"
**Solution:** You're testing in the wrong project. Make sure:
- You're in the UI Apps Script project (not DataBridge)
- `workflow_connector.gs` file is present in the UI project
- Run `verifyUIProjectSetup()` to check

### Issue 2: "Unknown action: ping" or "Unknown action: workflow:stage1"
**Solution:** DataBridge URL is pointing to old deployment
- Update line 8 in `workflow_connector.gs` with new URL
- Make sure it's: `AKfycby0zUFBjCGkZD36q49G031Vse7CPwvUYOqfX0dXuy33WRKQr4v_nGO06i7TPzLAam8f`

### Issue 3: Tests pass but UI doesn't work
**Solution:** Deploy the UI project
- Save all files
- Click **Deploy → Manage deployments → Edit**
- Update the version
- Copy the new deployment URL

---

## 📊 Expected Test Results

### ✅ Correct Output (UI Project)
```
=== VERIFYING UI PROJECT SETUP ===
✅ runWorkflowStage: Found
✅ testDataBridgeConnection: Found
✅ DATABRIDGE_ENDPOINT: Found

✅ UI PROJECT SETUP COMPLETE
   Ready to test workflow stages
```

### ❌ Wrong Output (DataBridge Project)
```
Functions present in this project:
  • handleRequest: ✅
  • runWorkflowStage: ❌
  • DATABRIDGE_ENDPOINT: ❌

❓ This is: DATABRIDGE PROJECT
   You're in the wrong project!
```

---

## 🎯 Next Steps After Setup

1. ✅ Run all 3 test functions in UI project
2. ✅ Verify Stage 1 completes successfully  
3. ✅ Open your Google Sheet
4. ✅ Go to **SERPIFAI → Open SERPIFAI** menu
5. ✅ Test Stage 1 from the UI
6. ✅ Verify results appear in the sidebar

---

## 📝 File Locations

### Local Files (Git Repo)
```
ui/
  ├── Code.gs                    ← Main UI code
  ├── workflow_connector.gs      ← COPY THIS TO UI PROJECT!
  ├── test_ui_databridge.gs      ← Test file
  ├── index.html
  └── style.css
```

### Apps Script Projects (Online)

**Project 1: DataBridge** (Script ID: 1eiFEDozojKsnZerepaxVayCetA4gqC0MxWemOz093cl9nmxKA7Hd1gAI)
- Has `handleRequest()` ✅
- Has `runStage1Strategy()` ✅
- Has router code ✅
- **All tests passing** ✅

**Project 2: UI** (Need to verify/create)
- Has `Code.gs` with `onOpen()`, `showSidebar()` ✅
- **Needs** `workflow_connector.gs` ❌ ← **THIS IS THE PROBLEM!**
- **Needs** test file ❌

---

## 🎉 Success Criteria

When everything is working:

1. UI project has `workflow_connector.gs`
2. `verifyUIProjectSetup()` returns all ✅
3. `testDataBridgePing()` returns success
4. `testUIToDataBridgeFlow()` completes Stage 1
5. Opening SERPIFAI from Sheet menu works
6. Stage 1 executes from UI and shows results

---

## 💡 Quick Fix Summary

**The Problem:**
- You were testing in DataBridge project instead of UI project
- UI project is missing `workflow_connector.gs` file

**The Solution:**
1. Open your UI Apps Script project (separate from DataBridge)
2. Copy `workflow_connector.gs` to that project
3. Copy `test_ui_databridge.gs` to that project
4. Run `verifyUIProjectSetup()` to confirm
5. Run `testUIToDataBridgeFlow()` to test

**That's it!** Once `workflow_connector.gs` is in the UI project, everything will work.
