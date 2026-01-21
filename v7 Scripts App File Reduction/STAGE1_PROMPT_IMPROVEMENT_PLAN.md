# 🎯 STAGE 1 GEMINI PROMPT IMPROVEMENT PLAN
## V7.12 - Comprehensive Strategic Intelligence Generation

**Created:** 2025-01-XX  
**Status:** ✅ IMPLEMENTED  
**Priority:** HIGH - Resolves 6-section vs 14-section mismatch

---

## 📋 PROBLEM STATEMENT

### Issue Observed
When running Stage 1 workflow, only **6 narrative sections** are being generated in the markdown report, despite:
1. **14 chart types** defined in JSON schema (`dashboardCharts`)
2. **18 sections** mapped in `CHART_MAP` (UI_Stage1_Renderer.html)
3. **30 Stage 1 input fields** available for analysis
4. Rich competitor analysis data from `buildCompetitorInsightsSection()`

### Root Cause Analysis
1. **JSON Schema vs Markdown Mismatch**: The prompt requests 14 chart types in PART 1 (JSON), but PART 2 (Markdown) only explicitly defines **6 main sections**
2. **Gemini Token Limit**: With 32K output tokens, Gemini may be truncating or condensing output
3. **Section Numbering Confusion**: PART 2 uses "SECTION 1-6" but charts expect more granular sections
4. **Missing Strategic Pillars**: Several critical analysis dimensions are missing from the markdown template

---

## 📊 CURRENT STATE ANALYSIS

### Stage 1 Input Fields (30 fields)
From `CORE_Form_Data.html` - FIELD_IDS array:

| Category | Field Count | Fields |
|----------|-------------|--------|
| **Brand Foundation** | 8 | brandName, brandArchetype, brandIdeology, brandLexicon, uvp, existingMessaging, coreTopic, productOrService |
| **Target Audience** | 5 | targetAudience, secondaryAudience, customerDemographics, geographicFocus, industryVertical |
| **Customer Psychology** | 2 | audiencePains, audienceDesired |
| **Business Objectives** | 4 | quarterlyObjective, northStarKpis, contentGoals, futureVision (from Stage 2) |
| **Competitive Context** | 3 | keyCompetitors, competitiveAdvantages, coreMarketProblem (from Stage 2) |
| **Distribution Strategy** | 3 | primaryChannels, contentFormats, seasonality |
| **Offer & Monetization** | 5 | offerMatrix, primaryOfferName, primaryOfferPrice, upsellOffer, upsellPrice |

**Total Stage 1 Exclusive Fields: 30**

### Current JSON Chart Types (14)
From `buildStage1Prompt()` at line 943-1145:

```
1. customerFrustrationsChart (5-7 items)
2. hiddenAspirationsChart (5-7 items)
3. mindsetTransformationChart (3-5 items)
4. customerJobPriorityChart (5-7 items)
5. competitiveAdvantageMapChart (5-7 dimensions)
6. contentFormatStrategyChart (4-6 formats)
7. brandPositioningChart (4-5 axes)
8. valuePropositionMixChart (4-5 props)
9. strategicContentPillarsChart (3-5 pillars)
10. priorityFocusMatrixChart (3-5 initiatives)
11. marketOpportunityAnalysisChart (3-5 opportunities)
12. blueOceanOpportunitiesChart (3-5 opportunities)
13. competitorKillMovesChart (3-5 kill moves)
14. asymmetricAdvantagesChart (3-5 advantages)
```

### Current Markdown Sections (6)
From prompt PART 2 at lines 1195-1285:

```
SECTION 1: MARKET INTELLIGENCE (1.1-1.3)
SECTION 2: COMPETITIVE KILL ZONE ANALYSIS (2.1-2.3)
SECTION 3: BLUE OCEAN OPPORTUNITIES (3.1-3.3)
SECTION 4: STRATEGIC MOAT CONSTRUCTION (4.1-4.3)
SECTION 5: JOBS-TO-BE-DONE INTELLIGENCE (5.1-5.2)
SECTION 6: ACTION PLAN (6.1-6.3)
```

### UI Expected Sections (18)
From `CHART_MAP` in UI_Stage1_Renderer.html at lines 126-143:

```
1. Customer Frustrations & Pain Points
2. Hidden Aspirations & Desires
3. Mindset Transformation Journey
4. Jobs-To-Be-Done Priority Analysis
5. Competitive Advantage Mapping
6. Strategic Content Format Mix
7. Brand Positioning Matrix
8. Value Proposition Architecture
9. Strategic Content Pillars
10. Priority Focus Matrix
11. Next 90 Days Tactical Roadmap
12. Quick Wins vs Long-term Impact
13. Resource Allocation Strategy
14. Market Opportunity Analysis
15. Risk Assessment Matrix
16. Competitive Intelligence Dashboard
17. Growth Projection Model
18. Strategic Action Plan
```

---

## 🔧 SOLUTION PLAN

### ✅ Phase 1: Align Markdown Sections to Chart Types (IMPLEMENTED)

**Changes Made to `DB_Workflow_Stage1.gs`:**

The PART 2 markdown template has been completely rewritten with:

1. **8 Explicit Main Sections** (up from 6):
   - SECTION 1: Customer Intelligence (→ 3 charts)
   - SECTION 2: Jobs-To-Be-Done Framework (→ 1 chart)
   - SECTION 3: Competitive Warfare (→ 3 charts)
   - SECTION 4: Blue Ocean & Market Opportunities (→ 2 charts)
   - SECTION 5: Brand Positioning & Value Architecture (→ 2 charts)
   - SECTION 6: Content Strategy & Pillars (→ 2 charts)
   - SECTION 7: Strategic Moat Architecture (→ supports all)
   - SECTION 8: Action Plan & Execution Roadmap (→ 1 chart)

2. **Chart-to-Section Mapping**: Each section header now explicitly lists which `dashboardCharts` entries it populates

3. **Input Field Citations**: Each subsection now explicitly references the input fields it should use (e.g., `audiencePains="${getField(...)}"`)

4. **Structured Tables**: Required output now includes markdown tables with specific columns

5. **ERRC Framework**: Blue Ocean section now explicitly requests Eliminate/Reduce/Raise/Create analysis

6. **JTBD Format**: Jobs-To-Be-Done section now has explicit WHEN/HELP ME/SO I CAN format

### ✅ Phase 2: Universal Project Template (IMPLEMENTED)

**Changes Made:**
- Added "Universal Applicability" to quality standards
- Dynamic field references work for any industry
- JTBD framework applies to B2B/B2C/D2C
- Competitive analysis works for any market

### ✅ Phase 3: Enhanced Competitor Intelligence Integration (IMPLEMENTED)

**New Section Added:**
```
**COMPETITOR INTELLIGENCE USAGE:**
When competitor data is provided above, you MUST:
1. Reference specific competitor domains by name
2. Cite their authority scores, traffic, and keyword data
3. Identify specific weaknesses from their technical scores
4. Use their top pages to find content gaps
5. Leverage their backlink profiles to find link opportunities
```

### ✅ Phase 4: Cross-Stage Data Preparation (IMPLEMENTED)

**New Section Added:**
```
## 🔄 CROSS-STAGE DATA PREPARATION

### For Stage 2 (Keyword Discovery):
- Primary Keyword Suggestions
- Secondary Keyword Clusters
- Question Keywords

### For Stage 3 (Content Architecture):
- Recommended Pillars
- Hub-Spoke Relationships
- Internal Linking Priorities

### For Stage 4 (Calendar & Publishing):
- Content Priority Order
- Seasonal Considerations
- Format Cadence

### For Stage 5 (E-E-A-T & Generation):
- Authority Signals to Emphasize
- Trust Anchor Priorities
- Case Study Opportunities
```

---

## 📝 IMPLEMENTATION CHANGES MADE

### File: `DB_Workflow_Stage1.gs`
### Function: `buildStage1Prompt(data)`
### Lines: 743-1380

**Changes Required:**

1. **Expand PART 2 Markdown Template** (lines 1195-1285)
   - Add 8 explicit sections instead of 6
   - Include subsection markers that match chart types
   - Add explicit output requirements for each section

2. **Add Stage-Forward Data Requirements** (new section)
   - Request specific data formats for Stages 2-5
   - Include field mappings for each subsequent stage

3. **Strengthen Competitor Data Integration** (lines 839)
   - Add explicit instructions to cite competitor data
   - Include comparison tables in required output

4. **Add Section Count Validation Instructions**
   - Explicit instruction: "Generate EXACTLY 8 main sections"
   - Include section checklist at end of prompt

---

## ✅ SUCCESS CRITERIA

1. **Section Count:** 8+ main sections in markdown output (currently 6)
2. **Chart Data Coverage:** All 14 chart types populated in JSON
3. **Input Field Utilization:** All 30 Stage 1 fields referenced
4. **Competitor Integration:** Specific competitor data cited in analysis
5. **Cross-Stage Readiness:** Data structures for Stages 2-5 included
6. **Universal Applicability:** Works for SaaS, e-commerce, agency, personal brand

---

## 🔄 NEXT STEPS

1. [x] Read full `buildStage1Prompt()` function (lines 743-1380)
2. [x] Identify exact lines to modify in PART 2
3. [x] Create enhanced markdown template with 8+ sections
4. [x] Add cross-stage data preparation instructions
5. [x] Strengthen competitor data integration
6. [ ] Run `clasp push` to deploy changes
7. [ ] Test with sample project data
8. [ ] Verify 8+ sections generated in output

---

## 📎 REFERENCE FILES

| File | Purpose | Key Lines |
|------|---------|-----------|
| [DB_Workflow_Stage1.gs](DB_Workflow_Stage1.gs) | Stage 1 prompt generation | 743-1380 |
| [UI/CORE_Form_Data.html](UI/CORE_Form_Data.html) | Field IDs definition | 24-73 |
| [UI/UI_Stage1_Renderer.html](UI/UI_Stage1_Renderer.html) | Chart mapping | 126-143 |
| [V711_ELITE_UI_OVERHAUL.md](V711_ELITE_UI_OVERHAUL.md) | Previous UI fixes | All |
