# 🧹 LEGACY CLEANUP & COMMAND CANVAS MIGRATION PLAN

> **Mission**: Remove obsolete Bento Grid / 50-50 layout patterns and fully integrate the new Command Canvas vertical stack architecture for Stage 1 (Market Research & Strategy Intelligence).
> 
> **Date**: January 20, 2026  
> **Status**: 🟡 AWAITING APPROVAL

---

## 📋 EXECUTIVE SUMMARY

### Current State
- **Bento Grid** (`UI_Styles_Bento_Grid.html`) is the current production system — 3-column 12-grid layout
- **Command Canvas** components created (Phases 0-6 complete) but NOT integrated into production
- **UI_Stage1_Renderer.html** still renders with Bento Grid, not Command Canvas
- Legacy 50/50 split code exists in V6 folder (reference only)

### Target State
- **Command Canvas** becomes the sole layout system for Stage 1
- Bento Grid styles preserved for OTHER stages (Stage 2-5) but deprecated for Stage 1
- All 35+ new Command Canvas component files integrated into production include chain

---

## 📊 AUDIT: FILES TO MODIFY OR REMOVE

### ❌ FILES TO DEPRECATE FOR STAGE 1 (Not Delete — Used Elsewhere)

| File | Current Role | Action |
|------|--------------|--------|
| `UI_Styles_Bento_Grid.html` | 12-column grid for all stages | Add `.stage1-deprecated` prefix to Bento classes for Stage 1 |
| `UI_Stage1_Renderer.html` | Uses `bento-section` class | Refactor to use `command-canvas-section` |
| `UI_Stage_Runner.html` (line 758-760) | Calls "Bento-Grid Stage 1 UI" | Update to call Command Canvas renderer |

### ✅ NEW FILES TO INTEGRATE (Created in Phases 0-6)

| Phase | File | Purpose |
|-------|------|---------|
| 0 | `UI_Styles_Command_Tokens.html` | Theme contrast tokens + triadic accents |
| 0 | `UI_Loading_Skeleton.html` | Shimmer skeleton components |
| 0 | `UI_Styles_Command_Canvas.html` | Command Canvas layout zones |
| 0 | `UI_Components_Competitor_Card.html` | Vertical competitor card styles |
| 0 | `UI_Components_Accordion.html` | Collapsible accordion styles |
| 1 | `UI_Stage1_Hero_Verdict.html` | Hero Verdict zone container |
| 1 | `UI_Components_Metric_Badge.html` | Metric badge with 4 accents |
| 1 | `UI_Stage1_Sage_Insight.html` | 4-tier insight extractor |
| 1 | `UI_Stage1_Section_Icons.html` | 14 sections → emoji + accent |
| 1 | `UI_Metrics_Calculator.html` | Citeability/Janitor/Moat calculators |
| 2 | `UI_Stage1_Chart_Stage.html` | 550px fixed chart container |
| 2 | `UI_D3_Hydration.html` | IntersectionObserver + data verification |
| 2 | `UI_Chart_Theme_Colors.html` | 4 theme color palettes for D3 |
| 2 | `UI_Chart_Action_Bar.html` | Save PNG, Fullscreen, Info buttons |
| 2 | `UI_D3_MindMap_Force.html` | Force-directed graph for Section 6 |
| 2 | `UI_D3_Semantic_Galaxy.html` | Solar system visualization |
| 2 | `UI_Chart_Fallback_States.html` | Loading/NoData/Error states |
| 3 | `UI_Stage1_Forensic_Accordion.html` | Collapsible Gemini response |
| 3 | `UI_Accordion_Content_Renderer.html` | Markdown → HTML renderer |
| 3 | `UI_Accordion_Header_Metadata.html` | Word count, reading time |
| 3 | `UI_Accordion_Copy_Clipboard.html` | Copy button + toast |
| 4 | `UI_Competitor_Card_Grid.html` | Responsive card grid |
| 4 | `UI_Competitor_Card_Structure.html` | Card anatomy |
| 4 | `UI_Competitor_Metric_Row.html` | Progress bars + accents |
| 4 | `UI_Competitor_Card_Expand.html` | Expanded details section |
| 4 | `UI_Competitor_Ranking_Badge.html` | Gold/Silver/Bronze badges |
| 5 | `UI_Gemini_Response_Parser.html` | Multi-path metric extraction |
| 5 | `UI_Chart_Data_Validator.html` | Array/field/range validation |
| 5 | `UI_Competitor_Data_Normalizer.html` | K/M/B formatting |
| 5 | `UI_Section_Content_Store.html` | window._sectionContentStore |
| 6 | `UI_Theme_Contrast_Audit.html` | WCAG AA validation utility |
| 6 | `UI_Chart_Render_Verification.html` | Chart render testing |
| 6 | `UI_Responsive_Breakpoint_Test.html` | Responsive testing |
| 6 | `UI_Memory_Leak_Check.html` | Memory leak detection |
| 6 | `UI_Cross_Browser_Validation.html` | Cross-browser testing |

---

## 🗺️ PHASE 1: INCLUDES INTEGRATION (Tasks 1-5)

### Task 1: Add Command Canvas Tokens to Include Chain
**File**: `UI/UI_Scripts_App.html`  
**Action**: Add Command Canvas style includes after Bento Grid  
**Insert After Line 30** (`<?!= include('UI_Styles_Bento_Grid'); ?>`):
```html
<!-- COMMAND CANVAS v1.0 - Stage 1 Overhaul -->
<?!= include('UI_Styles_Command_Tokens'); ?>
<?!= include('UI_Styles_Command_Canvas'); ?>
<?!= include('UI_Loading_Skeleton'); ?>
<?!= include('UI_Components_Competitor_Card'); ?>
<?!= include('UI_Components_Accordion'); ?>
```

### Task 2: Add Hero Verdict Components to Include Chain
**File**: `UI/UI_Scripts_App.html`  
**Action**: Add Hero Verdict includes in TIER 1.5 section  
```html
<!-- COMMAND CANVAS: Hero Verdict Zone -->
<?!= include('UI_Stage1_Hero_Verdict'); ?>
<?!= include('UI_Components_Metric_Badge'); ?>
<?!= include('UI_Stage1_Sage_Insight'); ?>
<?!= include('UI_Stage1_Section_Icons'); ?>
<?!= include('UI_Metrics_Calculator'); ?>
```

### Task 3: Add Interactive Stage Components to Include Chain
**File**: `UI/UI_Scripts_App.html`  
**Action**: Add chart/stage includes in TIER 2 section  
```html
<!-- COMMAND CANVAS: Interactive Stage -->
<?!= include('UI_Stage1_Chart_Stage'); ?>
<?!= include('UI_D3_Hydration'); ?>
<?!= include('UI_Chart_Theme_Colors'); ?>
<?!= include('UI_Chart_Action_Bar'); ?>
<?!= include('UI_D3_MindMap_Force'); ?>
<?!= include('UI_D3_Semantic_Galaxy'); ?>
<?!= include('UI_Chart_Fallback_States'); ?>
```

### Task 4: Add Forensic Accordion Components to Include Chain
**File**: `UI/UI_Scripts_App.html`  
**Action**: Add accordion includes  
```html
<!-- COMMAND CANVAS: Forensic Deep-Dive -->
<?!= include('UI_Stage1_Forensic_Accordion'); ?>
<?!= include('UI_Accordion_Content_Renderer'); ?>
<?!= include('UI_Accordion_Header_Metadata'); ?>
<?!= include('UI_Accordion_Copy_Clipboard'); ?>
```

### Task 5: Add Data Integration Components to Include Chain
**File**: `UI/UI_Scripts_App.html`  
**Action**: Add data layer includes  
```html
<!-- COMMAND CANVAS: Data Integration -->
<?!= include('UI_Gemini_Response_Parser'); ?>
<?!= include('UI_Chart_Data_Validator'); ?>
<?!= include('UI_Competitor_Data_Normalizer'); ?>
<?!= include('UI_Section_Content_Store'); ?>
<?!= include('UI_Competitor_Card_Grid'); ?>
<?!= include('UI_Competitor_Card_Structure'); ?>
<?!= include('UI_Competitor_Metric_Row'); ?>
<?!= include('UI_Competitor_Card_Expand'); ?>
<?!= include('UI_Competitor_Ranking_Badge'); ?>
```

---

## 🗺️ PHASE 2: RENDERER REFACTORING (Tasks 6-12)

### Task 6: Create Command Canvas Section Factory
**File**: `UI/UI_Stage1_Renderer.html` (MODIFY)  
**Scope**: Add new function `createCommandCanvasSection()`  
**Logic**:
```javascript
function createCommandCanvasSection(sectionNum, sectionData, chartDef) {
  const section = document.createElement('div');
  section.className = 'command-canvas-section';
  section.dataset.sectionNum = sectionNum;
  
  // 1. Hero Verdict Zone
  section.appendChild(createHeroVerdict(sectionNum, sectionData, chartDef));
  
  // 2. Interactive Stage Zone
  section.appendChild(createInteractiveStage(sectionNum, chartDef));
  
  // 3. Forensic Accordion Zone
  section.appendChild(createForensicAccordion(sectionNum, sectionData));
  
  return section;
}
```

### Task 7: Refactor createSectionDiv to Use Command Canvas
**File**: `UI/UI_Stage1_Renderer.html` (MODIFY)  
**Scope**: Replace existing `createSectionDiv()` implementation  
**Action**: 
- Remove `.bento-section` class usage
- Call `createCommandCanvasSection()` instead
- Preserve backward compatibility flag: `window.BENTO_GRID_ENABLED`

### Task 8: Implement createHeroVerdict() Function
**File**: `UI/UI_Stage1_Renderer.html` (MODIFY)  
**Scope**: Build Hero Verdict zone HTML from section data  
**Components**:
- Section icon from `getSectionIcon()`
- Sage insight from `extractSageInsight()`
- 3 metric badges from `calculateHeroMetrics()`

### Task 9: Implement createInteractiveStage() Function
**File**: `UI/UI_Stage1_Renderer.html` (MODIFY)  
**Scope**: Build 550px chart container with hydration hooks  
**Components**:
- Fixed 550px container
- Chart action bar (save, fullscreen, info)
- IntersectionObserver registration
- Fallback states (loading, no data, error)

### Task 10: Implement createForensicAccordion() Function
**File**: `UI/UI_Stage1_Renderer.html` (MODIFY)  
**Scope**: Build collapsible accordion with full Gemini response  
**Components**:
- Header with metadata (word count, reading time)
- Content renderer (markdown → HTML)
- Copy-to-clipboard button
- 300ms expand/collapse animation

### Task 11: Replace Competitor Table with Card Grid
**File**: `UI/UI_Stage1_Renderer.html` (MODIFY)  
**Scope**: Remove horizontal table, render vertical card grid  
**Action**:
- Find all `<table class="comp-table">` instances
- Replace with `renderCompetitorCardGrid(competitorData)`
- Use `UI_Competitor_Card_Grid.html` component

### Task 12: Add Mode Toggle for Bento/Canvas
**File**: `UI/UI_Stage1_Renderer.html` (MODIFY)  
**Scope**: Feature flag for gradual rollout  
**Logic**:
```javascript
window.COMMAND_CANVAS_ENABLED = true; // New default
window.BENTO_GRID_ENABLED = false;     // Deprecated for Stage 1
```

---

## 🗺️ PHASE 3: BENTO GRID DEPRECATION (Tasks 13-17)

### Task 13: Add Deprecation Comments to Bento Grid
**File**: `UI/UI_Styles_Bento_Grid.html`  
**Action**: Add warning comments  
```css
/* ⚠️ DEPRECATED FOR STAGE 1: Use .command-canvas-section instead
   Bento Grid is still active for Stages 2-5 */
.bento-section {
  /* ... existing styles ... */
}
```

### Task 14: Namespace Bento Classes for Stage 1
**File**: `UI/UI_Styles_Bento_Grid.html`  
**Action**: Add `.stage1-bento-deprecated` warning class  
**Scope**: When Bento is used in Stage 1, show visual warning in dev mode

### Task 15: Update UI_Stage_Runner.html References
**File**: `UI/UI_Stage_Runner.html` (lines 758-760)  
**Current**:
```javascript
// Render the Bento-Grid UI
console.log('🎨 Rendering Bento-Grid Stage 1 UI...');
```
**Target**:
```javascript
// Render the Command Canvas UI (v2.0)
console.log('🎨 Rendering Command Canvas Stage 1 UI...');
if (window.COMMAND_CANVAS_ENABLED) {
  renderCommandCanvasStage1(data);
} else {
  // Legacy fallback
  renderUnifiedStage1Results(container, reportData, jsonData, projectData);
}
```

### Task 16: Remove 50/50 Split Layout Remnants
**Files to Audit**:
- `UI/UI_Styles_Bento_Grid.html` (line 831): `flex: 1 1 calc(50% - 0.5rem)`
- `UI/UI_Stage1_Renderer.html` (lines 1943-1967): `grid-template-columns: 1fr 1fr`

**Action**: Replace with Command Canvas responsive patterns  
**New Pattern**:
```css
/* Responsive: 2-col on desktop, 1-col on mobile */
.command-canvas-chart-pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}
```

### Task 17: Audit and Remove Horizontal Scroll Containers
**Files to Audit**:
- Any `overflow-x: auto` on competitor containers
- `position: sticky; left: 0` on table columns

**Action**: Remove all horizontal scroll patterns for competitor data  
**Replacement**: Vertical card grid from `UI_Competitor_Card_Grid.html`

---

## 🗺️ PHASE 4: CHART HYDRATION MIGRATION (Tasks 18-23)

### Task 18: Replace Legacy Chart Heights
**Files to Audit**:
- `UI/UI_Styles_Bento_Grid.html` (lines 1946-1972): `max-height: 280px` / `max-height: 300px`

**Action**: Update to 550px fixed height  
**New Pattern**:
```css
.command-canvas-chart {
  height: 550px;
  max-height: 550px;
}
@media (max-width: 768px) {
  .command-canvas-chart {
    height: 400px;
    max-height: 400px;
  }
}
```

### Task 19: Wire IntersectionObserver to All 14 Sections
**File**: `UI/UI_D3_Hydration.html` (VERIFY)  
**Scope**: Ensure `window.ChartHydrationManager` tracks all 14 sections  
**Test**: Scroll through Stage 1, verify lazy-load triggers at 50% visibility

### Task 20: Add Chart Observer Cleanup on Section Destroy
**File**: `UI/UI_D3_Hydration.html` (MODIFY)  
**Scope**: Disconnect observers when sections are removed  
**Logic**:
```javascript
window.cleanupChartObservers = function() {
  Object.values(window._chartObservers || {}).forEach(obs => obs.disconnect());
  window._chartObservers = {};
};
```

### Task 21: Migrate Force Graph to Command Canvas Container
**File**: `UI/UI_D3_MindMap_Force.html` (VERIFY)  
**Scope**: Ensure force graph targets `.interactive-stage` not `.bento-span-center`  
**Selector Update**: `document.querySelector('.command-canvas-section[data-section="6"] .interactive-stage')`

### Task 22: Migrate Semantic Galaxy to Command Canvas Container
**File**: `UI/UI_D3_Semantic_Galaxy.html` (VERIFY)  
**Scope**: Ensure galaxy targets `.interactive-stage`  
**Selector Update**: `document.querySelector('.command-canvas-section[data-section="12"] .interactive-stage')`

### Task 23: Add Chart Fallback States to All Sections
**File**: `UI/UI_Chart_Fallback_States.html` (VERIFY)  
**Scope**: Ensure all 14 sections have loading/error/empty states  
**Test**: Trigger each state manually and verify rendering

---

## 🗺️ PHASE 5: COMPETITOR CARD MIGRATION (Tasks 24-28)

### Task 24: Find All Horizontal Competitor Tables
**Files to Search**:
- `UI/UI_Stage1_Renderer.html`
- `UI/UI_Components_Competitors.html`
- `UI/UI_Competitor_Tabs.html`

**Search Pattern**: `<table`, `competitor-table`, `comp-table`

### Task 25: Create Competitor Card Renderer Function
**File**: `UI/UI_Competitor_Card_Grid.html` (MODIFY)  
**Scope**: Add `window.renderCompetitorCardGrid(data, containerSelector)`  
**Input**: Competitor data array  
**Output**: HTML string with vertical card grid

### Task 26: Replace Table Instances with Card Grid
**File**: `UI/UI_Stage1_Renderer.html` (MODIFY)  
**Scope**: Find table rendering code, replace with card grid  
**Example**:
```javascript
// BEFORE
container.innerHTML = `<table class="comp-table">...</table>`;

// AFTER
container.innerHTML = window.renderCompetitorCardGrid(competitorData);
```

### Task 27: Add Expand/Collapse to All Competitor Cards
**File**: `UI/UI_Competitor_Card_Expand.html` (VERIFY)  
**Scope**: Ensure `toggleCompetitorCardExpand()` is wired  
**Test**: Click "Expand for more" on each card

### Task 28: Add Ranking Badges to Top 3 Competitors
**File**: `UI/UI_Competitor_Ranking_Badge.html` (VERIFY)  
**Scope**: Ensure gold/silver/bronze badges render for top 3  
**Test**: Verify visual distinction for ranks 1-3 vs 4+

---

## 🗺️ PHASE 6: THEME INTEGRATION (Tasks 29-32)

### Task 29: Apply Command Tokens to All New Components
**Files to Verify**:
- All `UI_Stage1_*.html` files
- All `UI_Competitor_*.html` files
- All `UI_Accordion_*.html` files

**Check**: Each file uses `var(--cmd-*)` tokens, not hardcoded colors

### Task 30: Test All 4 Themes with Command Canvas
**Themes**: Light, Dark, Aurora, Neon  
**Tool**: `ThemeContrastAudit.runAudit()`  
**Pass Criteria**: All text passes WCAG AA (4.5:1)

### Task 31: Add Aurora Glassmorphism to Command Canvas
**File**: `UI/UI_Styles_Command_Canvas.html` (VERIFY)  
**Check**: `backdrop-filter: blur()` applies to all zones on Aurora theme

### Task 32: Add Neon Glow Effects to Command Canvas
**File**: `UI/UI_Styles_Command_Canvas.html` (VERIFY)  
**Check**: Amber glow on headers, cyan accents on interactive elements

---

## 🗺️ PHASE 7: CLEANUP & VALIDATION (Tasks 33-40)

### Task 33: Remove Dead Code from UI_Stage1_Renderer.html
**Action**: Remove unused functions that reference Bento Grid exclusively  
**Candidates**:
- `createBentoSection()` (if separate from Command Canvas)
- `injectChartsIntoBentoGrid()` (deprecated)

### Task 34: Update CHART_MAP Selectors
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Change canvas selectors from `.bento-*` to `.command-canvas-*`  
**Example**:
```javascript
// BEFORE
{ canvas: 'bento-chart-1', ... }

// AFTER
{ canvas: 'command-canvas-chart-1', ... }
```

### Task 35: Verify All 14 Sections Render Correctly
**Test Procedure**:
1. Run Stage 1 analysis on test project
2. Scroll through all 14 sections
3. Verify: Hero Verdict, Interactive Stage, Forensic Accordion visible for each

### Task 36: Run Full Test Suite
**Tools**:
```javascript
ThemeContrastAudit.runAudit()
ChartRenderVerifier.runVerification()
ResponsiveBreakpointTest.runCurrentViewportTest()
MemoryLeakCheck.runCheck()
CrossBrowserValidation.runValidation()
```

### Task 37: Document Breaking Changes
**File**: `CHANGELOG.md` (CREATE)  
**Content**:
- List all deprecated Bento classes
- List new Command Canvas classes
- Migration guide for custom themes

### Task 38: Update ORACLE_ELITE_BLUEPRINT.md
**Action**: Replace "Bento-Grid" references with "Command Canvas" for Stage 1

### Task 39: Archive V6 Folder Documentation
**Action**: Add `DEPRECATED.md` to `V6 working with 36K Scripts App/` folder  
**Content**: Note that V6 is for reference only, production is V7+

### Task 40: Final Visual QA
**Checklist**:
- [ ] All 14 sections render without errors
- [ ] Charts load on scroll (lazy hydration)
- [ ] Competitor cards display vertically (no horizontal scroll)
- [ ] Accordion expands/collapses smoothly
- [ ] All 4 themes pass contrast audit
- [ ] Mobile responsive at 768px
- [ ] No console errors in production

---

## 📊 FILE IMPACT SUMMARY

| Category | Files Affected | Action |
|----------|----------------|--------|
| **Add to Includes** | 35 new HTML files | Add `<?!= include() ?>` to UI_Scripts_App.html |
| **Major Refactor** | UI_Stage1_Renderer.html | Replace Bento → Command Canvas |
| **Minor Refactor** | UI_Stage_Runner.html | Update console logs, add toggle |
| **Deprecation Comments** | UI_Styles_Bento_Grid.html | Add Stage 1 deprecation notes |
| **No Change** | V6 folder (48+ files) | Reference only — do not modify |

---

## 🚀 IMPLEMENTATION ORDER

**Wave 1 (Includes)**:
- Tasks 1-5: Add all 35 new files to include chain

**Wave 2 (Renderer Core)**:
- Tasks 6-12: Refactor UI_Stage1_Renderer.html

**Wave 3 (Deprecation)**:
- Tasks 13-17: Mark Bento Grid as deprecated for Stage 1

**Wave 4 (Charts)**:
- Tasks 18-23: Migrate chart hydration to new containers

**Wave 5 (Competitors)**:
- Tasks 24-28: Replace horizontal tables with vertical cards

**Wave 6 (Themes)**:
- Tasks 29-32: Verify all 4 themes work with new layout

**Wave 7 (Cleanup)**:
- Tasks 33-40: Remove dead code, run tests, document changes

---

## ⏳ AWAITING APPROVAL

**This document contains 40 migration tasks across 7 phases.**

Please review and approve before any code modifications begin.

Reply with:
- ✅ **APPROVED** — Proceed with Wave 1
- 🔄 **REVISE** — Specify changes needed
- ❌ **REJECT** — Provide alternative direction

---

*Generated: January 20, 2026*  
*Architect: Serpifai Elite Design System — Command Canvas Migration v1.0*
