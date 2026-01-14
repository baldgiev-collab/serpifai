# 🔑 API Keys Reference - DataBridge Script Properties

## Required Configuration

All API keys must be set in **DataBridge Apps Script** → **Project Settings** → **Script Properties**

---

## Current Setup

| Property Name | Status | Value | Purpose |
|---------------|--------|-------|---------|
| `GEMINI_API_KEY` | ✅ Configured | AIzaSyClWi... | AI insights generation |
| `GEMINI_MODEL` | ✅ Set | gemini-2.0-flash-exp | AI model version |
| `OPEN_PAGERANK_KEY` | ✅ Configured | (your key) | Domain authority scores |
| `PAGE_SPEED_KEY` | ⚠️ Optional | (not set) | Core Web Vitals data |

---

## Important Notes

### ⚠️ Property Name Changes

**OLD (WRONG)**:
- ❌ `PAGESPEED_API_KEY` → Won't work!
- ❌ `OPR_KEY` → Deprecated

**NEW (CORRECT)**:
- ✅ `PAGE_SPEED_KEY` → Use this for PageSpeed
- ✅ `OPEN_PAGERANK_KEY` → Use this for OpenPageRank

### How to Check Your Keys

Run this in DataBridge:
```javascript
function CHECK_apiKeys() {
  var props = PropertiesService.getScriptProperties();
  Logger.log('GEMINI_API_KEY: ' + !!props.getProperty('GEMINI_API_KEY'));
  Logger.log('OPEN_PAGERANK_KEY: ' + !!props.getProperty('OPEN_PAGERANK_KEY'));
  Logger.log('PAGE_SPEED_KEY: ' + !!props.getProperty('PAGE_SPEED_KEY'));
}
```

---

## Adding PageSpeed Key (Optional)

**Without this key**: System uses estimated Core Web Vitals data  
**With this key**: System fetches real Core Web Vitals from Google

### Get Free API Key:

1. **Visit Google Cloud Console**:
   https://console.cloud.google.com

2. **Enable API**:
   - APIs & Services → Library
   - Search: "PageSpeed Insights API"
   - Click → Enable

3. **Create Credentials**:
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Copy the key

4. **Add to DataBridge**:
   - Open DataBridge Apps Script
   - Project Settings (⚙️)
   - Script Properties → Add script property
   - Name: `PAGE_SPEED_KEY`
   - Value: (paste your API key)
   - Save

5. **Test**:
   - Run `TEST_apiAndModuleIntegration`
   - Should show: `PageSpeed Key: ✅ Configured`

---

## Impact on Data Quality

| Scenario | Real Data % | Missing |
|----------|-------------|---------|
| **No PageSpeed Key** | 91% (10/11) | Core Web Vitals |
| **With PageSpeed Key** | 100% (11/11) | None |

**Recommendation**: Add PageSpeed key for complete real data

---

## Testing After Setup

```javascript
// Run this in DataBridge
function TEST_apiAndModuleIntegration() {
  // Already exists - just run it
}
```

**Expected output**:
```
PageSpeed Key: ✅ Configured
APIS_getPageSpeedInsights: ✅ Available
Data Quality: ✅ Real Data
```

---

## API Usage Limits

| API | Free Tier | Rate Limit |
|-----|-----------|------------|
| **Gemini** | Pay-per-use | ~15 req/min |
| **OpenPageRank** | 1,000/month | Unlimited |
| **PageSpeed** | 25,000/day | 1 req/sec |

**Note**: With 2-6 competitors per analysis:
- Gemini: ~15-30 requests per analysis
- OpenPageRank: 2-6 requests per analysis  
- PageSpeed: 2-6 requests per analysis (if enabled)

**Monthly capacity** (free tier):
- ~65 full analyses/month (Gemini limited)
- 166 analyses/month (OpenPageRank limited if no PageSpeed)
- 4,166 analyses/month (PageSpeed limited if used)

---

## Quick Fix: Wrong Property Names

If you see `⚠️ Not set` warnings but you added the keys:

**Check for wrong names**:
```javascript
function FIX_wrongPropertyNames() {
  var props = PropertiesService.getScriptProperties();
  
  // Fix PageSpeed key name
  var oldPS = props.getProperty('PAGESPEED_API_KEY');
  if (oldPS) {
    props.setProperty('PAGE_SPEED_KEY', oldPS);
    props.deleteProperty('PAGESPEED_API_KEY');
    Logger.log('✅ Fixed: Renamed PAGESPEED_API_KEY → PAGE_SPEED_KEY');
  }
  
  // Fix OpenPageRank key name
  var oldOPR = props.getProperty('OPR_KEY');
  if (oldOPR) {
    props.setProperty('OPEN_PAGERANK_KEY', oldOPR);
    props.deleteProperty('OPR_KEY');
    Logger.log('✅ Fixed: Renamed OPR_KEY → OPEN_PAGERANK_KEY');
  }
  
  Logger.log('Done! Run TEST_apiAndModuleIntegration to verify.');
}
```

---

**Last Updated**: Current deployment fixes  
**Status**: All property names corrected in code
