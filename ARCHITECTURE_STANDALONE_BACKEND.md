# 🏗️ Standalone Backend Architecture

## Overview

Your system uses a **clean separation** between backend logic and frontend UI:

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE SHEETS (Data Layer)                   │
│  https://docs.google.com/spreadsheets/d/14LrX3Yk78...           │
│                                                                  │
│  Stores: CompetitorData_JSON sheet with unified JSON            │
└─────────────────────────────────────────────────────────────────┘
         ▲                                              ▲
         │ Write/Read via ID                            │ Read via binding
         │                                              │
┌────────┴──────────────────┐              ┌──────────┴────────────────┐
│  DATABRIDGE (Backend)     │              │  UI (Frontend)            │
│  Standalone Apps Script   │              │  Container-Bound Script   │
│  script.google.com        │              │  Extensions → Apps Script │
│                           │              │                           │
│  ✅ NOT bound to sheet    │              │  ✅ Bound to sheet        │
│  ✅ Uses spreadsheet ID   │              │  ✅ Has direct access     │
│                           │              │                           │
│  • Data Collection        │              │  • User Interface         │
│  • API Integration        │              │  • Data Display           │
│  • Business Logic         │              │  • Chart Rendering        │
│  • Data Processing        │              │  • User Input             │
└───────────────────────────┘              └───────────────────────────┘
         ▲
         │
         │ Calls
         │
┌────────┴──────────────────┐
│  FETCHER (Data Module)    │
│  Part of DataBridge       │
│                           │
│  • HTML Parsing           │
│  • Data Extraction        │
│  • Content Analysis       │
└───────────────────────────┘
```

---

## 📁 Project Structure

```
serpifai/
├── databridge/               ← STANDALONE BACKEND (script.google.com)
│   ├── storage/
│   │   └── unified_competitor_storage.gs  ← Uses spreadsheet ID
│   ├── collectors/
│   │   └── enhanced_data_collector.gs     ← Uses spreadsheet ID
│   ├── apis/
│   │   ├── openpagerank_api.gs
│   │   ├── pagespeed_api.gs
│   │   ├── serper_api.gs
│   │   └── search_console_api.gs
│   └── ...
│
├── fetcher/                  ← DATA COLLECTION MODULE
│   ├── extract_headings.gs
│   ├── extract_metadata.gs
│   ├── extract_opengraph.gs
│   ├── extract_schema.gs
│   └── ...
│
└── ui/                       ← FRONTEND (bound to Google Sheet)
    ├── index.html
    ├── scripts_app.html
    ├── style.css
    └── data_mapper.html
```

---

## 🔧 How It Works

### 1. **DataBridge Backend** (Standalone)

**Location**: Open from `script.google.com` directly

**Purpose**: Business logic, data collection, API integration

**Key Pattern**: Uses **explicit spreadsheet ID** instead of binding

```javascript
// ✅ CORRECT for DataBridge (Standalone)
var spreadsheetId = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
var ss = SpreadsheetApp.openById(spreadsheetId);
var sheet = ss.getSheetByName('CompetitorData_JSON');
```

```javascript
// ❌ WRONG for DataBridge (would return null)
var ss = SpreadsheetApp.getActiveSpreadsheet(); // null!
```

**Files**:
- `unified_competitor_storage.gs` - Saves/reads JSON to sheet
- `enhanced_data_collector.gs` - Orchestrates data collection
- All fetcher modules
- All API integrations

---

### 2. **UI Frontend** (Container-Bound)

**Location**: Open from **Extensions → Apps Script** inside Google Sheet

**Purpose**: User interface, display logic, user input

**Key Pattern**: Uses **binding** (no spreadsheet ID needed)

```javascript
// ✅ CORRECT for UI (Bound to sheet)
var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getSheetByName('CompetitorData_JSON');
```

**Files**:
- `index.html` - Main UI
- `scripts_app.html` - UI logic
- `data_mapper.html` - Data transformation
- `style.css` - Styling

---

## 🔄 Data Flow

### Collection Flow (Backend → Sheet)

```
1. User triggers collection from UI
   └─> Calls DataBridge backend function

2. DataBridge backend collects data
   ├─> Fetcher extracts HTML data
   ├─> APIs provide real-time metrics
   └─> Collector combines into unified JSON

3. DataBridge saves to sheet
   └─> STORAGE_saveCompetitorJSON(domain, rawData, ..., spreadsheetId)
       └─> SpreadsheetApp.openById(spreadsheetId)
           └─> Writes JSON to 'CompetitorData_JSON' sheet

4. UI reads from sheet
   └─> SpreadsheetApp.getActiveSpreadsheet() (bound access)
       └─> Reads JSON from 'CompetitorData_JSON' sheet
           └─> DataMapper transforms JSON
               └─> Renders in UI
```

### Display Flow (Sheet → UI)

```
1. UI requests competitor data
   └─> STORAGE_readCompetitorJSON(domain, projectId, spreadsheetId)

2. DataBridge backend reads from sheet
   └─> SpreadsheetApp.openById(spreadsheetId)
       └─> Finds row by domain
           └─> Parses JSON

3. Returns data to UI
   └─> DataMapper.mapAuthorityMetrics(data)
       └─> DataMapper.mapPerformanceMetrics(data)
           └─> Renders charts and cards
```

---

## ⚙️ Configuration

### DataBridge Backend Configuration

All backend files use this pattern:

```javascript
// At the top of each backend file
var CONFIG = {
  // Spreadsheet ID (your Google Sheet)
  SPREADSHEET_ID: '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU',
  
  // Sheet names
  SHEET_NAME: 'CompetitorData_JSON',
  
  // API keys (if needed)
  OPENPAGERANK_API_KEY: 'your-key-here',
  PAGESPEED_API_KEY: 'your-key-here'
};
```

### UI Frontend Configuration

UI files use binding (no config needed):

```javascript
// UI always uses active spreadsheet (bound)
var ss = SpreadsheetApp.getActiveSpreadsheet();
```

---

## 🚀 Deployment Steps

### Step 1: Deploy DataBridge Backend (Standalone)

1. Go to: https://script.google.com
2. Click **New Project**
3. Name it: `SerpifAI-DataBridge`
4. Copy files from `databridge/` folder:
   - `storage/unified_competitor_storage.gs`
   - `collectors/enhanced_data_collector.gs`
   - All fetcher files
   - All API files
5. Run `TEST_unifiedStorage()` to verify

**Expected Result**:
```
✅ Using spreadsheet ID: 14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU
✅ Save successful! Row: 2
✅ Read successful!
```

---

### Step 2: Deploy UI Frontend (Bound)

1. Open: https://docs.google.com/spreadsheets/d/14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU/edit
2. Click **Extensions → Apps Script**
3. Copy files from `ui/` folder:
   - `index.html`
   - `scripts_app.html`
   - `data_mapper.html`
   - `style.css`
4. Refresh sheet and open UI

**Expected Result**:
- Custom menu appears: "🚀 SerpifAI"
- UI opens and displays competitors
- Data loads from `CompetitorData_JSON` sheet

---

## 🔐 Permissions

### DataBridge Backend Needs:
- ✅ Access to Google Sheets by ID
- ✅ External URL fetch (for APIs)
- ✅ HTTP requests

**Authorization Prompt**:
```
SerpifAI-DataBridge needs access to:
✓ View and manage spreadsheets (by ID)
✓ Connect to external services
```

### UI Frontend Needs:
- ✅ Access to active spreadsheet (bound)
- ✅ Display HTML UI

**Authorization Prompt**:
```
SerpifAI-UI needs access to:
✓ View and manage this spreadsheet
✓ Display content in sidebar
```

---

## 🧪 Testing

### Test Backend (Standalone)

Open: https://script.google.com → Your DataBridge project

```javascript
function TEST_StandaloneBackend() {
  Logger.log('🧪 Testing Standalone Backend');
  
  var spreadsheetId = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
  
  // Test 1: Can access sheet by ID
  var ss = SpreadsheetApp.openById(spreadsheetId);
  Logger.log('✅ Opened spreadsheet: ' + ss.getName());
  
  // Test 2: Save data
  var result = STORAGE_saveCompetitorJSON(
    'ahrefs.com',
    { test: 'data' },
    {},
    {},
    'test-project',
    spreadsheetId
  );
  
  Logger.log('✅ Save result: ' + result.success);
  
  // Test 3: Read data
  var data = STORAGE_readCompetitorJSON(
    'ahrefs.com',
    'test-project',
    spreadsheetId
  );
  
  Logger.log('✅ Read result: ' + data.success);
}
```

**Expected Output**:
```
✅ Opened spreadsheet: Your Sheet Name
✅ Save result: true
✅ Read result: true
```

---

### Test UI (Bound)

Open: Sheet → Extensions → Apps Script → Your UI project

```javascript
function TEST_BoundUI() {
  Logger.log('🧪 Testing Bound UI');
  
  // Test 1: Can access active spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('✅ Active spreadsheet: ' + ss.getName());
  
  // Test 2: Can read sheet
  var sheet = ss.getSheetByName('CompetitorData_JSON');
  Logger.log('✅ Found sheet: ' + sheet.getName());
  
  // Test 3: Can read data
  var data = sheet.getRange(2, 1, 1, 7).getValues();
  Logger.log('✅ Read data: ' + data[0][0]); // Domain
}
```

**Expected Output**:
```
✅ Active spreadsheet: Your Sheet Name
✅ Found sheet: CompetitorData_JSON
✅ Read data: ahrefs.com
```

---

## 🎯 Why This Architecture?

### ✅ Advantages

1. **Separation of Concerns**
   - Backend handles business logic
   - Frontend handles display logic
   - Clean, maintainable code

2. **Independent Deployment**
   - Update backend without touching UI
   - Update UI without touching backend
   - Easier testing and debugging

3. **Scalability**
   - Backend can be reused by multiple frontends
   - Easy to add new data sources
   - Easy to add new UI views

4. **Security**
   - Backend can have restricted permissions
   - UI only needs read access
   - API keys stay in backend

### ❌ What to Avoid

1. **Don't mix binding patterns**
   ```javascript
   // ❌ BAD: Mixing standalone and bound access
   var ss = SpreadsheetApp.getActiveSpreadsheet(); // Won't work in standalone
   ```

2. **Don't hardcode sheet references in UI**
   ```javascript
   // ❌ BAD: UI shouldn't know about sheet structure
   var data = sheet.getRange(2, 1).getValue();
   
   // ✅ GOOD: UI calls backend functions
   var data = STORAGE_readCompetitorJSON(domain, projectId, spreadsheetId);
   ```

3. **Don't put API keys in UI**
   ```javascript
   // ❌ BAD: API keys in bound script (visible to sheet editors)
   var apiKey = 'sk-1234...';
   
   // ✅ GOOD: API keys in standalone backend
   var apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
   ```

---

## 📋 Quick Reference

### Backend (Standalone) Pattern
```javascript
// Always use explicit spreadsheet ID
var spreadsheetId = '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU';
var ss = SpreadsheetApp.openById(spreadsheetId);
```

### UI (Bound) Pattern
```javascript
// Always use active spreadsheet (binding)
var ss = SpreadsheetApp.getActiveSpreadsheet();
```

### Calling Backend from UI
```javascript
// UI calls backend function with spreadsheet ID
function populateOverviewTab() {
  var spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  var data = STORAGE_readAllCompetitorsJSON(projectId, spreadsheetId);
  // ... render data
}
```

---

## 🔧 Troubleshooting

### Error: "Cannot read properties of null (reading 'getId')"
**Cause**: Using `SpreadsheetApp.getActiveSpreadsheet()` in standalone backend
**Fix**: Use explicit spreadsheet ID instead

### Error: "Exception: You do not have permission to call openById"
**Cause**: Backend doesn't have permission to access sheet
**Fix**: Run test function and authorize access

### Error: "ReferenceError: STORAGE_saveCompetitorJSON is not defined"
**Cause**: Storage file not deployed to backend project
**Fix**: Copy `unified_competitor_storage.gs` to backend project

---

## ✅ Success Checklist

- [ ] Backend deployed to script.google.com (standalone)
- [ ] UI deployed to sheet (Extensions → Apps Script)
- [ ] Backend uses `SpreadsheetApp.openById(spreadsheetId)`
- [ ] UI uses `SpreadsheetApp.getActiveSpreadsheet()`
- [ ] TEST_unifiedStorage() passes in backend
- [ ] TEST_BoundUI() passes in UI
- [ ] Data flows: Backend → Sheet → UI
- [ ] No null reference errors

---

## 🎓 Summary

**DataBridge Backend (Standalone)**:
- Lives at: script.google.com
- Access sheet via: `SpreadsheetApp.openById('14LrX3Yk78...')`
- Contains: Business logic, APIs, data collection

**UI Frontend (Bound)**:
- Lives at: Sheet → Extensions → Apps Script
- Access sheet via: `SpreadsheetApp.getActiveSpreadsheet()`
- Contains: User interface, display logic

**Sheet** (Data Layer):
- Contains: `CompetitorData_JSON` sheet
- Accessed by both backend and frontend
- Single source of truth for data

This architecture keeps your code clean, maintainable, and scalable! 🚀
