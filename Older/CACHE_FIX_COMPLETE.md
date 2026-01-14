# 🎯 CACHE FUNCTION FIX - Complete

## THE NEW ERROR
After fixing line 260, PHP now recognizes `gemini:generate` ✅  
But hit new error: `Call to undefined function getCacheValue()`

## THE PROBLEM
`gemini_api.php` calls `getCacheValue()` and `setCacheValue()` but they're only defined in `pagespeed_api.php` - not globally available.

## THE FIX ✅ DONE
Added cache functions to `gemini_api.php` (lines 6-42):
- `getCacheValue($key)` - reads from fetcher_cache table
- `setCacheValue($key, $value, $ttl)` - writes to fetcher_cache with expiry

## UPLOAD TO HOSTINGER

### Option A: Re-upload Fixed File (2 min)
1. Upload `v6_saas/serpifai_php/apis/gemini_api.php` from Git repo
2. Upload to `public_html/serpifai_php/apis/gemini_api.php`
3. Overwrite existing file

### Option B: Quick Edit (3 min)
1. Open Hostinger cPanel → File Manager
2. Navigate to `public_html/serpifai_php/apis/gemini_api.php`
3. Click Edit
4. After line 5 (after the comment block), add these functions:

```php
/**
 * Helper: Get cache value
 */
function getCacheValue($key) {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT response_data FROM fetcher_cache WHERE url_hash = ? AND expires_at > NOW()");
        $stmt->execute([$key]);
        $result = $stmt->fetch();
        return $result ? json_decode($result['response_data'], true) : null;
    } catch (Exception $e) {
        error_log("Cache read failed: " . $e->getMessage());
        return null;
    }
}

/**
 * Helper: Set cache value
 */
function setCacheValue($key, $value, $ttl = 3600) {
    try {
        $db = getDB();
        $expiresAt = date('Y-m-d H:i:s', time() + $ttl);
        
        $stmt = $db->prepare("
            INSERT INTO fetcher_cache (url_hash, url, response_data, expires_at, created_at)
            VALUES (?, 'gemini', ?, ?, NOW())
            ON DUPLICATE KEY UPDATE response_data = ?, expires_at = ?
        ");
        
        $jsonValue = is_string($value) ? $value : json_encode($value);
        $stmt->execute([$key, $jsonValue, $expiresAt, $jsonValue, $expiresAt]);
        return true;
    } catch (Exception $e) {
        error_log("Cache write failed: " . $e->getMessage());
        return false;
    }
}
```

5. Save file

## TEST IT WORKS
Open Apps Script Editor → Run `TEST_PHPBackend`

**Expected result:**
```
✅ Gemini action routing works!
   Response code: 200
   Response: {"success":true,"data":"Hello! How can I help...","text":"Hello!..."}
```

## THEN TEST STAGE 1
1. Open web app → Hard refresh (Ctrl+Shift+R)
2. Run Stage 1 complete workflow
3. Should see:
   - ✅ Full Gemini response text
   - ✅ 11 dashboard charts populated
   - ✅ 40/60 layout (text left, charts right)

---

**Progress:**
- ✅ Fixed line 260 routing (gemini: vs gemini_)
- ✅ Added cache functions to gemini_api.php
- ⏳ Need to upload to server
- ⏳ Test complete workflow

**Time remaining:** 2 min upload + 3 min test = 5 minutes total 🚀
