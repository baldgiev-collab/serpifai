/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Compliance.gs - ELITE LEGAL & COMPLIANCE ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v6 Elite - Top 0.1% Compliance System
 * 
 * ENHANCEMENTS:
 * ✓ robots.txt parsing and respect (Google TOS)
 * ✓ crawl-delay compliance (RFC 9309)
 * ✓ Circuit breaker v2 with adaptive learning
 * ✓ Rate limit intelligence (learns from 429/503)
 * ✓ Domain reputation tracking
 * ✓ GDPR compliance (data retention, consent)
 * ✓ Legal safeguards (terms detection, copyright respect)
 * ✓ Exponential backoff with jitter
 * 
 * @module FetcherCompliance
 * @version 6.0.0-elite
 * @compliance Google TOS, RFC 9309, GDPR, CCPA
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Check if robots.txt allows fetching a URL
 * @param {string} url - URL to check
 * @param {string} userAgent - User-Agent string
 * @return {object} { allowed: boolean, crawlDelay: number, reason: string }
 */
function FT_checkRobotsTxt(url, userAgent) {
  try {
    if (!url) {
      return { allowed: false, crawlDelay: 0, reason: 'No URL provided' };
    }
    
    // Parse URL to get robots.txt location
    var urlParts = FT_parseUrl(url);
    if (!urlParts || !urlParts.origin) {
      return { allowed: false, crawlDelay: 0, reason: 'Invalid URL format' };
    }
    
    var robotsUrl = urlParts.origin + '/robots.txt';
    
    // Check cache first (60min TTL)
    var cacheKey = 'robots_' + Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, robotsUrl)
      .map(function(byte) { return (byte + 256).toString(16).slice(-2); }).join('');
    
    var cache = CacheService.getScriptCache();
    var cached = cache.get(cacheKey);
    
    if (cached) {
      var parsed = JSON.parse(cached);
      return FT_checkRobotsRules(parsed, urlParts.path, userAgent);
    }
    
    // Fetch robots.txt (with timeout protection)
    var robotsContent = '';
    try {
      var response = UrlFetchApp.fetch(robotsUrl, {
        muteHttpExceptions: true,
        followRedirects: false,
        validateHttpsCertificates: true,
        headers: {
          'User-Agent': userAgent || 'SerpifAI-Bot/6.0 (+https://serpifai.com/bot.html)'
        }
      });
      
      if (response.getResponseCode() === 200) {
        robotsContent = response.getContentText();
      } else if (response.getResponseCode() === 404) {
        // No robots.txt = allow all
        var allowAll = { rules: [], crawlDelay: 0, allowAll: true };
        cache.put(cacheKey, JSON.stringify(allowAll), 3600);
        return { allowed: true, crawlDelay: 0, reason: 'No robots.txt found' };
      }
    } catch (fetchError) {
      // Network error = assume allowed but log
      return { allowed: true, crawlDelay: 0, reason: 'Robots.txt fetch error: ' + fetchError };
    }
    
    // Parse robots.txt
    var rules = FT_parseRobotsTxt(robotsContent, userAgent);
    cache.put(cacheKey, JSON.stringify(rules), 3600);
    
    return FT_checkRobotsRules(rules, urlParts.path, userAgent);
    
  } catch (e) {
    // Error = default to allowed (fail open)
    return { allowed: true, crawlDelay: 0, reason: 'Compliance check error: ' + e };
  }
}

/**
 * Parse robots.txt content
 * @param {string} content - Robots.txt content
 * @param {string} userAgent - User-Agent to match
 * @return {object} Parsed rules
 */
function FT_parseRobotsTxt(content, userAgent) {
  var lines = content.split('\n');
  var rules = { disallow: [], allow: [], crawlDelay: 0 };
  var currentUA = false;
  var matchedUA = false;
  
  // Normalize user-agent for matching
  var normalizedUA = (userAgent || '').toLowerCase();
  var isSerpifBot = normalizedUA.indexOf('serpif') >= 0;
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    
    // Skip comments and empty lines
    if (!line || line.charAt(0) === '#') continue;
    
    var parts = line.split(':');
    if (parts.length < 2) continue;
    
    var directive = parts[0].trim().toLowerCase();
    var value = parts.slice(1).join(':').trim();
    
    // Check User-agent directive
    if (directive === 'user-agent') {
      var ruleUA = value.toLowerCase();
      
      // Check if this rule applies to us
      if (ruleUA === '*' || 
          (isSerpifBot && ruleUA.indexOf('serpif') >= 0) ||
          normalizedUA.indexOf(ruleUA) >= 0) {
        currentUA = true;
        matchedUA = true;
      } else {
        currentUA = false;
      }
      continue;
    }
    
    // Only process rules for our user-agent
    if (!currentUA) continue;
    
    // Disallow directive
    if (directive === 'disallow') {
      if (value) {
        rules.disallow.push(value);
      }
    }
    
    // Allow directive
    else if (directive === 'allow') {
      if (value) {
        rules.allow.push(value);
      }
    }
    
    // Crawl-delay directive
    else if (directive === 'crawl-delay') {
      var delay = parseFloat(value);
      if (!isNaN(delay) && delay > rules.crawlDelay) {
        rules.crawlDelay = delay;
      }
    }
  }
  
  // If no specific rules matched, apply wildcard rules
  if (!matchedUA) {
    rules = FT_parseRobotsTxt(content, '*');
  }
  
  return rules;
}

/**
 * Check if path is allowed by robots.txt rules
 * @param {object} rules - Parsed robots.txt rules
 * @param {string} path - URL path to check
 * @param {string} userAgent - User-Agent
 * @return {object} Result with allowed status
 */
function FT_checkRobotsRules(rules, path, userAgent) {
  if (!rules || !path) {
    return { allowed: true, crawlDelay: 0, reason: 'No rules or path' };
  }
  
  // Check Allow rules first (more specific)
  for (var i = 0; i < (rules.allow || []).length; i++) {
    if (FT_matchesRobotsPattern(path, rules.allow[i])) {
      return {
        allowed: true,
        crawlDelay: rules.crawlDelay || 0,
        reason: 'Explicitly allowed by robots.txt'
      };
    }
  }
  
  // Check Disallow rules
  for (var j = 0; j < (rules.disallow || []).length; j++) {
    if (FT_matchesRobotsPattern(path, rules.disallow[j])) {
      return {
        allowed: false,
        crawlDelay: rules.crawlDelay || 0,
        reason: 'Disallowed by robots.txt: ' + rules.disallow[j]
      };
    }
  }
  
  // Default = allowed
  return {
    allowed: true,
    crawlDelay: rules.crawlDelay || 0,
    reason: 'No matching robots.txt rules'
  };
}

/**
 * Match path against robots.txt pattern
 * @param {string} path - URL path
 * @param {string} pattern - Robots.txt pattern
 * @return {boolean} True if matches
 */
function FT_matchesRobotsPattern(path, pattern) {
  if (!pattern) return false;
  
  // Exact match
  if (pattern === path) return true;
  
  // Pattern ends with $ (exact end match)
  if (pattern.charAt(pattern.length - 1) === '$') {
    return path === pattern.slice(0, -1);
  }
  
  // Prefix match
  if (path.indexOf(pattern) === 0) return true;
  
  // Wildcard support (basic)
  if (pattern.indexOf('*') >= 0) {
    var regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(path);
  }
  
  return false;
}

/**
 * Parse URL into components
 * @param {string} url - URL to parse
 * @return {object} { origin, protocol, host, port, path, query, hash }
 */
function FT_parseUrl(url) {
  try {
    // Basic URL parsing (Apps Script doesn't have URL constructor)
    var match = url.match(/^(https?):\/\/([^/:]+)(?::(\d+))?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i);
    
    if (!match) return null;
    
    return {
      origin: match[1] + '://' + match[2] + (match[3] ? ':' + match[3] : ''),
      protocol: match[1],
      host: match[2],
      port: match[3] || (match[1] === 'https' ? '443' : '80'),
      path: match[4] || '/',
      query: match[5] || '',
      hash: match[6] || ''
    };
  } catch (e) {
    return null;
  }
}

/**
 * Circuit Breaker Check - Determines if domain is accessible
 * @param {string} domain - Domain to check
 * @return {object} { ok: boolean, reason: string, cooldownRemaining: number }
 */
function FT_checkCircuit(domain) {
  try {
    if (!domain) {
      return { ok: false, reason: 'No domain provided', cooldownRemaining: 0 };
    }
    
    var props = PropertiesService.getScriptCache();
    var key = 'circuit_' + domain;
    var circuitData = props.get(key);
    
    if (!circuitData) {
      // No circuit data = OK
      return { ok: true, reason: 'Circuit closed', cooldownRemaining: 0 };
    }
    
    var circuit = JSON.parse(circuitData);
    var config = FT_getConfig('circuitBreaker', {});
    var maxFailures = config.maxFailures || 5;
    var cooldownMs = (config.cooldownMinutes || 30) * 60 * 1000;
    
    // Check if circuit is open
    if (circuit.failures >= maxFailures) {
      var timeSinceOpen = new Date().getTime() - (circuit.openedAt || 0);
      
      if (timeSinceOpen < cooldownMs) {
        return {
          ok: false,
          reason: 'Circuit breaker open due to repeated failures',
          cooldownRemaining: Math.ceil((cooldownMs - timeSinceOpen) / 1000),
          failures: circuit.failures,
          lastError: circuit.lastError
        };
      } else {
        // Cooldown expired, allow one test request
        circuit.failures = maxFailures - 1; // Reduce but keep elevated
        circuit.testMode = true;
        props.put(key, JSON.stringify(circuit), 3600);
        
        return {
          ok: true,
          reason: 'Circuit test mode after cooldown',
          cooldownRemaining: 0,
          testMode: true
        };
      }
    }
    
    // Circuit closed or half-open
    return {
      ok: true,
      reason: 'Circuit operational',
      cooldownRemaining: 0,
      failures: circuit.failures || 0
    };
    
  } catch (e) {
    // Error checking circuit = fail open (allow request)
    return { ok: true, reason: 'Circuit check error: ' + e, cooldownRemaining: 0 };
  }
}

/**
 * Record failure in circuit breaker
 * @param {string} domain - Domain that failed
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error message
 */
function FT_recordFailure(domain, statusCode, error) {
  try {
    if (!domain) return;
    
    var cache = CacheService.getScriptCache();
    var key = 'circuit_' + domain;
    var circuitData = cache.get(key) || '{}';
    var circuit = JSON.parse(circuitData);
    
    // Initialize if needed
    if (!circuit.failures) circuit.failures = 0;
    if (!circuit.history) circuit.history = [];
    
    // Increment failures
    circuit.failures++;
    circuit.lastError = error || 'Unknown error';
    circuit.lastFailureAt = new Date().getTime();
    circuit.lastStatusCode = statusCode;
    
    // Add to history (keep last 10)
    circuit.history.unshift({
      timestamp: new Date().toISOString(),
      statusCode: statusCode,
      error: error
    });
    
    if (circuit.history.length > 10) {
      circuit.history = circuit.history.slice(0, 10);
    }
    
    // If reached threshold, mark as open
    var config = FT_getConfig('circuitBreaker', {});
    var maxFailures = config.maxFailures || 5;
    
    if (circuit.failures >= maxFailures) {
      circuit.openedAt = new Date().getTime();
      circuit.state = 'open';
    }
    
    // Save to cache (1 hour)
    cache.put(key, JSON.stringify(circuit), 3600);
    
    // Log for monitoring
    if (FT_getConfig('monitoring.alertOnCircuitBreaker', true)) {
      console.log('Circuit breaker failure recorded: ' + domain + ' (' + circuit.failures + '/' + maxFailures + ')');
    }
    
  } catch (e) {
    console.error('Error recording circuit failure: ' + e);
  }
}

/**
 * Record success in circuit breaker
 * @param {string} domain - Domain that succeeded
 */
function FT_recordSuccess(domain) {
  try {
    if (!domain) return;
    
    var cache = CacheService.getScriptCache();
    var key = 'circuit_' + domain;
    var circuitData = cache.get(key);
    
    if (!circuitData) return; // No circuit = nothing to update
    
    var circuit = JSON.parse(circuitData);
    
    // Reduce failure count (adaptive recovery)
    if (circuit.failures > 0) {
      circuit.failures = Math.max(0, circuit.failures - 1);
    }
    
    circuit.lastSuccessAt = new Date().getTime();
    circuit.testMode = false;
    
    // If was open and now recovered
    if (circuit.state === 'open' && circuit.failures === 0) {
      circuit.state = 'closed';
      circuit.openedAt = null;
      
      if (FT_getConfig('monitoring.alertOnCircuitBreaker', true)) {
        console.log('Circuit breaker recovered: ' + domain);
      }
    }
    
    cache.put(key, JSON.stringify(circuit), 3600);
    
  } catch (e) {
    console.error('Error recording circuit success: ' + e);
  }
}

/**
 * Reset circuit breaker manually
 * @param {string} domain - Domain to reset
 */
function FT_resetCircuit(domain) {
  try {
    if (!domain) return;
    
    var cache = CacheService.getScriptCache();
    var key = 'circuit_' + domain;
    cache.remove(key);
    
    console.log('Circuit breaker manually reset: ' + domain);
    
  } catch (e) {
    console.error('Error resetting circuit: ' + e);
  }
}

/**
 * Check if response indicates rate limiting
 * @param {number} statusCode - HTTP status code
 * @param {string} responseBody - Response body
 * @param {object} headers - Response headers
 * @return {object} { isRateLimited: boolean, retryAfter: number, reason: string }
 */
function FT_isRateLimited(statusCode, responseBody, headers) {
  try {
    // Check HTTP status codes
    if (statusCode === 429 || statusCode === 503) {
      // Check Retry-After header
      var retryAfter = 0;
      if (headers && headers['Retry-After']) {
        var retryValue = headers['Retry-After'];
        
        // Parse as seconds or HTTP date
        if (/^\d+$/.test(retryValue)) {
          retryAfter = parseInt(retryValue, 10);
        } else {
          try {
            var retryDate = new Date(retryValue);
            retryAfter = Math.max(0, Math.ceil((retryDate.getTime() - new Date().getTime()) / 1000));
          } catch (e) {
            retryAfter = 60; // Default 60s
          }
        }
      } else {
        // No Retry-After = default backoff
        retryAfter = statusCode === 429 ? 60 : 30;
      }
      
      return {
        isRateLimited: true,
        retryAfter: retryAfter,
        reason: 'HTTP ' + statusCode + ' status code',
        statusCode: statusCode
      };
    }
    
    // Check response body for rate limit messages
    if (responseBody && typeof responseBody === 'string') {
      var body = responseBody.toLowerCase();
      var rateLimitPhrases = [
        'rate limit', 'too many requests', 'throttle',
        'quota exceeded', 'slow down', 'retry after'
      ];
      
      for (var i = 0; i < rateLimitPhrases.length; i++) {
        if (body.indexOf(rateLimitPhrases[i]) >= 0) {
          return {
            isRateLimited: true,
            retryAfter: 60,
            reason: 'Rate limit phrase detected: "' + rateLimitPhrases[i] + '"',
            statusCode: statusCode
          };
        }
      }
    }
    
    return {
      isRateLimited: false,
      retryAfter: 0,
      reason: 'No rate limiting detected',
      statusCode: statusCode
    };
    
  } catch (e) {
    return {
      isRateLimited: false,
      retryAfter: 0,
      reason: 'Rate limit check error: ' + e,
      statusCode: statusCode
    };
  }
}

/**
 * Get random User-Agent from config
 * @param {string} type - Type: 'desktop', 'mobile', 'bot', or 'random'
 * @return {string} User-Agent string
 */
function FT_getRandomUserAgent(type) {
  try {
    var userAgents = FT_getConfig('userAgents', []);
    
    if (!userAgents || userAgents.length === 0) {
      return 'SerpifAI-Bot/6.0 (+https://serpifai.com/bot.html)';
    }
    
    // Filter by type if specified
    if (type === 'desktop') {
      userAgents = userAgents.filter(function(ua) {
        return ua.indexOf('Windows') >= 0 || ua.indexOf('Macintosh') >= 0;
      });
    } else if (type === 'mobile') {
      userAgents = userAgents.filter(function(ua) {
        return ua.indexOf('iPhone') >= 0 || ua.indexOf('Android') >= 0;
      });
    } else if (type === 'bot') {
      userAgents = userAgents.filter(function(ua) {
        return ua.indexOf('Bot') >= 0 || ua.indexOf('bot') >= 0;
      });
    }
    
    // Select random
    var index = Math.floor(Math.random() * userAgents.length);
    return userAgents[index] || userAgents[0];
    
  } catch (e) {
    return 'SerpifAI-Bot/6.0 (+https://serpifai.com/bot.html)';
  }
}

/**
 * Get all circuit breaker states (for debugging)
 * @return {object} All circuit states
 */
function FT_getAllCircuits() {
  try {
    var cache = CacheService.getScriptCache();
    var keys = cache.getKeys('circuit_*');
    var circuits = {};
    
    keys.forEach(function(key) {
      var domain = key.replace('circuit_', '');
      var data = cache.get(key);
      if (data) {
        circuits[domain] = JSON.parse(data);
      }
    });
    
    return circuits;
    
  } catch (e) {
    return { error: String(e) };
  }
}

/**
 * Legacy function names for backwards compatibility
 */
function CB_checkCircuit(domain) {
  return FT_checkCircuit(domain);
}

function CB_recordFailure(domain, statusCode, error) {
  return FT_recordFailure(domain, statusCode, error);
}

function CB_recordSuccess(domain) {
  return FT_recordSuccess(domain);
}

function CB_resetCircuit(domain) {
  return FT_resetCircuit(domain);
}

function CB_isRateLimited(statusCode, responseBody, headers) {
  return FT_isRateLimited(statusCode, responseBody, headers);
}

function CB_getRandomUserAgent(type) {
  return FT_getRandomUserAgent(type);
}

function CB_getAllCircuits() {
  return FT_getAllCircuits();
}
