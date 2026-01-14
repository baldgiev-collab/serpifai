/**
 * FT_Security.gs - Security Analysis
 * SerpifAI V8 - Website security checks
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SECURITY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze page security
 */
function FT_analyzeSecurity(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: false
    });
    
    const headers = response.getAllHeaders();
    const statusCode = response.getResponseCode();
    
    const checks = [];
    let score = 100;
    
    // HTTPS Check
    if (url.startsWith('https://')) {
      checks.push({ name: 'HTTPS', status: 'pass', description: 'Site uses HTTPS encryption' });
    } else {
      checks.push({ name: 'HTTPS', status: 'fail', description: 'Site does not use HTTPS', fix: 'Enable HTTPS with SSL certificate' });
      score -= 25;
    }
    
    // Security Headers
    const securityHeaders = analyzeSecurityHeaders(headers);
    checks.push(...securityHeaders.checks);
    score -= securityHeaders.deductions;
    
    // Mixed Content Check
    const html = response.getContentText();
    const mixedContent = checkMixedContent(html, url);
    if (mixedContent.issues.length > 0) {
      checks.push({ name: 'Mixed Content', status: 'fail', description: mixedContent.issues.length + ' mixed content issues found', fix: 'Update all resources to use HTTPS' });
      score -= 10;
    } else if (url.startsWith('https://')) {
      checks.push({ name: 'Mixed Content', status: 'pass', description: 'No mixed content detected' });
    }
    
    // Check for exposed sensitive info
    const sensitiveCheck = checkSensitiveInfo(html);
    if (sensitiveCheck.issues.length > 0) {
      checks.push({ name: 'Exposed Info', status: 'warn', description: 'Potentially sensitive information found', details: sensitiveCheck.issues });
      score -= 5;
    }
    
    score = Math.max(0, score);
    
    return {
      ok: true,
      url: url,
      score: score,
      grade: getSecurityGrade(score),
      checks: checks,
      headers: formatHeaders(headers),
      recommendations: generateSecurityRecommendations(checks)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Analyze security headers
 */
function analyzeSecurityHeaders(headers) {
  const checks = [];
  let deductions = 0;
  
  const normalizedHeaders = {};
  for (const key in headers) {
    normalizedHeaders[key.toLowerCase()] = headers[key];
  }
  
  // Strict-Transport-Security
  if (normalizedHeaders['strict-transport-security']) {
    checks.push({ name: 'HSTS', status: 'pass', description: 'HTTP Strict Transport Security enabled' });
  } else {
    checks.push({ name: 'HSTS', status: 'fail', description: 'HSTS header missing', fix: 'Add Strict-Transport-Security header' });
    deductions += 10;
  }
  
  // Content-Security-Policy
  if (normalizedHeaders['content-security-policy']) {
    checks.push({ name: 'CSP', status: 'pass', description: 'Content Security Policy configured' });
  } else {
    checks.push({ name: 'CSP', status: 'warn', description: 'CSP header missing', fix: 'Implement Content-Security-Policy' });
    deductions += 8;
  }
  
  // X-Frame-Options
  if (normalizedHeaders['x-frame-options']) {
    checks.push({ name: 'X-Frame-Options', status: 'pass', description: 'Clickjacking protection enabled' });
  } else {
    checks.push({ name: 'X-Frame-Options', status: 'fail', description: 'X-Frame-Options missing', fix: 'Add X-Frame-Options: DENY or SAMEORIGIN' });
    deductions += 8;
  }
  
  // X-Content-Type-Options
  if (normalizedHeaders['x-content-type-options']) {
    checks.push({ name: 'X-Content-Type-Options', status: 'pass', description: 'MIME sniffing protection enabled' });
  } else {
    checks.push({ name: 'X-Content-Type-Options', status: 'warn', description: 'X-Content-Type-Options missing', fix: 'Add X-Content-Type-Options: nosniff' });
    deductions += 5;
  }
  
  // X-XSS-Protection
  if (normalizedHeaders['x-xss-protection']) {
    checks.push({ name: 'X-XSS-Protection', status: 'pass', description: 'XSS protection enabled' });
  } else {
    checks.push({ name: 'X-XSS-Protection', status: 'warn', description: 'X-XSS-Protection missing', fix: 'Add X-XSS-Protection: 1; mode=block' });
    deductions += 5;
  }
  
  // Referrer-Policy
  if (normalizedHeaders['referrer-policy']) {
    checks.push({ name: 'Referrer-Policy', status: 'pass', description: 'Referrer Policy configured' });
  } else {
    checks.push({ name: 'Referrer-Policy', status: 'warn', description: 'Referrer-Policy missing', fix: 'Add Referrer-Policy: strict-origin-when-cross-origin' });
    deductions += 3;
  }
  
  // Permissions-Policy
  if (normalizedHeaders['permissions-policy'] || normalizedHeaders['feature-policy']) {
    checks.push({ name: 'Permissions-Policy', status: 'pass', description: 'Permissions Policy configured' });
  } else {
    checks.push({ name: 'Permissions-Policy', status: 'info', description: 'Permissions-Policy not set', fix: 'Consider adding Permissions-Policy header' });
  }
  
  return { checks: checks, deductions: deductions };
}

/**
 * Check for mixed content
 */
function checkMixedContent(html, url) {
  const issues = [];
  
  if (!url.startsWith('https://')) {
    return { issues: [] }; // Only relevant for HTTPS sites
  }
  
  // Check for http:// resources
  const httpResources = html.match(/(?:src|href)\s*=\s*["']http:\/\/[^"']+["']/gi) || [];
  
  httpResources.forEach(function(resource) {
    const urlMatch = resource.match(/["']([^"']+)["']/);
    if (urlMatch) {
      issues.push({ type: 'resource', url: urlMatch[1] });
    }
  });
  
  return { issues: issues.slice(0, 10) };
}

/**
 * Check for exposed sensitive info
 */
function checkSensitiveInfo(html) {
  const issues = [];
  
  // Check for potential API keys
  if (/['"]\w{20,}['"]/g.test(html)) {
    // Could be API key, but also could be legitimate string
  }
  
  // Check for exposed email addresses
  const emails = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  if (emails.length > 0) {
    issues.push({ type: 'email', count: emails.length, message: 'Email addresses exposed in HTML' });
  }
  
  // Check for version numbers
  const versions = html.match(/WordPress\s+[\d.]+|jQuery\s+[\d.]+|Bootstrap\s+[\d.]+/gi) || [];
  if (versions.length > 0) {
    issues.push({ type: 'version', values: versions.slice(0, 3), message: 'Software versions exposed' });
  }
  
  return { issues: issues };
}

/**
 * Format headers for display
 */
function formatHeaders(headers) {
  const formatted = [];
  for (const key in headers) {
    formatted.push({ name: key, value: headers[key] });
  }
  return formatted;
}

/**
 * Get security grade
 */
function getSecurityGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Generate security recommendations
 */
function generateSecurityRecommendations(checks) {
  const recommendations = [];
  
  checks.forEach(function(check) {
    if (check.status === 'fail' || check.status === 'warn') {
      recommendations.push({
        priority: check.status === 'fail' ? 'high' : 'medium',
        title: check.name,
        description: check.description,
        fix: check.fix || 'Address this security issue'
      });
    }
  });
  
  return recommendations.sort(function(a, b) {
    return a.priority === 'high' ? -1 : 1;
  });
}

/**
 * Check SSL certificate
 */
function FT_checkSSL(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    // Force HTTPS
    const httpsUrl = url.replace(/^http:/, 'https:');
    
    const response = UrlFetchApp.fetch(httpsUrl, {
      muteHttpExceptions: true,
      validateHttpsCertificates: true
    });
    
    return {
      ok: true,
      valid: response.getResponseCode() < 400,
      url: httpsUrl,
      message: 'SSL certificate is valid'
    };
  } catch (err) {
    return {
      ok: true,
      valid: false,
      url: url,
      error: err.message,
      message: 'SSL certificate issue: ' + err.message
    };
  }
}

/**
 * Check for common vulnerabilities
 */
function FT_checkVulnerabilities(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const html = response.getContentText();
    const headers = response.getAllHeaders();
    
    const vulnerabilities = [];
    
    // Check for server info disclosure
    if (headers['Server']) {
      vulnerabilities.push({
        type: 'info-disclosure',
        severity: 'low',
        title: 'Server Information Disclosed',
        description: 'Server header reveals: ' + headers['Server'],
        fix: 'Configure server to hide version information'
      });
    }
    
    // Check for X-Powered-By
    if (headers['X-Powered-By']) {
      vulnerabilities.push({
        type: 'info-disclosure',
        severity: 'low',
        title: 'Technology Stack Disclosed',
        description: 'X-Powered-By reveals: ' + headers['X-Powered-By'],
        fix: 'Remove X-Powered-By header'
      });
    }
    
    // Check for inline scripts without nonce
    const inlineScripts = html.match(/<script(?![^>]*src)[^>]*>/gi) || [];
    if (inlineScripts.length > 0 && !headers['Content-Security-Policy']) {
      vulnerabilities.push({
        type: 'xss-risk',
        severity: 'medium',
        title: 'Inline Scripts Without CSP',
        description: inlineScripts.length + ' inline scripts found without CSP protection',
        fix: 'Implement CSP with nonce or hash for inline scripts'
      });
    }
    
    return {
      ok: true,
      url: url,
      vulnerabilities: vulnerabilities,
      count: vulnerabilities.length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
