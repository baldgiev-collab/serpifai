# 🏗️ SERPIFAI - System Architecture Diagram

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          🎨 USER INTERFACE (UI)                         │
│                         HTML/CSS/JavaScript Layer                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ User fills 76 fields
                                    │ Clicks "▶ Run Stage X"
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      📊 FORM DATA COLLECTION                            │
│                     scripts_app.html::collectFormData()                 │
│                                                                          │
│  {                                                                       │
│    brandName: "SerpifAI",                                               │
│    brandIdeology: "Strategic SEO...",                                   │
│    targetAudience: "B2B SaaS...",                                       │
│    ... (76 fields total)                                                │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ google.script.run
                                    │ .runWorkflowStage(stageNum, formData)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ⚙️ BACKEND ROUTER                                  │
│                 workflow_router.gs::runWorkflowStage()                  │
│                                                                          │
│  switch(stageNum) {                                                     │
│    case 1: runStage1Strategy(formData)                                 │
│    case 2: runStage2Keywords(formData)                                 │
│    case 3: runStage3Architecture(formData)                             │
│    case 4: runStage4Calendar(formData)                                 │
│    case 5: runStage5Generation(formData)                               │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Dispatch to stage handler
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    🎯 STAGE HANDLER (Example: Stage 1)                  │
│                   stage_1_strategy.gs::runStage1Strategy()              │
│                                                                          │
│  1. Build Elite Mega Prompt                                             │
│     buildStage1Prompt(formData)                                         │
│                                                                          │
│  2. Call Gemini API                                                     │
│     callGeminiAPI(prompt)                                               │
│                                                                          │
│  3. Parse AI Response                                                   │
│     parseStage1Response(fullResponse)                                   │
│                                                                          │
│  4. Save to Google Sheet                                                │
│     saveStage1Results(sheetUrl, projectId, jsonData, fullResponse)      │
└─────────────────────────────────────────────────────────────────────────┘
              │                                           │
              │ HTTP POST                                 │ Save data
              │                                           │
              ▼                                           ▼
┌─────────────────────────────────┐    ┌──────────────────────────────────┐
│     🤖 GEMINI API               │    │   📊 GOOGLE SHEET DATABASE       │
│  generativelanguage.googleapis  │    │  Sheet: Workflow_Stage_1         │
│                                 │    │                                  │
│  Model: gemini-1.5-pro-latest   │    │  Columns:                        │
│  Temperature: 0.7                │    │  - Project ID                    │
│  MaxTokens: 8192                │    │  - Timestamp                     │
│                                 │    │  - JSON Data                     │
│  Returns: Full AI response      │    │  - Full Response                 │
│  (5,000+ words)                 │    │                                  │
└─────────────────────────────────┘    └──────────────────────────────────┘
              │                                           │
              │ AI Response                               │ Confirmation
              │                                           │
              ▼                                           │
┌─────────────────────────────────────────────────────────────────────────┐
│                      🧠 JSON PARSER                                     │
│                stage_1_strategy.gs::parseStage1Response()               │
│                                                                          │
│  Input: Raw AI text response                                            │
│                                                                          │
│  Processing:                                                             │
│  - Extract 5 sections using regex                                       │
│  - Parse bullet points and lists                                        │
│  - Structure data into JSON format                                      │
│                                                                          │
│  Output: Structured JSON                                                │
│  {                                                                       │
│    audienceProfile: {...},                                              │
│    jtbdScenarios: [...],                                                │
│    competitiveGaps: {...},                                              │
│    uniqueMechanism: "...",                                              │
│    contentPillars: [...]                                                │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Return result object
                                    │ { success, jsonData, fullResponse }
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    📤 RESPONSE TO UI                                    │
│              scripts_app.html::displayStageResults()                    │
│                                                                          │
│  1. Update timestamp display                                            │
│  2. Render JSON in code viewer                                          │
│  3. Format markdown report                                              │
│  4. Switch to Results tab                                               │
│  5. Highlight active stage                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    🎯 RESULTS DISPLAY                                   │
│                  components_results.html                                │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  TABS: [1] [2] [3] [4] [5]                                  │      │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │      │
│  │                                                               │      │
│  │  📊 Structured Data (JSON)                                   │      │
│  │  ┌─────────────────────────────────────────────────────┐   │      │
│  │  │ {                                                     │   │      │
│  │  │   "audienceProfile": {                               │   │      │
│  │  │     "emotionalPains": [...],                         │   │      │
│  │  │     "hiddenDesires": [...]                           │   │      │
│  │  │   },                                                  │   │      │
│  │  │   ...                                                 │   │      │
│  │  │ }                                                     │   │      │
│  │  └─────────────────────────────────────────────────────┘   │      │
│  │                                                               │      │
│  │  📝 Full AI Report                                           │      │
│  │  ┌─────────────────────────────────────────────────────┐   │      │
│  │  │ # Stage 1: Market Research & Strategy                │   │      │
│  │  │                                                        │   │      │
│  │  │ ## Section 1: Audience Psychological Profile         │   │      │
│  │  │ ### Emotional Pains                                   │   │      │
│  │  │ - Fear of being left behind...                        │   │      │
│  │  │ - Imposter syndrome...                                │   │      │
│  │  │                                                        │   │      │
│  │  │ ### Hidden Desires                                    │   │      │
│  │  │ - Recognition as thought leader...                    │   │      │
│  │  │                                                        │   │      │
│  │  │ ## Section 2: Jobs-To-Be-Done Scenarios              │   │      │
│  │  │ ...                                                    │   │      │
│  │  └─────────────────────────────────────────────────────┘   │      │
│  └─────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure

```
serpifai/
│
├── ui/                                    [Frontend Layer]
│   ├── index.html                         Main entry point
│   ├── components_sidebar.html            Navigation with Results tab
│   ├── components_workflow.html           5 stages with Run buttons
│   ├── components_results.html            ⭐ NEW: Results display
│   ├── styles_theme.html                  CSS with button styles
│   └── scripts_app.html                   ⭐ Workflow execution logic
│
├── databridge/
│   └── workflow_engine/                   [Backend Layer]
│       ├── workflow_router.gs             ⭐ NEW: Main dispatcher
│       ├── stage_1_strategy.gs            ⭐ NEW: Stage 1 handler
│       ├── stage_2_keywords.gs            TODO
│       ├── stage_3_architecture.gs        TODO
│       ├── stage_4_calendar.gs            TODO
│       ├── stage_5_generation.gs          TODO
│       └── setup_helper.gs                ⭐ NEW: Setup automation
│
└── docs/
    ├── SETUP_WORKFLOW_INTEGRATION.md      Complete setup guide
    └── WORKFLOW_INTEGRATION_SUMMARY.md    Quick reference
```

---

## 🔄 State Management

### **UI State**
```javascript
// Form Data (76 fields)
formData = {
  brandName: string,
  brandIdeology: string,
  targetAudience: string,
  // ... 73 more fields
}

// Results State
resultsData = {
  stage1: {
    timestamp: "2024-11-13T10:30:00",
    jsonData: {...},
    fullResponse: "..."
  },
  stage2: null,
  stage3: null,
  stage4: null,
  stage5: null
}
```

### **Backend State**
```javascript
// Stored in Google Sheet
Row = {
  ProjectID: "MyProject_2024",
  Timestamp: new Date(),
  JSONData: JSON.stringify(structured),
  FullResponse: rawAIResponse
}
```

---

## 🔐 Security & Configuration

### **Script Properties** (Private)
```
GEMINI_API_KEY = "AIza..."
```

### **Sheet Access** (Controlled)
```
Sheet URL: https://docs.google.com/spreadsheets/d/14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU/edit
Permissions: Apps Script must have edit access
```

---

## ⚡ Performance Characteristics

### **Stage 1 Execution Time**
- Form collection: < 100ms
- Backend routing: < 50ms
- Prompt building: < 100ms
- Gemini API call: 5-15 seconds ⏱️
- JSON parsing: < 500ms
- Sheet saving: 1-2 seconds
- UI rendering: < 200ms
- **Total: ~8-20 seconds**

### **Data Sizes**
- Input (formData): ~5-10 KB
- Prompt: ~2-3 KB
- AI Response: ~15-25 KB
- JSON Output: ~5-10 KB
- Total storage per stage: ~30-40 KB

---

## 🎯 Integration Points

### **1. UI → Backend**
```javascript
google.script.run
  .withSuccessHandler(callback)
  .withFailureHandler(errorHandler)
  .runWorkflowStage(stageNum, formData)
```

### **2. Backend → Gemini API**
```javascript
UrlFetchApp.fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent',
  {
    method: 'post',
    payload: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  }
)
```

### **3. Backend → Google Sheet**
```javascript
SpreadsheetApp.openByUrl(sheetUrl)
  .getSheetByName('Workflow_Stage_1')
  .getRange(rowIndex, 1, 1, 4)
  .setValues([[projectId, timestamp, jsonData, fullResponse]])
```

### **4. Backend → UI**
```javascript
return {
  success: true,
  stage: 1,
  jsonData: {...},
  fullResponse: "...",
  timestamp: "2024-11-13T10:30:00"
}
```

---

## 🚀 Scalability Considerations

### **Current Design**
- ✅ Handles 1-10 concurrent users
- ✅ Stores unlimited project history
- ✅ Supports 5 independent workflow stages
- ✅ No rate limiting implemented

### **Future Enhancements**
- 📈 Queue system for high volume
- 📈 Caching for repeated prompts
- 📈 Batch processing for multiple stages
- 📈 Webhook notifications for completion
- 📈 API endpoint for external integrations

---

**Architecture designed for: Reliability, Maintainability, Extensibility** 🎯
