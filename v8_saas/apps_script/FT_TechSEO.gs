/**
 * FT_TechSEO.gs - Technical SEO Analysis
 * SerpifAI V8 - Technical SEO checks and audits
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// TECHNICAL SEO
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Run technical SEO audit
 */
function FT_runTechAudit(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const results = {
      url: url,
      timestamp: new Date().toISOString(),
      checks: {}
    };
    
    // Fetch the page
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    const headers = response.getAllHeaders();
    const statusCode = response.getResponseCode();
    
    // Run all checks
    results.checks.status = checkStatusCode(statusCode);
    results.checks.https = checkHTTPS(url);
    results.checks.canonical = checkCanonical(html, url);
    results.checks.robots = checkRobotsTags(html, headers);
    results.checks.hreflang = checkHreflang(html);
    results.checks.viewport = checkViewport(html);
    results.checks.charset = checkCharset(html, headers);
    results.checks.doctype = checkDoctype(html);
    results.checks.languageAttr = checkLanguageAttr(html);
    results.checks.favicon = checkFavicon(html);
    
    // Calculate overall score
    let score = 100;
    Object.keys(results.checks).forEach(function(key) {
      if (!results.checks[key].pass) {
        score -= results.checks[key].impact || 10;
      }
    });
    
    results.score = Math.max(0, score);
    results.grade = getGrade(results.score);
    
    return { ok: true, audit: results };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check status code
 */
function checkStatusCode(code) {
  return {
    name: 'HTTP Status Code',
    value: code,
    pass: code === 200,
    message: code === 200 ? 'Page returns 200 OK' : 'Page returns ' + code,
    impact: 30
  };
}

/**
 * Check HTTPS
 */
function checkHTTPS(url) {
  const isHttps = url.toLowerCase().startsWith('https://');
  return {
    name: 'HTTPS',
    value: isHttps,
    pass: isHttps,
    message: isHttps ? 'Site uses HTTPS' : 'Site does not use HTTPS',
    impact: 25
  };
}

/**
 * Check canonical tag
 */
function checkCanonical(html, url) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const canonical = match ? match[1] : null;
  
  let pass = true;
  let message = 'Canonical tag is properly set';
  
  if (!canonical) {
    pass = false;
    message = 'No canonical tag found';
  } else if (canonical !== url && !canonical.endsWith(new URL(url).pathname)) {
    pass = false;
    message = 'Canonical URL differs from current URL';
  }
  
  return {
    name: 'Canonical Tag',
    value: canonical,
    pass: pass,
    message: message,
    impact: 15
  };
}

/**
 * Check robots tags
 */
function checkRobotsTags(html, headers) {
  const headerRobots = headers['X-Robots-Tag'] || headers['x-robots-tag'] || '';
  const metaMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  const metaRobots = metaMatch ? metaMatch[1] : '';
  
  const hasNoIndex = headerRobots.toLowerCase().includes('noindex') || metaRobots.toLowerCase().includes('noindex');
  const hasNoFollow = headerRobots.toLowerCase().includes('nofollow') || metaRobots.toLowerCase().includes('nofollow');
  
  return {
    name: 'Robots Directives',
    value: { header: headerRobots, meta: metaRobots },
    pass: !hasNoIndex,
    message: hasNoIndex ? 'Page is set to noindex' : 'Page is indexable',
    hasNoFollow: hasNoFollow,
    impact: 25
  };
}

/**
 * Check hreflang tags
 */
function checkHreflang(html) {
  const hreflangPattern = /<link[^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["']/gi;
  const hreflangs = [];
  let match;
  
  while ((match = hreflangPattern.exec(html)) !== null) {
    hreflangs.push({ lang: match[1], url: match[2] });
  }
  
  return {
    name: 'Hreflang Tags',
    value: hreflangs,
    pass: true, // Not required, just informational
    message: hreflangs.length > 0 ? 'Found ' + hreflangs.length + ' hreflang tags' : 'No hreflang tags found',
    impact: 0
  };
}

/**
 * Check viewport meta tag
 */
function FT_Tech_checkViewport(html) {
  const match = html.match(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']+)["']/i);
  const viewport = match ? match[1] : null;
  
  const hasWidth = viewport && viewport.includes('width=');
  
  return {
    name: 'Viewport Meta Tag',
    value: viewport,
    pass: hasWidth,
    message: hasWidth ? 'Mobile viewport is set' : 'No viewport meta tag found',
    impact: 15
  };
}

/**
 * Check character encoding
 */
function checkCharset(html, headers) {
  const contentType = headers['Content-Type'] || headers['content-type'] || '';
  const headerCharset = contentType.match(/charset=([^;]+)/i);
  
  const metaMatch = html.match(/<meta[^>]+charset=["']?([^"'\s>]+)/i);
  const charset = metaMatch ? metaMatch[1] : (headerCharset ? headerCharset[1] : null);
  
  return {
    name: 'Character Encoding',
    value: charset,
    pass: charset && charset.toLowerCase().includes('utf'),
    message: charset ? 'Charset: ' + charset : 'No charset specified',
    impact: 5
  };
}

/**
 * Check doctype
 */
function checkDoctype(html) {
  const hasDoctype = html.trim().toLowerCase().startsWith('<!doctype html');
  
  return {
    name: 'HTML5 Doctype',
    value: hasDoctype,
    pass: hasDoctype,
    message: hasDoctype ? 'HTML5 doctype is present' : 'HTML5 doctype is missing',
    impact: 5
  };
}

/**
 * Check language attribute
 */
function checkLanguageAttr(html) {
  const match = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  const lang = match ? match[1] : null;
  
  return {
    name: 'Language Attribute',
    value: lang,
    pass: !!lang,
    message: lang ? 'Language: ' + lang : 'No lang attribute on <html> tag',
    impact: 5
  };
}

/**
 * Check favicon
 */
function checkFavicon(html) {
  const iconPattern = /<link[^>]+rel=["'](icon|shortcut icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/gi;
  const icons = [];
  let match;
  
  while ((match = iconPattern.exec(html)) !== null) {
    icons.push({ type: match[1], url: match[2] });
  }
  
  return {
    name: 'Favicon',
    value: icons,
    pass: icons.length > 0,
    message: icons.length > 0 ? 'Found ' + icons.length + ' favicon(s)' : 'No favicon found',
    impact: 5
  };
}

/**
 * Get grade from score
 */
function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Check mobile friendliness
 */
function FT_Tech_checkMobileFriendly(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const html = response.getContentText();
    const issues = [];
    
    // Check viewport
    const viewport = html.match(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']+)["']/i);
    if (!viewport) {
      issues.push('Missing viewport meta tag');
    } else if (!viewport[1].includes('width=device-width')) {
      issues.push('Viewport should use width=device-width');
    }
    
    // Check for tap target issues (approximate)
    const smallLinks = html.match(/<a[^>]+style=["'][^"']*font-size:\s*[0-9]+px[^"']*["']/gi) || [];
    
    // Check for horizontal scroll indicators
    const fixedWidths = html.match(/width:\s*\d{4,}px/gi) || [];
    if (fixedWidths.length > 0) {
      issues.push('Found fixed widths that may cause horizontal scrolling');
    }
    
    // Check font sizes (approximate)
    const smallFonts = html.match(/font-size:\s*([0-9]+)px/gi) || [];
    const tinyFonts = smallFonts.filter(function(f) {
      const size = parseInt(f.match(/\d+/)[0]);
      return size < 12;
    });
    if (tinyFonts.length > 0) {
      issues.push('Found text smaller than 12px');
    }
    
    return {
      ok: true,
      url: url,
      isMobileFriendly: issues.length === 0,
      issues: issues,
      recommendations: issues.length === 0 ? [] : [
        'Use responsive design',
        'Set proper viewport meta tag',
        'Use minimum 16px font size for body text',
        'Ensure tap targets are at least 48x48 pixels'
      ]
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Analyze page speed factors
 */
function FT_analyzeSpeedFactors(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const startTime = Date.now();
    
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const loadTime = Date.now() - startTime;
    const html = response.getContentText();
    const size = html.length;
    
    // Analyze factors
    const factors = [];
    
    // Page size
    if (size > 500000) {
      factors.push({ factor: 'Large HTML size', value: Math.round(size / 1024) + 'KB', impact: 'high' });
    }
    
    // Count inline scripts
    const inlineScripts = (html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || []).length;
    if (inlineScripts > 10) {
      factors.push({ factor: 'Many inline scripts', value: inlineScripts, impact: 'medium' });
    }
    
    // Count images
    const images = (html.match(/<img[^>]+>/gi) || []).length;
    if (images > 20) {
      factors.push({ factor: 'Many images', value: images, impact: 'medium' });
    }
    
    // Check for render-blocking resources
    const blockingScripts = (html.match(/<script[^>]+src=[^>]+>/gi) || []).filter(function(s) {
      return !s.includes('async') && !s.includes('defer');
    }).length;
    if (blockingScripts > 3) {
      factors.push({ factor: 'Render-blocking scripts', value: blockingScripts, impact: 'high' });
    }
    
    return {
      ok: true,
      url: url,
      loadTime: loadTime,
      htmlSize: size,
      factors: factors,
      recommendations: factors.map(function(f) {
        return 'Optimize: ' + f.factor;
      })
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
