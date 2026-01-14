# SerpifAI v6 - AI-Powered SEO Content Workflow System

**Enterprise-grade SEO content generation and competitor intelligence platform with 3-tier credit system**

## 🎯 System Overview

SerpifAI v6 is a complete refactor into a standalone SaaS architecture with:
- **Single Apps Script Web App** - Unified UI & business logic
- **Hostinger PHP Gateway** - Secure API proxy with credit system
- **MySQL Database** - User management, projects, transactions
- **3-Tier Plans** - Starter (20), Pro (100), Agency (200) credits/month

## 📁 Project Structure

```
serpifai/
├── v6_saas/                          # NEW v6 SaaS Architecture
│   ├── apps_script/                  # Single Apps Script Project
│   │   ├── UI_Gateway.gs            # PHP Gateway connector
│   │   ├── UI_Main.gs               # Main UI functions
│   │   ├── UI_ProjectManager.gs     # Database-backed projects
│   │   ├── UI_Dashboard.html        # Main dashboard
│   │   ├── UI_Components_*.html     # 13 UI components
│   │   ├── UI_Elite_*.html          # 4 Elite competitor files
│   │   ├── UI_Charts_*.html         # 3 Chart engines
│   │   └── UI_*.html                # Styles, scripts, data mapper
│   └── hostinger_php/               # PHP Gateway (Hostinger)
│       ├── config.php               # API keys & credit costs
│       ├── database.sql             # MySQL schema (6 tables)
│       ├── api_gateway.php          # Main request router
│       ├── apis/                    # API proxies (Gemini, Serper)
│       ├── handlers/                # 5 business logic handlers
│       └── stripe/                  # Payment webhook
│
├── databridge/                       # EXISTING Business Logic (96 files)
│   ├── router/                      # Request routing
│   ├── workflow_engine/             # 5-stage workflow
│   ├── ai_engine/                   # Gemini integration
│   ├── competitor_intelligence/     # Elite 15-category analysis
│   ├── content_engine/              # Content generation
│   ├── qa_engine/                   # E-E-A-T, AEO, GEO checkers
│   ├── publishing_engine/           # WordPress, Notion, Ghost
│   ├── performance_engine/          # Analytics & decay detection
│   ├── technical_seo/               # Page speed, schema, vitals
│   ├── project_manager/             # Project CRUD
│   ├── bulk_engine/                 # Batch processing
│   ├── backlinks/                   # OpenPageRank integration
│   ├── helpers/                     # Config, logger, JSON utils
│   └── web_app/                     # Deployment entry point
│
├── ui/                              # EXISTING UI Components (25 files)
│   └── [Original HTML components - reference only]
│
├── fetcher/                         # EXISTING URL Fetcher (15 files)
│   └── [Cheerio-based content extraction]
│
└── [Documentation - 12 essential files]
    ├── ARCHITECTURE.md              # System architecture
    ├── API_KEYS_REFERENCE.md        # API configuration
    ├── V6_DATA_STRUCTURE.md         # Data models
    ├── ELITE_SYSTEM_MAP.md          # Competitor intelligence
    └── [8 more implementation guides]
```

## 🚀 Migration Status

### ✅ COMPLETED (50 files)

**Phase 1: PHP Gateway Infrastructure (13 files)**
- MySQL database with 6 tables (users, api_transactions, projects, topup_purchases, webhook_logs, api_cache)
- Complete credit system with costs for 40+ actions
- API gateway router with authentication
- Handlers: Project, Workflow, Competitor, Fetcher, Content, Stripe
- Security: .htaccess, .gitignore

**Phase 2: Apps Script Core (3 files)**
- `UI_Gateway.gs` - 400+ lines universal PHP connector
- `UI_Main.gs` - All 27 UI functions migrated
- `UI_ProjectManager.gs` - Database-backed project management

**Phase 3: UI Components (27 files - 100%)**
- Complete dashboard with all components
- 5-stage workflow (81 form fields)
- Elite competitor intelligence (4 files)
- Chart engines (3 files)
- All styles, scripts, and utilities

### 🔄 IN PROGRESS

**Phase 4: DataBridge Core Migration**
- Need to migrate 96 .gs files to v6_saas/apps_script/
- Prefix convention: `DB_` for DataBridge files
- Route all API calls through UI_Gateway.gs → PHP Gateway

### 📋 PENDING

**Phase 5: Fetcher Migration** (~15 files)
- Prefix: `FT_` for Fetcher files
- Remote fetcher with Cheerio for content extraction

**Phase 6: Final Integration**
- Create appsscript.json manifest
- End-to-end testing
- Deployment documentation

## 🔑 API Keys Configuration

All API keys are stored securely in `v6_saas/hostinger_php/config.php`:

```php
// AI & Search APIs
define('GEMINI_API_KEY', 'AIzaSyClWii1Vktx1izC0WnYRlyFwbi9pFgk_1E');
define('SERPER_API_KEY', 'f7dc4d3ac3252f2cdb8281c4cf57200223e1d1d2');
define('PAGE_SPEED_KEY', 'AIzaSyCqYuEgWHKVxL3EtaY1MhLmEm-eGFLF2Cc');
define('OPEN_PAGERANK_KEY', 'w00ckwcko4g8c0so4wcc040owwwswck8sgsg4sc4');
```

**⚠️ Never expose these keys in client-side code!** All API requests route through the PHP Gateway.

## 💳 Credit System

### Plans & Limits
- **Starter**: 20 credits/month
- **Pro**: 100 credits/month
- **Agency**: 200 credits/month

### Credit Costs (Sample)
- Workflow Stage 1-3: 2 credits each
- Workflow Stage 4-5: 3 credits each
- Elite Competitor Analysis: 5 credits
- Content Generation: 3 credits
- QA Check: 1 credit
- URL Fetch: 1 credit

### Top-Up Options
- 50 credits: $9.99
- 100 credits: $17.99
- 250 credits: $39.99

## 🗄️ Database Schema

**Users Table:**
```sql
- id, email, license_key
- plan_type (starter, pro, agency)
- credits_remaining, credits_monthly_limit
- subscription_status, stripe_customer_id
```

**API Transactions:**
```sql
- user_id, action_type, credits_used
- timestamp, success/failure
```

**Projects:**
```sql
- user_id, project_name, project_data (JSON)
- created_at, updated_at
```

**Plus:** topup_purchases, webhook_logs, api_cache

## 🔧 Development Workflow

### 1. Local Development
```bash
# Work on files in respective folders
databridge/       # Business logic
ui/               # UI components (reference)
fetcher/          # Content extraction
```

### 2. Migration Process
```bash
# Copy files to v6_saas/apps_script/ with prefixes
databridge/ai_engine/gemini_client.gs → DB_AI_GeminiClient.gs
fetcher/fetch_single.gs → FT_FetchSingle.gs
```

### 3. Update API Calls
Replace direct API calls with gateway calls:
```javascript
// OLD (v5)
const response = UrlFetchApp.fetch(GEMINI_API_URL, options);

// NEW (v6)
const response = callGateway({
  action: 'gemini:chat',
  data: { prompt, model }
});
```

### 4. Deploy to Apps Script
- Copy all `UI_*.gs` and `UI_*.html` files
- Deploy as Web App (Execute as: User)
- Update PHP Gateway with deployment URL

## 📚 Key Documentation

1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system design
2. **[V6_DATA_STRUCTURE.md](V6_DATA_STRUCTURE.md)** - Data models & API contracts
3. **[ELITE_SYSTEM_MAP.md](ELITE_SYSTEM_MAP.md)** - 15-category competitor intelligence
4. **[API_KEYS_REFERENCE.md](API_KEYS_REFERENCE.md)** - API configuration guide
5. **[MIGRATION_STRATEGY.md](v6_saas/MIGRATION_STRATEGY.md)** - Migration roadmap

## 🎨 Features

### 5-Stage Workflow
1. **Market Research & Strategy** - Brand narrative, audience, competitive positioning (22 fields)
2. **Keyword Discovery** - Keywords, entities, market intelligence (10 fields)
3. **Clustering & Architecture** - Content pillars, internal linking (10 fields)
4. **Content Calendar** - Planning & visual strategy (3 fields)
5. **Content Generation** - Final content with E-E-A-T signals (36 fields)

### Elite Competitor Intelligence (15 Categories)
- Market + Category Intelligence
- Brand & Strategic Positioning
- Technical SEO & Performance
- Organic Traffic & Content Intelligence
- Keyword & Entity Strategy
- Content Systems & Operations
- Conversion & Monetization
- Distribution & Visibility
- Audience & Psychological Intelligence
- GEO + AEO Intelligence
- Authority & Influence
- Performance & Predictive Intelligence
- Strategic Opportunity Matrix
- Plus: Scoring & Visualization Engine

### Quality Assurance
- E-E-A-T Checker
- AEO Optimization
- GEO Compliance
- Readability Analysis
- Semantic Depth

## 🔐 Security

- All API keys server-side only
- User authentication via license keys
- Credit validation on every request
- Rate limiting per plan tier
- SQL injection prevention
- XSS protection

## 📊 Analytics & Monitoring

- Complete transaction logging
- Credit usage tracking
- API performance metrics
- Error tracking & debugging
- User activity monitoring

## 🚀 Next Steps

1. **Continue DataBridge Migration** (96 files remaining)
   - Start with core: Router, Config, Helpers
   - Then modules: AI Engine, Workflow Stages
   - Finally: Specialized engines (Competitor, Content, QA, etc.)

2. **Migrate Fetcher** (15 files)
   - Remote fetcher architecture
   - Content extraction with Cheerio

3. **Create appsscript.json**
   - Define all function scopes
   - OAuth requirements

4. **End-to-End Testing**
   - Test complete workflow
   - Verify credit deductions
   - Test elite competitor analysis

5. **Deployment**
   - Deploy to Apps Script
   - Configure PHP Gateway on Hostinger
   - Set up MySQL database
   - Configure Stripe webhooks

## 📝 Changelog

### v6.0.0 (November 2025) - Major Refactor
- ✅ Complete architecture redesign
- ✅ PHP Gateway implementation
- ✅ MySQL database integration
- ✅ 3-tier credit system
- ✅ UI migration complete (27 files)
- 🔄 DataBridge migration in progress

### v5.x (2024-2025) - Original Multi-Project System
- Separate UI, DataBridge, Fetcher projects
- Direct API calls from Apps Script
- PropertiesService for storage
- Google Sheets for competitor data

## 📞 Support

For issues or questions about the migration:
1. Check documentation files in root directory
2. Review `v6_saas/IMPLEMENTATION_STATUS.md`
3. Examine `v6_saas/MIGRATION_STRATEGY.md`

## 📄 License

Proprietary - SerpifAI Enterprise System

---

**Status:** 🟢 Active Development | **Phase:** UI Complete, DataBridge Migration In Progress | **Version:** 6.0.0-beta
