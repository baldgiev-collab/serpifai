# 🔧 STAGE 1 SECTION-BY-SECTION FIX PLAN

> **Mission**: Fix charts not displaying and Gemini responses not fully shown  
> **Root Cause**: Charts generated in hidden storage, injection failing to place them in visible containers  
> **Status**: 🟢 ACTIVE — Phase-by-phase implementation

---

## 🔴 ROOT CAUSE ANALYSIS

### Problem 1: Charts Not Showing
**Symptom**: Empty chart containers with loading spinners  
**Root Cause Chain**:
1. Charts are generated in `#stage1-chart-storage` (hidden `display:none` container)
2. `injectChartsIntoCommandCanvas()` is called to clone charts into visible containers
3. **FAILURE POINT**: Chart canvases are created BUT the Chart.js instances are destroyed when cloned
4. **FAILURE POINT**: D3.js charts don't have containers created in Command Canvas sections
5. **FAILURE POINT**: Timing race condition - injection happens before charts finish rendering

### Problem 2: Gemini Response Not Fully Shown
**Symptom**: Content appears truncated or incomplete  
**Root Cause Chain**:
1. `formatEliteMarkdown()` may be mangling complex markdown structures
2. Table processing may be breaking on malformed markdown tables
3. Content zone exists but inner HTML isn't rendering all content

### Problem 3: Prompt-to-UI Disconnect
**Symptom**: Comprehensive prompts but sparse UI output  
**Root Cause Chain**:
1. Gemini response may not follow exact JSON schema
2. Parser may be failing to extract structured data
3. Chart data arrays may be empty even when report text is comprehensive

---

## 📋 PHASE 0: DIAGNOSTIC INJECTION (Tasks 1-5)

### Task 0.1: Add Console Diagnostics to Chart Flow
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Log every step of chart injection  
**Code**:
```javascript
window.injectChartsIntoCommandCanvas = function() {
  console.log('=== 🎨 CHART INJECTION DIAGNOSTIC START ===');
  
  const storage = document.getElementById('stage1-chart-storage');
  console.log('📦 Storage element:', storage);
  console.log('📦 Storage children:', storage?.children.length);
  
  // Log all canvas elements in storage
  const canvases = storage?.querySelectorAll('canvas');
  canvases?.forEach(c => {
    console.log(`  📊 Canvas: ${c.id}, hasContext: ${!!c.getContext('2d')}`);
  });
  
  // ... rest of injection
};
```

### Task 0.2: Add JSON Data Validator
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Validate dashboardCharts before rendering  
**Logic**:
```javascript
function validateDashboardCharts(jsonData) {
  const charts = jsonData?.dashboardCharts;
  const report = {
    hasCharts: !!charts,
    chartKeys: charts ? Object.keys(charts) : [],
    dataPresence: {}
  };
  
  const requiredCharts = [
    'customerFrustrationsChart',
    'hiddenAspirationsChart', 
    'mindsetTransformationChart',
    'customerJobPriorityChart',
    'competitiveAdvantageMapChart',
    'blueOceanOpportunitiesChart',
    'competitorKillMovesChart',
    'aeoAnalysisChart',
    'assetValuationChart',
    'brittlenessRiskChart',
    'informationBlackHolesChart'
  ];
  
  requiredCharts.forEach(key => {
    const data = charts?.[key];
    report.dataPresence[key] = {
      exists: !!data,
      type: Array.isArray(data) ? 'array' : typeof data,
      length: Array.isArray(data) ? data.length : (data ? 'object' : 0)
    };
  });
  
  console.table(report.dataPresence);
  return report;
}
```

### Task 0.3: Add Section Content Length Logging
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Log content lengths per section  
**Add to** `createCommandCanvasSectionDiv`:
```javascript
console.log(`📝 Section ${sectionNum}: ${content.length} chars, ${wordCount} words`);
```

### Task 0.4: Create Debug Panel Toggle
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Hidden debug panel showing all data states  
**Implementation**: Press Ctrl+Shift+D to toggle debug overlay

### Task 0.5: Add Chart Canvas State Inspector
**File**: `UI/UI_Chart_Generator.html`  
**Scope**: After each chart creation, log canvas state  
**Add after each chart creation**:
```javascript
console.log(`✅ Chart ${chartId}: created=${!!chart}, ctx=${!!canvas?.getContext('2d')}`);
```

---

## 📊 PHASE 1: FIX CHART INJECTION MECHANISM (Tasks 6-15)

### Task 1.1: Remove Clone, Use Direct Render
**File**: `UI/UI_Stage1_Renderer.html`  
**Problem**: Cloning Chart.js canvases destroys the chart instance  
**Solution**: Render charts DIRECTLY into Command Canvas containers  
**Implementation**:
```javascript
// BEFORE: Clone from storage (BROKEN)
const canvasClone = sourceCanvas.cloneNode(true);
wrapper.appendChild(canvasClone);

// AFTER: Create chart directly in target container
const targetCanvas = document.createElement('canvas');
targetCanvas.id = `section-${sectionNum}-chart`;
wrapper.appendChild(targetCanvas);
// Chart.js will render to this canvas
```

### Task 1.2: Modify Chart Generator to Accept Target Container
**File**: `UI/UI_Chart_Generator.html`  
**Scope**: Each chart creator function should accept optional target ID  
**Signature Change**:
```javascript
// BEFORE:
function createFrustrationsChart(data, animation) {
  const canvas = document.getElementById('chart-emotional-pains');

// AFTER:
function createFrustrationsChart(data, animation, targetId = 'chart-emotional-pains') {
  const canvas = document.getElementById(targetId);
```

### Task 1.3: Create Section-Specific Chart Renderer
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: New function to render chart directly into section  
**Implementation**:
```javascript
function renderChartInSection(sectionNum, chartData) {
  const chartStage = document.getElementById(`chart-stage-${sectionNum}`);
  if (!chartStage) return false;
  
  const wrapper = chartStage.querySelector('.chart-wrapper');
  if (!wrapper) return false;
  
  // Clear loading state
  wrapper.innerHTML = '';
  
  // Create canvas for this section
  const canvas = document.createElement('canvas');
  canvas.id = `section-${sectionNum}-chart`;
  canvas.style.cssText = 'width:100%;max-height:500px;';
  wrapper.appendChild(canvas);
  
  // Render appropriate chart based on section
  const chartType = SECTION_CHART_MAP[sectionNum];
  return window[chartType]?.(chartData, null, canvas.id);
}
```

### Task 1.4: Create Section → Chart Type Mapping
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Explicit mapping of sections to chart functions  
**Implementation**:
```javascript
const SECTION_CHART_MAP = {
  1: { 
    type: 'multi', 
    charts: [
      { fn: 'createFrustrationsChart', dataKey: 'customerFrustrationsChart' },
      { fn: 'createAspirationsChart', dataKey: 'hiddenAspirationsChart' },
      { fn: 'createMindsetChart', dataKey: 'mindsetTransformationChart' }
    ]
  },
  2: { type: 'single', fn: 'createJTBDChart', dataKey: 'customerJobPriorityChart' },
  3: { type: 'single', fn: 'createCompetitiveGapsChart', dataKey: 'competitiveAdvantageMapChart' },
  4: { type: 'single', fn: 'createBlueOceanChart', dataKey: 'blueOceanOpportunitiesChart' },
  5: { type: 'single', fn: 'createBrandPositioningChart', dataKey: 'brandPositioningChart' },
  6: { type: 'd3', fn: 'createInteractivePillarMindMap', dataKey: 'contentPillarMindMap' },
  7: { type: 'single', fn: 'createValuePropositionChart', dataKey: 'valuePropositionMixChart' },
  8: { type: 'multi', charts: [
    { fn: 'createPriorityMatrixChart', dataKey: 'priorityFocusMatrixChart' },
    { fn: 'createGanttChart', dataKey: 'actionPlanGantt' }
  ]},
  9: { type: 'single', fn: 'createAEOAnalysisChart', dataKey: 'aeoAnalysisChart' },
  10: { type: 'single', fn: 'createAssetValuationChart', dataKey: 'assetValuationChart' },
  11: { type: 'single', fn: 'createBrittlenessRiskChart', dataKey: 'brittlenessRiskChart' },
  12: { type: 'd3', fn: 'renderTopicGalaxy', dataKey: 'informationBlackHolesChart' },
  13: { type: 'single', fn: 'createImpactMatrixChart', dataKey: 'strategicImperativesChart' },
  14: { type: 'single', fn: 'createResourceAllocationChart', dataKey: 'crossStageDataChart' }
};
```

### Task 1.5: Implement Delayed Chart Rendering
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Render charts after DOM is fully built  
**Implementation**:
```javascript
// After all sections are created, render charts
setTimeout(() => {
  Object.entries(SECTION_CHART_MAP).forEach(([sectionNum, config]) => {
    const chartData = getChartData(jsonData, config.dataKey);
    if (chartData) {
      renderChartInSection(parseInt(sectionNum), chartData, config);
    }
  });
}, 500);
```

### Task 1.6: Add Chart Retry Mechanism
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: If chart fails, retry after delay  
**Implementation**:
```javascript
function renderChartWithRetry(sectionNum, chartData, config, retries = 3) {
  const success = renderChartInSection(sectionNum, chartData, config);
  if (!success && retries > 0) {
    setTimeout(() => {
      renderChartWithRetry(sectionNum, chartData, config, retries - 1);
    }, 300);
  }
}
```

### Task 1.7: Fix D3 Container ID Consistency
**File**: `UI/UI_Stage1_Renderer.html`  
**Problem**: D3 containers have inconsistent IDs  
**Solution**: Standardize to `d3-chart-${sectionNum}`  
**Implementation**:
```javascript
if (sectionNum === 6) {
  chartHtml += `<div id="d3-chart-6" class="d3-chart-container" style="width:100%;height:100%;"></div>`;
} else if (sectionNum === 12) {
  chartHtml += `<div id="d3-chart-12" class="d3-chart-container" style="width:100%;height:100%;"></div>`;
}
```

### Task 1.8: Add Chart Loading Timeout
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Show "No data" after 10s if chart doesn't load  
**Implementation**:
```javascript
setTimeout(() => {
  const wrapper = document.querySelector(`#chart-stage-${sectionNum} .chart-wrapper`);
  if (wrapper?.querySelector('.chart-loading-state')) {
    wrapper.innerHTML = `
      <div class="chart-no-data">
        <span class="chart-no-data-icon">📊</span>
        <p>Chart data unavailable</p>
        <button onclick="retryChartLoad(${sectionNum})">Retry</button>
      </div>
    `;
  }
}, 10000);
```

### Task 1.9: Create Multi-Chart Carousel for Section 1
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Section 1 has 3 charts - show in tabbed carousel  
**Implementation**:
```javascript
function createChartCarousel(sectionNum, charts) {
  return `
    <div class="chart-carousel" data-section="${sectionNum}">
      <div class="carousel-tabs">
        ${charts.map((c, i) => `
          <button class="carousel-tab${i === 0 ? ' active' : ''}" 
                  onclick="showCarouselChart(${sectionNum}, ${i})">
            ${c.label}
          </button>
        `).join('')}
      </div>
      <div class="carousel-content">
        ${charts.map((c, i) => `
          <div class="carousel-pane${i === 0 ? ' active' : ''}" data-pane="${i}">
            <canvas id="section-${sectionNum}-chart-${i}"></canvas>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
```

### Task 1.10: Add Chart Instance Registry
**File**: `UI/UI_Chart_Generator.html`  
**Scope**: Track all created chart instances for cleanup  
**Implementation**:
```javascript
window._chartRegistry = window._chartRegistry || new Map();

function registerChart(sectionNum, chartType, instance) {
  const key = `section-${sectionNum}-${chartType}`;
  
  // Destroy existing if present
  const existing = window._chartRegistry.get(key);
  if (existing?.destroy) existing.destroy();
  
  window._chartRegistry.set(key, instance);
}
```

---

## 📝 PHASE 2: FIX CONTENT RENDERING (Tasks 16-25)

### Task 2.1: Improve Markdown Table Parser
**File**: `UI/UI_Stage1_Renderer.html`  
**Problem**: Tables breaking on complex markdown  
**Solution**: More robust table regex  
**Implementation**:
```javascript
function processMarkdownTables(content) {
  // Match table blocks more reliably
  const tableRegex = /^\|[^\n]+\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|[^\n]+\|[\r\n]*)+)/gm;
  
  return content.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return match;
    
    // Parse header
    const headerCells = lines[0].split('|').filter(c => c.trim());
    
    // Skip separator line
    const dataRows = lines.slice(2);
    
    // Build HTML table
    let html = '<div class="elite-table-wrapper"><table class="elite-table">';
    html += '<thead><tr>';
    headerCells.forEach(cell => {
      html += `<th><div class="th-content">${cell.trim()}</div><div class="resize-handle"></div></th>`;
    });
    html += '</tr></thead><tbody>';
    
    dataRows.forEach(row => {
      const cells = row.split('|').filter(c => c.trim());
      html += '<tr>';
      cells.forEach(cell => {
        html += `<td>${cell.trim()}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    return html;
  });
}
```

### Task 2.2: Add Content Truncation Warning
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Detect if content seems truncated and warn  
**Implementation**:
```javascript
function detectTruncation(content) {
  const warnings = [];
  
  // Check for incomplete sentences
  if (content.endsWith('...') || content.endsWith('—')) {
    warnings.push('Content may be truncated');
  }
  
  // Check for unclosed markdown
  const openBold = (content.match(/\*\*/g) || []).length;
  if (openBold % 2 !== 0) {
    warnings.push('Unclosed bold markers detected');
  }
  
  // Check for unclosed code blocks
  const codeBlocks = (content.match(/```/g) || []).length;
  if (codeBlocks % 2 !== 0) {
    warnings.push('Unclosed code block detected');
  }
  
  return warnings;
}
```

### Task 2.3: Preserve Raw Content in Data Attribute
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Store raw content for "View Source" modal  
**Implementation**:
```javascript
// In createCommandCanvasSectionDiv
contentZone.setAttribute('data-raw-content', btoa(encodeURIComponent(content)));

// View source function
function viewRawSectionContent(sectionNum) {
  const zone = document.getElementById(`section-content-zone-${sectionNum}`);
  const raw = decodeURIComponent(atob(zone.getAttribute('data-raw-content')));
  showModal('Raw Gemini Response', `<pre>${escapeHtml(raw)}</pre>`);
}
```

### Task 2.4: Add "Expand All" / "Collapse All" Controls
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Global toggle for all section content  
**Implementation**:
```javascript
window.expandAllSections = function() {
  document.querySelectorAll('.section-content-zone').forEach(zone => {
    zone.style.display = 'block';
  });
  document.querySelectorAll('.hero-collapse-icon').forEach(icon => {
    icon.textContent = '▼';
  });
};

window.collapseAllSections = function() {
  document.querySelectorAll('.section-content-zone').forEach(zone => {
    zone.style.display = 'none';
  });
  document.querySelectorAll('.hero-collapse-icon').forEach(icon => {
    icon.textContent = '▶';
  });
};
```

### Task 2.5: Fix Code Block Rendering
**File**: `UI/UI_Stage1_Renderer.html`  
**Problem**: JSON code blocks not syntax highlighted  
**Solution**: Add Prism.js or simple JSON highlighter  
**Implementation**:
```javascript
function highlightJson(code) {
  return code
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>');
}
```

### Task 2.6: Ensure Lists Are Properly Closed
**File**: `UI/UI_Stage1_Renderer.html`  
**Problem**: List processing may leave unclosed tags  
**Solution**: Track list state and close properly  
**Implementation**:
```javascript
// After processing all lines
if (inList) {
  processed.push(listType === 'ol' ? '</ol>' : '</ul>');
}
```

### Task 2.7: Add Section Navigation Anchors
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Each section gets an anchor for navigation  
**Implementation**:
```javascript
sectionDiv.id = `section-anchor-${sectionNum}`;

// Add to executive summary navigation
window.scrollToSection = function(num) {
  const anchor = document.getElementById(`section-anchor-${num}`);
  anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
```

### Task 2.8: Improve Horizontal Rule Rendering
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Convert `---` to styled `<hr>`  
**Implementation**:
```javascript
content = content.replace(/^---+$/gm, '<hr class="elite-divider">');
```

### Task 2.9: Add Content Word Cloud Summary
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Extract key terms for quick section preview  
**Implementation**:
```javascript
function extractKeyTerms(content, count = 10) {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'and', 'or', 'but', 'if', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'their', 'your', 'its', 'our', 'my', 'his', 'her']);
  
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word, count]) => ({ word, count }));
}
```

### Task 2.10: Add Copy as Markdown Button
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Copy raw markdown instead of rendered HTML  
**Implementation**:
```javascript
function copySectionAsMarkdown(sectionNum) {
  const raw = window._sectionContentStore[sectionNum];
  navigator.clipboard.writeText(raw).then(() => {
    showToast('📋 Copied raw markdown to clipboard');
  });
}
```

---

## 🎯 PHASE 3: SECTION-BY-SECTION CHART FIXES (Tasks 26-39)

### Task 3.1: Section 1 — Customer Intelligence (3 Charts)
**Charts**: Frustrations Bar, Aspirations Bar, Mindset Transformation  
**Data Keys**: `customerFrustrationsChart`, `hiddenAspirationsChart`, `mindsetTransformationChart`  
**Fix**:
1. Create tabbed carousel for 3 charts
2. Ensure each chart has its own canvas with unique ID
3. Validate data arrays have `label` and `intensity` fields

### Task 3.2: Section 2 — JTBD Framework
**Chart**: JTBD Impact Radar  
**Data Key**: `jtbdScenarios` OR `customerJobPriorityChart`  
**Fix**:
1. Check both data keys (prompt uses `jtbdScenarios`, UI expects `customerJobPriorityChart`)
2. Normalize data format between prompt schema and chart expectation
3. Create mapping function: `jtbdScenarios` → chart format

### Task 3.3: Section 3 — Competitive Warfare
**Chart**: Competitor Gaps Radar  
**Data Key**: `competitiveAdvantageMapChart`  
**Fix**:
1. Verify radar chart configuration matches data structure
2. Handle case where competitor names vary

### Task 3.4: Section 4 — Blue Ocean Strategy
**Chart**: Blue Ocean ERRC Matrix  
**Data Key**: `blueOceanOpportunitiesChart`  
**Fix**:
1. Validate ERRC structure (Eliminate, Reduce, Raise, Create)
2. Create custom chart type for ERRC visualization

### Task 3.5: Section 5 — Brand Positioning
**Chart**: Brand Positioning Radar  
**Data Key**: `brandPositioningChart`  
**Fix**:
1. Ensure positioning axes are extracted correctly
2. Add competitor comparison lines

### Task 3.6: Section 6 — Content Pillars (D3 Mind Map)
**Chart**: Interactive Force-Directed Mind Map  
**Data Key**: `contentPillarMindMap` OR `contentPillars`  
**Fix**:
1. Validate pillar → cluster → keyword hierarchy
2. Ensure D3 container has correct ID: `d3-chart-6`
3. Check `createInteractivePillarMindMap` function availability

### Task 3.7: Section 7 — Strategic Moat
**Chart**: Moat Components Donut  
**Data Key**: `valuePropositionMixChart`  
**Fix**:
1. Create moat visualization from value proposition data
2. Add moat strength indicators

### Task 3.8: Section 8 — Action Plan
**Chart**: Priority Matrix + Gantt Timeline  
**Data Key**: `priorityFocusMatrixChart`  
**Fix**:
1. Create dual-chart layout
2. Implement simple Gantt using horizontal bar chart

### Task 3.9: Section 9 — AEO Citation Analysis
**Chart**: AEO Competitor Bar Chart  
**Data Key**: `aeoAnalysisChart`  
**Fix**:
1. Validate citeability scores are numeric
2. Add threshold lines for LOW/MEDIUM/HIGH tiers

### Task 3.10: Section 10 — Asset Valuation
**Chart**: Asset Value Bar Chart  
**Data Key**: `assetValuationChart`  
**Fix**:
1. Format dollar values correctly
2. Add valuation tier badges

### Task 3.11: Section 11 — Algorithmic Risk
**Chart**: Brittleness Risk Indicators  
**Data Key**: `brittlenessRiskChart`  
**Fix**:
1. Create risk-colored bars (red = high risk)
2. Add pulsing animation for HIGH risk items

### Task 3.12: Section 12 — Semantic Galaxy (D3)
**Chart**: Topic Cluster Galaxy  
**Data Key**: `informationBlackHolesChart`  
**Fix**:
1. Check `renderTopicGalaxy` OR `SemanticGalaxy` availability
2. Ensure container ID is `d3-chart-12`
3. Create fallback if D3 unavailable

### Task 3.13: Section 13 — Strategic Imperatives
**Chart**: Impact Matrix Scatter  
**Data Key**: `strategicImperatives` (may need to parse from content)  
**Fix**:
1. Extract top 10 imperatives from section content
2. Create simple priority list if chart data unavailable

### Task 3.14: Section 14 — Cross-Stage Prep
**Chart**: Data Handoff Card  
**Data Key**: N/A (informational)  
**Fix**:
1. Show data summary for next stages
2. Display as styled card, not chart

---

## 🔗 PHASE 4: PROMPT-TO-UI DATA BRIDGE (Tasks 40-50)

### Task 4.1: Create Response Schema Validator
**File**: `UI/UI_Gemini_Response_Parser.html`  
**Scope**: Validate Gemini response matches expected schema  
**Implementation**:
```javascript
function validateResponseSchema(response) {
  const errors = [];
  
  if (!response.dashboardCharts) {
    errors.push('Missing dashboardCharts object');
  }
  
  const requiredArrays = [
    'customerFrustrationsChart',
    'hiddenAspirationsChart',
    'jtbdScenarios'
  ];
  
  requiredArrays.forEach(key => {
    if (!Array.isArray(response.dashboardCharts?.[key])) {
      errors.push(`${key} should be an array`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}
```

### Task 4.2: Create Data Extraction Fallback
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: If JSON missing, extract from markdown  
**Implementation**:
```javascript
function extractChartDataFromMarkdown(content, chartType) {
  // Look for table with expected columns
  const tables = extractTables(content);
  
  switch (chartType) {
    case 'frustrations':
      return tables.find(t => 
        t.headers.includes('Frustration') && 
        t.headers.includes('Intensity')
      )?.rows.map(r => ({
        label: r['Frustration'],
        intensity: parseInt(r['Intensity']) || 5
      }));
    // ... more cases
  }
}
```

### Task 4.3: Add Chart Data Cache
**File**: `UI/UI_Stage1_Renderer.html`  
**Scope**: Cache chart data to prevent re-parsing  
**Implementation**:
```javascript
window._chartDataCache = window._chartDataCache || {};

function getChartData(jsonData, key) {
  if (window._chartDataCache[key]) {
    return window._chartDataCache[key];
  }
  
  let data = jsonData?.dashboardCharts?.[key];
  
  // Fallback: try root level
  if (!data) {
    data = jsonData?.[key];
  }
  
  // Fallback: extract from content
  if (!data && window._lastReportText) {
    data = extractChartDataFromMarkdown(window._lastReportText, key);
  }
  
  if (data) {
    window._chartDataCache[key] = data;
  }
  
  return data;
}
```

### Task 4.4: Standardize JTBD Data Format
**Problem**: Prompt generates `jtbdScenarios`, UI expects `customerJobPriorityChart`  
**Solution**: Create adapter function  
**Implementation**:
```javascript
function normalizeJTBDData(jsonData) {
  // If customerJobPriorityChart exists, use it
  if (jsonData?.dashboardCharts?.customerJobPriorityChart?.length) {
    return jsonData.dashboardCharts.customerJobPriorityChart;
  }
  
  // Otherwise, transform jtbdScenarios
  const scenarios = jsonData?.jtbdScenarios || 
                    jsonData?.dashboardCharts?.jtbdScenarios || [];
  
  return scenarios.map(s => ({
    jobTitle: s.title || s.jobTitle,
    urgency: s.priority || s.urgency || 5,
    importance: s.painIntensity || s.importance || 5,
    frequency: s.frequencyPerMonth || s.frequency || 5,
    segment: s.segment || 'General',
    outcome: s.soICan || s.outcome || 'Achieve goal'
  }));
}
```

### Task 4.5: Create Content Pillar Data Normalizer
**Problem**: Multiple possible data structures for pillars  
**Solution**: Normalize to consistent format  
**Implementation**:
```javascript
function normalizeContentPillars(jsonData) {
  const pillars = jsonData?.contentPillars || 
                  jsonData?.dashboardCharts?.contentPillars ||
                  jsonData?.dashboardCharts?.strategicContentPillarsChart || [];
  
  return pillars.map(p => ({
    name: p.name || p.pillar || p.title,
    clusters: (p.clusters || p.topics || []).map(c => ({
      name: typeof c === 'string' ? c : (c.name || c.topic),
      stage: c.stage || c.funnelStage || 'awareness',
      keywords: (c.keywords || c.semanticKeywords || []).map(k => 
        typeof k === 'string' ? { keyword: k } : k
      )
    })),
    moatScore: p.moatScore || p.moatPotential || 7,
    priority: p.priority || 1
  }));
}
```

### Task 4.6: Add Missing Chart Data Generators
**Scope**: Generate synthetic chart data from report text  
**For each missing chart type**, create extraction function

### Task 4.7: Create Universal Data Mapper
**File**: `UI/UI_Data_Mapper.html`  
**Scope**: Single function to get chart data with all fallbacks  
**Implementation**:
```javascript
window.getChartDataUniversal = function(jsonData, chartType, reportText) {
  // Level 1: Direct JSON access
  let data = jsonData?.dashboardCharts?.[chartType];
  
  // Level 2: Root level access
  if (!data) data = jsonData?.[chartType];
  
  // Level 3: Alternate key names
  const alternateKeys = CHART_KEY_ALIASES[chartType] || [];
  for (const key of alternateKeys) {
    if (!data) data = jsonData?.dashboardCharts?.[key] || jsonData?.[key];
  }
  
  // Level 4: Extract from markdown
  if (!data && reportText) {
    data = extractFromMarkdown(reportText, chartType);
  }
  
  // Level 5: Generate placeholder
  if (!data) {
    data = generatePlaceholderData(chartType);
  }
  
  return data;
};
```

### Task 4.8: Fix Gemini JSON Parsing Edge Cases
**Problem**: Gemini sometimes returns malformed JSON  
**Solution**: Add JSON repair function  
**Implementation**:
```javascript
function repairJson(jsonString) {
  // Remove trailing commas
  jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
  
  // Fix unquoted keys
  jsonString = jsonString.replace(/(\{|,)\s*([a-zA-Z_]\w*)\s*:/g, '$1"$2":');
  
  // Fix single quotes
  jsonString = jsonString.replace(/'/g, '"');
  
  return jsonString;
}
```

### Task 4.9: Add Response Integrity Check
**Scope**: Verify response completeness  
**Implementation**:
```javascript
function checkResponseIntegrity(response) {
  const report = {
    hasReport: !!response.report || !!response.analysis_text,
    hasJson: !!response.analysis_json || !!response.dashboardCharts,
    chartDataKeys: 0,
    chartDataItems: 0,
    sections: []
  };
  
  const charts = response.analysis_json?.dashboardCharts || response.dashboardCharts || {};
  report.chartDataKeys = Object.keys(charts).length;
  
  Object.entries(charts).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      report.chartDataItems += value.length;
      report.sections.push({ key, items: value.length });
    }
  });
  
  return report;
}
```

### Task 4.10: Create Error Recovery UI
**Scope**: If data missing, show helpful message  
**Implementation**:
```javascript
function showDataRecoveryUI(sectionNum, missingData) {
  const container = document.getElementById(`chart-stage-${sectionNum}`);
  container.innerHTML = `
    <div class="data-recovery-card">
      <h4>⚠️ Chart Data Unavailable</h4>
      <p>The AI response didn't include data for: ${missingData.join(', ')}</p>
      <div class="recovery-actions">
        <button onclick="regenerateSection(${sectionNum})">🔄 Regenerate Section</button>
        <button onclick="viewRawResponse(${sectionNum})">📄 View Raw Response</button>
      </div>
    </div>
  `;
}
```

---

## 🧪 PHASE 5: TESTING & VALIDATION (Tasks 51-60)

### Task 5.1: Create Chart Render Test Suite
**File**: `UI/UI_Chart_Render_Verification.html`  
**Scope**: Automated chart render verification  
**Implementation**:
```javascript
window.runChartRenderTest = function() {
  const results = [];
  
  for (let i = 1; i <= 14; i++) {
    const stage = document.getElementById(`chart-stage-${i}`);
    const hasCanvas = stage?.querySelector('canvas');
    const hasD3 = stage?.querySelector('svg');
    const hasLoading = stage?.querySelector('.chart-loading-state');
    const hasNoData = stage?.querySelector('.chart-no-data');
    
    results.push({
      section: i,
      rendered: !!(hasCanvas || hasD3),
      stillLoading: !!hasLoading,
      noData: !!hasNoData,
      status: (hasCanvas || hasD3) ? '✅' : (hasLoading ? '⏳' : '❌')
    });
  }
  
  console.table(results);
  return results;
};
```

### Task 5.2: Create Content Render Test
**Scope**: Verify all section content rendered  
**Implementation**:
```javascript
window.runContentRenderTest = function() {
  const results = [];
  
  for (let i = 1; i <= 14; i++) {
    const zone = document.getElementById(`section-content-zone-${i}`);
    const content = zone?.textContent || '';
    
    results.push({
      section: i,
      hasContent: content.length > 100,
      wordCount: content.split(/\s+/).length,
      hasTables: !!zone?.querySelector('table'),
      hasLists: !!zone?.querySelector('ul, ol'),
      status: content.length > 100 ? '✅' : '❌'
    });
  }
  
  console.table(results);
  return results;
};
```

### Task 5.3: Create Data Flow Tracer
**Scope**: Trace data from Gemini response to chart  
**Implementation**:
```javascript
window.traceDataFlow = function(chartType) {
  const trace = {
    chartType,
    steps: []
  };
  
  // Step 1: Check raw response
  const rawResponse = window._lastGeminiResponse;
  trace.steps.push({
    step: 'Raw Response',
    exists: !!rawResponse,
    size: JSON.stringify(rawResponse || {}).length
  });
  
  // Step 2: Check dashboardCharts
  const charts = rawResponse?.analysis_json?.dashboardCharts;
  trace.steps.push({
    step: 'dashboardCharts',
    exists: !!charts,
    keys: charts ? Object.keys(charts) : []
  });
  
  // Step 3: Check specific chart data
  const data = charts?.[chartType];
  trace.steps.push({
    step: `${chartType}`,
    exists: !!data,
    type: Array.isArray(data) ? 'array' : typeof data,
    length: Array.isArray(data) ? data.length : null
  });
  
  console.table(trace.steps);
  return trace;
};
```

### Task 5.4-5.10: Additional Tests
- Theme contrast validation
- Responsive layout testing
- Memory leak detection
- Cross-browser verification
- Performance benchmarking
- Accessibility audit
- Error handling verification

---

## 📦 PHASE 6: DEPLOYMENT & MONITORING (Tasks 61-65)

### Task 6.1: Create Diagnostic Mode
**Scope**: Add `?debug=1` URL parameter for diagnostic overlay  

### Task 6.2: Add Telemetry Hooks
**Scope**: Track chart render success/failure rates  

### Task 6.3: Create Error Report Generator
**Scope**: One-click export of all diagnostic data  

### Task 6.4: Add Performance Metrics Dashboard
**Scope**: Show render times per section  

### Task 6.5: Create Rollback Mechanism
**Scope**: Revert to legacy rendering if issues detected  

---

## 🎯 IMPLEMENTATION PRIORITY

### IMMEDIATE (Today)
1. Task 0.1-0.5: Add diagnostics
2. Task 1.1-1.3: Fix chart injection (direct render, not clone)
3. Task 2.1: Fix table parsing

### SHORT-TERM (This Week)
4. Tasks 1.4-1.10: Complete chart injection system
5. Tasks 2.2-2.10: Complete content rendering fixes
6. Tasks 3.1-3.14: Fix each section's chart

### MEDIUM-TERM (Next Week)
7. Tasks 4.1-4.10: Prompt-to-UI data bridge
8. Tasks 5.1-5.10: Testing suite

### LONG-TERM (Ongoing)
9. Tasks 6.1-6.5: Monitoring and maintenance

---

## 📊 SUCCESS METRICS

| Metric | Current | Target |
|--------|---------|--------|
| Charts Rendered | 0/14 | 14/14 |
| Content Fully Displayed | ~50% | 100% |
| Section Load Time | Unknown | <500ms |
| Chart Render Time | Unknown | <200ms |
| Data Extraction Success | Unknown | >95% |

---

*Generated: January 20, 2026*  
*Scope: 65 tasks across 6 phases*
