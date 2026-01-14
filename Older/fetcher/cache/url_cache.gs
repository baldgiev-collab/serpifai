/**
 * Fetcher Cache Layer
 * Caches URL fetch results to avoid redundant requests
 */

function CACHE_get(key) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(key);
  
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  
  return null;
}

function CACHE_set(key, value, ttlSeconds) {
  ttlSeconds = ttlSeconds || 3600; // Default 1 hour
  var cache = CacheService.getScriptCache();
  
  try {
    cache.put(key, JSON.stringify(value), ttlSeconds);
    return true;
  } catch (e) {
    return false;
  }
}

function CACHE_delete(key) {
  var cache = CacheService.getScriptCache();
  cache.remove(key);
}

function CACHE_clear() {
  var cache = CacheService.getScriptCache();
  cache.removeAll(cache.getKeys());
}

/**
 * Generate cache key from URL and operation
 */
function CACHE_makeKey(url, operation) {
  operation = operation || 'fetch';
  return 'fetcher_' + operation + '_' + Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    url,
    Utilities.Charset.UTF_8
  ).map(function(byte) {
    return (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, '0');
  }).join('');
}

/**
 * Cached wrapper for fetch operations
 */
function CACHE_fetchUrl(url, ttlSeconds) {
  var cacheKey = CACHE_makeKey(url, 'html');
  var cached = CACHE_get(cacheKey);
  
  if (cached) {
    cached._fromCache = true;
    return cached;
  }
  
  // Fetch fresh
  var result = FET_fetchSingleUrl(url);
  
  if (result.ok) {
    CACHE_set(cacheKey, result, ttlSeconds);
  }
  
  return result;
}
