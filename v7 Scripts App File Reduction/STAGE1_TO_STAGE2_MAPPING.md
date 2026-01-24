# 🔗 FORENSIC DATA BRIDGE: Stage 1 → Stage 2 Implementation Plan

> **Mission**: Automatically populate Stage 2 input fields from Stage 1 strategic intelligence, eliminating manual data re-entry and ensuring strategic alignment continuity.

---

## 🚨 CRITICAL FIX: Duplicate Field IDs

**ISSUE IDENTIFIED**: Stage 1 and Stage 2 share duplicate field IDs causing DOM conflicts:

| Field ID | Stage 1 Location | Stage 2 Location | Resolution |
|----------|------------------|------------------|------------|
| `coreMarketProblem` | Line 108 | Line 193 | Rename Stage 2 → `s2_coreMarketProblem` |
| `futureVision` | Line 135 | Line 196 | Rename Stage 2 → `s2_futureVision` |
| `primaryKeyword` | N/A | Line 202 | Keep as-is (Stage 2 only) |

---

## ✅ EXECUTION CHECKLIST

### PHASE 1: Fix ID Collisions (UI_Components_Workflow.html)
- [x] Rename Stage 2 `coreMarketProblem` → `s2_coreMarketProblem`
- [x] Rename Stage 2 `futureVision` → `s2_futureVision`
- [x] Add forensic bridge banner HTML component
- [x] Update labels to show "Stage 2" context

### PHASE 2: Backend Bridge (DB_Workflow_Stage1.gs)
- [x] Add `extractForensicBridge()` function after Stage 1 completion
- [x] Extract 10 fields from JSON + report sections
- [x] Return bridge object in Stage 1 success response

### PHASE 3: UI Bridge (UI_Stage2_Bridge.html - NEW FILE)
- [x] Create listener for Stage 1 completion
- [x] Map `forensicBridge` → Stage 2 input fields
- [x] Add read-only context banners
- [x] Apply `.field-notarized` styling

### PHASE 4: Styling (UI_Styles_Command_Canvas.html)
- [x] Add `.field-notarized` shimmering border CSS
- [x] Add `.forensic-bridge-banner` CSS
- [x] Add theme-aware color variants (Dark, Aurora, Neon)

### PHASE 5: Integration (UI_Stage_Runner.html)
- [x] Cache forensicBridge to ORACLE_STATE
- [x] Dispatch stage1Complete event

---

## 📦 FORENSIC DATA BRIDGE JSON SCHEMA

```javascript
// Returned in DB_Workflow_Stage1() success response
{
  success: true,
  stage: 1,
  json: {...},         // Existing Stage 1 JSON
  report: "...",       // Existing Stage 1 report
  
  // NEW: Forensic Data Bridge
  forensicBridge: {
    _meta: {
      version: "1.0.0",
      createdAt: "ISO8601",
      projectId: "string"
    },
    
    strategicContext: {
      brandName: "From Stage 1 input",
      targetAudience: "From Stage 1 input → Read-only banner",
      businessGoal: "From quarterlyObjective → Read-only banner"
    },
    
    autoPopulation: {
      coreStrategicQuestion: { value: "...", sourceSection: 4, notarized: true },
      thesis: { value: "...", sourceSection: 5, notarized: true },
      antithesis: { value: "...", sourceSection: 3, notarized: true },
      keyMarketData: { value: "...", sourceSection: 1, notarized: true },
      categoryDefinition: { value: "...", sourceSection: 4, notarized: true },
      s2_coreMarketProblem: { value: "...", sourceSection: 1, notarized: true },
      s2_futureVision: { value: "...", sourceSection: 4, notarized: true },
      primaryKeyword: { value: "...", sourceSection: 6, notarized: true },
      secondaryKeywords: { value: "...", sourceSection: 6, notarized: true },
      keywordsEntities: { value: "...", sourceSection: [3,6,9], notarized: true }
    }
  }
}
```

---

## 📊 STAGE 1 SOURCE SECTIONS

| Section # | Title | Stage 2 Field(s) Populated |
|-----------|-------|---------------------------|
| **1** | Customer Pain & Frustrations | `keyMarketData`, `coreMarketProblem` |
| **2** | Jobs-to-Be-Done Scenarios | (Context for distillation) |
| **3** | Competitive Gaps & Kill Moves | `antithesis`, `keywordsEntities` |
| **4** | Blue Ocean Opportunities | `coreStrategicQuestion`, `categoryDefinition`, `futureVision` |
| **5** | Brand Positioning | `thesis` |
| **6** | Content Pillars | `primaryKeyword`, `secondaryKeywords`, `keywordsEntities` |
| **7** | Strategic Moats | (Context for distillation) |
| **8** | Action Plan Matrix | (Context for distillation) |
| **9** | AEO Optimization | `keywordsEntities` |
| **10** | Digital Asset Valuation | (Context for distillation) |
| **11** | Algorithmic Brittleness | (Context for distillation) |
| **12** | Information Black Holes | (Context for distillation) |
| **13** | Strategic Imperatives | (Context for distillation) |
| **14** | Data Handoff | (Validation checkpoint) |

---

## 📊 STAGE 1 SOURCE SECTIONS → STAGE 2 FIELDS

| Section # | Title | Stage 2 Field(s) Populated |
|-----------|-------|---------------------------|
| **1** | Customer Pain & Frustrations | `keyMarketData`, `s2_coreMarketProblem` |
| **3** | Competitive Gaps & Kill Moves | `antithesis`, `keywordsEntities` |
| **4** | Blue Ocean Opportunities | `coreStrategicQuestion`, `categoryDefinition`, `s2_futureVision` |
| **5** | Brand Positioning | `thesis` |
| **6** | Content Pillars | `primaryKeyword`, `secondaryKeywords`, `keywordsEntities` |
| **9** | AEO Optimization | `keywordsEntities` |

---

## 🔄 DATA FLOW SEQUENCE

```
Stage 1 Completes
       ↓
extractForensicBridge() runs in DB_Workflow_Stage1.gs
       ↓
forensicBridge object added to success response
       ↓
UI_Stage_Runner.html caches to window.ORACLE_STATE.forensicBridge
       ↓
UI_Stage2_Bridge.html detects bridge data
       ↓
Auto-populates Stage 2 fields + applies .field-notarized styling
       ↓
Shows read-only context banners (Target Audience, Business Goal)
```

---

## � V11.0: ACCORDION LAYOUT OVERHAUL

### Problem Identified
When clicking a Stage 1 section accordion, the Elite Strategic Intelligence results appeared **BELOW** the chart. User requested they appear **ABOVE** the chart (between accordion title and chart).

### Solution Implemented

**Before (V10.x):**
```
┌─────────────────────────────────────────┐
│ Section Header (Click to expand)        │  ← Always visible
├─────────────────────────────────────────┤
│ Chart Stage (550px)                     │  ← Always visible
├─────────────────────────────────────────┤
│ Expanded Zone (Hidden → Expands below)  │
│   - Elite Strategic Intelligence        │
│   - Key Indicators                      │
│   - Forensic Deep-Dive                  │
└─────────────────────────────────────────┘
```

**After (V11.0):**
```
┌─────────────────────────────────────────┐
│ Section Header (Click to expand)        │  ← Always visible
├─────────────────────────────────────────┤
│ Elite Intelligence Zone (ABOVE CHART)   │  ← Hidden → Expands here
│   - Elite Strategic Intelligence Box    │
│   - Key Indicators Sidebar              │
├─────────────────────────────────────────┤
│ Chart Stage (550px)                     │  ← Always visible
├─────────────────────────────────────────┤
│ Expanded Zone (Forensic Deep-Dive)      │  ← Hidden → Expands below
│   - Competitor Card Grid                │
│   - Forensic Intelligence Deep-Dive     │
└─────────────────────────────────────────┘
```

### Files Modified

| File | Changes |
|------|---------|
| `UI/UI_Stage1_Renderer.html` | Created `eliteIntelligenceZone` element, reordered assembly, updated `toggleSectionDisclosure()` |
| `UI/UI_Styles_Command_Canvas.html` | Added `.elite-intelligence-zone` CSS with theme variants |

### Key Code Changes

**UI_Stage1_Renderer.html - New Assembly Order:**
```javascript
sectionDiv.appendChild(sectionHeader);
sectionDiv.appendChild(eliteIntelligenceZone); // V11.0: ABOVE chart
collapsedZone.appendChild(chartStage);
sectionDiv.appendChild(collapsedZone);
expandedZone.insertBefore(cardGrid, expandedZone.firstChild);
sectionDiv.appendChild(expandedZone);
```

**toggleSectionDisclosure() now toggles BOTH zones:**
- `elite-zone-${sectionNum}` - Elite Intelligence (above chart)
- `expanded-zone-${sectionNum}` - Forensic Deep-Dive (below chart)

---

## 🏷️ VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-22 | Initial schema design |
| 1.1.0 | 2026-01-22 | Fixed ID collisions, streamlined execution plan |
| 1.2.0 | 2026-01-22 | V11.0 Accordion layout overhaul - Elite Intelligence now appears ABOVE chart |
