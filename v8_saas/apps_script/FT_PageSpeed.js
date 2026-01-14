/**
 * FT_PageSpeed.gs - Page Speed Insights API Wrapper
 * SerpifAI v8.0.0 - Wrapper for Google PageSpeed Insights API
 */

const PAGESPEED_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/** Analyze page speed for a URL */
function FT_PageSpeed_analyze(url, options) {
  LOG_enter('FT_PageSpeed_analyze', { url });
  
  url = UTIL_normalizeUrl(url);
  if (!UTIL_isValidUrl(url)) {
    return CORE_createError(ERROR_CATEGORY.DATA, 'Invalid URL provided');
  }
  
  options = options || {};
  const strategy = options.strategy || 'mobile';  // mobile or desktop
  const categories = options.categories || ['performance', 'accessibility', 'seo'];
  
  // Build query parameters
  const params = new URLSearchParams({
    url: url,
    strategy: strategy
  });
  
  categories.forEach(cat => params.append('category', cat));
  
  // Add API key if available
  const apiKey = CORE_getProperty('PAGE_SPEED_API_KEY');
  if (apiKey) {
    params.append('key', apiKey);
  }
  
  try {
    const response = UrlFetchApp.fetch(`${PAGESPEED_ENDPOINT}?${params.toString()}`, {
      method: 'get',
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    if (code !== 200) {
      LOG_warn('FT_PageSpeed', `API returned ${code}`);
      return CORE_createError(ERROR_CATEGORY.API, `PageSpeed API error: ${code}`);
    }
    
    const data = JSON.parse(response.getContentText());
    return CORE_success(_parsePageSpeedData(data, strategy));
    
  } catch (error) {
    return CORE_handleError('FT_PageSpeed', 'analyze', error);
  }
}

/**
 * Get Core Web Vitals for URL
 * @param {string} url - URL to analyze
 * @return {Object} Core Web Vitals
 */
function FT_PageSpeed_getCWV(url) {
  const result = FT_PageSpeed_analyze(url, {
    strategy: 'mobile',
    categories: ['performance']
  });
  
  if (CORE_isError(result)) return result;
  
  return CORE_success({
    lcp: result.data.coreWebVitals.lcp,
    fid: result.data.coreWebVitals.fid,
    cls: result.data.coreWebVitals.cls,
    fcp: result.data.coreWebVitals.fcp,
    ttfb: result.data.coreWebVitals.ttfb,
    performanceScore: result.data.scores.performance
  });
}

/**
 * Compare mobile vs desktop performance
 * @param {string} url - URL to analyze
 * @return {Object} Comparison results
 */
function FT_PageSpeed_compare(url) {
  const mobile = FT_PageSpeed_analyze(url, { strategy: 'mobile' });
  const desktop = FT_PageSpeed_analyze(url, { strategy: 'desktop' });
  
  if (CORE_isError(mobile)) return mobile;
  if (CORE_isError(desktop)) return desktop;
  
  return CORE_success({
    url: url,
    mobile: {
      performance: mobile.data.scores.performance,
      cwv: mobile.data.coreWebVitals
    },
    desktop: {
      performance: desktop.data.scores.performance,
      cwv: desktop.data.coreWebVitals
    },
    difference: {
      performance: desktop.data.scores.performance - mobile.data.scores.performance
    }
  });
}

/**
 * Batch analyze multiple URLs
 * @param {Array} urls - URLs to analyze
 * @param {Object} options - Analysis options
 * @return {Object} Batch results
 */
function FT_PageSpeed_batchAnalyze(urls, options) {
  options = options || {};
  const results = [];
  
  urls.forEach((url, idx) => {
    // Add delay to avoid rate limiting
    if (idx > 0) UTIL_sleep(1000);
    
    const result = FT_PageSpeed_analyze(url, options);
    results.push({
      url: url,
      success: !CORE_isError(result),
      data: CORE_isError(result) ? null : result.data,
      error: CORE_isError(result) ? result.message : null
    });
  });
  
  return CORE_success(results);
}

/**
 * Get optimization opportunities
 * @param {string} url - URL to analyze
 * @return {Object} Opportunities
 */
function FT_PageSpeed_getOpportunities(url) {
  const result = FT_PageSpeed_analyze(url, {
    strategy: 'mobile',
    categories: ['performance']
  });
  
  if (CORE_isError(result)) return result;
  
  return CORE_success({
    opportunities: result.data.opportunities,
    diagnostics: result.data.diagnostics,
    estimatedSavings: result.data.estimatedSavings
  });
}

/**
 * Parse PageSpeed API response
 * @param {Object} data - Raw API data
 * @param {string} strategy - mobile or desktop
 * @return {Object} Parsed data
 */
function _parsePageSpeedData(data, strategy) {
  const lighthouse = data.lighthouseResult || {};
  const categories = lighthouse.categories || {};
  const audits = lighthouse.audits || {};
  
  // Extract scores (0-100)
  const scores = {
    performance: Math.round((categories.performance?.score || 0) * 100),
    accessibility: Math.round((categories.accessibility?.score || 0) * 100),
    seo: Math.round((categories.seo?.score || 0) * 100),
    bestPractices: Math.round((categories['best-practices']?.score || 0) * 100)
  };
  
  // Extract Core Web Vitals
  const coreWebVitals = {
    lcp: _extractMetric(audits['largest-contentful-paint']),
    fid: _extractMetric(audits['max-potential-fid']),
    cls: _extractMetric(audits['cumulative-layout-shift']),
    fcp: _extractMetric(audits['first-contentful-paint']),
    ttfb: _extractMetric(audits['server-response-time']),
    tbt: _extractMetric(audits['total-blocking-time']),
    si: _extractMetric(audits['speed-index'])
  };
  
  // Extract opportunities
  const opportunities = _extractOpportunities(audits);
  
  // Extract diagnostics
  const diagnostics = _extractDiagnostics(audits);
  
  return {
    url: data.id || '',
    strategy: strategy,
    fetchTime: data.analysisUTCTimestamp || new Date().toISOString(),
    scores: scores,
    coreWebVitals: coreWebVitals,
    opportunities: opportunities,
    diagnostics: diagnostics,
    estimatedSavings: _calculateSavings(opportunities)
  };
}

/**
 * Extract metric from audit
 * @param {Object} audit - Audit object
 * @return {Object} Metric data
 */
function _extractMetric(audit) {
  if (!audit) return { value: null, score: null, displayValue: 'N/A' };
  
  return {
    value: audit.numericValue || null,
    score: audit.score !== undefined ? Math.round(audit.score * 100) : null,
    displayValue: audit.displayValue || 'N/A',
    rating: _getMetricRating(audit.score)
  };
}

/**
 * Get rating from score
 * @param {number} score - Score 0-1
 * @return {string} Rating
 */
function _getMetricRating(score) {
  if (score === null || score === undefined) return 'unknown';
  if (score >= 0.9) return 'good';
  if (score >= 0.5) return 'needs-improvement';
  return 'poor';
}

/**
 * Extract optimization opportunities
 * @param {Object} audits - Audits object
 * @return {Array} Opportunities
 */
function _extractOpportunities(audits) {
  const opportunityAudits = [
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'uses-optimized-images',
    'uses-webp-images',
    'uses-text-compression',
    'uses-responsive-images',
    'efficient-animated-content'
  ];
  
  return opportunityAudits
    .filter(key => audits[key]?.score !== undefined && audits[key].score < 1)
    .map(key => ({
      id: key,
      title: audits[key].title || key,
      savings: audits[key].numericValue || 0,
      displayValue: audits[key].displayValue || ''
    }))
    .sort((a, b) => b.savings - a.savings);
}

/**
 * Extract diagnostics
 * @param {Object} audits - Audits object
 * @return {Array} Diagnostics
 */
function _extractDiagnostics(audits) {
  const diagnosticAudits = [
    'dom-size',
    'critical-request-chains',
    'main-thread-work-breakdown',
    'bootup-time',
    'uses-long-cache-ttl'
  ];
  
  return diagnosticAudits
    .filter(key => audits[key])
    .map(key => ({
      id: key,
      title: audits[key].title || key,
      displayValue: audits[key].displayValue || '',
      description: (audits[key].description || '').substring(0, 200)
    }));
}

/**
 * Calculate total estimated savings
 * @param {Array} opportunities - Opportunities
 * @return {Object} Savings summary
 */
function _calculateSavings(opportunities) {
  const totalMs = opportunities.reduce((sum, opp) => sum + (opp.savings || 0), 0);
  return {
    totalMs: totalMs,
    displayValue: totalMs > 1000 ? `${(totalMs / 1000).toFixed(1)}s` : `${Math.round(totalMs)}ms`
  };
}
