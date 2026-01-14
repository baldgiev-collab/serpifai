/**
 * FT_Headers.gs - HTTP Header Analysis
 * SerpifAI V8 - Analyze HTTP headers for SEO
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// HEADER ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze HTTP headers for a URL
 */
function FT_analyzeHeaders(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL is required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: false
    });
    
    const responseCode = response.getResponseCode();
    const headers = response.getHeaders();
    
    // Analyze headers
    const analysis = {
      statusCode: responseCode,
      statusType: getStatusType(responseCode),
      headers: headers,
      seoHeaders: analyzeSEOHeaders(headers),
      securityHeaders: analyzeSecurityHeaders(headers),
      cacheHeaders: analyzeCacheHeaders(headers),
      issues: [],
      score: 100
    };
    
    // Check for issues
    if (responseCode >= 400) {
      analysis.issues.push({
        type: 'error',
        message: 'HTTP ' + responseCode + ' error'
      });
      analysis.score -= 30;
    }
    
    // Check X-Robots-Tag
    if (headers['x-robots-tag'] && headers['x-robots-tag'].indexOf('noindex') >= 0) {
      analysis.issues.push({
        type: 'warning',
        message: 'Page is set to noindex via X-Robots-Tag header'
      });
      analysis.score -= 20;
    }
    
    // Check cache
    if (!headers['cache-control'] && !headers['expires']) {
      analysis.issues.push({
        type: 'info',
        message: 'No cache headers set'
      });
      analysis.score -= 5;
    }
    
    // Check security
    if (!headers['strict-transport-security']) {
      analysis.issues.push({
        type: 'warning',
        message: 'HSTS header not set'
      });
      analysis.score -= 5;
    }
    
    // Check compression
    if (!headers['content-encoding']) {
      analysis.issues.push({
        type: 'info',
        message: 'Response may not be compressed'
      });
      analysis.score -= 5;
    }
    
    analysis.score = Math.max(0, analysis.score);
    
    return {
      ok: true,
      url: url,
      analysis: analysis
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get status type
 */
function getStatusType(code) {
  if (code >= 200 && code < 300) return 'success';
  if (code >= 300 && code < 400) return 'redirect';
  if (code >= 400 && code < 500) return 'client-error';
  if (code >= 500) return 'server-error';
  return 'unknown';
}

/**
 * Analyze SEO-relevant headers
 */
function analyzeSEOHeaders(headers) {
  return {
    xRobotsTag: headers['x-robots-tag'] || null,
    canonical: headers['link'] ? extractCanonicalFromLink(headers['link']) : null,
    contentType: headers['content-type'] || null,
    contentLength: headers['content-length'] || null
  };
}

/**
 * Extract canonical from Link header
 */
function extractCanonicalFromLink(linkHeader) {
  const match = linkHeader.match(/<([^>]+)>;\s*rel=["']?canonical["']?/i);
  return match ? match[1] : null;
}

/**
 * Analyze security headers
 */
function FT_Headers_analyzeSecurityHeaders(headers) {
  return {
    hsts: headers['strict-transport-security'] || null,
    xContentTypeOptions: headers['x-content-type-options'] || null,
    xFrameOptions: headers['x-frame-options'] || null,
    xXssProtection: headers['x-xss-protection'] || null,
    contentSecurityPolicy: headers['content-security-policy'] || null,
    referrerPolicy: headers['referrer-policy'] || null
  };
}

/**
 * Analyze cache headers
 */
function analyzeCacheHeaders(headers) {
  return {
    cacheControl: headers['cache-control'] || null,
    expires: headers['expires'] || null,
    etag: headers['etag'] || null,
    lastModified: headers['last-modified'] || null,
    age: headers['age'] || null
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// REDIRECT ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Check redirect chain
 */
function FT_checkRedirectChain(params) {
  const url = params.url;
  const maxRedirects = params.maxRedirects || 10;
  
  try {
    const chain = [];
    let currentUrl = url;
    let redirectCount = 0;
    
    while (redirectCount < maxRedirects) {
      const response = UrlFetchApp.fetch(currentUrl, {
        muteHttpExceptions: true,
        followRedirects: false
      });
      
      const code = response.getResponseCode();
      const headers = response.getHeaders();
      
      chain.push({
        url: currentUrl,
        statusCode: code,
        redirectTo: headers['location'] || null
      });
      
      if (code >= 300 && code < 400 && headers['location']) {
        currentUrl = headers['location'];
        
        // Handle relative URLs
        if (!currentUrl.startsWith('http')) {
          const baseUrl = url.match(/^(https?:\/\/[^\/]+)/)[1];
          currentUrl = currentUrl.startsWith('/') ? baseUrl + currentUrl : baseUrl + '/' + currentUrl;
        }
        
        redirectCount++;
      } else {
        break;
      }
    }
    
    const issues = [];
    
    if (redirectCount > 2) {
      issues.push('Redirect chain is too long (' + redirectCount + ' redirects)');
    }
    
    // Check for redirect loops
    const urls = chain.map(function(c) { return c.url; });
    const uniqueUrls = urls.filter(function(u, i) { return urls.indexOf(u) === i; });
    
    if (uniqueUrls.length < chain.length) {
      issues.push('Possible redirect loop detected');
    }
    
    return {
      ok: true,
      chain: chain,
      redirectCount: redirectCount,
      finalUrl: chain[chain.length - 1].url,
      issues: issues
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check URL status codes in bulk
 */
function FT_checkUrlStatus(params) {
  const urls = params.urls || [];
  
  if (urls.length === 0) {
    return { ok: false, error: 'No URLs provided' };
  }
  
  const results = [];
  
  urls.forEach(function(url) {
    try {
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: false
      });
      
      results.push({
        url: url,
        statusCode: response.getResponseCode(),
        ok: response.getResponseCode() >= 200 && response.getResponseCode() < 400
      });
    } catch (e) {
      results.push({
        url: url,
        statusCode: 0,
        ok: false,
        error: e.message
      });
    }
  });
  
  // Summary
  const summary = {
    total: results.length,
    ok: results.filter(function(r) { return r.ok; }).length,
    redirects: results.filter(function(r) { return r.statusCode >= 300 && r.statusCode < 400; }).length,
    errors: results.filter(function(r) { return r.statusCode >= 400 || r.statusCode === 0; }).length
  };
  
  return {
    ok: true,
    results: results,
    summary: summary
  };
}

/**
 * Get optimal cache settings recommendation
 */
function FT_getCacheRecommendations(params) {
  const contentType = params.contentType || 'html';
  
  const recommendations = {
    html: {
      cacheControl: 'public, max-age=3600, must-revalidate',
      explanation: 'HTML pages should have shorter cache times'
    },
    css: {
      cacheControl: 'public, max-age=31536000, immutable',
      explanation: 'CSS files with versioning can be cached for a year'
    },
    js: {
      cacheControl: 'public, max-age=31536000, immutable',
      explanation: 'JavaScript files with versioning can be cached for a year'
    },
    images: {
      cacheControl: 'public, max-age=604800',
      explanation: 'Images can typically be cached for a week'
    },
    fonts: {
      cacheControl: 'public, max-age=31536000, immutable',
      explanation: 'Fonts rarely change and can be cached for a year'
    }
  };
  
  return {
    ok: true,
    recommendation: recommendations[contentType] || recommendations.html
  };
}

/**
 * Generate security headers
 */
function FT_generateSecurityHeaders() {
  return {
    ok: true,
    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'"
    },
    explanation: 'Recommended security headers for modern websites'
  };
}
