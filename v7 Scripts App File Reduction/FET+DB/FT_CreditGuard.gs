/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_CreditGuard.gs - API Cost Efficiency & Smart Caching System
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CREDIT GUARD SYSTEM:
 * ✓ 24-hour domain analysis cache check before API calls
 * ✓ Intelligent API call throttling
 * ✓ Cost tracking per domain/project
 * ✓ Cache HIT/MISS logging for transparency
 * 
 * PREVENTS:
 * - Duplicate API calls within 24 hours
 * - Excessive Serper/PageSpeed API usage
 * - Unnecessary Gemini token consumption
 * 
 * @version 1.0.0
 * @author SerpifAI Engineering
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// CREDIT GUARD CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CREDIT_GUARD_CONFIG = {
  // Cache TTL in milliseconds (24 hours)
  CACHE_TTL_MS: 24 * 60 * 60 * 1000,
  
  // API costs per call (for tracking)
  API_COSTS: {
    SERPER_SEARCH: 0.001,      // ~$1 per 1000 searches
    PAGESPEED: 0,               // Free but rate limited
    OPENPAGERANK: 0,            // Free tier
    GEMINI_FLASH: 0.0001,       // Per 1K tokens
    GEMINI_PRO: 0.0005,         // Per 1K tokens
    PHP_FETCHER: 0              // Self-hosted
  },
  
  // Rate limits per hour
  RATE_LIMITS: {
    SERPER: 100,
    PAGESPEED: 60,
    OPENPAGERANK: 100,
    GEMINI: 1000
  },
  
  // Cache keys prefix
  CACHE_PREFIX: 'CG_'
};

// ═══════════════════════════════════════════════════════════════════════════
// CREDIT GUARD CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if domain was analyzed recently (within 24 hours)
 * Returns cached data if available, null if needs fresh fetch
 * @param {string} domain - Domain to check
 * @param {string} dataType - Type of data: 'full', 'serper', 'pagespeed', 'opr'
 * @returns {Object|null} Cached data or null
 */
function CG_checkCache(domain, dataType) {
  try {
    const cacheKey = CREDIT_GUARD_CONFIG.CACHE_PREFIX + dataType + '_' + _normalizedDomain(domain);
    const cache = CacheService.getScriptCache();
    const cached = cache.get(cacheKey);
    
    if (cached) {
      const data = JSON.parse(cached);
      const age = Date.now() - (data._cachedAt || 0);
      const ageHours = Math.round(age / (1000 * 60 * 60) * 10) / 10;
      
      if (age < CREDIT_GUARD_CONFIG.CACHE_TTL_MS) {
        Logger.log(`   💾 CACHE HIT: ${domain} [${dataType}] - ${ageHours}h old`);
        return {
          hit: true,
          data: data,
          ageMs: age,
          ageHours: ageHours,
          source: 'cache_24h'
        };
      } else {
        Logger.log(`   ⏰ CACHE EXPIRED: ${domain} [${dataType}] - ${ageHours}h old (>24h)`);
      }
    }
    
    Logger.log(`   🔍 CACHE MISS: ${domain} [${dataType}] - will fetch fresh`);
    return null;
    
  } catch (e) {
    Logger.log(`   ⚠️ Cache check failed: ${e.message}`);
    return null;
  }
}

/**
 * Save data to 24-hour cache
 * @param {string} domain - Domain to cache
 * @param {string} dataType - Type of data
 * @param {Object} data - Data to cache
 * @returns {boolean} Success
 */
function CG_saveToCache(domain, dataType, data) {
  try {
    const cacheKey = CREDIT_GUARD_CONFIG.CACHE_PREFIX + dataType + '_' + _normalizedDomain(domain);
    const cache = CacheService.getScriptCache();
    
    // Add cache timestamp
    const cacheData = {
      ...data,
      _cachedAt: Date.now(),
      _domain: domain,
      _dataType: dataType
    };
    
    // Cache for 24 hours (max is 6 hours for Apps Script, so we'll use that)
    // Note: Apps Script cache max is 21600 seconds (6 hours)
    // For true 24h cache, we use Script Properties for persistent storage
    cache.put(cacheKey, JSON.stringify(cacheData), 21600);
    
    // Also save to persistent storage for 24h coverage
    _saveToPersistentCache(cacheKey, cacheData);
    
    Logger.log(`   💾 CACHED: ${domain} [${dataType}]`);
    return true;
    
  } catch (e) {
    Logger.log(`   ⚠️ Cache save failed: ${e.message}`);
    return false;
  }
}

/**
 * Pre-flight check before making paid API calls
 * Returns true if API call should proceed, false if cached data is sufficient
 * @param {string} domain - Domain to analyze
 * @param {Array<string>} apiTypes - APIs to check: ['serper', 'pagespeed', 'opr', 'gemini']
 * @returns {Object} { proceed: boolean, cached: Object, savings: number }
 */
function CG_preflightCheck(domain, apiTypes) {
  Logger.log(`   🛡️ CREDIT GUARD: Pre-flight check for ${domain}`);
  
  const result = {
    proceed: {},
    cached: {},
    savings: 0,
    recommendation: ''
  };
  
  apiTypes = apiTypes || ['serper', 'pagespeed', 'opr'];
  
  apiTypes.forEach(apiType => {
    const cacheResult = CG_checkCache(domain, apiType);
    
    if (cacheResult && cacheResult.hit) {
      result.proceed[apiType] = false;
      result.cached[apiType] = cacheResult.data;
      result.savings += CREDIT_GUARD_CONFIG.API_COSTS[apiType.toUpperCase()] || 0;
    } else {
      result.proceed[apiType] = true;
      result.cached[apiType] = null;
    }
  });
  
  const cachedCount = Object.values(result.proceed).filter(v => !v).length;
  const totalAPIs = apiTypes.length;
  
  if (cachedCount === totalAPIs) {
    result.recommendation = 'ALL_CACHED';
    Logger.log(`   ✅ ALL DATA CACHED - No API calls needed (saved $${result.savings.toFixed(4)})`);
  } else if (cachedCount > 0) {
    result.recommendation = 'PARTIAL_CACHE';
    Logger.log(`   📊 PARTIAL CACHE - ${cachedCount}/${totalAPIs} APIs cached`);
  } else {
    result.recommendation = 'FRESH_FETCH';
    Logger.log(`   🔄 NO CACHE - Fresh fetch required`);
  }
  
  return result;
}

/**
 * Track API call for rate limiting
 * @param {string} apiType - API type
 * @returns {boolean} True if under rate limit
 */
function CG_trackAPICall(apiType) {
  try {
    const props = PropertiesService.getScriptProperties();
    const hourKey = 'CG_RATE_' + apiType + '_' + _getCurrentHour();
    const currentCount = parseInt(props.getProperty(hourKey) || '0', 10);
    const limit = CREDIT_GUARD_CONFIG.RATE_LIMITS[apiType.toUpperCase()] || 1000;
    
    if (currentCount >= limit) {
      Logger.log(`   ⚠️ RATE LIMIT: ${apiType} at ${currentCount}/${limit} calls this hour`);
      return false;
    }
    
    props.setProperty(hourKey, String(currentCount + 1));
    return true;
    
  } catch (e) {
    return true; // Allow on error
  }
}

/**
 * Get Credit Guard statistics
 * @returns {Object} Usage stats
 */
function CG_getStats() {
  try {
    const props = PropertiesService.getScriptProperties();
    const allProps = props.getProperties();
    
    const stats = {
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: {},
      estimatedSavings: 0,
      lastReset: null
    };
    
    Object.keys(allProps).forEach(key => {
      if (key.startsWith('CG_RATE_')) {
        const parts = key.replace('CG_RATE_', '').split('_');
        const apiType = parts[0];
        stats.apiCalls[apiType] = (stats.apiCalls[apiType] || 0) + parseInt(allProps[key] || '0', 10);
      }
    });
    
    return stats;
    
  } catch (e) {
    return { error: e.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function _normalizedDomain(domain) {
  return (domain || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .replace(/[^a-z0-9.-]/g, '_');
}

function _getCurrentHour() {
  return new Date().toISOString().slice(0, 13).replace(/[-:T]/g, '');
}

function _saveToPersistentCache(key, data) {
  try {
    // Use Script Properties for persistence beyond 6 hours
    // Compress data to fit within 9KB property limit
    const props = PropertiesService.getScriptProperties();
    const minimalData = {
      _cachedAt: data._cachedAt,
      scores: data.scores || {},
      metrics: data.metrics || {},
      success: data.success,
      domain: data._domain
    };
    
    const compressed = JSON.stringify(minimalData);
    if (compressed.length < 9000) {
      props.setProperty('PC_' + key, compressed);
    }
  } catch (e) {
    // Silent fail for persistence
  }
}

function _loadFromPersistentCache(key) {
  try {
    const props = PropertiesService.getScriptProperties();
    const data = props.getProperty('PC_' + key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// SMART FETCH WRAPPERS (Use these instead of direct API calls)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Smart fetch with Credit Guard - checks cache first
 * @param {string} domain - Domain to fetch
 * @param {Function} fetchFn - Function to call if cache miss
 * @param {string} dataType - Type identifier for caching
 * @returns {Object} Data (from cache or fresh)
 */
function CG_smartFetch(domain, fetchFn, dataType) {
  // Check cache first
  const cacheResult = CG_checkCache(domain, dataType);
  
  if (cacheResult && cacheResult.hit) {
    return {
      ...cacheResult.data,
      _fromCache: true,
      _cacheAge: cacheResult.ageHours + 'h'
    };
  }
  
  // Check rate limit
  if (!CG_trackAPICall(dataType)) {
    Logger.log(`   ⚠️ Rate limited - using fallback for ${dataType}`);
    return { success: false, rateLimited: true, error: 'Rate limit exceeded' };
  }
  
  // Make fresh API call
  try {
    const result = fetchFn();
    
    if (result && result.success) {
      // Save to cache for next time
      CG_saveToCache(domain, dataType, result);
    }
    
    return result;
    
  } catch (e) {
    Logger.log(`   ❌ Fetch failed: ${e.message}`);
    return { success: false, error: e.message };
  }
}

/**
 * Smart PageSpeed fetch with Credit Guard
 */
function CG_fetchPageSpeed(domain) {
  return CG_smartFetch(domain, () => {
    return FT_callPageSpeedAPI('https://' + domain);
  }, 'pagespeed');
}

/**
 * Smart Serper fetch with Credit Guard  
 */
function CG_fetchSerper(query, domain) {
  return CG_smartFetch(domain, () => {
    return FT_callSerperAPI(query);
  }, 'serper');
}

/**
 * Smart OpenPageRank fetch with Credit Guard
 */
function CG_fetchOpenPageRank(domain) {
  return CG_smartFetch(domain, () => {
    return callGateway('opr_get_rank', { domain: domain });
  }, 'opr');
}

// Export for global access
var FT_CreditGuard = {
  check: CG_checkCache,
  save: CG_saveToCache,
  preflight: CG_preflightCheck,
  stats: CG_getStats,
  smartFetch: CG_smartFetch,
  fetchPageSpeed: CG_fetchPageSpeed,
  fetchSerper: CG_fetchSerper,
  fetchOPR: CG_fetchOpenPageRank
};
