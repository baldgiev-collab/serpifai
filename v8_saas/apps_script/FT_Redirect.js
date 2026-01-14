/**
 * FT_Redirect.gs - Redirect Chain Analysis
 * SerpifAI V8 - URL redirect checker
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// REDIRECT ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze redirect chain
 */
function FT_analyzeRedirects(params) {
  const url = params.url;
  const maxRedirects = params.maxRedirects || 10;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const chain = [];
    let currentUrl = url;
    let count = 0;
    
    while (count < maxRedirects) {
      const response = UrlFetchApp.fetch(currentUrl, {
        followRedirects: false,
        muteHttpExceptions: true
      });
      
      const statusCode = response.getResponseCode();
      const headers = response.getAllHeaders();
      
      chain.push({
        url: currentUrl,
        statusCode: statusCode,
        statusText: getStatusText(statusCode)
      });
      
      // Check if redirect
      if (statusCode >= 300 && statusCode < 400) {
        const location = headers['Location'] || headers['location'];
        if (location) {
          currentUrl = resolveUrl(currentUrl, location);
          count++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    // Analyze the chain
    const analysis = analyzeRedirectChain(chain);
    
    return {
      ok: true,
      url: url,
      finalUrl: chain[chain.length - 1].url,
      chain: chain,
      chainLength: chain.length,
      hasRedirects: chain.length > 1,
      issues: analysis.issues,
      recommendations: analysis.recommendations
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Resolve relative URL
 */
function resolveUrl(baseUrl, relativeUrl) {
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  try {
    const base = new URL(baseUrl);
    
    if (relativeUrl.startsWith('/')) {
      return base.origin + relativeUrl;
    }
    
    const path = base.pathname.replace(/\/[^\/]*$/, '/');
    return base.origin + path + relativeUrl;
  } catch (e) {
    return relativeUrl;
  }
}

/**
 * Get status text
 */
function FT_Redir_getStatusText(code) {
  const statusTexts = {
    200: 'OK',
    301: 'Moved Permanently',
    302: 'Found (Temporary Redirect)',
    303: 'See Other',
    304: 'Not Modified',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    410: 'Gone',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };
  
  return statusTexts[code] || 'Unknown';
}

/**
 * Analyze redirect chain for issues
 */
function analyzeRedirectChain(chain) {
  const issues = [];
  const recommendations = [];
  
  // Too many redirects
  if (chain.length > 3) {
    issues.push({
      type: 'warning',
      title: 'Long redirect chain',
      description: chain.length + ' redirects detected. Keep chains under 3 hops.'
    });
    recommendations.push({
      priority: 'medium',
      title: 'Shorten redirect chain',
      fix: 'Update redirects to go directly to final destination'
    });
  }
  
  // Check for redirect loops (basic)
  const urls = chain.map(c => c.url);
  const uniqueUrls = [...new Set(urls)];
  if (uniqueUrls.length < urls.length) {
    issues.push({
      type: 'critical',
      title: 'Potential redirect loop',
      description: 'Same URL appears multiple times in chain'
    });
  }
  
  // Check for 302s that should be 301s
  const tempRedirects = chain.filter(c => c.statusCode === 302);
  if (tempRedirects.length > 0) {
    issues.push({
      type: 'info',
      title: '302 redirects found',
      description: tempRedirects.length + ' temporary redirects. Consider 301 for permanent changes.'
    });
    recommendations.push({
      priority: 'low',
      title: 'Use 301 for permanent redirects',
      fix: 'Change 302 redirects to 301 if the redirect is permanent'
    });
  }
  
  // Check HTTP to HTTPS
  let httpToHttps = false;
  for (let i = 0; i < chain.length - 1; i++) {
    if (chain[i].url.startsWith('http://') && chain[i + 1].url.startsWith('https://')) {
      httpToHttps = true;
      break;
    }
  }
  
  if (httpToHttps && chain.length > 2) {
    issues.push({
      type: 'info',
      title: 'HTTP to HTTPS redirect',
      description: 'Consider combining with other redirects'
    });
  }
  
  // Check for www/non-www
  let wwwRedirect = false;
  for (let i = 0; i < chain.length - 1; i++) {
    const hasWww1 = chain[i].url.includes('://www.');
    const hasWww2 = chain[i + 1].url.includes('://www.');
    if (hasWww1 !== hasWww2) {
      wwwRedirect = true;
      break;
    }
  }
  
  if (wwwRedirect && chain.length > 2) {
    issues.push({
      type: 'info',
      title: 'WWW canonicalization redirect',
      description: 'WWW/non-WWW redirect detected'
    });
  }
  
  // Final URL status
  const finalStatus = chain[chain.length - 1].statusCode;
  if (finalStatus !== 200) {
    issues.push({
      type: 'critical',
      title: 'Final URL not OK',
      description: 'Final URL returns ' + finalStatus + ' ' + getStatusText(finalStatus)
    });
    recommendations.push({
      priority: 'high',
      title: 'Fix final destination',
      fix: 'Ensure the final URL returns a 200 status'
    });
  }
  
  return { issues: issues, recommendations: recommendations };
}

/**
 * Batch check redirects
 */
function FT_batchCheckRedirects(params) {
  const urls = params.urls || [];
  
  if (urls.length === 0) {
    return { ok: false, error: 'URLs required' };
  }
  
  const results = [];
  
  urls.slice(0, 20).forEach(function(url) {
    try {
      const result = FT_analyzeRedirects({ url: url, maxRedirects: 5 });
      results.push({
        url: url,
        finalUrl: result.finalUrl,
        chainLength: result.chainLength,
        hasIssues: (result.issues || []).length > 0,
        ok: result.ok
      });
    } catch (err) {
      results.push({ url: url, error: err.message, ok: false });
    }
    
    Utilities.sleep(200); // Rate limiting
  });
  
  return {
    ok: true,
    results: results,
    summary: {
      total: results.length,
      withRedirects: results.filter(r => r.chainLength > 1).length,
      withIssues: results.filter(r => r.hasIssues).length
    }
  };
}

/**
 * Check canonical redirect
 */
function FT_checkCanonicalRedirect(params) {
  const domain = params.domain;
  
  if (!domain) {
    return { ok: false, error: 'Domain required' };
  }
  
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Test all variations
    const variations = [
      'http://' + cleanDomain,
      'http://www.' + cleanDomain,
      'https://' + cleanDomain,
      'https://www.' + cleanDomain
    ];
    
    const results = variations.map(function(url) {
      const check = FT_analyzeRedirects({ url: url, maxRedirects: 5 });
      return {
        variant: url,
        finalUrl: check.finalUrl,
        chainLength: check.chainLength
      };
    });
    
    // Check if all variants redirect to same final URL
    const finalUrls = [...new Set(results.map(r => r.finalUrl))];
    const isConsistent = finalUrls.length === 1;
    
    return {
      ok: true,
      domain: cleanDomain,
      canonicalUrl: finalUrls[0],
      isConsistent: isConsistent,
      variants: results,
      recommendation: isConsistent ? 
        'All variants correctly redirect to ' + finalUrls[0] :
        'Variants redirect to different URLs - fix canonicalization'
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Trace redirect history for URL
 */
function FT_traceRedirectHistory(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  // This would require historical data from database
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT * FROM redirect_history 
            WHERE url = ? 
            ORDER BY checked_at DESC 
            LIMIT 50`,
      params: [url]
    });
    
    return { ok: true, history: result.rows || [] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
