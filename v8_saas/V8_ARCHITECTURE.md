# V8 ARCHITECTURE - MODULAR REFACTORING PLAN
## SerpifAI Elite v8.0.0

---

## 📊 V7 ANALYSIS SUMMARY

### Largest Files Requiring Decomposition

| File | Lines | Size | Target Modules |
|------|-------|------|----------------|
| `FT_CompetitorKW_Fetcher.gs` | 12,041 | 584KB | 42 modules |
| `UI_Scripts_App.html` | 32,892 | 1.9MB | 114 modules |
| `UI_Elite_Renderer.html` | 7,968 | 323KB | 28 modules |
| `FT_EliteProofExtractors.gs` | 2,288 | 111KB | 8 modules |
| `DB_COMP_EliteOrchestrator.gs` | 2,200 | 99KB | 8 modules |
| `FT_Oracle_Test.gs` | 2,246 | 91KB | 8 modules |

### File Count by Category

| Prefix | Count | Purpose |
|--------|-------|---------|
| FT_ | 35 | Fetcher, API, Scraper |
| DB_ | 28 | DataBridge, Sheets, MySQL |
| UI_ | 32 | HTML, CSS, Client JS |
| Oracle_ | 12 | Legacy Oracle system |
| DIAG/TEST | 15 | Diagnostics (exclude from V8) |
| Other | 36 | Misc/Legacy |

---

## 🏗️ V8 MODULAR ARCHITECTURE

### Core Principles

1. **Maximum 290 lines per file** (strict enforcement)
2. **Three-layer architecture**: FT_, DB_, UI_
3. **Single responsibility per module**
4. **Clear dependency graph**
5. **Centralized globals and config**

---

## 📁 V8 FOLDER STRUCTURE

```
v8_saas/
├── apps_script/
│   ├── appsscript.json
│   │
│   ├── # ═══════════════════════════════════════════
│   ├── # CORE CONFIGURATION (5 files)
│   ├── # ═══════════════════════════════════════════
│   ├── CORE_Config.gs              # Global config, API keys
│   ├── CORE_Globals.gs             # Shared constants
│   ├── CORE_Logger.gs              # Centralized logging
│   ├── CORE_ErrorHandler.gs        # Error handling
│   ├── CORE_Utils.gs               # Shared utilities
│   │
│   ├── # ═══════════════════════════════════════════
│   ├── # FT_ LAYER - DATA FETCHING (45 files)
│   ├── # ═══════════════════════════════════════════
│   ├── FT_Router.gs                # Main entry point
│   ├── FT_Config.gs                # Fetcher configuration
│   ├── FT_Cache.gs                 # Caching layer
│   ├── FT_RateLimit.gs             # Rate limiting
│   │
│   ├── # Competitor Fetcher (was 12,041 lines → 42 modules)
│   ├── FT_Comp_Main.gs             # Orchestrator
│   ├── FT_Comp_Queue.gs            # Queue management
│   ├── FT_Comp_Batch.gs            # Batch processing
│   ├── FT_Comp_State.gs            # State persistence
│   ├── FT_Comp_Triggers.gs         # Trigger management
│   │
│   ├── # Forensic Analysis (15 modules)
│   ├── FT_Forensic_Main.gs         # Entry point
│   ├── FT_Forensic_Audience.gs     # Audience analysis
│   ├── FT_Forensic_Content.gs      # Content analysis
│   ├── FT_Forensic_Conversion.gs   # Conversion analysis
│   ├── FT_Forensic_Distribution.gs # Distribution analysis
│   ├── FT_Forensic_Technical.gs    # Technical analysis
│   ├── FT_Forensic_EEAT.gs         # E-E-A-T signals
│   ├── FT_Forensic_GEO.gs          # GEO/AEO analysis
│   ├── FT_Forensic_Strategy.gs     # Strategy generation
│   ├── FT_Forensic_KillMoves.gs    # Kill moves generator
│   │
│   ├── # API Clients (10 modules)
│   ├── FT_API_Serper.gs            # Serper API
│   ├── FT_API_PageSpeed.gs         # PageSpeed API
│   ├── FT_API_OpenPageRank.gs      # OpenPageRank API
│   ├── FT_API_Gemini.gs            # Gemini AI API
│   ├── FT_API_Gateway.gs           # PHP Gateway client
│   │
│   ├── # Proof Extractors (8 modules)
│   ├── FT_Proof_Schema.gs          # Schema extraction
│   ├── FT_Proof_Headings.gs        # Heading extraction
│   ├── FT_Proof_Content.gs         # Content extraction
│   ├── FT_Proof_Links.gs           # Link extraction
│   ├── FT_Proof_Images.gs          # Image extraction
│   ├── FT_Proof_CWV.gs             # Core Web Vitals
│   ├── FT_Proof_EEAT.gs            # E-E-A-T proof
│   ├── FT_Proof_Keywords.gs        # Keyword extraction
│   │
│   ├── # Oracle System (5 modules)
│   ├── FT_Oracle_Main.gs           # Oracle orchestrator
│   ├── FT_Oracle_Batch.gs          # Batch fetching
│   ├── FT_Oracle_Parse.gs          # HTML parsing
│   ├── FT_Oracle_Store.gs          # Data storage
│   ├── FT_Oracle_Map.gs            # UI data mapping
│   │
│   ├── # ═══════════════════════════════════════════
│   ├── # DB_ LAYER - DATA BRIDGE (30 files)
│   ├── # ═══════════════════════════════════════════
│   ├── DB_Router.gs                # Main router
│   ├── DB_Config.gs                # Database config
│   │
│   ├── # Sheets Operations (8 modules)
│   ├── DB_Sheets_Main.gs           # Sheets orchestrator
│   ├── DB_Sheets_Read.gs           # Read operations
│   ├── DB_Sheets_Write.gs          # Write operations
│   ├── DB_Sheets_Format.gs         # Formatting
│   ├── DB_Sheets_Charts.gs         # Chart creation
│   │
│   ├── # MySQL/Gateway (5 modules)
│   ├── DB_MySQL_Main.gs            # MySQL orchestrator
│   ├── DB_MySQL_Query.gs           # Query builder
│   ├── DB_MySQL_CRUD.gs            # CRUD operations
│   ├── DB_MySQL_Cache.gs           # Response caching
│   │
│   ├── # Competitor Storage (6 modules)
│   ├── DB_Comp_Main.gs             # Storage orchestrator
│   ├── DB_Comp_Store.gs            # Store results
│   ├── DB_Comp_Load.gs             # Load results
│   ├── DB_Comp_Export.gs           # Export data
│   │
│   ├── # Project Management (6 modules)
│   ├── DB_Project_Main.gs          # Project orchestrator
│   ├── DB_Project_CRUD.gs          # Project CRUD
│   ├── DB_Project_Settings.gs      # Settings storage
│   ├── DB_Project_History.gs       # History tracking
│   │
│   ├── # AI/Gemini Integration (5 modules)
│   ├── DB_AI_Main.gs               # AI orchestrator
│   ├── DB_AI_Prompt.gs             # Prompt building
│   ├── DB_AI_Parse.gs              # Response parsing
│   ├── DB_AI_Cache.gs              # AI response cache
│   │
│   ├── # ═══════════════════════════════════════════
│   ├── # UI_ LAYER - USER INTERFACE (60 files)
│   ├── # ═══════════════════════════════════════════
│   │
│   ├── # Main Dashboard
│   ├── UI_Dashboard.html           # Main container
│   ├── UI_Globals.html             # Client-side globals
│   │
│   ├── # Styles (10 modules)
│   ├── UI_Styles_Base.html         # Base styles
│   ├── UI_Styles_Theme.html        # Theme variables
│   ├── UI_Styles_Layout.html       # Layout styles
│   ├── UI_Styles_Components.html   # Component styles
│   ├── UI_Styles_Charts.html       # Chart styles
│   ├── UI_Styles_Cards.html        # Card styles
│   ├── UI_Styles_Tables.html       # Table styles
│   ├── UI_Styles_Forms.html        # Form styles
│   ├── UI_Styles_Animations.html   # Animations
│   ├── UI_Styles_Responsive.html   # Responsive styles
│   │
│   ├── # Components (15 modules)
│   ├── UI_Comp_Header.html         # Header component
│   ├── UI_Comp_Sidebar.html        # Sidebar navigation
│   ├── UI_Comp_Modal.html          # Modal dialogs
│   ├── UI_Comp_Toast.html          # Toast notifications
│   ├── UI_Comp_Loading.html        # Loading states
│   ├── UI_Comp_Cards.html          # Card components
│   ├── UI_Comp_Tables.html         # Table components
│   ├── UI_Comp_Charts.html         # Chart wrappers
│   ├── UI_Comp_Tabs.html           # Tab navigation
│   ├── UI_Comp_Accordion.html      # Accordion
│   ├── UI_Comp_Badges.html         # Badges/Pills
│   ├── UI_Comp_Progress.html       # Progress bars
│   ├── UI_Comp_Tooltips.html       # Tooltips
│   │
│   ├── # Scripts (25 modules - was 32,892 lines)
│   ├── UI_Scripts_Main.html        # Main app entry
│   ├── UI_Scripts_Init.html        # Initialization
│   ├── UI_Scripts_Router.html      # Client router
│   ├── UI_Scripts_State.html       # State management
│   ├── UI_Scripts_API.html         # google.script.run calls
│   ├── UI_Scripts_Events.html      # Event handlers
│   ├── UI_Scripts_Utils.html       # Client utilities
│   │
│   ├── # Feature Scripts
│   ├── UI_Scripts_Competitor.html  # Competitor analysis
│   ├── UI_Scripts_Workflow.html    # Workflow handling
│   ├── UI_Scripts_Project.html     # Project management
│   ├── UI_Scripts_Settings.html    # Settings UI
│   ├── UI_Scripts_Charts.html      # Chart rendering
│   ├── UI_Scripts_Tables.html      # Table rendering
│   ├── UI_Scripts_Export.html      # Export functions
│   │
│   ├── # Renderer (10 modules - was 7,968 lines)
│   ├── UI_Render_Main.html         # Render orchestrator
│   ├── UI_Render_Cards.html        # Card rendering
│   ├── UI_Render_Charts.html       # Chart rendering
│   ├── UI_Render_Tables.html       # Table rendering
│   ├── UI_Render_Metrics.html      # Metrics display
│   ├── UI_Render_Categories.html   # Category tabs
│   ├── UI_Render_KillMoves.html    # Kill moves display
│   │
│   └── # ═══════════════════════════════════════════
│   └── # ENTRY POINTS (3 files)
│   └── # ═══════════════════════════════════════════
│   ├── MAIN_Entry.gs               # doGet() entry
│   ├── MAIN_Handlers.gs            # Server handlers
│   └── MAIN_Menu.gs                # Custom menu

├── .clasp.json                     # Clasp configuration
└── .claspignore                    # Ignore patterns
```

---

## 🔄 MIGRATION STRATEGY

### Phase 1: Core Infrastructure
1. Create CORE_* files (config, globals, logging)
2. Set up clasp.json for new project

### Phase 2: FT_ Layer (Data Fetching)
1. Break down FT_CompetitorKW_Fetcher.gs (12,041 lines)
   - Extract queue management → FT_Comp_Queue.gs
   - Extract batch processing → FT_Comp_Batch.gs
   - Extract forensic generators → FT_Forensic_*.gs
   - Extract proof extractors → FT_Proof_*.gs
2. Migrate API clients → FT_API_*.gs
3. Migrate Oracle system → FT_Oracle_*.gs

### Phase 3: DB_ Layer (Data Bridge)
1. Migrate Sheets operations → DB_Sheets_*.gs
2. Migrate MySQL/Gateway → DB_MySQL_*.gs
3. Migrate competitor storage → DB_Comp_*.gs
4. Migrate project management → DB_Project_*.gs

### Phase 4: UI_ Layer (User Interface)
1. Break down UI_Scripts_App.html (32,892 lines)
   - Extract initialization → UI_Scripts_Init.html
   - Extract state management → UI_Scripts_State.html
   - Extract API calls → UI_Scripts_API.html
   - Extract feature handlers → UI_Scripts_*.html
2. Break down UI_Elite_Renderer.html (7,968 lines)
3. Organize styles → UI_Styles_*.html
4. Organize components → UI_Comp_*.html

### Phase 5: Integration & Testing
1. Update all google.script.run calls
2. Verify dependency graph
3. Test all entry points
4. Deploy to Apps Script

---

## 📋 FILE MAPPING (First 10 Priority Files)

### From FT_CompetitorKW_Fetcher.gs

| Lines | New File | Purpose |
|-------|----------|---------|
| 1-120 | FT_Comp_Main.gs | Class definition, config |
| 121-300 | FT_Comp_Queue.gs | Queue generation |
| 301-500 | FT_Comp_Batch.gs | Batch processing |
| 501-700 | FT_Comp_State.gs | State management |
| 4960-5220 | FT_Forensic_Audience.gs | Audience analysis |
| 5220-5450 | FT_Forensic_Archetypes.gs | Archetype generation |
| 5450-5900 | FT_Forensic_Backlinks.gs | Backlink analysis |
| 5900-6300 | FT_Forensic_Distribution.gs | Distribution forensic |
| 6700-7400 | FT_Forensic_Conversion.gs | Conversion analysis |
| 7400-8400 | FT_Forensic_Content.gs | Content operations |

---

## 🚀 NEXT STEPS

1. **Create V8 folder structure** ✓
2. **Create CORE_* foundation files**
3. **Begin FT_CompetitorKW_Fetcher.gs decomposition**
4. **Create clasp.json for target project**

---

## 📌 TARGET DEPLOYMENT

**Apps Script Project ID:** `1-oQwNaQIUHQUseRNJqKVCiuI5jtP3gEojF0fv931eJirA3GkvxNJWFNl`

```json
{
  "scriptId": "1-oQwNaQIUHQUseRNJqKVCiuI5jtP3gEojF0fv931eJirA3GkvxNJWFNl",
  "rootDir": "apps_script"
}
```

---

*Generated: January 8, 2026*
*Architecture Version: 8.0.0*
