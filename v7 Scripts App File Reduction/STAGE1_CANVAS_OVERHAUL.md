# 🎯 STAGE 1 CANVAS OVERHAUL — Asymmetric Command Canvas

> **Mission**: Eliminate "Cluttered Bento", fix invisible charts, resolve table overflow.  
> **Architect**: Lead Full-Stack SaaS & Elite 0.1% UX/UI Designer  
> **Status**: 🟡 AWAITING APPROVAL — No code changes until sign-off

---

## 📋 EXECUTIVE SUMMARY

Replace the current 3-column Bento Grid with a **Vertical Stack "Command Canvas"** that prioritizes:
1. **Hero Verdict** (top) — 1-line Sage-Architect insight + 3 metric badges
2. **Interactive Stage** (middle) — Fixed 550px D3.js canvas anchor
3. **Forensic Deep-Dive** (bottom) — Collapsible accordion for full Gemini response

**Key Fixes**:
- Charts render reliably (D3 hydration fixed)
- Tables replaced with Vertical Competitor Cards (no horizontal scroll)
- Theme-conscious contrast engine (4 themes validated)

---

## 🗺️ PHASE 0: INFRASTRUCTURE & TOKENS (Tasks 1-6)

### Task 1: Create Theme Contrast Token System
**File**: `UI/UI_Styles_Theme_Tokens.html`  
**Scope**: Define CSS variables for all 4 themes with WCAG AA contrast ratios  
**Tokens**:
| Theme | Header BG | Header Text | Card BG | Body Text |
|-------|-----------|-------------|---------|-----------|
| Light | #FFFFFF | #0F172A (Slate-900) | #F8FAFC | #1E293B |
| Dark | #312E81 (Deep Indigo) | #F1F5F9 (White-100) | #1E293B | #E2E8F0 |
| Aurora | rgba(15,23,42,0.7) | #34D399 (Emerald-400) | rgba(255,255,255,0.05) | #F1F5F9 |
| Neon | #000000 | #F59E0B (Amber) | #0A0A0A | #E6EDF3 |

**Acceptance**: Text passes 4.5:1 contrast check on all themes.

---

### Task 2: Implement Triadic Accent System
**File**: `UI/UI_Styles_Theme_Tokens.html`  
**Scope**: Add semantic accent colors for data categories  
**Accents**:
- `--accent-danger`: Magenta (#EC4899) — Kill Moves, Risk, Brittleness
- `--accent-velocity`: Cyan (#22D3EE) — Speed, Momentum, Growth
- `--accent-value`: Emerald (#34D399) — Value, Opportunity, Moat
- `--accent-authority`: Indigo (#6366F1) — Trust, E-E-A-T, Citations

---

### Task 3: Create Shimmer Skeleton Component
**File**: `UI/UI_Loading_Skeleton.html`  
**Scope**: Theme-aware loading placeholder for charts and cards  
**Variants**:
- `.skeleton-chart` — 550px fixed height, 16:9 aspect ratio
- `.skeleton-card` — Rounded, pulsing gradient
- `.skeleton-badge` — Inline metric placeholder

---

### Task 4: Define Command Canvas Layout Classes
**File**: `UI/UI_Styles_Command_Canvas.html`  
**Scope**: Replace `.bento-section` with `.command-canvas-section`  
**Structure**:
```css
.command-canvas-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}
.hero-verdict { /* Top zone */ }
.interactive-stage { height: 550px; max-height: 550px; }
.forensic-accordion { /* Collapsible bottom */ }
```

---

### Task 5: Create Vertical Competitor Card Component
**File**: `UI/UI_Components_Competitor_Card.html`  
**Scope**: Replace horizontal tables with vertical card grid  
**Structure**:
- Card header: Competitor logo/name + rank badge
- Metric rows: Label left, value right, accent bar
- Expand/collapse for detailed metrics
- **BANNED**: Vertical text, sticky columns, horizontal scroll

---

### Task 6: Build Collapsible Accordion Component
**File**: `UI/UI_Components_Accordion.html`  
**Scope**: "Strategic Proof Accordion" for Gemini response  
**Features**:
- Default: Collapsed (clean aesthetic)
- Expand animation: 300ms ease-out
- Theme-aware border/shadow
- Copy-to-clipboard button in header

---

## 🎨 PHASE 1: HERO VERDICT ZONE (Tasks 7-12)

### Task 7: Design Hero Verdict Container
**File**: `UI/UI_Stage1_Hero_Verdict.html`  
**Scope**: Top zone with executive insight + metrics  
**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 [Section Icon] Section Title                             │
│ ───────────────────────────────────────────────────────────│
│ "One-line Sage-Architect strategic verdict goes here..."   │
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│ │ Metric 1 │ │ Metric 2 │ │ Metric 3 │                     │
│ │   0.89   │ │   $45K   │ │   67%    │                     │
│ │ Citeability│ │ Moat Val │ │ Janitor │                     │
│ └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

### Task 8: Implement Metric Badge Component
**File**: `UI/UI_Components_Metric_Badge.html`  
**Props**: `value`, `label`, `trend`, `accentType`  
**Variants**:
- `.metric-badge--positive` (Emerald glow)
- `.metric-badge--negative` (Magenta glow)
- `.metric-badge--neutral` (Indigo)

---

### Task 9: Create Sage-Architect Insight Renderer
**File**: `UI/UI_Stage1_Sage_Insight.html`  
**Scope**: Parse Gemini response for 1-line executive summary  
**Logic**:
1. Look for `## Strategic Verdict` or first bold sentence
2. Truncate to 150 chars with ellipsis
3. Add "Read more" link to expand accordion

---

### Task 10: Section Icon Mapping System
**Scope**: Map each of 14 sections to semantic icons  
**Icons**:
| Section | Icon | Accent |
|---------|------|--------|
| 1. Customer Intel | 🎯 | Indigo |
| 2. JTBD | 🔧 | Emerald |
| 3. Competitive Warfare | ⚔️ | Magenta |
| 4. Blue Ocean | 🌊 | Cyan |
| 5. Brand Positioning | 🏛️ | Indigo |
| 6. Content Pillars | 📚 | Emerald |
| 7. Strategic Moat | 🏰 | Emerald |
| 8. Action Plan | 📋 | Cyan |
| 9. AEO Citation | 🤖 | Indigo |
| 10. Asset Valuation | 💰 | Emerald |
| 11. Algorithmic Risk | ⚠️ | Magenta |
| 12. Semantic Galaxy | 🕳️ | Cyan |
| 13. Strategic Imperatives | 🚀 | Magenta |
| 14. Cross-Stage Prep | 🔗 | Indigo |

---

### Task 11: Hero Verdict Theme Styling
**Scope**: Apply contrast tokens to Hero zone  
**Rules**:
- Aurora: Add `text-shadow: 0 1px 4px rgba(0,0,0,0.8)` for glassmorphism clarity
- Neon: Amber headers, white-silver body text
- Dark: Deep Indigo header bg with white-100 text

---

### Task 12: Metric Calculation Functions
**File**: `UI/UI_Metrics_Calculator.html`  
**Scope**: Extract/calculate hero metrics from Gemini JSON  
**Metrics**:
- `Cite-ability Coefficient` — AEO readiness score (0-1)
- `Janitor Ratio` — % of content needing cleanup
- `Moat-Adjusted Valuation` — Estimated $ value

---

## 📊 PHASE 2: INTERACTIVE STAGE (Tasks 13-20)

### Task 13: Create Fixed-Height Chart Container
**File**: `UI/UI_Stage1_Chart_Stage.html`  
**Scope**: 550px max-height "anchor" that never stretches  
**CSS**:
```css
.interactive-stage {
  height: 550px;
  max-height: 550px;
  overflow: hidden;
  position: relative;
  border-radius: 16px;
  background: var(--chart-bg);
}
```

---

### Task 14: D3.js Hydration Fix — IntersectionObserver
**File**: `UI/UI_D3_Hydration.html`  
**Scope**: Lazy-load charts only when visible  
**Logic**:
1. Wrap chart init in `IntersectionObserver`
2. Trigger render when 50% visible
3. Destroy on scroll-out to prevent memory leaks

---

### Task 15: D3.js Hydration Fix — Data Handoff Verification
**File**: `UI/UI_D3_Hydration.html`  
**Scope**: Verify `analysis_json.dashboardCharts` exists before render  
**Fallback**:
- If no data: Show themed "No Chart Data" message
- If loading: Show Shimmer Skeleton (Task 3)

---

### Task 16: Theme-Aware Chart Color Utility
**File**: `UI/UI_Chart_Theme_Colors.html`  
**Scope**: Provide palette arrays per theme  
**Palettes**:
```javascript
const chartColors = {
  light: ['#6366F1', '#8B5CF6', '#34D399', '#F59E0B', '#EC4899'],
  dark: ['#A5B4FC', '#C084FC', '#34D399', '#F59E0B', '#EC4899'],
  aurora: ['#34D399', '#059669', '#10B981', '#A7F3D0', '#60A5FA'],
  neon: ['#F59E0B', '#EC4899', '#FFFFFF', '#60F0FF', '#FFD86B']
};
```

---

### Task 17: Chart Action Bar (Save, Fullscreen, Info)
**File**: `UI/UI_Chart_Action_Bar.html`  
**Scope**: Overlay buttons on chart container  
**Buttons**:
- 💾 Download PNG
- ⛶ Fullscreen modal
- ℹ️ Chart methodology info

---

### Task 18: Mind Map D3 Force-Directed Graph (Tab 6)
**File**: `UI/UI_D3_MindMap_Force.html`  
**Scope**: 6 Pillars → 6 Clusters → 6 Keywords  
**Features**:
- Click pillar to "Solo" (fade others)
- Zoom/pan controls
- Theme-aware node colors
- Export as PNG

---

### Task 19: Semantic Galaxy Visualization (Tab 12)
**File**: `UI/UI_D3_Semantic_Galaxy.html`  
**Scope**: Topic clusters as "solar system"  
**Features**:
- Central topic = Sun
- Clusters orbit based on relevance
- "Black holes" = opportunity gaps (pulsing animation)

---

### Task 20: Chart Fallback States
**Scope**: Handle all chart edge cases  
**States**:
- Loading: Shimmer skeleton
- No Data: "Awaiting analysis..." message
- Error: "Chart failed to render" with retry button

---

## 📜 PHASE 3: FORENSIC DEEP-DIVE (Tasks 21-25)

### Task 21: Strategic Proof Accordion Container
**File**: `UI/UI_Stage1_Forensic_Accordion.html`  
**Scope**: Collapsible full Gemini response  
**Default**: Collapsed  
**Toggle**: Smooth 300ms expand/collapse

---

### Task 22: Accordion Content Renderer
**Scope**: Render Gemini markdown inside accordion  
**Features**:
- Proper markdown → HTML conversion
- Code block syntax highlighting
- Table formatting with theme styles

---

### Task 23: Accordion Header with Metadata
**Scope**: Show key metadata in header even when collapsed  
**Metadata**:
- Word count
- Reading time estimate
- Section count

---

### Task 24: Copy-to-Clipboard in Accordion
**Scope**: One-click copy of full Gemini response  
**UX**: Toast notification on success

---

### Task 25: Accordion Theme Styling
**Scope**: Theme-aware borders, shadows, and backgrounds  
**Rules**:
- Neon: Subtle amber border glow on expand
- Aurora: Glassmorphism blur on content area

---

## 🃏 PHASE 4: VERTICAL COMPETITOR CARDS (Tasks 26-30)

### Task 26: Competitor Card Grid Layout
**File**: `UI/UI_Competitor_Card_Grid.html`  
**Scope**: Replace horizontal tables  
**Layout**:
```css
.competitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}
```

---

### Task 27: Individual Competitor Card Structure
**Scope**: Card anatomy  
**Structure**:
```
┌──────────────────────────────┐
│ [Logo] Competitor Name   #1 │
│ ─────────────────────────── │
│ Traffic       │    1.2M     │
│ DA Score      │      67     │
│ Content Gap   │     23%     │
│ ─────────────────────────── │
│ [Expand for more ▼]         │
└──────────────────────────────┘
```

---

### Task 28: Metric Row Component
**Scope**: Label/value pairs with accent bars  
**Features**:
- Progress bar for percentages
- Color-coded by metric type
- Hover tooltip with context

---

### Task 29: Competitor Card Expand/Collapse
**Scope**: Show detailed metrics on expand  
**Expanded Content**:
- Full keyword overlap
- Backlink profile summary
- Content quality scores

---

### Task 30: Competitor Card Ranking Badge
**Scope**: Visual rank indicator  
**Styles**:
- #1: Gold badge with glow
- #2-3: Silver badge
- #4+: Standard accent badge

---

## 🔧 PHASE 5: DATA INTEGRATION (Tasks 31-35)

### Task 31: Gemini Response Parser for Hero Metrics
**Scope**: Extract calculated metrics from Gemini JSON  
**Target Fields**:
- `dashboardCharts.citeabilityScore`
- `dashboardCharts.janitorRatio`
- `dashboardCharts.moatValuation`

---

### Task 32: Force Gemini Metric Calculations
**File**: `DB_Workflow_Stage1.gs`  
**Scope**: Update prompt to require specific metrics  
**Metrics to Force**:
- "Janitor Ratio" — Agency time waste percentage
- "Moat-Adjusted Valuation" — Dollar value impact
- "Cite-ability Coefficient" — AI citation readiness (0-1)

---

### Task 33: Chart Data Validator
**Scope**: Validate `dashboardCharts` structure before render  
**Checks**:
- Array length > 0
- Required fields present
- Numeric values valid

---

### Task 34: Competitor Data Normalizer
**Scope**: Transform raw competitor data for card display  
**Normalization**:
- Standardize traffic numbers (K/M/B suffix)
- Calculate relative percentages
- Sort by relevance score

---

### Task 35: Section Content Store for Modal
**Scope**: Store full section content for "Inspect Source" modal  
**Implementation**: `window._sectionContentStore[sectionNum]`

---

## ✅ PHASE 6: TESTING & VALIDATION (Tasks 36-40)

### Task 36: Theme Contrast Audit
**Scope**: Verify all 4 themes pass WCAG AA (4.5:1)  
**Tool**: Browser DevTools contrast checker

---

### Task 37: Chart Render Verification
**Scope**: Confirm all 14 sections render charts correctly  
**Test**: Run Stage 1 analysis and verify no "black box" charts

---

### Task 38: Responsive Breakpoint Testing
**Scope**: Test layouts at 1400px, 1024px, 768px  
**Goal**: Cards stack gracefully, no horizontal overflow

---

### Task 39: Memory Leak Check
**Scope**: Verify IntersectionObserver cleanup  
**Test**: Scroll through all sections, monitor memory usage

---

### Task 40: Cross-Browser Validation
**Scope**: Chrome, Firefox, Safari (macOS), Edge  
**Focus**: D3.js rendering, glassmorphism blur

---

## 📊 SECTION-SPECIFIC TASKS (Tasks 41-54)

| Task | Section | Focus |
|------|---------|-------|
| 41 | 1. Customer Intel | Pain point extraction + emotional resonance chart |
| 42 | 2. JTBD Framework | Job priority radar chart |
| 43 | 3. Competitive Warfare | Kill moves matrix + asymmetric advantages |
| 44 | 4. Blue Ocean | Opportunity quadrant scatter plot |
| 45 | 5. Brand Positioning | Brand archetype positioning map |
| 46 | 6. Content Pillars | Force-directed mind map (6×6×6) |
| 47 | 7. Strategic Moat | Moat components donut chart |
| 48 | 8. Action Plan | Priority matrix scatter + timeline |
| 49 | 9. AEO Citation | Citation readiness bar chart |
| 50 | 10. Asset Valuation | Digital asset value bar chart |
| 51 | 11. Algorithmic Risk | Brittleness risk indicators |
| 52 | 12. Semantic Galaxy | Topic cluster force graph |
| 53 | 13. Strategic Imperatives | Top 10 action priority list |
| 54 | 14. Cross-Stage Prep | Data handoff validation card |

---

## 🚀 IMPLEMENTATION ORDER

**Wave 1 (Foundation)**:
- Tasks 1-6: Token system, skeleton, layout classes

**Wave 2 (Hero Zone)**:
- Tasks 7-12: Hero verdict, metric badges, insight renderer

**Wave 3 (Charts)**:
- Tasks 13-20: Fixed container, D3 hydration, theme colors

**Wave 4 (Accordion)**:
- Tasks 21-25: Forensic deep-dive accordion

**Wave 5 (Cards)**:
- Tasks 26-30: Vertical competitor cards

**Wave 6 (Data)**:
- Tasks 31-35: Metric extraction, data normalization

**Wave 7 (Validation)**:
- Tasks 36-40: Testing across themes and browsers

**Wave 8 (Per-Section)**:
- Tasks 41-54: Section-specific chart implementations

---

## ⏳ AWAITING APPROVAL

**This document contains 54 granular tasks.**

Please review and approve before any code modifications begin.

Reply with:
- ✅ **APPROVED** — Proceed with Wave 1
- 🔄 **REVISE** — Specify changes needed
- ❌ **REJECT** — Provide alternative direction

---

*Generated: January 20, 2026*  
*Architect: Serpifai Elite Design System*
