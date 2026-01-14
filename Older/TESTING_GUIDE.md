# 🧪 TESTING GUIDE - Elite Competitor Analysis

## ✅ ALL FIXES APPLIED - READY TO TEST

---

## 🚀 QUICK TEST (5 minutes)

### Step 1: Deploy Files
Upload these 3 fixed files to Apps Script:
1. ✅ `DB_COMP_EliteOrchestrator.gs`
2. ✅ `DB_COMP_Main.gs`  
3. ✅ `competitor_handler.php` (to your PHP server)

### Step 2: Run Setup (If Not Done)
In Apps Script editor:
```javascript
setupMasterSpreadsheet()
```

You should see:
```
✅ MASTER SPREADSHEET READY!
🔗 URL: https://docs.google.com/spreadsheets/d/xxxxx
```

### Step 3: Test Config Passing
In Apps Script editor, run this test:
```javascript
function TEST_ConfigPassing() {
  const config = {
    competitors: ['hubspot.com', 'salesforce.com'],
    projectId: 'test-' + new Date().getTime(),
    yourDomain: 'mycompany.com'
  };
  
  Logger.log('🧪 Testing config passing...');
  const result = COMP_orchestrateAnalysis(config);
  Logger.log('📊 Result: ' + JSON.stringify(result, null, 2));
  
  return result;
}
```

**Expected Logs:**
```
🎯 DB_COMP_orchestrateAnalysis called
   Config type: object ✅
   Config keys: competitors,projectId,yourDomain ✅
   Competitors count: 2 ✅
   Competitors: ["hubspot.com","salesforce.com"] ✅
📋 Step 1: Authorizing with backend...
✅ Authorized - Transaction #123 ✅
🚀 Step 2: Executing elite analysis...
   Passing config with 2 competitors ✅
🎯 ELITE Competitor Analysis Starting...
   [1/2] Fetching: hubspot.com
      ✅ Success
   [2/2] Fetching: salesforce.com
      ✅ Success
   Fetched 2 competitors successfully ✅
```

---

## 📋 DETAILED TEST SCENARIOS

### Scenario 1: Valid Input (2 Competitors)
**Input:**
```javascript
{
  competitors: ['example.com', 'competitor.com'],
  projectId: 'test-001',
  yourDomain: 'mysite.com'
}
```

**Expected Result:**
- ✅ Config validated
- ✅ 2 competitors fetched
- ✅ APIs called for each
- ✅ Gemini generates analysis
- ✅ MySQL saves (no PDO error)
- ✅ Master sheet updates

**Check:**
- Master_Projects tab: 1 new row
- Competitor_Data tab: 2 new rows
- AI_Analysis tab: 1 new row with real analysis text

---

### Scenario 2: Missing Competitors Array
**Input:**
```javascript
{
  projectId: 'test-002',
  yourDomain: 'mysite.com'
  // No competitors!
}
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Missing or invalid competitors array. Expected array, got: undefined"
}
```

---

### Scenario 3: Empty Competitors Array
**Input:**
```javascript
{
  competitors: [],
  projectId: 'test-003',
  yourDomain: 'mysite.com'
}
```

**Expected Result:**
```json
{
  "success": false,
  "error": "No competitors provided. Please provide at least one competitor domain."
}
```

---

### Scenario 4: Invalid Competitor Data
**Input:**
```javascript
{
  competitors: ['invalid-domain-that-does-not-exist.zzzz'],
  projectId: 'test-004',
  yourDomain: 'mysite.com'
}
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Failed to fetch competitor data. No valid competitors fetched.",
  "debugInfo": {
    "competitorCount": 0
  }
}
```

---

## 🔍 VERIFICATION CHECKLIST

### Apps Script Logs (Check These):
- [ ] "Config type: object" ✅
- [ ] "Competitors count: X" (where X > 0) ✅
- [ ] "Fetched X competitors successfully" ✅
- [ ] "[1/X] Fetching: domain.com" ✅
- [ ] "✅ Success" (for each competitor) ✅
- [ ] "Calling APIs for each competitor..." ✅
- [ ] "✅ Gemini analysis complete" ✅
- [ ] "✅ MySQL saved" ✅
- [ ] "✅ Master Sheet saved" ✅

### MySQL Database (Check These Tables):
```sql
-- Check projects table
SELECT * FROM projects WHERE project_type = 'competitor_analysis' ORDER BY created_at DESC LIMIT 1;

-- Check competitor_results table
SELECT project_id, competitor_domain, fetch_success FROM competitor_results ORDER BY created_at DESC LIMIT 5;

-- Check ai_analysis table
SELECT project_id, analysis_type, LENGTH(analysis_text) as text_length FROM ai_analysis ORDER BY created_at DESC LIMIT 1;

-- Check workflow_log table
SELECT project_id, stage_name, status FROM workflow_log ORDER BY created_at DESC LIMIT 1;
```

**Expected:**
- ✅ 1 row in `projects`
- ✅ 2+ rows in `competitor_results` (one per competitor)
- ✅ 1 row in `ai_analysis` with analysis text > 500 chars
- ✅ 1 row in `workflow_log` with status = 'completed'

### Master Google Sheet (Check These Tabs):
1. **Master_Projects Tab:**
   - [ ] New row with your project ID
   - [ ] Competitor Count = number of competitors
   - [ ] Status = "Completed"
   - [ ] JSON Data column populated

2. **Competitor_Data Tab:**
   - [ ] One row per competitor
   - [ ] Domain column has competitor domains
   - [ ] Fetch Status = "Success"
   - [ ] Performance, SEO Score columns have numbers
   - [ ] Snapshot JSON and API Data JSON populated

3. **AI_Analysis Tab:**
   - [ ] One row with your project ID
   - [ ] Analysis Type = "Competitor Intelligence"
   - [ ] Model Used = "gemini-2.0-flash-exp"
   - [ ] Analysis Text column has long text (500+ chars)
   - [ ] NO "fallback" or sample data

4. **Workflow_Stages Tab:**
   - [ ] One row with your project ID
   - [ ] Stage = "Competitor Analysis"
   - [ ] Status = "Completed"

---

## 🐛 TROUBLESHOOTING

### Issue: "Config type: undefined"
**Cause:** Config not being passed from UI

**Fix:**
1. Check UI is calling `COMP_orchestrateAnalysis(config)`
2. Verify config object has `competitors` array
3. Check Apps Script logs for config contents

**Test Directly:**
```javascript
// Run this in Apps Script editor
TEST_ConfigPassing();
```

---

### Issue: "No valid competitors array provided"
**Cause:** Competitors array empty or not array

**Fix:**
1. Check UI textarea value: `document.getElementById('keyCompetitors').value`
2. Verify comma-separated format: "site1.com, site2.com"
3. Check parsing: `.split(',').map(c => c.trim())`

**Test Directly:**
```javascript
// Check if competitors are parsed correctly
const input = "hubspot.com, salesforce.com";
const competitors = input.split(',').map(c => c.trim()).filter(c => c.length > 0);
Logger.log(competitors); // Should show: ["hubspot.com", "salesforce.com"]
```

---

### Issue: "Failed to fetch competitor data"
**Cause:** FT_fullSnapshot failing for all competitors

**Fix:**
1. Test FT_fullSnapshot directly:
```javascript
const result = FT_fullSnapshot('example.com');
Logger.log('FT result: ' + JSON.stringify(result));
```

2. Check if fetcher API is working
3. Verify API keys in Script Properties

---

### Issue: "Server error: Call to undefined method PDO::begin_transaction()"
**Cause:** Old PHP code still deployed

**Fix:**
1. ✅ Re-upload fixed `competitor_handler.php`
2. Verify file on server has `$db->beginTransaction()` not `begin_transaction()`
3. Clear PHP opcache if needed: `opcache_reset()`

---

### Issue: "Gemini analysis complete" but shows fallback data
**Cause:** Old code still using fallback

**Fix:**
1. ✅ Re-upload fixed `DB_COMP_EliteOrchestrator.gs`
2. Verify no calls to `generateFallbackAnalysis()`
3. Check analysis.text field for real content, not sample data

---

### Issue: "Cannot convert undefined or null to object"
**Cause:** Old code calling Object.keys() without validation

**Fix:**
1. ✅ Re-upload fixed `DB_COMP_EliteOrchestrator.gs`
2. All `Object.keys()` calls now protected with validation
3. Check logs for validation messages

---

## ✅ SUCCESS CRITERIA

### Test is successful when:
1. ✅ Config passes from UI to Apps Script with competitors array
2. ✅ FT_fullSnapshot fetches each competitor successfully
3. ✅ APIs enrich competitor data (Serper, PageSpeed, OpenPageRank)
4. ✅ Gemini generates real analysis (no fallback/sample data)
5. ✅ MySQL saves without PDO errors
6. ✅ Master Google Sheet updates with real data in all tabs
7. ✅ All logs show "✅ Success" messages
8. ✅ No errors in Apps Script execution log
9. ✅ No PHP errors in server error_log

---

## 📊 EXPECTED EXECUTION TIME

- **Config validation:** < 1 second
- **PHP authorization:** < 2 seconds
- **Fetching 2 competitors:** ~3-5 seconds (FT_fullSnapshot)
- **API enrichment:** ~2-3 seconds (3 APIs × 2 competitors)
- **Gemini analysis:** ~5-10 seconds (depending on data size)
- **MySQL save:** < 2 seconds
- **Google Sheets save:** < 3 seconds

**Total:** ~15-25 seconds for 2 competitors ✅

---

## 🎯 NEXT STEPS AFTER SUCCESSFUL TEST

1. **Test with More Competitors:**
   - Try 3 competitors
   - Try 5 competitors (max reasonable for performance)

2. **Test Different Domains:**
   - E-commerce sites
   - SaaS companies
   - Content publishers
   - Local businesses

3. **Monitor Performance:**
   - Check execution time
   - Monitor API quota usage
   - Watch credit consumption

4. **Review Data Quality:**
   - Check Gemini analysis quality
   - Verify all metrics populated
   - Ensure no missing data

5. **Production Deployment:**
   - Deploy to production environment
   - Enable for all users
   - Monitor error rates

---

**🎉 You're ready to test! Start with the Quick Test above.**
