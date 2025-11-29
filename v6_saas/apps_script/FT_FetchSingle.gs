/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_FetchSingle.gs - ELITE SINGLE URL FETCHER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v6 Elite - Top 0.1% Single URL Fetch
 * 
 * ENHANCEMENTS FROM ORIGINAL:
 * ✓ FIXED: validateHttpsCertificates now TRUE (was FALSE - security risk)
 * ✓ FIXED: User-Agent rotation (was hardcoded "SERPIFAI Bot/2.1")
 * ✓ robots.txt compliance before fetch (Google TOS)
 * ✓ Circuit breaker integration
 * ✓ Exponential backoff with jitter
 * ✓ Rate limit detection and handling
 * ✓ Domain validation (SSRF prevention)
 * ✓ Enhanced error diagnostics
 * ✓ ETag and Last-Modified caching support
 * ✓ Crawl-delay respect
 * 
 * @module FetcherSingle
 * @version 6.0.0-elite
 * @compliance Google TOS, RFC 9309, OWASP
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Fetch a single URL with elite compliance and security
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @return {object} Fetch result with enhanced metadata
 */
function FT_fetchSingleUrl(url, options) {
  var startTime = new Date().getTime();
  options = options || {};
  
  try {
    // VALIDATION: Check URL format
    if (!url || typeof url !== 'string') {
      return {
        ok: false,
        error: 'Invalid URL parameter',
        url: url,
        executionTime: new Date().getTime() - startTime
      };
    }
    
    // SECURITY: Validate URL and prevent SSRF
    var validation = FT_validateUrl(url, options);
    if (!validation.valid) {
      return {
        ok: false,
        error: validation.reason,
        url: url,
        securityRisk: validation.risk,
        executionTime: new Date().getTime() - startTime
      };
    }
    
    // Parse URL for domain extraction
    var urlParts = FT_parseUrl(url);
    if (!urlParts) {
      return {
        ok: false,
        error: 'Failed to parse URL',
        url: url,
        executionTime: new Date().getTime() - startTime
      };
    }
    
    var domain = urlParts.host;
    
    // COMPLIANCE: Check circuit breaker
    var circuitCheck = FT_checkCircuit(domain);
    if (!circuitCheck.ok) {
      return {
        ok: false,
        error: 'Circuit breaker open',
        reason: circuitCheck.reason,
        domain: domain,
        cooldownRemaining: circuitCheck.cooldownRemaining,
        executionTime: new Date().getTime() - startTime
      };
    }
    
    // COMPLIANCE: Check robots.txt (unless explicitly disabled)
    if (options.respectRobotsTxt !== false && FT_getConfig('compliance.respectRobotsTxt', true)) {
      var userAgent = options.userAgent || FT_getRandomUserAgent(options.userAgentType || 'random');
      var robotsCheck = FT_checkRobotsTxt(url, userAgent);
      
      if (!robotsCheck.allowed) {
        // Record as soft failure (don't break circuit)
        return {
          ok: false,
          error: 'Blocked by robots.txt',
          reason: robotsCheck.reason,
          url: url,
          domain: domain,
          compliance: 'robots.txt',
          executionTime: new Date().getTime() - startTime
        };
      }
      
      // COMPLIANCE: Respect crawl-delay
      if (robotsCheck.crawlDelay > 0 && FT_getConfig('rateLimits.respectCrawlDelay', true)) {
        var lastFetchKey = 'lastfetch_' + domain;
        var cache = CacheService.getScriptCache();
        var lastFetch = cache.get(lastFetchKey);
        
        if (lastFetch) {
          var timeSince = new Date().getTime() - parseInt(lastFetch, 10);
          var requiredDelay = robotsCheck.crawlDelay * 1000;
          
          if (timeSince < requiredDelay) {
            var waitTime = requiredDelay - timeSince;
            
            // If wait is reasonable, sleep; otherwise return error
            if (waitTime < 10000) { // Max 10s wait
              Utilities.sleep(waitTime);
            } else {
              return {
                ok: false,
                error: 'Crawl-delay not satisfied',
                domain: domain,
                requiredDelay: robotsCheck.crawlDelay,
                waitRequired: Math.ceil(waitTime / 1000),
                executionTime: new Date().getTime() - startTime
              };
            }
          }
        }
        
        // Update last fetch time
        cache.put(lastFetchKey, String(new Date().getTime()), 600);
      }
    }
    
    // PERFORMANCE: Check cache (if enabled)
    if (options.useCache !== false && FT_getConfig('cache.enabled', true)) {
      var cacheKey = 'url_' + Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, url)
        .map(function(byte) { return (byte + 256).toString(16).slice(-2); }).join('');
      
      var cache = CacheService.getScriptCache();
      var cached = cache.get(cacheKey);
      
      if (cached) {
        var cachedData = JSON.parse(cached);
        cachedData.cached = true;
        cachedData.executionTime = new Date().getTime() - startTime;
        return cachedData;
      }
    }
    
    // FETCH: Execute with retry logic
    var maxRetries = options.maxRetries || FT_getConfig('circuitBreaker.maxRetries', 3);
    var retryDelay = options.retryDelay || FT_getConfig('circuitBreaker.retryDelayMs', 1000);
    var retryMultiplier = FT_getConfig('circuitBreaker.retryMultiplier', 2);
    
    var lastError = null;
    var attempt = 0;
    
    while (attempt <= maxRetries) {
      attempt++;
      
      try {
        var result = FT_executeFetch(url, urlParts, domain, options, attempt);
        
        // Success!
        if (result.ok) {
          FT_recordSuccess(domain);
          
          // Cache if enabled
          if (options.useCache !== false && FT_getConfig('cache.enabled', true)) {
            var ttl = FT_getConfig('cache.ttlSeconds', 3600);
            cache.put(cacheKey, JSON.stringify(result), ttl);
          }
          
          result.executionTime = new Date().getTime() - startTime;
          result.attempts = attempt;
          return result;
        }
        
        // Check if rate limited
        var rateLimitCheck = FT_isRateLimited(result.status, result.error, result.headers);
        if (rateLimitCheck.isRateLimited) {
          // Wait and retry
          if (attempt <= maxRetries) {
            var waitTime = rateLimitCheck.retryAfter * 1000;
            if (waitTime < 30000) { // Max 30s wait per retry
              Utilities.sleep(waitTime);
              continue;
            }
          }
          
          // Record failure
          FT_recordFailure(domain, result.status, 'Rate limited: ' + rateLimitCheck.reason);
          result.executionTime = new Date().getTime() - startTime;
          result.attempts = attempt;
          return result;
        }
        
        // Non-rate-limit error
        lastError = result;
        
        // If server error (5xx), retry with backoff
        if (result.status >= 500 && result.status < 600 && attempt <= maxRetries) {
          // Exponential backoff with jitter
          var backoff = retryDelay * Math.pow(retryMultiplier, attempt - 1);
          var jitter = Math.random() * 0.3 * backoff; // 30% jitter
          var wait = Math.min(backoff + jitter, 10000); // Max 10s per retry
          
          Utilities.sleep(wait);
          continue;
        }
        
        // Client error (4xx) or other = don't retry
        break;
        
      } catch (fetchError) {
        lastError = {
          ok: false,
          error: String(fetchError),
          url: url,
          domain: domain,
          attempt: attempt
        };
        
        // Retry on network errors
        if (attempt <= maxRetries) {
          var backoff = retryDelay * Math.pow(retryMultiplier, attempt - 1);
          var jitter = Math.random() * 0.3 * backoff;
          Utilities.sleep(Math.min(backoff + jitter, 10000));
          continue;
        }
        
        break;
      }
    }
    
    // All retries failed
    if (lastError) {
      FT_recordFailure(domain, lastError.status || 0, lastError.error || 'Unknown error');
      lastError.executionTime = new Date().getTime() - startTime;
      lastError.attempts = attempt;
      return lastError;
    }
    
    // Shouldn't reach here
    return {
      ok: false,
      error: 'Unexpected fetch failure',
      url: url,
      domain: domain,
      executionTime: new Date().getTime() - startTime
    };
    
  } catch (e) {
    return {
      ok: false,
      error: String(e),
      errorStack: e.stack || '',
      url: url,
      executionTime: new Date().getTime() - startTime
    };
  }
}

/**
 * Execute actual HTTP fetch
 * @param {string} url - URL to fetch
 * @param {object} urlParts - Parsed URL parts
 * @param {string} domain - Domain name
 * @param {object} options - Fetch options
 * @param {number} attempt - Attempt number
 * @return {object} Fetch result
 */
function FT_executeFetch(url, urlParts, domain, options, attempt) {
  try {
    // Build fetch options
    var userAgent = options.userAgent || FT_getRandomUserAgent(options.userAgentType || 'random');
    var timeout = (options.timeout || FT_getConfig('timeouts.fetchTimeoutSeconds', 30)) * 1000;
    
    var fetchOptions = {
      method: options.method || 'GET',
      muteHttpExceptions: true,
      followRedirects: options.followRedirects !== false,
      validateHttpsCertificates: true, // FIXED: was false in original (SECURITY RISK)
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };
    
    // Add custom headers
    if (options.headers) {
      for (var key in options.headers) {
        fetchOptions.headers[key] = options.headers[key];
      }
    }
    
    // Add ETag/Last-Modified for conditional requests
    if (options.etag) {
      fetchOptions.headers['If-None-Match'] = options.etag;
    }
    if (options.lastModified) {
      fetchOptions.headers['If-Modified-Since'] = options.lastModified;
    }
    
    // Execute fetch
    var response = UrlFetchApp.fetch(url, fetchOptions);
    
    var statusCode = response.getResponseCode();
    var headers = response.getAllHeaders();
    var contentType = headers['Content-Type'] || headers['content-type'] || '';
    
    // Handle 304 Not Modified
    if (statusCode === 304) {
      return {
        ok: true,
        status: 304,
        notModified: true,
        url: url,
        domain: domain,
        headers: headers
      };
    }
    
    // Success status codes
    if (statusCode >= 200 && statusCode < 300) {
      var html = response.getContentText();
      
      return {
        ok: true,
        status: statusCode,
        html: html,
        headers: headers,
        url: url,
        finalUrl: response.getResponseUrl ? response.getResponseUrl() : url,
        contentType: contentType,
        contentLength: html.length,
        domain: domain,
        userAgent: userAgent,
        attempt: attempt,
        etag: headers['ETag'] || headers['etag'] || null,
        lastModified: headers['Last-Modified'] || headers['last-modified'] || null
      };
    }
    
    // Error status codes
    return {
      ok: false,
      status: statusCode,
      error: 'HTTP ' + statusCode + ' response',
      url: url,
      domain: domain,
      headers: headers,
      userAgent: userAgent,
      attempt: attempt
    };
    
  } catch (e) {
    return {
      ok: false,
      error: String(e),
      errorMessage: e.message || '',
      url: url,
      domain: domain,
      attempt: attempt
    };
  }
}

/**
 * Validate URL for security (SSRF prevention)
 * @param {string} url - URL to validate
 * @param {object} options - Validation options
 * @return {object} { valid: boolean, reason: string, risk: string }
 */
function FT_validateUrl(url, options) {
  try {
    options = options || {};
    
    // Check protocol
    if (!url.match(/^https?:\/\//i)) {
      return {
        valid: false,
        reason: 'Only HTTP and HTTPS protocols allowed',
        risk: 'protocol_violation'
      };
    }
    
    // Force HTTPS if configured
    if (FT_getConfig('security.allowHttp', false) === false && url.match(/^http:\/\//i)) {
      return {
        valid: false,
        reason: 'HTTPS required (HTTP not allowed)',
        risk: 'insecure_protocol'
      };
    }
    
    // Parse URL
    var urlParts = FT_parseUrl(url);
    if (!urlParts) {
      return {
        valid: false,
        reason: 'Malformed URL',
        risk: 'parse_error'
      };
    }
    
    // SECURITY: Check blacklisted domains/IPs
    var blacklist = FT_getConfig('security.blacklistedDomains', []);
    var host = urlParts.host.toLowerCase();
    
    for (var i = 0; i < blacklist.length; i++) {
      var blocked = blacklist[i].toLowerCase();
      
      if (host === blocked || host.indexOf(blocked) >= 0) {
        return {
          valid: false,
          reason: 'Domain is blacklisted: ' + blocked,
          risk: 'ssrf_prevention'
        };
      }
    }
    
    // SECURITY: Check for private/local IPs (SSRF prevention)
    if (FT_getConfig('security.preventSSRF', true)) {
      // Check for localhost variations
      if (host.match(/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|\[::ffff:127\.0\.0\.1\])$/i)) {
        return {
          valid: false,
          reason: 'Localhost not allowed (SSRF prevention)',
          risk: 'ssrf_localhost'
        };
      }
      
      // Check for private IP ranges (basic check)
      if (host.match(/^10\.|^172\.(1[6-9]|2[0-9]|3[01])\.|^192\.168\./)) {
        return {
          valid: false,
          reason: 'Private IP range not allowed (SSRF prevention)',
          risk: 'ssrf_private_ip'
        };
      }
      
      // Check for AWS metadata endpoint
      if (host === '169.254.169.254') {
        return {
          valid: false,
          reason: 'Cloud metadata endpoint not allowed (SSRF prevention)',
          risk: 'ssrf_metadata'
        };
      }
    }
    
    // SECURITY: Check whitelist if configured
    var whitelist = FT_getConfig('security.domainWhitelist', []);
    if (whitelist.length > 0 && !options.skipWhitelist) {
      var allowed = false;
      
      for (var j = 0; j < whitelist.length; j++) {
        var pattern = whitelist[j].toLowerCase();
        if (host === pattern || host.indexOf(pattern) >= 0) {
          allowed = true;
          break;
        }
      }
      
      if (!allowed) {
        return {
          valid: false,
          reason: 'Domain not in whitelist',
          risk: 'whitelist_violation'
        };
      }
    }
    
    // Valid!
    return {
      valid: true,
      reason: 'URL passed validation',
      risk: 'none'
    };
    
  } catch (e) {
    return {
      valid: false,
      reason: 'Validation error: ' + e,
      risk: 'validation_error'
    };
  }
}

/**
 * Legacy function name for backwards compatibility
 */
function FET_fetchSingleUrl(url, options) {
  return FT_fetchSingleUrl(url, options);
}
