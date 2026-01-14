# 🏗️ SERPIFAI Modular Architecture# SerpifAI - Modular Architecture Documentation



## System Overview## Overview

The codebase has been refactored into a clean, modular architecture that separates concerns and uses real API integrations.

```

┌─────────────────────────────────────────────────────────────────┐## Architecture Principles

│                        GOOGLE SHEET                              │1. **Modular Components**: Each feature is in its own file/module

│                     (Central Coordinator)                        │2. **API-Driven**: Uses Serper, DataForSEO, OpenPageRank, PageSpeed, and Fetcher

└────────────┬────────────────────────────┬──────────────┬────────┘3. **Sheet Integration**: Central config system connects to Google Sheet ID `14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU`

             │                            │              │4. **Project-Based**: User inputs saved in Project Manager, not hardcoded

             │                            │              │5. **Router Pattern**: Single entry point (`DataBridge_handle`) routes to specialized functions

    ┌────────▼────────┐         ┌────────▼───────┐  ┌──▼──────┐

    │   UI PROJECT    │         │   DATABRIDGE   │  │ FETCHER │---

    │   (Sidebar)     │◄────────┤   (Backend)    │  │(Backend)│

    │                 │  HTTP   │                │  │         │## Directory Structure

    │ - index.html    │         │ - workflow     │  │- scrape │

    │ - components    │         │ - AI engine    │  │- parse  │```

    │ - scripts       │         │ - prompts      │  │- extract│databridge/

    │ - Code.gs       │         │ - GSheet save  │  │         │├── helpers/

    └─────────────────┘         └────────────────┘  └─────────┘│   └── config.gs                    # ✅ NEW - Global config & Sheet integration

```├── competitor_analysis/

│   ├── comp_main.gs                 # ✅ NEW - Main router for competitor analysis

---│   ├── comp_overview.gs             # ✅ NEW - AI visibility + SEO metrics

│   ├── comp_market_intel.gs         # ✅ NEW - Market intelligence & gaps

## 📁 Project Structure│   ├── comp_brand_position.gs       # ✅ NEW - Brand archetype & E-E-A-T

│   └── competitor_analysis.gs       # ❌ OLD - Monolithic (will be replaced)

### 1. UI Project (Google Sheets Bound Script)├── workflow_engine/

**Location:** `/app/Code.gs` + `/ui/` folder│   ├── strategy_stage.gs            # 🔄 TO UPDATE - Use CONFIG_getInputs()

**Purpose:** User interface only│   ├── strategy_prompt.gs           # 🔄 TO CREATE

**Deployed as:** Sidebar in Google Sheets│   └── strategy_parser.gs           # 🔄 TO CREATE

├── apis/

**Files:**│   ├── serper_api.gs                # 🔄 TO ENHANCE

```│   ├── dataforseo_api.gs            # 🔄 TO ENHANCE

ui/│   └── openpagerank_api.gs          # 🔄 TO ENHANCE

├── Code.gs                    ← Project manager, getGeminiModels, etc└── router/

├── workflow_connector.gs      ← NEW: Calls DataBridge via HTTP    └── router.gs                    # ✅ UPDATED - New endpoints added

├── index.html```

├── components_*.html

├── scripts_app.html---

└── styles_theme.html

```## Module Descriptions



**Functions:**### 1. Config System (`helpers/config.gs`)

- `include()` - Template engine

- `listProjects()`, `saveProject()`, `loadProject()`, etc.**Purpose**: Central configuration and Google Sheet integration

- `getGeminiModels()` - Get available AI models

- `setGeminiModel()` - Set selected model**Key Functions**:

- `runWorkflowStage()` - **Calls DataBridge, doesn't execute locally**- `CONFIG_getInputs(params)` - Load inputs from Project Manager or Sheet

  - Priority: 1) Project Manager (UI-saved), 2) Global Sheet, 3) Defaults

---- `CONFIG_getMasterInputsFromSheet()` - Read Master Inputs Dashboard tab

- `CONFIG_saveProjectInputs(params)` - Save UI inputs to Project Manager

### 2. DataBridge Project (Standalone Web App)- `CONFIG_savePromptOutput(stage, output, projectId)` - Write to Prompt Outputs

**Location:** `/databridge/` folder- `CONFIG_getStageOutput(stage, projectId)` - Read previous stage output

**Purpose:** Backend logic, AI workflows, data processing- `CONFIG_saveCompetitorData(competitors, projectId)` - Save to Competitors tab

**Deployed as:** Web App (publicly accessible URL)- `CONFIG_getCompetitorData(projectId)` - Load competitor data



**Files:****Sheet Tabs**:

```- `Master Inputs Dashboard` - Column A=Field Name, B=Value, C=Additional

databridge/- `Prompt Outputs` - Column A=Strategy, B=Keywords, C=Clustering, D=Calendar, E=Generate

├── main.gs                          ← NEW: Entry point (doGet/doPost)- `Calendar` - Content calendar

├── workflow_engine/- `Competitors` - Competitor analysis results

│   ├── workflow_router.gs          ← Routes workflow stages- `QA Scores` - Quality scores

│   ├── stage_1_strategy.gs         ← Stage 1 implementation- `Performance` - Performance metrics

│   ├── stage_2_keywords.gs         ← Stage 2 (to implement)

│   ├── stage_3_architecture.gs     ← Stage 3 (to implement)---

│   ├── stage_4_calendar.gs         ← Stage 4 (to implement)

│   └── stage_5_generation.gs       ← Stage 5 (to implement)### 2. Competitor Analysis (Modular)

├── ai_engine/

│   ├── gemini_client.gs#### A. Main Router (`comp_main.gs`)

│   ├── prompt_builder.gs

│   └── reasoning_tools.gs**Purpose**: Orchestrates competitor analysis across multiple modules

└── helpers/

    ├── logger.gs**Key Function**:

    └── sheet_helpers.gs```javascript

```COMP_analyzeCompetitors({

  competitors: ['https://example.com', 'https://competitor.com'],

**API Endpoints:**  categories: 'all' | ['overview', 'marketIntel', 'brandPosition'],

- `POST /exec` with `{ action: "workflow:stage1", data: {...} }`  projectId: 'active',

- Returns: `{ success: true, jsonData: {...}, fullResponse: "..." }`  includeAI: true,

  includeSEO: true

---})

```

### 3. Fetcher Project (Standalone Web App)

**Location:** `/fetcher/` folder**Returns**:

**Purpose:** Web scraping, data extraction```javascript

**Deployed as:** Web App (publicly accessible URL){

  ok: true,

**Files:**  timestamp: '2025-11-11T...',

```  competitorCount: 2,

fetcher/  competitors: [

├── fetch_single_url.gs    {

├── fetch_multi_url.gs      domain: 'example.com',

├── extract_*.gs      url: 'https://example.com',

└── fetcher_router.gs      categories: {

```        overview: {...},

        marketIntel: {...},

---        brandPosition: {...}

      }

## 🔄 Communication Flow    }

  ],

### Workflow Execution Example (Stage 1):  aggregates: {

    avgAIVisibility: 75,

```    avgAuthorityScore: 65,

1. USER clicks "Run Stage 1" button in UI    avgOrganicTraffic: 150000,

   ↓    avgBacklinks: 5000,

2. UI JavaScript calls: google.script.run.runWorkflowStage(1, formData)    avgEEATScore: 70

   ↓  },

3. ui/workflow_connector.gs executes:  benchmarks: {

   - Prepares payload: { action: "workflow:stage1", data: formData }    targetAIVisibility: 90,      // 120% of average

   - Makes HTTP POST to DataBridge URL    targetAuthorityScore: 78,

   ↓    targetOrganicTraffic: 180000,

4. databridge/main.gs receives request:    targetBacklinks: 6000,

   - Parses payload    targetEEATScore: 84

   - Routes to workflow_router.gs  },

   ↓  recommendations: [

5. databridge/workflow_engine/workflow_router.gs:    {

   - Calls runStage1Strategy(formData)      priority: 'high',

   ↓      category: 'AI Visibility',

6. databridge/workflow_engine/stage_1_strategy.gs:      issue: 'Competitors have low AI visibility',

   - Calls Gemini API      opportunity: 'Capture AI search market share',

   - Processes AI response      actions: [...],

   - Saves to Google Sheet      estimatedImpact: 'High - AI search is growing rapidly'

   - Returns result    }

   ↓  ]

7. DataBridge returns JSON response to UI}

   ↓```

8. UI displays results in Results tab

```#### B. Overview Module (`comp_overview.gs`)



---**Purpose**: AI visibility + SEO authority metrics (like Ahrefs Overview tab)



## 🚀 Deployment Steps**APIs Used**:

- Serper (search data, mentions)

### Step 1: Deploy DataBridge Project- OpenPageRank (domain authority)

- Fetcher (page analysis)

1. Open terminal in `/databridge/` folder:

```bash**Key Function**:

cd c:\Users\baldg\OneDrive\Documents\GitHub\serpifai\databridge```javascript

clasp pushCOMP_getOverview({

```  domain: 'example.com',

  url: 'https://example.com',

2. Go to Apps Script editor for DataBridge project  includeAI: true,

3. Click **Deploy** → **New deployment**  includeSEO: true

4. Type: **Web app**})

5. Settings:```

   - Execute as: **Me**

   - Who has access: **Anyone** (or specific users)**Returns**:

6. Click **Deploy**```javascript

7. Copy the **Web App URL** (ends with `/exec`){

8. **IMPORTANT:** Save this URL!  domain: 'example.com',

  aiVisibility: {

### Step 2: Update UI Project with DataBridge URL    score: 87,                    // 0-100

    totalMentions: 19500,

1. Open `ui/workflow_connector.gs`    citedPages: 5700,

2. Update line 8:    byPlatform: {

```javascript      chatGPT: { mentions: 6400, pages: 3500, trend: 12 },

const DATABRIDGE_ENDPOINT = 'YOUR_DATABRIDGE_URL_HERE';      aiOverview: { mentions: 9300, pages: 1900, trend: 8 }

```    },

    readinessScore: 85,

3. Push UI project:    distribution: [{ country: 'US', visibility: 87, mentions: 19500 }]

```bash  },

cd c:\Users\baldg\OneDrive\Documents\GitHub\serpifai  seo: {

clasp push    authorityScore: 73,           // OpenPageRank

```    authorityLevel: 'Industry Leader',

    organicTraffic: 3800000,

### Step 3: Test Connection    organicKeywords: 513500,

    backlinks: 4300000,

1. Open Google Sheet    referringDomains: 117900

2. **Extensions → Apps Script**  },

3. Run function: `testDataBridgeConnection()`  traffic: {

4. Check logs - should see "DataBridge is online"    total: 4000000,

    organic: 3800000,

### Step 4: Test Workflow    paid: 3100,

    referral: 100000

1. Open SERPIFAI sidebar  },

2. Fill in Stage 1 fields  keywords: {

3. Click "Run Stage 1"    total: 513500,

4. Check results appear in Results tab    positionDistribution: {

      top3: 45000,

---      position4to10: 120000

    },

## 📝 Configuration Checklist    topKeywords: [...]

  },

### UI Project (Apps Script Editor)  competitors: [...],

- [ ] Has ONLY these files: `app/Code.gs`, `ui/*`  recommendations: [...]

- [ ] Does NOT have any `databridge/` or `fetcher/` files}

- [ ] `workflow_connector.gs` has correct DataBridge URL```

- [ ] Deployed as: Container-bound script (to Google Sheet)

#### C. Market Intelligence Module (`comp_market_intel.gs`)

### DataBridge Project (Apps Script Editor)

- [ ] Has ALL files from `/databridge/` folder**Purpose**: Market positioning, category gaps, trend analysis

- [ ] Has `main.gs` as entry point

- [ ] Has `workflow_router.gs` and all stage files**APIs Used**:

- [ ] Deployed as: Web app (public URL)- Serper (market data, news)

- [ ] Script Properties has `GEMINI_API_KEY`- Fetcher (content analysis)



### Fetcher Project (Apps Script Editor)**Key Function**:

- [ ] Has ALL files from `/fetcher/` folder```javascript

- [ ] Deployed as: Web app (public URL)COMP_analyzeMarketIntel({

  domain: 'example.com',

---  url: 'https://example.com'

})

## 🔧 Troubleshooting```



### Issue: "runWorkflowStage is not a function"**Returns**:

**Cause:** UI project doesn't have `workflow_connector.gs````javascript

**Fix:** Make sure `ui/workflow_connector.gs` is pushed to Apps Script{

  categoryMapping: {

### Issue: Backend code appearing as text in UI    mainCategory: 'SaaS',

**Cause:** DataBridge files were pushed to UI project    subNiches: ['SEO', 'Content Marketing', 'AI Tools'],

**Fix:**     volumeTrends: 45000,

1. Open UI project in Apps Script editor    growthVelocity: 23,           // % growth

2. Delete any files from `databridge/` folder    nicheCount: 12

3. Keep only `app/Code.gs` and `ui/*` files  },

  marketShare: {

### Issue: "DataBridge returned HTTP 404"    trafficSharePercent: 18,

**Cause:** Wrong URL or DataBridge not deployed    brandMentions: 125000,

**Fix:**    shareOfVoiceRank: 3

1. Open DataBridge project  },

2. Deploy as web app  categoryNarrative: {

3. Copy correct URL to `workflow_connector.gs`    coreStoryFraming: 'AI-powered SEO automation',

    narrativeArchetype: 'Sage',   // Detected from content

### Issue: Stage 1 not working    messageDensity: 45,            // key phrases per 1000 words

**Cause:** `runStage1Strategy` not defined in DataBridge    keyMessages: [...]

**Fix:** Make sure `stage_1_strategy.gs` is in DataBridge project  },

  categoryGaps: {

---    underservedSpaces: [

      'What are alternatives to X?',

## 🎯 Next Steps      'How to do Y without Z?'

    ],

1. **Deploy DataBridge** as web app    missingNarrativePercent: 35,

2. **Copy URL** to `workflow_connector.gs`    gapIndex: 65,                  // opportunity index

3. **Push UI project** with `clasp push`    opportunities: [...]

4. **Test** in Google Sheet  },

  trendForecasting: {

Your modular architecture will now be clean and maintainable! 🎉    fundingRounds: [...],

    partnerships: [...],
    emergingTopicMomentum: 45,
    trendDirection: 'rising'
  }
}
```

#### D. Brand Positioning Module (`comp_brand_position.gs`)

**Purpose**: Brand archetype, value proposition, E-E-A-T signals

**APIs Used**:
- Fetcher (homepage analysis, schema extraction)
- Serper (mentions, citations)
- OpenPageRank (authority)

**Key Function**:
```javascript
COMP_analyzeBrandPosition({
  domain: 'example.com',
  url: 'https://example.com'
})
```

**Returns**:
```javascript
{
  brandArchetype: {
    type: 'Sage',                  // Hero, Sage, Explorer, Caregiver, etc.
    toneConsistency: 85,           // 0-100
    alignmentScore: 78,
    characteristics: ['Sage', 'Hero']
  },
  valueProposition: {
    headline: 'AI-Powered SEO Made Simple',
    coreOffers: ['Keyword Research', 'Content Optimization', 'Rank Tracking'],
    benefits: ['Increase Traffic', 'Save Time', 'Boost Rankings'],
    differentiation: ['Only AI-first platform', 'Better than competitors'],
    uvpClarityScore: 85
  },
  uniqueMechanism: {
    proprietaryFrameworks: ['RankBoost™', 'ContentIQ®'],
    methodologies: ['AI-First Method', 'Smart Clustering System'],
    perceivedUniquenessIndex: 75
  },
  eeatSignals: {
    expertise: 85,                 // 0-100
    experience: 70,
    authoritativeness: 80,
    trustworthiness: 75,
    overallScore: 78,
    credentials: [...],
    schema: ['Organization', 'Article', 'Person'],
    reviews: [...]
  },
  categoryOwnership: {
    conversationLeadership: 60,    // % presence in top results
    backlinks: 5000,
    mentions: 125000,
    ownershipPercent: 45
  }
}
```

---

### 3. Router (`router/router.gs`)

**Updated Endpoints**:

```javascript
// Competitor Analysis (Modular)
case 'comp:analyze':       return COMP_analyzeCompetitors(payload);
case 'comp:overview':      return COMP_getOverview(payload);
case 'comp:marketIntel':   return COMP_analyzeMarketIntel(payload);
case 'comp:brandPosition': return COMP_analyzeBrandPosition(payload);

// Config & Project Inputs
case 'config:getInputs':   return CONFIG_getInputs(payload);
case 'config:saveInputs':  return CONFIG_saveProjectInputs(payload);
case 'config:saveOutput':  return CONFIG_savePromptOutput(payload.stage, payload.output, payload.projectId);
case 'config:getOutput':   return CONFIG_getStageOutput(payload.stage, payload.projectId);
```

---

## Data Flow

### 1. User Inputs Project Data (UI)
```
User enters brand info → UI → DataBridge_handle('project:save', {...})
→ PM_saveProject() → Stores in project_settings sheet
```

### 2. Run Competitor Analysis
```
UI → DataBridge_handle('comp:analyze', {
  competitors: ['https://competitor1.com'],
  categories: 'all',
  projectId: 'active'
})
→ COMP_analyzeCompetitors()
  → COMP_getOverview() → Calls Serper, OpenPageRank, Fetcher
  → COMP_analyzeMarketIntel() → Analyzes market gaps
  → COMP_analyzeBrandPosition() → Extracts E-E-A-T signals
→ CONFIG_saveCompetitorData() → Saves to Competitors sheet
→ Returns aggregated results + recommendations
```

### 3. Run Strategy Stage
```
UI → DataBridge_handle('wf:strategy', {
  project_id: 'active'
})
→ WF_strategyStage()
  → CONFIG_getInputs({ project_id: 'active' })
    → PM_loadProject() → Gets inputs from project_settings
  → STRAT_buildPrompt(inputs) → Builds Gemini prompt
  → APIS_geminiCall() → Sends to Gemini API
  → STRAT_parseOutput() → Parses 5-part response
  → CONFIG_savePromptOutput('strategy', output, 'active')
    → Saves to Prompt Outputs sheet Column A
→ Returns strategy output
```

---

## API Integration Patterns

### Serper API
```javascript
APIS_serperSearch(query)
→ Returns: { ok, status, body: JSON }
```

**Use Cases**:
- Brand mentions (`domain`)
- Market research (`domain + keywords`)
- Competitor discovery (`domain alternatives`)
- News & trends (`domain news`)

### OpenPageRank API
```javascript
APIS_openPageRankFetch(domain)
→ Returns: { ok, status, body: { response: [{ page_rank_decimal, rank }] } }
```

**Use Cases**:
- Domain authority (0-10 scale, convert to 0-100)
- Backlink estimates
- Link velocity

### Fetcher API
```javascript
FET_handle('fetchSingleUrl', { url })
→ Returns: { ok, html, ... }

FET_handle('extractMetadata', { html })
→ Returns: { ok, data: { title, description, ... } }

FET_handle('extractSchema', { html })
→ Returns: { ok, data: { types: [...], ... } }
```

**Use Cases**:
- Homepage analysis
- Schema extraction
- Heading structure
- Content analysis

---

## Next Steps

### Immediate (To Complete Modular Refactor)
1. ✅ Create `config.gs` - DONE
2. ✅ Create `comp_main.gs` - DONE
3. ✅ Create `comp_overview.gs` - DONE
4. ✅ Create `comp_market_intel.gs` - DONE
5. ✅ Create `comp_brand_position.gs` - DONE
6. ✅ Update `router.gs` - DONE
7. 🔄 Delete old `competitor_analysis.gs` - Pending
8. 🔄 Test API integrations - Pending

### Medium Term (Strategy Engine)
1. Create `strategy_prompt.gs` - Prompt builder
2. Create `strategy_parser.gs` - Response parser
3. Update `strategy_stage.gs` - Use CONFIG_getInputs()
4. Test full workflow: Input → Strategy → Output

### Long Term (Remaining Modules)
1. Keyword Stage
2. Clustering Stage
3. Calendar Stage
4. Content Generation Stage
5. QA Checkers (8 types)
6. Publishing Engine
7. Performance Dashboard
8. UI Integration

---

## Testing Guide

### Test Competitor Analysis
```javascript
// Test Overview Module
var result = COMP_getOverview({
  domain: 'ahrefs.com',
  url: 'https://ahrefs.com',
  includeAI: true,
  includeSEO: true
});
Logger.log(JSON.stringify(result, null, 2));

// Test Full Analysis
var result = COMP_analyzeCompetitors({
  competitors: ['https://ahrefs.com', 'https://semrush.com'],
  categories: 'all',
  projectId: 'test-001'
});
Logger.log(JSON.stringify(result, null, 2));
```

### Test Config System
```javascript
// Get inputs
var inputs = CONFIG_getInputs({ project_id: 'active' });
Logger.log(JSON.stringify(inputs, null, 2));

// Save competitor data
CONFIG_saveCompetitorData([
  { domain: 'ahrefs.com', categories: {...} }
], 'test-001');
```

---

## Benefits of Modular Architecture

1. **Easy to Understand**: Each file has one clear purpose
2. **Easy to Test**: Test modules independently
3. **Easy to Extend**: Add new modules without touching existing code
4. **API-Driven**: Real data from Serper, OpenPageRank, Fetcher
5. **Reusable**: Modules can be called from anywhere
6. **Maintainable**: Small files are easier to debug and update
7. **Scalable**: Add new competitors or categories without performance issues

---

## File Sizes (Approximate)
- `config.gs`: 450 lines
- `comp_main.gs`: 300 lines
- `comp_overview.gs`: 400 lines
- `comp_market_intel.gs`: 350 lines
- `comp_brand_position.gs`: 450 lines

**Total New Code**: ~1950 lines (vs 1700+ lines in old monolithic file)
**Advantage**: Modular = easier to navigate and maintain
