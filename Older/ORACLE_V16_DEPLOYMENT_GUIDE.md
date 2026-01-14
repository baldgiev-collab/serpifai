# 🔮 SerpifAI Oracle v16.0 - Complete Deployment Guide

## Overview

This guide covers the deployment of the comprehensive Oracle competitor intelligence system, including:

1. **FT_OracleFetcher.gs** - Batch scraping engine with trigger-resume logic
2. **Oracle_Persistence.gs** - MySQL UPSERT with JSON storage
3. **Oracle_EEATForensics.gs** - Enhanced E-E-A-T analysis
4. **Oracle_ElitePrompt.gs** - Gemini API intelligence prompts
5. **Oracle_UI_Render.gs** - 7-tab visualization dashboard

---

## 📋 Pre-requisites

### 1. MySQL Database (Already Configured)
- **Host:** `82.197.82.19`
- **Database:** `u187453795_SrpAIDataGate`
- **User:** `u187453795_Admin`
- **Password:** `OoRB1Pz9i?H`

### 2. Gemini API Key
Set in Script Properties:
```
Key: GEMINI_API_KEY
Value: [Your Gemini API Key]
```

---

## 🚀 Step 1: Copy Files to Apps Script

Copy these 5 files to your Apps Script project:

| File | Purpose |
|------|---------|
| `FT_OracleFetcher.gs` | Batch URL scraping with deep forensics |
| `Oracle_Persistence.gs` | MySQL storage with 7-day UPSERT logic |
| `Oracle_EEATForensics.gs` | E-E-A-T signal analysis |
| `Oracle_ElitePrompt.gs` | Gemini intelligence prompts |
| `Oracle_UI_Render.gs` | Dashboard visualization |

---

## 🗄️ Step 2: Initialize MySQL Tables

Run this function **once** to create all required tables:

```javascript
function SETUP_OracleTables() {
  ORACLE_InitTables();
}
```

This creates:
- `competitor_intelligence` - Main intelligence storage
- `competitor_keywords` - Extracted keywords
- `competitor_headings` - Heading hierarchy
- `competitor_links` - Internal/external links
- `competitor_eeat` - E-E-A-T scores

---

## 🔧 Step 3: Configure Script Properties

In Apps Script Editor: **Project Settings → Script Properties**

Add these properties:

| Property | Value |
|----------|-------|
| `DB_HOST` | `82.197.82.19` |
| `DB_NAME` | `u187453795_SrpAIDataGate` |
| `DB_USER` | `u187453795_Admin` |
| `DB_PASS` | `OoRB1Pz9i?H` |
| `GEMINI_API_KEY` | `[Your Key]` |

---

## 🧪 Step 4: Test Components

### Test MySQL Connection
```javascript
function TEST_MySQL() {
  ORACLE_TestPersistence();
}
```

### Test Gemini API
```javascript
function TEST_Gemini() {
  ORACLE_TestGemini();
}
```

### Test Single Page Scrape
```javascript
function TEST_SinglePage() {
  const result = ORACLE_TestSinglePage('https://example.com');
  Logger.log(JSON.stringify(result, null, 2));
}
```

### Test EEAT Analysis
```javascript
function TEST_EEAT() {
  ORACLE_AnalyzeEEAT('https://example.com');
}
```

### Test Dashboard Render
```javascript
function TEST_Dashboard() {
  ORACLE_TestRenderer();
}
```

---

## 📡 Step 5: Run Batch Analysis

### Configure Competitors
Edit `ORACLE_FETCHER_CONFIG` in `FT_OracleFetcher.gs`:

```javascript
var ORACLE_FETCHER_CONFIG = {
  PROJECT_ID: 'my_project',           // Your project identifier
  COMPETITOR_DOMAINS: [
    'competitor1.com',
    'competitor2.com',
    'competitor3.com'
  ],
  BATCH_SIZE: 50,
  MAX_BLOG_PAGES: 15
};
```

### Start Batch Scraping
```javascript
function START_OracleBatch() {
  // This will scrape all competitor pages and save to MySQL
  ORACLE_StartBatch();
}
```

**Note:** Long-running batches use triggers to resume automatically.

### Check Batch Status
```javascript
function CHECK_OracleStatus() {
  const status = ORACLE_GetStatus();
  Logger.log(JSON.stringify(status, null, 2));
}
```

---

## 🤖 Step 6: Run Gemini Intelligence Analysis

After batch scraping completes:

```javascript
function RUN_IntelligenceAnalysis() {
  // Comprehensive analysis
  ORACLE_RunIntelligenceAnalysis('my_project');
}
```

For specific analysis types:
```javascript
// Semantic gap analysis
ORACLE_RunSpecificAnalysis('my_project', 'semantic_gaps');

// EEAT weakness analysis
ORACLE_RunSpecificAnalysis('my_project', 'eeat_weakness');

// Internal link opportunities
ORACLE_RunSpecificAnalysis('my_project', 'internal_links');

// Content calendar
ORACLE_RunSpecificAnalysis('my_project', 'content_calendar');
```

---

## 📊 Step 7: View Dashboard

```javascript
function SHOW_OracleDashboard() {
  ORACLE_RenderDashboard('my_project');
}
```

The dashboard includes 7 tabs:
1. **Overview** - Summary stats and competitor comparison
2. **E-E-A-T Analysis** - Radar chart and signal breakdown
3. **Heading Map** - Heading hierarchy visualization
4. **Keywords** - Keyword cloud and analysis
5. **Link Network** - Internal/external link analysis
6. **Content Gaps** - Gap matrix and opportunities
7. **Recommendations** - Priority actions and 90-day plan

---

## 🔄 Step 8: Export Data

### Export to Google Sheet
```javascript
function EXPORT_ToSheet() {
  ORACLE_ExportToSheet('my_project');
}
```

### Get Last Analysis
```javascript
function GET_LastAnalysis() {
  const analysis = ORACLE_GetLastAnalysis();
  Logger.log(analysis);
}
```

---

## 📅 Automation (Optional)

### Set Up Daily Refresh
```javascript
function SETUP_DailyRefresh() {
  // Delete old triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'ORACLE_StartBatch') {
      ScriptApp.deleteTrigger(t);
    }
  });
  
  // Create daily trigger at 2 AM
  ScriptApp.newTrigger('ORACLE_StartBatch')
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();
    
  Logger.log('✅ Daily refresh scheduled for 2 AM');
}
```

---

## 🛠️ Troubleshooting

### Connection Issues
```javascript
// Test direct JDBC connection
function DEBUG_Connection() {
  const url = 'jdbc:mysql://82.197.82.19:3306/u187453795_SrpAIDataGate';
  try {
    const conn = Jdbc.getConnection(url, 'u187453795_Admin', 'OoRB1Pz9i?H');
    Logger.log('✅ Connected successfully');
    conn.close();
  } catch (e) {
    Logger.log('❌ Connection failed: ' + e.message);
  }
}
```

### Gemini API Issues
```javascript
// Test Gemini with simple prompt
function DEBUG_Gemini() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  Logger.log('API Key configured: ' + (apiKey ? 'Yes' : 'No'));
  ORACLE_TestGemini();
}
```

### Scraping Issues
```javascript
// Test fetch for specific URL
function DEBUG_Fetch() {
  const url = 'https://example.com';
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    Logger.log('Status: ' + response.getResponseCode());
    Logger.log('Content length: ' + response.getContentText().length);
  } catch (e) {
    Logger.log('Fetch failed: ' + e.message);
  }
}
```

---

## 📁 File Summary

| File | Lines | Key Classes/Functions |
|------|-------|----------------------|
| `FT_OracleFetcher.gs` | ~1000 | `OracleDeepScraper`, `OracleBatchProcessor`, `ORACLE_StartBatch()` |
| `Oracle_Persistence.gs` | ~700 | `OraclePersistence`, `ORACLE_InitTables()`, `ORACLE_SaveResults()` |
| `Oracle_EEATForensics.gs` | ~800 | `OracleEEATForensics`, `ORACLE_AnalyzeEEAT()`, `ORACLE_CompareEEAT()` |
| `Oracle_ElitePrompt.gs` | ~900 | `OracleElitePromptBuilder`, `OracleGeminiCaller`, `ORACLE_RunIntelligenceAnalysis()` |
| `Oracle_UI_Render.gs` | ~900 | `OracleUIRenderer`, `ORACLE_RenderDashboard()`, `ORACLE_TestRenderer()` |

---

## 🎯 Quick Start Checklist

- [ ] Copy 5 Oracle files to Apps Script
- [ ] Set Script Properties (DB credentials + Gemini API key)
- [ ] Run `ORACLE_InitTables()` to create MySQL tables
- [ ] Run `ORACLE_TestPersistence()` to verify connection
- [ ] Run `ORACLE_TestGemini()` to verify API key
- [ ] Configure competitors in `ORACLE_FETCHER_CONFIG`
- [ ] Run `ORACLE_StartBatch()` to scrape competitors
- [ ] Run `ORACLE_RunIntelligenceAnalysis()` for Gemini analysis
- [ ] Run `ORACLE_RenderDashboard()` to view results

---

## 📞 Support

For issues or feature requests, contact the SerpifAI Engineering team.

**Version:** Oracle v16.0  
**Last Updated:** ${new Date().toISOString().split('T')[0]}
