# Chart & Metadata Fix Deployment Guide

## Problem Summary
1. **Metadata N/A**: Word Count, Schema, Page Title, Headings, Meta Description all showing N/A
2. **Charts Not Rendering**: All 12+ competitor analysis tabs showing blank charts
3. **Root Cause**: PHP fetcher was returning raw HTML only, not extracting metadata

## Fixes Applied

### 1. PHP Fetcher (fetcher_handler.php) - CRITICAL
**Location**: `v6_saas/serpifai_php/handlers/fetcher_handler.php`

**Changes**:
- Added `extractMetadataFromHtml()` function - extracts title, description, h1, h2[], wordCount, language
- Added `extractSchemaFromHtml()` function - extracts JSON-LD schema types
- Added `extractLinksFromHtml()` function - extracts internal/external links
- Added `extractImagesFromHtml()` function - extracts image src and alt
- Added `extractHeadingsFromHtml()` function - extracts all H1-H6 headings
- Modified `fetchSingleUrl()` return to include metadata, schema, links, images, headings

**⚠️ MUST DEPLOY TO SERVER**: Upload to `/home/u187453795/domains/serpifai.com/public_html/serpifai_php/handlers/fetcher_handler.php`

### 2. Apps Script Synthesizer (FT_EliteCompetitorFetcher.gs)
**Location**: `v6_saas/apps_script/FT_EliteCompetitorFetcher.gs`

**Changes**:
- Added wordCount estimation fallback when PHP fails
- Uses Serper snippet word count × 35 multiplier as estimate
- Sets `wordCountEstimated: true` flag when using fallback
- Logs `📊 Estimated wordCount: X (from Y snippet words)`

**Copy to**: Google Apps Script Editor → FT_EliteCompetitorFetcher.gs

### 3. UI Charts (UI_Scripts_App.html)
**Location**: `v6_saas/apps_script/UI_Scripts_App.html`

**Changes**:
- Added Chart.js availability check before rendering
- Added debug logging for canvas element detection
- Added data logging for chart datasets
- Logs chart data arrays to help debug zero values

**Copy to**: Google Apps Script Editor → UI_Scripts_App.html

## Deployment Steps

### Step 1: Deploy PHP to Server
```powershell
# Upload fetcher_handler.php to production
# Use FileZilla/FTP or hosting panel file manager
# Destination: /home/u187453795/domains/serpifai.com/public_html/serpifai_php/handlers/
```

### Step 2: Update Apps Script Files
1. Open Google Apps Script Editor (script.google.com)
2. Copy content from local files to Apps Script:
   - `FT_EliteCompetitorFetcher.gs`
   - `UI_Scripts_App.html`
3. Save all files

### Step 3: Create New Deployment
1. Click "Deploy" → "Manage deployments"
2. Create new deployment OR edit existing
3. Copy new web app URL
4. Update spreadsheet with new deployment URL if changed

### Step 4: Test
1. Run a new competitor analysis
2. Open browser Developer Console (F12)
3. Check for these logs:
   - `📊 renderTechnicalSEOCharts called with X competitors`
   - `✅ Chart.js is available (version: X.X.X)`
   - `chart-tech-radar canvas: FOUND`
   - `Domain radar data: [values...]`
   - `✅ Tech radar chart created`

## Expected Console Output After Fix
```
📊 Rendering Content Intelligence Charts for 5 competitors
   chart-content-depth canvas: FOUND
   Word Count data: [1050, 875, 1200, 950, 800]
📊 renderTechnicalSEOCharts called with 5 competitors
✅ Chart.js is available (version: 4.4.1)
   chart-tech-radar canvas: FOUND
   competitor.com radar data: [85, 92, 88, 79, 65, 72]
   ✅ Tech radar chart created
   chart-tech-bar canvas: FOUND
   Bar chart data - Perf: [85, 78, 82, 75, 80] RAG: [65, 45, 72, 38, 55] SEO: [92, 88, 90, 85, 87]
   ✅ Tech bar chart created
```

## If Charts Still Don't Render

1. **Check Chart.js Loading**: Look for `❌ Chart.js is not loaded!` in console
2. **Check Canvas Elements**: Look for `NOT FOUND` in canvas logs
3. **Check Data Values**: If all values are 0, the PHP deployment may not be complete
4. **Clear Cache**: Hard refresh the page (Ctrl+Shift+R)

## Data Flow Summary
```
User triggers analysis
    ↓
callGateway('fetcher_single', {extractMetadata: true, ...})
    ↓
PHP fetcher_handler.php → fetchSingleUrl()
    ↓
extractMetadataFromHtml($html) → {title, description, h1, h2, wordCount, language}
extractSchemaFromHtml($html) → {types, hasOrganizationSchema}
    ↓
Returns to Apps Script: phpResult.data.metadata, phpResult.data.schema
    ↓
FT_synthesizeEliteData() → synthesized.website = {title, wordCount, ...}
    ↓
UI receives: competitor.synthesized.website.wordCount
    ↓
renderContentIntelligenceCharts() → Chart.js bar chart with wordCount data
```
