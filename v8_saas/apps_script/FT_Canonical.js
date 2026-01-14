/**
 * FT_Canonical.gs - Canonical URL Analysis
 * SerpifAI V8 - Canonical tag validation
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// CANONICAL URL ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze canonical tags
 */
function FT_analyzeCanonical(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const html = response.getContentText();
    const headers = response.getAllHeaders();
    
    // Extract canonical from HTML
    const htmlCanonical = extractHtmlCanonical(html);
    
    // Extract canonical from HTTP header
    const headerCanonical = extractHeaderCanonical(headers);
    
    // Validate canonical
    const validation = validateCanonical(url, htmlCanonical, headerCanonical);
    
    return {
      ok: true,
      url: url,
      canonical: {
        html: htmlCanonical,
        header: headerCanonical,
        effective: htmlCanonical || headerCanonical
      },
      isSelfReferencing: validation.isSelfReferencing,
      issues: validation.issues,
      recommendations: validation.recommendations
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract canonical from HTML
 */
function extractHtmlCanonical(html) {
  const canonicalRegex = /<link[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*>/i;
  const canonicalRegex2 = /<link[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["']canonical["'][^>]*>/i;
  
  let match = html.match(canonicalRegex);
  if (match) return match[1];
  
  match = html.match(canonicalRegex2);
  if (match) return match[1];
  
  return null;
}

/**
 * Extract canonical from HTTP headers
 */
function extractHeaderCanonical(headers) {
  const linkHeader = headers['Link'] || headers['link'];
  
  if (linkHeader) {
    const canonicalMatch = linkHeader.match(/<([^>]+)>;\s*rel\s*=\s*["']?canonical["']?/i);
    if (canonicalMatch) {
      return canonicalMatch[1];
    }
  }
  
  return null;
}

/**
 * Validate canonical URL
 */
function validateCanonical(pageUrl, htmlCanonical, headerCanonical) {
  const issues = [];
  const recommendations = [];
  
  // No canonical
  if (!htmlCanonical && !headerCanonical) {
    issues.push({
      type: 'warning',
      title: 'Missing Canonical Tag',
      description: 'Page has no canonical URL specified'
    });
    recommendations.push({
      priority: 'high',
      title: 'Add canonical tag',
      fix: 'Add <link rel="canonical" href="' + pageUrl + '"> to the page'
    });
    return { isSelfReferencing: false, issues: issues, recommendations: recommendations };
  }
  
  // Conflicting canonicals
  if (htmlCanonical && headerCanonical && htmlCanonical !== headerCanonical) {
    issues.push({
      type: 'critical',
      title: 'Conflicting Canonicals',
      description: 'HTML and HTTP header specify different canonical URLs'
    });
    recommendations.push({
      priority: 'high',
      title: 'Resolve canonical conflict',
      fix: 'Ensure HTML and HTTP header canonical URLs match'
    });
  }
  
  const effectiveCanonical = htmlCanonical || headerCanonical;
  
  // Normalize URLs for comparison
  const normalizedPage = normalizeUrl(pageUrl);
  const normalizedCanonical = normalizeUrl(effectiveCanonical);
  const isSelfReferencing = normalizedPage === normalizedCanonical;
  
  // Check for relative URL
  if (!effectiveCanonical.startsWith('http://') && !effectiveCanonical.startsWith('https://')) {
    issues.push({
      type: 'warning',
      title: 'Relative Canonical URL',
      description: 'Canonical should be an absolute URL'
    });
    recommendations.push({
      priority: 'medium',
      title: 'Use absolute URL',
      fix: 'Change canonical to absolute URL including protocol and domain'
    });
  }
  
  // Check for HTTP vs HTTPS mismatch
  if (pageUrl.startsWith('https://') && effectiveCanonical.startsWith('http://')) {
    issues.push({
      type: 'warning',
      title: 'HTTP Canonical on HTTPS Page',
      description: 'HTTPS page points to HTTP canonical'
    });
    recommendations.push({
      priority: 'high',
      title: 'Use HTTPS canonical',
      fix: 'Update canonical to use HTTPS'
    });
  }
  
  // Check if canonical is accessible
  if (isSelfReferencing) {
    // Self-referencing is generally good
  } else {
    // Cross-page canonical - should verify target exists
    issues.push({
      type: 'info',
      title: 'Cross-Page Canonical',
      description: 'Page canonicalizes to a different URL'
    });
  }
  
  return { isSelfReferencing: isSelfReferencing, issues: issues, recommendations: recommendations };
}

/**
 * Normalize URL for comparison
 */
function FT_CAN_normalizeUrl(url) {
  try {
    let normalized = url.toLowerCase();
    normalized = normalized.replace(/\/$/, ''); // Remove trailing slash
    normalized = normalized.replace(/^https?:\/\/www\./, 'https://'); // Normalize www
    normalized = normalized.replace(/^http:\/\//, 'https://'); // Normalize protocol
    return normalized;
  } catch (e) {
    return url;
  }
}

/**
 * Batch check canonicals
 */
function FT_batchCheckCanonicals(params) {
  const urls = params.urls || [];
  
  if (urls.length === 0) {
    return { ok: false, error: 'URLs required' };
  }
  
  const results = [];
  
  urls.slice(0, 20).forEach(function(url) {
    try {
      const result = FT_analyzeCanonical({ url: url });
      results.push({
        url: url,
        canonical: result.canonical?.effective,
        isSelfReferencing: result.isSelfReferencing,
        hasIssues: (result.issues || []).length > 0,
        ok: result.ok
      });
    } catch (err) {
      results.push({ url: url, error: err.message, ok: false });
    }
    
    Utilities.sleep(200);
  });
  
  return {
    ok: true,
    results: results,
    summary: {
      total: results.length,
      selfReferencing: results.filter(r => r.isSelfReferencing).length,
      crossPage: results.filter(r => r.ok && !r.isSelfReferencing).length,
      missing: results.filter(r => r.ok && !r.canonical).length,
      withIssues: results.filter(r => r.hasIssues).length
    }
  };
}

/**
 * Check canonical chain
 */
function FT_checkCanonicalChain(params) {
  const url = params.url;
  const maxDepth = params.maxDepth || 5;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const chain = [];
    let currentUrl = url;
    let depth = 0;
    
    while (depth < maxDepth) {
      const result = FT_analyzeCanonical({ url: currentUrl });
      
      if (!result.ok) {
        chain.push({ url: currentUrl, error: result.error });
        break;
      }
      
      const canonical = result.canonical?.effective;
      chain.push({
        url: currentUrl,
        canonical: canonical,
        isSelfReferencing: result.isSelfReferencing
      });
      
      if (!canonical || result.isSelfReferencing || canonical === currentUrl) {
        break;
      }
      
      // Check for loops
      if (chain.some(c => c.canonical === canonical)) {
        chain.push({ url: canonical, error: 'Canonical loop detected' });
        break;
      }
      
      currentUrl = canonical;
      depth++;
      
      Utilities.sleep(200);
    }
    
    const hasLoop = chain.some(c => c.error && c.error.includes('loop'));
    const finalCanonical = chain[chain.length - 1];
    
    return {
      ok: true,
      startUrl: url,
      chain: chain,
      chainLength: chain.length,
      finalCanonical: hasLoop ? null : finalCanonical?.canonical || finalCanonical?.url,
      hasLoop: hasLoop,
      recommendation: chain.length > 2 ? 'Shorten canonical chain by pointing directly to final URL' : null
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Generate canonical suggestions
 */
function FT_suggestCanonical(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    // Clean up the URL for canonical suggestion
    let suggested = url;
    
    // Prefer HTTPS
    suggested = suggested.replace(/^http:\/\//, 'https://');
    
    // Standardize www (based on preference)
    const preferWww = params.preferWww !== false;
    if (preferWww && !suggested.includes('://www.')) {
      suggested = suggested.replace('://', '://www.');
    } else if (!preferWww) {
      suggested = suggested.replace('://www.', '://');
    }
    
    // Remove trailing slash (optional)
    if (params.removeTrailingSlash) {
      suggested = suggested.replace(/\/$/, '');
    }
    
    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref'];
    try {
      const urlObj = new URL(suggested);
      trackingParams.forEach(function(param) {
        urlObj.searchParams.delete(param);
      });
      suggested = urlObj.toString();
    } catch (e) {
      // URL parsing failed, return as is
    }
    
    return {
      ok: true,
      original: url,
      suggested: suggested,
      htmlTag: '<link rel="canonical" href="' + suggested + '">'
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
