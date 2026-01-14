/**
 * FT_Performance.gs - Page Performance Analysis
 * SerpifAI V8 - Performance and speed analysis
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// PERFORMANCE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze page performance
 */
function FT_analyzePerformance(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const props = PropertiesService.getScriptProperties();
    const apiKey = props.getProperty('PAGESPEED_API_KEY') || '';
    
    // Fetch both mobile and desktop data
    const mobileData = fetchPageSpeedData(url, 'mobile', apiKey);
    const desktopData = fetchPageSpeedData(url, 'desktop', apiKey);
    
    return {
      ok: true,
      url: url,
      mobile: extractPerformanceMetrics(mobileData),
      desktop: extractPerformanceMetrics(desktopData),
      recommendations: generatePerformanceRecommendations(mobileData, desktopData),
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Fetch PageSpeed data
 */
function fetchPageSpeedData(url, strategy, apiKey) {
  const baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  let apiUrl = baseUrl + '?url=' + encodeURIComponent(url);
  apiUrl += '&strategy=' + strategy;
  apiUrl += '&category=performance';
  
  if (apiKey) {
    apiUrl += '&key=' + apiKey;
  }
  
  const response = UrlFetchApp.fetch(apiUrl, { muteHttpExceptions: true });
  const statusCode = response.getResponseCode();
  
  if (statusCode !== 200) {
    throw new Error('PageSpeed API returned: ' + statusCode);
  }
  
  return JSON.parse(response.getContentText());
}

/**
 * Extract performance metrics
 */
function extractPerformanceMetrics(data) {
  if (!data || !data.lighthouseResult) {
    return { score: 0, metrics: {} };
  }
  
  const lhr = data.lighthouseResult;
  const audits = lhr.audits || {};
  
  return {
    score: Math.round((lhr.categories?.performance?.score || 0) * 100),
    fcp: audits['first-contentful-paint']?.displayValue || '--',
    lcp: audits['largest-contentful-paint']?.displayValue || '--',
    fid: audits['max-potential-fid']?.displayValue || '--',
    cls: audits['cumulative-layout-shift']?.displayValue || '--',
    tti: audits['interactive']?.displayValue || '--',
    tbt: audits['total-blocking-time']?.displayValue || '--',
    speedIndex: audits['speed-index']?.displayValue || '--',
    
    // Numeric values for calculations
    fcpMs: audits['first-contentful-paint']?.numericValue || 0,
    lcpMs: audits['largest-contentful-paint']?.numericValue || 0,
    clsValue: audits['cumulative-layout-shift']?.numericValue || 0,
    ttiMs: audits['interactive']?.numericValue || 0,
    tbtMs: audits['total-blocking-time']?.numericValue || 0
  };
}

/**
 * Generate performance recommendations
 */
function generatePerformanceRecommendations(mobileData, desktopData) {
  const recommendations = [];
  const lhr = mobileData?.lighthouseResult;
  
  if (!lhr) return recommendations;
  
  const audits = lhr.audits || {};
  
  // Check for render-blocking resources
  if (audits['render-blocking-resources']?.score < 1) {
    recommendations.push({
      type: 'high',
      title: 'Eliminate render-blocking resources',
      description: 'Reduce the impact of render-blocking JavaScript and CSS',
      impact: audits['render-blocking-resources']?.displayValue || 'Potential savings'
    });
  }
  
  // Check for unoptimized images
  if (audits['uses-optimized-images']?.score < 1) {
    recommendations.push({
      type: 'high',
      title: 'Optimize images',
      description: 'Use modern formats like WebP, compress images',
      impact: audits['uses-optimized-images']?.displayValue || 'Potential savings'
    });
  }
  
  // Check for unused JavaScript
  if (audits['unused-javascript']?.score < 1) {
    recommendations.push({
      type: 'medium',
      title: 'Remove unused JavaScript',
      description: 'Reduce JavaScript execution time by removing unused code',
      impact: audits['unused-javascript']?.displayValue || 'Potential savings'
    });
  }
  
  // Check for unused CSS
  if (audits['unused-css-rules']?.score < 1) {
    recommendations.push({
      type: 'medium',
      title: 'Remove unused CSS',
      description: 'Reduce CSS file size by removing unused styles',
      impact: audits['unused-css-rules']?.displayValue || 'Potential savings'
    });
  }
  
  // Check for text compression
  if (audits['uses-text-compression']?.score < 1) {
    recommendations.push({
      type: 'high',
      title: 'Enable text compression',
      description: 'Enable GZIP or Brotli compression for text resources',
      impact: audits['uses-text-compression']?.displayValue || 'Potential savings'
    });
  }
  
  // Check for responsive images
  if (audits['uses-responsive-images']?.score < 1) {
    recommendations.push({
      type: 'medium',
      title: 'Properly size images',
      description: 'Serve appropriately-sized images to save data',
      impact: audits['uses-responsive-images']?.displayValue || 'Potential savings'
    });
  }
  
  // Check cache policy
  if (audits['uses-long-cache-ttl']?.score < 1) {
    recommendations.push({
      type: 'medium',
      title: 'Serve static assets with efficient cache policy',
      description: 'Use longer cache TTL for static resources',
      impact: audits['uses-long-cache-ttl']?.displayValue || 'Potential savings'
    });
  }
  
  // Check for minified resources
  if (audits['unminified-css']?.score < 1 || audits['unminified-javascript']?.score < 1) {
    recommendations.push({
      type: 'low',
      title: 'Minify CSS and JavaScript',
      description: 'Reduce file sizes by minifying code',
      impact: 'Potential savings in file size'
    });
  }
  
  return recommendations.slice(0, 10);
}

/**
 * Compare performance over time
 */
function FT_comparePerformance(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const result = GW_query({
      action: 'select',
      sql: `SELECT * FROM performance_history 
            WHERE url = ? 
            ORDER BY checked_at DESC 
            LIMIT 10`,
      params: [url]
    });
    
    const history = result.rows || [];
    
    if (history.length < 2) {
      return { ok: true, comparison: null, message: 'Not enough data for comparison' };
    }
    
    const latest = history[0];
    const previous = history[1];
    
    return {
      ok: true,
      comparison: {
        mobileScore: {
          current: latest.mobile_score,
          previous: previous.mobile_score,
          change: latest.mobile_score - previous.mobile_score
        },
        desktopScore: {
          current: latest.desktop_score,
          previous: previous.desktop_score,
          change: latest.desktop_score - previous.desktop_score
        }
      },
      history: history
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Save performance data
 */
function FT_savePerformance(params) {
  const data = params.data;
  
  if (!data || !data.url) {
    return { ok: false, error: 'Performance data required' };
  }
  
  try {
    const result = GW_query({
      action: 'insert',
      sql: `INSERT INTO performance_history 
            (url, mobile_score, desktop_score, mobile_lcp, mobile_fid, mobile_cls, 
             desktop_lcp, desktop_fid, desktop_cls, checked_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      params: [
        data.url,
        data.mobile?.score || 0,
        data.desktop?.score || 0,
        data.mobile?.lcpMs || 0,
        0, // FID not directly available
        data.mobile?.clsValue || 0,
        data.desktop?.lcpMs || 0,
        0,
        data.desktop?.clsValue || 0
      ]
    });
    
    return { ok: true, saved: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get performance grade
 */
function getPerformanceGrade(score) {
  if (score >= 90) return { grade: 'A', color: 'success' };
  if (score >= 75) return { grade: 'B', color: 'primary' };
  if (score >= 50) return { grade: 'C', color: 'warning' };
  if (score >= 25) return { grade: 'D', color: 'warning' };
  return { grade: 'F', color: 'danger' };
}

/**
 * Batch performance check
 */
function FT_batchPerformanceCheck(params) {
  const urls = params.urls || [];
  
  if (urls.length === 0) {
    return { ok: false, error: 'URLs required' };
  }
  
  const results = [];
  
  for (const url of urls.slice(0, 5)) { // Limit to 5 URLs
    try {
      const result = FT_analyzePerformance({ url: url });
      results.push({
        url: url,
        mobileScore: result.mobile?.score || 0,
        desktopScore: result.desktop?.score || 0,
        ok: result.ok
      });
    } catch (err) {
      results.push({ url: url, error: err.message, ok: false });
    }
    
    Utilities.sleep(1000); // Rate limiting
  }
  
  return { ok: true, results: results };
}
