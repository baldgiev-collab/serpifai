# 🚨 SERVER API ERRORS - URGENT FIX NEEDED

## Test Results: 0/5 APIs Working

All API stages are failing with server errors. Here's what needs to be fixed on your server:

---

## ❌ Error 1: PHP Fetcher - Unknown Action

```
Unknown fetcher action: fetcher_single
```

**File**: `/serpifai_php/apis/fetcher_router.php` or similar  
**Issue**: The action name `fetcher_single` is not recognized  
**Fix**: Add support for `fetcher_single` action or update to correct action name

**Check**:
```php
// In fetcher_router.php or api_gateway.php
case 'fetcher_single':
case 'fetch:single':
    return handleFetcherSingle($payload);
```

---

## ❌ Error 2: PageSpeed API - Undefined Array Key

```
Undefined array key "performance"
File: /serpifai_php/apis/pagespeed_api.php
Line: 88
```

**File**: `/home/u187453795/domains/serpifai.com/public_html/serpifai_php/apis/pagespeed_api.php`  
**Line**: 88  
**Issue**: Trying to access `$data['performance']` but key doesn't exist

**Fix**: Add null check before accessing array key

```php
// Line 88 in pagespeed_api.php - BEFORE:
$performanceScore = $data['performance']; // ❌ Crashes if key missing

// Line 88 in pagespeed_api.php - AFTER:
$performanceScore = $data['performance'] ?? 0; // ✅ Safe with default
```

Or check if the PageSpeed API response format changed.

---

## ❌ Error 3: Serper API - Undefined Function

```
Call to undefined function getCacheValue()
```

**File**: `/serpifai_php/apis/serper_api.php`  
**Issue**: Function `getCacheValue()` is called but not defined

**Fix**: Either:

**Option A**: Add the missing function
```php
function getCacheValue($key) {
    // Your cache implementation
    return false; // or get from cache
}
```

**Option B**: Include the cache helper file
```php
require_once __DIR__ . '/../helpers/cache_helper.php';
```

**Option C**: Remove cache calls temporarily
```php
// Comment out cache calls for now
// $cached = getCacheValue($cacheKey);
```

---

## ✅ Good News: OpenPageRank Works!

The only API that successfully returned data:

```json
{
  "success": true,
  "domain": "toptal.com",
  "page_rank_integer": 6,
  "page_rank_decimal": 6.4,
  "rank": "1489"
}
```

But there's a **data parsing error** in the Apps Script code trying to read `.rank` property.

---

## ⚠️ Minor Issue: Custom Search Engine ID

```
Google Search Engine ID not configured
```

This is expected - you need to create a Custom Search Engine at:
https://programmablesearchengine.google.com/

Then add the ID to your `.env` file:
```bash
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

---

## 🔧 Quick Fix Priority

### Priority 1 (Critical):
1. Fix PageSpeed API (line 88 - add null check)
2. Fix Serper API (add getCacheValue function or include file)

### Priority 2 (Important):
3. Fix PHP Fetcher action name
4. Fix OpenPageRank data parsing in FT_EliteCompetitorFetcher.gs

### Priority 3 (Optional):
5. Add Google Custom Search Engine ID

---

## 📋 Testing Commands

After fixing, test with:

```javascript
// In Apps Script
TEST_gatewayAPIs()  // Test all 5 APIs
TEST_eliteFetcher() // Test full competitor fetch
```

Expected result after fixes:
```
✅ TEST PASSED: GOOD quality (4/5 stages)
[1/5] ✅ PHP Fetcher: SUCCESS
[2/5] ⚠️  Custom Search: Needs Engine ID
[3/5] ✅ PageSpeed: Performance 87/100
[4/5] ✅ Serper: 8 search results
[5/5] ✅ OpenPageRank: Rank 6.4
```

---

## 🆘 Need Help?

1. Check server error logs: `/home/u187453795/logs/error.log`
2. Enable PHP error display temporarily
3. Test each API endpoint individually via Postman
4. Share the full error stack trace if issues persist
