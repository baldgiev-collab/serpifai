# Refactoring Manifest: UI_Script_App.html (Proxy Transition)

## Current Status
- **Original Size:** 35,341 lines
- **Current Size:** 33,751 lines  
- **Lines Removed:** ~1,590 lines
- **Includes Applied:** 6 scriptlets (3 at top, 3 after IIFE)

## Architectural Strategy
- **Proxy File:** UI_Script_App.html (Keeps filename, acts as a Barrel).
- **Naming Convention:** `[Module]_[Descriptor]_[Type].html`
- **Inclusion:** Server-side `<?!= include('FileName'); ?>` scriptlets.

## Phase Overview
- [x] Phase 1: Chart Diagnostic Tools -> `UI_Charts_Diagnostics.html` (195 lines) ✅ APPLIED
- [x] Phase 2: Core Variables & State -> `CORE_State_Global.html` (372 lines) ✅ APPLIED  
- [x] Phase 3: Navigation & Project Handlers -> `UI_Nav_Handlers.html` (398 lines) ✅ APPLIED
- [x] Phase 4: Clean up unused aliases (18 lines removed) ✅ APPLIED
- [x] Phase 5: Competitor Analysis Init -> `COMP_Analysis_Init.html` (450 lines) ✅ APPLIED
- [x] Phase 6: Competitor Tab Rendering -> `COMP_Tab_Render.html` (452 lines) ✅ APPLIED
- [x] Phase 7: Competitor Action Bar -> `COMP_ActionBar.html` (344 lines) ✅ APPLIED
- [ ] Phase 8: PDF Generation -> `COMP_PDF_Generator.html` (Lines 3797-4700)
- [ ] Phase 9: CSV Export & Sorting -> `COMP_Export_Sort.html` (Lines 4700-4900)

## Current File Structure
```
UI_Scripts_App.html (33,751 lines)
├── Lines 1-3: Include scriptlets (Charts, State, Nav)
├── Line 4: <script>
├── Lines 5-3787: Main IIFE
├── Line 3789: <?!= include('COMP_Analysis_Init'); ?>
├── Line 3791: <?!= include('COMP_Tab_Render'); ?>
├── Line 3793: <?!= include('COMP_ActionBar'); ?>
├── Lines 3795-33751: PDF Gen, Tab Populators, Charts, etc.
└── </script></body>
```

## Architecture Notes
The include files provide `window.*` global functions, but the IIFE defines 
LOCAL versions that use IIFE-scoped DOM references (tabs, navBtns, breadcrumb, etc.).
The local functions are necessary because they have direct access to the cached 
DOM references, which improves performance and allows for proper scoping.

## File Reduction Tracker
| Phase | Lines Removed | Running Total | File Size |
|-------|---------------|---------------|-----------|
| Original | 0 | 0 | 35,341 lines |
| Phase 1 | ~165 | ~165 | 35,176 lines |
| Phase 4 | ~18 | ~183 | 35,158 lines |
| Phase 5 | ~613 | ~796 | 34,545 lines |
| Phase 6 | ~450 | ~1,246 | 34,095 lines |
| Phase 7 | ~344 | ~1,590 | 33,751 lines |

## Implementation Rules
1. Every new file must wrap JS in `<script>` and CSS in `<style>` tags.
2. In `UI_Script_App.html`, the code is replaced by a scriptlet include.
3. `Code.gs` must be verified for the `include()` helper function.
4. Functions exposed globally use `window.functionName` pattern.

## Dependencies
- **Code.gs:** Ensure the following helper exists:
  ```javascript
  function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  }
  ```

## Extraction Log

### Phase 1 - EXECUTED ✅
- **Date:** Current session
- **Source:** `UI_Scripts_App.html` lines 1-100
- **Target:** `UI_Charts_Diagnostics.html` (already created)
- **Lines Removed:** ~100 lines
- **Contents Extracted:**
  - `window._pageLoadTime` initialization
  - `window.diagnoseCharts()` function (~80 lines)
  - Auto-diagnostic setTimeout (5 second delay)
  - `window._googleScriptCallCount` and `window._googleScriptCalls` arrays
  - `window._intervals` and `window._timeouts` tracking arrays
  - `setInterval` and `setTimeout` interceptors
  - `google.script.run` proxy interceptor
- **Scriptlet Added:** `<?!= include('UI_Charts_Diagnostics'); ?>`
- **Status:** Waiting for user to accept diff

### Phase 2 - NEXT
- **Target Lines:** ~101-500 (IIFE content through core functions)
- **Expected Contents:**
  - DOM element references (tabs, navBtns, breadcrumb, etc.)
  - `FIELD_IDS` array
  - `setActiveTab()`, `switchTheme()`, `showToast()`
  - Loading indicator functions
  - Workflow menu collapse
  - Auto-save system
  - `collectFormData()`, `fillFormData()`, `recalcScores()`

## File Reduction Tracker
| Phase | Lines Removed | Running Total | File Size Estimate |
|-------|---------------|---------------|-------------------|
| Original | 0 | 0 | ~36,000 lines |
| Phase 1 | ~100 | ~100 | ~35,900 lines |
| Phase 2 | ~400 | ~500 | ~35,500 lines |
| Phase 3 | ~400 | ~900 | ~35,100 lines |