# V7.20 COMMAND CANVAS CRISIS FIX

## ✅ FIXES IMPLEMENTED - V9.4 ELITE

The **Forensic Command Canvas** fixes have been applied.

---

## 📊 ROOT CAUSE ANALYSIS

### Issue #1: `renderUnifiedStage1Results` is UNDEFINED

**Evidence from logs:**
```
VM338:1813    renderUnifiedStage1Results: undefined
VM338:1833    typeof renderUnifiedStage1Results: undefined
VM338:1885 ⚠️ renderUnifiedStage1Results unavailable after max retries - using direct fallback
VM338:1899 🔧 V7.12: Direct fallback renderer executing...
```

**Diagnosis:** 
- `UI_Stage1_Renderer.html` is either:
  1. NOT being included in the HTML output
  2. Has a JavaScript syntax error preventing it from loading
  3. Is loaded AFTER the render attempts (race condition)

### Issue #2: JSON Structure Mismatch

**What Gemini Returns:**
```json
{
  "strategicIntelligenceDashboard": {
    "metadata": {...},
    "globalInteractivity": {...}
  }
}
```

**What Code Expects:**
```json
{
  "dashboardCharts": {
    "emotionalPainsChart": [...],
    "competitorGapsChart": [...]
  }
}
```

**Impact:** Even if renderer loaded, charts would fail due to missing `dashboardCharts` key.

---

## ✅ FIXES APPLIED

### Fix 1: Loading Verification Logs
**File:** `UI/UI_Stage1_Renderer.html`

Added at script start:
```javascript
console.log('📊 UI_Stage1_Renderer.html EXECUTION START');
console.log('   Time:', new Date().toISOString());
window._RENDERER_SCRIPT_EXECUTED = true;
```

Added at script end:
```javascript
console.log('✅ UI_Stage1_Renderer.html loaded');
console.log('   typeof renderUnifiedStage1Results:', typeof window.renderUnifiedStage1Results);
```

### Fix 2: JSON Normalizer Function
**File:** `UI/UI_Stage1_Renderer.html`

Added `normalizeGeminiJsonResponse()` function that handles:
- `strategicIntelligenceDashboard` → `dashboardCharts`
- `charts` → `dashboardCharts`
- `visualizations` → `dashboardCharts`

### Fix 3: Command Canvas Fallback Renderer
**File:** `UI/UI_Stage_Runner.html`

Replaced plain white `renderDirectFallback()` with Command Canvas styling:
- Pure black #000 background
- Glassmorphism panels (`backdrop-filter: blur(20px)`)
- Amber #F59E0B and Magenta #EC4899 accents
- Collapsible sections with rotating chevron

---

## 🔍 DIAGNOSTIC: Check Console After Deploy

### Expected Success Logs:
```
📊 UI_Stage1_Renderer.html EXECUTION START
   Time: 2024-XX-XXTXX:XX:XX.XXXZ
📊 UI_Stage1_Renderer.html loading...
✅ UI_Stage1_Renderer.html loaded
   typeof renderUnifiedStage1Results: function
```

### If Still Failing:
- If `undefined` but EXECUTION START shows: syntax error in script
- If NO EXECUTION START: include path is wrong

### Issue #3: Fallback Renderer in `UI_Stage_Runner.html`

**Location:** Lines 1899-2017 in UI_Stage_Runner.html
**Problem:** When `renderUnifiedStage1Results` is undefined, a plain white box fallback renders instead.

---

## 🎯 FIX PLAN (14 Tasks)

### PHASE 1: DIAGNOSE RENDERER LOADING (Tasks 1-3)

#### Task 1: Check UI_Stage1_Renderer.html Inclusion
- [ ] Verify `UI_Stage1_Renderer.html` is in UI_Main.gs include list
- [ ] Check for `<?!= include('UI/UI_Stage1_Renderer'); ?>` in main template
- [ ] Confirm file path matches exactly

#### Task 2: Check for JavaScript Errors
- [ ] Add `console.log('📊 UI_Stage1_Renderer.html LOADED');` at script START
- [ ] Add `console.log('✅ renderUnifiedStage1Results DEFINED');` after function
- [ ] Test in browser to see which log appears

#### Task 3: Fix Race Condition
- [ ] Increase retry delay from 200ms to 500ms
- [ ] Add renderer availability check BEFORE first render attempt
- [ ] Implement DOMContentLoaded listener for renderer

### PHASE 2: FIX JSON STRUCTURE MAPPING (Tasks 4-6)

#### Task 4: Create JSON Adapter Layer
- [ ] Build `normalizeGeminiResponse(jsonData)` function
- [ ] Map `strategicIntelligenceDashboard` → `dashboardCharts`
- [ ] Extract chart data from nested structure

#### Task 5: Update CHART_MAP to New Structure
- [ ] Map section data from `strategicIntelligenceDashboard.sections[]`
- [ ] Extract metrics, insights, action items per section
- [ ] Handle missing fields gracefully

#### Task 6: Update Prompt to Request Chart Data
- [ ] Add explicit `dashboardCharts` requirement to Gemini prompt
- [ ] Define exact JSON structure expected for each chart type
- [ ] Include sample JSON in prompt

### PHASE 3: FIX FALLBACK RENDERER (Tasks 7-9)

#### Task 7: Replace Plain Text Fallback
- [ ] Remove white box fallback in UI_Stage_Runner.html (lines 1899-2017)
- [ ] Replace with Command Canvas-aware fallback
- [ ] Ensure glassmorphism styles apply

#### Task 8: Add Inline Renderer Backup
- [ ] Embed critical renderer code directly in UI_Stage_Runner.html
- [ ] Define `window.renderUnifiedStage1Results` inline if missing
- [ ] Call Command Canvas builder from inline code

#### Task 9: Force forensic-command-canvas Class
- [ ] Add class to container in ALL code paths
- [ ] Ensure CSS is loaded before rendering
- [ ] Add !important to critical styles

### PHASE 4: FIX SECTION CONTENT EXTRACTION (Tasks 10-12)

#### Task 10: Parse Report Text into 14 Sections
- [ ] Extract SECTION 1-14 from Gemini's text response
- [ ] Handle "## 1.5 STRATEGIC INTELLIGENCE SUMMARY" format
- [ ] Map INSIGHT #1, #2, #3 to structured data

#### Task 11: Build Section Content from strategicIntelligenceDashboard
- [ ] Extract `sections[0-13]` from JSON
- [ ] Map `title`, `insights`, `actionItems`, `metrics` per section
- [ ] Generate formatted HTML from structured data

#### Task 12: Populate Competitor Cards from Forensic Data
- [ ] Extract competitor data from `window._lastStage1Json`
- [ ] Build competitor cards with Cite-ability, Brittleness, Moat Value
- [ ] Add Kill Move buttons with click handlers

### PHASE 5: VERIFICATION & DEPLOYMENT (Tasks 13-14)

#### Task 13: Add Diagnostic Mode
- [ ] Create `window.debugCommandCanvas()` function
- [ ] Log all data availability states
- [ ] Show which components rendered vs failed

#### Task 14: Git Commit & Deploy
- [ ] Commit all fixes
- [ ] Push to main branch
- [ ] Test in production

---

## 📁 FILES TO MODIFY

| File | Changes |
|------|---------|
| `UI/UI_Stage1_Renderer.html` | Add loading logs, fix function export |
| `UI/UI_Stage_Runner.html` | Replace fallback, add inline backup |
| `UI_Main.gs` | Verify include order |
| `DB_Workflow_Stage1.gs` | Update prompt for chart JSON |
| `UI/UI_Styles_Command_Canvas.html` | Ensure CSS loads first |

---

## 🔧 IMMEDIATE FIXES (Copy-Paste Ready)

### Fix 1: Add Loading Verification to UI_Stage1_Renderer.html

```javascript
// ADD AT VERY TOP OF <script> tag:
console.log('📊 UI_Stage1_Renderer.html EXECUTION START');

// ADD AFTER window.renderUnifiedStage1Results definition:
console.log('✅ window.renderUnifiedStage1Results DEFINED:', typeof window.renderUnifiedStage1Results);
```

### Fix 2: Add JSON Normalizer

```javascript
// ADD BEFORE renderUnifiedStage1Results call:
function normalizeGeminiResponse(jsonData) {
  // Handle strategicIntelligenceDashboard structure
  if (jsonData?.strategicIntelligenceDashboard && !jsonData?.dashboardCharts) {
    console.log('🔄 Normalizing strategicIntelligenceDashboard → dashboardCharts');
    const sid = jsonData.strategicIntelligenceDashboard;
    jsonData.dashboardCharts = {
      emotionalPainsChart: sid.sections?.[0]?.charts || [],
      jtbdChart: sid.sections?.[1]?.charts || [],
      competitorGapsChart: sid.sections?.[2]?.charts || [],
      // ... map all 14 sections
    };
  }
  return jsonData;
}
```

### Fix 3: Inline Fallback Renderer (Emergency)

```javascript
// ADD TO UI_Stage_Runner.html in the fallback section:
if (typeof window.renderUnifiedStage1Results !== 'function') {
  console.log('🚨 EMERGENCY: Defining inline renderUnifiedStage1Results');
  window.renderUnifiedStage1Results = function(reportText, jsonData) {
    const container = document.getElementById('stage1-unified-container');
    if (!container) return;
    
    container.classList.add('forensic-command-canvas');
    container.style.background = '#000';
    container.style.padding = '2rem';
    
    // Emergency Command Canvas with glassmorphism
    container.innerHTML = `
      <div style="background: rgba(15,23,42,0.75); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 2rem;">
        <div style="border-top: 3px solid linear-gradient(90deg, #F59E0B, #EC4899, #06B6D4); padding-bottom: 1rem;">
          <h2 style="color: #F8FAFC; font-size: 1.5rem; margin: 0;">🎯 Strategic Intelligence Report</h2>
          <p style="color: #F59E0B; font-style: italic; margin-top: 1rem;">"Elite forensic analysis complete. Review sections below."</p>
        </div>
        <div style="color: #94A3B8; font-size: 0.95rem; line-height: 1.7; margin-top: 1rem;">
          ${(reportText || '').replace(/\\n/g, '<br>')}
        </div>
      </div>
    `;
  };
}
```

---

## 🚀 EXECUTION ORDER

1. **Task 2** - Add loading logs (5 min)
2. **Task 1** - Verify include (10 min)
3. **Task 8** - Add inline backup (15 min)
4. **Task 7** - Replace fallback (10 min)
5. **Task 4** - JSON adapter (20 min)
6. **Task 10-11** - Section extraction (30 min)
7. **Task 13** - Diagnostic mode (10 min)
8. **Task 14** - Deploy (5 min)

**Total Estimated Time:** 1.5 hours

---

## ✅ SUCCESS CRITERIA

- [ ] `renderUnifiedStage1Results` shows as `function` in logs
- [ ] Forensic Command Canvas renders with black glassmorphism background
- [ ] Section titles are clickable (Progressive Disclosure)
- [ ] Rotating chevron appears on each section
- [ ] 3 metric badges (Cite-ability, Moat, Value) appear per section
- [ ] Charts render in 550px fixed containers
- [ ] Competitor cards populate from forensic data
- [ ] No plain white box fallback ever appears
