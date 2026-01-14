/**
 * FT_URLChecker.gs - URL Checking and Validation
 * SerpifAI V8 - Check URL status, redirects, and issues
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// URL CHECKER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Check URL status
 */
function FT_checkUrl(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const startTime = Date.now();
    
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: false,
      validateHttpsCertificates: false
    });
    
    const endTime = Date.now();
    const statusCode = response.getResponseCode();
    
    return {
      ok: true,
      url: url,
      status: statusCode,
      statusText: getStatusText(statusCode),
      isOk: statusCode >= 200 && statusCode < 300,
      isRedirect: statusCode >= 300 && statusCode < 400,
      isClientError: statusCode >= 400 && statusCode < 500,
      isServerError: statusCode >= 500,
      responseTime: endTime - startTime,
      headers: parseResponseHeaders(response.getAllHeaders())
    };
  } catch (err) {
    return {
      ok: false,
      url: url,
      error: err.message,
      isReachable: false
    };
  }
}

/**
 * Get HTTP status text
 */
function FT_URL_getStatusText(code) {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    410: 'Gone',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };
  
  return statusTexts[code] || 'Unknown';
}

/**
 * Parse response headers
 */
function parseResponseHeaders(headers) {
  const result = {};
  
  Object.keys(headers).forEach(function(key) {
    result[key.toLowerCase()] = headers[key];
  });
  
  return result;
}

/**
 * Check multiple URLs
 */
function FT_checkUrls(params) {
  const urls = params.urls || [];
  const concurrent = Math.min(params.concurrent || 5, 10);
  
  if (urls.length === 0) {
    return { ok: false, error: 'URLs required' };
  }
  
  const results = [];
  
  // Process in batches
  for (let i = 0; i < urls.length; i++) {
    const result = FT_checkUrl({ url: urls[i] });
    result.index = i;
    results.push(result);
    
    // Small delay to avoid rate limiting
    if (i < urls.length - 1) {
      Utilities.sleep(100);
    }
  }
  
  // Summary
  const summary = {
    total: results.length,
    ok: results.filter(function(r) { return r.isOk; }).length,
    redirects: results.filter(function(r) { return r.isRedirect; }).length,
    clientErrors: results.filter(function(r) { return r.isClientError; }).length,
    serverErrors: results.filter(function(r) { return r.isServerError; }).length,
    unreachable: results.filter(function(r) { return !r.ok; }).length
  };
  
  return {
    ok: true,
    results: results,
    summary: summary
  };
}

/**
 * Follow redirects and trace chain
 */
function FT_traceRedirects(params) {
  const url = params.url;
  const maxRedirects = params.maxRedirects || 10;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  const chain = [];
  let currentUrl = url;
  let count = 0;
  
  while (count < maxRedirects) {
    try {
      const response = UrlFetchApp.fetch(currentUrl, {
        muteHttpExceptions: true,
        followRedirects: false
      });
      
      const statusCode = response.getResponseCode();
      const headers = response.getAllHeaders();
      
      chain.push({
        url: currentUrl,
        status: statusCode,
        statusText: getStatusText(statusCode)
      });
      
      // If not a redirect, we're done
      if (statusCode < 300 || statusCode >= 400) {
        break;
      }
      
      // Get redirect location
      const location = headers['Location'] || headers['location'];
      if (!location) {
        break;
      }
      
      // Handle relative URLs
      if (location.startsWith('/')) {
        const urlObj = new URL(currentUrl);
        currentUrl = urlObj.origin + location;
      } else if (!location.startsWith('http')) {
        currentUrl = new URL(location, currentUrl).href;
      } else {
        currentUrl = location;
      }
      
      count++;
    } catch (err) {
      chain.push({
        url: currentUrl,
        error: err.message
      });
      break;
    }
  }
  
  const finalUrl = chain.length > 0 ? chain[chain.length - 1].url : url;
  const hasRedirectLoop = count >= maxRedirects;
  
  return {
    ok: true,
    originalUrl: url,
    finalUrl: finalUrl,
    redirectCount: chain.length - 1,
    hasRedirectLoop: hasRedirectLoop,
    chain: chain,
    issues: getRedirectIssues(chain)
  };
}

/**
 * Get redirect issues
 */
function getRedirectIssues(chain) {
  const issues = [];
  
  if (chain.length > 3) {
    issues.push('Too many redirects (' + (chain.length - 1) + ')');
  }
  
  chain.forEach(function(item, idx) {
    if (item.status === 302) {
      issues.push('Using 302 instead of 301 at step ' + (idx + 1));
    }
  });
  
  // Check for HTTP to HTTPS redirect
  if (chain.length >= 2 && chain[0].url.startsWith('http://') && chain[1].url.startsWith('https://')) {
    // This is good, not an issue
  }
  
  return issues;
}

/**
 * Validate URL format
 */
function FT_validateUrl(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  const issues = [];
  let isValid = true;
  
  // Check protocol
  if (!url.match(/^https?:\/\//i)) {
    issues.push('Missing or invalid protocol (should start with http:// or https://)');
    isValid = false;
  }
  
  // Check for spaces
  if (url.indexOf(' ') >= 0) {
    issues.push('URL contains spaces');
    isValid = false;
  }
  
  // Check for double slashes (except in protocol)
  const withoutProtocol = url.replace(/^https?:\/\//, '');
  if (withoutProtocol.indexOf('//') >= 0) {
    issues.push('URL contains double slashes');
  }
  
  // Check for uppercase
  if (url !== url.toLowerCase()) {
    issues.push('URL contains uppercase characters (may cause duplicate content issues)');
  }
  
  // Check for trailing slash consistency
  if (!url.match(/\.[a-z]+$/i) && !url.endsWith('/')) {
    issues.push('URL does not end with trailing slash (consistency recommendation)');
  }
  
  // Check for special characters
  if (url.match(/[<>'"{}|\\^`\[\]]/)) {
    issues.push('URL contains invalid characters');
    isValid = false;
  }
  
  // Check length
  if (url.length > 2048) {
    issues.push('URL exceeds 2048 characters');
    isValid = false;
  }
  
  // Parse URL parts
  let parsed = null;
  try {
    parsed = parseUrl(url);
  } catch (e) {
    issues.push('URL could not be parsed');
    isValid = false;
  }
  
  return {
    ok: true,
    url: url,
    isValid: isValid,
    issues: issues,
    parsed: parsed
  };
}

/**
 * Parse URL into components
 */
function parseUrl(url) {
  const match = url.match(/^(https?):\/\/([^\/]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i);
  
  if (!match) {
    throw new Error('Invalid URL format');
  }
  
  const hostParts = match[2].split(':');
  
  return {
    protocol: match[1],
    host: hostParts[0],
    port: hostParts[1] || null,
    path: match[3] || '/',
    query: match[4] || '',
    hash: match[5] || ''
  };
}

/**
 * Check if URL is indexed
 */
function FT_checkIndexStatus(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  // Check for noindex in page
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    const headers = response.getAllHeaders();
    
    // Check X-Robots-Tag header
    const robotsHeader = headers['X-Robots-Tag'] || headers['x-robots-tag'] || '';
    const headerNoIndex = robotsHeader.toLowerCase().indexOf('noindex') >= 0;
    
    // Check meta robots tag
    const metaMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
    const metaNoIndex = metaMatch && metaMatch[1].toLowerCase().indexOf('noindex') >= 0;
    
    // Check canonical
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : null;
    const hasCanonicalMismatch = canonical && !canonical.includes(new URL(url).pathname);
    
    return {
      ok: true,
      url: url,
      indexable: !headerNoIndex && !metaNoIndex,
      hasNoIndexHeader: headerNoIndex,
      hasNoIndexMeta: metaNoIndex,
      canonical: canonical,
      hasCanonicalMismatch: hasCanonicalMismatch,
      issues: [
        headerNoIndex ? 'X-Robots-Tag header contains noindex' : null,
        metaNoIndex ? 'Meta robots tag contains noindex' : null,
        hasCanonicalMismatch ? 'Canonical URL does not match' : null
      ].filter(function(i) { return i; })
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Generate clean URL
 */
function FT_generateCleanUrl(params) {
  const text = params.text || '';
  
  let slug = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Limit length
  if (slug.length > 75) {
    slug = slug.substring(0, 75).replace(/-[^-]*$/, '');
  }
  
  return {
    ok: true,
    original: text,
    slug: slug
  };
}
