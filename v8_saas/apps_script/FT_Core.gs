/**
 * FT_Core.gs - Core Web Vitals Analysis
 * SerpifAI V8 - CWV metrics and optimization
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// CORE WEB VITALS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze Core Web Vitals using PageSpeed API
 */
function FT_analyzeCoreWebVitals(params) {
  const url = params.url;
  const strategy = params.strategy || 'mobile';
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  // Get API key
  const apiKey = CORE_getConfig('PAGESPEED_API_KEY') || PropertiesService.getScriptProperties().getProperty('PAGESPEED_API_KEY');
  
  if (!apiKey) {
    return { ok: false, error: 'PageSpeed API key not configured' };
  }
  
  try {
    const apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed' +
      '?url=' + encodeURIComponent(url) +
      '&strategy=' + strategy +
      '&category=performance' +
      '&key=' + apiKey;
    
    const response = UrlFetchApp.fetch(apiUrl, {
      muteHttpExceptions: true
    });
    
    const data = JSON.parse(response.getContentText());
    
    if (data.error) {
      return { ok: false, error: data.error.message };
    }
    
    // Extract Core Web Vitals
    const metrics = extractCoreWebVitals(data);
    
    // Get assessments
    const assessments = assessCoreWebVitals(metrics);
    
    // Get recommendations
    const recommendations = getCWVRecommendations(data, metrics);
    
    return {
      ok: true,
      url: url,
      strategy: strategy,
      metrics: metrics,
      assessments: assessments,
      overallScore: data.lighthouseResult?.categories?.performance?.score * 100 || 0,
      recommendations: recommendations
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Extract Core Web Vitals from PageSpeed data
 */
function extractCoreWebVitals(data) {
  const audits = data.lighthouseResult?.audits || {};
  const fieldData = data.loadingExperience?.metrics || {};
  
  const metrics = {
    // Lab data
    lab: {
      lcp: audits['largest-contentful-paint']?.numericValue || null,
      fid: audits['max-potential-fid']?.numericValue || null,
      cls: audits['cumulative-layout-shift']?.numericValue || null,
      fcp: audits['first-contentful-paint']?.numericValue || null,
      si: audits['speed-index']?.numericValue || null,
      tbt: audits['total-blocking-time']?.numericValue || null,
      tti: audits['interactive']?.numericValue || null
    },
    // Field data (if available)
    field: {
      lcp: fieldData['LARGEST_CONTENTFUL_PAINT_MS']?.percentile || null,
      fid: fieldData['FIRST_INPUT_DELAY_MS']?.percentile || null,
      cls: fieldData['CUMULATIVE_LAYOUT_SHIFT_SCORE']?.percentile || null,
      fcp: fieldData['FIRST_CONTENTFUL_PAINT_MS']?.percentile || null
    }
  };
  
  return metrics;
}

/**
 * Assess Core Web Vitals against thresholds
 */
function assessCoreWebVitals(metrics) {
  const thresholds = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    tbt: { good: 200, poor: 600 },
    tti: { good: 3800, poor: 7300 }
  };
  
  const assessments = {};
  
  // Assess lab metrics
  for (const metric in metrics.lab) {
    const value = metrics.lab[metric];
    if (value !== null && thresholds[metric]) {
      if (value <= thresholds[metric].good) {
        assessments[metric] = { status: 'good', value: value };
      } else if (value >= thresholds[metric].poor) {
        assessments[metric] = { status: 'poor', value: value };
      } else {
        assessments[metric] = { status: 'needs-improvement', value: value };
      }
    }
  }
  
  return assessments;
}

/**
 * Get CWV recommendations
 */
function getCWVRecommendations(data, metrics) {
  const audits = data.lighthouseResult?.audits || {};
  const recommendations = [];
  
  // LCP recommendations
  if (metrics.lab.lcp > 2500) {
    recommendations.push({
      metric: 'LCP',
      priority: metrics.lab.lcp > 4000 ? 'high' : 'medium',
      title: 'Improve Largest Contentful Paint',
      suggestions: [
        'Optimize and compress images',
        'Preload critical resources',
        'Remove render-blocking resources',
        'Improve server response time',
        'Use a CDN'
      ]
    });
  }
  
  // FID/TBT recommendations
  if (metrics.lab.tbt > 200) {
    recommendations.push({
      metric: 'FID/TBT',
      priority: metrics.lab.tbt > 600 ? 'high' : 'medium',
      title: 'Reduce Total Blocking Time',
      suggestions: [
        'Break up long JavaScript tasks',
        'Remove or defer unused JavaScript',
        'Minimize main thread work',
        'Reduce third-party code impact',
        'Use web workers for heavy computations'
      ]
    });
  }
  
  // CLS recommendations
  if (metrics.lab.cls > 0.1) {
    recommendations.push({
      metric: 'CLS',
      priority: metrics.lab.cls > 0.25 ? 'high' : 'medium',
      title: 'Improve Cumulative Layout Shift',
      suggestions: [
        'Set explicit width/height on images and videos',
        'Reserve space for ad slots',
        'Avoid inserting content above existing content',
        'Preload fonts to prevent FOIT/FOUT',
        'Use CSS transform for animations'
      ]
    });
  }
  
  // Extract specific opportunities from Lighthouse
  const opportunities = [
    'render-blocking-resources',
    'unused-javascript',
    'unused-css-rules',
    'modern-image-formats',
    'uses-responsive-images',
    'efficient-animated-content'
  ];
  
  opportunities.forEach(function(key) {
    if (audits[key] && audits[key].score < 0.9) {
      recommendations.push({
        metric: 'Performance',
        priority: audits[key].score < 0.5 ? 'high' : 'low',
        title: audits[key].title,
        description: audits[key].description
      });
    }
  });
  
  return recommendations;
}

/**
 * Get CWV summary for multiple pages
 */
function FT_getCWVSummary(params) {
  const urls = params.urls || [];
  const strategy = params.strategy || 'mobile';
  
  if (urls.length === 0) {
    return { ok: false, error: 'URLs required' };
  }
  
  const results = [];
  
  urls.forEach(function(url) {
    const result = FT_analyzeCoreWebVitals({ url: url, strategy: strategy });
    
    if (result.ok) {
      results.push({
        url: url,
        score: result.overallScore,
        lcp: result.metrics.lab.lcp,
        fid: result.metrics.lab.fid,
        cls: result.metrics.lab.cls,
        lcpStatus: result.assessments.lcp?.status,
        clsStatus: result.assessments.cls?.status
      });
    } else {
      results.push({
        url: url,
        error: result.error
      });
    }
    
    Utilities.sleep(1000); // Rate limiting
  });
  
  // Calculate averages
  const validResults = results.filter(function(r) { return !r.error; });
  const avgScore = validResults.length > 0 ?
    Math.round(validResults.reduce(function(sum, r) { return sum + r.score; }, 0) / validResults.length) : 0;
  
  return {
    ok: true,
    results: results,
    summary: {
      total: urls.length,
      successful: validResults.length,
      averageScore: avgScore
    }
  };
}

/**
 * Compare CWV between two pages
 */
function FT_compareCWV(params) {
  const url1 = params.url1;
  const url2 = params.url2;
  const strategy = params.strategy || 'mobile';
  
  if (!url1 || !url2) {
    return { ok: false, error: 'Two URLs required' };
  }
  
  const result1 = FT_analyzeCoreWebVitals({ url: url1, strategy: strategy });
  const result2 = FT_analyzeCoreWebVitals({ url: url2, strategy: strategy });
  
  if (!result1.ok || !result2.ok) {
    return { ok: false, error: 'Failed to analyze one or both URLs' };
  }
  
  const comparison = {
    score: {
      url1: result1.overallScore,
      url2: result2.overallScore,
      diff: result1.overallScore - result2.overallScore
    },
    lcp: {
      url1: result1.metrics.lab.lcp,
      url2: result2.metrics.lab.lcp,
      diff: (result1.metrics.lab.lcp || 0) - (result2.metrics.lab.lcp || 0)
    },
    cls: {
      url1: result1.metrics.lab.cls,
      url2: result2.metrics.lab.cls,
      diff: (result1.metrics.lab.cls || 0) - (result2.metrics.lab.cls || 0)
    },
    tbt: {
      url1: result1.metrics.lab.tbt,
      url2: result2.metrics.lab.tbt,
      diff: (result1.metrics.lab.tbt || 0) - (result2.metrics.lab.tbt || 0)
    }
  };
  
  // Determine winner
  let winner = 'tie';
  if (comparison.score.diff > 5) {
    winner = url1;
  } else if (comparison.score.diff < -5) {
    winner = url2;
  }
  
  return {
    ok: true,
    url1: { url: url1, data: result1 },
    url2: { url: url2, data: result2 },
    comparison: comparison,
    winner: winner
  };
}

/**
 * Track CWV history
 */
function FT_trackCWVHistory(params) {
  const projectId = params.projectId;
  const url = params.url;
  
  if (!projectId || !url) {
    return { ok: false, error: 'Project ID and URL required' };
  }
  
  // Get current CWV
  const current = FT_analyzeCoreWebVitals({ url: url, strategy: 'mobile' });
  
  if (!current.ok) {
    return current;
  }
  
  try {
    // Store in history
    GW_query({
      action: 'insert',
      sql: `INSERT INTO cwv_history (project_id, url, score, lcp, cls, tbt, fcp, strategy, recorded_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'mobile', NOW())`,
      params: [
        projectId,
        url,
        current.overallScore,
        current.metrics.lab.lcp,
        current.metrics.lab.cls,
        current.metrics.lab.tbt,
        current.metrics.lab.fcp
      ]
    });
    
    // Get history
    const historyResult = GW_query({
      action: 'select',
      sql: 'SELECT * FROM cwv_history WHERE project_id = ? AND url = ? ORDER BY recorded_at DESC LIMIT 30',
      params: [projectId, url]
    });
    
    return {
      ok: true,
      current: current,
      history: historyResult.rows || []
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get CWV thresholds reference
 */
function FT_getCWVThresholds() {
  return {
    ok: true,
    thresholds: {
      LCP: {
        name: 'Largest Contentful Paint',
        good: '≤ 2.5s',
        needsImprovement: '2.5s - 4.0s',
        poor: '> 4.0s',
        description: 'Measures loading performance'
      },
      FID: {
        name: 'First Input Delay',
        good: '≤ 100ms',
        needsImprovement: '100ms - 300ms',
        poor: '> 300ms',
        description: 'Measures interactivity'
      },
      CLS: {
        name: 'Cumulative Layout Shift',
        good: '≤ 0.1',
        needsImprovement: '0.1 - 0.25',
        poor: '> 0.25',
        description: 'Measures visual stability'
      },
      INP: {
        name: 'Interaction to Next Paint',
        good: '≤ 200ms',
        needsImprovement: '200ms - 500ms',
        poor: '> 500ms',
        description: 'Measures responsiveness (replacing FID)'
      }
    }
  };
}
