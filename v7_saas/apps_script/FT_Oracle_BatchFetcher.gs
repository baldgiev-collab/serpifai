/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - STEP 2: BATCH PAGE FETCHER
 * Fetches Homepage + Blog Pages with Rate Limiting and Retry Logic
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Fetch HTML content from homepage + 10-15 blog pages per competitor
 * - Hybrid fetching (direct + PHP gateway fallback)
 * - Rate limiting to avoid being blocked
 * - Retry logic for failed requests
 * - Response caching to avoid duplicate fetches
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// BATCH FETCHER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var BATCH_FETCHER_CONFIG = {
  // Batch settings
  BATCH_SIZE: 5,                     // URLs per batch (avoid rate limits)
  MAX_RETRIES: 2,                    // Retry failed fetches
  
  // Timeouts
  FETCH_TIMEOUT: 30000,              // 30 seconds per URL
  BATCH_DELAY: 2000,                 // 2 seconds between URLs
  RETRY_DELAY: 3000,                 // 3 seconds before retry
  
  // Request headers
  USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
  ],
  
  // PHP Gateway (fallback)
  GATEWAY_URL: 'https://serpifai.com/serpifai_php/api_gateway.php',
  LICENSE_KEY: 'SERP-FAI-TEST-KEY-123456',
  
  // Cache settings
  CACHE_KEY_PREFIX: 'BATCH_FETCH_',
  CACHE_EXPIRY_HOURS: 24
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: BATCH PAGE FETCHER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * BatchPageFetcher - Fetches multiple pages with rate limiting
 */
class BatchPageFetcher {
  
  constructor() {
    this.cache = CacheService.getScriptCache();
    this.stats = {
      totalRequests: 0,
      successCount: 0,
      failCount: 0,
      cacheHits: 0,
      gatewayFallbacks: 0
    };
  }
  
  /**
   * Fetch homepage + blog pages for a domain
   * @param {string} domain - Domain to fetch
   * @param {Array} blogUrls - Array of blog page URLs
   * @returns {Object} Fetch results with HTML content
   */
  fetchDomainPages(domain, blogUrls) {
    console.log(`🌐 BatchFetcher: Fetching pages for ${domain}`);
    const startTime = Date.now();
    
    // Normalize domain
    domain = this._normalizeDomain(domain);
    const homepageUrl = 'https://' + domain;
    
    // Build URL list: homepage + blog pages
    const urlsToFetch = [
      { url: homepageUrl, type: 'homepage' }
    ];
    
    for (const blogUrl of blogUrls.slice(0, 15)) {
      const url = typeof blogUrl === 'string' ? blogUrl : blogUrl.url;
      urlsToFetch.push({ url: url, type: 'blog_post' });
    }
    
    console.log(`   📋 Total URLs to fetch: ${urlsToFetch.length}`);
    
    // Fetch in batches
    const results = [];
    for (let i = 0; i < urlsToFetch.length; i += BATCH_FETCHER_CONFIG.BATCH_SIZE) {
      const batch = urlsToFetch.slice(i, i + BATCH_FETCHER_CONFIG.BATCH_SIZE);
      const batchResults = this._fetchBatch(batch, domain);
      results.push(...batchResults);
      
      // Delay between batches (except last batch)
      if (i + BATCH_FETCHER_CONFIG.BATCH_SIZE < urlsToFetch.length) {
        Utilities.sleep(BATCH_FETCHER_CONFIG.BATCH_DELAY);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ BatchFetcher: Completed ${results.length} pages in ${duration}ms`);
    console.log(`   📊 Stats: ${this.stats.successCount} success, ${this.stats.failCount} fail, ${this.stats.cacheHits} cache hits`);
    
    return {
      domain: domain,
      fetchedAt: new Date().toISOString(),
      processingTimeMs: duration,
      pages: results,
      pageCount: results.length,
      successCount: results.filter(r => r.success).length,
      failCount: results.filter(r => !r.success).length,
      stats: { ...this.stats }
    };
  }
  
  /**
   * Fetch a batch of URLs
   * @param {Array} batch - Array of {url, type} objects
   * @param {string} domain - Domain name
   * @returns {Array} Array of fetch results
   */
  _fetchBatch(batch, domain) {
    const results = [];
    
    for (const item of batch) {
      this.stats.totalRequests++;
      
      // Check cache first
      const cached = this._getFromCache(item.url);
      if (cached) {
        this.stats.cacheHits++;
        results.push(cached);
        continue;
      }
      
      // Fetch with retry logic
      let result = this._fetchWithRetry(item.url, item.type, domain);
      results.push(result);
      
      // Update stats
      if (result.success) {
        this.stats.successCount++;
        this._saveToCache(item.url, result);
      } else {
        this.stats.failCount++;
      }
      
      // Small delay between requests in same batch
      Utilities.sleep(500);
    }
    
    return results;
  }
  
  /**
   * Fetch URL with retry logic
   */
  _fetchWithRetry(url, type, domain) {
    let lastError = null;
    
    for (let attempt = 0; attempt <= BATCH_FETCHER_CONFIG.MAX_RETRIES; attempt++) {
      try {
        // First attempt: direct fetch
        if (attempt === 0) {
          const result = this._directFetch(url, type, domain);
          if (result.success) return result;
          lastError = result.error;
        }
        
        // Subsequent attempts: try PHP gateway
        if (attempt > 0) {
          Utilities.sleep(BATCH_FETCHER_CONFIG.RETRY_DELAY);
          const result = this._gatewayFetch(url, type, domain);
          if (result.success) {
            this.stats.gatewayFallbacks++;
            return result;
          }
          lastError = result.error;
        }
        
      } catch (e) {
        lastError = e.message;
      }
    }
    
    return {
      success: false,
      url: url,
      type: type,
      domain: domain,
      error: lastError,
      html: null,
      statusCode: 0,
      fetchedAt: new Date().toISOString()
    };
  }
  
  /**
   * Direct fetch using UrlFetchApp
   */
  _directFetch(url, type, domain) {
    try {
      const userAgent = BATCH_FETCHER_CONFIG.USER_AGENTS[
        Math.floor(Math.random() * BATCH_FETCHER_CONFIG.USER_AGENTS.length)
      ];
      
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true,
        timeout: BATCH_FETCHER_CONFIG.FETCH_TIMEOUT,
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        }
      });
      
      const statusCode = response.getResponseCode();
      
      if (statusCode === 200) {
        const html = response.getContentText();
        return {
          success: true,
          url: url,
          type: type,
          domain: domain,
          html: html,
          htmlLength: html.length,
          statusCode: statusCode,
          fetchMethod: 'direct',
          fetchedAt: new Date().toISOString()
        };
      }
      
      return {
        success: false,
        url: url,
        type: type,
        domain: domain,
        error: `HTTP ${statusCode}`,
        html: null,
        statusCode: statusCode,
        fetchedAt: new Date().toISOString()
      };
      
    } catch (e) {
      return {
        success: false,
        url: url,
        type: type,
        domain: domain,
        error: e.message,
        html: null,
        statusCode: 0,
        fetchedAt: new Date().toISOString()
      };
    }
  }
  
  /**
   * Fetch via PHP gateway (fallback)
   */
  _gatewayFetch(url, type, domain) {
    try {
      const payload = {
        action: 'fetch_url',
        url: url,
        license_key: BATCH_FETCHER_CONFIG.LICENSE_KEY
      };
      
      const response = UrlFetchApp.fetch(BATCH_FETCHER_CONFIG.GATEWAY_URL, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
        timeout: BATCH_FETCHER_CONFIG.FETCH_TIMEOUT
      });
      
      const statusCode = response.getResponseCode();
      
      if (statusCode === 200) {
        const json = JSON.parse(response.getContentText());
        
        if (json.success && json.html) {
          return {
            success: true,
            url: url,
            type: type,
            domain: domain,
            html: json.html,
            htmlLength: json.html.length,
            statusCode: 200,
            fetchMethod: 'gateway',
            fetchedAt: new Date().toISOString()
          };
        }
        
        return {
          success: false,
          url: url,
          type: type,
          domain: domain,
          error: json.error || 'Gateway returned no HTML',
          html: null,
          statusCode: statusCode,
          fetchedAt: new Date().toISOString()
        };
      }
      
      return {
        success: false,
        url: url,
        type: type,
        domain: domain,
        error: `Gateway HTTP ${statusCode}`,
        html: null,
        statusCode: statusCode,
        fetchedAt: new Date().toISOString()
      };
      
    } catch (e) {
      return {
        success: false,
        url: url,
        type: type,
        domain: domain,
        error: `Gateway error: ${e.message}`,
        html: null,
        statusCode: 0,
        fetchedAt: new Date().toISOString()
      };
    }
  }
  
  /**
   * Get cached result
   */
  _getFromCache(url) {
    try {
      const cacheKey = BATCH_FETCHER_CONFIG.CACHE_KEY_PREFIX + Utilities.base64Encode(url).slice(0, 200);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // Cache miss or error
    }
    return null;
  }
  
  /**
   * Save result to cache
   */
  _saveToCache(url, result) {
    try {
      const cacheKey = BATCH_FETCHER_CONFIG.CACHE_KEY_PREFIX + Utilities.base64Encode(url).slice(0, 200);
      // Don't cache HTML in script cache (too large), just cache metadata
      const cacheData = {
        success: result.success,
        url: result.url,
        type: result.type,
        domain: result.domain,
        htmlLength: result.htmlLength,
        statusCode: result.statusCode,
        fetchMethod: result.fetchMethod,
        fetchedAt: result.fetchedAt,
        cachedAt: new Date().toISOString()
      };
      this.cache.put(cacheKey, JSON.stringify(cacheData), BATCH_FETCHER_CONFIG.CACHE_EXPIRY_HOURS * 3600);
    } catch (e) {
      // Cache error, ignore
    }
  }
  
  /**
   * Normalize domain name
   */
  _normalizeDomain(domain) {
    return domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
  }
  
  /**
   * Clear fetch stats
   */
  clearStats() {
    this.stats = {
      totalRequests: 0,
      successCount: 0,
      failCount: 0,
      cacheHits: 0,
      gatewayFallbacks: 0
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get batch page fetcher instance
 * @returns {BatchPageFetcher}
 */
function getBatchPageFetcher() {
  return new BatchPageFetcher();
}

/**
 * Fetch all pages for a domain (homepage + blog pages)
 * @param {string} domain - Domain to fetch
 * @param {Array} blogUrls - Array of blog page URLs
 * @returns {Object} Fetch results
 */
function fetchDomainPages(domain, blogUrls) {
  const fetcher = getBatchPageFetcher();
  return fetcher.fetchDomainPages(domain, blogUrls);
}

/**
 * Fetch pages for multiple domains
 * @param {Object} domainBlogMap - Map of domain to blog URLs
 * @returns {Object} Map of domain to fetch results
 */
function fetchMultipleDomains(domainBlogMap) {
  const fetcher = getBatchPageFetcher();
  const results = {};
  
  for (const [domain, blogUrls] of Object.entries(domainBlogMap)) {
    try {
      results[domain] = fetcher.fetchDomainPages(domain, blogUrls);
      // Clear stats between domains
      fetcher.clearStats();
      // Delay between domains
      Utilities.sleep(3000);
    } catch (e) {
      results[domain] = {
        success: false,
        domain: domain,
        error: e.message,
        pages: [],
        pageCount: 0
      };
    }
  }
  
  return results;
}

/**
 * Integrated function: Discover + Fetch pages for a domain
 * @param {string} domain - Domain to process
 * @returns {Object} Complete fetch results with HTML
 */
function discoverAndFetchPages(domain) {
  console.log(`🚀 Starting full discovery + fetch for: ${domain}`);
  
  // Step 1: Discover blog pages
  const discoveryResult = discoverBlogPages(domain);
  
  if (!discoveryResult.success) {
    return {
      success: false,
      domain: domain,
      error: 'Blog discovery failed',
      discoveryResult: discoveryResult,
      fetchResult: null
    };
  }
  
  // Step 2: Fetch homepage + discovered blog pages
  const blogUrls = discoveryResult.blogPages.map(p => p.url);
  const fetchResult = fetchDomainPages(domain, blogUrls);
  
  return {
    success: true,
    domain: domain,
    discoveryResult: discoveryResult,
    fetchResult: fetchResult,
    summary: {
      blogPagesDiscovered: discoveryResult.blogPageCount,
      pagesFetched: fetchResult.pageCount,
      successfulFetches: fetchResult.successCount,
      failedFetches: fetchResult.failCount
    }
  };
}

/**
 * Test batch fetcher with a sample domain
 */
function testBatchFetcher() {
  const testDomain = 'serpifai.com';
  console.log(`🧪 Testing batch fetcher for: ${testDomain}`);
  
  // First discover blog pages
  const discoveryResult = discoverBlogPages(testDomain);
  console.log('Discovery Result:', JSON.stringify(discoveryResult, null, 2));
  
  // Then fetch pages
  if (discoveryResult.success && discoveryResult.blogPageCount > 0) {
    const blogUrls = discoveryResult.blogPages.slice(0, 3).map(p => p.url);
    const fetchResult = fetchDomainPages(testDomain, blogUrls);
    console.log('Fetch Result (summary):', {
      domain: fetchResult.domain,
      pageCount: fetchResult.pageCount,
      successCount: fetchResult.successCount,
      failCount: fetchResult.failCount,
      stats: fetchResult.stats
    });
    return fetchResult;
  }
  
  return discoveryResult;
}
