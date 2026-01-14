/**
 * FT_PageSpeed_Audit.gs - PageSpeed and Site Audit
 * SerpifAI V8 - Site audit functionality using PageSpeed API
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// MAIN AUDIT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Run site audit
 */
function FT_PAGESPEED_audit(params) {
  const url = params.url;
  const options = params.options || {};
  
  if (!url) {
    return { ok: false, error: 'URL is required' };
  }
  
  try {
    // Get PageSpeed results
    const psResult = FT_PAGESPEED_analyze(url);
    
    if (!psResult.ok) {
      return psResult;
    }
    
    // Build audit results
    const audit = {
      ok: true,
      url: url,
      timestamp: new Date().toISOString(),
      performance: psResult.performance || 0,
      seo: 0,
      security: 0,
      accessibility: 0,
      metrics: {},
      issues: []
    };
    
    // Extract Core Web Vitals
    if (psResult.metrics) {
      audit.metrics = {
        lcp: formatMetric(psResult.metrics.lcp, 1000),
        fid: psResult.metrics.fid || 0,
        cls: psResult.metrics.cls || 0,
        ttfb: formatMetric(psResult.metrics.ttfb, 1000),
        fcp: formatMetric(psResult.metrics.fcp, 1000),
        tti: formatMetric(psResult.metrics.tti, 1000)
      };
    }
    
    // Run SEO audit if requested
    if (options.seo !== false) {
      const seoResult = auditSEO(url, psResult);
      audit.seo = seoResult.score;
      audit.issues = audit.issues.concat(seoResult.issues);
    }
    
    // Run security audit if requested
    if (options.security !== false) {
      const secResult = auditSecurity(url);
      audit.security = secResult.score;
      audit.issues = audit.issues.concat(secResult.issues);
    }
    
    // Run accessibility audit if requested
    if (options.accessibility !== false) {
      const accResult = auditAccessibility(psResult);
      audit.accessibility = accResult.score;
      audit.issues = audit.issues.concat(accResult.issues);
    }
    
    // Sort issues by severity
    audit.issues.sort(function(a, b) {
      const order = { critical: 0, warning: 1, info: 2 };
      return (order[a.severity] || 2) - (order[b.severity] || 2);
    });
    
    return audit;
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Format metric value
 */
function formatMetric(value, divisor) {
  if (!value) return 0;
  return (value / (divisor || 1)).toFixed(2);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SEO AUDIT
// ═══════════════════════════════════════════════════════════════════════════════════

function auditSEO(url, psResult) {
  const issues = [];
  let score = 100;
  
  // Check for title
  const audits = psResult.audits || {};
  
  if (audits['document-title'] && !audits['document-title'].score) {
    issues.push({
      severity: 'critical',
      title: 'Missing page title',
      description: 'Page does not have a <title> element'
    });
    score -= 15;
  }
  
  if (audits['meta-description'] && !audits['meta-description'].score) {
    issues.push({
      severity: 'warning',
      title: 'Missing meta description',
      description: 'Page does not have a meta description'
    });
    score -= 10;
  }
  
  if (audits['link-text'] && !audits['link-text'].score) {
    issues.push({
      severity: 'warning',
      title: 'Links without descriptive text',
      description: 'Some links do not have descriptive text'
    });
    score -= 5;
  }
  
  if (audits['hreflang'] && !audits['hreflang'].score) {
    issues.push({
      severity: 'info',
      title: 'Missing hreflang',
      description: 'Page does not have hreflang tags for internationalization'
    });
    score -= 3;
  }
  
  if (audits['canonical'] && !audits['canonical'].score) {
    issues.push({
      severity: 'warning',
      title: 'Missing canonical URL',
      description: 'Page does not specify a canonical URL'
    });
    score -= 8;
  }
  
  if (audits['robots-txt'] && !audits['robots-txt'].score) {
    issues.push({
      severity: 'warning',
      title: 'Invalid robots.txt',
      description: 'robots.txt is not valid or missing'
    });
    score -= 5;
  }
  
  return { score: Math.max(0, score), issues: issues };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECURITY AUDIT
// ═══════════════════════════════════════════════════════════════════════════════════

function auditSecurity(url) {
  const issues = [];
  let score = 100;
  
  // Check HTTPS
  if (!url.startsWith('https://')) {
    issues.push({
      severity: 'critical',
      title: 'Not using HTTPS',
      description: 'Site is not served over HTTPS which is a security risk'
    });
    score -= 30;
  }
  
  try {
    // Fetch headers
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const headers = response.getAllHeaders();
    
    // Check security headers
    if (!headers['strict-transport-security']) {
      issues.push({
        severity: 'warning',
        title: 'Missing HSTS header',
        description: 'Strict-Transport-Security header is not set'
      });
      score -= 10;
    }
    
    if (!headers['x-content-type-options']) {
      issues.push({
        severity: 'info',
        title: 'Missing X-Content-Type-Options',
        description: 'X-Content-Type-Options header is not set'
      });
      score -= 5;
    }
    
    if (!headers['x-frame-options'] && !headers['content-security-policy']) {
      issues.push({
        severity: 'warning',
        title: 'Missing clickjacking protection',
        description: 'Neither X-Frame-Options nor CSP frame-ancestors is set'
      });
      score -= 10;
    }
    
    if (!headers['content-security-policy']) {
      issues.push({
        severity: 'info',
        title: 'Missing Content Security Policy',
        description: 'CSP header is not set'
      });
      score -= 5;
    }
    
  } catch (e) {
    issues.push({
      severity: 'warning',
      title: 'Could not check security headers',
      description: e.message
    });
  }
  
  return { score: Math.max(0, score), issues: issues };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY AUDIT
// ═══════════════════════════════════════════════════════════════════════════════════

function auditAccessibility(psResult) {
  const issues = [];
  let score = 100;
  
  const audits = psResult.audits || {};
  
  if (audits['image-alt'] && !audits['image-alt'].score) {
    issues.push({
      severity: 'warning',
      title: 'Images missing alt text',
      description: 'Some images do not have alt attributes'
    });
    score -= 10;
  }
  
  if (audits['color-contrast'] && !audits['color-contrast'].score) {
    issues.push({
      severity: 'warning',
      title: 'Low color contrast',
      description: 'Some text does not have sufficient color contrast'
    });
    score -= 10;
  }
  
  if (audits['html-has-lang'] && !audits['html-has-lang'].score) {
    issues.push({
      severity: 'warning',
      title: 'Missing language attribute',
      description: '<html> element does not have a lang attribute'
    });
    score -= 5;
  }
  
  if (audits['label'] && !audits['label'].score) {
    issues.push({
      severity: 'warning',
      title: 'Form elements without labels',
      description: 'Some form elements do not have associated labels'
    });
    score -= 8;
  }
  
  if (audits['heading-order'] && !audits['heading-order'].score) {
    issues.push({
      severity: 'info',
      title: 'Heading order issue',
      description: 'Headings are not in sequentially descending order'
    });
    score -= 5;
  }
  
  if (audits['button-name'] && !audits['button-name'].score) {
    issues.push({
      severity: 'warning',
      title: 'Buttons without accessible names',
      description: 'Some buttons do not have accessible names'
    });
    score -= 8;
  }
  
  return { score: Math.max(0, score), issues: issues };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// QUICK CHECKS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Quick mobile-friendliness check
 */
function FT_PS_checkMobileFriendly(url) {
  const psResult = FT_PAGESPEED_analyze(url, 'mobile');
  
  if (!psResult.ok) {
    return psResult;
  }
  
  const isMobileFriendly = (psResult.performance || 0) >= 50;
  
  return {
    ok: true,
    url: url,
    mobileFriendly: isMobileFriendly,
    score: psResult.performance,
    issues: psResult.diagnostics || []
  };
}

/**
 * Quick HTTPS check
 */
function FT_checkHTTPS(url) {
  const isHTTPS = url.startsWith('https://');
  
  if (isHTTPS) {
    return { ok: true, https: true, message: 'Site uses HTTPS' };
  }
  
  // Check if HTTPS version exists
  try {
    const httpsUrl = url.replace('http://', 'https://');
    const response = UrlFetchApp.fetch(httpsUrl, {
      muteHttpExceptions: true,
      followRedirects: false
    });
    
    const code = response.getResponseCode();
    
    if (code >= 200 && code < 400) {
      return {
        ok: true,
        https: false,
        httpsAvailable: true,
        message: 'Site does not use HTTPS but HTTPS version is available'
      };
    }
  } catch (e) {
    // HTTPS not available
  }
  
  return {
    ok: true,
    https: false,
    httpsAvailable: false,
    message: 'Site does not use HTTPS'
  };
}
