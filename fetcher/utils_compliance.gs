/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FETCHER MODULE - COMPLIANCE & CIRCUIT BREAKER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Defense against rate limiting and 403/429 errors
 * Uses PropertiesService for persistent failure tracking
 * 
 * @module FetcherCompliance
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Check Circuit Breaker status for a domain
 * @param {string} domain - Domain to check
 * @returns {Object} {allowed: boolean, reason: string}
 */
function CB_checkCircuit(domain) {
  var config = SETUP_Project();
  var props = PropertiesService.getScriptProperties();
  
  var key = 'CB_' + domain.replace(/[^a-zA-Z0-9]/g, '_');
  var data = props.getProperty(key);
  
  if (!data) {
    return { allowed: true, reason: 'No failures recorded' };
  }
  
  try {
    var circuit = JSON.parse(data);
    var now = new Date().getTime();
    var cooldownEnd = circuit.lastFailure + (config.cooldownMinutes * 60 * 1000);
    
    if (circuit.failures >= config.maxFailures) {
      if (now < cooldownEnd) {
        var remaining = Math.ceil((cooldownEnd - now) / 60000);
        return {
          allowed: false,
          reason: 'Circuit OPEN: ' + circuit.failures + ' failures. Cooldown: ' + remaining + ' minutes'
        };
      } else {
        // Reset circuit after cooldown
        CB_resetCircuit(domain);
        return { allowed: true, reason: 'Circuit RESET after cooldown' };
      }
    }
    
    return { allowed: true, reason: 'Circuit CLOSED: ' + circuit.failures + '/' + config.maxFailures + ' failures' };
    
  } catch (e) {
    Logger.log('⚠️ Circuit Breaker parse error: ' + e);
    return { allowed: true, reason: 'Parse error, allowing request' };
  }
}

/**
 * Record a failure for a domain
 * @param {string} domain - Domain that failed
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error message
 */
function CB_recordFailure(domain, statusCode, error) {
  var props = PropertiesService.getScriptProperties();
  var key = 'CB_' + domain.replace(/[^a-zA-Z0-9]/g, '_');
  
  var circuit = { failures: 0, lastFailure: 0, history: [] };
  
  var existing = props.getProperty(key);
  if (existing) {
    try {
      circuit = JSON.parse(existing);
    } catch (e) {
      // Ignore parse errors, start fresh
    }
  }
  
  circuit.failures++;
  circuit.lastFailure = new Date().getTime();
  circuit.lastStatus = statusCode;
  circuit.lastError = error;
  
  // Keep last 10 failures in history
  circuit.history = circuit.history || [];
  circuit.history.push({
    timestamp: new Date().toISOString(),
    status: statusCode,
    error: error
  });
  
  if (circuit.history.length > 10) {
    circuit.history = circuit.history.slice(-10);
  }
  
  props.setProperty(key, JSON.stringify(circuit));
  
  Logger.log('🔴 Circuit Breaker: Failure recorded for ' + domain);
  Logger.log('   Failures: ' + circuit.failures);
  Logger.log('   Status: ' + statusCode);
  Logger.log('   Error: ' + error);
}

/**
 * Record a success for a domain (reduces failure count)
 * @param {string} domain - Domain that succeeded
 */
function CB_recordSuccess(domain) {
  var props = PropertiesService.getScriptProperties();
  var key = 'CB_' + domain.replace(/[^a-zA-Z0-9]/g, '_');
  
  var existing = props.getProperty(key);
  if (!existing) return; // No failures to reduce
  
  try {
    var circuit = JSON.parse(existing);
    
    // Reduce failure count on success
    if (circuit.failures > 0) {
      circuit.failures = Math.max(0, circuit.failures - 1);
      circuit.lastSuccess = new Date().toISOString();
      
      props.setProperty(key, JSON.stringify(circuit));
      
      Logger.log('✅ Circuit Breaker: Success recorded for ' + domain);
      Logger.log('   Failures reduced to: ' + circuit.failures);
    }
  } catch (e) {
    Logger.log('⚠️ Circuit Breaker success record error: ' + e);
  }
}

/**
 * Reset circuit breaker for a domain
 * @param {string} domain - Domain to reset
 */
function CB_resetCircuit(domain) {
  var props = PropertiesService.getScriptProperties();
  var key = 'CB_' + domain.replace(/[^a-zA-Z0-9]/g, '_');
  
  props.deleteProperty(key);
  Logger.log('🔄 Circuit Breaker: RESET for ' + domain);
}

/**
 * Check if HTTP response indicates rate limiting
 * @param {number} statusCode - HTTP status code
 * @param {string} responseText - Response body
 * @returns {boolean} True if rate limited
 */
function CB_isRateLimited(statusCode, responseText) {
  // Check status codes
  if (statusCode === 429 || statusCode === 403) return true;
  
  // Check response body for rate limit indicators
  var rateLimitPhrases = [
    'rate limit',
    'too many requests',
    'quota exceeded',
    'slow down',
    'try again later'
  ];
  
  var lowerText = (responseText || '').toLowerCase();
  
  for (var i = 0; i < rateLimitPhrases.length; i++) {
    if (lowerText.indexOf(rateLimitPhrases[i]) !== -1) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get all circuit breaker states (for debugging)
 * @returns {Object} All circuit states
 */
function CB_getAllCircuits() {
  var props = PropertiesService.getScriptProperties();
  var allProps = props.getProperties();
  var circuits = {};
  
  for (var key in allProps) {
    if (key.indexOf('CB_') === 0) {
      try {
        circuits[key] = JSON.parse(allProps[key]);
      } catch (e) {
        circuits[key] = { error: 'Parse failed' };
      }
    }
  }
  
  return circuits;
}

/**
 * Get random User-Agent string
 * @returns {string} Random User-Agent
 */
function CB_getRandomUserAgent() {
  var config = SETUP_Project();
  var userAgents = config.userAgents || [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  ];
  
  var index = Math.floor(Math.random() * userAgents.length);
  return userAgents[index];
}

/**
 * Test function to verify circuit breaker
 */
function TEST_circuitBreaker() {
  var domain = 'test-domain.com';
  
  Logger.log('🧪 Testing Circuit Breaker');
  
  // Test 1: Check initial state
  var check1 = CB_checkCircuit(domain);
  Logger.log('Initial check: ' + JSON.stringify(check1));
  
  // Test 2: Record 5 failures
  for (var i = 1; i <= 5; i++) {
    CB_recordFailure(domain, 429, 'Test failure ' + i);
  }
  
  // Test 3: Check circuit should be OPEN
  var check2 = CB_checkCircuit(domain);
  Logger.log('After 5 failures: ' + JSON.stringify(check2));
  
  // Test 4: Record success
  CB_recordSuccess(domain);
  
  // Test 5: Reset
  CB_resetCircuit(domain);
  
  var check3 = CB_checkCircuit(domain);
  Logger.log('After reset: ' + JSON.stringify(check3));
}
