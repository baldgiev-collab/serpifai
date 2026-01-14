/**
 * FT_HTTP.gs - HTTP Request Utilities
 * SerpifAI V8 - UrlFetchApp wrapper with retry logic
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// MAIN HTTP FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Make HTTP GET request
 */
function HTTP_get(url, options) {
  options = options || {};
  options.method = 'get';
  return HTTP_request(url, options);
}

/**
 * Make HTTP POST request
 */
function HTTP_post(url, payload, options) {
  options = options || {};
  options.method = 'post';
  options.payload = payload;
  return HTTP_request(url, options);
}

/**
 * Make HTTP PUT request
 */
function HTTP_put(url, payload, options) {
  options = options || {};
  options.method = 'put';
  options.payload = payload;
  return HTTP_request(url, options);
}

/**
 * Make HTTP DELETE request
 */
function HTTP_delete(url, options) {
  options = options || {};
  options.method = 'delete';
  return HTTP_request(url, options);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// CORE REQUEST FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Core HTTP request function with retry logic
 */
function HTTP_request(url, options) {
  options = options || {};
  
  const maxRetries = options.retries || 3;
  const retryDelay = options.retryDelay || 1000;
  
  // Build fetch options
  const fetchOptions = {
    method: options.method || 'get',
    muteHttpExceptions: true,
    followRedirects: options.followRedirects !== false
  };
  
  // Add headers
  if (options.headers) {
    fetchOptions.headers = options.headers;
  }
  
  // Add payload for POST/PUT
  if (options.payload) {
    if (typeof options.payload === 'object') {
      fetchOptions.payload = JSON.stringify(options.payload);
      fetchOptions.contentType = 'application/json';
    } else {
      fetchOptions.payload = options.payload;
    }
  }
  
  // Add content type
  if (options.contentType) {
    fetchOptions.contentType = options.contentType;
  }
  
  // Retry loop
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = UrlFetchApp.fetch(url, fetchOptions);
      const code = response.getResponseCode();
      const text = response.getContentText();
      
      // Success
      if (code >= 200 && code < 300) {
        return {
          ok: true,
          status: code,
          text: text,
          json: function() {
            try { return JSON.parse(text); }
            catch (e) { return null; }
          },
          headers: response.getAllHeaders()
        };
      }
      
      // Client error - don't retry
      if (code >= 400 && code < 500) {
        return {
          ok: false,
          status: code,
          error: 'HTTP ' + code,
          text: text
        };
      }
      
      // Server error - retry
      lastError = 'HTTP ' + code;
      
    } catch (err) {
      lastError = err.message;
    }
    
    // Wait before retry
    if (attempt < maxRetries) {
      Utilities.sleep(retryDelay * attempt);
    }
  }
  
  return {
    ok: false,
    status: 0,
    error: lastError || 'Request failed after ' + maxRetries + ' attempts'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SPECIALIZED HTTP FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Make API request with authentication
 */
function HTTP_apiRequest(url, apiKey, options) {
  options = options || {};
  options.headers = options.headers || {};
  
  // Add API key to headers
  if (apiKey) {
    options.headers['Authorization'] = 'Bearer ' + apiKey;
  }
  
  // Add standard API headers
  options.headers['Accept'] = 'application/json';
  
  return HTTP_request(url, options);
}

/**
 * Make JSON POST request
 */
function HTTP_postJson(url, data, headers) {
  return HTTP_post(url, data, {
    contentType: 'application/json',
    headers: headers
  });
}

/**
 * Make form POST request
 */
function HTTP_postForm(url, formData, headers) {
  const params = Object.keys(formData).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(formData[key]);
  }).join('&');
  
  return HTTP_post(url, params, {
    contentType: 'application/x-www-form-urlencoded',
    headers: headers
  });
}

/**
 * Fetch with timeout simulation
 */
function HTTP_fetchWithTimeout(url, options, timeoutMs) {
  // Note: Apps Script doesn't support true timeouts
  // This provides a soft timeout by checking elapsed time
  const startTime = Date.now();
  
  const result = HTTP_request(url, options);
  
  const elapsed = Date.now() - startTime;
  
  if (elapsed > timeoutMs) {
    return {
      ok: false,
      error: 'Request exceeded timeout of ' + timeoutMs + 'ms',
      elapsed: elapsed
    };
  }
  
  result.elapsed = elapsed;
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// BATCH HTTP FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch multiple URLs concurrently
 */
function HTTP_fetchAll(urls, options) {
  options = options || {};
  
  const requests = urls.map(function(url) {
    return {
      url: url,
      method: options.method || 'get',
      muteHttpExceptions: true,
      headers: options.headers
    };
  });
  
  try {
    const responses = UrlFetchApp.fetchAll(requests);
    
    return responses.map(function(response, index) {
      const code = response.getResponseCode();
      const text = response.getContentText();
      
      return {
        url: urls[index],
        ok: code >= 200 && code < 300,
        status: code,
        text: text,
        json: function() {
          try { return JSON.parse(text); }
          catch (e) { return null; }
        }
      };
    });
  } catch (err) {
    return urls.map(function(url) {
      return {
        url: url,
        ok: false,
        error: err.message
      };
    });
  }
}

/**
 * Rate-limited batch fetch
 */
function HTTP_fetchBatch(urls, options) {
  options = options || {};
  
  const batchSize = options.batchSize || 5;
  const delayMs = options.delayMs || 1000;
  const results = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = HTTP_fetchAll(batch, options);
    results.push.apply(results, batchResults);
    
    // Delay between batches
    if (i + batchSize < urls.length) {
      Utilities.sleep(delayMs);
    }
  }
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Build URL with query parameters
 */
function HTTP_buildUrl(baseUrl, params) {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const query = Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  
  return baseUrl + (baseUrl.indexOf('?') >= 0 ? '&' : '?') + query;
}

/**
 * Parse URL into components
 */
function HTTP_parseUrl(url) {
  try {
    // Simple URL parsing
    const match = url.match(/^(https?:\/\/)?([^\/\?]+)(\/[^\?]*)?(\?.*)?$/);
    
    if (!match) return null;
    
    const params = {};
    if (match[4]) {
      match[4].substring(1).split('&').forEach(function(pair) {
        const parts = pair.split('=');
        params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
      });
    }
    
    return {
      protocol: match[1] || 'https://',
      host: match[2],
      path: match[3] || '/',
      query: match[4] || '',
      params: params
    };
  } catch (e) {
    return null;
  }
}

/**
 * Check if URL is valid
 */
function HTTP_isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /^https?:\/\/.+/.test(url);
}

/**
 * Get domain from URL
 */
function HTTP_getDomain(url) {
  try {
    const match = url.match(/^https?:\/\/([^\/]+)/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}
