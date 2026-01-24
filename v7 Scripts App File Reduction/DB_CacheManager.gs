/**
 * DB_CacheManager.gs
 * Content generation cache management
 * Now integrated with MySQL database via PHP Gateway
 */

/**
 * Write item to generation cache
 * @param {object} item - Cache item with all metadata
 * @return {object} Result with cache_id
 */
function DB_CACHE_write(item) {
  try {
    var cacheId = item.cache_id || Utilities.getUuid();
    
    var result = callGateway({
      action: 'cache:write',
      data: {
        cache_id: cacheId,
        date: item.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        platform: item.platform || '',
        format: item.format || '',
        subtype: item.subtype || '',
        topic: item.topic || '',
        draft: item.draft || '',
        qa_scores: item.qa || {},
        published: item.published || false,
        published_url: item.published_url || ''
      }
    });
    
    if (result && result.success) {
      return { ok: true, cache_id: cacheId };
    } else {
      return { ok: false, error: result.error || 'Cache write failed' };
    }
    
  } catch (e) {
    DB_LOG_error('CACHE', 'Error writing cache: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Read cache items by topic
 * @param {string} topic - Topic to search for
 * @return {array} Array of matching cache items
 */
function DB_CACHE_readByTopic(topic) {
  try {
    var result = callGateway({
      action: 'cache:readByTopic',
      data: { topic: topic }
    });
    
    if (result && result.success) {
      return result.data || [];
    } else {
      DB_LOG_warn('CACHE', 'Cache read failed: ' + (result.error || 'Unknown error'));
      return [];
    }
    
  } catch (e) {
    DB_LOG_error('CACHE', 'Error reading cache by topic: ' + e);
    return [];
  }
}

/**
 * List recent cache items
 * @param {number} limit - Maximum number of items to return
 * @return {array} Array of recent cache items
 */
function DB_CACHE_listRecent(limit) {
  try {
    var result = callGateway({
      action: 'cache:listRecent',
      data: { limit: limit || 20 }
    });
    
    if (result && result.success) {
      return result.data || [];
    } else {
      DB_LOG_warn('CACHE', 'Cache list failed: ' + (result.error || 'Unknown error'));
      return [];
    }
    
  } catch (e) {
    DB_LOG_error('CACHE', 'Error listing recent cache: ' + e);
    return [];
  }
}

/**
 * Update cache item status
 * @param {object} params - { cache_id, published, published_url }
 * @return {object} Update result
 */
function DB_CACHE_updateStatus(params) {
  try {
    if (!params || !params.cache_id) {
      return { ok: false, msg: 'cache_id required' };
    }
    
    var result = callGateway({
      action: 'cache:updateStatus',
      data: {
        cache_id: params.cache_id,
        published: params.published,
        published_url: params.published_url
      }
    });
    
    if (result && result.success) {
      return { ok: true };
    } else {
      return { ok: false, msg: result.error || 'Update failed' };
    }
    
  } catch (e) {
    DB_LOG_error('CACHE', 'Error updating cache status: ' + e);
    return { ok: false, msg: String(e) };
  }
}

/**
 * Legacy function names for backwards compatibility
 */
function CACHE_write(item) {
  return DB_CACHE_write(item);
}

function CACHE_readByTopic(topic) {
  return DB_CACHE_readByTopic(topic);
}

function CACHE_listRecent(limit) {
  return DB_CACHE_listRecent(limit);
}

function CACHE_updateStatus(params) {
  return DB_CACHE_updateStatus(params);
}

// ═══════════════════════════════════════════════════════════════════════════════
// V12.0 PHASE 7: GEMINI RESPONSE CACHING
// Reduces API calls and improves response time for repeated queries
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * V12.0: Generate cache key for Gemini responses
 * Creates a deterministic key based on prompt content and model
 * @param {string} prompt - The prompt text
 * @param {string} model - The model name
 * @returns {string} Cache key
 */
function generateGeminiCacheKey(prompt, model) {
  // Create a hash-like key from prompt + model
  const content = (model || 'default') + ':' + (prompt || '').substring(0, 500);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'gemini_cache_' + Math.abs(hash).toString(36);
}

/**
 * V12.0: Cache a Gemini response
 * @param {string} prompt - The original prompt
 * @param {string} model - The model used
 * @param {string} response - The Gemini response
 * @param {Object} metadata - Additional metadata { stage, projectId, etc. }
 * @returns {Object} Cache result { ok: boolean, cacheKey: string }
 */
function DB_CACHE_geminiResponse(prompt, model, response, metadata) {
  try {
    const cacheKey = generateGeminiCacheKey(prompt, model);
    const now = new Date();
    
    // Store in Google Apps Script CacheService (fast, 6-hour max TTL)
    const cache = CacheService.getUserCache();
    const cacheData = JSON.stringify({
      response: response,
      model: model,
      timestamp: now.toISOString(),
      metadata: metadata || {},
      promptHash: cacheKey
    });
    
    // Check size - CacheService has 100KB limit per key
    if (cacheData.length > 95000) {
      Logger.log('⚠️ Gemini response too large for cache (' + cacheData.length + ' bytes)');
      // Store truncated version
      const truncated = JSON.stringify({
        response: response.substring(0, 80000),
        model: model,
        timestamp: now.toISOString(),
        metadata: metadata || {},
        promptHash: cacheKey,
        truncated: true
      });
      cache.put(cacheKey, truncated, 21600); // 6 hours
    } else {
      cache.put(cacheKey, cacheData, 21600); // 6 hours
    }
    
    Logger.log('✅ Gemini response cached: ' + cacheKey);
    
    // Also store in MySQL for longer persistence (optional)
    try {
      callGateway({
        action: 'cache:write',
        data: {
          cache_id: cacheKey,
          date: Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
          platform: 'gemini',
          format: 'json',
          subtype: model || 'default',
          topic: 'gemini_response',
          draft: response.substring(0, 50000), // MySQL text field limit
          qa_scores: metadata || {},
          published: false,
          published_url: ''
        }
      });
      Logger.log('   Also persisted to MySQL');
    } catch (mysqlErr) {
      Logger.log('   MySQL persist optional failed: ' + mysqlErr.message);
    }
    
    return { ok: true, cacheKey: cacheKey };
    
  } catch (e) {
    Logger.log('❌ Gemini cache write error: ' + e.toString());
    return { ok: false, error: e.toString() };
  }
}

/**
 * V12.0: Retrieve cached Gemini response
 * @param {string} prompt - The original prompt
 * @param {string} model - The model
 * @param {number} maxAgeMinutes - Maximum cache age in minutes (default: 60)
 * @returns {Object|null} Cached response or null if not found/expired
 */
function DB_CACHE_getGeminiResponse(prompt, model, maxAgeMinutes) {
  try {
    const cacheKey = generateGeminiCacheKey(prompt, model);
    const cache = CacheService.getUserCache();
    const cached = cache.get(cacheKey);
    
    if (!cached) {
      Logger.log('📭 Gemini cache miss: ' + cacheKey);
      return null;
    }
    
    const data = JSON.parse(cached);
    const cacheTime = new Date(data.timestamp);
    const now = new Date();
    const ageMinutes = (now - cacheTime) / (1000 * 60);
    
    maxAgeMinutes = maxAgeMinutes || 60;
    
    if (ageMinutes > maxAgeMinutes) {
      Logger.log('📭 Gemini cache expired: ' + cacheKey + ' (age: ' + Math.round(ageMinutes) + ' min)');
      cache.remove(cacheKey);
      return null;
    }
    
    Logger.log('✅ Gemini cache hit: ' + cacheKey + ' (age: ' + Math.round(ageMinutes) + ' min)');
    return {
      response: data.response,
      model: data.model,
      timestamp: data.timestamp,
      metadata: data.metadata,
      fromCache: true,
      cacheAge: Math.round(ageMinutes),
      truncated: data.truncated || false
    };
    
  } catch (e) {
    Logger.log('⚠️ Gemini cache read error: ' + e.toString());
    return null;
  }
}

/**
 * V12.0: Invalidate cached Gemini response
 * @param {string} prompt - The original prompt
 * @param {string} model - The model
 * @returns {Object} { ok: boolean }
 */
function DB_CACHE_invalidateGemini(prompt, model) {
  try {
    const cacheKey = generateGeminiCacheKey(prompt, model);
    const cache = CacheService.getUserCache();
    cache.remove(cacheKey);
    Logger.log('🗑️ Gemini cache invalidated: ' + cacheKey);
    return { ok: true };
  } catch (e) {
    Logger.log('⚠️ Gemini cache invalidate error: ' + e.toString());
    return { ok: false, error: e.toString() };
  }
}

/**
 * V12.0: Get Gemini cache statistics
 * @returns {Object} Cache stats
 */
function DB_CACHE_geminiStats() {
  try {
    // CacheService doesn't provide stats, so we estimate from MySQL
    const result = callGateway({
      action: 'cache:readByTopic',
      data: { topic: 'gemini_response' }
    });
    
    if (result && result.success && result.data) {
      const items = result.data || [];
      return {
        totalCached: items.length,
        oldestCache: items.length > 0 ? items[items.length - 1].date : null,
        newestCache: items.length > 0 ? items[0].date : null
      };
    }
    
    return { totalCached: 0 };
    
  } catch (e) {
    return { totalCached: 0, error: e.toString() };
  }
}
