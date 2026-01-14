/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DB_Cache.gs - CACHING LAYER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Cache operations using CacheService
 * 
 * @module DB_Cache
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get cached value
 * @param {string} key - Cache key
 * @return {*} Cached value or null
 */
function DB_Cache_get(key) {
  try {
    const cache = CacheService.getScriptCache();
    const data = cache.get(_sanitizeKey(key));
    
    if (!data) return null;
    
    return UTIL_parseJSON(data, null);
  } catch (error) {
    LOG_debug('DB_Cache', 'Get failed', { key, error: error.message });
    return null;
  }
}

/**
 * Set cached value
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default 1 hour)
 * @return {boolean} Success
 */
function DB_Cache_set(key, value, ttl) {
  try {
    const cache = CacheService.getScriptCache();
    const data = UTIL_stringify(value);
    
    // CacheService max is 21600 seconds (6 hours)
    ttl = Math.min(ttl || CACHE_TTL.MEDIUM, 21600);
    
    cache.put(_sanitizeKey(key), data, ttl);
    return true;
  } catch (error) {
    LOG_warn('DB_Cache', 'Set failed', { key, error: error.message });
    return false;
  }
}

/**
 * Remove cached value
 * @param {string} key - Cache key
 * @return {boolean} Success
 */
function DB_Cache_remove(key) {
  try {
    const cache = CacheService.getScriptCache();
    cache.remove(_sanitizeKey(key));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Invalidate all cache entries matching a prefix
 * @param {string} prefix - Key prefix
 */
function DB_Cache_invalidate(prefix) {
  // CacheService doesn't support wildcards, so we track keys
  try {
    const indexKey = '_cache_index';
    const cache = CacheService.getScriptCache();
    const indexData = cache.get(indexKey);
    
    if (!indexData) return;
    
    const index = UTIL_parseJSON(indexData, []);
    const keysToRemove = index.filter(k => k.startsWith(prefix));
    
    keysToRemove.forEach(k => cache.remove(k));
    
    // Update index
    const newIndex = index.filter(k => !k.startsWith(prefix));
    cache.put(indexKey, UTIL_stringify(newIndex), CACHE_TTL.LONG);
    
    LOG_debug('DB_Cache', `Invalidated ${keysToRemove.length} keys with prefix: ${prefix}`);
  } catch (error) {
    LOG_debug('DB_Cache', 'Invalidate failed', { prefix, error: error.message });
  }
}

/**
 * Clear all cache
 */
function DB_Cache_clearAll() {
  try {
    const cache = CacheService.getScriptCache();
    
    // Get index and remove all tracked keys
    const indexData = cache.get('_cache_index');
    if (indexData) {
      const index = UTIL_parseJSON(indexData, []);
      index.forEach(k => cache.remove(k));
    }
    
    cache.remove('_cache_index');
    LOG_info('DB_Cache', 'Cache cleared');
  } catch (error) {
    LOG_warn('DB_Cache', 'Clear failed', { error: error.message });
  }
}

/**
 * Get or compute value (cache-aside pattern)
 * @param {string} key - Cache key
 * @param {Function} compute - Function to compute value if not cached
 * @param {number} ttl - Cache TTL
 * @return {*} Cached or computed value
 */
function DB_Cache_getOrCompute(key, compute, ttl) {
  const cached = DB_Cache_get(key);
  if (cached !== null) {
    return cached;
  }
  
  const value = compute();
  if (value !== null && value !== undefined) {
    DB_Cache_set(key, value, ttl);
  }
  
  return value;
}

/**
 * Get multiple cached values
 * @param {Array} keys - Cache keys
 * @return {Object} Map of key to value
 */
function DB_Cache_getAll(keys) {
  try {
    const cache = CacheService.getScriptCache();
    const sanitizedKeys = keys.map(_sanitizeKey);
    const data = cache.getAll(sanitizedKeys);
    
    const result = {};
    keys.forEach((key, idx) => {
      const sanitized = sanitizedKeys[idx];
      result[key] = data[sanitized] ? UTIL_parseJSON(data[sanitized], null) : null;
    });
    
    return result;
  } catch (error) {
    LOG_debug('DB_Cache', 'GetAll failed', { error: error.message });
    return {};
  }
}

/**
 * Set multiple cached values
 * @param {Object} values - Map of key to value
 * @param {number} ttl - TTL for all values
 * @return {boolean} Success
 */
function DB_Cache_setAll(values, ttl) {
  try {
    const cache = CacheService.getScriptCache();
    ttl = Math.min(ttl || CACHE_TTL.MEDIUM, 21600);
    
    const data = {};
    Object.keys(values).forEach(key => {
      data[_sanitizeKey(key)] = UTIL_stringify(values[key]);
    });
    
    cache.putAll(data, ttl);
    return true;
  } catch (error) {
    LOG_warn('DB_Cache', 'SetAll failed', { error: error.message });
    return false;
  }
}

/**
 * Track cache key for invalidation
 * @param {string} key - Cache key
 */
function DB_Cache_trackKey(key) {
  try {
    const cache = CacheService.getScriptCache();
    const indexData = cache.get('_cache_index');
    const index = indexData ? UTIL_parseJSON(indexData, []) : [];
    
    if (!index.includes(key)) {
      index.push(key);
      cache.put('_cache_index', UTIL_stringify(index), CACHE_TTL.LONG);
    }
  } catch (error) {
    // Silently fail
  }
}

/**
 * Get cache statistics
 * @return {Object} Cache stats
 */
function DB_Cache_getStats() {
  try {
    const cache = CacheService.getScriptCache();
    const indexData = cache.get('_cache_index');
    const index = indexData ? UTIL_parseJSON(indexData, []) : [];
    
    return {
      trackedKeys: index.length,
      indexSize: (indexData || '').length
    };
  } catch (error) {
    return { trackedKeys: 0, indexSize: 0 };
  }
}

/**
 * Sanitize cache key (max 250 chars, alphanumeric)
 * @param {string} key - Raw key
 * @return {string} Sanitized key
 */
function _sanitizeKey(key) {
  if (!key) return 'default';
  
  // Replace non-alphanumeric with underscore
  let sanitized = key.replace(/[^a-zA-Z0-9_]/g, '_');
  
  // Truncate if too long
  if (sanitized.length > 200) {
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, key)
      .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
      .join('');
    sanitized = sanitized.substring(0, 150) + '_' + hash;
  }
  
  return sanitized;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER CACHE (per-user storage)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get user-specific cached value
 * @param {string} key - Cache key
 * @return {*} Cached value
 */
function DB_Cache_getUser(key) {
  try {
    const cache = CacheService.getUserCache();
    const data = cache.get(_sanitizeKey(key));
    return data ? UTIL_parseJSON(data, null) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Set user-specific cached value
 * @param {string} key - Cache key
 * @param {*} value - Value
 * @param {number} ttl - TTL in seconds
 */
function DB_Cache_setUser(key, value, ttl) {
  try {
    const cache = CacheService.getUserCache();
    ttl = Math.min(ttl || CACHE_TTL.MEDIUM, 21600);
    cache.put(_sanitizeKey(key), UTIL_stringify(value), ttl);
    return true;
  } catch (error) {
    return false;
  }
}
